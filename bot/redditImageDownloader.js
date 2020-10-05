const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config');
const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");

async function downloader () {
    const posts = await sharedFunc.getAxios(1598918400, 1601424000);

    //console.log(DateTime.fromSeconds(1601805206));
    console.log(posts);
}

downloader();