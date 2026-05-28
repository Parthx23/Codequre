const http = require('http');
const server = http.createServer((req, res) => res.end('ok'));
server.listen(3000, () => {
    console.log("Listening raw http");
});
