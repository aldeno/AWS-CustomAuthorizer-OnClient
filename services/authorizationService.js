var request = require('request');
const jwkToPem = require('jwk-to-pem');

app.factory('authorizationService', ['configurationService', 'jwtHelper', function (configurationService, jwtHelper) {

    const REGION = configurationService.getPoolConfiguration().REGION;
    const USER_POOL_ID = configurationService.getPoolConfiguration().USER_POOL_ID;
    const IDENTITY_POOL_ID = configurationService.getPoolConfiguration().IDENTITY_POOL_ID;
    const ROLE_ARN = configurationService.getPoolConfiguration().ROLE_ARN;

    return {
        getCredentials: function(authorizationToken, callback) {
            // If token is not sent return an error and stop proccessing
            if (authorizationToken === null) {
                errorHandler('IdToken has not been sent.');
            }

            // Retrive pems from "well-known" url
            getPems()
                .then(function(pems) {
                    validateToken(authorizationToken, pems)
                        .then(function(decodedToken) {
                            // Initialize parameters for getId methodconfigurationService
                            var params = inititalizeGetIdParameters(REGION, USER_POOL_ID,
                                 IDENTITY_POOL_ID, null, authorizationToken);
                            var cognitoidentity = new AWS.CognitoIdentity({
                                region: REGION
                            });

                            // Generate a cognito id
                            cognitoidentity.getId(params, function(err, data) {
                                // If error occurres log it and return unauthorized request error
                                if (err) {
                                    errorHandler(err);
                                }

                                // Initialize parameters for getCredentialsForIdentity method
                                var getOpenIdTokenParams = inititalizeGetIdParameters(REGION, 
                                    USER_POOL_ID, null, data.IdentityId, authorizationToken);

                                // Get an open id token using cognito id
                                cognitoidentity.getOpenIdToken(getOpenIdTokenParams, function(err, data){
                                    if (err) {
                                        errorHandler(err);
                                    }

                                    // Initialize parameters for STS assumeRoleWithWebIdentity method
                                    var assumeRoleWithWebIdentityParams = inititalizeAssumeRoleParameters(data.Token, decodedToken, 
                                        ROLE_ARN);
                                    var sts = new AWS.STS({
                                        region: REGION
                                    });
                                    // Get a set of temporary security credentials
                                    sts.assumeRoleWithWebIdentity(assumeRoleWithWebIdentityParams, function(err, data){
                                        if (err) {
                                            errorHandler(err);
                                        }

                                        // Put credentials and tenant_id to API context object so they can be used in the further proccessing
                                        var formattedCredentials = formatCredentials(data.Credentials);

                                        callback({
                                            formattedCredentials,
                                            tenantId: decodedToken['custom:TenantId']
                                        });
                                    });
                                });
                            });
                        }) // If validateToken method returns an error handle it here
                        .catch(function(err){errorHandler(err)});
                }) // If getPems method returns an error handle it here
                .catch(function(err){errorHandler(err)});
        }

    };

    // Fromat parameters object so it fits AWS SDK naming
    function formatCredentials(creds){
        var formattedCredentials = {
            accessKeyId: creds.AccessKeyId,
            secretAccessKey: creds.SecretAccessKey,
            sessionToken: creds.SessionToken
        };

        return formattedCredentials;
    };

    // Initialize parameters for cognito getId method
    function inititalizeGetIdParameters(region, userPoolId, identityPoolId, identityId, authorizationToken){
        var loginsCognitoKey = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        var loginsIdpData = {};
        loginsIdpData[loginsCognitoKey] = authorizationToken;
        var params = {
            Logins: loginsIdpData
        };

        // Only one parameters can be set depending on input parameter values
        if (identityPoolId) {
            params.IdentityPoolId = identityPoolId;
        } else if (identityId) {
            params.IdentityId = identityId;
        }

        return params;
    };

    // Generate parameters for cognito assumeRoleWithWebIdentity method
    function inititalizeAssumeRoleParameters(token, decodedToken, roleArn){
        // Generate policy depending on tenantid and user role attirbutes
        var policy = generateDynamoDbPolicy(decodedToken['custom:TenantId'], decodedToken['custom:role']);
        // Set role session name as combination of tenant_id and username and trim it to 60 characters
        var roleSessionName = (decodedToken['cognito:username'] + decodedToken['custom:TenantId']).substring(0, 60);

        // Initialize parameters for assumeRoleWithWebIdentity method
        var params = {
            RoleArn: roleArn,
            WebIdentityToken: token,
            RoleSessionName: roleSessionName,
            Policy: JSON.stringify(policy)
        };

        return params;
    };

    // Get token data from the "well-know" url and convert it to pems
    function getPems() {
        return new Promise(function(resolve, reject){
            // Get JWT json data set from the well-known url -- This set is needed in order to verify token
            request({
                url: 'https://cognito-idp.' + REGION + '.amazonaws.com/' + USER_POOL_ID + '/.well-known/jwks.json',
                json: true
            }, function(error, response, body){
                // If unable to retrieve JWT json set log an error and stop proccessing
                if (error || response.statusCode !== 200) {
                    reject(error);
                    // Otherwise resolve pems from the jwt dataset
                } else {
                    let pems = [];
                    // An error can occur in resolvePems so we need to handle it using try/catch
                    try {
                        pems = resolvePems(body);
                    } catch (err) {
                        reject(err);
                    }
                    resolve(pems);
                }
            });
        });
    };

    // decode pem and format it as a JSON object
    function resolvePems(body) {
        let pems = {};
        let keys = body['keys'];

        for (var i = 0; i < keys.length; i++) {
            var keyId = keys[i].kid;
            var modulus = keys[i].n;
            var exponent = keys[i].e;
            var keyType = keys[i].kty;
            var jwk = {
                kty: keyType,
                n: modulus,
                e: exponent
            };
            var pem = jwkToPem(jwk);
            pems[keyId] = pem;
        }

        return pems;
    };

    function errorHandler(error){
        var logError = 'An error has occurred';
        if (error) {
            // If error object is type of exception use message from the exception
            if (error.message) {
                logError = error.message;
            } else {
                // Otherwise assume that error is type of string and it contains error message
                logError = error;
            }
        }
        // Log the error and return unauthorized response
        console.error(logError);
    };

    // Validate JWT token
    function validateToken(token, pems){
        var decodedJwt = jwtHelper.decodeToken(token);

        return new Promise(function(resolve, reject){
            var errorMessage;
            var iss = 'https://cognito-idp.' + REGION + '.amazonaws.com/' + USER_POOL_ID;

            // Throw an exception if token cannot be decoded
            if (!decodedJwt) {
                errorMessage = 'Unable to decode the token...';
            } else if (decodedJwt.iss !== iss) {
                // Reject token if issuer is not the same
                errorMessage = 'Unknown issuer...';
            } else if (decodedJwt.token_use !== 'id') {
                // Reject the jwt if it is not type of "IDToken"
                errorMessage = 'A token is not an id token...';
            } else if (!decodedJwt['custom:TenantId']) {
                // If token does not contain a valid tenant_id
                errorMessage = 'Unable to get tenant_id from the token';
            } else if (!decodedJwt['custom:role']) {
                // If token does not contain a valid role
                errorMessage = 'Unable to get role from the token';
            }

            // If any of the above rules is not satisfied return an error
            if (errorMessage) {
                reject(errorMessage);
            }
            // Verify signature and expiration
            /* jsonwebtoken.verify(token, pems[decodedJwt.header.kid], {
               issuer: iss
             }, function(error, payload){
               if (error) {
                 reject(error);
               } else {
                 resolve(payload);
               }
             });*/

            resolve(decodedJwt);
        });
    };

    // Generate policy that will scope down user role for dynamo db
    // Scope down size depends on tenant_id and role
    // This method cannot allow rights that are not already allowed in the role
    function generateDynamoDbPolicy(tenantId, role) {
        // Assume that all user roles have rights to read from the database
        var actions = [
            'dynamodb:GetItem',
            'dynamodb:Query',
            'dynamodb:BatchGetItem',
            'dynamodb:GetRecords'
        ];

        // If user roles is administrator user has also ability to write and update data to the database
        // If a new role has been introduced this part of code needs to be changed
        if (role === 'Administrator') {
            //actions.push('dynamodb:BatchWriteItem', 'dynamodb:DeleteItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem');
            actions = ['dynamodb:*'];
        }

        var policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Action: actions,
                    Resource: '*',
                    Condition: {
                        'ForAllValues:StringEquals': {
                            'dynamodb:LeadingKeys': [tenantId]
                        }
                    }
                },
                {
                    Effect: 'Allow',
                    Action: [
                        //'SNS:Publish'
                        'SNS:*'
                    ],
                    Resource: '*'
                }
            ]
        };

        if (role === 'Administrator') {
            policy.Statement.push({
                Effect: 'Allow',
                Action: [
                    /*'cognito-idp:AdminCreateUser',
                    'cognito-idp:AdminDeleteUser',
                    'cognito-idp:AdminUpdateUserAttributes'*/
                    'cognito-idp:*',
                    's3:*'
                ],
                Resource: ["*", "arn:aws:s3:::ao-bucket1/*", "arn:aws:s3:::ao-bucket1"]
            });
        }

        return policy;
    };









}]);