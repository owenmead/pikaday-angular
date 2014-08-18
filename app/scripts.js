angular.module('pikaApp', [])
.controller('myCtrl', function($scope) {
  $scope.theValue = null; //new Date();
})
.directive('pikadaytime', function($filter){
  // Runs during compile
  return {
    require: 'ngModel',
    restrict: 'E', // E = Element
    template: '<input type="text"><br>{{theValue}}',

    link: function(scope, element, attrs, ngModel) {
      var inputDOM = element.find('input');

      // Setup Pikaday
      pikadayOpts = {
        field: inputDOM[0],
        format: 'D MMM YYYY',
        onSelect: function(selectedDate) {
          scope.$apply(function() {
            ngModel.$setViewValue(selectedDate);
          });
        }
      }
      var picker = new Pikaday(pikadayOpts);

      // Clean up Pikaday when scope is destroyed
      scope.$on('$destroy', function() {
        picker.destroy();
      });

      // Outgoing... usually from $setViewValue
      ngModel.$parsers.push(function(value) {
         if(ngModel.$isEmpty(value)) {
            ngModel.$setValidity('pikadaytime', true);
            return null;
         }
         ngModel.$setValidity('pikadaytime', angular.isDate(value));
         return value;
      });

      inputDOM.on('blur', function(){
        scope.$apply(function() {
          picker.hide(); // Prevent picker flash when text editing multiple times
          ngModel.$setViewValue(picker.getDate());
          ngModel.$setValidity('pikadaytime', (inputDOM.val().length === 0 || picker.getDate() !== null));
        });
      });

      inputDOM.on('keyup', function(){
        if (inputDOM.val() === '' && angular.isDate(ngModel.$viewValue)) {
          scope.$apply(function() {
            ngModel.$setViewValue(null);
            ngModel.$setValidity('pikadaytime', true);
          });
        }
      });

      // Incoming from model changes
      ngModel.$formatters.push(function(value) {
        ngModel.$setValidity('pikadaytime', angular.isDate(value) || value === null || value === '');
        if (angular.isDate(value)) {
          return value;
        }
        return '';
      })


      // Called when the view needs to be updated
      // Specify how UI should be updated
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