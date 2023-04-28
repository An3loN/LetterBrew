angular.module('brewApp').component('lobbyInfo',{
    templateUrl: 'app/lobbyInfo/lobbyInfo.template.html',
    controller: ['roomService', '$scope',
            function LoginController(roomService, $scope) { 
                this.players = [];
                roomService.addPlayersListener(() => {
                    this.players = roomService.getPlayers();
                    $scope.$apply();
                });
            }
    ]
});