const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");

module.exports = {
    today:
        async (subreddit) => {
            let post = await sharedFunc.getImgUrl(subreddit,false);
            return JSON.stringify([{
                todayAnime: post.url.toString(),
                postTitle: post.title
            }])
        },
    todayAll: async (subreddit) => {
        let posts = await sharedFunc.getImgUrl(subreddit,true);
        return JSON.stringify({
            posts: posts.map(post => {
                return {
                    todayAnime: post.url.toString(),
                    postTitle: post.title
                }
            })
        })
    },
};


