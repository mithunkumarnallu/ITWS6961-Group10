var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;

var homeSchema = new mongoose.Schema({
  userId: String,
  address: String,
  description: String,
  userType: String
});

var Home = mongoose.model('Home', homeSchema);

function checkAndSave(home, res) {
	
	Home.find({userId : home.userId, address : home.address}, function(err, data) {
		//console.log(data);
		if(err || data.length > 0)
			res.status(409).send("Error: Address already exists");
		else
			home.save(function(err, saved) {
				if(err)
					res.status(409).send("Error Adding home");
				res.send("Success");
			});	
	});	
}; 

function getUserHomeAddresses(userId, res) {
	Home.find({userId: userId}, function(err, data) {		
		if(err || data.length == 0)
			res.status(409).send({status: "Error", response: "Error: No homes added!"});
		
		var addresses = [];
		for(var i = 0; i < data.length; i++) {
			addresses.push(data[i].address);
		}
		res.send({status: "Success", response: addresses});
	});
};

exports.getUserHomeAddresses = getUserHomeAddresses;
exports.checkAndSave = checkAndSave;
exports.Home = Home; 
