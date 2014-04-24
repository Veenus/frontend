// public/core.js

var myapp = angular.module('myApp', []);

myapp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }).
      when('/register', {
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);

function RegisterCtrl($scope, $http) {
  	$scope.user = {};
  	$scope.errors = "";
    $scope.submit = function() {
    	$scope.errors = "";
		$http.post('/api/v1/register', $scope.user)
			.success(function(data) {
				$scope.user = {}; // clear the form so our user is ready to enter another
				$scope.sended = true;
				$scope.logged.fullname = data.fullName;
			})
			.error(function(data) {
				console.log('Error: ' + data.userMessage);
				$scope.errors = data.userMessage;
			});
	};
    return $scope.reset = function() {
      $scope.sended = false;
      return $scope.user = {};
    };
}

function LoginCtrl($scope, $http) {
  	$scope.user = {};
  	$scope.errors = "";
    $scope.submit = function() {
    	$scope.errors = "";
		$http.post('/api/v1/login', $scope.user)
			.success(function(data) {
				$scope.user = {}; // clear the form so our user is ready to enter another
				$scope.sended = true;
        console.log(data);
        $scope.logged.loggedin = true;
        $scope.logged.account_href = data.href;
        $scope.logged.fullname = data.fullName;
        console.log(data.customData);
        if(data.customData.linkedin || data.customData.salesforce)
          $scope.logged.verified = true;
			})
			.error(function(data) {
				console.log('Error: ' + data.userMessage);
				$scope.errors = data.userMessage;
			});
	};
    return $scope.reset = function() {
      $scope.sended = false;
      return $scope.user = {};
    };
}

function MainCtrl($scope, $http) {
	$scope.logged = {loggedin: false,
    fullname: "",
    account_href: "",
    verified: false}
  $scope.verify = function(value) {
    OAuth.initialize('QlsyFTooT381B3aXsPNA054bsXA');
    OAuth.popup(value, function(error, result) {
      if(error)
        console.log(error);
      else {
        console.log(result);
        result.account_href = $scope.logged.account_href;
        result.provider = value;
        $http.post('/api/v1/account', result)
          .success(function(data){
            console.log(data);
            $scope.logged.verified = true;
          })
          .error(function(data) {
            console.log(data);
          });
      }
      //handle error with error
      //use result.access_token in your API request
    });
  }
}
