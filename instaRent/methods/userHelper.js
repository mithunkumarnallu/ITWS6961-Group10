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

userHelper.prototype.getDefaultHome = function (userId) {
	return "55147c99f627d4383a70f632";
}


userHelper.prototype.getUserInfo=function(data){
  var firstName=data.session.passport.firstName;
  var lastName=data.session.passport.lastName;
  var email=data.session.passport.email;
  var phoneNo=data.session.passport.phoneNo;
  var userInfo= {
    firstName: firstName,
    lastName: lastName,
    email:email,
    phoneNo: phoneNo

  };
  var userInfoJsonParse=[];
  userInfoJsonParse=JSON.parse(userInfo);
  return userInfoJsonParse;
};



module.exports = userHelper;
