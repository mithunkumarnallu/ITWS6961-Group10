var mongoose = require("./mongoose_connector").mongoose;
var db = require("./mongoose_connector").db;
var homeInfo = require("./home");
var userHelper = require("../methods/userHelper");
userHelper = new userHelper();
var Home = require("../models/home").Home;
var Schema = mongoose.Schema;


var PaymentHistory = new Schema({
    payment_date:String,
    amount_charged:Number,
    description:String,
    userID:String,
    status:String,
    landlordEmail:String
});

var payment_history = mongoose.model('PaymentHistory', PaymentHistory);





























exports.payment_history = payment_history;