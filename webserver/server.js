const http = require("http");
// const host = 'animetodayme.me';
const port = 8000;
const {test, today, todayAll, defaultPage} = require("./routes");
const {specificMongoDay} = require("../sharedFunc");

const requestListener = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    switch (req.url) {
        case "/today":
            res.writeHead(200);
            res.end(await today());
            break;
        case req.url.includes("/specific"):
            const day = req.url.split("/specific/");
            res.writeHead(200);
            res.end(await specificMongoDay(day));
        default:
            res.writeHead(200);
            res.end(await defaultPage());
    }
};

const server = http.createServer(requestListener);
server.listen(port, () => {console.log("serving on port: " + port)})
