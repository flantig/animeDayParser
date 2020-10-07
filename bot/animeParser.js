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
            let post = await sharedFunc.getImgUrl(subreddit, false);
            if (post.url != null) {
                msg.channel.send(post.url);
                break;
            } else {
                let posts = await sharedFunc.getGoogle(DateTime.local().toLocaleString({
                    month: 'short',
                    day: '2-digit'
                }));
                var randomIMG = posts[Math.floor(Math.random() * posts.length)];
                msg.channel.send(randomIMG.url);
                break;
            }

        case config.prefix + "todayAll":
            let posts = await sharedFunc.getImgUrl(subreddit, true);
            if (posts.url != null) {
                msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(posts)));
                break;
            } else {
                let posts = await sharedFunc.getGoogle(DateTime.local().toLocaleString({
                    month: 'short',
                    day: '2-digit'
                }));
                msg.channel.send(await sharedFunc.paginationEmbed(msg, await urlArrToEmbedArr(posts)));
                break;
            }
        case config.prefix + "yesterday":
                let yposts = await sharedFunc.getGoogle(DateTime.local().minus({ days: 1 }).toLocaleString({
                    month: 'short',
                    day: '2-digit'
                }));
                var randomIMG = yposts[Math.floor(Math.random() * yposts.length)];
                msg.channel.send(randomIMG.url);
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

client.login(config.discordToken);
