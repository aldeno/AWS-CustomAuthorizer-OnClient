app.factory('apiService', ['$http', function($http){
  return {
    getTenantsOpen: function(){
      var url = 'https://jkfzz0og08.execute-api.eu-central-1.amazonaws.com/dev/tenants';
      return $http.get(url, {
        params: {TableName: 'AldenTenants'}
      });
    },
    getTenantsAuth: function(){
      var url = 'https://87op1zeti9.execute-api.eu-central-1.amazonaws.com/dev/tenants';
      return $http.get(url, {
        params: {TableName: 'AldenTenants'}
      });
    },
    getTenantsCustomAuth: function(){
      var url = 'https://wsn94uboyc.execute-api.eu-central-1.amazonaws.com/dev/tenants';
      return $http.get(url, {
        params: {TableName: 'AldenTenants'}
      });
    },
  }
}]);
