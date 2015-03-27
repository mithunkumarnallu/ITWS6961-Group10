var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;

var moreHomeInfo = new mongoose.Schema({
  userId: String,
  address: String,
  landlordEmail: String,
  leaseStartDate: Date,
  leaseEndDate: Date,
  rentPerMonth: Number,
  securityDeposit: Number
});

var MoreHomeInfo = mongoose.model('MoreHomeInfo', moreHomeInfo);

function checkAndSave(home, res) {
	
	MoreHomeInfo.find({userId : home.userId, address : home.address}, function(err, data) {
		console.log(data);
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

exports.checkAndSave = checkAndSave;
exports.MoreHomeInfo = MoreHomeInfo;