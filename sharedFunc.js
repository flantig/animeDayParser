const snoowrap = require('snoowrap');
const config = require('./config');
const {DateTime} = require("luxon");
const axios = require('axios').default;
const {google} = require('googleapis');
const credentials = require('./googleAPI/credentials.json');
const {MongoClient} = require('mongodb');

const scopes = [
    'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);

const uri = `mongodb+srv://TangySalmon:${credentials.mongoPW}@discordguildholder.pk6r8.mongodb.net/${credentials.mongoDB}?retryWrites=true&w=majority`
const mongoClient = new MongoClient(uri);
const drive = google.drive({version: "v3", auth});

module.exports = {
    /**
     * Function to create a new snoowrap object that will use the credentials stored in config.js to create a reference
     * to a particular subreddit: determined by the subreddit name in the input variable. You can ask a maintainer for
     * a skeleton of this config file.
     * @param   subName         The name of the subreddit that a reference will be created to.
     * @returns {Subreddit}     snoowrap subreddit object.
     */
    getSubredditReference: async (subName) => {
        return new snoowrap({
            userAgent: config.userAgent,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken
        }).getSubreddit(subName);
    },
    /**
     * This function will take the hot posts of a subreddit and return post objects from it. Based on the input params,
     * the function that return either one single post or multiple post objects.
     * @param subreddit             The designated subreddit defined in calling file.
     * @param grabAll               Boolean used to determine whether or not to return a single post or array of posts.
     * @param selectedHighestVoted  Boolean to determine whether the top post is selected. Default: false
     * @param counter               I honestly have no clue what this is for, ask Franklin.
     * @param today                 The current date.
     * @returns {Promise<{}|[]>}    If grabAll=true, will send an array of post objects, else a single post object.
     */
    getImgUrl: async (subreddit, grabAll, selectedHighestVoted = false, counter = 0, today = DateTime.local().day) => {
        let returnVal = {};
        let returnVals = [];
        await subreddit.getHot({time: 'day', limit: 10}).forEach((post) => {
            if (post.title.includes(today.toString()) && !selectedHighestVoted) {
                grabAll ? returnVals.push(post) : returnVal = post;
                selectedHighestVoted = !grabAll;
                counter++;
            } else if (!selectedHighestVoted && counter === 10) {
                returnVal = "Couldn't find an Ani-rific day for you, sorry!";
            }
        });
        if (grabAll) {
            return returnVals
        } else {
            return returnVal
        }
    },

    /**
     *@ToDo: In redditImageDownloader.js you want to check what the last date in your loop is and increase the start and end date paramters by 5-10 days
     *       using luxon until you either complete the month or the entire year. Month for testing most likely and year for the remainder. You also probably
     *       want to actually download the damn images too since you spent a lot of time trying to trouble shoot a backtick/double quotes syntax error.
     *
     *
     * @param UTCStringStart/UTCStringEnd: Luxon can parse UTC/UNIX time formats, and so the plan is to have a loop going backwards month per month until we
     * go back an entire year in redditImageDownloader.js while in sharedFunc.js it will go through the days.
     *
     * @returns {Promise<[]>}: It should bring an array with jsons containing the following values:
     *
     *          Date - Date is going to be used to name folders, the format for it is LLLLMM (ex. August09)
     *          UTC  - This is here in case I'll need to work with DateTime again and to more easily set a name for a general month folder
     *          URL  - The actual url of the image that I'll use to download
     *
     *@if (DateTime.fromSeconds(post.data.data[i].created_utc).day === initialDate.day): This is a check to make sure we're on the same day as we go through through
     * the data. If it isn't, we change
     *
     * @Limitations: It seems like it can only load up 12 days at a time. I'm not sure why but if I had to guess, it's probably because they're trying not to get their
     * endpoint absolutely destroyed.
     *
     * @if (current.url.match(/\.(jpeg|jpg|gif|png)$/)): This is a regex that makes sure the url is actually an image. I was running into a problem where the ide
     * didn't like the file I was downloading. I guess this helps remove bloat files too.
     */
    getAxios: async (UTCStringStart, UTCStringEnd) => {
        let collecPosts = [];

        const post = await axios.get(`https://api.pushshift.io/reddit/search/submission/?&after=${UTCStringStart}&before=${UTCStringEnd}&allow_videos=false&pretty&subreddit=AnimeCalendar`);
        try {
            for (let i = 0; i < post.data.data.length; i++) {
                let current = post.data.data[i];
                const formatted = DateTime.fromSeconds(current.created_utc).toLocaleString({
                    month: 'short',
                    day: '2-digit'
                });
                if (current.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                    collecPosts.push({
                        "Date": formatted,
                        "UTC": current.created_utc,
                        "options": {
                            "url": current.url,
                            "dest": `C:/Users/Home/Desktop/Months/${DateTime.fromSeconds(current.created_utc).toLocaleString({month: 'long'})}/${formatted}/`
                        }
                    })
                }
            }
        } catch (err) {
            console.error("Something's amiss...");
            console.error(err);
            console.error("===================================================================================================");
            console.error("===================================================================================================");
        }

        //console.log("debug check")
        return collecPosts;

    },

    /**
     *
     * @param monthDay: We pass in the shortened day format of month: 'short' and day: '2-digit' because that's how the folders are named. We use that to obtain
     * the id of the folder in google drive to finally obtain the files within.
     *
     * @returns collecPosts: This is going to be an array of objects in the following format [ {title: monthDay, url: url} ]. The reason why we retain the title is
     * for todayAll to match the parameters that anthony's bot requires.
     *
     * @parameter drive.files.list: This is essentially a search query built into the google drive api:
     *
     *      q: 'q' stands for query and you can search by all kinds of parameters relating to files in your google drive. It is advised you use
     *      backticks so that you can just easily pass paramters into it. Also note that I still put double quotes around ${id}, I spent nearly an entire
     *      hour trying to figure that out.
     *
     *      pageSize: self explanatory but completely unnecesarry. There will technically never be an instance in which there are repeat day folders.
     *
     *      fields: this is the information that it returns back to you in the json file and it's super cool in which you can take only what you need. The
     *      google docs api has a whole list of things you can take back
     *
     *      orderBy: some filter, ordering. Again, doesn't matter really.
     */
    getGoogle: async (monthDay) => {
        const drive = await google.drive({version: 'v3', auth});
        let res = await drive.files.list({
            q: `name = "${monthDay}"`,
            pageSize: 10,
            fields: 'files(name, id)',
            orderBy: 'createdTime desc'
        });

        const id = await res.data.files[0].id;

        let dayFiles = await drive.files.list({
            q: `"${id}" in parents`,
            fields: 'files(name, webViewLink, webContentLink, id)',

        })

        let collecPosts = [];
        for (let i = 0; i < dayFiles.data.files.length; i++) {
            collecPosts.push({title: monthDay, url: dayFiles.data.files[i].webContentLink.slice(0, -16)});
        }


        return collecPosts;

    },
    /**
     * The intent for the following function will be to either add or replace where the bot posts daily images in the discord. The user should also be able to turn it off
     * completely if they don't want to see Aniday posts anymore.
     *
     *
     * @sendMongoEntry: Will replace a current entry if it exists, if it doesn't exist it'll use upsert to add a new entry for daily AniDay posts.
     *
     * @removeMongoEntry: Will check to see if we even have an entry for AniDay in the current guild the message is being sent. If there is an entry, we remove it.
     * If there isn't an entry, we send some feedback to the user telling them that there isn't anything to remove.
     *
     * @dailyMongoSender: After the 24 hour interval, the bot will go through all of the guilds currently subscribed to AniDay daily posts and posts that day's random image.
     */
    sendMongoEntry: async (guildID, guildCurrentChannel) => {
        await mongoClient.connect();
        let result;

        result = await mongoClient.db("aniDayStorage").collection("dailyImage").replaceOne({"guildID": guildID}, {"guildID": guildID, "channelID": guildCurrentChannel}, {upsert: true});

        mongoClient.logout();
        return result.guildID;
    },
    removeMongoEntry: async (guildID) => {
        await mongoClient.connect();
        let botFeedback;
        const currentListLength = await mongoClient.db("aniDayStorage").collection("dailyImage").findOne({"guildID": guildID});
        if (currentListLength != null) {
            result = await mongoClient.db("aniDayStorage").collection("dailyImage").removeOne({"guildID": guildID});
            botFeedback = "We successfully removed AniDay posts!"
        } else {
            botFeedback = "This server was never receiving AniDay posts..."
        }
        mongoClient.logout();
        return botFeedback;
    },
    dailyMongoSender: async () => {
        await mongoClient.connect();
        const daily = await mongoClient.db("aniDayStorage").collection("dailyImage").find({}, {
            "guildID": 1,
            "channelID": 1,
            "_id": 0
        }).toArray();
        mongoClient.logout();
        return daily;

    },
    /**
     * This function takes in an array of discord embeds and displays them through dynamic pagination. This is done
     * through the Discord.js reaction collector, which listens for two specific reactions to take place, forward or
     * backward. When the reaction is collected, it updates the message to either display the next array element or
     * previous array element.
     * @param msg           The message that is spawning this paginated view.
     * @param pages         The array of discord embeds to generate the display from.
     * @param emojiList     The next and previous buttons: defaulted to rewind and fastforward emojis.
     * @param timeout       The time allotted for the reaction collector to collect reactions. defaulted to 120000ms
     * @returns Message     Returns a discord message which is continually edited as the collector picks up reactions.
     */
    paginationEmbed: async (msg, pages, emojiList = ['⏪', '⏩'], timeout = 120000) => {
        if (!msg && !msg.channel) throw new Error('Channel is inaccessible.');
        if (!pages) throw new Error('Pages are not given.');
        if (emojiList.length !== 2) throw new Error('Need two emojis.');
        let page = 0;
        const curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
        for (const emoji of emojiList) await curPage.react(emoji);
        const reactionCollector = curPage.createReactionCollector(
            (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
            {time: timeout}
        );
        reactionCollector.on('collect', reaction => {
            // reaction.remove(msg.author);
            switch (reaction.emoji.name) {
                case emojiList[0]:
                    page = page > 0 ? --page : pages.length - 1;
                    break;
                case emojiList[1]:
                    page = page + 1 < pages.length ? ++page : 0;
                    break;
                default:
                    break;
            }
            curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
        });
        reactionCollector.on('end', function () {
                curPage.reactions.removeAll();
                curPage.edit(pages[page].setFooter("Re-search to see the other pages again."));
            }
        );
        return curPage;
    },
};
