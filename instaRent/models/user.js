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
function update(user){
  console.log("here we are!");
  var query={email:user.email};
  var update={
    firstName:user.firstName,
    lastName:user.lastName,
    phoneNo:user.phoneNo
  };
  var options={new:true};
  User.findOneAndUpdate(query, update,options,function(err,person){
      if (err){
        console.log("got an error");
      }

      else{
        console.log("success yoyoyo!");
      }
  });
  /*User.findOne=({email:user.email},function(err, doc){
    doc.firstName=user.firstName;
    doc.lastName=user.lastName;
    doc.phoneNo=user.phoneNo;
    doc.visits.$inc();
    doc.save();
    */
  //});
};

function getUserByPhoneNo(phoneNo, callback) {
    User.findOne({phoneNo: phoneNo}, callback);
}

function getUserByEmail(email,callback){
    User.findOne({email:email},callback);
}

exports.User=User;
exports.update=update;
exports.getUserByPhoneNo = getUserByPhoneNo;
