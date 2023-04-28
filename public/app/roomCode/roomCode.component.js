angular.module('brewApp').component('roomCode',{
    template: '<p class="room-code" >{{$ctrl.code}}</p>',
    controller:  function LoginController() { 
                this.code = sessionStorage.getItem('code');
            }
});