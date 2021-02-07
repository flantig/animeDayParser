const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const sharedFunc = require("../sharedFunc");
const fs = require('fs');
const imghash = require('imghash');
const leven = require('leven');
const {DateTime} = require("luxon");
const {MongoClient} = require('mongodb');
const credentials = require('../googleAPI/credentials.json');
const {google} = require('googleapis');
var cron = require('node-cron');
let subreddit;
const uri = `mongodb+srv://TangySalmon:${credentials.mongoPW}@discordguildholder.pk6r8.mongodb.net/${credentials.mongoDB}?retryWrites=true&w=majority`
const mongoClient = new MongoClient(uri);
const download = require('image-downloader');
const scopes = [
    'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);


/**
 *
 * @param ms: the time you want to set something to sleep.
 * @returns {Promise<unknown>}: By harnessing the power of promises, we can force our application to
 *          sleep similarly to how you can in python. You can await the timeout to finish before proceeding.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Client listener that runs exactly one (1) time when the bot first starts. Anything that needs to be ran to set up
 * bot functionality should be run in this function. Currently it is used to signal in console that the bot has started
 * and the create the reference to the AnimeCalendar subreddit.
 *
 * @posts: Fetches all the possible images for that day and chooses one at random to display
 *
 * @setInterval: After 24 hours, the bot will reach out to MongoDB and ask what servers it should be sending a daily AniDay image too
 */
client.on('ready', async x => {
    console.log("i'm lit on " + client.guilds.cache.size + " servers.");

    cron.schedule('20 00 * * *', async function () {
        let day = DateTime.local().toLocaleString({month: 'short', day: '2-digit'});
        let posts = await sharedFunc.specificMongoDay(day);
        var randomIMG = posts[Math.floor(Math.random() * posts.length)];
        let dailyGuildArray = await sharedFunc.dailyMongoSender();

        for (const element of dailyGuildArray) {
            let guild = client.guilds.fetch(element.guildID);
            let channel = (await guild).channels.cache.find(channel => channel.id === element.channelID);

            const embed = new Discord.MessageEmbed()
                .setTitle(DateTime.local().toLocaleString({
                    month: 'long',
                    day: '2-digit'
                }))
                .setDescription(randomIMG.animeTitle)
                .setImage(randomIMG.url)
            channel.send(embed);
        }
    });


    cron.schedule( '30 20 * * *' , async function () {dailyChecker(DateTime.local())});
    
    subreddit = await sharedFunc.getSubredditReference("AnimeCalendar");
});
/**
 * @case config.prefix + "today": This should post the highest voted post on Hot that matches today's date. It's
 * probably overkill to use luxon just to fetch today's date but uh, it's fine. It uses "selectedHighestVoted" so that
 * it knows to stop sending images. It uses both that and counter to check if it even sent a message at all, if it
 * didn't, it returns that it couldn't find anything.
 *
 * @case config.prefix + "todayAll": It posts absolutely every post matching today's date. If it doesn't it runs the checks above.
 *
 * @case daily AND daily + " off": They set and remove the daily Aniday posts respectively.
 */
client.on('message', async msg => {
    switch (msg.content) {
        case config.prefix + "today":
            //Likely never going to use the subreddit for daily images
            // let post = await sharedFunc.getImgUrl(subreddit, false);
            // if (post.url != null) {
            //     const embed = new Discord.MessageEmbed()
            //         .setTitle(DateTime.local().toLocaleString({
            //             month: 'long',
            //             day: '2-digit'
            //         }))
            //         .setImage(post.url)
            //     msg.channel.send(embed);
            //     break;
            // } else {
                let posts = await sharedFunc.specificMongoDay(DateTime.local().toLocaleString({
                    month: 'short',
                    day: '2-digit'
                }));
                var randomIMG = posts[Math.floor(Math.random() * posts.length)];
                const embed = new Discord.MessageEmbed()
                    .setTitle(DateTime.local().toLocaleString({
                        month: 'long',
                        day: '2-digit'
                    }))
                    .setDescription(randomIMG.animeTitle)
                    .setImage(randomIMG.url)
                msg.channel.send(embed);
                console.log(randomIMG);
                break;
        //    }

        //Anthony's code doesn't work, I'll vault this for now
        // case config.prefix + "todayAll":
        //     let posts = await sharedFunc.getImgUrl(subreddit, true);
        //     let postsG = await sharedFunc.getGoogle(DateTime.local().toLocaleString({
        //         month: 'short',
        //         day: '2-digit'
        //     }));
        //     if (posts.url != null) {
        //         msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(posts)));
        //         break;
        //     } else {
        //         msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(postsG)));
        //         break;
        //     }
            
        case config.prefix + "yesterday":
            let yposts = await sharedFunc.getGoogle(DateTime.local().minus({days: 1}).toLocaleString({
                month: 'short',
                day: '2-digit'
            }));
            var randomIMG = yposts[Math.floor(Math.random() * yposts.length)];
            msg.channel.send(randomIMG.url);
            break;
        case config.prefix + "daily":
            let getMongo = await sharedFunc.sendMongoEntry(msg.guild.id, msg.channel.id);
            msg.channel.send("You've set daily AniDay posts! Remember, you can always turn me off with '>daily off'. ");
            break;
        case config.prefix + "daily" + " off":
            let removeMongo = await sharedFunc.removeMongoEntry(msg.guild.id);
            msg.channel.send(removeMongo);
            break;
    }
});

/**
 * This function takes the array of posts generated by getImgUrl() and transforms it into an array of discord embeds
 * so that it can be fed into paginationEmbed() and create the paginated embed output. This function is only used
 * for the "todayAll" case because sending a single image will auto-generate an embed, therefore no need for a
 * conversion function.
 * @param   posts => Array of post objects obtained from getImgUrl()
 * @returns Discord.MessageEmbed[]
 */
const urlArrToEmbedArr = async (posts) => {
    return posts.map(post => {
        return new Discord.MessageEmbed()
            .setTitle(post.title)
            .setURL(post.url)
            .setColor("#3e3e3e")
            .setImage(post.url)
    })
};

let aniDay = {
    "day": "",
    "imageHash": "",
    "animeTitle": "N/A",
    "url": "N/A"
};

/**
 * @motivation dailyChecker: to check for new images for the bot daily
 *
 * @issues inefficiency: One of the biggest issues right now is that I don't have the google drive folder information stored in the mongodb. I would like
 * to ideally never have to use the Google Drive API if I can avoid it. The only thing I'd need it for is to download images and to upload them, otherwise
 * I shouldn't need to go egg hunting for folder ids and deciphering their very terrible documentation.
 *
 * @ToDo: In the winter I plan on reworking the mongoDB. What I implemented now is just a placeholder but the idea is to further specify images by a key generated by the image's hash. This well help me avoid having to use one whole for-loop, specifically the one that runs comparisons and should significantly speed up the scraping process.
 */

const dailyChecker = async (day) => {
    await mongoClient.connect();
    let id; //id will represent the folder of today's google drive
    const start = await DateTime.local().startOf('day').toSeconds().toString(); //The date range is currently necessary to catch today's date.
    const end = await DateTime.local().endOf('day').toSeconds().toString() - .999; //luxon goes to the very last millisecond, so you must tell it to relax and trim off the decimal
    const redditImages = await sharedFunc.getAxios(start, end); //the pushshift endpoint for today's date

    aniDay.day = DateTime.fromSeconds(end).toLocaleString({month: 'short', day: '2-digit'});
    const drive = await google.drive({version: 'v3', auth}); //obligatory authentication
    const googleImages = await mongoClient.db("aniDayStorage").collection("aniDayEndpoint").find({ "day" : DateTime.local().toLocaleString({
            month: 'short',
            day: '2-digit'
        })}).toArray();

    console.log("Today's Date: ", aniDay.day);
    console.log("The reddit image set : ");
    console.log(redditImages);
    console.log("The already established image set : ");
    console.log(googleImages);

    let currentFolder = await drive.files.list({ //I despise that I have to do this still but I forgot to add the google drive folder's id to the mongo database so this wouldn't be needed. When I come back to this in the winter, I'll work on fixing up the mongodb to include this.
        q: `name = "${day.toLocaleString({
            month: 'short',
            day: '2-digit'
        })}"`,
        pageSize: 10,
        fields: 'files(name, id)',
        orderBy: 'createdTime desc'
    });


    id = await currentFolder.data.files[0].id; //the folder we're working with, aka, today's date


    for (let post of redditImages) {
        let options1 = {"url": post.options.url, "dest": "../images/options1.png"};
        let hash1, hash2; //We're going to compare images until we find a new one and once we do, we upload it to the google drive and update mongoDB
        let downloadYesOrNo = true;

        await download.image(options1) //this is the path and the url of the image we store earlier
            .then(({filename}) => {
                //console.log('Matching image detected ||', filename)
            })
            .catch((err) => {
                console.log(err.statusCode);
                console.error(err);
            })
        for (let goog of googleImages) {
            await sleep(1500);
            const googleDownload = await sharedFunc.downloadGoogle(goog.url.split("https://drive.google.com/uc?id=")[1]);

            hash1 = await imghash.hash('../images/options1.png', 8, 'binary');
            hash2 = await imghash.hash('../images/options2.jpg', 8, 'binary');
            const comp = await leven(hash1, hash2);

            if (comp < 9) { //if there is a match, we break out of the loop and don't download anything
                downloadYesOrNo = false;


                currentImage = goog.url;

                break;
            }
        }

        if (downloadYesOrNo) { //Did we ever find a new image in the end? If so, upload it.
            let comments = await sharedFunc.getComments(post.threadID);
            let fileMetadata = {
                'name': `options1.png`, //The name of the file
                parents: [id] //the folder we're uploading to
            };

            var media = {
                body: fs.createReadStream(`../images/options1.png`) //the file we're uploading
            };


            drive.files.create({ //create is the function that uploads the file, it takes in an object denoting the parameters above and a callback function that deletes the file after uploading.
                resource: fileMetadata,
                media: media,
                fields: 'id'
            }).then(async function (response) {
                console.log("The current image has been successfully uploaded ||", response.data.id);
                aniDay.url = "https://drive.google.com/uc?id=" + response.data.id;

                for (let comment of comments) { //The subreddit's bot uses different prefixes for manga and anime. Since this bot supports both, I account for both types of prefixes when searching for the anime's title
                    if (comment.commentBody.includes("{") && !comment.commentBody.includes("http")) {
                        aniDay.animeTitle = comment.commentBody.replace("{", "").replace("}", "");
                        aniDay.imageHash = hash1;
                    } else if (comment.commentBody.includes("<") && !comment.commentBody.includes("http")) {
                        aniDay.animeTitle = comment.commentBody.replace("<", "").replace(">", "");
                        aniDay.imageHash = hash1;
                    } else {
                        aniDay.animeTitle = "Unknown";
                        aniDay.imageHash = hash1;

                    }
                }

                let result = await mongoClient.db("aniDayStorage").collection("aniDayEndpoint").replaceOne({"url": aniDay.url}, aniDay, {upsert: true});
            }, function (err) {
                console.error("Execute error", err);
            });


        }
    }
    mongoClient.logout();
}


client.login(config.discordToken);
