var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");

var moreHomeInfo = new mongoose.Schema({
  //homeId: String,
  address: String,
  landlordEmail: String,
  leaseStartDate: Date,
  leaseEndDate: Date,
  rentPerMonth: Number,
  rentPerMonthPerUser: Number,
  securityDeposit: Number,
  tenantsEmails: String
});

var MoreHomeInfo = mongoose.model('MoreHomeInfo', moreHomeInfo);

function checkAndSave(moreHome, req, res, overwrite) {
	console.log(moreHome);
	var userId = userHelper.getUserId(req);
	console.log("In more_home_info's check and save" + moreHome);
	MoreHomeInfo.findOne({address : moreHome.address}, function(err, data) {
		console.log(data);
		if(err)
			res.status(409).send("Error: Adding home");
		else if(data && !overwrite) {
			res.status(409).send("Error: Home already exists");
		}
		else if(data) {
			//update the record in database
			MoreHomeInfo.update({address : moreHome.address}, moreHome, {}, function(err, numEffected) {
				console.log(numEffected);
				if(err || numEffected == 0) {
					console.log(err);
					res.status(409).send("Error: Could not add home");
				}
				else {
					var home = {
						userId: userId,
						homeId: data._id,
						description: req.body.description,
						userType: req.body.userType
					}; 
					HomeHandler.checkAndSave(home, res, true);
				}
			});
		} 
		else {
			moreHome = new MoreHomeInfo(moreHomeInfo);
			moreHome.save(function(err, moreHome) {
				if(err)
					res.status(409).send("Error Adding home");
				else {	
					var home = {
						userId: userId,
						homeId: moreHome._id,
						description: req.body.description,
						userType: req.body.userType
					}; 
					HomeHandler.checkAndSave(home, res, true);
				}
			});
		}	
	});	
}; 

function update(home, userId, req, res) {
	//console.log(home);
	MoreHomeInfo.update({_id: home.homeId, address : home.address}, home, {}, function(err, numEffected) {
		//console.log(data);
		if(err || numEffected == 0) {
			console.log(err);
			res.status(409).send("Error: Could not find existing home");
		}
		else {
			var moreHomeInfo = {
				userId: userId,
				address: req.body.address,
				description: req.body.description,
				homeId: req.body.homeId
			};
			HomeHandler.update(moreHomeInfo, res);
		}
	});	
}; 

//gets landlord as well as tenant home addresses
function getUserHomeAddresses(userId, res) {
	homeInfo.Home.find({userId: userId, userType: "Landlord"}, function(err, data) {		
		if(err)
			res.status(409).send({status: "Error", response: "Error: No homes added!"});
		else if(data.length == 0) {
			var result = [];
			homeInfo.Home.find({userId: userId, userType: "Tenant"}, function(err, data) {
				console.log("Tenant home ids are: " + JSON.stringify(data));				
				if(err)
					res.status(409).send({status: "Error", response: "Error: No homes added!"});
				else if(data.length == 0) {
					res.send({status: "Success", response: result});
				}
				else {
					var homeIds = [];
					for(var i = 0; i < data.length; i++) {
		                homeIds.push({_id: data[i].homeId});
		            }
		            MoreHomeInfo.find({$or: homeIds}, function(err, tenantHomes) {
						//console.log("Tenant homes are: " + JSON.stringify(tenantHomes));	
						if(err)
							res.status(409).send({status: "Error", response: "Error in getting homes!"});	
						else {
							for(var i = 0; i < tenantHomes.length; i++) {
								var tenantHome = JSON.parse(JSON.stringify(tenantHomes[i]));
								tenantHome.userType = "Tenant";
								tenantHome.description = data[i].description;
								//console.log("Pusing " + tenantHome + " into result");
								result.push(tenantHome);
							}
							res.send({status: "Success", response: result});
						}
					});
				}
			});
		}
		else {
			var result = [];
			var homeIds = [];
			for(var i = 0; i < data.length; i++) {
                homeIds.push({_id: data[i].homeId});
            }
            
            MoreHomeInfo.find({$or: homeIds}, function(err, landlordHomes) {
				//console.log("Landlord homes are: " + JSON.stringify(landlordHomes));	
				if(err)
					res.status(409).send({status: "Error", response: "Error in getting homes!"});	
				else {
					for(var i = 0; i < landlordHomes.length; i++) {
						var landlordHome = JSON.parse(JSON.stringify(landlordHomes[i])); //Object.create(landlordHomes[i]);
						landlordHome["userType"] = "Landlord";
						landlordHome["description"] = data[i].description;
						result.push(landlordHome);
					}
					homeInfo.Home.find({userId: userId, userType: "Tenant"}, function(err, data) {
					console.log("Tenant home ids are: " + JSON.stringify(data));				
					if(err)
						res.status(409).send({status: "Error", response: "Error: No homes added!"});
					else if(data.length == 0) {
						res.send({status: "Success", response: result});
					}
					else {
						var homeIds = [];
						for(var i = 0; i < data.length; i++) {
			                homeIds.push({_id: data[i].homeId});
			            }
			            MoreHomeInfo.find({$or: homeIds}, function(err, tenantHomes) {
							//console.log("Tenant homes are: " + JSON.stringify(tenantHomes));	
							if(err)
								res.status(409).send({status: "Error", response: "Error in getting homes!"});	
							else {
								for(var i = 0; i < tenantHomes.length; i++) {
									var tenantHome = JSON.parse(JSON.stringify(tenantHomes[i]));
									tenantHome.userType = "Tenant";
									tenantHome.description = data[i].description;
									//console.log("Pusing " + tenantHome + " into result");
									result.push(tenantHome);
								}
								res.send({status: "Success", response: result});
							}
						});
					}
				});
            }
        });
        } 
	});
};

function getrentPerMonth(homeId,res){
	MoreHomeInfo.findOne({_id:homeId}, function(err, data){
		if(err || data.length == 0)
			res.status(409).send({status: "Error", response: "Error: No such home!"});

		res.send({status: "Success", response: data.rentPerMonth});
	});


}

exports.update = update;
exports.getUserHomeAddresses = getUserHomeAddresses;
exports.checkAndSave = checkAndSave;
exports.MoreHomeInfo = MoreHomeInfo;
exports.getrentPerMonth = getrentPerMonth;
