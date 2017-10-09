app.factory('configurationService', [function() {
  return {
    getPoolConfiguration: function() {
      /*return {
        USER_POOL_ID: 'eu-central-1_kMoL2C28M',
        REGION: 'eu-central-1',
        CLIENT_ID: '59hinj2b96f5sr62t2g0clf5b',
        IDENTITY_POOL_ID: 'eu-central-1:b409d567-fca9-4f6e-aad8-81bc26a0fc4a',
        JSON_WEB_TOKEN_SET: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M/.well-known/jwks.json',
        ISS: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M',
        LOGINS: 'cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M'
      }*/
      return {
        USER_POOL_ID: 'eu-central-1_tcBSpMaJI',
        REGION: 'eu-central-1',
        CLIENT_ID: 'snt4kkesa9ldarlt4lpo07bev',
        CLIENT_SECRET: 'q7tg4had9biisivun5mqft5ofjm2rp84f7lknosnih333fnts7e',
        IDENTITY_POOL_ID: 'eu-central-1:4a23892a-8d35-4d67-b91c-826f403fbece',
        JSON_WEB_TOKEN_SET: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M/.well-known/jwks.json',
        ISS: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_kMoL2C28M',
        LOGINS: 'cognito-idp.eu-central-1.amazonaws.com/eu-central-1_tcBSpMaJI',
        ROLE_ARN: 'arn:aws:iam::243692831826:role/service-role/AldenDynamoRole'
      }
    }
  }
}]);
