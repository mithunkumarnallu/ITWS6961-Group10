//console.log("In mailHandler");
var verificationToken = require("../models/verification_token_schema");

function sendMail(res) {
	console.log(res.mailer.send);
	
	res.mailer.send('confirmation mail.html', {
	    to: "mithunkumarnallu@gmail.com", // REQUIRED. This can be a comma delimited string just like a normal email to field. 
	    subject: 'instaRent Account confirmation', // REQUIRED.
	    otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
  	}, function (err) {
		if (err) {
			// handle error
			console.log(err);
			('There was an error sending the email');
			return;
		}
		res.send('Email Sent');
	});
};

function sendAccountConfirmationMail(req, res, user) {
	console.log("In sendAccountConfirmationMail");
	var VerificationTokenObj = new verificationToken.verificationTokenModel({_userId: user._id});
	VerificationTokenObj.createVerificationToken(function (err, token) {
	    if (err) 
	    	return console.log("Couldn't create verification token", err);
	    res.mailer.send('confirmation mail.html', {
		    to: user.email, // REQUIRED. This can be a comma delimited string just like a normal email to field. 
		    subject: 'instaRent Account confirmation', // REQUIRED.
		    otherProperty: {user: user, verificationLink: req.protocol + "://" + req.get('host') + "/users/verify/" + token} // All additional properties are also passed to the template as local variables.
		}, function (err) {
		    if (err) {
		      // handle error
		      console.log(err);
		      return 'There was an error sending the email';
		    }
		    return 'Email Sent';
		});	
	});
};

	

exports.sendMail = sendMail;
exports.sendAccountConfirmationMail = sendAccountConfirmationMail;

//exports.sendAccountConfirmationMail = sendAccountConfirmationMail;