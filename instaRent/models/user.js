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
 //var query={email:useremail};
 //var update={phoneNo:newphone};
// var options={new:true};
 User.findOneAndUpdate({email:useremail},{phoneNo:newphone,firstName:newfname,lastName:newlname},{},function(err,numAffected, raw){
    // changed by Amy here, send response back to settings page
    if(err) res.status(409).send("Error,Could not find user");
    else  res.send("Success");
 });

 User.findById('5535460110148d5866253d80',function(err,people){
   console.log(people);
 });

 /*
  User.findById('5535460110148d5866253d80',function(err,people){
    console.log(newphone);
    console.log(newfname);
    console.log(newlname);
    if(err)
    return console.error(err);
    //console.dir(people);
    //people.firstName=user.firstName;
    //people.lastName=user.lastName;
    //people.phoneNo=user.phoneNo;
    console.dir("!!!!");
    people.update({phoneNo:newphone}).exec();
    console.log(people);
  });

  */

}
  
function getUserByPhoneNo(phoneNo, callback) {
    User.findOne({phoneNo: phoneNo}, callback);
}

function getUserByEmail(email,callback){
    User.findOne({email:email},callback);
}

exports.User=User;
exports.update=update;
exports.getUserByPhoneNo = getUserByPhoneNo;
