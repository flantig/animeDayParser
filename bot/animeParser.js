const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");

let subreddit;

/**
 * Client listener that runs exactly one (1) time when the bot first starts. Anything that needs to be ran to set up
 * bot functionality should be run in this function. Currently it is used to signal in console that the bot has started
 * and the create the reference to the AnimeCalendar subreddit.
 */
client.on('ready', async x => {
    console.log("i'm lit on " + client.guilds.cache.size + " servers.");
    subreddit = await sharedFunc.getSubredditReference("AnimeCalendar");
});

/**
 * @case config.prefix + "today": This should post the highest voted post on Hot that matches today's date. It's
 * probably overkill to use luxon just to fetch today's date but uh, it's fine. It uses "selectedHighestVoted" so that
 * it knows to stop sending images. It uses both that and counter to check if it even sent a message at all, if it
 * didn't, it returns that it couldn't find anything.
 *
 * @case config.prefix + "todayAll": It posts absolutely every post matching today's date. If it doesn't it runs the checks above.
 */
client.on('message', async msg => {
    switch (msg.content) {
        case config.prefix + "today":
            await post(msg);
            break;

        case config.prefix + "todayAll":
            let posts = await sharedFunc.getImgUrl(subreddit,true);
            posts.length > 1
                ? msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(posts)))
                : await post(msg);
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
    return posts.map(post => generateEmbedOut(post))
};

const generateEmbedOut = async (post) => {
    return new Discord.MessageEmbed()
        .setTitle(post.title)
        .setURL(post.url)
        .setColor("#3e3e3e")
        .setImage(post.url)
};

const post = async (msg) => {
    let post = await sharedFunc.getImgUrl(subreddit,false);
    await msg.channel.send(await generateEmbedOut(post));
};

client.login(config.discordToken);
