angular.module('brewApp').factory('loginService', ['$http', function($http) {
    return function(nickname, room) {
        return $http.post('login', {'nickname': nickname, 'room': room});
    };
}]);