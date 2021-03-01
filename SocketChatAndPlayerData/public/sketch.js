let socket; 
let fontSize = 12;
let players = []; // array to hold player info
let startbutton;
let stage = 0; // variable to control canvas welcome stage
let me;
let speed = 2;
let inpt;
let newname = "";
let chatDiv;
let chatName;
let chatInpt;
let chatBtn;
let pchat;
let chat = '';
let chatContainer;
let mediv;
let canv;

function setup() {
  // fit canvas to the client's window, but make room for a chatbox below
  canv = createCanvas(windowWidth, windowHeight - 80); 
  canv.position(0, 0);
  canv.style('z-index', -1); // probably not necessary

  // make a place for the visitor to enter their name
  inpt = createInput("Enter Your Name");
  inpt.position(width / 4, (height / 2) - 20);
  // clear out the pre-existing text when they click to enter their names
  inpt.mousePressed(clearName); 
  
  // hide the chat container on the first stage, we'll bring it back once they enter a name
  chatContainer = select('#chatContainer');
  chatContainer.hide();

  // make the start button
  startbutton = createButton("Start the Experience");
  startbutton.position(width / 4, (height / 2) + 20);
  // start the room if they click and have entered a name (i guess its not really much of a game though...)
  startbutton.mousePressed(beginGame);


  textSize(fontSize);
  // variables to keep track of player movement
  pmouseX = width / 2;
  pmouseY = height / 2;
    
  // connect socket to your server.  
  // When running locally, CHANGE TO 'localhost:PORTNUMBER' (enter your actual port number in place of the word PORTNUMBER)
  socket = io.connect('https://abaft-sphenoid-numeric.glitch.me');

  // when a socket connects generate some player info. This happens before they enter a name or click
  socket.on('connect', () => {
    me = {
      id: socket.id,
      name: "me",
      x: width / 2,
      y: height / 2,
      message: " ",
      size: 20,
      messagebox: false
    }
  });

  // when the server tells us a player has moved, find them in the client side array and update their location
  socket.on('movePlayers', (info) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == info.id) {
        players[i].x = info.x;
        players[i].y = info.y;
      }
    }
  });
  // when the server tells us a player has left the server is sending an array of all the updated players socket id's which are stored on the server
  socket.on('playerLeft', (updatedPlayersd)=>{
    console.log("players");
    console.log(players);
    console.log("updatedPlayersd");
    console.log(updatedPlayersd);
      
    // look for a match in the client players array
    // loop through the client players array
    for(let i = 0; i< players.length ;i++){
      let stay = false;
      // for each player on the client side. see if there is a match with the incoming array
      for(let j = 0; j< updatedPlayersd.length ;j++){
         // if thers a match, that player can stay
        if(players[i].id == updatedPlayersd[j].id){
          stay = true;
        }
      }
    //if there are no matches
    if (!stay){
        //console.log(players[i].name + " with id: " +players[i].id+" is disconnected" )
        players.splice(i,1);
      }
    }
  });
    
    // when the server tells us a new player connected, the server is sending an array of all the updated players which are stored on the server
  socket.on('updatePlayers', (updatedPlayers) => {
    // loop through all the incoming players
      
    for (let i = 0; i < updatedPlayers.length; i++) {
      // double check that theplayer is new, and also not a duplicate of the client (myself)
      let newPlayer = true;
       
      //for each incoming player (server), loop through the existing client side players
      for (let j = 0; j < players.length; j++) {
           // if we find a match, the player is not actually new
           if (updatedPlayers[i].id == players[j].id) {
              newPlayer = false;
            }
           // if the player is the same as this client the player is not actually new
           if (updatedPlayers[i].id == me.id) {
              newPlayer = false;
            }  
      }
      // if the player is actually new, add them to the client side array so we can draw them later
      if (newPlayer) {
          players.push(updatedPlayers[i]);
          console.log("added" + updatedPlayers[i]);
          console.log(players);
        }
    }
  });
   
  // when another client sends a message
  socket.on('msg', (newInfo) => { // server is only sending info about the one client, not the entire array
    // loop through the players array and update the message for that particular client.
    for (let i =0; i < players.length ; i++) {

      if (players[i].id == newInfo.sender) {
        players[i].message = newInfo.message;
        // console.log("message from: ");
        // console.log(newInfo);
      }
    }
  });
}// end of Setup


function draw() {
  if (stage == 1) {
    background(255);
    keyMovers();
    drawOthers();
    chatWithOthers();

    noStroke();
    fill(234, 34, 123);
    text(me.name + ": " + me.message, me.x-me.size, me.y - me.size)
    ellipse(me.x, me.y, me.size, me.size);
  }
}

function chatWithOthers() {
  if (stage == 1) {

    chat = chatInpt.value();
    if (chat != pchat) {
      let info = {
        message: chat,
        sender: me.id
      }
      me.message = chat;
      socket.emit('msg', info);
      pchat = chat;
    }
  }
}

function drawOthers() {
  if (players.length > 0) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id != socket.id) {
        noStroke();
        fill(0, 125, 125);
        ellipse(players[i].x, players[i].y, 20, 20)
        text(players[i].name + ": " + players[i].message, players[i].x- players[i].size, players[i].y - players[i].size);
      }
    }
  }
}

function keyMovers() {

  if (keyIsDown(LEFT_ARROW)) {
    me.x -= speed;
  }
  if (keyIsDown(UP_ARROW)) {
    me.y -= speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {

    me.x += speed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    me.y += speed;
  }


// if my character goes off screen teleport them to the opposite side (like pacman)
  if (me.x < 0 - me.size / 2) {
    me.x = width;
  }
  if (me.x > width + me.size / 2) {
    me.x = 0;
  }
  if (me.y < 0 - me.size / 2) {
    me.y = height;
  }
  if (me.y > height + me.size / 2) {
    me.y = 0;
  }

  if (stage == 1) {
     // if we are in the room and there is a connection, update my position to everyone else
    if (socket) {
      let d = {
        id: socket.id,
        name: me.name,
        x: me.x,
        y: me.y,
      }

      socket.emit('move', d);

    } else {
      console.log("not sending")
    }
  }
}

function beginGame() {
  let ctntr = select('#chatContainer')
  newname = inpt.value();
  me.name = newname;

  mediv = createDiv();
  mediv.class('otherchats');
  mediv.id('me');
  mediv.html('<' + "section id=" + "name" + ">" + me.name + ":  (Type below, text is shown in realtime)" + "</section>" +
    "<textarea id=" + "chatInput" + "></textarea>");
  ctntr.child(mediv);
  ctntr.position(10, height - 30);

  if (newname == "Enter Your Name" || newname == "") {
    console.log("enter a new name");
  }
  else {
    let data = {
      id: socket.id,
      name: newname,
      x: mouseX,
      y: mouseY,
      message: '',
      size: 20,
      messagebox: false
    }
    players.push(data);
    console.log(players)
    if (socket) {
      console.log("sent my info to the server")
      socket.emit('begingame', data);
    } else {
      console.log("not sending");
    }
    stage = 1;
    chatInpt = select('#chatInput')
    startbutton.remove();
    inpt.remove();
    chatContainer.show();
    chatInpt.show();
  }
}

function clearName() {
  inpt.value('');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-80);
}
