var app = angular.module('myApp', ['ngRoute', 'angular-jwt']);

app.config(function($routeProvider) {
    $routeProvider
    .when('/main', {
        templateUrl : 'main/main.html',
        controller: 'mainController'
    })
    .when('/registration', {
        templateUrl : 'registration/registration.html',
        controller: 'registrationController'
    })
    .when('/login', {
        templateUrl : 'login/login.html',
        controller: 'loginController'
    })
    .otherwise({
      redirectTo: '/main'
    });
});
