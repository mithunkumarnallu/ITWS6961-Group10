var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");

var payment_history = require("../models/payment_history");
var topicHelper = require("../methods/topicHelper");
topicHelper = new topicHelper();
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

                payment_history.getCurrentPaymentHistoryObject(currentUserInfo.email,true, currentUserInfo.foreignId, "Tenant", function(err, payments) {
                    if(!err && payments && payments.length > 0) {
                        if(payments[0].payment_date.getMonth() == new Date().getMonth())
                            result.rentDue = 0;
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
                        //Code to get active complaints count
                        topicHelper.getTopicCount({userid: currentUserInfo.email, houseid: currentUserInfo.foreignId, nestatus: "finished" }, null,
                            function(err, obj, data) {
                                if(!err)
                                    result.activeComplaints = data;
                                userHelper.renderTemplate("dashboard.html", result, req, res);
                            });

                        console.log("Object set for dashboard is : " + JSON.stringify(result));
                    });
                })

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
                result.rentToBePaid = 0;
                HomeHandler.getUserIdsForAHome(data._id.toString(), "Tenant", function (err, data) {
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
                                        var d = new Date();
                                        for(var i = 0; i < data.length; i++) {
                                            tenantPayments.push({name: data[i].userName, rentPaidOn: data[i].payment_date.toDateString()});
                                            if(d.getMonth() == data[i].payment_date.getMonth() && d.getYear() == data[i].payment_date.getYear())
                                                result.rentDue -= data[i].amount_charged;
                                            else
                                                result.rentToBePaid += 1;
                                        }
                                    }
                                    result.rentToBePaid += (tenantUserIds.length - data.length);
                                    result.rentStatus = tenantPayments;

                                    //Code to get active complaints count
                                    topicHelper.getTopicCount({userid: currentUserInfo.email, houseid: currentUserInfo.foreignId, nestatus: "finished" }, null,
                                        function(err, obj, data) {
                                            if(!err)
                                                result.activeComplaints = data;
                                            userHelper.renderTemplate("dashboard.html", result, req, res);
                                        });
                                    console.log("RentStatus is: " + JSON.stringify(tenantPayments));
                                    console.log("Object set for dashboard is : " + JSON.stringify(result));

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
