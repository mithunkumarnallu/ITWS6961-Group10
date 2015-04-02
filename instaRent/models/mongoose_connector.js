var mongoose = require('mongoose');

// connect to mongodb
var db = mongoose.connection;
db.on('error', console.error);
mongoose.connect('mongodb://localhost:60000/instaRent');

exports.mongoose = mongoose;
exports.db = db;