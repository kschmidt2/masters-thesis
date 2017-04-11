// angular for newspaper table

var app = angular.module('newspaper', [ ]);

// set up controller
app.controller('NewspaperController', function($http) {

    // load json data
    this.papers = [];
    var _this = this;
    $http.get('data/newspaper_interactive.json')
      .success(function(data){
        _this.papers = data;
      })
      .error(function(msg) {
      });

      $http.nameSearch = function() {
          $http.first = "";
      }

});
