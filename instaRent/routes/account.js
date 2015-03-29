var express = require('express'),
    router = express.Router(),
    AccountController = require('../methods/account.js'),
    UserRegistration = require('../models/user-registration.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js'),
    ApiResponse = require('../models/api-response.js'),
    //UserPasswordReset = require('../models/user-pwd-reset.js'),
    //UserPasswordResetFinal = require('../models/user-pwd-reset-final.js'),
    session = [];
	
	
	UserProfileModel = require('../models/user-profile.js');
	crypto = require('crypto');
    uuid = require('node-uuid');
	
	
	
	router.route('/account/register').post(function (req, res) { 
	/*router.post('/account/register',function (req, res) {*/
	var me = this;
    console.log("received password: "+req.body.password +" "+ req.body.passwordConfirm);
    if (req.body.password !== req.body.passwordConfirm) {
		console.log("inside getUser pass mismatch");
        res.send({ success: false, extras: { msg: 10 } });
    }

    var passwordSaltIn = uuid.v4(),
            cryptoIterations = 10, // Must match iterations used in controller#hashPassword.
            cryptoKeyLen = 8,       // Must match keyLen used in controller#hashPassword.
            passwordHashIn;

    var newUser =new User ({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName:  req.body.lastName,
		phoneNo:   req.body.phone,
		foreignId:  "",
		role:      "",
        isVerified: false,
        passwordHash: crypto.pbkdf2Sync(req.body.password, passwordSaltIn, cryptoIterations, cryptoKeyLen),
        passwordSalt: passwordSaltIn
    });
	
	
	//////////////////////
	
	User.findOne({ email: newUser.email }, function (err, user) {

        if (err) {
           /* return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } }));*/
		   res.send({ success: false, extras: { msg: 2} });
        }

        if (user) {
            /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.EMAIL_ALREADY_EXISTS } }));*/
			res.send({ success: false, extras: { msg: 4 } });
        } else {

            newUser.save(function (err, user, numberAffected) {

                if (err) {
                    /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } })); */
					console.log(err);
					res.send({ success: false, extras: { msg: 2 }});
                }
                    
                if (numberAffected === 1) {

                    var userProfileModel = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
						phoneNo: user.phoneNo,
						role: user.role,
                        isVerified: user.isVerified,
						foreignId: user.foreignId
                    };
					console.log("user profile model created in register: verify: "+userProfileModel.isVerified+" foreignId: "+userProfileModel.foreignId + " Name: "+  userProfileModel.firstName );
                    res.send({success: true, extras: {userProfileModel: userProfileModel}});
				}
				else {
					     res.send({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_USER } });
				     }
         
            });
		}
	});
  });	
	
	router.route('/account/logon')

    .post(function (req, res) {

        var accountController = new AccountController(User, req.session);

        var userLogon = new UserLogon(req.body);
        console.log("userLogon: "+userLogon.email+" "+userLogon.password)
        accountController.logon(userLogon.email, userLogon.password, res);
            
            
    });
	
	module.exports = router;
   