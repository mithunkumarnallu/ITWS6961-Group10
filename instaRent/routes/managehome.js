var express = require('express');
var router = express.Router();

var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
//HomeHandler = new HomeHandler();

var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

router.get('/', function(req, res, next) {
  res.render('Role Selection.html', { title: 'instaRent' });
});

router.get('/gethomes', function(req, res, next) {
	var userId = userHelper.getUserId(req);
	HomeHandler.getUserHomeAddresses(userId, res);	
});

router.post('/addhome', function(req, res, next) {
  	var userId = userHelper.getUserId(req);
	if(req.body.userType == "Landlord"){
	
		var home = new Home({
			userId: userId,
			address: req.body.address,
			description: req.body.description,
			userType: req.body.userType
		}); 
		HomeHandler.checkAndSave(home, res);
	} else {
		//Add more home info into the MoreHomeInfo model
		var moreHomeInfo = new MoreHomeInfo({
			userId: userId,
			address: req.body.address,
			landlordEmail: req.body.landlordEmail,
			leaseStartDate: req.body.leaseStartDate,
			leaseEndDate: req.body.leaseEndDate, 
			securityDeposit: req.body.securityDeposit,
			rentPerMonth: req.body.rentPerMonth
			
			//tenantsEmails: req.body.tenantsEmails
		});
		MoreHomeInfoHandler.checkAndSave(moreHomeInfo, res);
	}
	console.log(req.body);	
});

module.exports = router;
