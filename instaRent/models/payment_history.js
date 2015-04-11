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
    landlordEmail:String
});

var payment_history = mongoose.model('PaymentHistory', PaymentHistory);



function checkPaymentHistoryDetailsAndSave(paymentHistoryDetails,userId,res) {
    payment_history.findOne({userId: userId}, function (err, data) {

        if (err)
            res.status(409).send("Error: Adding adding payment history");
        else{
            paymentHistoryDetails = new payment_history(paymentHistoryDetails);
            paymentHistoryDetails.save(function (err, landlordDetails) {
                if (err)
                    res.status(409).send("Error: Adding Bank account");
                else {
                    res.send("successfully saved payment history");
                }

            });
        }
    });

}

exports.payment_history = payment_history;
exports.checkPaymentHistoryDetailsAndSave = checkPaymentHistoryDetailsAndSave;