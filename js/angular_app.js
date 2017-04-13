// angular for newspaper table

var app = angular.module('newspaper', [ ]);

// set up controller
app.controller('NewspaperController', function($http) {

    // load json data
    this.papers = [];
    var _this = this;
    // enquire.register("screen and (max-width: 63.9375em)", {
    //     match : function() {
    //       console.log('mobile loaded');
    //         // Load mobile data
    //         $http.get('data/interactive_mobile.json')
    //           .success(function(data){
    //             _this.papers = data;
    //           })
    //           .error(function(msg) {
    //           });
    //     }
    // });


    enquire.register("screen and (min-width: 64em)", {
        match : function() {
          console.log('desktop loaded');
            // Load desktop data
            $http.get('data/newspaper_interactive.json')
              .success(function(data){
                _this.papers = data;
              })
              .error(function(msg) {
              });
        }
    });



      $http.nameSearch = function() {
          $http.first = "";
      }

});
