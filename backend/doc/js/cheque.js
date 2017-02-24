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
            xmlHttpTwo.open("GET", "http://54.149.62.18:7777/api/cheques", true);
            xmlHttpTwo.send();
        });        
    });
    $(function() {
        $("#enviaCheque").click(function(){
            if (validateForm()){
                console.log("true");
                var xmlHttp = new XMLHttpRequest();
                var formElement = document.querySelector("#chequeInfo");
                var dataI=String($("#dataInicial").val());
                var formData = new FormData(formElement);
                dataI = parseInt(dataI.slice(0,4)+dataI.slice(5,7)+dataI.slice(8,10));
                formData.set("data",dataI);
                formData.append("saldo",0);
                formData.append("movId",0);
                var mov = $("#movimento").val();
                formData.append("tipoMov",mov);
                xmlHttp.onreadystatechange = function ()
                {
                    if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                    {                                                           
                        alert(xmlHttp.response);    
                    }
                }
                xmlHttp.open("POST", "http://54.149.62.18:7777/api/cheques");
                xmlHttp.send(formData);
            }else{console.log("false");}
        });        
    });
    function validateForm(){
        var val = $("#valorMovimento").val();
        if($("#numeroCheque").val()==""){
            alert("Deve colocar a discrição do movimento");
            return false;
        }else if(isNaN($("#valorMovimento").val()) || $("#valorMovimento").val()==""){
            alert("Deve colocar o valor do movimento");
            return false;
        }else if ($("#dataInicial").val()==""){
            alert("Deve colocar a data do movimento");
            return false;
        }
        else{
            return true;
        }
    }
    $(function() {
        $("#procuraNum").click(function(){
            limpaTabela();
            var tipoMovimento = $('#movimento').val();
            var numCheque = $("#numeroCheque").val();
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        var x;
                        var i=0;
                        if(res.length>=1){
                            for(x in res){
                                i++;
                            }
                            for(var z=i-1;z>=0;z--){
                                if(res[z].tipoMov == tipoMovimento || tipoMovimento == "todos"){
                                    desenhaTabela(res[z]);
                                }
                            }
                        }else if(!res.length){
                            desenhaTabela(res);
                        }
                    }            
                }; 
            if(numCheque!=""){
                xmlHttpTwo.open("GET", "http://54.149.62.18:7777/api/cheques/"+tipoMovimento+","+numCheque, true);
                xmlHttpTwo.send();
            }else if(numCheque==""){
                xmlHttpTwo.open("GET", "http://54.149.62.18:7777/api/cheques", true);
                xmlHttpTwo.send();
            }
            
        });        
    });
    $(function() {
        $("#procuraTodos").click(function(){
            var tipoMovimento = $('#movimento').val();
            limpaTabela();
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        var x;
                        var i=0;
                        if(res.length>=1){
                            for(x in res){
                                i++;
                            }
                            for(var z=i-1;z>=0;z--){
                                desenhaTabela(res[z]);
                            }
                        }
                    }
                }; 
            var numCheque = parseInt($("#numeroCheque").val());
            xmlHttpTwo.open("GET", "http://54.149.62.18:7777/api/cheques", true);
            xmlHttpTwo.send();
        });        
    });
    $(function() {
        $("#procuraValor").click(function(){
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
            xmlHttpTwo.open("GET", "http://54.149.62.18:7777/api/cheques/"+numCheque, true);
            xmlHttpTwo.send();
        });        
    });
    function desenhaTabela(response){
        var saldo = parseFloat(response.saldo).toFixed(2).toString();
        var data = response.data.toString();
        var data = data.slice(0,4)+"-"+data.slice(4,6)+"-"+data.slice(6,8);
        saldo = spliceSplit(saldo,-6,0,",");
        $(tableOne).find('tbody')
            .append($('<tr><td>'+response.numero+'</td><td>'
                +response.valor+'</td><td>'
                +saldo+'</td><td>'
                +data+'</td><td>'
                +response.tipoMov+'</td><td>'
                +response.movId+'<td></tr>'));
    }
    $(function(){
        $("#apagarMovimento").click(function(){
            var idMov=$("#numeroCheque").val();
            var xmlHttpTwo = new XMLHttpRequest();
                xmlHttpTwo.onreadystatechange = function ()
                {
                    if (xmlHttpTwo.readyState === 4 && xmlHttpTwo.status === 200)
                    {                                                           
                        var res= JSON.parse(xmlHttpTwo.responseText);
                        console.log(res); 
                    }
                }; 
            xmlHttpTwo.open("DELETE", "http://54.149.62.18:7777/api/cheques/"+idMov, true);
            xmlHttpTwo.send();
        })
    }); 
    $(function() {
        $("#limparTabela").click(function(){
            $("#tableOne tbody tr").remove();
        });
    });
    function spliceSplit(str, index, count, add) {
        var ar = str.split('');
        ar.splice(index, count, add);
        return ar.join('');
    }
    function limpaTabela(){
        $("#tableOne tbody tr").remove();
    }
})();