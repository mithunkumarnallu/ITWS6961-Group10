var express = require('express');
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_Y7s3n0HmJTXPmp9w0WVBusMV');

var app = express();
var router = express.Router();
router.use(bodyParser());
var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");
var Landlordmodel = require("../models/landLordbankDetails");
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

function depositRent(amt,res, id){
    var landlord_emailId ;
    var tokenID;
    MoreHomeInfoHandler.getCurrentHomeObject(id,res,function(err,data){

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
                      amount: amt, // amount in cents
                      currency: "usd",
                      recipient: tokenID,
                      statement_descriptor: "Test Transfer"
                  }, function(err, transfer) {
                      if (err) {
                          console.log(err + " inside create transfer");
                          res.status(409).send("Error: Transferring money to Landlord" + err);
                      } else {
                          console.log("transfer Successfull");
                          res.send("Successfully transferred money to landlord");
                      }
                  });
              }
          });

        }
    });
}

router.post('/charge', function(req, res) {
    var stripeToken = req.body.stripeToken;
    var amount=100;
    var userId = userHelper.getUserId(req);
    stripe.charges.create({
        card: stripeToken,
        currency: 'usd',
        amount: amount
    },
    function(err, charge) {
        if (err) {
            res.status(409).send("Error: Charging card");
        } else {
            depositRent(amount ,res, userId);

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


module.exports = router;