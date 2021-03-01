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
    //  let updtdclients = io.sockets.clients();
    let updtdclients = io.sockets.sockets;
    //console.log(updtdclients);
    let connectedds = updtdclients.keys();
    let connectedIds = Array.from(connectedds);
    //console.log("connected ids:");
    //console.log(connectedIds); //map iterator

    if (players.length > 0) {
      //console.log("check against the players");
      for (let i = 0; i < players.length; i++) {
        let dcontd = true;
        //console.log("player " + i);
        for (let j = 0; j < connectedIds.length; j++) {
          // console.log("check connections");
          if (players[i].id == connectedIds[j]) {
            dcontd = false;
          }
        }
        if (dcontd) {
          console.log(players[i].name + " with id: " + players[i].id + " has disconnected");
          players.splice(i, 1);
          io.emit("playerLeft", players);
        }
        //console.log(players);
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
