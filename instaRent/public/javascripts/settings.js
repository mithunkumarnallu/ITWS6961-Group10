var email;
$(document).ready(function update_profile() {
	 $.get('/settings/getEmail',{},function(res){
		    email=res.email;
	});
	console.log("update_profile outside");
	$('#update_profile').bootstrapValidator({
		feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
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
			number: {
                validators: {
                    notEmpty: {
                        message: 'The phone number is required and cannot be empty'
                    },
                    phone: {
                        message: 'The input is not a valid phone number'
                    }
                }
            }
		}
	});
});

function updateProfile() {
    console.log("update_profile");
    //console.log($("#getemail").text());

    var $first_name=$("#first_name");
    var $last_name=$("#last_name");
    var $phone=$("#number");
    var firstName=$first_name.val().trim();
    var lastName=$last_name.val().trim();
    var phone=$phone.val().trim();
    console.log(email,firstName, lastName, phone);
    $.ajax({
        type: 'POST',
        url: "/settings/changeuserprofile",  // needed changes in account.js file, not done yet
        data: {
            email:email,
            firstName:firstName,
            lastName:lastName,
            phoneNo:phone
        },
        //dataType: "jsonp",
        success: function(res) {
            //console.log('!!!!');
            console.log(res);
            // ========= changed by Amy here===========
            // the response from server is Success here instead of user json data
            if(res =="Success") {
                console.log("response success");
                alert("Updated successfully!");
            }
        },
        error: function(xhr, textStatus, err) {
            console.log("error log");
            console.log("readyState: " + xhr.readyState);
            console.log("responseText: "+ xhr.responseText);
            console.log("status: " + xhr.status);
            console.log("text status: " + textStatus);
            console.log("error: " + err);
        }
    });
}