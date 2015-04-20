var mongoose = require('./mongoose_connector').mongoose;
var Schema = mongoose.Schema;
var TopicSchema = new Schema({

 name: String,
 userType: String,
 userid: String,
 landlordid: String,
 date: Date,
 status: String,
 category: String,
 houseid: String
 
});


var Topic=mongoose.model('Topic',TopicSchema);

exports.Topic=Topic;

