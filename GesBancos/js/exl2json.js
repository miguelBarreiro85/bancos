$(function(){
     $("#uploadFile").click(function(){
        
        var client = new XMLHttpRequest();
        var file = document.getElementById("searchFile");     
        /* Create a FormData instance */
        var formData = new FormData();
        /* Add the file */ 
        formData.append("upload", file.files[0]);
        client.open("post", "http://localhost:8080/api/file", true);
        client.send(formData);  /* Send to server */ 
             
           /* Check the response status */  
           client.onreadystatechange = function() 
           {
              if (client.readyState == 4 && client.status == 200) 
              {
                 alert(client.statusText);
              }
           }
     });
})
