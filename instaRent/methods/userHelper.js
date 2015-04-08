User = require('../models/user.js').User


userHelper = function() {};

userHelper.prototype.getUserId = function(data) {
    console.log("returning userId: "+data.session.passport.user.email);
	return data.session.passport.user.email;
};

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
            res.redirect("/login");
        }
        else
            callback(err, data.foreignId);
    });
}

userHelper.prototype.getUserType = function (req) {
    return req.session.passport.user.role;
};

userHelper.prototype.getUserInfo=function(data, email, callback){
    if(email) {
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



module.exports = userHelper;
