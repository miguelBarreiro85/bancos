const MongoClient = require('mongodb').MongoClient;

const db = module.exports = {};

db.connect = function(url, callback) {
    MongoClient
        .connect(url)
        .then(database => {
            console.log('Connection established to', url);
            db.db = database;
            callback();
        })
        .catch(console.error);
};
