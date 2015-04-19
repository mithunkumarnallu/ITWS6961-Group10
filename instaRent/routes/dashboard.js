var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");

var payment_history = require("../models/payment_history");

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
            var result = {
                userName: currentUserInfo.firstName,
                userRole: userType
            };
            if(data.leaseStartDate) {
                var rentDueIn = MoreHomeInfoHandler.getRentDueIn(data.leaseStartDate, data.leaseEndDate);
                result.rentDueIn = rentDueIn.rentDueIn;
            }

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
                    userHelper.renderTemplate("dashboard.html", result, req, res);
                });
            }
            else if(!data.leaseStartDate) {
                userHelper.renderTemplate("dashboard.html", result, req, res);
            } else {
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
                                var tenantUserIds = [];
                                for(var i = 0; i < data.length; i++) {
                                    var tenant = {};
                                    tenant.name = data[i].firstName;
                                    tenant.email = data[i].email;
                                    tenant.phone = data[i].phoneNo;
                                    tenantInfo.push(tenant);
                                    tenantUserIds.push({"userID": data[i].email});
                                }
                                result.tenants = tenantInfo;

                                payment_history.getPaymentHistoryForAllUsers(tenantUserIds,true, function(err, data) {
                                    if(err) {
                                        console.log("Error in getting payment objects for the user: " + err.message);
                                        userHelper.renderTemplate("dashboard.html", result, req, res);
                                    }
                                    else {
                                        var tenantPayments = [];
                                        for(var i = 0; i < data.length; i++) {
                                            tenantPayments.push({name: data[i].userName, rentPaidOn: data[i].payment_date.toDateString()});
                                        }
                                    }
                                    result.rentStatus = tenantPayments;
                                    console.log("RentStatus is: " + JSON.stringify(tenantPayments));
                                    userHelper.renderTemplate("dashboard.html", result, req, res);
                                });
                            }
                        });
                    }
                });
            }

        }
    });
});

module.exports=router;
