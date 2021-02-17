/*
    p5.js MQTT Client example
    This example uses p5.js: https://p5js.org/
    and the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/
    to create an MQTT client that sends and receives MQTT messages.
    The client is set up for use on the shiftr.io test MQTT broker (https://shiftr.io/try),
    but has also been tested on https://test.mosquitto.org
    created 12 June 2020
    modified 20 Aug 2020
    by Tom Igoe
    modified 13 Feb 2021
    by David Rios
*/
let stage = 0;
let code = "rgybrgryby";
let outcode = "";
let mover = false;
let celebrate;
let bg = 0;
let ct = 0;
// topic to subscribe to when you connect:
let topic = 'buttonPuzzle';
// variable for input
let inpt;
// array for sound fx
let clicks = []
// variables for images
let maze, mkey;
// variables for sliders
let mbx, mby, kbx, kby, p, d;
let wronganswer = [
  "you're figuring it out, keep trying!",
  "almost there",
  "keep talking",
  "try again",
  "look closer",
  "I think that was almost it!"
]

// MQTT client details:
let broker = {

  //hostname: 'YOUR BROKER HERE',
  hostname: 'public.cloud.shiftr.io', //shiftr example
  port: 443
};
// MQTT client:
let client;
// client credentials:
let creds = {
  clientID: 'p5MazeClient', // choose whatever name you want
  userName: 'public', // shiftr example
  password: 'public' // shiftr example
  // userName: 'YOURUSERNAME', // name from acct
  // password: 'YOURSECRETKEY' // unique Secret from token
}

function preload() {
  maze = createImg("maze-1.png", "maze");
  mkey = createImg("key-1.png", "colors");
  mkey2 = createImg("keynoface.png", "colors2");
  d = createImg("david.png", "david");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create an MQTT client:
  client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
  // set callback handlers for the client:
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  // connect to the MQTT broker:
  client.connect({
    onSuccess: onConnect, // callback function for when you connect
    userName: creds.userName, // username
    password: creds.password, // password
    useSSL: true // use SSL
  });

  //maze elements
  maze.size(maze.width / 2, maze.height / 2)
  mkey.size(mkey.width / 2, mkey.height / 2)
  mkey2.size(mkey2.width / 2, mkey2.height / 2)

  mkey.position(100, 50);
  mkey2.position(100, 50);
  maze.position(400, 175);
// sliders 
  mbx = createSlider(0, width, 400, 1)
  mby = createSlider(0, height, 200, 1)
  kbx = createSlider(0, width, 100, 1)
  kby = createSlider(0, height, 100, 1)


  d.size(d.width / 2, d.height / 2)
  d.hide();

  mkey2.hide();
  kbx.hide();
  kby.hide();
  mbx.hide();
  mby.hide();

  setTimeout(makeHelpers, 6000);
}

function makeHelpers() {
  kbx.show();
  kby.show();
  mbx.show();
  mby.show();

  kbx.position(10, height-60);
  kby.position(10, height-40);
  mbx.position(width / 3,height-60);
  mby.position(width / 3, height-40);

  p = createP("Need help? Try the sliders ");
  p.position(10, 0);

  mkey.style('z-index', 1);
  mkey2.style('z-index', 2);
  maze.style('z-index', 3)

  console.log("get help")
}

function draw() {
  if (stage == 0) {
    background(255);

    let mx = mbx.value();
    let my = mby.value();
    let kx = kbx.value();
    let ky = kby.value();
    mkey.position(kbx.value(), kby.value());
    maze.position(mbx.value(), mby.value());

    if (dist(mx, my, kx, ky) <= 2.5 && mover == false) {

      kbx.hide();
      kby.hide();
      mbx.hide();
      mby.hide();
      p.html('Ok! Now help David and your friends!');
      mkey.hide();

      mkey2.style('z-index', 2);
      mkey2.position(kbx.value(), kby.value());
      mkey2.show();
      d.show();
      d.style('z-index', 4);
      d.position(kbx.value() + (mkey.width / 2) - d.width / 2, kby.value() + ((mkey.height / 2) - d.height / 2));
      mover = true;
    }
  }

  if (stage == 1) {
    background(255, 255, bg);
    maze.hide();
    mkey2.hide();
    mkey.hide();
    kbx.hide();
    kby.hide();
    mbx.hide();
    mby.hide();

    p.html("YOU DID IT");

    d.size(random(10, width), random(10, height));
    bg += 15;
    bg = bg % 255;
  }
}

// called when the client connects
function onConnect() {
  client.subscribe(topic);
  console.log("connected");
}

// called when the client loses its connection
function onConnectionLost(response) {
  if (response.errorCode !== 0) {
    console.log('onConnectionLost:' + response.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  let incoming = split(trim(message.payloadString), "/");
  console.log(incoming);
  if (incoming == "winner") {
    stage = 1;
  } else {
    p.html(wronganswer[ct]);
  }
  ct++;
  ct = ct % wronganswer.length;
}

// called when you want to send a message:
function sendMqttMessage(msg) {
  // if the client is connected to the MQTT broker:
  if (client.isConnected()) {
    // start an MQTT message:
    message = new Paho.MQTT.Message(msg);
    // choose the destination topic:
    message.destinationName = topic;
    // send it:
    client.send(message);
  }
}

function mousePressed() {
  if (mover) {
    d.position(mouseX - d.width / 2, mouseY - d.width / 2);
  }
}
