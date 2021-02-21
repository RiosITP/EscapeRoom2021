let socket;
let fontSize = 16;
let players = [];
let messageboxes = [];
let startbutton;
let stage = 0;
let me ;
let speed = 2;
let inpt;
let newname = ""; 
let chatDiv;
let chatName;
let chatInpt;
let chatBtn;
let pchat;
let chat='';
let chatContainer;

function setup() {
    createCanvas(1280,800);
   
    inpt = createInput("Enter Your Name"); 
    inpt.position(width/2,(height/2)-20);
    inpt.mousePressed(clearName);

    chatName= select('#name');
    chatDiv = select('#me');
    chatInpt = select('#chatInput');
    chatContainer = select('#chatContainer');

    chatContainer.hide();
    chatName.hide();
    chatDiv.hide();
    chatInpt.hide();
   // chatBtn.hide();

    startbutton = createButton("Start the Experience");
    startbutton.position(width/2,height/2);
    startbutton.mousePressed(beginGame);

    textSize(fontSize);

    pmouseX= width/2;
    pmouseY= height/2;
    //socket = io.connect('https://jet-flowery-lemongrass.glitch.me');
    socket = io.connect('localhost:3000');
    
    socket.on('connect',()=>{
      me = {
        id: socket.id,
        name: "me",
        x : width/2,
        y : height/2,
        message:'',
        size: 20,
        messagebox: false
      }
    });


    socket.on('movePlayers',()=>{
      console.log("moving");
    });


    socket.on('updatePlayers', (updatedPlayers) =>{ 
        // array comes in, me is still false
        console.log("new player change event")
        console.log(updatedPlayers);
        console.log("existing players")
        console.log(players);
      for(let i=0;i < updatedPlayers.length; i++){
        //if(!updatedPlayers[i].messagebox){
          // if messagbox flag is false
          // double check that theplayer is new, and //also not a duplicate of myself
          let newPlayer = true;
          
          for(let j = 0; j< players.length ; j++){
            if (updatedPlayers[i].id == players[j].id){
              newPlayer = false;
            }
            else if (updatedPlayers[i].id == me.id){
              newPlayer = false;
            }
            // else if(updatedPlayers[i].messagebox){
            //   newPlayer = false;
            // }
            else if(newPlayer){
              if(select('#'+updatedPlayers[i].name) == null){
              let ctnr = select('#chatContainer');
              let div = createDiv();
              div.class('otherchats');
              div.id(updatedPlayers[i].name);
              div.html('<'+"p id=" +"name"+">"+ updatedPlayers[i].name+ "</p>"+
              "<div id="+"chatInput"+"></div>");
              ctnr.child(div);
              //updatedPlayers[i].messagebox = true;
              players.push(updatedPlayers[i]);
              console.log("player added");
              console.log(players);
              }
            }
          }
        //}
      }
        // check for disconnected players
     
      for(let i = 0; i< players.length ; i++){
        let disct = true;
        for(let j=0; j < updatedPlayers.length; j++){
          if(players[i].id == updatedPlayers[j].id){
            disct = false;
            console.log("still there")
          }
        }
        if(disct){
          console.log("this one should go");
          if(players[i].id != me.id){
            let divdel = select('#'+players[i].name);
            console.log(divdel);

            if(divdel){
              console.log(divdel);
              players.splice(i,1);
              divdel.remove();
              console.log("players after remove :");console.log(players);
            }
          }
          
          
        }
      }

      // players = updatedPlayers;
      // console.log("players bottom of event ")
      // console.log(players);
      //socket.emit('updatePlayerStatus',players);
 
    });//update players end

    socket.on('msg', (newInfo) =>{ 
      let talker = select('#'+newInfo.sender);
      if(talker){
        let box = select('#chatInput',talker);
        box.html(newInfo.message);
      }
    });
}

function draw() {
  if(stage == 1){
    background(255);
    noStroke();
    fill(234, 34, 123);
    ellipse(me.x, me.y, 20, 20);
    keyMovers();
  }
}   

