var UserProfileModel = function(cnf) {
    this.email = cnf.email,
    this.firstName = cnf.firstName,
    this.lastName = cnf.lastName,
	this.phoneNo=cnf.phoneNo
	this.foreignId=cnf.foreignId,
    this.isVerified=cnf.isVerified,    
	this.role=cnf.role,
    this.facebook_id=cnf.facebook_id,
    this.facebook_token=cnf.facebook_token,
    this.google_id=cnf.google_id,
    this.google_token=cnf.google_token
};

module.exports = UserProfileModel;