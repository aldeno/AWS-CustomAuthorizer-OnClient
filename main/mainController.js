app.controller('mainController', function($scope, $location, configurationService) {

  //If user is note logged in redirect to login page
  var token = localStorage.getItem('JWT');
  if (!token) {
    $location.path('/login');
  }

  //Set default values
  $scope.functions = {};
  $scope.functions.logout = function() {
    localStorage.removeItem('JWT');
    $location.path('/login');
  }

  $scope.functions.testGet = function() {

    AWS.config.credentials.get(function() {
      var identityId = AWS.config.credentials.identityId;
      var accessKeyId = AWS.config.credentials.accessKeyId;
      var secretAccessKey = AWS.config.credentials.secretAccessKey;
      var sessionToken = AWS.config.credentials.sessionToken;
      console.log("cognito identity id: " + identityId);
      console.log("cognito access key: " + accessKeyId);
      console.log("cognito secret key: " + secretAccessKey);
      console.log("cognito session token: " + sessionToken);
      apigClient = apigClientFactory.newClient({
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
        headers: { },
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
  }
});
