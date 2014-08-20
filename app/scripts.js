'use strict';

angular.module('pikaApp', ['angular-pikaday'])
.controller('myCtrl', function($scope, pikaconfig) {
  $scope.theValue = new Date();
  $scope.currentLocal = 'en-ca';

  $scope.changeLocal = function() {
    $scope.currentLocal = $scope.currentLocal === 'en-ca' ? 'es' : 'en-ca';
    moment.locale($scope.currentLocal);

    pikaconfig.option_overrides = {
      i18n: {
        previousMonth : 'Previous Month',
        nextMonth     : 'Next Month',
        months        : moment.months(),
        weekdays      : moment.weekdays(),
        weekdaysShort : moment.weekdaysShort()
      }
    };
    pikaconfig.updatePikadayOptions();
  };

  $scope.pikaconfig = pikaconfig;
})


.config(function(pikaconfig) {
  pikaconfig.onRender = function() {
    console.log('render!');
    this.picker._o.i18n.months = moment.months();
    //console.log("DA RENDER!", this.picker);
  };
});