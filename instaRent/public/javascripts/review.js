$(document).ready(function reviews()
{ 
    var container={};
    $('#reviewform').unbind('submit').submit(function(e)
    {
      console.log("in reviews.js");
	  var $comment=$("#comment");
	  var comment=$comment.val().trim();
      
      if(comment=='')
      {
         console.log("empty review");
         return;
      }
     
       $.ajax(
		{    
		    type: 'POST',
			url: "/api/account/reviews",
			data: { comment: comment},
			success: function(resp){ 
               console.log("review ajax success");
               window.location.href="/reviews_success"
            },
            error: function(xhr,textStatus,err){ 
			    
				console.log("review error log");
			}
	  
       });
    });
});