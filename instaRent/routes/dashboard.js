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
    if(userType == "Tenant") {
        MoreHomeInfoHandler.getCurrentHomeObject(userHelper.getUserId(req), res, function (err, data) {
            if(err) {
                console.log("Error in getting current home info: " + err);
                res.status(500).send("Error in fetching data");
            }
            else {
                var currentUserInfo = userHelper.getUserInfo(req);
                var rentDueIn = getRentDueIn(data.leaseStartDate, data.leaseEndDate);
                var result = {
                    userName: currentUserInfo.firstName,
                    rentDueIn: rentDueIn.rentDueIn,
                    rentDue: data.rentPerMonthPerUser,
                    userRole: "Tenant"
                };
                if(rentDueIn.isProRate) {
                    result.rentDue = (data.rentPerMonthPerUser * rentDueIn.daysOfStay).toFixed(2);
                }
                userHelper.getUserInfo(null, data.landlordEmail, function(err, landlordInfo) {
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
                    console.log(result);
                    res.render("dashboard.html", result);
                });

            }
        });
    }
});

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function getRentDueIn(leastStartDate, leaseEndDate) {
    var result = {
        isProRate : false
    };
    var d = new Date();
    if(d.getMonth() == leastStartDate.getMonth()) {
        result.isProRate = true;
        result.rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - leastStartDate.getDate();
        result.daysOfStay = 1 - (d.getDate() / (daysInMonth(d.getMonth(), d.getYear()) - d.getDate())).toFixed(2);
    }
    else if(d.getMonth() == leaseEndDate.getMonth()) {
        result.isProRate = true;
        result.rentDueIn = leaseEndDate.getDate() - d.getDate();
        result.daysOfStay = 1 - (d.getDate() / leaseEndDate.getDate()).toFixed(2);
    }
    else {
        result.rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - d.getDate();
    }
    return result;
}

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