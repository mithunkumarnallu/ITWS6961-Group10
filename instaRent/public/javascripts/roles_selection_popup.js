angular.module('ui.bootstrap.demo', ['ui.bootstrap']);
angular.module('ui.bootstrap.demo').directive("tenantContainer", function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs, ngModel) {
                //elem.find("#address").("autocomplete","on");
                //elem.find("#address")[0].attr("autocomplete","on");
                console.log(elem.find("#autocomplete"));
                regsiterForAutoComplete(elem.find("#autocomplete"));
            }
        };
    }
);

angular.module('ui.bootstrap.demo').controller('ModalDemoCtrl', function ($scope, $modal, $log) {
  
    $scope.radioModel = "Landlord";  
    
    $scope.open = function (size) {

        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
    };
    //$scope.open("lg");
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('ui.bootstrap.demo').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {    
    // Create the autocomplete object, restricting the search
    // to geographical location types.
    //var autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */
    //$('#address'),
    //  { types: ['geocode'] });
    $scope.startDate = new Date();
    $scope.endDate = new Date();
    
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'dd-MMMM-yyyy';
    
    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.setStartToday = function() {
        $scope.startDate = new Date();
    };
    
    $scope.setEndToday = function() {
        $scope.endDate = new Date();
    };
    
    $scope.startClear = function () {
        $scope.startDate = null;
    };
    
    $scope.endClear = function () {
        $scope.endDate = null;
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
    
});

function regsiterForAutoComplete(element) {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
    var autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */element[0],
      { types: ['geocode'] });
}