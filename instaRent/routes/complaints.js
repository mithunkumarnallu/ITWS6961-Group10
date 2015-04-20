var url = require('url');
//var fs = require('fs');
//var path = require('path');

var express = require('express');
var router = express.Router();
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var topicHelper = require("../methods/topicHelper");
topicHelper = new topicHelper();
var msgHelper = require("../methods/messageHelper");
msgHelper = new msgHelper();
var User=require("../models/user").User;
var UserHandler=require("../models/user");
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

//General
var Promise = require('bluebird');
var Q = require('q');
var moment = require('moment');
var lodash = require('lodash');
//File upload
var fs = Promise.promisifyAll(require('fs')); 
var multiparty = require('multiparty'); 
var path = require('path'); 
var uuid = require('node-uuid'); 

//ref: https://medium.com/@chaseellsworth/file-upload-with-angularjs-and-node-js-part-1-69682ce76
//ref: https://medium.com/@chaseellsworth/file-upload-2-3-node-to-server-file-system-f200aadac57e


router.get("/userinfo", function (req, res) {
    var userType = userHelper.getUserType(req);
    var userInfo = userHelper.getUserInfo(req);
    userInfo["type"] = userType;
    console.log("sending user info");
    MoreHomeInfoHandler.getCurrentHomeObject(userHelper.getUserId(req), res, function (err, data) {
        if(err) {
        	console.log("-------------------------------------------");
            console.log("Error in getting current home info: " + err);
            console.log("-------------------------------------------");
            res.status(500).send("Error in fetching data");
        }
        else {
            var currentUserInfo = userHelper.getUserInfo(req);
            userInfo.houseid = userHelper.getDefaultHomeID(req);
            console.log("houseid:" + userInfo.houseid);

            if(userType == "Tenant") {

                //Get landlord information
                userHelper.getUserInfo(null, data.landlordEmail, null, function(err, landlordInfo) {
                    if(err) {
                        console.log("Error while fetching landlord details: " + err);
                        res.status(500).send("Error in fetching data");
                    }
                    else if(landlordInfo) {
                        userInfo.landlord = {
                            name: landlordInfo.firstName,
                            email: landlordInfo.email,
                            phone: landlordInfo.phoneNo
                        };
                    }
                    else {
                        userInfo.landlord = {
                            email: data.landlordEmail
                        };
                    }
                    res.send(userInfo);
                    res.end();
                });
            }
            else {
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
                                userInfo.tenants = tenantInfo;
                                res.send(userInfo);
                                res.end();
                            }
                        });
                    }
                });
            }

        }
    });

});

router.post('/topic', function(req,res) {
	console.log("got post request to create a topic");
    console.log("request body:");
    console.log(req);
    //console.log(JSON.stringify(req));
	//console.log(JSON.stringify(req.body));
  	result = topicHelper.newTopic(req.body, res);
	//res.end();
});

router.put('/topic', function(req,res) {
    console.log("got put request to change a topic");
    console.log("request body:");
    console.log(req.body);
    //console.log(JSON.stringify(req));
    //console.log(JSON.stringify(req.body));
    topicHelper.updateTopic(req.body, res);
    res.end();
    //res.end();
});

router.get('/topic', function(req,res) {
	var info = url.parse(req.url ,true);
	console.log("fetching topics per:");
    console.log(info.query);
	topicHelper.getTopics(info.query, res);
});

router.get('/topiccount', function(req,res) {
    var info = url.parse(req.url ,true);
    
    console.log(JSON.stringify(info.query));

    topicHelper.getTopicCount(info.query, res, function(err, res, count) {
        console.log("got count:"+ count);
        var result = {};
        result.count = count;
        result.cid = info.query.cid;
        res.send(result);
        res.end();
    });
});

router.post('/upload', function(req,res) {
    console.log("got post request to upload a file");

    var fileName = '';  
    var size = '';    
    var tempPath;
    var destPath = '';
    var extension;    
    var imageName;    
    var destPath = '';
    var inputStream;
    var outputStream;
    var form = new multiparty.Form();     
    
    form.on('error', function(err){      
      console.log('Error parsing form: ' + err.stack);    
    }); 

    form.on('part', function(part){      
        if(!part.filename){        
            return;      
        }   

        size = part.byteCount;      
        fileName = part.filename;    
    });     

    form.on('file', function(name, file){      
        tempPath = file.path;      
        extension = file.path.substring(file.path.lastIndexOf('.')); 
        console.log(JSON.stringify(file));     
        imageName = file.originalFilename;      
        destPath = path.join(__dirname, '../public/uploads/', imageName);      
        
        console.log("destpath:");
        console.log(destPath);

        inputStream = fs.createReadStream(tempPath);        
        outputStream = fs.createWriteStream(destPath);       
        inputStream.pipe(outputStream);

        inputStream.on('end', function(){         
            fs.unlinkSync(tempPath);        
            console.log('Uploaded: ', imageName, file.size);        
            res.send(imageName);
            res.end();
        });    
    });     

    form.on('close', function(){      
      console.log('Uploaded!!');   

    });

    form.parse(req);   
    
});

router.post('/msg', function(req,res) {
	console.log("got post request on msg endpoint");
	console.log(JSON.stringify(req.body));
  	var result = msgHelper.newMsg(req.body);
  	console.log(result);
  	res.send(result);
	res.end();
});

router.get('/msg', function(req,res) {
	var info = url.parse(req.url ,true);
	
	msgHelper.getMsgs(info.query, res);


});

router.get('/sample', function(req,res) {
  var info = url.parse(req.url ,true);
  var pathname = info["pathname"];  

	fs.readFile("./index.html", function(err, text){
	  res.setHeader("Content-Type", "text/html");
	  res.end(text);
	});
	return;

});

router.get('/', function(req, res, next) {
	console.log("rendering complaints.html");
	res.render('complaints.html', { title: 'instaRent-complaints' });
});

module.exports = router;
