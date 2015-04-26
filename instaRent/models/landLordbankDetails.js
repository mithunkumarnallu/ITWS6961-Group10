var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var Schema = mongoose.Schema;


var LandLordBankDetails = new Schema({
    userId:String,
    bankAcc:String,
    routingNo:String,
    token:String,
    firstName:String,
    lastName:String,
    homeID:String,
    defaultBankAcc:String
});

var landlordBankDetails = mongoose.model('landLordBankDetails', LandLordBankDetails);

function checkBankDetailsAndSave(landlordDetails,req,res,overwrite) {
    console.log("Request Bank acc " + req.body.accNo);
    var userId = userHelper.getUserId(req);
    landlordBankDetails.findOne({userId: landlordDetails.userId}, function (err, data) {

        if (err)
            res.status(409).send("Error: Adding Bank account");
        else if (data && !overwrite) {
            res.status(409).send("Error: Bank account already exists");
        }
        else if (data && data.userId == userId && data.bankAcc == req.body.accNo) {

            res.status(409).send("Error: Bank account already exists");
        }

        else {
            landlordDetails = new landlordBankDetails(landlordDetails);

            landlordDetails.save(function (err, landlordDetails) {
                if (err)
                    res.status(409).send("Error: Adding Bank account");
                else {
                    res.send("successfully added Bank account");
                }

            });
        }
    });
}
    function getBankAccNo(landlordemail,callback){
        landlordBankDetails.findOne({userId:landlordemail}, function (err, data) {
                if(err)
                    callback(err);
                else if(!data){
                    callback(err);
                }
                 else{
                    callback(err,data.bankAcc);
                 }
        });
    }

    function getTokenNo(landlordemail,homeID,bankAcc,callback){
            var result;
        landlordBankDetails.findOne({userId:landlordemail,homeID:homeID,bankAcc:bankAcc}, function (err, data) {
            if(err)
                callback(err);

            else{
                console.log(data);
                callback(err,data.token);
            }
        });
    }

    function isBankAccExists(landlordemail,callback){

        landlordBankDetails.findOne({userId:landlordemail}, function (err, data) {
            if(err)
                callback(err);

            else if (!data){
                callback("false");
            }
            else
                callback("true");
        });
    }


function getCurrentlandlordBankAccObject(emailID,homeID,callback){
    landlordBankDetails.find({userId:emailID,homeID:homeID}, function (err, data) {
        if(err)
            callback(err);

        else if (!data){
            callback(err);
        }
        else
            callback(err,data);
    });
}

exports.landlordBankDetails = landlordBankDetails;
exports.checkBankDetailsAndSave = checkBankDetailsAndSave;
exports.getTokenNo = getTokenNo;
exports.getBankAccNo = getBankAccNo;
exports.isBankAccExists = isBankAccExists;
exports.getCurrentlandlordBankAccObject = getCurrentlandlordBankAccObject;