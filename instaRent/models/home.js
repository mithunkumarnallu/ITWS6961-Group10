var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;

var MoreHomeInfo = require("../models/more_home_info").MoreHomeInfo;
var MoreHomeInfoHandler = require("../models/more_home_info");

var homeSchema = new mongoose.Schema({
  userId: String,
  homeId: String,
  description: String,
  userType: String
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
	Home.find({userId: userId}, function(err, data) {		
		if(err || data.length == 0)
			res.status(409).send({status: "Error", response: "Error: No homes added!"});
		else{
		  	var addresses = [];
			/*
			for(var i = 0; i < data.length; i++) {
				addresses.push({address: data[i].address, id: data[i]._id, userType: "Landlord"});
			}
			*/
		  	res.send({status: "Success", response: data});		
         }
	});
};

exports.update = update;
exports.getUserHomeAddresses = getUserHomeAddresses;
exports.checkAndSave = checkAndSave;
exports.Home = Home;
exports.saveHome = saveHome;
