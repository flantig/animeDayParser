const http = require("http");
const host = 'localhost';
const port = 8000;
const {placeholder} = require("./routes");

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    switch (req.url) {
        case "/placeholder":
            res.writeHead(200);
            res.end(placeholder);
            break;
        default:
            res.end(`{"message": "This is where the image link goes"}`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
