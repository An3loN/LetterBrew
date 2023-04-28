angular.module('brewApp').factory('roomService', ['roomSocket', function(roomSocket) {
    let roomPlayers = [];
    let roomMessages = [];
    
    let eventHandler = {};
    eventHandler.onPlayers = [];
    eventHandler.onMessages = [];
    function dispatch(event) {
        event.forEach(func => func());
    }
    roomSocket.onmessage(function(event){
        let data = JSON.parse(event.data);
        switch(data.action)
        {
            case 'room_context':
                {
                    roomPlayers = data.players;
                    dispatch(eventHandler.onPlayers);
                    roomMessages = data.messages;
                    dispatch(eventHandler.onMessages);
                    break;
                }
            case 'new_player':
                {
                    roomPlayers.push(data.player);
                    dispatch(eventHandler.onPlayers);
                    break;
                }
            case 'player_left':
                {
                    roomPlayers.splice(roomPlayers.findIndex(player => player.name == data.name), 1);
                    dispatch(eventHandler.onPlayers);
                    break;
                }
            case 'new_message':
                {
                    roomMessages.push(data.message);
                    dispatch(eventHandler.onMessages);
                    break;
                }
        }
    });
    this.getPlayers = function() {
        return roomPlayers;
    };
    this.addPlayersListener = function(func) {
        eventHandler.onPlayers.push(func);
    }
    this.getMessages = function() {
        return roomMessages;
    };
    this.addMessagesListener = function(func) {
        eventHandler.onMessages.push(func);
    };
    this.sendPlayerMessage = function(text) {
        roomSocket.send(JSON.stringify({'action':'send_message','text':text}));
    }
    return this;
}]);