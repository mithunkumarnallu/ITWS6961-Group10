$(document).ready(function register_logon()
{  console.log("register outside");
   /*$('#signup').on('submit', function()*/
   $('#signup').submit(function()
   {    console.log("register");
        var $first_name=$("#first_name");
		var $last_name=$("#last_name");
		var $email=$("#email");
		var $phone=$("#number");
		var $password=$("#password");
		var $passwordConfirm=$("#password_confirmation");
		
		var firstName=$first_name.val().trim();
		var lastName=$last_name.val().trim();
		var email=$email.val().trim();
		var phone=$phone.val().trim();
		var password=$password.val().trim();
		var passwordConfirm=$passwordConfirm.val().trim();
		
		/*$.post("/api/account/register", {email : email, firstName: firstName, lastName: lastName, phone: phone, password: password, passwordConfirm: passwordConfirm} ).done(function(resp) {
			console.log(resp.success);
			if(resp.success==true){
					console.log("response success");
					window.location.href="login.html";
				}
				else if (resp.extras.msg) {
                      switch (resp.extras.msg) {
                         case 2:
                         case 5:
                              console.log("Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.");
                              break;
                         case 4:
                              console.log("The email address that you provided is already registered.");
                              break;
                        }
				}
				else console.log("unsuccessful sign-up HTTP response ");	
		}); */
		
		$.ajax(
		{    
		    type: 'POST',
			url: "/api/account/register",
			data: "email=" + email + "&firstName=" + firstName + "&lastName=" +lastName + "&phone=" + phone + "&password=" + password + "&passwordConfirm=" + passwordConfirm,
			//dataType: "jsonp",
			success: function(resp){
				    console.log(resp.success);
				if(resp.success==true){
					console.log("response success");
					window.location.href="/login";
				}
				else if (resp.extras.msg) {
                      switch (resp.extras.msg) {
                         case 2:
                         case 5:
                              console.log("Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.");
                              break;
                         case 4:
                              console.log("The email address that you provided is already registered.");
                              break;
                        }
				}
				else console.log("unsuccessful sign-up HTTP response ");
			},
			error: function(xhr,textStatus,err){ 
			    window.location.href="/login";
				console.log("error log");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
				

			}	
		});

				
   });
   
   $('#loginform').submit(function()
   { console.log("logon");
	  var $email=$("#email");
	  var $password=$("#password");
	  
	  var email=$email.val().trim();
	  var password=$password.val().trim();
	  
	  $.ajax(
		{    
		    type: 'POST',
			url: "/api/account/logon",
			data: "email=" + email + "&password=" + password,
			//dataType: "jsonp",
			success: function(resp){
				    console.log("logon "+resp.success);
				if(resp.success==true){
					console.log("logon response success");
					window.location.href="/role-selection";
				}
				else if (resp.extras.msg) {
                      switch (resp.extras.msg) {
                         case 2:
                         case 5:
                              console.log("Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.");
                              break;
                         case 4:
                              console.log("The email address that you provided is already registered.");
                              break;
						 case 1: console.log("invalid password.");
						      break;
						 case 0: console.log("email not found.");
						      break;
                        }
				}
				else console.log("unsuccessful sign-up HTTP response ");
			},
			error: function(xhr,textStatus,err){ 
			    window.location.href="/role-selection";
				console.log("error log");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
			}	
		});
    });

});