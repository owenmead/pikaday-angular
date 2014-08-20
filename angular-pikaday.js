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
    restrict: 'E', // E = Element
    template: '<input type="text">',

    link: function(scope, element, attrs, ngModel) {
      var inputDOM = element.find('input');

      // Setup Pikaday
      ngModel.picker = new Pikaday({
        field: inputDOM[0],
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
        ngModel.$render();
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
      attrs.$observe('format', function(format) {
        if (format) {
          ngModel.picker._o.format = format;
          ngModel.$render();
        }
      });

      // Incoming from model changes, revalidate and force a date type
      ngModel.$formatters.push(function(value) {
        ngModel.$setValidity('pikaday', angular.isDate(value) || value === null || value === '');
        if (angular.isDate(value)) {
          return value;
        }
        return '';
      });
      // Outgoing... usually from $setViewValue, again ensuring a date
      ngModel.$parsers.push(function(value) {
         if(ngModel.$isEmpty(value)) {
            ngModel.$setValidity('pikaday', true);
            return null;
         }
         ngModel.$setValidity('pikaday', angular.isDate(value));
         return value;
      });

      // Handle DOM events for our date picker
      inputDOM.on('blur', function(){
        scope.$apply(function() {
          ngModel.picker.hide();
          ngModel.$setViewValue(ngModel.picker.getDate());
          ngModel.$setValidity('pikaday', (inputDOM.val().length === 0 || ngModel.picker.getDate() !== null));
        });
      });
      inputDOM.on('keyup', function(){
        if (inputDOM.val() === '' && angular.isDate(ngModel.$viewValue)) {
          scope.$apply(function() {
            ngModel.$setViewValue(null);
            ngModel.$setValidity('pikaday', true);
          });
        }
      });

      // Called when the view needs to be updated, again ensure actual date
      ngModel.$render = function() {
        if (angular.isDate(ngModel.$viewValue)) {
          ngModel.picker.setDate(ngModel.$viewValue, true);
        } else {
          inputDOM.val('');
          ngModel.picker.setDate(null, true);
        }
      };
    }
  };
});