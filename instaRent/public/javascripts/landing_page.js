$(document).ready(function fetch()
{
    var container=[];
    var names=[];
   $.ajax(
		{    
		    type: 'POST',
			url: "/api/account/fetch_reviews",
			success: function(resp){ 
               console.log("carousel ajax success");
                var i=0;
               for(var key in resp)
               {
                   if(resp.hasOwnProperty(key))
                   {
                      container[i]=' "'+resp[key].comment+'"';
                      names[i]="-"+resp[key].name; 
                       console.log("container: "+container[i]);
                       i++;
                   }
               }
                
                document.getElementById("c_one").innerText=container[0];
                document.getElementById("c_two").innerText=container[1];
                document.getElementById("c_three").innerText=container[2];
                document.getElementById("c_four").innerText=container[3];
                
                document.getElementById("c_one_name").innerText=names[0];
                document.getElementById("c_two_name").innerText=names[1];
                document.getElementById("c_three_name").innerText=names[2];
                document.getElementById("c_four_name").innerText=names[3];
                
                
            },
            error: function(xhr,textStatus,err){ 
			    
				console.log("review error log");
			}
	  
       });
 });
