const restify = require('restify');
const passport = require('passport');
const path = require('path');
const database = require('./app.database');
//const websocket = require('./app.websockets');

const url = 'mongodb://localhost:27017/bancos';

const server = restify.createServer();

restify.CORS.ALLOW_HEADERS.push("content-type");
restify.CORS.ALLOW_HEADERS.push("authorization");
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.fullResponse());

//const security = require('./app.security');
//security.initMiddleware(server);


const options = {
    //websocket,
    //security,
    prefix: '/api/'
};

// URL base Rest Api endpoints = /api/v1
//const auth = require('./app.authentication');
//auth.init(server, options);

const movimentos = require('./bancos');
movimentos.init(server, options);

//const games = require('./app.games');
//games.init(server, options);

server.get(/^\/(?!api\/).*/, restify.serveStatic({
    directory: __dirname+'/doc',
    default: 'index.html'
}));

database.connect(url, () => {
    server.listen(7777, () => console.log('%s listening at %s', server.name, server.url));
    // Websocket is initialized after the server
    //websocket.init(server.server);
});