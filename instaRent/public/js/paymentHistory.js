var jetbrains = angular.module("jetbrains", []);

    jetbrains.controller("AppCtrl", function ($scope, $http) {
        var app = this;
        var url = "http://localhost:3000";
        $http.get(url + "/payments/getPaymentHistory").success(function (data) {
            //console.log(data);
            app.data = data;
        });
    });
