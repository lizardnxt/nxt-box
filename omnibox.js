'use strict';

angular.module('omnibox', [])
  .directive('omnibox', ["$compile", "$http", "$templateCache",
    function($compile, $http, $templateCache) {

    // this could probably something else
    var baseUrl = templatesUrl;

    var getTemplate = function(contentType) {
      if (contentType === undefined) contentType = 'empty';

      var templateLoader,
      templateUrl = baseUrl + contentType + '.html';

      templateLoader = $http.get(templateUrl, {cache: $templateCache});

      return templateLoader;

    };

    var linker = function(scope, element, attrs) {

      var replaceTemplate = function(){
        var loader = getTemplate(scope.box.type);

        var promise = loader.success(function(html) {
          // we don't want the dynamic template to overwrite the search box.
            // this is not supported in jqlite! element.find("#cards").html(html);
            element[0].children[1].innerHTML = html;
        }).then(function (response) {
            $compile(element.contents())(scope);
        });
      };

      scope.$watch('box.type', function(){
        replaceTemplate();
        if (scope.box.type !== 'empty'){
          scope.box.showCards = true;
        } else {
          scope.box.showCards = false;
        }
      });

      replaceTemplate();

      // this should probably not be in this directive but in a subdirective.
      scope.$watch('selected_timeseries', function () {
        if (scope.selected_timeseries !== undefined){

          scope.data = scope.format_data(scope.selected_timeseries.events);
          // dit kan zeker nog mooier
          scope.metadata.title = scope.selected_timeseries.location.name;
          scope.metadata.ylabel = 'Aciditeit (%)' ; //scope.selected_timeseries.parameter + scope.selected_timeseries.unit.code
          scope.metadata.xlabel = "Tijd";
        } else {
          scope.data = undefined;
        }
      });

    };

  return {
    restrict: 'E',
    link: linker,
    templateUrl: baseUrl + 'omnibox-search.html'
  };
}]);