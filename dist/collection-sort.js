/*!
 * collection-sort
 * http://github.com/toxahak/collection-sort
 * Version: 0.0.1 - 2015-10-09T15:34:24.040Z
 * License: MIT
 */


(function () {
  "use strict";

  var module = angular.module('collectionSort', []);

  module.directive('collectionSort', function() {
    return {
      restrict: 'A',
      transclude: true,
      replace: true,
      template: 'tr(ng-transclude)',
      scope: {
        resource: '=',
        options: '='
      },
      controller: function($scope) {
        var vm = this;
        vm.key = '';
        vm.desc = false;

        $scope.$watchGroup([
          function(){
            return vm.key;
          },
          function(){
            return vm.desc;
          }
        ], reorderCollection);

        function reorderCollection() {
          if ($scope.resource) {
            // Check is Restangular collection
            if ($scope.resource.fromServer) {
              loadResource();
            } else {
              $scope.resource = _.sortByOrder($scope.resource, [ vm.key ], [ vm.desc ? 'desc' : 'asc' ]);
            }
          }
        }

        function loadResource() {
          if ($scope.resource) {
            var params = _.extend({}, $scope.resource.reqParams, {
              'query[sorts]': vm.key.split(' ').map(function(key) {
                return key + (vm.desc ? ' desc' : ' asc');
              })
            });
            $scope.resource.getList(params).then(function(result) {
              $scope.resource = result;
            });
          }
        }
      }
    };
  });

  module.directive('sortableField', function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      require: '^collectionSort',
      scope: {
        field: '@'
      },
      templateUrl: 'directives/sortable-field/sortable-field.html',
      link: function($scope, element, attrs, sortCtrl) {
        $scope.setSortField = setSortField;
        $scope.isSortField = isSortField;
        $scope.isSortDesc = isSortDesc;

        function setSortField() {
          if (sortCtrl.key === $scope.field) {
            sortCtrl.desc = !sortCtrl.desc;
          } else {
            sortCtrl.key = $scope.field;
            sortCtrl.desc = false;
          }
        }

        function isSortField() {
          return sortCtrl.key === $scope.field;
        }

        function isSortDesc() {
          return sortCtrl.desc;
        }
      }
    };
  });

  module.run(["$templateCache", function($templateCache) {
    $templateCache.put("directives/sortable-field/sortable-field.html", '<div class="sortable-field" ng-click="setSortField()"><ng-transclude></ng-transclude> <div class="sortable-field__icon-wrapper"><i class="fa" ng-class="{&#39;fa-sort&#39;: !isSortField(), &#39;fa-sort-asc&#39;: !isSortDesc() &amp;&amp; isSortField(), &#39;fa-sort-desc&#39;: isSortDesc() &amp;&amp; isSortField()}"></i></div></div>')
  }]);

}());
