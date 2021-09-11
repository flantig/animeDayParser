const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const util = require('util')
const sharedFunc = require("../sharedFunc");
const s3fun = require("../s3functions");
const fs = require('fs');
const {imageHash} = require('image-hash');
const imageH = util.promisify(imageHash);
const leven = require('leven');
const {DateTime} = require("luxon");
const anilist = require('anilist-node');
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

let taco = "asd"
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

    cron.schedule('10 00 * * *', async function () {
        let day = DateTime.local().toLocaleString({month: 'short', day: '2-digit'});
        let posts = await s3fun.getImageSet(DateTime.local().toLocaleString({month: 'short', day: '2-digit'}));
        var randomIMG = posts[Math.floor(Math.random() * posts.length)];
        let dailyGuildArray = await sharedFunc.dailyMongoSender();

        for (const element of dailyGuildArray) {
            let guild = client.guilds.fetch(element.guildID);
            let channel = (await guild).channels.cache.find(channel => channel.id === element.channelID);


            channel.send(await sharedFunc.channelEmbeded(channel, await possibleMSGs(randomIMG, DateTime.local())));
        }
    });
    // newUploader(DateTime.local().minus({day: 1}))
    // cron.schedule('00 20 * * *', async function () {
    //     newUploader(DateTime.local())
    // });

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
            let posts = await s3fun.getImageSet(DateTime.local().toLocaleString({month: 'short', day: '2-digit'}));
            var randomIMG = posts[Math.floor(Math.random() * posts.length)];

            msg.channel.send(await sharedFunc.infoEmbeded(msg, await possibleMSGs(randomIMG, DateTime.local())));

            console.log(randomIMG);
            break;
        // case config.prefix + "todayAll":
        //     let postss3 = await s3fun.getImageSet(DateTime.local().toLocaleString({month: 'short', day: '2-digit'}));
        //     msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(postss3)));
        //     break;
        case config.prefix + "yesterday":
            let yposts = await s3fun.getImageSet(DateTime.local().minus({days: 1}).toLocaleString({
                month: 'short',
                day: '2-digit'
            }));
            var randomIMG = yposts[Math.floor(Math.random() * yposts.length)];
            msg.channel.send(await sharedFunc.infoEmbeded(msg, await possibleMSGs(randomIMG, DateTime.local().minus({days: 1}))));

            console.log(randomIMG);
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


