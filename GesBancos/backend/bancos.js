const mongodb = require('mongodb');
const database = require('./app.database');
const util = require('util');
const sha1 = require('sha1');
const fs = require('fs');

const players = module.exports = {};
let settings = {};

function handleError(err, response, next) {
    response.send(500, err);
    next();
}

function getCheque(request, response, next) {
    console.log("requested cheque"+request.params.id);
    database.db.collection('cheques')
        .findOne({
            numero: request.params.id
        })
        .then((cheque) => {
            if (cheque === null) {
                response.send(404, 'cheque not found');
            } else {
                response.json(cheque);
            }
            next();
        })
        .catch(err => handleError(err, response, next));
}

function getCheques(request, response, next) {
    database.db.collection('cheques')
        .find()
        .toArray()
        .then(cheques => {
            response.json(cheques || []);
            next();
        })
        .catch(err => handleError(err, response, next));
}
/*
function getPlayer(request, response, next) {
    const id = new mongodb.ObjectID(request.params.id);
    returnPlayer(id, response, next);
}

function updatePlayer(request, response, next) {
    const id = new mongodb.ObjectID(request.params.id);
    const cheque = request.body;

    if (cheque === undefined) {
        response.send(400, 'No cheque data');
        return next();
    }
    delete cheque._id;
    database.db.collection('cheques')
        .updateOne({
            numero: request.body.numero
        }, {
            $set: cheque
        })
        .then(result => returnPlayer(id, response, next))
        .catch(err => handleError(err, response, next));
}
*/
function createCheque(request, response, next) {
    console.log("creating cheque"+request.body.numero + request.body.valor);
    if (request.body === undefined) {
        response.send(400, 'No player data');
        return next();
    }
    database.db.collection('cheques')
        .findOne({
            numero: request.body.numero
        })
        .then((cheque) => {
            if (cheque === null) {
                database.db.collection('cheques')
                    .insertOne(request.body)
                    .then(result => returnPlayer(result.insertedId, response, next))
                    .catch(err => handleError(err, response, next));
                return next();
            } else {
                response.json({
                    Response: 'False',
                    Error: 'numero de cheque existente'
                });
                return next();
            }
        })
        .catch(err => handleError(err, response, next));
}

function uploadFile(request, response, next) {
    console.log("creating file"+request.files);
    fs.writeFile("/home/miguel/mlpbarreiro/teste.xlsx", request.files, "binary",function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 

}
/*function deletePlayer(request, response, next) {
    var id = new mongodb.ObjectID(request.params.id);
    database.db.collection('players')
        .deleteOne({
            _id: id
        })
        .then(result => {
            if (result.deletedCount === 1) {
                response.json({
                    msg: util.format('Player -%s- Deleted', id)
                });
            } else {
                response.send(404, 'No player found');
            }
            next();
        })
        .catch(err => handleError(err, response, next));
}*/

/*function getTop10points(request, response, next) {
    database.db.collection('players')
        .find()
        .sort({
            points: -1
        })
        .limit(10)
        .toArray()
        .then(players => {
            response.json(players || []);
            settings.websocket.notifyAll('players', Date.now() + ':Somebody accessed top 10');
            next();
        })
        .catch(err => handleError(err, response, next));
}*/

/*function getTop10stars(request, response, next) {
    database.db.collection('players')
        .find()
        .sort({
            stars: -1
        })
        .limit(10)
        .toArray()
        .then(players => {
            response.json(players || []);
            settings.websocket.notifyAll('players', Date.now() + ':Somebody accessed top 10');
            next();
        })
        .catch(err => handleError(err, response, next));
}*/

// Routes for the players
players.init = function(server, options) {
    settings = options;
    //server.get(settings.prefix + 'top10p', getTop10points);
    //server.get(settings.prefix + 'top10s', getTop10stars);
    server.post(settings.prefix + 'file', uploadFile);
    server.get(settings.prefix + 'cheques', getCheques);
    server.get(settings.prefix + 'cheques/:id', getCheque);
    //server.put(settings.prefix + 'players/:id', settings.security.authorize, updatePlayer);
    server.post(settings.prefix + 'cheques', createCheque);
    //server.del(settings.prefix + 'players/:id', settings.security.authorize, deletePlayer);
    console.log("Players routes registered");
};