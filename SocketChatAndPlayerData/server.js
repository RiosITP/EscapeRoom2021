// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const socket = require('socket.io');

const INDEX = 'views';

app.use(express.static('public'));

let players = [];

// // http://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

//http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});


//listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log("Your app is listening on port " + listener.address().port);
// });

const listener = app.listen(3000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

const io = socket(listener);

io.sockets.on('connect', (socket) => {
    console.log("a new connection! from: " + socket.id + " (server side)")

    socket.on('disconnect', () => {
      let updtdclients = io.sockets.clients();
      let connectedIds = Object.keys(updtdclients.connected);
      
      if(players.length > 0){
        console.log("check against the players")
        for(let i =0 ;i< players.length; i++){
          let dcontd = true;
          console.log("player "+i);
          for(let j=0; j< connectedIds.length ;j++){
            console.log("check connections")
            if(players[i].id == connectedIds[j]){
              dcontd = false;
            }
          }
          if(dcontd){
            console.log( players[i].name +" with id: "+players[i].id + " has disconnected")
           // players.splice(players[i],1);
            players.splice(i,1);
            updater();
          }
          
        
        console.log(players);
         //socket.emit('updatePlayers', players);
         // socket.broadcast.emit('updatePlayers', players);
        } 
      }
    //  console.log( socket.id+ " has disconnected: "); 
    });

    socket.on('begingame', (data) => {
      let found = false;
      for(let player in players){
        if(player.id == socket.id){
          found = true;
        }
      }
      if(!found){
        players.push(data);
      }
      console.log(players);
      io.emit('updatePlayers', players);
    });

    socket.on('updatePlayerStatus',(updatedPlayersStatus)=>{
      players = updatedPlayersStatus;
    });

    socket.on('msg',(message)=>{
      socket.broadcast.emit('msg', message );

    });

    socket.on('move', (info) => {
      for(let i = 0; i< players.length ; i++){
        if(players[i].id == info.id){
          players[i].x = info.x;
          players[i].y = info.y;
          ///console.log("update");
        }
      }
      socket.broadcast.emit('movePlayers', players);
      //console.log(players);
    });
});

function updater(){
  io.emit('updatePlayers', players);
  console.log("sent updated players from a disconnect")
}
