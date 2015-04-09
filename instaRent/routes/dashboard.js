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
