var express = require('express');
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_Y7s3n0HmJTXPmp9w0WVBusMV');

var app = express();
var router = express.Router();
router.use(bodyParser());
var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");
var Landlordmodel = require("../models/landLordbankDetails");
var payment_history_model = require("../models/payment_history");
var mailHandler = require("../methods/mailerHandler");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();



router.get('/getAllTransactions',function(req,res){
    stripe.transfers.list(
        { limit: 3 },
        function(err, transfers) {
            if (err) {
                res.send(500, err);
            } else {
                res.send(transfers);
            }
        }
    );
});


router.post('/addLandlordAccount', function (req, res) {

    var addLandlordBankdetails;
    var stripeToken = req.body.tokenID;
    var id = userHelper.getUserId(req);

    stripe.recipients.create({
        name: req.body.fn+" "+req.body.ln,
        type: "individual",
        bank_account: stripeToken,
        email: id
    }, function(err, recipient) {
        if(err)
            console.log("cannot create recipient");
        else {
            console.log(recipient);
            addLandlordBankdetails = {
                userId: id,
                bankAcc: req.body.accNo,
                routingNo: req.body.routeNo,
                token: recipient.id

            };
            Landlordmodel.checkBankDetailsAndSave(addLandlordBankdetails, req, res, true);
        }

    });
});

function sendConfirmationEmailLandlord(id,res,landlord_emailId,amt,TenantAddress){
    userHelper.getTenantName(id,function(err,data1){
        if(err)
            console.log("cannot get Tenant Name" + err);
        else{

            Landlordmodel.getBankAccNo(landlord_emailId,function(err,bankAcc){
                if(err)
                    console.log("cannot get bank acc no " + err);
                else
                    mailHandler.sendPaymentConfirmationLandlord(res,landlord_emailId,amt,TenantAddress,data1,bankAcc);

            });

        }

    });

}

function depositRent(amt,res, id){
    var landlord_emailId ;
    var tokenID;
    var description = "Test Transfer";
    var TenantAddress;
    MoreHomeInfoHandler.getCurrentHomeObject(id,res,function(err,data){
        var userid = id;
        TenantAddress = data.address;
        if(err)
            res.status(409).send("Error: Searching Home Object");
        else{
            landlord_emailId = data.landlordEmail;
          Landlordmodel.getTokenNo(landlord_emailId, function (err,data) {
              if (err)
                  res.status(409).send("Error: getting landlord token");
              else {
                  tokenID = data;
                  stripe.transfers.create({
                      amount: Math.round(parseFloat(amt)*100), // amount in cents
                      currency: "usd",
                      recipient: tokenID,
                      statement_descriptor: description
                  }, function(err, transfer) {
                      var addPaymentHistory = {
                          payment_date: new Date(),
                          amount_charged:parseFloat(amt),
                          description:description,
                          userID:userid,
                          landlordEmail:landlord_emailId

                      };
                      if (err) {
                          console.log(err + " inside create transfer");
                          addPaymentHistory.status = "Failed";
                          payment_history_model.checkPaymentHistoryDetailsAndSave(addPaymentHistory,userid);
                          //res.status(409).send("Error: Transferring money to Landlord" + err);
                      } else {
                          console.log("transfer Successful");
                          addPaymentHistory.status = "Success";
                         //res.send("Successfully transferred money to landlord");
                        payment_history_model.checkPaymentHistoryDetailsAndSave(addPaymentHistory,userid);
                          sendConfirmationEmailLandlord(id,res,landlord_emailId,amt,TenantAddress);

                      }
                  });
              }
          });

        }
    });
}

router.post('/charge', function(req, res) {
    var stripeToken = req.body.stripeToken;
    var userId = userHelper.getUserId(req);

    userHelper.getDefaultHome(userHelper.getUserId(req), res, function(err, data){
        if(err){
            res.status(409).send("Error: Getting Home");
        }
        else{
            MoreHomeInfoHandler.getrentPerMonth(data,function(err,data){
                if(err)
                    res.status(409).send("Error: Getting rent");
                else{
                    stripe.charges.create({
                            card: stripeToken,
                            currency: 'usd',
                            amount: Math.round(parseFloat(data)*100)
                        },
                        function(err, charge) {
                            if (err) {
                                res.status(409).send("Error: Charging card");
                            } else {
                                depositRent(data ,res, userId);
                            }
                        });
                }

            });
        }

    });


});

router.get('/getRent', function(req, res, next){
        console.log("inGetrent");
        userHelper.getDefaultHome(userHelper.getUserId(req), res, function(err, data){
            if(err){
                res.status(409).send("Error: Getting Home");
            }
            else{
                MoreHomeInfoHandler.getrentPerMonth(data,function(err,data){
                    if(err)
                        res.status(409).send("Error: Getting rent");
                    else{
                        res.send(data);
                    }

                });
            }

        });


});

router.get('/getPaymentHistory',function(req,res,next){
    var userId = userHelper.getUserId(req);

    payment_history_model.getCurrentPaymentHistoryObject(userId,false,function(err,data){
       if(err)
           res.status(409).send("Error: retrieving payment_history object");
        else{
           console.log(data);
           var results =[];
           for (var i = 0; i<data.length; i++) {

               //var date = data[i].payment_date.getMonth().toString() + "/" + data[i].payment_date.getDate().toString() +"/" + data[i].payment_date.getFullYear().toString();

               var obj = {
                   date: ((new Date(data[i].payment_date).getMonth()+1).toString()) + "/" + new Date(data[i].payment_date).getDate().toString() +"/" + new Date(data[i].payment_date).getFullYear().toString(),
                   landlord_email: data[i].landlordEmail,
                   status: data[i].status,
                   rent: data[i].amount_charged
               };
               results.push(obj);
           }
           res.send(results);

       }

    });


});

module.exports = router;