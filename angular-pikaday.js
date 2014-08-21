'use strict';

angular.module('angular-pikaday', [])
.constant('pikaconfig', {
  // Simple observer pattern to allow outsiders to change Pikaday options
  pikadayObservers: [],
  updatePikadayOptions: function() {
    angular.forEach(this.pikadayObservers, function(callback) {
      callback();
    });
  },

  option_overrides: {}
})
.directive('pikaday', function(pikaconfig){
  return {
    require: 'ngModel',
    restrict: 'A', // A = Attribute

    link: function(scope, inputElement, attrs, ngModel) {
      // Setup Pikaday
      ngModel.picker = new Pikaday({
        field: inputElement[0],
        onSelect: function(selectedDate) {
          scope.$apply(function() {
            ngModel.$setViewValue(selectedDate);
          });
        }
      });

      // We need to update our options
      // Using observer pattern so as not to pollute scope or add a bunch of watches
      var optionUpdateCallback = function() {
        angular.extend(ngModel.picker._o, pikaconfig.option_overrides);
        inputElement.val(ngModel.picker.toString());
      };
      pikaconfig.pikadayObservers.push(optionUpdateCallback);

      // Clean up Pikaday when this directive instance is destroyed
      scope.$on('$destroy', function() {
        ngModel.picker.destroy();
        // Remove self from observables
        pikaconfig.pikadayObservers.splice(
            pikaconfig.pikadayObservers.indexOf(optionUpdateCallback), 1
          );
      });

      // Allow date format to be set and dynamically changed
      attrs.$observe('pikaday', function(format) {
        if (format) {
          ngModel.picker._o.format = format;
          inputElement.val(ngModel.picker.toString());
          ngModel.$validate();
        }
      });

      // Incoming from model changes, revalidate and force a date type
      ngModel.$formatters.push(function(value) {
        if(angular.isDate(value)) {
          ngModel.picker.setDate(value, true);
          return ngModel.picker.toString();
        }
        return '';
      });
      // Outgoing... usually from $setViewValue, again ensuring a date
      ngModel.$parsers.push(function(value) {
        if(ngModel.$isEmpty(value)) {
           ngModel.$setValidity('pikaday', true);
           return null;
        }

        var m = moment(value);
        if (m.isValid()) {
          ngModel.$setValidity('pikaday', true);
          return m.toDate();
        }

        ngModel.$setValidity('pikaday', false);
        return undefined;
      });
    }
  };
});