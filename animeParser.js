var config = require('./config.json');
var snoowrap = require('snoowrap');
const fetch = require("node-fetch");
const {DateTime} = require("luxon");
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const today = DateTime.local().day;

const login = new snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken
});

const subreddit = login.getSubreddit('AnimeCalendar');
let selectedHighestVoted = false;
let counter = 0;


/**
 * @case config.prefix + "today": This should post the highest voted post on Hot that matches today's date. It's probably overkill to use luxon
 * just to fetch today's date but uh, it's fine. It uses "selectedHighestVoted" so that it knows to stop sending images. It uses both that and counter
 * to check if it even sent a message at all, if it didn't, it returns that it couldn't find anything.
 *
 * @case config.prefix + "todayAll": It posts absolutely every post matching today's date. If it doesn't it runs the checks above.
 */
client.on('message', msg => {

    switch (msg.content) {

        case config.prefix + "today":
            subreddit.getHot({time: 'day', limit: 10}).forEach((post) => {
                if (post.title.includes(today.toString()) && !selectedHighestVoted) {
                    msg.channel.send(post.url);
                    selectedHighestVoted = true;
                    counter++;
                } else if (!selectedHighestVoted && counter === 10) {
                    msg.channel.send("Couldn't find an Ani-rific day for you, sorry!");
                }
            });



            counter = 0;
            selectedHighestVoted = false;
            break;

        case config.prefix + "todayAll":
            subreddit.getHot({time: 'day', limit: 10}).forEach((post) => {
                if (post.title.includes(today.toString())) {
                    msg.channel.send(post.url);
                    selectedHighestVoted = true;
                    counter++;
                } else if (!selectedHighestVoted && counter === 10) {
                    msg.channel.send("Couldn't find an Ani-rific day for you, sorry!");
                }
            });


            break;


    }
})


client.login(config.discordToken);