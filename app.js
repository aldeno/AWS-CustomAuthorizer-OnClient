var app = angular.module('myApp', ['ngRoute', 'angular-jwt']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/main', {
      templateUrl: 'main/main.html',
      controller: 'mainController'
    })
    .when('/registration', {
      templateUrl: 'registration/registration.html',
      controller: 'registrationController'
    })
    .when('/login', {
      templateUrl: 'login/login.html',
      controller: 'loginController'
    })
    .otherwise({
      redirectTo: '/main'
    });
}).config(function($httpProvider, jwtOptionsProvider) {
  jwtOptionsProvider.config({
    tokenGetter: ['identityService', function(identityService) {
      var token = identityService.getIdToken();
      return token;
    }],
    whiteListedDomains: [
      'localhost',
      'i4ez4yoatk.execute-api.eu-central-1.amazonaws.com',
      'jkfzz0og08.execute-api.eu-central-1.amazonaws.com',
      '87op1zeti9.execute-api.eu-central-1.amazonaws.com',
      'wsn94uboyc.execute-api.eu-central-1.amazonaws.com'
    ]
  });

  $httpProvider.interceptors.push('jwtInterceptor');
});
