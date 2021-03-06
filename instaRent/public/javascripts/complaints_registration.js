var app = angular.module('complaintsApp', ['angularFileUpload']);
function fetchCategories() {
  categories = [
                  {
                    categoryID: 0,
                    name: 'Rent Complaints',
                    desc: 'Complaint topics regarding mishandling of payments',
                    css: 'panel-primary',
                    count: 0
                  }, 
                  {
                    categoryID: 1,
                    name: 'Maintenance Requests',
                    desc: 'Complaint topics regarding repair/ installation',
                    css: 'panel-success',
                    count: 0
                  }, 
                  {
                    categoryID: 2,
                    name: 'Miscellaneous',
                    desc: 'Complaint topics regarding various other types',
                    css: 'panel-info',
                    count:0
                  },
                  {
                    categoryID: 3,
                    name: 'Neighborhood',
                    desc: 'Complaint topics regarding neighborhood conflicts',
                    css: 'panel-warning',
                    count: 0
                  }
                ];
                
  return categories;
}

app.controller('complaintsController', ['$scope', '$timeout', '$http', '$upload',
    function ($scope, $timeout, $http, $upload ) {


  var ctrl = this;
  this.categories = fetchCategories();
  this.mode = 'categories';
  $mode = 'categories';
  this.userid = 0;
  this.valid = false;
  $scope.fname = "";

  var url = '/complaints/userinfo';
  
  $scope.landlordid = "tester@gmail.com";
  $scope.userid = "tester@gmail.com";
  $scope.userType = "Landlord";

  $scope.topicstyle = {
    'new': 'panel-primary',
    'processing': 'panel-danger',
    'finished': 'panel-success'
  };

  $scope.style = "panel-primary";

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
      $scope.landlordid = data.landlord.email;
      $scope.landlordfname = data.landlord.firstname;
      $scope.landlordlname = data.landlord.lastname;
    } else {
      $scope.landlordid = $scope.userid;
      $scope.landlordfname = $scope.firstName;
      $scope.landlordlname = $scope.lastName;
    }

    $scope.fetchTopicCounts();


  })

  //error handler
  .error(function(data, status, headers, config) {
    $scope.landlordid = "tester@gmail.com";
    $scope.userid = "tester@gmail.com";
    $scope.userType = "Landlord";

  });

  ctrl.isLandlord = function() {
    if ($scope.userType === 'Landlord') {
      return true;
    } else {
      return false;
    }
  }

  ctrl.setTopic = function(topic) {
    $scope.topic = topic;
  }

  

  $scope.fetchTopicCounts = function() {
    $scope.categories = fetchCategories();

    for (var i = 0; i < 4; i++) {
      var url = '/complaints/topiccount' +"?userid="+$scope.userid 
                +"&houseid="+ $scope.houseid + "&category="+categories[i].name+"&nestatus=finished"
                +"&cid="+i;

      $http.get(url)
      //upon success, refresh the data and update the views
      .success(function(data, status, headers, config) {
        $scope.categories[data.cid].count = data.count;
      })

      //error handler
      .error(function(data, status, headers, config) {
        

      });
    }
  }


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
    $scope.mode = mode;
    $scope.fetchTopicCounts();

    if ($scope.mode === 'topics') {
      if ($scope.category != undefined ) {
        ctrl.fetchTopics($scope.category);
      }
      
    }

  }


  this.changeStatus = function(topic, sid) {
    if ($scope.userType === 'Tenant') {
      //remove comment before going to production
      return;
    }

    statuses = ['new', 'processing', 'finished'];
    ids = { 'new':0, 
            'processing' : 1, 
            'finished' :2
          };

    topic.status = statuses[sid];

    var info = {
      _id: topic._id,
      status: topic.status
    };

    $http.put('/complaints/topic', info).
      success(function(data, status, headers, config) {
        //alert(JSON.stringify(info));
        $scope.fetchTopics($scope.category);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });


  }

  $scope.workingTopic = function() {
    if ($scope.topic.status == 'finished') {
      return false;
    } else {
      return true;
    }
  }

  this.fetchMsgs = function(topic) {
    $scope.topic = topic;
    $scope.topicid = topic._id + "";
    this.userid = $scope.userid;
    this.tenantid = topic.tenantid;
    this.landlordid = topic.landlordid;

    if ($scope.userType != 'Tenant') {
      this.to = topic.userid;
      this.from = this.landlordid;

      /*if ($scope.landlordlname == 'undefined') {
        this.totext = "To:" + $scope.landlordid;
      } else {
        this.totext = "To: " + $scope.landlordlname + "," + $scope.landlordfname + " <" + $scope.landlordid  + ">";
      }*/
      this.totext = "To: " + $scope.topic.lastname + "," + $scope.topic.firstname + " <" + $scope.topic.userid  + ">";
      this.fromtext = "From: " + $scope.lastName + "," + $scope.firstName + " <" + $scope.userid  + ">";

    } else {
      this.to = topic.landlordid;
      this.from = this.userid;

      if ($scope.landlordlname == 'undefined') {
        this.totext = "To:" + $scope.landlordid;
      } else {
        this.totext = "To: " + $scope.landlordlname + "," + $scope.landlordfname + " <" + $scope.landlordid  + ">";
      }

      this.fromtext = "From: " + $scope.lastName + "," + $scope.firstName + " <" + $scope.userid  + ">";



    }

    this.mode = "msgs";
    $mode = "msgs";

    var url = "/complaints/msg?" + "topicid=" + $scope.topicid + "&houseid=" 
              + $scope.houseid;

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

    var url = "/complaints/topic?" + "category=" + category.name + 
            "&userid=" + $scope.userid + "&houseid=" + $scope.houseid ;
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

  ctrl.deleteTopic = function() {
    var url = "";
    url = "/complaints/topic?" + "topicid=" + $scope.topic._id; 
    //fetch tweets using the backend API
    $http.delete(url)
      //upon success, refresh the data and update the views
      .success(function(data, status, headers, config) {
        ctrl.fetchTopics($scope.category);
      })

      //error handler
      .error(function(data, status, headers, config) {

      });

  }

  this.setDate = function() {
    this.date = new Date();
    $scope.files = [];
    $scope.fname = "";
    ctrl.newmsg = "";
  }

  this.hasFile = function(msg) {
    if (msg.fname && msg.fname !== "") {
      return true;
    }

    return false;
  }

  this.normalFile = function(msg) {
    if (!(msg.fname && msg.fname !== "")) {
      return false;
    }

    var str = msg.fname;
    if (str.length > 3 ) {
      var ftype = str.substr(str.length - 3);
      if (ftype === 'png' || ftype === 'jpg') {
        return false;
      }
    }

    return true;
  }

  this.imageFile = function(msg) {
    if (!(msg.fname && msg.fname !== "")) {
      return false;
    }

    var str = msg.fname;
    if (str.length > 3 ) {
      var ftype = str.substr(str.length - 3);
      if (ftype === 'png' || ftype === 'jpg') {
        return true;
      }
    }

    return false;
  }

  this.newTopic = function() {
    this.userid = $scope.userid;

    var info = {
      name: this.newtopic,
      userType: $scope.userType,
      userid: $scope.userid,
      landlordid: $scope.landlordid,
      date: new Date(),
      category: $scope.selectedCategory,
      status: 'new',
      houseid: $scope.houseid,

      firstname: $scope.firstName,
      lastname: $scope.lastName
    };

    $http.post('/complaints/topic', info).
      success(function(data, status, headers, config) {
        //alert(JSON.stringify(info));
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

    if (this.newmsg === '') {
      return;
    }

    this.topicid = $scope.topicid;
    var info = {
      topicid: $scope.topicid + "",
      message: this.newmsg,
      userType: $scope.userType,
      senderid: this.userid,
      landlordid: $scope.landlordid,
      date: new Date(),
      fname: $scope.fname,
      firstname: $scope.firstName,
      lastname: $scope.lastName
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

  this.newMsgButton = function() {
    if (ctrl.mode === 'msgs' && $scope.topic.status != 'finished') {

      return true;
    } else {
      return false;
    }
  }

  this.msgStyle = function(msg) {
    if (msg.senderid === $scope.userid) {
      return "panel-success";
    } else {
      return "panel-danger";
    }
  }


  this.clear = function() {
    $scope.fname = "";
  }

  

  $scope.isTenant = function() {
    if ($scope.userType == 'Tenant') {
      return true;
    } else {
      return false;
    }
  }

  $scope.onFileSelect = function (files) {
    if ($scope.files.length === 0) {
      return;
    }

    var uploadFile = function (fileIndex) {
      var url = "/complaints/upload";

      $scope.fname = $scope.files[fileIndex].name;

      return $upload
        .upload({
          method: 'POST',
          url: url,
          data: {
            filePath: $scope.files[fileIndex].name,
            projectName: "projectName",
          },
          file: $scope.files[fileIndex]
        })
        
        .then(function (newFileStructure) {
          if ($scope.files.length > fileIndex + 1) {
            return uploadFile(fileIndex + 1);
          } else {
            return true;
          }
        })

        .catch(function (error) {
          console.log('Error Uploading File: ', error);
        });
    };

    uploadFile(0)
      .then(function () {
        //alert('All Files Uploaded');
        
      });
  };



}]);


//inject angular file upload directives and services.
var app2 = angular.module('fileUpload', ['angularFileUpload']);

app2.controller('uploadCtrl', ['$scope', '$upload', function ($scope, $upload) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    var url = "/complaints/upload";

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    url: url,
                    fields: {'userid': $scope.userid},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
            }
        }
    };
}]);
