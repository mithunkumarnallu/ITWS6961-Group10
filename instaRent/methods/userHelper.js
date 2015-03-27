userHelper = function() {};

userHelper.prototype.getUserId = function(data) {
	return "123456";
};

userHelper.prototype.setDefaultHome = function(userId, homeInfo) {
	//Set the home id and user type in the user related database
	return {status: "Success", response : {}};
};

module.exports = userHelper;