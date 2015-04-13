$(document).ready(function register_logon()
{ 
  $('#logoff').click(function(){
      console.log("inside signoff.js");
        $.ajax(
		{    
		    type: 'GET',
			url: "/api/account/logoff",
            success: function(resp){
                console.log("inside signoff success");
                window.location.href="/login";
            },
            error: function(xhr,textStatus,err){ 
				console.log("signoff error log");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
            }
    });
 
   });
});