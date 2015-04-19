/**
 * Created by MithunKumar on 4/18/2015.
 */
var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;
var user = require("../models/user");

//login token model
var LoginTokenSchema = new Schema({
    token: {type: String, required: true},
    phoneNo: String,
    isLoggedIn: Boolean,
    createdAt: {type: Date, required: true, default: Date.now, expires: '4h'}
});

LoginTokenSchema.methods.createLoginToken = function (done) {
    var loginToken = this;
    var token = uuid.v4();
    loginToken.set('token', token);
    loginToken.save( function (err) {
        if (err)
            return done(err);
        console.log("login Token", loginToken);
        return done(null, token);
    });
};

LoginTokenSchema.methods.updateLoginToken = function (done) {
    var loginToken = this;
    loginToken.set('token', token);
    loginToken.save( function (err) {
        if (err)
            return done(err);
        console.log("login Token", loginToken);
        return done(null, token);
    });
};

function setLoginToken(token, phoneNo, callback) {
    user.User.findOne({phoneNo: phoneNo}, function(err, data) {
       if(err || !data) {
            console.log("Phone number not registered")
            return callback("Phone number not registered!");
       }
       else {
           LoginTokenModel.update({token: token},{phoneNo: phoneNo, isLoggedIn: true}, {}, callback);
       }
    });

};

function getLoginToken(token, callback) {
    LoginTokenModel.findOne({token: token}, callback);
};

var LoginTokenModel = mongoose.model('LoginToken', LoginTokenSchema);
exports.LoginTokenModel = LoginTokenModel;
exports.setLoginToken = setLoginToken;
exports.getLoginToken = getLoginToken;