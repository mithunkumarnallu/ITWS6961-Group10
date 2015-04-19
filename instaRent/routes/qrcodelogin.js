/**
 * Created by MithunKumar on 4/18/2015.
 */
var express = require('express');
var router = express.Router();
var qrCodeHandler = require("../models/qrcode_login_schema");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var user = require("../models/user");

//router.get("/", function(req, res) {
//    console.log("In qrcode login page loader");
//    var loginToken = new qrCodeHandler.LoginTokenModel();
//    loginToken.createLoginToken(function(err, data) {
//        if(err)
//            res.render("qrcode_login.html", {error: err});
//        else
//            res.render("qrcode_login.html", {data: data});
//    });
//});


router.get("/isLoggedIn/:token", function(req, res) {
    qrCodeHandler.getLoginToken(req.params.token, function(err, data) {
        if(err || !data || !data.phoneNo || !data.isLoggedIn )
            res.send(false);
        else {
            User.findOne({phoneNo: data.phoneNo}, function(err, data) {
                if(err || !data) {
                    res.send(false);
                }
                else {
                    if (userHelper.SetQRSession(req, data))
                        res.send(true);
                    else
                        res.send(false);
                }
            });
            //res.send(true);
        }
    });
});

router.get("/:token/:phoneNo", function(req, res) {
    qrCodeHandler.setLoginToken(req.params.token, req.params.phoneNo, function(err, data) {
        if(err || !data || data.n == 0)
            res.send("Could not login. Please refresh page and try again");
        else {
            res.send("Successfully logged in!");
        }
    });
});

module.exports = router;