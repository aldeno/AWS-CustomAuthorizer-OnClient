app.factory('identityService', ['configurationService', function(configurationService) {
  return {
    test: function() {
      return "Hello from test";
    },
    signup: function(username, password, email, callback) {
      var poolConf = configurationService.getPoolConfiguration();

      var poolData = {
        UserPoolId: poolConf.USER_POOL_ID,
        ClientId: poolConf.CLIENT_ID,
      };

      var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

      var attributeList = [];

      var dataEmail = {
        Name: 'email',
        Value: email,
      };

      var tenantId = {
        Name: 'custom:TenantId',
        Value: 'TestTId2'
      };

      var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
      var attributeTenant = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(tenantId);

      attributeList.push(attributeEmail);
      attributeList.push(attributeTenant);

      userPool.signUp(username, password, attributeList, null, callback);
    },
    login: function(username, password, onSuccess, onFailure) {
      var poolConf = configurationService.getPoolConfiguration();

      var authenticationData = {
        Username: username,
        Password: password,
      };

      var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

      var poolData = {
        UserPoolId: poolConf.USER_POOL_ID,
        ClientId: poolConf.CLIENT_ID,
      };

      var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

      var userData = {
        Username: username,
        Pool: userPool
      };

      var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: onSuccess,
        onFailure: onFailure
      });
    },
  };
}]);
