var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;
var userModel = require("./user");

// Verification token model
var verificationTokenSchema = new Schema({
    _userId: {type: String, required: true, ref: 'User'},
    token: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: '4h'}
});

verificationTokenSchema.methods.createVerificationToken = function (done) {
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
        if (err) return done(err);
        return done(null, token);
        console.log("Verification token", verificationToken);
    });
};

exports.verifyUser = function(token, done) {
    VerificationTokenModel.findOne({token: token}, function (err, doc){
        if (err) 
        	return done(err);
        //return done();
        
        userModel.findOne({_id: doc._userId}, function (err, user) {
            if (err)
            {
            	console.log(err);
            	return done(err);
            } 
            user.isVerified = true;
            
            user.save(function(err) {
                console.log("Verified user");
                done(err);
            })
        })
    })
};

var VerificationTokenModel = mongoose.model('VerificationToken', verificationTokenSchema);
exports.verificationTokenModel = VerificationTokenModel;