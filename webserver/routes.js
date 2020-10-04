const sharedFunc = require("../sharedFunc");
const {DateTime} = require("luxon");

module.exports = {
    today:
        async (subreddit, counter = 0, selectedHighestVoted = false, today = DateTime.local().day) => {
            let post = await sharedFunc.getImgUrl(subreddit, selectedHighestVoted, counter, today, false);
            return JSON.stringify([{
                todayAnime: post.url.toString(),
                postTitle: post.title
            }])
        },
    todayAll: async (subreddit, counter = 0, selectedHighestVoted = false, today = DateTime.local().day) => {
        let posts = await sharedFunc.getImgUrl(subreddit, selectedHighestVoted, counter, today, true);
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


