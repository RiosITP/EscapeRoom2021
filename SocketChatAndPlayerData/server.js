// server.js
// where your node app starts

// init project
const express = require("express"); 
const app = express();
const PORT = process.env.PORT || 3000;
const socket = require("socket.io"); 
const INDEX = "views";

app.use(express.static("public"));

let players = [];

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

//listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

const io = socket(listener);

// socket connection
io.on("connect", socket => { 
  console.log("a new connection! from: " + socket.id + " (server side)");

  //disconnected socket
  socket.on("disconnect", () => {

    let updtdclients = io.sockets.sockets; // all currently connected sockets, returns Map Object
    let connectedds = updtdclients.keys(); // get the keys, which are the socket ids
    let connectedIds = Array.from(connectedds); // create an array of the socket ids
  
    
    if (players.length > 0) {
      // look at all players in our players array (it should still contain the disconnected socket)
      for (let i = 0; i < players.length; i++) {
        // assume disconnection
        let dcontd = true;
        // for each player look through the currently connected ids
        for (let j = 0; j < connectedIds.length; j++) {
          // if theres a match then there is still a connection
          if (players[i].id == connectedIds[j]) {
            dcontd = false;
          }
        }
        // if we didnt find a player amongst the currently connected ids, then delete that player from the player array
        if (dcontd) {
          console.log(players[i].name + " with id: " + players[i].id + " has disconnected");
          players.splice(i, 1);
          // update all other clients when a player leaves
          io.emit("playerLeft", players);
        }
      }
    }
  });

  // when a player clicks to begin
  socket.on("begingame", data => {
    // check if they are already in the player array
    let found = false;
    for (let i = 0; i < players.length; i++) {
      //ignore them if they are already in the array
      if (players[i].id == socket.id) {
        found = true;
      }
    }
    //if they are not in the array, then add them
    if (!found) {
      players.push(data);
    }
    // update all clients when someone joins
    io.emit("updatePlayers", players);
  });
  // when a client types a message, update that message in the array
  socket.on("msg", info => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == info.sender) {
        players[i].message = info.message;
      }
    }
    // let every other client know what your message is 
    socket.broadcast.emit("msg", info);
  });
  // when a player moves
  socket.on("move", info => {
    // find that player in the array
    for (let i = 0; i < players.length; i++) {
      // update their position if they are there
      if (players[i].id == info.id) {
        players[i].x = info.x;
        players[i].y = info.y;
      }
    }
    // let all the other clients know which player moved and where
    socket.broadcast.emit("movePlayers", info);
  });
});
