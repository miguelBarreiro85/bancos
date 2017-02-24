var parseXlsx = require('excel');
const MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/bancos';


connect = function(url, jsonA) {
MongoClient
    .connect(url)
    .then(database => {
        console.log('Connection established to', url);
        var json = JSON.parse(jsonA);
        database.collection('cheques')
            .insert(json)
            .then()
            .catch(err => handleError(err, response, next));
            //return next();
        })
};

function getSaldo(){
    MongoClient
    .connect(url)
    .then(database => {
        database.collection('cheques')
            .find().sort({"_id":1}).limit(1).toArray()
            .then(result =>{
                console.log(JSON.stringify(result));
                var res = parseFloat(result[0]['saldo']);
                console.log("res GET SALDO"+res);
                return res;
            })
            .catch(err => handleError(err, response, next));
            //return next();
        })    
}

parseXlsx('movimentos.xlsx', function(err, data) {
  if(err) throw err;
    var i;
    var x;
    var json=[];
    getSaldo()
        .then(saldo=>{console.log("Saldo:"+saldo)});
    /*console.log("RESULT get saldo"+saldo);
    var valor;
    var valorN;
    for(i in data){
    	if(data[i][0]!=''){
            var stringMov = data[i][1].toString();
            mov = stringMov.substring(0,stringMov.indexOf(' '));
            //substituir as virgulas por pontos para o parseFloat
            if(mov != "CHEQUE"){
                valor = parseFloat(data[i][2].toString().replace(/,/,'.'));
                console.log(saldo+"+"+valor+"=");
                saldo += valor;
                console.log(saldo);
            }
            switch (mov) {
                case "CHEQUE":
                    break;
                case "DEPOSITO":
                    json.push({"data":data[i][0],"numero":data[i][1],"valor":data[i][2],"tipoMov":"deposito","saldo":saldo});
                    break;
                case "TRF":
                    json.push({"data":data[i][0],"numero":data[i][1],"valor":data[i][2],"tipoMov":"trf","saldo":saldo});
                    break;
            }
            //console.log("JSON"+json[x])
    	}
    }
    //JSON.parse(json);
    var jsonA = JSON.stringify(json);
    connect(url,jsonA);*/
});