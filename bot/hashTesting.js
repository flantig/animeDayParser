const imghash = require('imghash');
const deepai = require('deepai');
const fs = require('fs');
const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");
const snoowrap = require('snoowrap');
const {google} = require('googleapis');
const credentials = require('../googleAPI/credentials.json');
const {MongoClient} = require('mongodb');
const leven = require('leven');
const download = require('image-downloader');

const scopes = [
    'https://www.googleapis.com/auth/drive'
];

const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);
let id;

/**
 *
 * @param ms: the time you want to set something to sleep.
 * @returns {Promise<unknown>}: By harnessing the power of promises, we can force our application to
 *          sleep similarly to how you can in python. You can await the timeout to finish before proceeding.
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const uri = `mongodb+srv://TangySalmon:${credentials.mongoPW}@discordguildholder.pk6r8.mongodb.net/${credentials.mongoDB}?retryWrites=true&w=majority`
const mongoClient = new MongoClient(uri);

async function hasher() {
    let start = 1596412800; //11/26/2019 @ 12:00am (UTC)
    let end = 1596499140; //11/26/2019 @ 11:59pm (UTC)
    let year = 365;
    let day = DateTime.fromSeconds(end).toLocaleString({month: 'short', day: '2-digit'});
    const drive = await google.drive({version: 'v3', auth}); //obligatory authentication
    deepai.setApiKey('b90fd026-4d17-4567-9b42-1d2ec2725eab'); //obligatory apikey
    let posts = await sharedFunc.getAxios(start, end);
    let googlePosts = await sharedFunc.getGoogle(day); //grabs the already saved images from google drive
    await mongoClient.connect();

    let currentFolder = await drive.files.list({
        q: `name = "${day}"`,
        pageSize: 10,
        fields: 'files(name, id)',
        orderBy: 'createdTime desc'
    });

    id = await currentFolder.data.files[0].id; //the folder we're working with, aka, today's date
    // console.log(posts[0].threadID);
    // console.log(posts[0].options.url);
    //console.log(posts);
//console.log(comments);
    while (year > 0) {
        console.log("Going through posts...");
        for (let post of posts) {
            let options1 = {"url": post.options.url, "dest": "../images/options1.png"};

            await download.image(options1) //this is the path and the url of the image we store earlier
                .then(({filename}) => {
                    //console.log('Matching image detected ||', filename)
                })
                .catch((err) => {console.log(err.statusCode); console.error(err);})

            let comments = await sharedFunc.getComments(post.threadID);
            let noTitle = false;
            let downloadYesOrNo = true;
            let currentImage;
            let aniDay = {
                "day": DateTime.fromSeconds(end).toLocaleString({month: 'short', day: '2-digit'}),
                "imageHash": "",
                "animeTitle": "N/A",
                "url": "N/A"
            };


            for (let i = 0; i < googlePosts.length; i++) {
                await sleep(1500);


                const googleDownload = await sharedFunc.downloadGoogle(googlePosts[i].id);


                const hash1 = await imghash.hash('../images/options1.png', 8, 'binary');
                console.log(hash1);
                const hash2 = await imghash.hash('../images/options2.jpg', 8, 'binary');
                console.log(hash2);
                const comp = await leven(hash1, hash2);
                console.log(comp);
                //console.log(resp);
                if (comp < 9) { //if there is a match, we break out of the loop and don't download anything
                    downloadYesOrNo = false;

                        aniDay.imageHash = hash1;
                        currentImage = googlePosts[i].url;


                    // fs.unlink(`../images/options2.jpg`, (err) => {
                    //     if (err) {
                    //         console.log("failed to delete local image:" + err);
                    //     } else {
                    //         console.log('Successfully deleted the current image');
                    //     }
                    // });
                    break;
                }
                //
                // fs.unlink(`../images/options2.jpg`, (err) => {
                //     if (err) {
                //         console.log("failed to delete local image:" + err);
                //     } else {
                //         console.log('Successfully deleted the current image');
                //     }
                // });
            }

            if (!downloadYesOrNo) { //Did we ever find a new image in the end? If so, download it.
                for (let comment of comments) {
                    if (comment.commentBody.includes("{") && !comment.commentBody.includes("http")) {
                        aniDay.animeTitle = comment.commentBody.replace("{", "").replace("}", "");
                        aniDay.url = currentImage;
                    } else if (comment.commentBody.includes("<") && !comment.commentBody.includes("http")) {
                        aniDay.animeTitle = comment.commentBody.replace("<", "").replace(">", "");
                        aniDay.url = currentImage;
                    } else {
                        aniDay.animeTitle = "Unknown"
                        aniDay.url = currentImage;
                    }
                }
            }


            if (aniDay.url != "N/A") {
                console.log(aniDay); //HERE IS WHERE WE SEND THINGS OFF TO MONGODB
                let result;
                result = await mongoClient.db("aniDayStorage").collection("aniDayEndpoint").replaceOne({"url": aniDay.url}, aniDay, {upsert: true});
            }

            // fs.unlink(`../images/options1.png`, (err) => {
            //     if (err) {
            //         console.log("failed to delete local image:" + err);
            //     } else {
            //         console.log('Successfully deleted the current image');
            //     }
            // });
        }

        start = end;
        end = end + 86340;
        year = year - 1;
        day = DateTime.fromSeconds(end).toLocaleString({month: 'short', day: '2-digit'});
        posts = await sharedFunc.getAxios(start, end);
        console.log("Moving onto: ", day);
        googlePosts = await sharedFunc.getGoogle(day); //grabs the already saved images from google drive
    }
}

hasher();