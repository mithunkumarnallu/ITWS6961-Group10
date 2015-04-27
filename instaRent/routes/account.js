var mailer = require("../methods/mailerHandler");
var verificationToken = require("../models/verification_token_schema");
var ReviewModel=require("../models/ReviewsModel");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

var express = require('express'),
    router = express.Router(),
    AccountController = require('../methods/account.js'),
    UserRegistration = require('../models/user-registration.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js').User,
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
        facebook_id:"",
        facebook_token:"",
        google_id:"",
        google_token:"",
        email: req.body.email,
        firstName: req.body.firstName,
        lastName:  req.body.lastName,
		phoneNo:   req.body.phone,
		foreignId:  "",
		role:      "",
        address: "",
        isVerified: false,
        passwordHash: crypto.pbkdf2Sync(req.body.password, passwordSaltIn, cryptoIterations, cryptoKeyLen),
        passwordSalt: passwordSaltIn
    });

	console.log("Hello");
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
						foreignId: user.foreignId,
                        address: user.address,
                        facebook_id:user.facebook_id,
                        facebook_token:user.facebook_token,
                        google_id:user.google_id,
                        google_token: user.google_token
                    };
					console.log("user profile model created in register: Phone: "+userProfileModel.phoneNo+" foreignId: "+userProfileModel.foreignId + " Name: "+  userProfileModel.firstName );
                    console.log(mailer.sendAccountConfirmationMail);
                    //Mithun's code to handle email confirmation
                    mailer.sendAccountConfirmationMail(req, res, newUser);
                    res.send({success: true, extras: {userProfileModel: userProfileModel}});
				}
				else {
					     res.send({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_USER } });
				     }

            });
		}
	});
  });

router.route('/account/logon').post(function (req, res) {

    var accountController = new AccountController(User, req.session, req);

    var userLogon = new UserLogon(req.body);
    console.log("userLogon: "+userLogon.email+" "+userLogon.password)
    accountController.logon(userLogon.email, userLogon.password, req, res);
    console.log("===================");
    console.log(res);
    console.log("===================");


});

router.route('/account/sendEmail').post(function(req,res){

});

router.route('/account/logoff').get(function(req,res){
  console.log("inside logoff router");
  var accountController=new AccountController(User, req.session, req);
  accountController.logoff();
  //res.redirect("/login");
    res.send({success: true});
});

router.route('/account/reset').post(function(req,res){
    console.log("inside '/verify/reset' route. email: "+req.session.email);
    if (req.body.password !== req.body.passwordConfirm) {
		console.log("inside getUser pass mismatch: "+req.body.password);
        res.send({ success: false, extras: { msg: 10 } });
    }

    var passwordSaltIn = uuid.v4(),
        cryptoIterations = 10, // Must match iterations used in controller#hashPassword.
        cryptoKeyLen = 8,       // Must match keyLen used in controller#hashPassword.
        passwordHashIn;

   User.update({email: req.session.email}, {passwordHash: crypto.pbkdf2Sync(req.body.password, passwordSaltIn, cryptoIterations, cryptoKeyLen), passwordSalt: passwordSaltIn},{},function(err,numberAffected){
        if(err)
            console.log("setDefaultHome database update error" + err);
        else
        {
            console.log("update password: numberAffected: "+numberAffected);
            res.send({success: true, extras: {msg: "Password Successfully reset"}});
        }
    });
});

router.get("/account/verify/:token", function (req, res, next) {
    console.log("inside verify route");
    var token = req.params.token;
    //req.session.email=req.params.id;
    console.log("req session email in /verify: "+req.session.email);
    //console.log("Verifying user user");
    verificationToken.verifyEmail(token, req.session.email, function(err) {
        console.log("printing err: "+err);
     if (err==null) {
         console.log("redirect to reset verify fail route");
       res.redirect("/reset_verify_fail");
     }
    else
    {
         console.log("redirect to forgot pwd route");
       res.redirect("/forgot_password_route");
    }
    });
});

router.route('/account/reviews').post(function(req,res){
   console.log("in reviews route"+req.session.passport.user.firstName+" "+req.body.comment);
   ReviewModel.SaveReview(req.session.passport.user.firstName+" "+req.session.passport.user.lastName, req.body.comment, function(err){
           console.log("review saved in db- frm route");
           res.send({success: true});

   });
});

router.route('/account/fetch_reviews').post(function(req,res){
   ReviewModel.ExtractReviews(function(data){
       res.send(data);
 });
});

//Access to the current logged in user's emailId to the front end
router.route("/account/getUserId").get(function(req, res) {
    if(userHelper.isUserLoggedIn(req)) {
        var userId = userHelper.getUserId(req);
        res.send(userId);
    }
    else
        res.redirect("/login");

});


module.exports = router;
