var parseXlsx = require('excel');
const MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/bancos';


function getNextId(){
    return new Promise(function(resolve,reject){
        MongoClient
            .connect(url)
            .then(database =>{
                database.collection('counters')
                    .findOneAndUpdate(
                        { _id: 'movId', $isolated : 1 },
                        { $inc: { "seq": 1 } },
                        {returnOriginal: false,
                         maxTimeMS:0,
                         upsert: true}
                    )
                   .then(movId =>{
                        let nextid=movId.value.seq;
                        database.close();
                        resolve(nextid);
                   })
                   .catch(err=>{
                        console.log('ERR'+err);
                        reject(err);
                   })
            });
    });
}

function connect(url, jsonA) {
    return new Promise(function(resolve,reject){
        getNextId().then(nextId=>{
            jsonA['movId']=nextId;
            MongoClient
            .connect(url)
            .then(database => {
            database.collection('cheques')
                .insertOne(jsonA,{forceServerObjectId:true})
                .then(() => database.close())
                .catch(err => console.log("ERROR"+err));
            },reject=>{
                console.log("reject"+reject);
                reject();
            })
            .catch(err=>{
                console.log(err);
                reject();
            });
        })
    });
};

function getSaldo(){
    return new Promise(function(resolve,reject){
    MongoClient
    .connect(url)
    .then(database => {
        database.collection('cheques')
            .find().sort({"_id":-1}).limit(1).toArray()
            .then(result =>{
                var res = parseFloat(result[0]['saldo']);
                database.close();
                resolve(res);
            })
            .catch(err => {
                reject("0");
            });
        })    
});
}

parseXlsx('movimentos.xlsx', function(err, data) {
  if(err) throw err;
    let z;
    let mov;
    let x=0;
    let json;
    getSaldo().then(saldo=>{
        let valor;
        let valorN;
        for(z in data){
            if(data[z][0]!=''){
                x++;
            }
        }        
        for(let i=x-1;i>=0;i--){
            //------------Trabalha o Saldo a inserir na BD
            valor = data[i][2].toString();
            console.log("Valor"+valor);
            if(valor.length>=8){
                //substituir as virgulas por pontos para o parseFloat
                //if(mov != "CHEQUE"){
                valor = valor.toString().split('.').join("");
                valor = parseFloat(valor.toString().replace(/,/,'.'));
            }else if(valor.length<8){
                valor = parseFloat(valor);
            }
            console.log("new Valor:"+valor);
            //saldo = saldo + valor;
            //------------Trabalha as datas
            var dataStr = data[i][0].toString();
            dataStr = dataStr.slice(6,10)+dataStr.slice(3,5)+dataStr.slice(0,2);
             //------------Trabalha o tipo de movimento
            var stringMov = data[i][1].toString();
            mov = stringMov.substring(0,stringMov.indexOf(' '));
            let tpa=/VENDAS(?= EM TPA)/g;
            let trf =/TR(?= RECEBIDA)/g;
            if (stringMov.match(tpa)){
                mov = "tpa";
            }
            if (stringMov.match(trf)){
                mov = "trfR";
            }
            let movId = 0;
                switch (mov) {
                    /*case "CHEQUE":
                        json = {"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"cheque","saldo":saldo};
                        break;*/
                    case "DEPOSITO":
                        saldo = saldo + valor;
                        json = {"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"deposito","saldo":saldo};
                        break;
                    case "TRF":
                        saldo = saldo + valor;
                        if(parseFloat(data[i][2])>0){
                            json ={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"trfRecebida","saldo":saldo};
                            break;
                        }else if(parseFloat(data[i][2])<0){
                            json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"trfRecebida","saldo":saldo};
                            break;
                        }
                    case "tpa":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"tpa","saldo":saldo};
                        break;
                    case "ENTREGA":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"entrega","saldo":saldo};
                        break;
                    case "COBRANCA":
                    case "COBR":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"cobranca","saldo":saldo};
                        break;
                    case "IMPOSTO":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"imposto","saldo":saldo};
                        break;
                    case "trfR":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"trfRecebida","saldo":saldo};
                        break;
                    case "PAGAMENTO":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"pagamentoServicos","saldo":saldo};
                        break;
                    case "MENSALIDADE":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"mensalidade","saldo":saldo};
                        break;
                    case "COMISSAO":
                    case "COMISSOES":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"comissoes","saldo":saldo};
                        break;
                    case "DEVOLUCAO":
                        saldo = saldo + valor;
                        json={"movId":movId,"data":dataStr,"numero":data[i][1],"valor":data[i][2],"tipoMov":"devolucao","saldo":saldo};
                        break;
                    default: 
                        json=null;
                        console.log("ERRrrrrrrrrrrrrrrrooooooooooooooooooooooO"+stringMov);
                        break;
                }
            if(json){
                connect(url,json).then().catch();
            }
        }
    },rejec=>{
        console.log("NO SALDO ON COLLECTIONS");
    });
});
