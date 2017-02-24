var myApp = angular.module('myApp',[]);

myApp.controller('CommentsController', ['$scope', '$http', function($scope, $http) {
    $scope.comments = [];
    
    $http.get("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com/comment").success(function(data) {
        data.forEach(function(item) {
            $scope.addComment(item.Name, item.Comment);
        });
    });
    
    $scope.postComment = function() {
        var myobj = {"Name" : $("#Name").val(), "Comment" : $("#Comment").val()};
        var jobj = JSON.stringify(myobj);
        $http.post("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com/comment", jobj, {headers: { 'Content-Type' : "application/json; charset=utf-8"}})
        .then(function(res) {
          var data = JSON.parse(res.config.data)
          $scope.addComment(data.Name, data.Comment);
        }, function(data, status) {
            console.log(data);
            console.log(status);
        });
    };
    
    $scope.addComment = function(addName, addComment) {
        $scope.comments.push({name:addName, comment:addComment});
    };

    $scope.removeComment = function(index) {
        $scope.comments.splice(index, 1);
    };
}]);