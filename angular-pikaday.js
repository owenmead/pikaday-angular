'use strict';

angular.module('angular-pikaday', [])
.directive('pikaday', function($filter){
  return {
    require: 'ngModel',
    restrict: 'E', // E = Element
    template: '<input type="text">',

    link: function(scope, element, attrs, ngModel) {
      var inputDOM = element.find('input');

      // Setup Pikaday
      var picker = new Pikaday({
        field: inputDOM[0],
        format: 'D MMM YYYY',
        onSelect: function(selectedDate) {
          scope.$apply(function() {
            ngModel.$setViewValue(selectedDate);
          });
        }
      });

      // Clean up Pikaday when this directive instance is destroyed
      scope.$on('$destroy', function() {
        picker.destroy();
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
          picker.hide();
          ngModel.$setViewValue(picker.getDate());
          ngModel.$setValidity('pikaday', (inputDOM.val().length === 0 || picker.getDate() !== null));
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
          picker.setDate(ngModel.$viewValue, true);
        } else {
          inputDOM.val('');
          picker.setDate(null, true);
        }
      };
    }
  };
});