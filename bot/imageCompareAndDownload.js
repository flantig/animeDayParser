const deepai = require('deepai');
const sharedFunc = require("../sharedFunc");
const credentials = require('../googleAPI/credentials.json');
const {DateTime} = require("luxon");
const {google} = require('googleapis');
const download = require('image-downloader');
const fs = require("fs");
let day = DateTime.local().toLocaleString({month: 'short', day: '2-digit'});
let id;

const scopes = [
    'https://www.googleapis.com/auth/drive'
];

const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);

/**
 *
 * @param day //Today's date, used to locate a folder in the google drive because I want its ID to use later when I upload the file
 * @param callback //we want comparitor to happen first so that we can actually get a list of files to upload when we run uploadFolder
 *
 */


async function comparitor(day, callback) {

    const drive = await google.drive({version: 'v3', auth}); //obligatory authentication
    deepai.setApiKey('d13a04ea-7a45-4d04-818d-13cdf8d49e8a'); //obligatory apikey
    subreddit = await sharedFunc.getSubredditReference("AnimeCalendar"); //Grabs the authentication from the redditbot and denotes the subreddit we're scrapping through
    let posts = await sharedFunc.getImgUrl(subreddit, true); //grabs a few of the top posts for that day
    let googlePosts = await sharedFunc.getGoogle(day); //grabs the already saved images from google drive

    let currentFolder = await drive.files.list({
        q: `name = "${day}"`,
        pageSize: 10,
        fields: 'files(name, id)',
        orderBy: 'createdTime desc'
    });

    id = await currentFolder.data.files[0].id; //the folder we're working with, aka, today's date

    let options = {"url": "", "dest": "../images"};
    let files;

    for (let image of posts) {
        let downloadYesOrNo = true;

        for (let googImage of googlePosts) {

            let resp = await deepai.callStandardApi("image-similarity", { //runs the two images we're currently comparing through the
                image1: image.url,
                image2: googImage.url,
            });
            console.log(resp);
            if (resp.output.distance < 5) { //if there is a match, we break out of the loop and don't download anything
                downloadYesOrNo = false;
                break;
            } else { //if there isn't a match, we keep that image url stored just in case we do end up downloading it but it's possible that we still don't
                options.url = image.url;
            }
        }

        if (downloadYesOrNo) { //Did we ever find a new image in the end? If so, download it.
            await download.image(options) //this is the path and the url of the image we store earlier
                .then(({filename}) => {
                    console.log('Matching image detected ||', filename)
                })
                .catch((err) => console.error(err))
        }
    }

    callback();


}

async function uploadFolder() {
    const drive = await google.drive({version: 'v3', auth}); //obligatory authentication
    let files = fs.readdirSync('../images'); //Earlier we may have downloaded some new images, we get all the file names for those images. If there isn't any, the array is empty
    for (let fileName of files) {

        let fileMetadata = {
            'name': `${fileName}`, //The name of the file
            parents: [id] //the folder we're uploading to
        };

        var media = {
            body: fs.createReadStream(`../images/${fileName}`) //the file we're uploading
        };

        drive.files.create({ //create is the function that uploads the file, it takes in an object denoting the parameters above and a callback function that deletes the file after uploading.
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                console.error(err);
            } else {
                console.log("The current image has been successfully uploaded ||", fileName);
                fs.unlink(`../images/${fileName}`, (err) => {
                    if (err) {
                        console.log("failed to delete local image:" + err);
                    } else {
                        console.log('Successfully deleted the current image ||', fileName);
                    }
                });
            }
        });
    }

}

let year = 365;

while (year > 0) {
    comparitor(day, uploadFolder);

}