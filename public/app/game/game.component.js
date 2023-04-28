angular.module('brewApp').component('game',{
    templateUrl: 'app/game/game.template.html',
    controller: ['gameService',
            function LoginController(gameService) { }
    ]
});