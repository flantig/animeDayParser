# Anime Day Parser
It is a bot that shitposts the day of the month with anime pictures, and a webserver for anyone to grab those shitposts for themselves.

## The Web Server
You can find the webserver [here](http://www.animetodayme.me), if your browser flags this as a malicious site don't worry, we don't want your credit card info. \
**We just can't be assed to get a HTTPS cert.**

### Endpoints
> [/today](http://www.animetodayme.me/today) 

Returns a single JSON object containing exactly one (1) shitpost.

> [/todayAll](http://www.animetodayme.me/todayAll) 

Returns an array of JSON objects full of however many shitposts there are for the current day.

### How do I use this in my code
You can use these images for whatever the hell you want, but here's an example of fetching the shitposts from the `todayAll` endpoint and printing their urls. 

This particular example is done in Node.js and uses node-fetch.

```
const fetch = require('node-fetch');

const grabDays = async () => {
    await fetch("http://www.animetodayme.me/todayAll")
        .then(async response => await response.json())
        .then(out => out.posts.forEach(x => console.log(x.imgUrl)))
}

grabDays();
```

If you used the above code on October 4th, 2020, you'd get an output that looks like this:
```
https://i.redd.it/arw4keta80r51.jpg
https://i.redd.it/h6b6we4rv1r51.jpg
https://i.imgur.com/ZvMGVOm.jpg
https://i.redd.it/9qoa69x270r51.png
```

## The Bot 
To accompany the above webserver, we've built a discord bot that utilizes the data from the two endpoints. \
You can invite this discord bot to your server [here](https://discord.com/api/oauth2/authorize?client_id=284535421864640515&permissions=75776&scope=bot).

### Bot Commands
> \>today 

This command will display only one (1) shitpost. 

> \>todayAll 

This command will display every shitpost that is for the current day in a paginated embed. \
Click the reactions on the bottom to scroll through the shitposts.
