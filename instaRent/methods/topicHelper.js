Topic = require('../models/topic.js').Topic;


topicHelper = function() {};

topicHelper.prototype.newTopic = function(data) {
    console.log("saving new topic into database:");
    console.log(data);
    topic = new Topic(data);
    topic.save(function(err) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log("success");
            console.log(topic);
            return true;
        }
    });
};

topicHelper.prototype.getTopics = function(data, res) {
    console.log("category"+data.category);
    Topic.find({
        $or: [  {   
                    userid: data.userid,
                    category: data.category
                }, 
                    
                { 
                    landlordid: data.userid, 
                    category: data.category
                } ]
    }, function(err, data) {
        if(err) {
            console.log("error encountered when searching for topics");
            res.send("error");
            res.end();
        }
            
        else {
            console.log("fetching topics succeeded");

            res.send(data);
            res.end();
        }
    });
};

topicHelper.prototype.getTopicCount = function(query, res, callBack) {
    callBack(null, null, 2);
};

module.exports = topicHelper;
