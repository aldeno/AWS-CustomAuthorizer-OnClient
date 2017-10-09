app.factory('identityService', ['configurationService', 'jwtHelper', function(configurationService, jwtHelper) {
  var poolConf = configurationService.getPoolConfiguration();

  var poolData = {
    UserPoolId: poolConf.USER_POOL_ID,
    ClientId: poolConf.CLIENT_ID,
  };

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  return {
    test: function() {
      return "Hello from test";
    },
    signup: function(username, password, email, tenantId, roleVal, callback) {


      var attributeList = [];

      var dataEmail = {
        Name: 'email',
        Value: email,
      };

      var tenantId = {
        Name: 'custom:TenantId',
        Value: tenantId
      };

      var role = {
        Name: 'custom:role',
        Value: roleVal
      };

      var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
      var attributeTenant = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(tenantId);
      var attributeRole = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(role);

      attributeList.push(attributeEmail);
      attributeList.push(attributeTenant);
      attributeList.push(attributeRole);

      userPool.signUp(username, password, attributeList, null, callback);

    },
    login: function(username, password, onSuccess, onFailure) {

      var authenticationData = {
        Username: username,
        Password: password,
      };

      var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

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

    logout: function() {
      var cognitoUser = userPool.getCurrentUser();
      if(cognitoUser != null)
        cognitoUser.signOut();
    },

    isLoggedIn: function(callback) {
      var cognitoUser = userPool.getCurrentUser();

      if (cognitoUser != null) {
        cognitoUser.getSession(callback);
      }
    },
    getIdToken: function(){
      var cognitoUser = userPool.getCurrentUser();
      if(cognitoUser == null)
        return null;
      return cognitoUser.getSession(function(err, session){
        if(err){
          return null;
        }
        var token = session.getIdToken().getJwtToken();
        console.log(JSON.stringify(jwtHelper.decodeToken(token)));
        return token;
      });
    }
  };
}]);
