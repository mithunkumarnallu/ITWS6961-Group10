var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var Schema = mongoose.Schema;
var userModel = require("./user");

// Verification token model
var invitationSchema = new Schema({
    _homeId: {type: String, required: true, ref: 'MoreHomeInfo'},
    emailId: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now}
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
