angular.module('complaints', ['ui.bootstrap']);
angular.module('complaints').controller('ComplaintsSelector', function ($scope) {
  $scope.fetchHouses = function() {
    var houses = [
        "Park Ridge",
        "Troy Garden",
        "City Station"
    ];
    return houses;
  };

  $scope.categories = [];
  $scope.checkCategoryModel = [];
  $scope.msgs = [];
  $scope.selectedHouse = "";
  //$scope.checkMsgModel = [];
  $scope.fetchCategories = function(house) {
    $scope.msgs = [];
    $scope.selectedHouse = house;
    $scope.categoryList = {
        "Park Ridge": [
            "Electricity Maintenance",
            "Rent Reconciliation",
            "Noise Management"
        ],
        "Troy Garden": [
            "Water/Sewer Maintenance",
            "Trash Management",
            "Rent Reconciliation",
            "Bug Spray"
        ],
        "City Station": [
            "Theft Control",
            "Bill Management",
            "Roommate Matching",
            "Garbage Collection",
            "Networking"
        ],
    };

    $scope.categories = $scope.categoryList[house];
    $scope.checkCategoryModel = [];
    for (var i = 1; i < $scope.categories.length; i++) {
        var category = $scope.categories[i];
        $scope.checkCategoryModel[category] = false;
    }
  }

  $scope.fetchMsgs = function(category) {
    $scope.msgs = [];
    for (var i = 0; i < $scope.categories.length; i++) {
        $scope.msgs[i] = {
            "Sender" : i % 2 == 0? "Landlord of "+ $scope.selectedHouse : "Tenant of "+ $scope.selectedHouse,
            "Recipient" : i % 2 == 1? "Landlord of "+ $scope.selectedHouse : "Tenant of " + $scope.selectedHouse,
            "Body": "Body of " + i + "th message regarding " +  category,
            "Title": $scope.selectedHouse + " " + i + "th message regarding " +  category,
            "href": "#message" + i,
            "id": "message" + i,
            "modalID": "modal" + i,
            "modalTarget": "#modal" + i
        };
    }

  }

  $scope.houses = $scope.fetchHouses();

  $scope.checkHouseModel = [];
  for (var i = 0; i < $scope.houses.length; i++) {
    var house = $scope.houses[i];
    $scope.checkHouseModel[house] = false;
  }

});