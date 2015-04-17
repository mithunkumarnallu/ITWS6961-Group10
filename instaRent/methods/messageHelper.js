Msg = require('../models/message.js').Msg;


msgHelper = function() {};

msgHelper.prototype.newMsg = function(data) {
    msg = new Msg(data);
    msg.save(function(err) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log("success");
            console.log(msg);
            return true;
        }
    });
};

msgHelper.prototype.getMsgs = function(data, res) {
    //console.log("category"+data.category);
    Msg.find({
        topicid: data.topicid
    }, function(err, data) {
        if(err) {
            console.log("error encountered when searching for messages");
            res.send("error");
            res.end();
        }
            
        else {
            console.log("fetching messages succeeded");

            res.send(data);
            res.end();
        }
    });
};

module.exports = msgHelper;
