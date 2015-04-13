$(document).ready(function register_logon()
{  
    $('#signup').bootstrapValidator({
        container: '#messages',
       /* feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },*/
        fields: {
            first_name: {
                validators: {
                    notEmpty: {
                        message: 'The first name is required and cannot be empty'
                    }
                }
            },
            last_name: {
                validators: {
                    notEmpty: {
                        message: 'The last name is required and cannot be empty'
                    }
                    
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'The email address is required and cannot be empty'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty'
                    },
                    
                    stringLength: {
                        min: 5,
                        message: 'The password must be minimum 5 characters '
                    },
                    identical: {
                    field: 'password_confirmation',
                    message: 'The password and its confirm are not the same'
                }
              }
            },
            password_confirmation: {
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty'
                    },
                    stringLength: {
                        min: 5,
                        message: 'The password Confirmation must be minimum 5 characters'
                    },
                    identical: {
                    field: 'password',
                    message:''
                }
              }
            }
        }
    });
    
    $('#loginform').bootstrapValidator({
        container: '#messages',
      
        fields: {
    
            email: {
                validators: {
                    notEmpty: {
                        message: 'email is required'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: 'password cannot be empty'
                    }            
              }
            }
            
        }
    });    

   $('#signup').unbind('submit').submit(function(e)
   {    
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("signup clicked");
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
       if(password.length<5 || passwordConfirm.length<5 || firstName=='' || lastName==''||email=='')
       { return; }
        
		$.ajax(
		{    
		    type: 'POST',
			url: "/api/account/register",
            data:{email: email, firstName: firstName, lastName: lastName, phone: phone, password: password, passwordConfirm: passwordConfirm},
			success: function(resp){
				    console.log(resp.success);
				if(resp.success==true){
					console.log("response success");
					$("#signUpPanel").addClass("hide");
                    $("#confirmation").removeClass("hide");
				}
				else if (resp.extras.msg) {
                      switch (resp.extras.msg) {
                         case 2:
                         case 5:
                              console.log("Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.");  
                            document.getElementById("messages").innerText="Oops! There was an error. Please check-in later!"
                              break;
                         case 4:
                              console.log("The email address that you provided is already registered.");
                              document.getElementById("messages").innerText="The email address that you provided is already registered. Please Login if you already have an account";
                              break;
                        }
				}
				else console.log("unsuccessful sign-up HTTP response ");
			},
			error: function(xhr,textStatus,err){ 
			 
				console.log("error log");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
				

			}	
		}); 

				
   });
   
   $('#loginform').unbind('submit').submit(function()
   { 
      console.log("logon");
	  var $email=$("#email");
	  var $password=$("#password");
	  
	  var email=$email.val().trim();
	  var password=$password.val().trim();
    
      if(!email)
       {   console.log("empty email");
           document.getElementById("messages").innerText="Please enter email";
           return; 
       }
      if(password.length==0)
       {
         console.log(password.length+" empty password");
         return;
       }
	  
	  $.ajax(
		{    
		    type: 'POST',
			url: "/api/account/logon",
			data: { email: email, password: password },
			//dataType: "jsonp",
			success: function(resp){
				    console.log("logon "+resp.success);
				if(resp.success==true){
					console.log("logon response success");
                    if(resp.extras.userProfileModel.foreignId=='')
					     window.location.href="/managehome";
                    else
                    {
                        console.log("foreign id exists");
                        window.location.href="/dashboard";
                    }
				}
				else if (resp.extras.msg) {
                      switch (resp.extras.msg) {
                        case 11: console.log("email not found.");
                                document.getElementById("messages").innerText="Email entered is not registered"
						        break;
                         case 2:
                         case 5:
                              console.log("Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.");
                              document.getElementById("messages").innerText="Oops! There was an error. Please try later."
                              break;
                
						 case 1: console.log("invalid password.");
                              document.getElementById("messages").innerText="Password Entered is invalid"
						      break;
						 
                        }
				}
				else console.log("unsuccessful sign-up HTTP response "+resp.extras.msg);
			},
			error: function(xhr,textStatus,err){ 
			    
				console.log("error log");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
			}	
		});
    });
    
    $("#forgot_password").click(function(){
        $("#login_panel").addClass("hide");
        $("#submit_email").removeClass("hide");
        
    });
    
    $("#submit_email").unbind('submit').submit(function(){          //send ajax request with email for mailer verification
           //field to add email
        
        //code to send email
        var $email=$("#submitEmail");
        var email=$email.val().trim();
        if(email=='')
         { 
           console.log("empty email");
           document.getElementById("messages_submit").innerText="Please enter email";
           return; 
         }
        
        
        $.ajax(
		{    
		    type: 'POST',
			url: "/send_mail",
			data: { email: email},
			//dataType: "jsonp",
			success: function(resp){
				    console.log("/send_mail "+resp.success);
				if(resp.success==true){
                    
					console.log("send mail response success");
                    $("#submit_email").addClass("hide");
                    $("#send_email").removeClass("hide");  //panel to request user to check mail
                    //document.getElementById("messages_submit").innerText="Password has been reset";        
				}
				else if (resp.success==false) {
                   // document.getElementById("messages_submit").innerText="Error in resetting password";
                    console.log("reset response fail");  
				}
				else console.log("unsuccessful reset HTTP response ");
			},
			error: function(xhr,textStatus,err){ 
			    
				console.log("error log send_mail");
                console.log("readyState: " + xhr.readyState);
				console.log("responseText: "+ xhr.responseText);
				console.log("status: " + xhr.status);
				console.log("text status: " + textStatus);
				console.log("error: " + err);
			}	
		});
        
        
        
        
    });
    
    
    
    
    $('#resetform').unbind('submit').submit(function()
   { 
      console.log("reset password js");
      var $email=$("#emailForgot");  
        console.log("$email: "+$email);
	  var $password=$("#passwordForgot");
	  var $password_confirm=$("#passwordForgot_confirm");
        
	  var email=$email.val().trim();
	  var password=$password.val().trim();
	  var password_confirm=$password_confirm.val().trim();
        console.log("email: "+email);
    
      if(password=='' || password_confirm=='')
       {   console.log("empty pass");
           document.getElementById("messages").innerText="Please enter a value first";
           return; 
       }
      if(password!=password_confirm)
       {
         console.log("password mismatch");
         document.getElementById("messages").innerText="Passwords entered do not match";
         return;
       }
	  
	  $.ajax(
		{    
		    type: 'POST',
			url: "/api/account/reset",
			data: { email: email, password: password, passwordConfirm: password_confirm },
			//dataType: "jsonp",
			success: function(resp){
				    console.log("reset "+resp.success);
				if(resp.success==true){
					console.log("reset response success");
                    document.getElementById("messages_correct").innerText="Password has been reset";  
                    $("#okay").removeClass("hide");
                    $("#reset").addClass("hide");
                    $("#messages").addClass("hide");
				}
				else if (resp.success==false) {
                    document.getElementById("messages").innerText="Error in resetting password";
                    console.log("reset response fail");  
				}
				else console.log("unsuccessful reset HTTP response ");
			},
			error: function(xhr,textStatus,err){ 
			 
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
    