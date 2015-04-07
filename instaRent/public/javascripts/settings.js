$(document).ready(function update_profile() {
	console.log("update_profile outside");
	$('#update_profile').submit(function() {
		console.log("update_profile");
		var $first_name=$("#first_name");
		var $last_name=$("#last_name");
		//var $email=$("#email"); no eamil in new json data?
		var $phone=$("#number");

		var firstName=$first_name.val().trim();
		var lastName=$last_name.val().trim();
		//var email=$email.val().trim();
		var phone=$phone.val().trim();

		console.log(firstName, lastName, phone);

		$.ajax({
			type: 'POST',
			url: "/api/account/update",  // needed changes in account.js file, not done yet
			data: "&firstName=" + firstName + "&lastName=" +lastName + "&phone=" + phone,
			//dataType: "jsonp",
			success: function(resp) {
				if(resp.success==true) {
					console.log("response success");
					alert("Updated successfully!");
				}
				else if (resp.extras.msg) {
					switch (resp.extras.msg) {
						case 2:
						case 5:
						console.log("Oops! BookIt had a problem and could not update.  Please try again in a few minutes.");
						break;
						// ? case 4
					}
				}
				else console.log("unsuccessful update HTTP response");
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