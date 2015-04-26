var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;

var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

var userHelper = require("../methods/userHelper");
userHelper = new userHelper();

var homeSchema = new mongoose.Schema({
    userId: String,
    homeId: String,
    description: String,
    userType: String,
    isHomeActiveForUser: {type: Boolean, required: false, default: true}
});

var Home = mongoose.model('Home', homeSchema);

function saveHome(home, callback) {
    home.save(callback);
}

function checkAndSave(home, res, overwrite) {

	Home.findOne({userId : home.userId, homeId : home.homeId}, function(err, data) {
		//console.log(data);
		if(err)
			res.status(409).send("Error: Address already exists");
		else if(data && !overwrite) {
			Home.update({userId : home.userId, homeId: home.homeId}, home, {}, function(err, numEffected) {
				if(err || numEffected == 0) {
					console.log(err);
					res.status(409).send("Error: Could not add home");
				}
			});
		}
		else {
			home = new Home(home);
			home.save(function(err, saved) {
				if(err)	{
					res.status(409).send("Error Adding home");
				}
				else
					res.send("Success");
			});
		}
	});
};

function update(home, res) {
	//console.log(home);
	Home.update({userId: home.userId,  homeId : home.homeId}, home, {}, function(err, numEffected) {
		//console.log(data);
		if(err || numEffected == 0)
			res.status(409).send("Error: Could not find existing home");
		else
			res.send("Success");
	});
	/*
	MoreHomeInfo.findOne({address: home.address}, function(err, data) {
		Home.update({userId: home.userId,  homeId : home.homeId}, home, {}, function(err, numEffected) {
			//console.log(data);
			if(err || numEffected == 0)
				res.status(409).send("Error: Could not find existing home");
			else
				res.send("Success");
		});
	});
	*/
};

function getUserHomeAddresses(userId, res) {
	Home.find({userId: userId, isHomeActiveForUser: true}, function(err, data) {
		if(err || data.length == 0)
			res.status(409).send({status: "Error", response: "Error: No homes added!"});
		else{
		  	var addresses = [];
		  	res.send({status: "Success", response: data});
         }
	});
};

function isHomeAddedToUser(emailId, homeId, isHomeActive, callback) {
    if(isHomeActive === true || isHomeActive === false) {
        Home.findOne({userId: emailId, homeId: homeId, isHomeActiveForUser: isHomeActive}, function(err, data) {
            if(!err && data === null)
                callback(emailId, homeId);
            else
                callback(emailId, homeId, "Home already exists");
        });
    }
    else {
        Home.findOne({userId: emailId, homeId: homeId}, function (err, data) {
            if (!err && data === null)
                callback(emailId, homeId);
            else
                callback(emailId, homeId, "Home already exists");
        });
    }
};

function deleteOldUsersFromHome(emailIds, homeId, loggedInUserId) {
    Home.find({homeId: homeId, userType: "Tenant"}, function (err, homes) {
        if(err)
            console.log("Could not get users for homeId: " + homeId);
        else {
            var emailIdsMap = {};
            for (var i = 0; i < emailIds.length; i++) {
                emailIdsMap[emailIds[i]] = "";
            }
            homes.forEach(function (data) {
                if (!(data.userId in emailIdsMap) && data.userId !== loggedInUserId) {
                    userHelper.getDefaultHome(data.userId, null, function (err, defaultHome) {
                        if (!err && defaultHome && defaultHome === homeId) {
                            userHelper.setDefaultHome(null, data.userId, {}, function (err, data1) {
                            });
                        }
                    });
                    data.isHomeActiveForUser = false;
                    data.save();
                }
            });
        }
    });
}

function getHomeId(userId,res){
  Home.find({userId:userId},function(err,data){
    if(err||data.length==0)
      res.status(409).send({
        status:"Error",
        response:"Error: No such User!"
      });
    else
      res.send({
        status:"Error",
        response: data.homeId
      });
  });
};

function getUserIdsForAHome(homeId, userType, callback) {
    if(userType)
        Home.find({homeId: homeId, userType: userType}, callback);
    else
        Home.find({homeId: homeId}, callback);
}

exports.isHomeAddedToUser = isHomeAddedToUser;
exports.getUserHomeAddresses = getUserHomeAddresses;
exports.checkAndSave = checkAndSave;
exports.Home = Home;
exports.saveHome = saveHome;
exports.update = update;
exports.getHomeId=getHomeId;
exports.deleteOldUsersFromHome = deleteOldUsersFromHome;
exports.getUserIdsForAHome = getUserIdsForAHome;