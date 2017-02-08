(function() {
    'use strict';
    $(function() {
        $("#procuraData").click(function(){
            var dataF=$("#dataFinal").val();
            var dataI=$("#dataInicial").val();
            var dataFi= parseInt(dataF.slice(0,4)+dataF.slice(5,7)+dataF.slice(8,10));
            var dataIn = parseInt(dataI.slice(0,4)+dataI.slice(5,7)+dataI.slice(8,10));
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var response = JSON.parse(xmlHttpTwo.responseText);
                        var i;
                        for(i in response){
                            var dataCheque = response[i].data
                            if(dataCheque >= dataIn && dataCheque <= dataFi){
                                desenhaTabela(response[i]);
                            }
                        }
                    }
                }; 
            xmlHttpTwo.open("GET", "http://localhost:7777/api/cheques", true);
            xmlHttpTwo.send();
        });        
    });
    $(function() {
        $("#recebeCheques").click(function(){
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        var x;
                        var i=0;
                        for(x in res){
                            i++;
                        }
                        for(var z=i-1;z>0;z--){
                            desenhaTabela(res[z]);
                        }   
                    }
                }; 
            xmlHttpTwo.open("GET", "http://localhost:7777/api/cheques", true);
            xmlHttpTwo.send();                  
        });        
    });
    $(function() {
        $("#enviaCheque").click(function(){
            var xmlHttp = new XMLHttpRequest();
            var formElement = document.querySelector("#chequeInfo");
            var dataI=String($("#dataInicial").val());
            var formData = new FormData(formElement);
            dataI = parseInt(dataI.slice(0,4)+dataI.slice(5,7)+dataI.slice(8,10));
            formData.set("data",dataI);
            xmlHttp.open("POST", "http://localhost:7777/api/cheques",true);
            xmlHttp.send(formData);
        });        
    });
    $(function() {
        $("#procuraNum").click(function(){
            var tipoMovimento = $('#movimento').val();
            var numCheque = parseInt($("#numeroCheque").val());
            console.log("movimento:"+tipoMovimento);
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        var i;
                        for(i in res){
                            if(res[i].tipoMov == tipoMovimento){
                                        desenhaTabela(res[i]);
                            }
                        }
                    }            
                }; 
            xmlHttpTwo.open("GET", "http://localhost:7777/api/cheques", true);
            xmlHttpTwo.send();
        });        
    });
    $(function() {
        $("#procuraValor").click(function(){
            console.log("aqui");
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        desenhaTabela(res); 
                    }
                }; 
            var numCheque = parseInt($("#numeroCheque").val());
            xmlHttpTwo.open("GET", "http://localhost:7777/api/cheques/"+numCheque, true);
            xmlHttpTwo.send();
        });        
    });
    function desenhaTabela(response){
        $(tableOne).find('tbody')
            .append($('<tr><td>'+response.numero+'</td><td>'
                +response.valor+'</td><td>'
                +response.saldo+'</td><td>'
                +response.data+'</td></tr>'));
    }
    $(function() {
        $("#limparTabela").click(function(){
            $("#tableOne tbody tr").remove();
        });
    });
})();