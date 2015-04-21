var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var email;

var updated=false;
var userInfo={};

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



//change user setting, firstname, lastname, phonenumber and email, pwd cannot be changed
router.post('/changeuserprofile',function(req,res){
updated=true;
//  var userInfo={};
  userInfo={
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNo: req.body.phoneNo
  };
  console.log(req.body);

  // ===== changed by Amy here========
  // should send response from update function instead of send req.body
  //console.log(userInfo.email);
  UserHandler.update(userInfo, res);
});


// added by Amy, parse the data to backend, not tested yet
router.post('/changeUserPassword',function(req,res,next){
  var userPassword;
  userPassword={
    password: req.body.password,
    password_new: req.body.password_new,
    password_conf: req.body.password_conf
  };
  UserHandler.update(userPassword,res);
});

module.exports=router;
