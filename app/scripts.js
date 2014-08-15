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

       inputDOM.on('change', function(){
        if (inputDOM.val() === '' || !inputDOM.val()) {
          ngModel.$setValidity('pikadaytime', true);
          scope.$apply();
        }
       })

      // Incoming from model changes
      ngModel.$formatters.push(function(value) {
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