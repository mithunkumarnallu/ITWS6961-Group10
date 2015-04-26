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
var defaultbankAccDetails = require("../models/defaultLandlordBankAccount");
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
    console.log("insided add bank acc");
    var addLandlordBankdetails,defaultBankAccDetails;
    var stripeToken = req.body.tokenID;
    var id = userHelper.getUserId(req);
    var homeID = userHelper.getDefaultHomeID(req);

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
                token: recipient.id,
                firstName:req.body.fn,
                lastName:req.body.ln,
                homeID:homeID,
                defaultBankAcc:req.body.accNo

            };

            defaultBankAccDetails={
                userId: id,
                defaultBankAcc:req.body.accNo,
                token: recipient.id,
                homeID:homeID
            }
            Landlordmodel.checkBankDetailsAndSave(addLandlordBankdetails, req, res, true);
            defaultbankAccDetails.checkandsave(defaultBankAccDetails);
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

function depositRent(amt,res, id,homeID){
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
            Landlordmodel.isBankAccExists(landlord_emailId,function(data){
               if(data=="false"){
                   console.log("Landlord Bank account does not exists");
                   return;
               }

                else{
                   defaultbankAccDetails.getDefaultToken(landlord_emailId,homeID, function (err,data) {
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
                               if(err){
                                   res.send("Transfer Failed " + err);
                               }
                                else {
                                   userHelper.getTenantName(userid, function (err, tenantFullName) {
                                       var addPaymentHistory = {
                                           payment_date: new Date(),
                                           amount_charged: parseFloat(amt),
                                           description: description,
                                           userID: userid,
                                           landlordEmail: landlord_emailId,
                                           userName: tenantFullName,
                                           homeID: homeID
                                       };
                                       if (err) {
                                           console.log(err + " inside create transfer");
                                           addPaymentHistory.status = "Failed";
                                           payment_history_model.checkPaymentHistoryDetailsAndSave(addPaymentHistory, userid);
                                       } else {
                                           console.log("transfer Successful");
                                           addPaymentHistory.status = "Success";
                                           payment_history_model.checkPaymentHistoryDetailsAndSave(addPaymentHistory, userid);
                                           sendConfirmationEmailLandlord(id, res, landlord_emailId, amt, TenantAddress);

                                       }

                                   });
                               }
                           });
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
    var homeID = userHelper.getDefaultHomeID(req);


    userHelper.getDefaultHome(userHelper.getUserId(req), res, function(err, data){
        if(err){
            res.status(409).send("Error: Getting Home");
        }
        else{
            MoreHomeInfoHandler.getrentPerMonth(data, userHelper.getUserInfo(req), function(err,data){
                if(err)
                    res.status(409).send("Error: Getting rent");
                else{
                    stripe.charges.create({
                            card: stripeToken,
                            currency: 'usd',
                            amount: Math.abs(Math.round(parseFloat(data)*100))
                        },
                        function(err, charge) {
                            if (err) {
                                res.status(409).send("Error: Charging card");
                            } else {
                                depositRent(data ,res, userId,homeID);
                            }
                        });
                }

            });
        }
    });

});
router.get('/testLandlord', function (req,res) {
    userHelper.renderTemplate('LandLordAddBank.html',{},req,res);
    //res.render('LandLordAddBank.html');
});


router.get('/payment_history', function (req,res) {
    var userRole = userHelper.getUserType(req);
    userHelper.renderTemplate('payment_history.html',{userRole:userRole},req,res);

});


router.get('/getRent', function(req, res, next){
        console.log("inGetrent");
        userHelper.getDefaultHome(userHelper.getUserId(req), res, function(err, data){
            if(err){
                res.status(409).send("Error: Getting Home");
            }
            else {
                MoreHomeInfoHandler.getrentPerMonth(data, userHelper.getUserInfo(req), function(err,data){
                    if(err)
                        res.status(409).send("Error: Getting rent");
                    else{
                        console.log(data);
                        res.send(""+ data);
                    }

                });
            }

        });
});

router.get('/checkLandlordBankAccount',function(req,res){

    var homeID = userHelper.getDefaultHomeID(req);
    var tenantName = userHelper.getUserName(req);
    var address= userHelper.getUserHomeAddress(req);
    console.log("Inside payments address" + address);
    MoreHomeInfoHandler.getLandlordemailID(homeID,function(err,landlordEmailID){

        if(err) {
            res.send("false");
        }

        else{
            defaultbankAccDetails.getDefaultToken(landlordEmailID,homeID,function(err,data){
                console.log("token" + data);
                if(err){
                    res.send("false");
                }
                else if(data){
                    res.send("true");
                }


                else {
                    sendNoBankAccountEmailLandlord(res,tenantName,landlordEmailID,address);
                    res.send("false");
                }

            });
        }
    });
});


function sendNoBankAccountEmailLandlord(res,tenantName,landlordEmailID,homeAddress){

    mailHandler.sendAddBankAccountLandlord(res,tenantName,landlordEmailID,homeAddress);

}


router.get('/getBankAccountHistory',function(req,res) {

    var Name = userHelper.getUserName(req);
    var email = userHelper.getUserId(req);
    var homeID = userHelper.getDefaultHomeID(req);

    Landlordmodel.getCurrentlandlordBankAccObject(email, homeID, function (err, data) {
        if (err) {
            res.status(409).send("Error: Getting bank Acc object.");
            return;
        }
        else {
            console.log(data);
            var obj;
            var results =[];

            for (var i = 0; i < data.length; i++) {
                obj = {
                    fname:data[i].firstName,
                    lname:data[i].lastName,
                    bankacc:data[i].bankAcc
                };
                results.push(obj);
            }

            res.send(results);
        }

    });

});

router.get('/getPaymentHistory',function(req,res,next){
    var userId = userHelper.getUserId(req);
    var HomeID = userHelper.getDefaultHomeID(req);
    var userType = userHelper.getUserType(req);

    payment_history_model.getCurrentPaymentHistoryObject(userId,false,HomeID,userType,function(err,data){
       if(err)
           res.status(409).send("Error: retrieving payment_history object");
        else{
           console.log(data);
           var results =[];
           var obj;
           for (var i = 0; i<data.length; i++) {
               var email;
               if (userType == "Tenant") {
                   email = data[i].landlordEmail;
                   obj = {
                       date: ((new Date(data[i].payment_date).getMonth()+1).toString()) + "/" + new Date(data[i].payment_date).getDate().toString() +"/" + new Date(data[i].payment_date).getFullYear().toString(),
                       landlord_email: email,
                       status: data[i].status,
                       rent: data[i].amount_charged
                   };
               }
               else {
               email = data[i].userName;
                   obj = {
                       date: ((new Date(data[i].payment_date).getMonth()+1).toString()) + "/" + new Date(data[i].payment_date).getDate().toString() +"/" + new Date(data[i].payment_date).getFullYear().toString(),
                       landlord_email: email,
                       status: data[i].status,
                       rent: data[i].amount_charged
                   };
           }
               results.push(obj);
           }
           res.send(results);

       }

    });
});
router.get('/getDefaultBankAccno',function(req,res){

    var emailID = userHelper.getUserId(req);
    var homeID = userHelper.getDefaultHomeID(req);
    //console.log(req.query.input);
    Landlordmodel.getTokenNo(emailID, homeID,req.query.input,function (err,data) {

        defaultbankAccDetails.saveDefaultBankAcc(emailID,req.query.input,homeID,data,function(err,data){
            if(err)
                res.status(409).send("Error: updating default bank account");
            else if(data=="success")
                res.send("successfully updated default account no");
        });
    });
});
module.exports = router;