app.factory('configurationService', [function() {
  return {
    getPoolConfiguration: function() {
      return {
        USER_POOL_ID: 'eu-central-1_kMoL2C28M',
        REGION: 'eu-central-1',
        CLIENT_ID: '59hinj2b96f5sr62t2g0clf5b',
        IDENTITY_POOL_ID: 'eu-central-1:b409d567-fca9-4f6e-aad8-81bc26a0fc4a',
        JSON_WEB_TOKEN_SET: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M/.well-known/jwks.json',
        ISS: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M',
        LOGINS: 'cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M'
      }
    }
  }
}]);
