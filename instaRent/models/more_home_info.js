var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var HomeHandler = require("../models/home");
var mailHandler = require("../methods/mailerHandler");
var invitationHandler = require("../models/invitation_schema");

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

//Send emails to fellow tenants and landlord by parsing moreHome object
function sendInvitationsToUsers(mailer, userType, moreHome) {
    if(userType == "Tenant") {
        var tenantEmails = getTenantEmails(moreHome);
        var homeId;
        if("_id" in moreHome)
            homeId = moreHome._id;
        else
            homeId = moreHome.homeId;

        for (var i = 0; i < tenantEmails.length; i++) {
            mailHandler.sendInvitation(mailer, tenantEmails[i], "Tenant", homeId, moreHome.address);
        }
        mailHandler.sendInvitation(mailer, moreHome.landlordEmail, "Landlord", homeId, moreHome.address);
        //HomeHandler.deleteOldUsersFromHome(tenantEmails, homeId);
        //invitationHandler.deleteOldUsersInvitations(tenantEmails, homeId);
    }
}

function getTenantEmails(moreHome) {
    var tenantEmails = moreHome.tenantsEmails.split(";");
    for(var i = 0; i < tenantEmails.length; i++) {
        tenantEmails[i] = tenantEmails[i].trim();
    }
    return tenantEmails;
}

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
			HomeHandler.isHomeAddedToUser(userHelper.getUserId(req), data._id, function (emailId, homeId, err) {
                if(err)
                    res.status(409).send("Error: Home already exists");
                else {
                    //update the record in database
                    if(req.body.userType == "Tenant") {
                        var tenantEmails = getTenantEmails(moreHome);
                        moreHome.rentPerMonthPerUser = (moreHome.rentPerMonth / (tenantEmails.length + 1)).toFixed(2);
                    }
                    MoreHomeInfo.update({address : moreHome.address}, moreHome, {}, function(err, numEffected) {
                        console.log(numEffected);
                        if(err || numEffected == 0) {
                            console.log(err);
                            res.status(409).send("Error: Could not add home");
                        }
                        else {
                            sendInvitationsToUsers(res.mailer, req.body.userType, data);
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
            } );

		} 
		else {
			moreHome = new MoreHomeInfo(moreHome);


            if(req.body.userType == "Tenant")
            {
                var tenantEmails = getTenantEmails(moreHome);
                moreHome.rentPerMonthPerUser = (moreHome.rentPerMonth / (tenantEmails.length + 1)).toFixed(2);
            }

            moreHome.save(function(err, moreHome) {
				if(err)
					res.status(409).send("Error Adding home");
				else {
                    sendInvitationsToUsers(res.mailer, req.body.userType, moreHome);
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
    var tenantEmails = getTenantEmails(home);
   // home.rentPerMonthPerUser = (home.rentPerMonth / (tenantEmails.length + 1)).toFixed(2);
    MoreHomeInfo.update({_id: home.homeId, address : home.address}, home, {}, function(err, numEffected) {
		//console.log(data);
		if(err || numEffected == 0) {
			console.log(err);
			res.status(409).send("Error: Could not find existing home");
		}
		else {
            sendInvitationsToUsers(res.mailer,req.body.userType, home);
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



function getrentPerMonth(homeId, callback){
    MoreHomeInfo.findOne({_id:homeId}, function(err, data){
        //if(err || data.length == 0)
        // res.status(409).send({status: "Error", response: "Error: No such home!"});
        if(err)
            callback(err);
        else {
            var rentDueIn = getRentDueIn(data.leaseStartDate, data.leaseEndDate);

            if (rentDueIn.isProRate)
                data = (data.rentPerMonthPerUser * rentDueIn.daysOfStay).toFixed(2);
            else
                data = data.rentPerMonthPerUser;

            callback(null, data);
        }
        //res.send({status: "Success", response: data.rentPerMonth});
    });
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function getRentDueIn(leastStartDate, leaseEndDate) {
    var result = {
        isProRate: false
    };
    var d = new Date();
    if (d.getMonth() == leastStartDate.getMonth()) {
        result.isProRate = true;
        result.rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - leastStartDate.getDate();
        result.daysOfStay = 1 - (d.getDate() / (daysInMonth(d.getMonth(), d.getYear()) - d.getDate())).toFixed(2);
    }
    else if (d.getMonth() == leaseEndDate.getMonth()) {
        result.isProRate = true;
        result.rentDueIn = leaseEndDate.getDate() - d.getDate();
        result.daysOfStay = 1 - (d.getDate() / leaseEndDate.getDate()).toFixed(2);
    }
    else {
        result.rentDueIn = daysInMonth(d.getMonth(), d.getYear()) - d.getDate();
    }
    return result;
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function getCurrentHomeObject(emailId, res, callback) {
    userHelper.getDefaultHome(emailId, res, function(err, data) {
       if(!err && data) {
           MoreHomeInfo.findById(data, function (err, data) {
               if(!err && data) {
                   callback(null, data);
               }
               else
                   callback(err);
           });
       }
       else {
           callback(err);
       }

    });
}

exports.update = update;
exports.getUserHomeAddresses = getUserHomeAddresses;
exports.checkAndSave = checkAndSave;
exports.MoreHomeInfo = MoreHomeInfo;
exports.getrentPerMonth = getrentPerMonth;
exports.getCurrentHomeObject = getCurrentHomeObject;
exports.getRentDueIn = getRentDueIn;

