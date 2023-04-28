const express = require('express');
const ws = require('ws');
const app = express();
const hostname = '127.0.0.1';
const port = 8000;
const wsport = 9000;

class LobbyController {
  alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  roomCodeLength = 6;
  constructor() {
      this.lobbies = new Map();
  }
  generateRoomCode() {
    let result;
    result = "";
    for(let i = 0; i < this.roomCodeLength; ++i)
    {
      let letter =this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
      result += letter;
    }
    return result;
  }
  createRoom() {
    let code = ""
    do {
      code = this.generateRoomCode();
    } while (this.lobbies.has(code));
    this.lobbies.set(code, {'players':[], 'messages':[]});
    return code;
  }
  addPlayer(roomCode, name, connection) {
    let lobby = this.lobbies.get(roomCode);
    lobby.players.push({'name':name, 'connection':connection});
  }
  roomExists(roomCode) {
    return this.lobbies.has(roomCode);
  }
  lobbyHasPlayer(roomCode, name) {
    return this.lobbies.get(roomCode).players.some(player => player.name == name);
  }
  lobbyGetPlayer(roomCode, name) {
    return this.lobbies.get(roomCode).players.find(player => player.name == name);
  }
  lobbyGetMessages(roomCode, name) {
    return this.lobbies.get(roomCode).messages;
  }
  lobbyAddMessage(roomCode, msg) {
    this.lobbies.get(roomCode).messages.push(msg);
  }
  getPlayers(roomCode) {
    return this.lobbies.get(roomCode).players;
  }
  getPlayersInfo(roomCode) {
    let result = [];
    this.getPlayers(roomCode).forEach(player => result.push(this.newPlayerInfo(player.name)));
    return result
  }
  newPlayerInfo(name) {
    return {
      'name': name,
    };
  }
  kickPlayer(roomCode, name) {
    let lobby = this.lobbies.get(roomCode);
    lobby.players.splice(lobby.players.findIndex(player => player.name == name));
  }
}

const lobbyController = new LobbyController();

app.use(express.static(__dirname + "/public"));

app.listen(8000, () => {
  console.log(`Application listening on port ${port}`)
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.post("/login", express.json(), (req, res) => {
  console.log(req.body);
  let userName = req.body.nickname;
  let isJoinReq = (req.body.room != undefined) && (req.body.room != '');
  if(isJoinReq) {
    if(!lobbyController.roomExists(req.body.room)) {
      res.status(500);
      res.json(JSON.stringify({error: 'Такой комнаты не существует!'}));
      return;
    }
    if(lobbyController.lobbyHasPlayer(req.body.room, userName)) {
      res.status(500);
      res.json(JSON.stringify({error: 'Имя занято!'}));
      return;
    }
    res.status(200);
    res.json(JSON.stringify({'roomCode': req.body.room}));
  } else {
    let code = lobbyController.createRoom();
    res.status(200);
    res.json(JSON.stringify({'roomCode': code}));
  }
});

const wsServer = new ws.Server({port: wsport});
let onConnect = function(wsClient) {
  let code = '';
  let name = '';
  wsClient.on('message', function(message) {
    let data = JSON.parse(message);
    console.log(data);
    switch(data.action) {
      case 'join':
        {
          code = data.code;
          name = data.name;
          if(!lobbyController.roomExists(code)) {
            wsClient.close();
            return;
          }
          lobbyController.getPlayers(code).forEach(player => {
            player.connection.send(JSON.stringify({
              'action': 'new_player',
              'player': lobbyController.newPlayerInfo(name),
            }));
          });
          lobbyController.addPlayer(code, name, wsClient);
          wsClient.send(JSON.stringify({
            'action': 'room_context',
            'players': lobbyController.getPlayersInfo(code),
            'messages': lobbyController.lobbyGetMessages(code)
          }));
          console.log(`${name} joined ${code}`);
          break;
        }
      case 'send_message':
        {
          let text = data.text;
          msg = {
              'text': text,
              'player': name
            };
          lobbyController.lobbyAddMessage(code, msg);
          lobbyController.getPlayers(code).forEach(player => {
            player.connection.send(JSON.stringify({
              'action': 'new_message',
              'message': msg,
            }));
          });
        }
    }
  });
  wsClient.on('close', function() {
    console.log(`${name} left ${code}`)
    lobbyController.getPlayers(code).forEach(player => {
      player.connection.send(JSON.stringify({
        'action': 'player_left',
        'name': name,
      }));
    });
    lobbyController.kickPlayer(code, name);
  });
};
wsServer.on('connection', onConnect);
