const mongodb = require('mongodb');
const database = require('./app.database');
const util = require('util');
const sha1 = require('sha1');
const MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/bancos';


const movimentos = module.exports = {};
let settings = {};

function handleError(err, response, next) {
    console.log(err);
    response.send(500, err);
    next();
}

function getNextId(){
    return new Promise(function(resolve,reject){
    database.db.collection('counters')
        .findOneAndUpdate(
            { _id: 'movId', $isolated : 1 },
            { $inc: { "seq": 1 } },
            {returnOriginal: false,
             maxTimeMS:0,
             upsert: true}
        )
       .then(movId =>{
            let nextid=movId.value.seq;
            resolve(nextid);
       })
       .catch(err=>{
            console.log('ERR'+err);
            reject(err);
       });
    });
}

function getCheque(request, response, next) {
    var strRequest = JSON.stringify(request.params.id);
    var index = strRequest.search(",");
    var tipoMovimento = strRequest.slice(1,index);
    var txtMovimento = strRequest.slice(index+1,strRequest.length-1);
    database.db.collection('cheques')
        .find({
            //"tipoMov":tipoMovimento,
            $text: { $search: txtMovimento } 
        })
        .toArray()
        .then((movimentos) => {
            if (movimentos === null){
                response.send(404, 'movimentos not found');
            } else {
                response.json(movimentos||[]);
            }
            next();
        })
        .catch(err => handleError(err, response, next));
}

function getCheques(request, response, next) {
    console.log("Serching cheques");
    database.db.collection('cheques')
        .find()
        .toArray()
        .then(cheques => {
            response.json(cheques || []);
            next();
        })
        .catch(err => handleError(err, response, next));
}

function createCheque(request, response, next) {
    let mov = request.body.numero;
    let tipoMov = request.body.tipoMov;
    console.log("Request"+request.body);
    if (request.body === undefined) {
        response.send(400, 'No player data');
        return next();
    }
    database.db.collection('cheques')
        .findOne({
            //numero: request.body.numero
            tipoMov : request.body.tipoMov,
            $text: { $search: mov }
        })
        .then((cheque) => {
            if (cheque === null) 
            {
                getSaldo().then(saldoM=>{
                    if(isNaN(saldoM)){
                        request.body.saldo = request.body.valor;    
                    }else if(!isNaN(saldoM)){
                        request.body.saldo = parseFloat(request.body.valor)+parseFloat(saldoM);
                    }
                    //GETNEXTID
                    getNextId().then(nextId=>{
                        console.log("nextId"+nextId);
                        request.body.movId = nextId;
                        database.db.collection('cheques')
                            .insertOne(request.body)
                            .then(result => {
                                console.log("Movimento Inserido");
                                response.send(200,"Movimento inserido");
                                return next();
                            })
                            .catch(err => handleError(err, response, next));    
                    })
                        
                    },
                    rejec=>{
                        console.log("NO SALDO ON COLLECTIONS: "+rejec);
                        request.body.saldo = request.body.valor;
                        database.db.collection('cheques')
                        .insertOne(request.body)
                            .then(result => returnPlayer(result.insertedId, response, next))
                            .catch(err => handleError(err, response, next));
                });
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

/*function  getSaldo(){
    return new Promise(function(resolve,reject){
    MongoClient
    .connect(url)
    .then(database => {
        console.log("SEarching lSaldo");
        database.collection('cheques')
            .find().sort({"_id":-1}).limit(1).toArray()
            .then(result =>{
                var res = parseFloat(result[0]['saldo']);
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
        })  
    });
}  
*/

function setFirstMov(request,response,next){
    var json = request.body;
    console.log("movid"+json.movId+request.body);
    json.movId = parseInt(json.movId);
    database.db.collection('cheques')
        .insertOne(json)
            .then(result => returnPlayer(result.insertedId, response, next))
            .catch(err => handleError(err, response, next));
}

function  getSaldo(){
    return new Promise(function(resolve,reject){
    database.db.collection('cheques')
            .find().sort({"_id":-1}).limit(1).toArray()
            .then(result =>{
                var res = parseFloat(result[0]['saldo']);
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
        })  
}

function getNextSequence() {
   database.db.collection('counters')
    .findAndModify(
          {
            query: { _id: "movId" },
            update: { $inc: { seq: 1 } },
            new: true
          })
    .then(result =>{
        console.log(result);
    })
    .catch(err=>{
        console.log(err);
    })
}

function deleteMov(request,response,next){
    console.log("Delete params"+request.params.id);
    database.db.collection('cheques')
        .find({"movId":{$gte:parseInt(request.params.id)}}).toArray()
            .then(updateMov=>{
                let valorMov = parseFloat(updateMov[0].valor);
                for(let i in updateMov){
                    let movementID = updateMov[i].movId;
                    let updatedSaldo = parseFloat(updateMov[i].saldo)-valorMov;
                    database.db.collection('cheques')
                        .findOneAndUpdate(
                            {movId:movementID},
                            {$set:{saldo:updatedSaldo}},
                            {new: true}
                            )
                            .then(result =>{
                                console.log(JSON.stringify(result.value));
                            })
                            .catch(err => console.log("ERRO:"+err));
                }
                database.db.collection('cheques')
                    .findOneAndDelete({movId:parseInt(request.params.id)})
                        .then(result=> console.log(result))
                        .catch(err=>console.log("ERRO:"+err));
            })
            .catch(err => handleError(err,response,next));
}

// Routes for the players
movimentos.init = function(server, options) {
    settings = options;
    //server.get(settings.prefix + 'top10p', getTop10points);
    //server.get(settings.prefix + 'top10s', getTop10stars);

    //server.get(settings.prefix + 'players', settings.security.authorize, getPlayers);
    server.get(settings.prefix + 'cheques/:id', getCheque);
    server.get(settings.prefix + 'cheques', getCheques);
    server.post(settings.prefix+'saldo', setFirstMov);
    server.get(settings.prefix+'saldo',getSaldo);
    //server.put(settings.prefix + 'players/:id', settings.security.authorize, updatePlayer);
    server.post(settings.prefix + 'cheques', createCheque);
    server.del(settings.prefix + 'cheques/:id', deleteMov);
    console.log("movimentos routes registered");
};
