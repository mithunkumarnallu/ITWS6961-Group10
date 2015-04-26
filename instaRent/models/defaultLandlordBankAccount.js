var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var Schema = mongoose.Schema;

var defaultBankAcc = new Schema({
    userId:String,
    token:String,
    homeID:String,
    defaultBankAcc:String
});

var DefaultBankAcc = mongoose.model('defaultBankAcc', defaultBankAcc);

function checkandsave(details){

    DefaultBankAcc.findOne({userId: details.userId, homeID:details.homeID}, function (err, data) {

        if(data){
            console.log("Already Exists default Bank Acc");
        }
        else {

            newDetails = new DefaultBankAcc(details);
            newDetails.save(function (err, Details) {

            });
        }

    });
}

function saveDefaultBankAcc(landlordemail,defaultBankAcc,homeID,token,callback){
    DefaultBankAcc.update({userId:landlordemail,homeID:homeID},{$set:{defaultBankAcc:defaultBankAcc,token:token}}, function (err, data) {
        if(err)
            callback(err);

        else{
           callback(err,"success");
        }

    });
}

function getDefaultToken(email,homeID,callback){

    DefaultBankAcc.findOne({userId:email,homeID:homeID}, function (err, data) {
        if(err)
            callback(err);

        else if(!data)
            callback(err);

        else{
            callback(err,data.token);
        }
    });
}
exports.DefaultBankAcc = DefaultBankAcc;
exports.saveDefaultBankAcc = saveDefaultBankAcc;
exports.checkandsave = checkandsave;
exports.getDefaultToken=getDefaultToken;