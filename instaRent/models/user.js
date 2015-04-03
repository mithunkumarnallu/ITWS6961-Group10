var mongoose = require('./mongoose_connector').mongoose;
var Schema = mongoose.Schema;
var UserSchema = new Schema({
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
 
module.exports = mongoose.model('User', UserSchema);