const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");

module.exports = {
    today:
        async (subreddit) => {
            let post = await sharedFunc.getImgUrl(subreddit,false);
            console.log(post)
            if(post){
                return JSON.stringify([{
                    imgUrl: post.url.toString(),
                    postTitle: post.title
                }])
            }
            else {
                return JSON.stringify([{
                    imgUrl: "No Image Yet",
                    postTitle: "No Image Yet"
                }])
            }

        },
    todayAll: async (subreddit) => {
        let posts = await sharedFunc.getImgUrl(subreddit,true);
        return JSON.stringify({
            posts: posts.map(post => {
                return {
                    imgUrl: post.url.toString(),
                    postTitle: post.title
                }
            })
        })
    },
    defaultPage: async () => {
        return JSON.stringify({
            devs: {Anthony: "An🗡nee#0777", Franky: "Tangy Salmon#7457"},
            endpoints: [
                {
                    TodayAnimeImage: "/today",
                    desc: "Grab one anime image that reference's today's date."
                },
                {
                    TodayAnimeImageAll: "/todayAll",
                    desc: "Grab all anime images that reference's today's date."
                }
            ],
            moreInfo: "Contact either dev on discord."
        })
    }
};


