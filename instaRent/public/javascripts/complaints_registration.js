var app = angular.module('complaintsApp', []);
function fetchCategories() {

  categories = [
                  {
                    categoryID: 0,
                    name: 'Rent Complaints'
                  }, 
                  {
                    categoryID: 1,
                    name: 'Maintenance Requests'
                  }, 
                  {
                    categoryID: 2,
                    name: 'Miscellaneous'
                  },
                  {
                    categoryID: 3,
                    name: 'Neighborhood'
                  }
                ];
                
  return categories;
}

app.controller('complaintsController', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
  this.categories = fetchCategories();
  this.mode = 'categories';
  $mode = 'categories';
  this.userid = 0;
  this.valid = false;

  var url = '/complaints/userinfo';
  
  $scope.landlordid = "tester@gmail.com";
  $scope.userid = "tester@gmail.com";
  $scope.userType = "Landlord";

  $http.get(url)
  //upon success, refresh the data and update the views
  .success(function(data, status, headers, config) {
    $scope.userid = data.email;
    $scope.firstName = data.firstName;
    $scope.lastName = data.lastName;
    $scope.userType = data["type"];
    $scope.houseid = data.houseid;
    $scope.valid = true;

    if ($scope.userType == 'Tenant') {
      $scope.landlordid = data.landlord;
    } else {
      $scope.landlordid = $scope.userid;
    }

  })

  //error handler
  .error(function(data, status, headers, config) {
    $scope.landlordid = "tester@gmail.com";
    $scope.userid = "tester@gmail.com";
    $scope.userType = "Landlord";

  });

  $timeout(function() {
    this.userid = $scope.userid;
    this.firstName = $scope.firstName;
    this.lastName = $scope.lastName;
    this.userType = $scope.userType;
    this.houseid = $scope.houseid;
    this.valid = $scope.valid;
    this.landlordid = $scope.landlordid;
  }, 200);

  this.setMode = function(mode) {
    this.mode = mode;
    $mode = mode;
  }


  this.changeStatus = function(topic) {
    statuses = ['new', 'processing', 'finished'];
    ids = { 'new':0, 
            'processing' : 1, 
            'finished' :2
          };

    topic.status = statuses[(ids[topic.status]+1) % 3];

  }

  this.fetchMsgs = function(topic) {
    $scope.topic = topic;
    $scope.topicid = topic._id + "";
    this.userid = $scope.userid;
    this.tenantid = topic.tenantid;
    this.landlordid = topic.landlordid;

    if (this.userid == topic.landlordid) {
      this.to = topic.userid;
      this.from = this.landlordid;
    } else {
      this.to = topic.landlordid;
      this.from = this.userid;
    }

    
    this.mode = "msgs";
    $mode = "msgs";
    /*this.msgs = [
      {
        msgid : 0,
        tenantid : 0,
        landlordid: 0,
        senderid: 0,
        date: 1,
        message: "hello I got a problem with dog barking...."
      },
      {
        msgid : 1,
        tenantid : 0,
        landlordid: 0,
        senderid: 1,
        date: 2,
        message: "hello I got a rain dropping problem...."
      },
      {
        msgid : 2,
        tenantid : 0,
        landlordid: 0,
        senderid: 0,
        date: 3,
        message: "the house is on fire omg...."
      },
      {
        msgid : 3,
        tenantid : 0,
        landlordid: 0,
        senderid: 1,
        date: 4,
        message: "my neighbor is too noisy...."
      }
    ];*/

    var url = "/complaints/msg?" + "topicid=" + $scope.topicid;
    $http.get(url).
    //upon success, refresh the data and update the views
    success(function(data, status, headers, config) {
      $scope.msgs = data;
    }).

    //error handler
    error(function(data, status, headers, config) {

    });


  }

  $scope.fetchMsgs = this.fetchMsgs;

  this.fetchTopics = function (category) {
    this.selectedCategory = category.name;
    $scope.selectedCategory = category.name;
    $scope.category = category;
    this.mode = 'topics';
    $mode = 'topics';

    /*this.topics = [
      {
        topicid : 0,
        tenantid : 0,
        landlordid: 0,
        date: 0,
        name: "water is leaking",
        status: 'processing'
      },
      {
        topicid : 1,
        tenantid : 0,
        landlordid: 0,
        date: 0,
        name: "dog is barking",
        status: 'finished'
      },
      {
        topicid : 2,
        tenantid : 0,
        landlordid: 0,
        date: 0,
        name: "wall collapsed",
        status: 'new'
      },
      {
        topicid : 3,
        tenantid : 0,
        landlordid: 0,
        date: 0,
        name: "man is flying",
        status: 'new'
      }
    ];*/

    var url = "/complaints/topic?" + "category=" + category.name + "&userid=" + $scope.userid  ;
    $http.get(url).
    //upon success, refresh the data and update the views
    success(function(data, status, headers, config) {
      $scope.topics = data;
    }).

    //error handler
    error(function(data, status, headers, config) {

    });


    
    
  }

  $scope.fetchTopics = this.fetchTopics;

  this.setDate = function() {
    this.date = new Date();
  }

  this.newTopic = function() {
    this.userid = $scope.userid;

    var info = {
      name: this.newtopic,
      userType: $scope.userType,
      userid: this.userid,
      landlordid: $scope.landlordid,
      date: new Date(),
      category: $scope.selectedCategory,
      status: 'new'
    };

    $http.post('/complaints/topic', info).
      success(function(data, status, headers, config) {
        $scope.fetchTopics($scope.category);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    $timeout(function() {

    }, 200);

  }

  this.newMsg = function() {
    this.topicid = $scope.topicid;

    var info = {
      topicid: $scope.topicid + "",
      message: this.newmsg,
      userType: $scope.userType,
      senderid: this.userid,
      landlordid: $scope.landlordid,
      date: new Date() 
    };

    $http.post('/complaints/msg', info).
      success(function(data, status, headers, config) {
        $scope.fetchMsgs($scope.topic);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    $timeout(function() {

    }, 200);

  }



}]);

