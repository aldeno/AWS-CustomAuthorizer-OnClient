app.controller('registrationController', function($scope, identityService, $location){

  //Initialize data with default values
  $scope.registrationData = {};
  $scope.functions = {};
  $scope.processing = false;
  $scope.roles = ["Administrator", "TenantAdmin", "ReadOnly"];
  $scope.registrationData.Role = "Administrator";

  $scope.functions.signupCallback = function(err, res){
    $scope.processing = false;
    if(!err){
      $location.path('/login');
    }

    $scope.$apply();
  }

  $scope.functions.signup = function(){
      $scope.processing = true;
      identityService.signup($scope.registrationData.username, $scope.registrationData.password,
        $scope.registrationData.email, $scope.registrationData.tenantId, $scope.registrationData.Role, $scope.functions.signupCallback);
  }
});
