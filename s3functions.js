const AWS = require('aws-sdk');
const axios = require('axios');
const {DateTime} = require("luxon");
const credentials = require('./googleAPI/credentials.json');
const {MongoClient} = require('mongodb');
const uri = `mongodb+srv://TangySalmon:${credentials.mongoPW}@discordguildholder.pk6r8.mongodb.net/${credentials.mongoDB}?retryWrites=true&w=majority`
const mongoClient = new MongoClient(uri);

//const mongoClient = new MongoClient(uri);
AWS.config.update({region: credentials.awsRegion});
s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: credentials.awsAccKey,
    secretAccessKey: credentials.awsSecKey
});

module.exports = {
    /**
     *
     * @param url: The actual image you want to upload to AWS S3
     * @param month, day, filename : These are used to place the image in a specific folder inside of the AWS S3 storage
     * @returns {Promise<void>}
     */
    uploadPicture: async (url, month, day, filename, object) => {
        const image = await axios.get(url, {responseType: "arraybuffer", responseEncoding: "binary"})
        await mongoClient.connect();

        const s3Params = {
            Bucket: 'aniday',
            Key: `Months/${month}/${day}/${filename}`,
            Body: image.data,
            ACL: 'public-read',
        };

        s3.putObject(s3Params, function (err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Upload Success");
            }
        });

        const dayImgs = await mongoClient.db("aniDayStorage").collection("aniDayS3").updateOne(
            {Month: month},
            {$push: { [day]: object}}
        )

        mongoClient.logout();
    },
    /**
     *
     * @param day
     * @returns {Promise<Image Set>} : It returns the image set for the day, it filters it out before hand because mongodb will return empty objects.
     * @function project: Tells mongodb what kind of variables you're looking for. I omit _id and make sure to get back the current day.
     */
    getImageSet: async (day) => {
        await mongoClient.connect();
        const dayImgs = await mongoClient.db("aniDayStorage").collection("aniDayS3").find().project({
            '_id': 0,
            [day]: 1
        }).toArray();
        const filtered = dayImgs.filter(value => JSON.stringify(value) !== '{}')
        mongoClient.logout();

        return filtered[0][day]
    },
    getAxios: async (UTCStringStart, UTCStringEnd) => {
        let collecPosts = [];

        const post = await axios.get(`https://api.pushshift.io/reddit/search/submission/?&after=${UTCStringStart}&before=${UTCStringEnd}&allow_videos=false&pretty&subreddit=AnimeCalendar`);
        try {
            for (let i = 0; i < post.data.data.length; i++) {
                let current = post.data.data[i];
                const formatted = DateTime.fromSeconds(current.created_utc).toLocaleString({
                    month: 'short',
                    day: '2-digit'
                });
                if (current.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                    collecPosts.push({
                        "Date": formatted,
                        "UTC": current.created_utc,
                        "options": {
                            "url": current.url,
                            "dest": `C:/Users/Home/Desktop/Months/${DateTime.fromSeconds(current.created_utc).toLocaleString({month: 'long'})}/${formatted}/`
                        },
                        "threadID": current.id
                    })
                }
            }
        } catch (err) {
            console.error("Something's amiss...");
            console.error(err);
            console.error("===================================================================================================");
            console.error("===================================================================================================");
        }

        //console.log("debug check")
        return collecPosts;

    },
    getComments: async (id) => {
        const post = await axios.get(`https://api.pushshift.io/reddit/comment/search/?link_id=${id}&limit=20`);
        let collecPosts = [];
        let title = {"title": "", "medium":""}
        try {
            for (let i = 0; i < post.data.data.length; i++) {
                let current = post.data.data[i];
                collecPosts.push({
                    "commentBody": current.body
                });

            }

            for (let comment of collecPosts) { //The subreddit's bot uses different prefixes for manga and anime. Since this bot supports both, I account for both types of prefixes when searching for the anime's title
                if (comment.commentBody.includes("{") && !comment.commentBody.includes("http")) {
                    let regExp = /\{([^)]+)\}/;
                    let extracted = regExp.exec(comment.commentBody)
                    title.title = extracted[1]
                    title.medium = "anime"
                    break;
                } else if (comment.commentBody.includes("<") && !comment.commentBody.includes("http")) {
                    let regExp = /\<([^)]+)\>/;
                    let extracted = regExp.exec(comment.commentBody)
                    title.title = extracted[1]
                    title.medium = "manga"
                    break;
                } else {
                    title.title = "Unknown"
                    title.medium = "Unknown"
                }
            }
        } catch (err) {
            console.error("Something's amiss...");
            console.error(err);
            console.error("===================================================================================================");
            console.error("===================================================================================================");
        }

        return title
    },
    testMongoUpload: async (day) => {
        await mongoClient.connect();
        const dayImgs = await mongoClient.db("aniDayStorage").collection("aniDayS3").updateOne(
            {Month: "April"},
            {$push: {"Apr 01": "Taco"}}
        )
        mongoClient.logout();
    }
};
