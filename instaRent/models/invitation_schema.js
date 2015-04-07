/**
 * Created by MithunKumar on 4/4/2015.
 */
var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;
var userModel = require("./user").User;
var mailHandler = require("../methods/mailerHandler");
var home = require("./home");

// Verification token model
var invitationSchema = new Schema({
    emailId: {type: String, required: true},
    userType: {type: String, required: true},
    _homeId: {type: String, required: true, ref: 'MoreHomeInfo'},
    createdAt: {type: Date, required: true, default: Date.now}
});

invitationSchema.methods.createInvitation = function (mailer, homeAddress, done) {
    var invitation = this;
    InvitationModel.findOne({emailId: this.emailId, _homeId: this._homeId}, function(err,data) {
        if(!err && !data) {
            invitation.save( function (err, data) {
                if (err)
                    return done(err);
                return done(null, mailer, homeAddress, data);
                console.log("create Invitation", invitation);
            });
        }
    });
};

function homeSaved(err, data) {
    if(err)
        console.log("Error in saving user to home: " + err);
}

var addUserToHome = function(emailId){

    InvitationModel.find({emailId: emailId}, function (err, data) {
        if(err) {
            console.log("Error in getting user info from verification schema: "+ err);
        }
        else {
            for(var i = 0; i < data.length; i++) {
                home.saveHome(new home.Home({userId: emailId, homeId: data[i]._homeId, userType: data[i].userType}), homeSaved);
                data[i].remove();
            }
        }
    });
};

var InvitationModel = mongoose.model('InvitationModel', invitationSchema);
exports.InvitationModel = InvitationModel;
exports.addUserToHome = addUserToHome;