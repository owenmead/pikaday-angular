(function(context, factory) {
  'use strict';

  var moment,
      angular,
      Pikaday;
  if (typeof exports === 'object') {
    // CommonJS module
    // Load moment.js as an optional dependency
    try { moment = require('moment'); } catch (e) {}
    // angular and Pikaday actually required
    angular = require('angular');
    Pikaday = require('pikaday');
    module.exports = factory.call(context, angular, moment, Pikaday);
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function (req)
    {
      try { moment = req('moment'); } catch (e) {}
      angular = require('angular');
      Pikaday = require('pikaday');
      return factory.call(context, angular, moment, Pikaday);
    });
  } else {
    // Everything attached to root window context
    context.Pikaday = factory.call(context, context.angular, context.moment, context.Pikaday);
  }
}(this, function (angular, moment, Pikaday) {
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
  .directive('pikaday', ['pikaconfig', function(pikaconfig) {
    var timeTokens = ['H', 'HH', 'h', 'hh', 'a', 'A', 's', 'ss', 'S', 'SS', 'SSS', 'Z', 'ZZ', 'LLL', 'LLLL', 'lll', 'llll'];

    return {
      require: '?ngModel',
      restrict: 'A', // A = Attribute

      link: function(scope, inputElement, attrs, ngModel) {
        // Setup Pikaday
        var options = {
          field: inputElement[0],
          showTime: !!attrs.pikaday.match(timeTokens.join('|'))
        };

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
            if(!pikaconfig.option_overrides.inputFormats) {
              picker._o.inputFormats = picker._o.format;
            }
            inputElement.val(picker.toString());

            picker._o.showTime = !!format.match(timeTokens.join('|'));

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
                if(picker._o.inputFormats && !(value instanceof Date)) {
                    m = moment(value, picker._o.inputFormats);
                } else {
                    m = moment(value);
                }
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
  }]);
}));
