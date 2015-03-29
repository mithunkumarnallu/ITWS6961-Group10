var express = require('express');
var router = express.Router();
var verificationToken = require("../models/verification_token_schema");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/verify/:token", function (req, res, next) {
    var token = req.params.token;
    console.log("Verifying user user");
    verificationToken.verifyUser(token, function(err) {
        console.log("Verified user");
        if (err) 
        	return res.redirect("verification-failure");
        res.redirect("/login");
    });
});

module.exports = router;
