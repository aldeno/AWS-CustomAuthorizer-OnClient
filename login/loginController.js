app.controller('loginController', function($scope, identityService, jwtHelper, configurationService, $location) {

  //Initialize data with default values
  $scope.loginData = {
    hasErrors: false,
    errorMsg: ""
  };
  $scope.functions = {};
  $scope.processing = false;


  $scope.functions.onLoginSuccess = function(data){
    $scope.loginData.hasErrors = false;
    var accessToken = data.accessToken.jwtToken;
    var idToken = data.idToken.jwtToken;
    var refreshToken = data.refreshToken.token;

    AWS.config.region = configurationService.getPoolConfiguration().REGION;

    var loginsCognitoKey = 'cognito-idp.' + configurationService.getPoolConfiguration().REGION + '.amazonaws.com/' + configurationService.getPoolConfiguration().USER_POOL_ID;
    var loginsIdpData = {};
    loginsIdpData[loginsCognitoKey] = data.getIdToken().getJwtToken();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId : configurationService.getPoolConfiguration().IDENTITY_POOL_ID, // your identity pool id here
        Logins: loginsIdpData
    });


      AWS.config.credentials.get(function() {
        /*var identityId = AWS.config.credentials.identityId;*/
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAccessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;
        var apigClient = apigClientFactory.newClient({
          accessKey: accessKeyId,
          secretKey: secretAccessKey,
          sessionToken: sessionToken,
          region: configurationService.getPoolConfiguration().REGION
        });

        var params = {
          TableName: 'Tenants'
        };
        var body = {
        };

        var additionalParams = {
          queryParams: {
            TableName: 'Tenants'
          }
        };

        apigClient.peopleGet(params, body, additionalParams).then(function(result) {
          console.log(JSON.stringify(result));
        }).catch(function(result) {
          console.error(JSON.stringify(result));
        });
      });

    localStorage.setItem("JWT", data);
    localStorage.setItem('token', data.getIdToken().getJwtToken());
    $scope.$apply(function(){
        //  $location.path('/main');
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
