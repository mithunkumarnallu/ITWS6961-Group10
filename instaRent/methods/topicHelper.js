Topic = require('../models/topic.js').Topic;


topicHelper = function() {};

topicHelper.prototype.newTopic = function(data, res) {
    console.log("saving new topic into database:");
    console.log(data);
    topic = new Topic(data);
    topic.save(function(err) {
        if (err) {
            console.log(err);
            res.end();
        } else {
            console.log("creating topic succeeeded");
            res.end();
        }
    });
};

topicHelper.prototype.deleteTopic = function(data, res) {
    Topic.find({ _id:data.topicid }).remove( function() {
        console.log("deleted topic:");
        console.log(data.topicid);
        res.end();
    } ); 
}

topicHelper.prototype.getTopics = function(data, res) {
    console.log("category"+data.category);
    console.log("houseid:"+data.houseid);

    var params = {
        $or: [  {   
                    userid: data.userid,
                    category: data.category,
                    houseid: data.houseid
                }, 
                    
                { 
                    landlordid: data.userid, 
                    category: data.category,
                    houseid: data.houseid
                } ]
    };

    Topic.find(params, function(err, data) {
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


topicHelper.prototype.updateTopic = function(data, res) {
    console.log("updating a topic");

    var query = {
        _id : data._id
    };

    var result = {
        status: data.status
    };

    Topic.update(query, result,function(err, data) {
        if(err) {
            console.log("error encountered when searching for topics");
            res.send("error");
            res.end();
        }
            
        else {
            console.log("updating topic succeeded");
            console.log(JSON.stringify(data));
            res.end();
        }
    });
};

topicHelper.prototype.getTopicCount = function(data, res, callback) {
    console.log("getting count:");
    console.log("category:"+data.category);
    console.log("houseid:"+data.houseid);

    var params = {};
    if (data.category) {
        params = {
        $or: [  {   
                    userid: data.userid,
                    category: data.category,
                    houseid: data.houseid,
                    status: {$ne: data.nestatus}
                }, 
                    
                { 
                    landlordid: data.userid, 
                    category: data.category,
                    houseid: data.houseid,
                    status: {$ne: data.nestatus}
                } ]
        };


    } else {
        console.log("fetching topics count without category");
        params = {
        $or: [  {   
                    userid: data.userid,
                    houseid: data.houseid,
                    status: {$ne: data.nestatus}
                }, 
                    
                { 
                    landlordid: data.userid, 
                    houseid: data.houseid,
                    status: {$ne: data.nestatus}
                } ]
        };
    }

    Topic.find(params, function(err, data) {
        if(err) {
            console.log("error encountered when searching for topics");

            if (callback) {
                callback(err, res, data.length);
            } else {
                if (!res || res===null) {

                } else {
                    res.send("error");
                    res.end();
                }
                
            }

        }
            
        else {
            console.log("fetching topic count succeeded" );
            
            if (callback) {
                callback(null, res, data.length);
            } else {
                console.log("sending back info");
                console.log(data.length);
                
                if (!res || res===null) {

                } else {
                    res.send(data.length+"");
                    res.end();
                }
            }
        }
    });
};



/*topicHelper.prototype.getTopicCount = function(query, res, callBack) {
    callBack(null, null, 2);
};*/

module.exports = topicHelper;
