var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var Schema = mongoose.Schema;


var PaymentHistory = new Schema({
    payment_date:Date,
    amount_charged:Number,
    description:String,
    userID:String,
    status:String,
    landlordEmail:String,
    userName:String,
    homeID:String,
    role:String
});

var payment_history = mongoose.model('PaymentHistory', PaymentHistory);



function checkPaymentHistoryDetailsAndSave(paymentHistoryDetails,userId) {
    payment_history.findOne({userID: userId}, function (err, data) {

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



function getCurrentPaymentHistoryObject(emailId, isFetchLatest, HomeID, userType, callback) {



    if(userType=="Tenant"){
   var payment = payment_history.find({userID:emailId, homeID:HomeID});
   if(isFetchLatest)
       payment = payment.sort("-payment_date");

   payment.exec(function(err,data){

       if (err)
          callback(err);
       else{
          callback(null,data);
       }
   });
    }
    else{
        var payment1 = payment_history.find({landlordEmail:emailId, homeID:HomeID});
        if(isFetchLatest)
            payment1 = payment1.sort("-payment_date");

        payment1.exec(function(err,data){

            if (err)
                callback(err);
            else{
                callback(null,data);
            }
        });
    }

}

function getPaymentHistoryForAllUsers(emailIds, isFetchLatest, callback) {
    var payment = payment_history.find({$or : emailIds});
    if(isFetchLatest)
        payment = payment.sort({userId: 1, payment_date: -1});

    payment.exec(function(err,data){

        if (err)
            callback(err);
        else{
            var addedUsers = {};
            var result = [];
            for(var i = 0; i < data.length; i++) {
                if(!(data[i].userId in addedUsers)) {
                    addedUsers[data[i].userID] = true;
                    result.push(data[i]);
                }
            }
            console.log()
            callback(null,result);
        }
    });

}


exports.payment_history = payment_history;
exports.checkPaymentHistoryDetailsAndSave = checkPaymentHistoryDetailsAndSave;
exports.getCurrentPaymentHistoryObject = getCurrentPaymentHistoryObject;
exports.getPaymentHistoryForAllUsers = getPaymentHistoryForAllUsers;
