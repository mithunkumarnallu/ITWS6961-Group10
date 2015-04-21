var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var email;

var userinfo;
var update = false;



router.get('/', function(req, res, next) {
  if (!update) {
  userinfo  = userHelper.getUserInfo(req);
}

  res.render('settings.html', userinfo);
  
  //userHelper.renderTemplate('settings.html', userHelper.getUserInfo(req));
  //userHelper.renderTemplate('settings.html', userHelper.getUserInfo(req), req,res);
});

//display the user profile, return type is in JSON
router.get('/displayprofile', function(req, res, next){
     var userInfo={};
     userInfo=userHelper.getUserInfo(req);
     //not quite sure if Json.stringify() is required
     res.send(JSON.stringify(userInfo));
});

router.get('/getEmail',function(req,res){
  res.send(userHelper.getUserInfo(req));
});



//change user setting, firstname, lastname, phonenumber and email, pwd cannot be changed
router.post('/changeuserprofile',function(req,res){
  update = true;

  userinfo = req.body;

  var userInfo={};
  userInfo={
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNo: req.body.phoneNo
  };
 // console.log(req.body);
  
  // ===== changed by Amy here========
  // should send response from update function instead of send req.body
  //console.log(userInfo.email);
  UserHandler.update(userInfo, res);
  
  //res.send(req.body);


/*
  var userinfo;
  userinfo.push(req.body.email);
  userinfo.push(req.body.firstName);
  userinfo.push(req.body.lastName);
  userinfo.push(req.body.phoneNo);
  console.log("user email: ", userInfo[0]);
  //UserHandler.update(userInfo);

*/
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
