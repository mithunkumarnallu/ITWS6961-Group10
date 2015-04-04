angular.module('ui.managehomes', ['ui.bootstrap']);
angular.module('ui.managehomes').directive("tenantContainer", function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs, ngModel) {
                //elem.find("#address").("autocomplete","on");
                //elem.find("#address")[0].attr("autocomplete","on");
                //console.log(elem.find("#tenant_address"));
                regsiterForAutoComplete(scope, elem.find("#tenant_address"));                
            }
        };
    }
);
angular.module('ui.managehomes').directive("landlordContainer", function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs, ngModel) {
                //elem.find("#address").("autocomplete","on");
                //elem.find("#address")[0].attr("autocomplete","on");
                regsiterForAutoComplete(scope, elem.find("#owner_address"));
            }
        };
    }
);
angular.module('ui.managehomes').controller('ModalDemoCtrl', ['$scope', '$http', '$modal', '$log', function ($scope, $http, $modal, $log) {
  
    $scope.radioModel = "Landlord";  
    $scope.getHomes = function() {
        console.log($http.get("/getHomes"));
    };
    
    $scope.homes = [];//[{address: "123, 123, 123"},{address: "234, 234, 234"}];

    $scope.addMapMarkers = function() {
        addMap();
        if(areMarkersToBeAdded) {
            $scope.homes = [];
            $http.get("/managehome/getHomes")
            .success(function(data, status){
                $scope.homes = $scope.homes.concat(data.response);
                data.response.forEach(function(home) {
                    //$.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='+data.response[x]+'&sensor=false', null, function (loc) {                    
                    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+home.address+'&sensor=false')
                    .success(function (loc, status) {
                        
                        (function(loc, home) {
                            //console.log(home);
                            var infoWindow = new google.maps.InfoWindow( {
                                //content: "<div class='info_content'><h3>Landlord at:</h3> <p>" + home.address + "</p><label ng-click=open('lg') class='btn btn-primary'>Set Home</label>"
                                content: "<div class='info_content'><h3>" + home.userType + " at:</h3> <p>" + home.address + "</p><label onclick=setHome('"+ home._id +"','" + home.userType + "') class='btn btn-primary'>Set Home</label>"
                            });
                            var p = loc.results[0].geometry.location
                            var latlng = new google.maps.LatLng(p.lat, p.lng);
                            var marker = new google.maps.Marker({
                                position: latlng,
                                map: map
                            });

                            //Add an info window to the marker and in click of a button on it, set the user's current home to it and redirect him to dashboard
                            //Allow each marker to have an info window    
                            google.maps.event.addListener(marker, 'click', (function(marker, infoWindow) {
                                
                                return createClickListener(infoWindow, marker);
                            })(marker, infoWindow));
                        })(loc, home);

                    });
                }            
            )})
            .error(function(data, status) {
                console.log(data);            
            });

            /*
            //get landlord homes and add markers
            $http.get("/managehome/getLandlordHomes")
            .success(function(data, status){
                $scope.homes = $scope.homes.concat(data.response);
                data.response.forEach(function(home) {
                    //$.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='+data.response[x]+'&sensor=false', null, function (loc) {                    
                    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+home.address+'&sensor=false')
                    .success(function (loc, status) {
                        
                        (function(loc, home) {
                            //console.log(home);
                            var infoWindow = new google.maps.InfoWindow( {
                                //content: "<div class='info_content'><h3>Landlord at:</h3> <p>" + home.address + "</p><label ng-click=open('lg') class='btn btn-primary'>Set Home</label>"
                                content: "<div class='info_content'><h3>Landlord at:</h3> <p>" + home.address + "</p><label onclick=setHome('"+ home._id +"','" + home.userType + "') class='btn btn-primary'>Set Home</label>"
                            });
                            var p = loc.results[0].geometry.location
                            var latlng = new google.maps.LatLng(p.lat, p.lng);
                            var marker = new google.maps.Marker({
                                position: latlng,
                                map: map
                            });

                            //Add an info window to the marker and in click of a button on it, set the user's current home to it and redirect him to dashboard
                            //Allow each marker to have an info window    
                            google.maps.event.addListener(marker, 'click', (function(marker, infoWindow) {
                                
                                return createClickListener(infoWindow, marker);
                            })(marker, infoWindow));
                        })(loc, home);

                    });
                }            
            )})
            .error(function(data, status) {
                console.log(data);            
            });
            
            //get tenant homes and add markers
            $http.get("/managehome/getTenantHomes")
            .success(function(data, status){
                $scope.homes = $scope.homes.concat(data.response);
                console.log($scope.homes);            
                data.response.forEach(function(home) {
                    //$.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='+data.response[x]+'&sensor=false', null, function (loc) {                    
                    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+home.address+'&sensor=false')
                    .success(function (loc, status) {
                        
                        (function(loc, home) {
                            //console.log(home);
                            var infoWindow = new google.maps.InfoWindow( {
                                //content: "<div class='info_content'><h3>Landlord at:</h3> <p>" + home.address + "</p><label ng-click=open('lg') class='btn btn-primary'>Set Home</label>"
                                content: "<div class='info_content'><h3>Tenant at:</h3> <p>" + home.address + "</p><label onclick=setHome('"+ home.id +"','" + home.userType + "') class='btn btn-primary'>Set Home</label>"
                            });
                            var p = loc.results[0].geometry.location
                            var latlng = new google.maps.LatLng(p.lat, p.lng);
                            var marker = new google.maps.Marker({
                                position: latlng,
                                map: map
                            });

                            //Add an info window to the marker and in click of a button on it, set the user's current home to it and redirect him to dashboard
                            //Allow each marker to have an info window    
                            google.maps.event.addListener(marker, 'click', (function(marker, infoWindow) {
                                
                                return createClickListener(infoWindow, marker);
                            })(marker, infoWindow));
                        })(loc, home);

                    });
                }            
            )})
            .error(function(data, status) {
                console.log(data);            
            });
            */
        }
    }

    $scope.addMapMarkers();
    
    $scope.openForUpdate = function(address, userType) {
        $scope.isHomeUpdate = true;
        $scope.address = address;
        $scope.radioModel = userType;
        console.log(userType);

        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          scope: $scope,
          size: 'lg',
          resolve: {
          
          }
        });

        modalInstance.result.then(function () {
            $scope.isHomeUpdate = false;
            $scope.address = "";
            //$scope.disabled = false; 
        }, function () {
            $scope.isHomeUpdate = false;
            $scope.address = "";
            //$scope.disabled = false;
        });
    };

    $scope.open = function (size) {

        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          scope: $scope,
          size: size,
          resolve: {
          
          }
        });

        modalInstance.result.then(function () {
              
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
    };
    //$scope.open("lg");
}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('ui.managehomes').controller('ModalInstanceCtrl', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {
    
    //Tenant variables
    $scope.tenant_description = "";
    $scope.tenant_address = "";
    $scope.tenant_landlordEmail = "";
    $scope.tenant_securityDeposit;
    $scope.tenant_rentPerMonth;
    $scope.tenant_tenantsEmails;
    $scope.tenant_leaseStartDate = new Date();
    $scope.tenant_leaseEndDate = new Date();
    
    //Landlord variables
    $scope.owner_description = "";
    $scope.owner_address = "";

    //Error variables
    $scope.myError = "";
    $scope.isError = false;

    $scope.isDisabled = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'dd-MMMM-yyyy';
    
    if($scope.isHomeUpdate) {
        //Set the scope variables and set their enability
        $scope.isDisabled = true;   
        var homeInfo = getHome($scope.address);
        console.log(homeInfo);
        if(homeInfo) {

            if($scope.radioModel == "Landlord") {
                //console.log("Setting isDisabled as true");
                $scope.owner_description = homeInfo.description;
                $scope.owner_address = homeInfo.address;
            } else {
                $scope.tenant_description = homeInfo.description;
                $scope.tenant_address = homeInfo.address;
                $scope.tenant_landlordEmail = homeInfo.landlordEmail;
                $scope.tenant_securityDeposit = homeInfo.securityDeposit;
                $scope.tenant_rentPerMonth = homeInfo.rentPerMonth;
                $scope.tenant_tenantsEmails = homeInfo.tenantsEmails;
                $scope.tenant_leaseStartDate = homeInfo.leaseStartDate;
                $scope.tenant_leaseEndDate = homeInfo.leaseEndDate;       
            }
        }
    }

    function getHome(address) {
        for(var i = 0; i < $scope.homes.length; i++) {
            if($scope.homes[i].address == address)
                return $scope.homes[i]; 
        }
    }

    $scope.ok = function () {
        if($scope.isHomeUpdate) {
            $http.post("/managehome/updatehome", getHomeParams())
            .success(function(data, status) {
                console.log("Update returned");
                $scope.myError = "";
                $scope.isError = false;
                areMarkersToBeAdded = true;
                $scope.addMapMarkers();
                $modalInstance.close();  
            })
            .error(function(data, status) {
                console.log(data);
                $scope.myError = data;
                $scope.isError = true;
            });
        } else {
            $http.post("/managehome/addhome", getHomeParams())
            .success(function(data, status){
                $scope.myError = "";
                $scope.isError = false;
                areMarkersToBeAdded = true;
                $scope.addMapMarkers();
                $modalInstance.close();  
            })
            .error(function(data, status) {
                console.log(data);
                $scope.myError = data;
                $scope.isError = true;
            });
        }
        //$modalInstance.getHomes();
    };

    function getHomeParams(){
        var homePars = {};
        if($scope.radioModel == "Landlord") {
            homeParams = {
                userType: $scope.radioModel,
                description: $scope.owner_description,
                address: $scope.owner_address
            };
            var home = getHome($scope.owner_address);
            if(home)
                homeParams.homeId = home._id;
        }
        else {
            homeParams = {
                userType: $scope.radioModel,
                description: $scope.tenant_description,
                address: $scope.tenant_address,
                landlordEmail: $scope.tenant_landlordEmail,
                leaseStartDate: $scope.tenant_leaseStartDate,
                leaseEndDate: $scope.tenant_leaseEndDate,
                securityDeposit: $scope.tenant_securityDeposit,
                rentPerMonth: $scope.tenant_rentPerMonth,
                tenantsEmails: $scope.tenant_tenantsEmails,
            };
            var home = getHome($scope.tenant_address);
            if (home)
                homeParams.homeId = home._id;
        }
        return homeParams;
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.setStartToday = function() {
        $scope.tenant_leaseStartDate = new Date();
    };
    
    $scope.setEndToday = function() {
        $scope.tenant_leaseEndDate = new Date();
    };
    
    $scope.startClear = function () {
        $scope.tenant_leaseStartDate = null;
    };
    
    $scope.endClear = function () {
        $scope.tenant_leaseEndDate = null;
    };

    $scope.openEndDate = function($event) {
        console.log("IN OpenDate funnction");
        $event.preventDefault();
        $event.stopPropagation();

        $scope.endOpened = true;
    };
    
    $scope.openStartDate = function($event) {
        console.log("IN OpenDate funnction");
        $event.preventDefault();
        $event.stopPropagation();

        $scope.startOpened = true;
    };
    
}]);

