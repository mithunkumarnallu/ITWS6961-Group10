var mongoose = require('./mongoose_connector').mongoose;
var crypto = require('crypto');
var uuid = require('node-uuid');
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
 address: String,
 isVerified: Boolean,
 passwordHash: String,
 passwordSalt: String
});

var User=mongoose.model('User',UserSchema);

////update the user info
function update(user, res){
 var useremail=user.email;
 var newphone=user.phoneNo;
 var newfname=user.firstName;
 var newlname=user.lastName;
 var stringemail=JSON.stringify(useremail);

 console.log("the new"+stringemail);
 User.findOneAndUpdate({email:useremail},{phoneNo:newphone,firstName:newfname,lastName:newlname},
   {},function(err,numAffected, raw){
    // changed by Amy here, send response back to settings page
    if(err)
      res.status(409).send("Error,Could not find user");
    else
      res.send("Success");
 });

/*=======================TEST HERE==============================
 User.findById('5535460110148d5866253d80',function(err,people){
   console.log(people);
 });
===============================================================*/

}

//here add the update password function to change the password//
function updatepassword(user, res){
    var useremail=user.email;
    var userpwd=user.password_conf;
    var passwordSaltIn = uuid.v4(),
        cryptoIterations = 10, // Must match iterations used in controller#hashPassword.
        cryptoKeyLen = 8,       // Must match keyLen used in controller#hashPassword.
        passwordHashIn;

    User.update({email: useremail}, {passwordHash: crypto.pbkdf2Sync(userpwd, passwordSaltIn, cryptoIterations, cryptoKeyLen), passwordSalt: passwordSaltIn},{},function(err,numberAffected){
         if(err)
             console.log("reset password error" + err);
         else
         {
             console.log("update password: numberAffected: "+numberAffected);
             //it will finally send the message to the front-end screen
             res.send("Success");
         }
     });

}

function getUserByPhoneNo(phoneNo, callback) {
    User.findOne({phoneNo: phoneNo}, callback);
}

function getUserByEmail(email,callback){
    User.findOne({email:email},callback);
}

exports.User=User;
exports.update=update;
exports.updatepassword=updatepassword;
exports.getUserByPhoneNo = getUserByPhoneNo;
