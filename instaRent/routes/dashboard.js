var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");

var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
//HomeHandler = new HomeHandler();

var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

router.get("/", function (req, res) {
    var userType = userHelper.getUserType(req);
    MoreHomeInfoHandler.getCurrentHomeObject(userHelper.getUserId(req), res, function (err, data) {
        if(err) {
            console.log("Error in getting current home info: " + err);
            res.status(500).send("Error in fetching data");
        }
        else {
            var currentUserInfo = userHelper.getUserInfo(req);
            var rentDueIn = MoreHomeInfoHandler.getRentDueIn(data.leaseStartDate, data.leaseEndDate);
            var result = {
                userName: currentUserInfo.firstName,
                rentDueIn: rentDueIn.rentDueIn,
                userRole: userType
            };

            if(userType == "Tenant") {
                if(rentDueIn.isProRate) {
                    result.rentDue = (data.rentPerMonthPerUser * rentDueIn.daysOfStay).toFixed(2);
                }
                else {
                    result.rentDue= data.rentPerMonthPerUser;
                }

                //Get landlord information
                userHelper.getUserInfo(null, data.landlordEmail, null, function(err, landlordInfo) {
                    if(err) {
                        console.log("Error while fetching landlord details: " + err);
                        res.status(500).send("Error in fetching data");
                    }
                    else if(landlordInfo) {
                        result.landlord = {
                            name: landlordInfo.firstName,
                            email: landlordInfo.email,
                            phone: landlordInfo.phoneNo
                        };
                    }
                    else {
                        result.landlord = {
                            email: data.landlordEmail
                        };
                    }
                    //res.send(result);
                    res.render("dashboard.html", result);
                });
            }
            else {
                //User is a landlord. Fetch details correspondingly
                if(rentDueIn.isProRate) {
                    result.rentDue = (data.rentPerMonth * rentDueIn.daysOfStay).toFixed(2);
                }
                else {
                    result.rentDue= data.rentPerMonth;
                }
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
                                result.tenants = tenantInfo;
                                res.render("dashboard.html", result);
                                //res.send(result);
                            }
                        });
                    }
                });
                //res.send(result);
            }

        }
    });
});

//display the dashboard information for tenant
router.get('/tenantdashboard',function(req,res){
      var tenantInfo={};
      var useFirstName=userHelper.getUserInfo(req).firstName;
      var homeId=HomeHandler.getHomeId(req).response;
      var rentDue=MoreHomeInfoHandler.getrentPerMonth(homeId,res).response;
      
});








//display the dashboard information for landloard
router.get('/landloarddashboard',function(req,res){

});

module.exports = router;