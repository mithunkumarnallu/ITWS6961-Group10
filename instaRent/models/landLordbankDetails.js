var mongoose = require('./mongoose_connector').mongoose;
var Schema = mongoose.Schema;
var LandLordBankDetails = new Schema({
    userId:String,
    bankAcc:String,
    routingNo:String
});

module.exports = mongoose.model('landLord', LandLordBankDetails);