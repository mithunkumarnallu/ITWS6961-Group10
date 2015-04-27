var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
//add this models where I can use to change the password.
var AccountController = require('../methods/account.js'),
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var email;

var session = [];


var UserProfileModel = require('../models/user-profile.js');
var crypto = require('crypto');
var uuid = require('node-uuid');

var updated=false;
var userInfo={};
//to verify the password
//var pwdverified=false;

router.get('/', function(req, res, next) {
  var obj;
  if(updated==false){
    obj={
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email:req.user.email,
      phoneNo:req.user.phoneNo
    }
    userHelper.renderTemplate('settings.html', obj ,req,res);
  }
    //  res.render('settings.html', userHelper.getUserInfo(req) );
  else{
    userHelper.renderTemplate('settings.html', userInfo ,req,res);
  }

});

//display the user profile, return type is in JSON
router.get('/displayprofile', function(req, res, next){
     var userInfo={};
     userInfo=userHelper.getUserInfo(req);
     res.send(JSON.stringify(userInfo));
});

router.get('/getEmail',function(req,res){
  res.send(userHelper.getUserInfo(req));
});

router.post('/changeuserprofile',function(req,res){

updated=true;

  userInfo={
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNo: req.body.phoneNo
  };
  console.log(req.body);
  UserHandler.update(userInfo, res);
});


//add another route to change the user password
router.post('/changeUserPassword',function(req,res){
  
  var password=req.body.password;
  var email=req.body.email;
  console.log("=====================");
  console.log(req.session);
  console.log("!!!!!!!!!!!!!!!!!!!!!");
  var accountController = new AccountController(User, req.session, req);
  accountController.verifyoldpassword(email,password,req,res);
  //here we do some test


});

module.exports=router;
