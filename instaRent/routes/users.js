var express = require('express');
var router = express.Router();
var verificationToken = require("../models/verification_token_schema");
var invitationHandler = require("../models/invitation_schema");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/verify/:token", function (req, res, next) {
    var token = req.params.token;
    //console.log("Verifying user user");
    verificationToken.verifyUser(token, function(err) {
        
        if (err) 
        	return res.redirect("verification-failure");
        res.redirect("/login");
    });
});

router.get("/confirmHouse/:homeId", function (req, res, next) {
   if(userHelper.isUserLoggedIn(req)) {
       console.log(" confirm house- logged in");
       invitationHandler.addUserToHome(userHelper.getUserId(req));
       res.redirect("/managehome");
   } else {
        console.log(" confirm house- not logged in");
        res.redirect("/login");
   }
});

module.exports = router;
