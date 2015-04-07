$(document).ready(function update_password() {
	console.log("update_password outside");
	$('#update_password').submit(function() {
		console.log("update_password");
		var $password=$("#password");
		var $password_new=$("#password_new");
		var $password_conf=$("#password_conf");

		var password=$password.val().trim();
		var password_new=$password_new.val().trim();
		var password_conf=$password_conf.val().trim();

		console.log(password, password_new, password_conf);

		$.ajax({
			type: 'POST',
			url: "/api/account/update_password",  // needed changes in account.js file, not done yet
			data: "&password=" + password + "&password_new=" +password_new + "&password_conf=" + password_conf,
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