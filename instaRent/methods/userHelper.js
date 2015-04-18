User = require('../models/user.js').User


userHelper = function() {};

userHelper.prototype.getUserId = function(data) {

    console.log("returning userId: "+data.session.passport.user.email);
	return data.session.passport.user.email;

};

userHelper.prototype.getTenantName = function(data,callback){

    User.findOne({email:data},function(err,data){

        if(err)
            console.log("Cannot find the user" + err);
        else {
            var fullname = data.firstName + " " + data.lastName;
            callback(null,fullname);
        }
    });
}

userHelper.prototype.isUserLoggedIn = function(data) {
    return data.session.passport;
};

userHelper.prototype.setDefaultHome = function(userId, homeInfo) {
	//Set the home id and user type in the user related database

    User.update({email: userId}, {role: homeInfo.userType, foreignId: homeInfo.id},{},function(err,numberAffected){
        if(err)
            console.log("setDefaultHome database update error" + err);
        else
        {
            console.log("setDefaultHome: numberAffected: "+numberAffected);
        }
    });
};

userHelper.prototype.getDefaultHome = function (userId, res, callback) {
	User.findOne({email: userId}, function (err, data) {
        if(err)
            callback(err);
        else if(!data.foreignId) {
            res.redirect("/manageHome");
        }
        else
            callback(err, data.foreignId);
    });
}

userHelper.prototype.getUserType = function (req) {
    return req.session.passport.user.role;
};


userHelper.prototype.getUserInfo=function(data, email, userIds, callback){
    if(userIds) {
        User.find({$or: userIds}, callback);
    }
    else if(email) {
        User.findOne({email: email}, function (err, data) {
            if(err || !data)
                callback(err);
            else
                callback(err, data);
        });
    }
    else {
        var firstName = data.session.passport.user.firstName;
        var lastName = data.session.passport.user.lastName;
        var email = data.session.passport.user.email;
        var phoneNo = data.session.passport.user.phoneNo;
        var userInfo = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNo: phoneNo
        };
        return userInfo;
        //var userInfoJsonParse = [];
        //userInfoJsonParse = JSON.parse(userInfo);
        //return userInfoJsonParse;
    }
};

userHelper.prototype.SetQRSession = function(req, user)  {
    req.session.passport.user = {};
    req.session.passport.user.email=user.email;
    req.session.passport.user.firstName=user.firstName;
    req.session.passport.user.lastName=user.lastName;
    req.session.passport.user.phoneNo=user.phoneNo;
    req.session.passport.user.foreignId=user.foreignId;
    req.session.passport.user.isVerified=user.isVerified;
    req.session.passport.user.role=user.role;
    req.session.passport.user.address=user.address;
    req.session.passport.user.facebook_id=user.facebook_id;
    req.session.passport.user.facebook_token=user.facebook_token;
    req.session.passport.user.google_id=user.google_id;
    req.session.passport.user.google_token=user.google_token;
    return true;
};

module.exports = userHelper;