const possibleMSGs = async (object, day) => {
    let post = []
    const today = day.toLocaleString({
        month: 'long',
        day: '2-digit'
    });
    let genre, medium;
    console.log(object)
    if (object.genre.length > 1) {
        genre = object.genre.join(" , ")
    } else {
        genre = "Unavailable";
    }

    if ("episodes" in object) {
        medium = ["Episodes", "episodes"]
    } else {
        medium = ["Chapters", "chapters"]
    }


    const body = `**Genre:** ${genre} \n **Rating:** ${object.score} \n **${medium[0]}:** ${object[medium[1]]}`
    post.push(new Discord.MessageEmbed().setTitle(`**${today}**`).setImage(object.url).setDescription(`**${object.title}**`))
    post.push(new Discord.MessageEmbed().setTitle(`**${today}**`).setImage(object.url).setDescription(`**${object.title}**`).addField("**--Synopsis--**", `||${object.description}||`).addField("**--Info--**", `${body}`))
    return post
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
async function newUploader(dayi) {
    // await api.agent.cacheLogin("./cache.txt","flantig", "P!n%5ck+*C#!RcL", true);
    // let data = (await mySauce(`https://i.pinimg.com/474x/77/d5/86/77d586995c000bde81e50510f7c0b9cc.jpg`)).json;
    const Anilist = new anilist();
console.log("Starting checker...")
    // const chapter = await Anilist.search('manga', data.results[0].data.source)
    // const manga = await Anilist.media.manga(chapter.media[0].id)
    // console.log(manga)
    let day = dayi.toLocaleString({month: 'short', day: '2-digit'})
    let linkDay = day.replace(' ', '+');

    const start = await dayi.startOf('day').toSeconds().toString(); //The date range is currently necessary to catch today's date.
    const end = await dayi.endOf('day').toSeconds().toString() - .999; //luxon goes to the very last millisecond, so you must tell it to relax and trim off the decimal
    const redditImages = await s3fun.getAxios(start, end); //the pushshift endpoint for today's date
    const s3Set = await s3fun.getImageSet(day)
    let hasher, hasher2;
    let currentImage = ""
    console.log(redditImages)
    console.log(s3Set)
    for (let post of redditImages) {
        currentImage = post.options.url;
        try {
            hasher = await imageH(post.options.url, 16, true)
        } catch {
            currentImage = ""
            continue;
        }
        let downloadYesOrNo = true;
        for (let s3 of s3Set) {

            hasher2 = s3.hash;
            const comp = await leven(hasher, hasher2);
            console.log(hasher)
            console.log(hasher2)
            console.log(comp)
            if (comp < 9) { //if there is a match, we break out of the loop and don't download anything
                downloadYesOrNo = false;

                break;
            }
        }

        if (downloadYesOrNo) {
            const who = await s3fun.getComments(post.threadID)

            if (who.medium === "Unknown") {
                try {
                    console.log("Attempting trace.moe...")
                    const file = currentImage.match(/[\w-]+\.(jpg|png|txt)/g).join()
                    const response = await fetch(`https://trace.moe/api/search?url=${currentImage}`);
                    let data = await response.json()
                    const respAni = await Anilist.media.anime(data.docs[0].anilist_id);
                    const newEntry = {
                        "day": day,
                        "url": `https://aniday.s3.amazonaws.com/MonthHybrid/${dayi.toLocaleString({month: 'long'})}/${linkDay}/${file}`,
                        "title": respAni.title.userPreferred,
                        "description": respAni.description.replace(/<script.*?<\/script>/g, '')
                            .replace(/<style.*?<\/style>/g, '')
                            .replace(/(<([^>]+)>)/ig, '')
                            .replace(/(?:\r\n|\r|\n)/g, ''),
                        "score": respAni.averageScore + "/100",
                        "genre": respAni.genres,
                        "episodes": respAni.episodes,
                        "hash": hasher,
                        "method": "trace.moe"
                    }
                    await s3fun.uploadPicture(currentImage, dayi.toLocaleString({month: 'long'}), day, file, newEntry)
                    console.log("Uploaded something!")
                } catch {
                    const file = currentImage.match(/[\w-]+\.(jpg|png|txt)/g).join()
                    const newEntry = {
                        "day": day,
                        "url": `https://aniday.s3.amazonaws.com/MonthHybrid/${dayi.toLocaleString({month: 'long'})}/${linkDay}/${file}`,
                        "title": 'Unknown',
                        "description": 'Unknown',
                        "score": 'Unknown',
                        "genre": ['Unknown'],
                        "chapters": 'Unknown',
                        "hash": hasher,
                        "method": "fallback"
                    }
                    await s3fun.uploadPicture(currentImage, dayi.toLocaleString({month: 'long'}), day, file, newEntry)
                    console.log("Uploaded something!")
                }
            } else if (who.medium === "anime") {
                try {
                    const search = await Anilist.search('anime', who.title)
                    const anime = await Anilist.media.anime(search.media[0].id)
                    const file = currentImage.match(/[\w-]+\.(jpg|png|txt)/g).join()
                    const newEntry = {
                        "day": day,
                        "url": `https://aniday.s3.amazonaws.com/MonthHybrid/${dayi.toLocaleString({month: 'long'})}/${linkDay}/${file}`,
                        "title": anime.title.userPreferred,
                        "description": anime.description.replace(/<script.*?<\/script>/g, '')
                            .replace(/<style.*?<\/style>/g, '')
                            .replace(/(<([^>]+)>)/ig, '')
                            .replace(/(?:\r\n|\r|\n)/g, ''),
                        "score": anime.averageScore + "/100",
                        "genre": anime.genres,
                        "episodes": anime.episodes,
                        "hash": hasher,
                        "method": "scrape"
                    }
                    await s3fun.uploadPicture(currentImage, dayi.toLocaleString({month: 'long'}), day, file, newEntry)
                    console.log(newEntry)
                    console.log("Uploaded something!")
                } catch (e) {
                    console.log(e)
                }
            } else if (who.medium === "manga") {
                try {
                    const filter = {}
                    const search = await Anilist.searchEntry.manga(who.title, filter)
                    console.log("Manga attempt")
                    console.log(search)
                    const manga = await Anilist.media.manga(search.media[0].id)
                    const file = currentImage.match(/[\w-]+\.(jpg|png|txt)/g).join()
                    const newEntry = {
                        "day": day,
                        "url": `https://aniday.s3.amazonaws.com/MonthHybrid/${dayi.toLocaleString({month: 'long'})}/${linkDay}/${file}`,
                        "title": manga.title.userPreferred,
                        "description": manga.description.replace(/<script.*?<\/script>/g, '')
                            .replace(/<style.*?<\/style>/g, '')
                            .replace(/(<([^>]+)>)/ig, '')
                            .replace(/(?:\r\n|\r|\n)/g, ''),
                        "score": manga.averageScore + "/100",
                        "genre": manga.genres,
                        "chapters": manga.chapters,
                        "hash": hasher,
                        "method": "scrape"
                    }
                    await s3fun.uploadPicture(currentImage, dayi.toLocaleString({month: 'long'}), day, file, newEntry)
                    console.log(file)
                    console.log("Uploaded something!")
                } catch (e) {
                    console.log(e)
                }
            } else {
                const file = currentImage.match(/[\w-]+\.(jpg|png|txt)/g).join()
                const newEntry = {
                    "day": day,
                    "url": `https://aniday.s3.amazonaws.com/MonthHybrid/${dayi.toLocaleString({month: 'long'})}/${linkDay}/${file}`,
                    "title": 'Unknown',
                    "description": 'Unknown',
                    "score": 'Unknown',
                    "genre": ['Unknown'],
                    "chapters": 'Unknown',
                    "hash": hasher
                }
                await s3fun.uploadPicture(currentImage, dayi.toLocaleString({month: 'long'}), day, file, newEntry)
                console.log("Uploaded something!")
            }
        }
    }
    await sleep(9000)
}


client.login(config.discordToken);
