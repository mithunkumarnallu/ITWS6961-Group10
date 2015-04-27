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

//here we verify the password
/*
router.post('/verifypassword',function(req,res,next){
  //get the password from the user
    var password=req.body.password;
    var email=req.body.email;
    var accountController = new AccountController(User, req.session, req);
    //and then use the verify password function written in the account.js
    var ismatched=accountController.verifyoldpassword(email,password);
    if(ismatched==true){
      console.log("password matched, could go on and change it!")
      res.send({success:true});
    }
    else{
      console.log("password incorrect, please type again!");
      res.send({success:false});
    }
});

*/

//add another route to change the user password
router.post('/changeUserPassword',function(req,res){
  var password=req.body.password;
  var email=req.body.email;
  console.log("=====================");
  console.log(req.session);
  console.log("!!!!!!!!!!!!!!!!!!!!!");
  var accountController = new AccountController(User, req.session, req);
  accountController.verifyoldpassword(email,password,req,res);
  //var ismatched=accountController.ismatched;
  //console.log("are you matched?"+ismatched);
  //console.log("I know the answer!");
  /*if(ismatched==true){
    console.log("password matched, could go on and change it!")
    //res.send({success:true});
    var userpwd;
    userpwd={
      email: email,
      //password: req.body.password,
      //password_new: req.body.password_new,
      password_conf: req.body.password_conf
    };
    UserHandler.updatepassword(userpwd,res);

  }
  else if(ismatched==false){
    console.log("password incorrect, please type again!");
    res.send("incorrect");
  }
*/

});

module.exports=router;
