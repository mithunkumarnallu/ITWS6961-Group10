//console.log("In mailHandler");
var verificationToken = require("../models/verification_token_schema");
var invitationHandler = require("../models/invitation_schema");
var homeHandler = require("../models/home");
var moreHomeHandler = require("../models/more_home_info");

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
        });
    }
}

function sendInvitation(mailer, emailId, userType, homeId, homeAddress) {
	console.log("In sendAccountConfirmationMail");
    homeHandler.isHomeAddedToUser(emailId, homeId, function(emailId, homeId) {
        var InvitationObject = new invitationHandler.InvitationModel({emailId: emailId, userType: userType, _homeId: homeId});
        InvitationObject.createInvitation(mailer, homeAddress, sendInvitationEmail);
    });
}

function sendPaymentConfirmationLandlord(res,landlordEmail,amount,address,tenantName,bankAcc){

var lastFourdigits = bankAcc.substring(bankAcc.length-4);

    res.mailer.send('landlord_payment_recieved.html', {
        to: landlordEmail, // REQUIRED. This can be a comma delimited string just like a normal email to field.
        subject: 'Rent Payment Confirmation', // REQUIRED.
        otherProperty: {landlordEmail:landlordEmail,rent:amount,add:address,tenantname:tenantName,bankAcc:lastFourdigits} // All additional properties are also passed to the template as local variables.
    }, function (err) {
        if (err) {
            // handle error
            console.log(err);
            return;
        }
        res.send('Email Sent to the Landlord for Rent confirmation');
    });

}
//Function to send rent due notifications to all users who need to pay rent in less than 7 days
function sendRentDueNotifications(mailer) {
    var allHomes = moreHomeHandler.MoreHomeInfo.find();
    allHomes.$where(function() {
        if(this.leaseStartDate && this.leaseEndDate) {

            function daysInMonth(month, year) {
                return new Date(year, month, 0).getDate();
            }

            var d = new Date();
            var rentDueIn;

            if (d.getMonth() == this.leaseStartDate.getMonth())
                rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - this.leaseStartDate.getDate();
            else if (d.getMonth() == this.leaseEndDate.getMonth())
                rentDueIn = this.leaseEndDate.getDate() - d.getDate();
            else
                rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - d.getDate();

            return rentDueIn <= 7;
        }
        else
            return false;
    });
    allHomes.exec(function(err, data) {
        if(err)
            console.log("Error: Failed to fetch homes with rent dues in next 7 days. Err: " + err);
        else {
            data.forEach(function(homeDetails) {
                homeHandler.getUserIdsForAHome(homeDetails._id, "Tenant", function(err, users) {
                    if(err)
                        console.log("Error: Could not fetch tenants for home with id: " + homeDetails._id + ". " + err);
                    else {
                        for(var j = 0; j < users.length; j++) {
                            mailer.send("rentDueInMail.html", {
                                to: users[j].userId,
                                subject: "Remember, your rent is due this week!",
                                otherProperty: {address: homeDetails.address, loginLink: "http://127.0.0.1:3000/login",
                                    rentDueIn: moreHomeHandler.getRentDueIn(homeDetails.leaseStartDate, homeDetails.leaseEndDate).rentDueIn}
                            }, function (err) {
                                if(err) {
                                    console.log("There was an error sending rent due notification email to users: " + err);
                                }
                            });
                        }
                    }
                })
            });
        }
    });
}

exports.sendMail = sendMail;
exports.sendAccountConfirmationMail = sendAccountConfirmationMail;
exports.sendInvitation = sendInvitation;
exports.sendRentDueNotifications = sendRentDueNotifications;
exports.sendPaymentConfirmationLandlord = sendPaymentConfirmationLandlord;
//exports.sendAccountConfirmationMail = sendAccountConfirmationMail;