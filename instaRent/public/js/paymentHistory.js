var jetbrains = angular.module("jetbrains", []);

    jetbrains.controller("AppCtrl", function ($scope, $http) {
        var app = this;
        var url = "http://localhost:3000";
        $http.get(url + "/payments/getPaymentHistory").success(function (data) {
            app.data = data;
        });
    });

function queryParams() {
    return {
        type: 'owner',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page: 1
    };
}