//console.log("In mailHandler");
var verificationToken = require("../models/verification_token_schema");
var invitationHandler = require("../models/invitation_schema");

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

function sendInvitationEmail(err, mailer, homeAddress, data) {
    if(err)
        console.log("Error in inviting user!: " + err);
    else {
        mailer.send("invitation mail.html", {
            to: data.emailId,
            subject: "You have been added to instaRent!",
            otherProperty: {homeAddress: homeAddress, invitationLink: "http://127.0.0.1:3000/users/confirmHouse/" + data._id }
        }, function (err) {
            if(err) {
                console.log("There was an error sending invitation email to users: " + err);
            }
        })
    }
}

function sendInvitation(mailer, emailId, userType, homeId, homeAddress) {
	console.log("In sendAccountConfirmationMail");
	var InvitationObject = new invitationHandler.InvitationModel({emailId: emailId, userType: userType, _homeId: homeId});
    InvitationObject.createInvitation(mailer, homeAddress, sendInvitationEmail);
}

exports.sendMail = sendMail;
exports.sendAccountConfirmationMail = sendAccountConfirmationMail;
exports.sendInvitation = sendInvitation;
//exports.sendAccountConfirmationMail = sendAccountConfirmationMail;