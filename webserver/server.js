const http = require("http");
const host = 'animetodayme.me';
const port = 8000;
const {today, todayAll, defaultPage} = require("./routes");
const sharedFunc = require("../sharedFunc");

const requestListener = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    let subReddit = await sharedFunc.getSubredditReference("AnimeCalendar");
    switch (req.url) {
        case "/today":
            res.writeHead(200);
            res.end(await today(subReddit));
            break;
        case "/todayAll":
            res.writeHead(200);
            res.end(await todayAll(subReddit));
            break;
        default:
            res.writeHead(200);
            res.end(await defaultPage());
    }
};

const server = http.createServer(requestListener);
server.listen(host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
