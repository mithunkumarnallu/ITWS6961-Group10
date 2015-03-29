userHelper = function() {};

userHelper.prototype.getUserId = function(data) {
	return "123456";
};

userHelper.prototype.setDefaultHome = function(userId, homeInfo) {
	//Set the home id and user type in the user related database
	return {status: "Success", response : {}};
};

userHelper.prototype.getDefaultHome = function (userId) {
	return "55147c99f627d4383a70f632";
}
module.exports = userHelper;