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


client.on('message', msg => {
    const prefix = ">"
    let counter = 0;
    switch(msg.content){
        case prefix + "today":
            const subreddit = login.getSubreddit('AnimeCalendar');
            subreddit.getHot({time: 'day', limit: 10}).forEach((post) => {
                if(post.title.includes(today.toString()) && counter === 0){
                    msg.channel.send(post.url);
                    counter++;
                }
            });

    }
})


client.login(config.discordToken);