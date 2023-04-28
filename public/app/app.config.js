app = angular.module('brewApp');
app.config(['$routeProvider', function config($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'app/login/loginView.template.html'
        }).
        when('/room/:code', {
            templateUrl: 'app/room/roomView.template.html'
        }).
        otherwise('/');
}]);