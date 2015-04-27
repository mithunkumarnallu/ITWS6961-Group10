var mailer = require("../methods/mailerHandler");
var invitationHandler = require("../models/invitation_schema");

var userHelper = require("./userHelper");
userHelper = new userHelper();

var AccountController = function (userModel, session, req) {

    this.crypto = require('crypto');
    this.uuid = require('node-uuid');
    this.ApiResponse = require('../models/api-response.js');
    this.ApiMessages = require('../models/api-messages.js');
    this.UserProfileModel = require('../models/user-profile.js');
    this.userModel = userModel;
    this.session = session;
    //this.mailer = mailer;
	this.User = require('../models/user.js').User;
};

AccountController.prototype.getSession = function () {
    return this.session;
};

AccountController.prototype.setSession = function (session) {
    this.session = session;
}

AccountController.prototype.hashPassword = function (password, salt, callback) {
    // We use pbkdf2 to hash and iterate 10 times by default
    var iterations = 10,
        keyLen = 8; // 8 bit.
    this.crypto.pbkdf2(password, salt, iterations, keyLen, callback);
};


AccountController.prototype.logon = function(email, password,req,res) {

    var me = this;

    me.userModel.findOne({ email: email }, function (err, user) {

        if (err) {
            /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } }));*/
			res.send({ success: false, extras: { msg: me.ApiMessages.DB_ERROR }});
        }

        if (user) {
               console.log("sent password: "+password);
               me.hashPassword(password, user.passwordSalt, function (err, passwordHash) {
               console.log("passwords: "+passwordHash+" "+user.passwordHash);
                if (passwordHash == user.passwordHash) {
                   console.log("logon password match");
                    var userProfileModel = new me.UserProfileModel({
                         _id:   user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
						            phoneNo: user.phoneNo,
						            role: user.role,
                        isVerified: user.isVerified,
						            foreignId: user.foreignId,
                        facebook_id: user.facebook_id,
                        address:user.address,
                        facebook_token: user.facebook_token,
                        google_id:user.google_id,
                        google_token: user.google_token
                    });
                    userHelper.SetQRSession(req,user);

                    //me.session.passport.user = userProfileModel;
					me.session.id = me.uuid.v4();
                    //me.session.cookie={userId: user.email};
					//console.log("session: Phone: "+userProfileModel.phoneNo+" foreignId: "+userProfileModel.foreignId );

                    //Add any outstanding homes of the user to his/her home collection
                    invitationHandler.addUserToHome(user.email);

                    console.log("logon ajax res.send");
                     res.send(
					     {success: true, extras: { userProfileModel:userProfileModel, sessionId: me.session.id }});
                    /* return callback(err, new me.ApiResponse({
                        success: true, extras: {
                            userProfileModel:userProfileModel,
							sessionId: me.session.id

                        }
                    })); */
                } else {
					console.log("logon password mismatch");
                    /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.INVALID_PWD } }));*/
					res.send({ success: false, extras: { msg: me.ApiMessages.INVALID_PWD } });
                }
            });
        } else {
            /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.EMAIL_NOT_FOUND } }));*/
			console.log("logon email not found");
			res.send({ success: false, extras: { msg: me.ApiMessages.EMAIL_NOT_FOUND } });
        }

    });
};

AccountController.prototype.logoff = function () {
    console.log("inside logoff method");
    if (this.session.passport) delete this.session.passport;
    if(this.session.id) delete this.session.id;
    return;
};


//verify password function
AccountController.prototype.verifyoldpassword=function(email,password,req,res){
    var me=this;
    var ismatched=false;
    me.userModel.findOne({email:email},function(err,user){
      if(err){
        //res.send an object
        res.send({success:false,extras:{msg: me.ApiMessages.DB_ERROR}});
      }
      else{
        console.log("This is the passed from client"+password);
        me.hashPassword(password,user.passwordSalt,function(err,passwordHash){
        console.log("passwords:"+passwordHash+" "+user.passwordHash);
          if(passwordHash==user.passwordHash){
              console.log("Your old password matched!!");
                ismatched=true;
          }
          else{
              console.log("Password incorrect, please type again!");
              res.send({success:false});
          }
        });

      }
    });
    return ismatched;


};




/*AccountController.prototype.register = function (newUser, res) {
    var me = this;
    me.userModel.findOne({ email: newUser.email }, function (err, user) {

        if (err) {

		   res.send({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } });
        }

        if (user) {

			res.send({ success: false, extras: { msg: me.ApiMessages.EMAIL_ALREADY_EXISTS } });
        } else {

            newUser.save(function (err, user, numberAffected) {

                if (err) {

					console.log(err);
					res.send({ success: false, extras: { msg: me.ApiMessages.DB_ERROR }});
                }

                if (numberAffected === 1) {

                    var userProfileModel = new me.UserProfileModel({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
						phoneNo: user.phoneNo,
						role: user.role,
						foreignId: user.foreignId
                    });


					return callback(err, new me.ApiResponse({
                        success: true, extras: {
                            userProfileModel: userProfileModel
                        }
                    }));

					console.log("Calling sendAccountConfirmationMail");
                    //Mithun's code to handle email confirmation
                    //mailer.sendAccountConfirmationMail(res, newUser);

                    console.log("user profile model created in register: Phone: "+userProfileModel.phoneNo+" foreignId: "+userProfileModel.foreignId );
					var obj = new me.ApiResponse({ success: true, extras: {userProfileModel: userProfileModel}});
					console.log("returning from register()");
					res.set("Access-Control-Allow-Origin", "*");
					var json_obj=JSON.stringify(obj);
					res.send(json_obj);
					/*res.send({success: true, extras: {
					userProfileModel: userProfileModel}});
                } else {
                    /*return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_USER } }));
					res.send({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_USER } });
                }

            });
        }

    });
};  */

/*AccountController.prototype.getUserFromUserRegistration = function(userRegistrationModel) {
    var me = this;
    console.log(userRegistrationModel.password +" "+ userRegistrationModel.passwordConfirm);
    if (userRegistrationModel.password !== userRegistrationModel.passwordConfirm) {
		console.log("inside getUser pass mismatch");
        return new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.PASSWORD_CONFIRM_MISMATCH } });
    }

    var passwordSaltIn = this.uuid.v4(),
            cryptoIterations = 10, // Must match iterations used in controller#hashPassword.
            cryptoKeyLen = 8,       // Must match keyLen used in controller#hashPassword.
            passwordHashIn;

    var user = new this.User({
        email: userRegistrationModel.email,
        firstName: userRegistrationModel.firstName,
        lastName:  userRegistrationModel.lastName,
		phoneNo:   userRegistrationModel.phoneNo,
		foreignId:  "",
		role:      "",
        passwordHash: this.crypto.pbkdf2Sync(userRegistrationModel.password, passwordSaltIn, cryptoIterations, cryptoKeyLen),
        passwordSalt: passwordSaltIn
    });

    return new me.ApiResponse({ success: true, extras: { user: user } });
}*/



module.exports = AccountController;
