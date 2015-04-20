$(document).ready(function update_profile() {
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

	$('#update_profile').submit(function() {
		console.log("update_profile");
		var $first_name=$("#first_name");
		var $last_name=$("#last_name");
		var $email=$("#getemail").val(); //no eamil in new json data?
		var $phone=$("#number");

		var firstName=$first_name.val().trim();
		var lastName=$last_name.val().trim();
		var email=$email;
		//var email=$email.val().trim();
		var phone=$phone.val().trim();

		console.log(firstName, lastName, phone);

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
			success: function(resp) {
				if(resp=="Success") {
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
	});
});
