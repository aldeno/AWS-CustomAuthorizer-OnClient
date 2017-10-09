

app.controller('mainController', function ($scope, $location, configurationService, identityService, authorizationService, jwtHelper, apiService) {

  identityService.isLoggedIn(function (err, session) {
    if (err) {
      console.error(JSON.stringify(err));
      $location.path('/login');
    } else {
      //console.log("mainController.isLoggedIn: " + JSON.stringify(session.getIdToken().getJwtToken()));
    }
  });

  //Set default values
  $scope.functions = {};
  $scope.functions.logout = function () {
    identityService.logout();
    $location.path('/login');
  }

  //  identityService.loadAuthenticatedUser();

  $scope.functions.testGetNoAuth = function () {
    apiService.getTenantsOpen().then(function (data) {
      console.log(JSON.stringify(data.data));
    }, function (err) {
      console.error(JSON.stringify(err));
    });
  };
  $scope.functions.testGetWithAuth = function () {
    apiService.getTenantsAuth().then(function (data) {
      console.log(JSON.stringify(data.data));
    }, function (err) {
      console.error(JSON.stringify(err));
    });
  };
  $scope.functions.testGetWithCustomAuth = function () {
    apiService.getTenantsCustomAuth().then(function (data) {
      console.log(JSON.stringify(data.data));
    }, function (err) {
      console.error(JSON.stringify(err));
    });
  };

  $scope.functions.basicClassicAuthFlow = function () {
    var idTkn = identityService.getIdToken();
    var conf = configurationService.getPoolConfiguration();

    AWS.config.update({ region: conf.REGION });

    var loginsCognitoKey = 'cognito-idp.' + conf.REGION + '.amazonaws.com/' + conf.USER_POOL_ID;
    var loginsIdpData = {};
    loginsIdpData[loginsCognitoKey] = idTkn;

    var params = {
      IdentityPoolId: conf.IDENTITY_POOL_ID,
      Logins: loginsIdpData
    };

    var cognitoidentity = new AWS.CognitoIdentity();

    var sts = new AWS.STS();


    var documentClient = new AWS.DynamoDB.DocumentClient({
      region: conf.REGION,
      accessKeyId: 'ASIAJMCUQPGTRBGKJK6Q',
      secretAccessKey: 'kIB3z1MVyUWsMkhcWuK/OGRUwfRu8n0rAXcMX6tA',
      sessionToken: 'FQoDYXdzECwaDIXT9L56PoZTC7Rs/SLHAXn82MU6/WCDXp+7ArrEcg3I9keEpBga8tGz3B5woz4qeqYRtI9d1Gddg8ALVjvB+109mgSOSK1JW4UkpKlwPS8QMmZxzRx5QXasJ4bQOHw2sT9CAkeam2DnK+1Y44nVYY8/QX0snPZ7e8mvjE15Xp8u3jrbO4OAOrlNieggnhDBFye1OcMBJRnY5I/CX6BiMUx5NrwZkX3Oh6TlI7eAsbFqEPOoyn9cDH5pjHcpmFmE/y12v2ma7bw40xkwk4oZcfY7cMstzIEot+20zQU=',
    });

    documentClient.query({
      TableName: "AldenTenants",
      KeyConditionExpression: "TenantId = :tenantId",
      FilterExpression: "Bandwidth = :bandwidth",
      "ExpressionAttributeValues": { ":tenantId": "2", ":bandwidth": "25Mbit" }
    }, function (err, data) {
      if (err) {
        console.error("dynamoscan error: " + JSON.stringify(err));
        return;
      }

      console.log("dynamoscan: " + JSON.stringify(data));
    });
  };

  $scope.functions.doTheJob = function () {
    var idToken = identityService.getIdToken();


    //DO NOT DELETE START
    authorizationService.getCredentials(idToken, function (creds) {
      console.log("CREDS: " + JSON.stringify(creds));
      creds.formattedCredentials.region = configurationService.getPoolConfiguration().REGION;
      var credentials = creds.formattedCredentials;
      //DO NOT DELETE END


      console.log(creds.formattedCredentials);
      var s3 = Promise.promisifyAll(new AWS.S3(creds.formattedCredentials));
      var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient(credentials));


      var keyConditionExpression = 'tenantId = :tenantId';
      var expressionAttributeValues = {
        ':tenantId': creds.tenantid
      };

      //add to list synthax


      /*//query and update synthax
      docClient.queryAsync({
        TableName: 'ao-tenants',
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
      }).then(function (data) {
        console.log(data.Items[0].certificates);
        docClient.updateAsync({
          TableName: 'ao-tenants',
          Key: {
            tenantId: creds.tenantid
          },
          UpdateExpression: "SET certificates = :certificates",
          ExpressionAttributeValues: {
            ":certificates": data.Items[0].certificates
          }
        });
      });
      */

      /*// update synthax 
      docClient.updateAsync({
        TableName: 'ao-tenants',
        Key: {
          tenantId: creds.tenantid
        },
        //KeyConditionExpression: keyConditionExpression,
        UpdateExpression: "SET certName = :certName",
        ExpressionAttributeValues: {
          //':tenantId': creds.tenantid,
          ":certName": "name"
        }
      })
        .then(function (val) {
          console.log(val);
        })
        .catch(function (err) {
          console.log(err);
        });
        */


      var params = {
        Bucket: "ao-bucket1",
        Delete: {
          Objects: [{ Key: "1" }],
          Quiet: false
        }
      };

      //s3.deleteObjectsAsync(params)

      //DO NOT DELETE START
    });
    //DO NOT DELETE END


  }
});
