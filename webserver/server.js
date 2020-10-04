const http = require("http");
const host = 'localhost';
const port = 8000;
const {today, todayAll} = require("./routes");
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
            res.end(`{"message": "This is where the image link goes"}`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
