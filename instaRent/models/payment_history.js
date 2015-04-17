var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var Schema = mongoose.Schema;


var PaymentHistory = new Schema({
    payment_date:String,
    amount_charged:Number,
    description:String,
    userID:String,
    status:String,
    landlordEmail:String,
    tenantName:String

});

var payment_history = mongoose.model('PaymentHistory', PaymentHistory);



function checkPaymentHistoryDetailsAndSave(paymentHistoryDetails,userId) {
    payment_history.findOne({userId: userId}, function (err, data) {

        if (err)
            res.status(409).send("Error: Adding adding payment history");
        else{
            paymentHistoryDetails = new payment_history(paymentHistoryDetails);
            paymentHistoryDetails.save(function (err, landlordDetails) {
                if (err)
                    //res.status(409).send("Error: Adding Bank account");
                console.log("cannot save payment history" + err);
                else {
                    //res.send("successfully saved payment history");
                    console.log("successfully saved payment history");
                }

            });
        }
    });
}

function getCurrentPaymentHistoryObject(emailId, res, callback) {
    payment_history.find({userID:emailId},function(err,data){

        if (err)
            callback(null);
        else{
            callback(null,data);
        }
    });
}


exports.payment_history = payment_history;
exports.checkPaymentHistoryDetailsAndSave = checkPaymentHistoryDetailsAndSave;
exports.getCurrentPaymentHistoryObject = getCurrentPaymentHistoryObject;