angular.module('brewApp').provider('roomSocket', function() {
    let stack = [];
    let onmessageDefer;
    let socket = {}
    let instantiated = false;
    GetSocket = function() {
        if(instantiated) return socket;
        socket = {
            ws: new WebSocket('ws://localhost:9000/'),
            send: function(data) {
                daat = JSON.stringify(data);
                if(this.ws.readyState == 1) {
                    this.ws.send(data);
                } else {
                    stack.push(data);
                };
            },
            onmessage: function(callback) {
                if(this.ws.readyState == 1) {
                    this.ws.onmessage = callback;
                } else {
                    onmessageDefer = callback;
                };
            },
        };
        socket.ws.onopen = function(event) {
            for (i in stack) {
                socket.ws.send(stack[i]);
            }
            stack = [];
            if (onmessageDefer) {
                socket.ws.onmessage = onmessageDefer;
                onmessageDefer = null;
            }
        };
        socket.send(JSON.stringify({
            'action':'join',
            'name': sessionStorage.getItem('nickname'),
            'code': sessionStorage.getItem('code'),
        }));
        return socket;
    }
    this.$get = () => GetSocket();
});