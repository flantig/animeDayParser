const sharedFunc = require("../sharedFunc");
const download = require('image-downloader');
const fs = require("fs");
const {DateTime} = require("luxon");

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
 *
 * @params year, start, end: start and end are the ranges that we comb through because pushshift only returns
 * a set amount of objects. Year helps keep track of where we are with the ranges as we travel back from the past.
 *
 *
 * @param posts and temp: posts is the big json that we eventually download everything from. It starts off with the first date ranges and then
 * we pass in the next set of ranges from temp.
 *
 *
 *@Promise download.image(posts[i].options): This is what actually downloads the images and I added a sleep timer before it too for safe measure because it's certainly
 * possible I can status code 429 despite downloading from multiple different image hosting sites.
 *
 *@if (!fs.existsSync(posts[i].options.dest)): This is a directory creator. I kinda cheat for this, I manually created the first 12 months because it will only
 * make a directory 1 node deep. I weighed in the time it would take to code the 12 month folders vs doing it manually and it was clear to me that wasting time
 * googling would be more time expensive.
 *
 */

async function downloader() {
    let year = 365;
    let start = 1567296000;
    let end = 1568246400;
    console.log(DateTime.fromSeconds(start).toLocaleString({
        month: 'short',
        day: '2-digit'
    }) + " to " + DateTime.fromSeconds(end).toLocaleString({
        month: 'short',
        day: '2-digit'
    }));

    let posts = await sharedFunc.getAxios(start, end);
    let temp;

    while (year > 0) {
        await sleep(1500);
        start = end;
        end = end + 864000;
        year = year - 10;


        try {
            temp = await sharedFunc.getAxios(start, end);
            console.log("Success");
        } catch (e) {
            console.log(e.message);
        }

        for (let i = 0; i < temp.length; i++) {
            posts.push(temp[i]);
        }

        console.log(year);
    }
    console.log(posts);

    for (let i = 0; i < posts.length; i++) {
        if (!fs.existsSync(posts[i].options.dest)) {
            fs.mkdirSync(posts[i].options.dest);
        }
        await sleep(500);
        await download.image(posts[i].options)
            .then(({filename}) => {
                console.log('Saved to', filename)
            })
            .catch((e) => {
                console.log(e);
            })
        console.log("Downloading...")

    }


}

downloader();