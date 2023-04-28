angular.module('brewApp').filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  });
angular.module('brewApp').component('chat',{
    templateUrl: 'app/chat/chat.template.html',
    controller: ['roomService', '$scope',
            function LoginController(roomService, $scope) {
                this.msgs = [];
                this.inputMsg = "";
                roomService.addMessagesListener(() => {
                    this.msgs = roomService.getMessages();
                    console.log(this.msgs);
                    $scope.$apply();
                });
                this.submit = function() {
                    roomService.sendPlayerMessage(this.inputMsg);
                    this.inputMsg = "";
                }
            }
    ]
});