function keyMovers() {
  if(keyIsDown(LEFT_ARROW)|| keyIsDown(65)){
   me.x -= speed;
  }
  if(keyIsDown(UP_ARROW)|| keyIsDown(87)){
    me.y -= speed;
  }
  if(keyIsDown(RIGHT_ARROW)|| keyIsDown(68)){
  
    me.x += speed;
  }
  if(keyIsDown(DOWN_ARROW)|| keyIsDown(83)){
    me.y += speed;
  }

  if(me.x < 0 - me.size/2){
    me.x = width;
  }
  if(me.x > width + me.size/2){
    me.x = 0;
  }
  if(me.y < 0 - me.size/2){
    me.y = height;
  }
  if(me.y > height + me.size/2){
    me.y = 0;
  }

  if(players.length > 0){
    for(let i = 0; i< players.length ; i++){
      if(players[i].id != socket.id){
        noStroke();
        fill(0,255,0);
        ellipse(players[i].x, players[i].y,20,20)
        text(players[i].name, players[i].x, players[i].y-15);
      }
    }
  }

  if(stage == 1){
    if(socket){
      let d = {
        id: socket.id,
        name: newname,  
        x: me.x,
        y: me.y,
      }

      chat = chatInpt.value();
      if(chat != pchat){
        let info = {
          message: chat,
          sender: me.name
        }
        socket.emit('msg', info);
        pchat = chat;
      }

      socket.emit('move', d);

      }else{
        console.log("not sending")
      }
  }
}

function beginGame(){
  newname = inpt.value();
  me.name = newname;

  if(newname == "Enter Your Name"|| newname == ""){
    console.log("enter a new name");
  }
  else{
    let data = {
      id: socket.id,  
      name: newname,
      x : mouseX,
      y : mouseY,
      message: '',
      size: 20,
      messagebox: false
    }
    players[0]= data;
    if(socket){
      socket.emit('begingame', data);
      //console.log("sending "+mouseX +" ," +mouseY+  " from: "+socket.id);
      //console.log(socket);
    }else{
      console.log("not sending");
    }
    stage = 1;
    startbutton.remove();
    inpt.remove();
    chatContainer.show();
    chatName.html(me.name);
    chatName.show();
    chatDiv.show();
    chatInpt.show();
    //chatBtn.show();
  }
}

function clearName(){
  inpt.value('');
} 

 //     if(players.length != updatedPlayers.length){
        
  //       if(players.length < updatedPlayers.length){
          
  //         for(let i = 0 ; i<updatedPlayers.length ; i++){ 
  //           let found = false;
  //           for(let j = 0 ; j<players.length ; j++){ 
  //             if(me.id != updatedPlayers[i].id && updatedPlayers[i].id == players[j].id){
  //               found = true;
                
  //             // messageboxes[updatedPlayers.length-1] = div;
  //           }
  //           if(!found){
  //             let ctnr = select('#chatContainer')
  //             let div = createDiv();
  //             div.class('otherchats');
  //             div.id(updatedPlayers[updatedPlayers.length-1].name);
  //             div.html("<div id="+ updatedPlayers[i].name+'>'+
  //             '<'+"p id=" +"name"+">"+ updatedPlayers[i].name + "</p>"+
  //             "<textarea id="+"chatInput"+"></textarea>"+ "</div>")
  //             ctnr.child(div);
  //           }
  //         }
  //       }
  //         players = updatedPlayers;
  //       }
  //   if(players.length > updatedPlayers.length){
      
  //     for(let i=0; i < players.length ; i++){
  //       let found = false;
  //       for(let j=0; j < updatedPlayers.length ; j++){
  //         if(players[i].id == updatedPlayers[j].id){
  //           found = true;
  //         }
  //       }
  //       if(!found){
  //         //splice that from the array
  //         // for(let j=0; j < messageboxes.length ; j++){
  //         //   if(messageboxes[j].id == players[i].id){
  //         //     messageboxes[j].remove();
  //         //     messageboxes.splice(j,1);
  //         //   }
  //         // }
  //       }
  //     }
  //     players = updatedPlayers;

  //   }
  //   // for(let i=0; i < messageboxes.length ; i++){
  //   //   if(players[i].id != me.id){
  //   //     messageboxes[i].html(
  //   //       "<div id="+ players[i].name+'>'+
  //   //       '<'+"p id=" +"name"+">"+ players[i].name + "</p>"+
  //   //       "<textarea id="+"chatInput"+"></textarea>"+ "</div>");
  //   //   }
  //   // }
  // }