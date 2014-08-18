'use strict';

angular.module('pikaApp', ['angular-pikaday'])
.controller('myCtrl', function($scope) {
  $scope.theValue = null; //new Date();
});