const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);    // restart server and listen to assigned port

