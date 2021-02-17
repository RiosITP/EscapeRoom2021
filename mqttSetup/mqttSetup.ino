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

#include <WiFiNINA.h>
#include <ArduinoMqttClient.h>
#include "secrets.h"


// initialize WiFi connection:
WiFiClient wifi;
MqttClient mqttClient(wifi);

// details for MQTT client on Shiftr.io:
char broker[] = "YOUR SHIFTR INSTANCE";
int port = 1883; // wifi connection port
char topic[] = "YOUR TOPIC GOES HERE"; // pick a topic
char clientID[] = "YOUR CLIENTID GOES HERE"; // pick any name

void setup() {
  // initialize serial:
  Serial.begin(9600);
  pinMode(led, OUTPUT);
  
  // wait for serial monitor to open. Comment out to run automatically 
  while (!Serial);

  // initialize WiFi, if not connected:
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to ");
    Serial.println(SECRET_SSID);
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }
  // print IP address once connected:
  Serial.print("Connected. My IP address: ");
  Serial.println(WiFi.localIP());

  // set the credentials for the MQTT client:
  mqttClient.setId(clientID);
  mqttClient.setUsernamePassword(SECRET_MQTT_USER, SECRET_MQTT_PASS);

  // try to connect to the MQTT broker once you're connected to WiFi:
  while (!connectToBroker()) {
    Serial.println("attempting to connect to broker");
    delay(1000);
  }
  Serial.println("connected to broker");
}

void loop() {
  // if not connected to the broker, try to connect:
  if (!mqttClient.connected()) {
    Serial.println("reconnecting");
    connectToBroker();
  }
  
// if you are subscribed and receiving messages
// parse the messages and print them on the serial monitor
// also, trigger actions based on what you receieve
  if (mqttClient.parseMessage() > 0) {
    Serial.print("Got a message on topic: ");
    Serial.println(mqttClient.messageTopic());
    // read the message:
    while (mqttClient.available()) {
      // convert numeric string to an int:
      // int message = mqttClient.parseInt();
      String in = (String)mqttClient.readStringUntil('\n');
      Serial.println(in);
    }
  }

  if (mqttClient.connected()) {
    // do things when connected
  }
}


boolean connectToBroker() {
  // if the MQTT client is not connected:
  if (!mqttClient.connect(broker, port)) {
    // print out the error message:
    Serial.print("MQTT connection failed. Error no: ");
    Serial.println(mqttClient.connectError());
    // return that you're not connected:
    return false;
  }
  // once you're connected, you can proceed:
  mqttClient.subscribe(topic);
  // return that you're connected:
  return true;
}