function regsiterForAutoComplete(scope, element) {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
    var autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */element[0],
      { types: ['geocode'] });
    
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        console.log(autocomplete.getPlace());
        if(scope.radioModel == "Landlord")
            scope.owner_address = autocomplete.getPlace().formatted_address;
        else
            scope.tenant_address = autocomplete.getPlace().formatted_address;
    });
}

var map = null;
var areMarkersToBeAdded = true;

function createClickListener(infoWindow, marker) {
    return function() {
        //var address = data.response[i];

        //infoWindow.setContent("<div class='info_content'><h3>Landlord at:</h3> <p>" + address + "</p>");
        infoWindow.open(map, marker);
    };
}



function setHome(homeId, userType) {
    console.log("In setHome " + userType + " " + homeId);
    
    $.post("/managehome/setDefaultHome", {id: homeId, userType: userType})
    .done(function(data, status) {
        console.log("Successully set home");
        window.location.replace("/");
    })
    .fail(function(err, status) {
        console.log(err);
    });

};

function addInfoWindows(loc, address, userType) {
    console.log(address);
    var infoWindow = new google.maps.InfoWindow( {
        content: "<div class='info_content'><h3> " + userType + " at:</h3> <p>" + address + "</p>"
    });
    var p = loc.results[0].geometry.location
    var latlng = new google.maps.LatLng(p.lat, p.lng);
    marker = new google.maps.Marker({
        position: latlng,
        map: map
    });

    //Add an info window to the marker and in click of a button on it, set the user's current home to it and redirect him to dashboard
    //Allow each marker to have an info window    
    google.maps.event.addListener(marker, 'click', (function(marker, infoWindow) {   
        return createClickListener(infoWindow, marker);
    }));
}

function addMap() {
    if(!map) {
        var myLatlng = new google.maps.LatLng(37.6,-95.665);
        var mapOptions = {
            zoom: 4,
            center: myLatlng
        };
        map = new google.maps.Map(document.getElementById("mapHolder"), mapOptions);    
    }
}
