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
    
    https://tigoe.github.io/mqtt-examples/
    
    modified 13 Feb 2021
    by David Rios
*/


// MQTT client details:

let broker = {
   hostname: 'public.cloud.shiftr.io', //shiftr example
  //hostname: 'HOSTNAME.cloud.shiftr.io', // hostname from shiftr acct 
  port: 443 // port 443 because Paho uses websockets not http port
  // port: 1883
};


// MQTT client object:
let client;

// client credentials:
let creds = {
  clientID: 'p5js', // choose whatever name you want for your client
   userName: 'public', // shiftr example
  password: 'public' // shiftr example
  // userName: 'YOURNAME', // name from shiftr acct 
  // password: 'YOUR KEY SECRET' // unique Secret from token
}



// topic to subscribe to when you connect:
let topic = 'hello'; // create a topic name, required

// a pushbutton to send messages
let sendButton;
let sent;
let recvd;
let inpt;


function setup() {
  createCanvas(windowWidth, windowHeight);

  //Create an MQTT client:
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

  // create an input
  inpt = createInput("Type a message");
  inpt.position(20, 20)

  // create the send button:
  sendButton = createButton('Send the message');
  sendButton.position(20, 40);
  sendButton.mousePressed(sendMqttMessage);


}

function draw() {
  background(255);

}

// called when the client connects
function onConnect() {
  // localDiv.html('client is connected');
  client.subscribe(topic);
  console.log("connected")
  sent = createDiv("connected");
  sent.position(20, 60);
  recvd = createDiv("Received the message: ");
  recvd.position(20, 80);

}

// called when the client loses its connection
function onConnectionLost(response) {
  if (response.errorCode !== 0) {
    // localDiv.html('onConnectionLost:' + response.errorMessage);
    console.log('onConnectionLost:' + response.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  // remoteDiv.html('I got a message:' + message.payloadString);
  let incoming = split(trim(message.payloadString), "/");
  console.log(incoming);
  recvd.html("Received the message: " + incoming);

}

// called when you want to send a message:
function sendMqttMessage() {
  // if the client is connected to the MQTT broker:
  if (client.isConnected()) {

    let msg = String(inpt.value());
    // start an MQTT message:
    message = new Paho.MQTT.Message(msg);
    // choose the destination topic:
    message.destinationName = topic;
    // send it:
    client.send(message);
    // print what you sent:
    sent.html('I sent: ' + message.payloadString);
  }
}