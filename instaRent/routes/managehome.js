var express = require('express');
var router = express.Router();

var mailer = require("../methods/mailerHandler");

var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
//HomeHandler = new HomeHandler();

var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

router.get('/', function(req, res, next) {
  userHelper.renderTemplate('Role Selection.html',{ title: 'instaRent' }, req, res);
});

router.get('/mail', function(req, res, next) {
  	//console.log(mailer.sendMail);
  	mailer.sendMail(res);
  	//console.log("printing mailer: " + res.mailer.send);
});

router.get('/getHomes', function(req, res, next) {
	var userId = userHelper.getUserId(req);
	MoreHomeInfoHandler.getUserHomeAddresses(userId, res);	
});

/*
router.get('/getLandlordHomes', function(req, res, next) {
	var userId = userHelper.getUserId(req);
	HomeHandler.getUserHomeAddresses(userId, res);	
});

router.get('/getTenantHomes', function(req, res, next) {
	var userId = userHelper.getUserId(req);
	MoreHomeInfoHandler.getUserHomeAddresses(userId, res);	
});
*/

router.post('/setDefaultHome', function(req, res, next) {
	var userId = userHelper.getUserId(req);
	userHelper.setDefaultHome(req, userId, req.body, function(err, data) {
        res.send("Success");
    });
});

/*
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
			description: req.body.description,
			userType: req.body.userType,
			address: req.body.address,
			landlordEmail: req.body.landlordEmail,
			leaseStartDate: req.body.leaseStartDate,
			leaseEndDate: req.body.leaseEndDate, 
			securityDeposit: req.body.securityDeposit,
			rentPerMonth: req.body.rentPerMonth,
			tenantsEmails: req.body.tenantsEmails
		});
		MoreHomeInfoHandler.checkAndSave(moreHomeInfo, res);
	}
	console.log(req.body);	
});
*/

router.post('/addhome', function(req, res, next) {
  	console.log(req.body);	
  	//Add more home info into the MoreHomeInfo model
	var moreHomeInfo; 
	if(req.body.userType == "Tenant") {
		moreHomeInfo = {
			address: req.body.address,
			landlordEmail: req.body.landlordEmail,
			leaseStartDate: req.body.leaseStartDate,
			leaseEndDate: req.body.leaseEndDate, 
			securityDeposit: req.body.securityDeposit,
			//Adding it same as rentpermonth. Need to change this to (rent per month / number of fellow tenants)
			rentPerMonthPerUser: req.body.rentPerMonth,
			rentPerMonth: req.body.rentPerMonth,
			tenantsEmails: req.body.tenantsEmails
		};
	}
	else {
		moreHomeInfo = {
			address: req.body.address
		};	
	}
	//console.log(MoreHomeInfoHandler.checkAndSave);
	MoreHomeInfoHandler.checkAndSave(moreHomeInfo, req, res, true);
});

router.post('/updatehome', function(req, res, next) {
  	var userId = userHelper.getUserId(req);
	//Add more home info into the MoreHomeInfo model
	var moreHomeInfo; 
	if(req.body.userType == "Tenant") {
		moreHomeInfo = {
			userId: userId,
			address: req.body.address,
            landlordEmail: req.body.landlordEmail,
			leaseStartDate: req.body.leaseStartDate,
			leaseEndDate: req.body.leaseEndDate, 
			securityDeposit: req.body.securityDeposit,
			rentPerMonth: req.body.rentPerMonth,
			rentPerMonthPerUser: req.body.rentPerMonth,
			tenantsEmails: req.body.tenantsEmails,
			homeId: req.body.homeId
		};
		MoreHomeInfoHandler.update(moreHomeInfo, userId, req, res);
	}
	else {
		moreHomeInfo = {
			userId: userId,
			address: req.body.address,
			description: req.body.description,
			homeId: req.body.homeId
		};
		HomeHandler.update(moreHomeInfo, res);
	}
});

/*
router.post('/updatehome', function(req, res, next) {
  	var userId = userHelper.getUserId(req);
	if(req.body.userType == "Landlord"){
		var home = {
			userId: userId,
			address: req.body.address,
			description: req.body.description,
			userType: req.body.userType
		};
		console.log(home); 
		HomeHandler.update(home, res);
	} else {
		//Add more home info into the MoreHomeInfo model
		var moreHomeInfo = {
			userId: userId,
			description: req.body.description,
			userType: req.body.userType,
			address: req.body.address,
			landlordEmail: req.body.landlordEmail,
			leaseStartDate: req.body.leaseStartDate,
			leaseEndDate: req.body.leaseEndDate, 
			securityDeposit: req.body.securityDeposit,
			rentPerMonth: req.body.rentPerMonth,
			tenantsEmails: req.body.tenantsEmails
		};
		MoreHomeInfoHandler.update(moreHomeInfo, res);
	}
	//console.log(req.body);	
});
*/

module.exports = router;
