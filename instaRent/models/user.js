var mongoose = require('./mongoose_connector').mongoose;
var Schema = mongoose.Schema;
var UserSchema = new Schema({
 facebook_id: String,
 facebook_token: String,
 google_id: String,
 google_token: String,
 email: String,
 firstName: String,
 lastName: String,
 phoneNo: String,
 foreignId: String,
 role: String,
 isVerified: Boolean,
 passwordHash: String,
 passwordSalt: String
});

var User=mongoose.model('User',UserSchema);

////update the user info
function update(user,res){
  User.update({email:user.email,firstName:user.firstName, lastName: user.lastName,
  phoneNo: user.phoneNo},user,{},function(err,numEffected){
    if(err||numEffected==0)
      res.status(409).send("Error,Could not find user");
    else
    res.send("Success");
  });
};

function getUserByPhoneNo(phoneNo, callback) {
    User.findOne({phoneNo: phoneNo}, callback);
}

exports.User=User;
exports.update=update;
exports.getUserByPhoneNo = getUserByPhoneNo;