var UserProfileModel = function(cnf) {
    this.email = cnf.email,
    this.firstName = cnf.firstName,
    this.lastName = cnf.lastName,
	this.phoneNo=cnf.phoneNo
	this.foreignId=cnf.foreignId,
	this.role=cnf.role
};

module.exports = UserProfileModel;