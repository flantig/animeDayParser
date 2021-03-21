const http = require("http");
const url = require('url');
const {DateTime} = require("luxon");
// const host = 'animetodayme.me';
const port = 8000;
const {test, today, todayAll, defaultPage} = require("./routes");
const {specificMongoDay} = require("../sharedFunc");
const {getImageSet} = require("../s3functions");

const requestListener = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    console.log(req.url)
    switch (req.url.split("?")[0]) {
        case "/today":
            res.writeHead(200);
            res.end(await today());
            break;
        case "/specific/":
            console.log(DateTime.local().toLocaleString({month: 'short', day: '2-digit'}));
            let day = req.url.split("&day=")[1];
            let monthtemp = req.url.split("&day=")[0].split("?month=")[1];
            let month = monthtemp.charAt(0).toUpperCase() + monthtemp.slice(1);
            const date = month + " " + day;
            console.log(date);
            res.writeHead(200);
            res.end(JSON.stringify(await getImageSet(date)));
            break;
        default:
            res.writeHead(200);
            res.end(await defaultPage());
    }
};

const server = http.createServer(requestListener);
server.listen(port, () => {console.log("serving on port: " + port)})
