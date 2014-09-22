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
    require: '?ngModel',
    restrict: 'A', // A = Attribute

    link: function(scope, inputElement, attrs, ngModel) {
      // Setup Pikaday
      var options = { field: inputElement[0] };
      if (ngModel) {
        options.onSelect = function( selectedDate ) {
          scope.$apply(function() {
            ngModel.$setViewValue(selectedDate);
          });
        };
      }

      // Attach picker to element
      inputElement[0]._pikaday = new Pikaday( options );
      var picker = inputElement[0]._pikaday;

      // We need to update our options
      // Using observer pattern so as not to pollute scope or add a bunch of watches
      var optionUpdateCallback = function() {
        angular.extend(picker._o, pikaconfig.option_overrides);
        inputElement.val(picker.toString());
      };
      pikaconfig.pikadayObservers.push(optionUpdateCallback);

      // Clean up Pikaday when this directive instance is destroyed
      scope.$on('$destroy', function() {
        picker.destroy();
        // Remove self from observables
        pikaconfig.pikadayObservers.splice(
            pikaconfig.pikadayObservers.indexOf(optionUpdateCallback), 1
          );
      });

      // Allow date format to be set and dynamically changed
      attrs.$observe('pikaday', function(format) {
        if (format) {
          picker._o.format = format;
          inputElement.val(picker.toString());
          if (ngModel) {
            ngModel.$validate();
          }
        }
      });

      if (ngModel) {
        // Incoming from model changes, revalidate and force a date type
        ngModel.$formatters.push(function(value) {
          if (angular.isDate(value)) {
            picker.setDate(value, true);
            return picker.toString();
          }
          return '';
        });
        // Outgoing... usually from $setViewValue, again ensuring a date
        ngModel.$parsers.push(function(value) {
          if (ngModel.$isEmpty(value)) {
             ngModel.$setValidity('pikaday', true);
             return null;
          }

          var m;
          if (typeof moment === 'function') {
              m = moment(value);
          }

          if (m && m.isValid()) {
            ngModel.$setValidity('pikaday', true);
            return m.toDate();
          }

          ngModel.$setValidity('pikaday', false);
          return undefined;
        });
      }

      // Call all update options when spinning up pikaday instance
      pikaconfig.updatePikadayOptions();
    }
  };
});
