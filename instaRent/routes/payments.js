var express = require('express');
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_Y7s3n0HmJTXPmp9w0WVBusMV');

var app = express();
var router = express.Router();
router.use(bodyParser());

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
            res.send(204);
        }
    });
});

var MoreHomeInfo = require("../models/more_home_info");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

router.get('/getRent', function(req, res, next){

    var homeID = userHelper.getDefaultHome(req);
    MoreHomeInfo.getrentPerMonth(homeID,res);

    });



module.exports = router;