var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");


router.get('/', function(req, res, next) {
  res.render('Role Selection.html', { title: 'instaRent' });
});

//display the user profile, return type is in JSON
router.get('/displayprofile', function(req, res, next){
     var userInfo={};
     userInfo=userHelper.getUserInfo(req);
     //not quite sure if Json.stringify() is required
     res.send(JSON.stringify(userInfo));
});

//change user setting, firstname, lastname, phonenumber and email, pwd cannot be changed
router.post('/changeuserprofile',function(req,res,next){
  var userInfo;
  userInfo={
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNo: req.body.phoneNo
  };
  UserHandler.update(userInfo,res);
});


module.exports=router;
