var url = require('url');
var fs = require('fs');
var path = require('path');

var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var topicHelper = require("../methods/topicHelper");
topicHelper = new topicHelper();
var msgHelper = require("../methods/messageHelper");
msgHelper = new msgHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");



router.get("/userinfo", function (req, res) {
    var userType = userHelper.getUserType(req);
    var userInfo = userHelper.getUserInfo(req);
    userInfo["type"] = userType;
    console.log("sending user info");
    MoreHomeInfoHandler.getCurrentHomeObject(userHelper.getUserId(req), res, function (err, data) {
        if(err) {
        	console.log("-------------------------------------------");
            console.log("Error in getting current home info: " + err);
            console.log("-------------------------------------------");
            res.status(500).send("Error in fetching data");
        }
        else {
            var currentUserInfo = userHelper.getUserInfo(req);
            userInfo.houseid = userHelper.getDefaultHomeID(req);
            console.log("houseid:" + userInfo.houseid);

            if(userType == "Tenant") {

                //Get landlord information
                userHelper.getUserInfo(null, data.landlordEmail, null, function(err, landlordInfo) {
                    if(err) {
                        console.log("Error while fetching landlord details: " + err);
                        res.status(500).send("Error in fetching data");
                    }
                    else if(landlordInfo) {
                        userInfo.landlord = {
                            name: landlordInfo.firstName,
                            email: landlordInfo.email,
                            phone: landlordInfo.phoneNo
                        };
                    }
                    else {
                        userInfo.landlord = {
                            email: data.landlordEmail
                        };
                    }
                    res.send(userInfo);
                    res.end();
                });
            }
            else {
                HomeHandler.getUserIdsForAHome(data._id, "Tenant", function (err, data) {
                    if(err) {
                        console.log("Error while fetching tenants living in a house: " + err);
                        res.status(500).send("Error in fetching data");
                    }
                    else {
                        var userIds = [];
                        for(var i = 0; i < data.length; i++) {
                            userIds.push({email: data[i].userId});
                        }
                        userHelper.getUserInfo(null,null,userIds, function(err, data) {
                            if(err) {
                                console.log("Error while fetching tenant information from User database: " + err);
                                res.status(500).send("Error in fetching data");
                            }
                            else {
                                var tenantInfo = [];
                                for(var i = 0; i < data.length; i++) {
                                    var tenant = {};
                                    tenant.name = data[i].firstName;
                                    tenant.email = data[i].email;
                                    tenant.phone = data[i].phoneNo;
                                    tenantInfo.push(tenant);
                                }
                                userInfo.tenants = tenantInfo;
                                res.send(userInfo);
                                res.end();
                            }
                        });
                    }
                });
            }

        }
    });

});

router.post('/topic', function(req,res) {
	console.log("got post request to create a topic");
    console.log("request body:");
    console.log(req);
    //console.log(JSON.stringify(req));
	//console.log(JSON.stringify(req.body));
  	result = topicHelper.newTopic(req.body, res);
	//res.end();
});

router.get('/topic', function(req,res) {
	var info = url.parse(req.url ,true);
	
	topicHelper.getTopics(info.query, res);


});

router.post('/msg', function(req,res) {
	console.log("got post request on msg endpoint");
	console.log(JSON.stringify(req.body));
  	var result = msgHelper.newMsg(req.body);
  	console.log(result);
  	res.send(result);
	res.end();
});

router.get('/msg', function(req,res) {
	var info = url.parse(req.url ,true);
	
	msgHelper.getMsgs(info.query, res);


});

router.get('/sample', function(req,res) {
  var info = url.parse(req.url ,true);
  var pathname = info["pathname"];  

	fs.readFile("./index.html", function(err, text){
	  res.setHeader("Content-Type", "text/html");
	  res.end(text);
	});
	return;

});

router.get('/', function(req, res, next) {
	console.log("rendering complaints.html");
	res.render('complaints.html', { title: 'instaRent-complaints' });
});

module.exports = router;
