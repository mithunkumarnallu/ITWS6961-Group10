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

    //console.log("inside addLandLordBaank" + req.body.accNo);
    //console.log(req.body.routeNo);
    //console.log(req.body.tokenID);
    var addLandlordBankdetails;
    var stripeToken = req.body.tokenID;
    var id = userHelper.getUserId(req);

    addLandlordBankdetails = {
        userId:id,
        bankAcc:req.body.accNo,
        routingNo:req.body.routeNo,
        token:stripeToken

    };


    Landlordmodel.checkBankDetailsAndSave(addLandlordBankdetails, req, res, true);



});

function depositRent(){


    stripe.transfers.create({
        amount: 100, // amount in cents
        currency: "usd",
        recipient: Token,
        bank_account: req.body.accNo,
        statement_descriptor: "Test Transfer"
    }, function(err, transfer) {
        if (err) {
            res.send(500, err);
        } else {
            res.send(204);
        }
    });


}

router.post('/charge', function(req, res) {
    var stripeToken = req.body.stripeToken;
    var amount = 100;

    stripe.charges.create({
        card: stripeToken,
        currency: 'usd',
        amount: amount
    },
    function(err, charge) {
        if (err) {
            res.send(500, err);
        } else {
            depositRent();
            res.send(204);
        }
    });
});


function getHomeDetails(res,err,data){
    if(err){
        console.log(err);
    }
    else{
        MoreHomeInfo.getrentPerMonth(data.foreignId,res);
    }
}

router.get('/getRent', function(req, res, next){
        console.log("inGetrent");
        userHelper.getDefaultHome(userHelper.getUserId(req), res, getHomeDetails);

    //MoreHomeInfo.getrentPerMonth(homeID,res);

});


module.exports = router;