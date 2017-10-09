app.controller('loginController', function($scope, identityService, jwtHelper, configurationService, $location) {

  //Initialize data with default values
  $scope.loginData = {
    hasErrors: false,
    errorMsg: "",
    username: "alden1",
    password: "alden1"
  };
  $scope.functions = {};
  $scope.processing = false;


  $scope.functions.onLoginSuccess = function(data){
    $scope.loginData.hasErrors = false;

    console.log("onLoginSuccess: " + JSON.stringify(data.getIdToken().getJwtToken()));
  //  console.log("onLoginSuccess: " + JSON.stringify(data));

    $scope.$apply(function(){
          $location.path('/main');
    });
  }
  $scope.functions.onLoginFailure = function(err){
    $scope.loginData.hasErrors = true;
    $scope.loginData.errorMsg = err.message;

    $scope.$apply();
    console.error(JSON.stringify(err));
  }

  $scope.functions.login = function(){
    identityService.login($scope.loginData.username, $scope.loginData.password, $scope.functions.onLoginSuccess, $scope.functions.onLoginFailure);
  }
});
