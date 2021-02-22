const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");
const s3fun = require("../s3functions");

module.exports = {
    today: async () => {
        try {
            let posts = await s3fun.getImageSet(DateTime.local().toLocaleString({month: 'short', day: '2-digit'}));
            console.log(posts);
            return JSON.stringify(posts);
        } catch(e) {
            console.log(e);
        }
    },
    specific: async (day) => {
        try {
            let posts = await s3fun.getImageSet(day);
            console.log(posts);
            return JSON.stringify(posts);
        } catch(e) {
            console.log(e);
        }
    },
    defaultPage: async () => {
        return JSON.stringify({
            devs: {Anthony: "An🗡nee#0777", Franky: "Tangy Salmon#7457"},
            endpoints: [
                {
                    uri: "/today",
                    desc: "Grab anime images that reference's today's date."
                },
            ],
            moreInfo: "Contact either dev on discord."
        })
    }
};


