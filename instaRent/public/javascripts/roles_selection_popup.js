angular.module('ui.managehomes', ['ui.bootstrap']);
angular.module('ui.managehomes').directive("tenantContainer", function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs, ngModel) {
                //elem.find("#address").("autocomplete","on");
                //elem.find("#address")[0].attr("autocomplete","on");
                console.log(elem.find("#tenant_address"));
                regsiterForAutoComplete(elem.find("#tenant_address"));
                regsiterForAutoComplete(elem.find("#owner_address"));
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
                regsiterForAutoComplete(elem.find("#owner_address"));
            }
        };
    }
);
angular.module('ui.managehomes').controller('ModalDemoCtrl', ['$scope', '$http', '$modal', '$log', function ($scope, $http, $modal, $log) {
  
    $scope.radioModel = "Landlord";  
    $scope.getHomes = function() {
        console.log($http.get("/getHomes"));
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
    // Create the autocomplete object, restricting the search
    // to geographical location types.
    //var autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */
    //$('#address'),
    //  { types: ['geocode'] });
    $scope.tenant_leaseStartDate = new Date();
    $scope.tenant_leaseEndDate = new Date();
    
    //Landlord variables
    $scope.owner_description = "";
    $scope.owner_address = "";

    //Error variables
    $scope.myError = "";
    $scope.isError = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'dd-MMMM-yyyy';
    
    $scope.ok = function () {
        console.log(getHomeParams())
        $http.post("/managehome/addhome", getHomeParams())
        .success(function(data, status){
            console.log("In success handler");
            $scope.myError = "";
            $scope.isError = false;
            $modalInstance.close();
            console.log(data);
        })
        .error(function(data, status) {
            console.log(data);
            $scope.myError = data;
            $scope.isError = true;
        });
        //$modalInstance.getHomes();

    };

    function getHomeParams(){
        if($scope.radioModel == "Landlord")
            return {
                userType: $scope.radioModel,
                description: $scope.owner_description,
                address: $scope.owner_address
            };
        else
            return {
                userTye: $scope.radioModel,
                description: $scope.tenant_description,
                address: $scope.tenant_address,
                landlordEmail: $scope.tenant_landlordEmail,
                leaseStartDate: $scope.tenant_leaseStartDate,
                leaseEndDate: $scope.tenant_leaseEndDate,   
                securityDeposit: $scope.tenant_securityDeposit,
                rentPerMonth: $scope.tenant_rentPerMonth,
                tenantsEmails: $scope.tenant_tenantsEmails
            };
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

function regsiterForAutoComplete(element) {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
    var autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */element[0],
      { types: ['geocode'] });
}