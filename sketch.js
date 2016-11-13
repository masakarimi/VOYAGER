
/*
---------------------------VOYAGER------------------------------------------
PROJECT TITLE: VOYAGER
Created by: Rana (Nana)  Zandi
            Mahsa Karimi
Date of completion:11-10-2016
Description: VOYAGER is a 2 player computer game. 
Player One is in charge of the movement of the spaceship, making sure that it reaches Mars safely. 
Player Two is in charge of stopping the sapceship to make it to the mars by dropping asteroids on it.
Spaceship has 4 lives to make it to the Mars. Player Two has 12 attempts to stop player One.
----------------------------------------------------------------------------------
*/


var dataServer;
var channelName = "mars";
var myUserID;

var serial; //variable to hold the serial port object
var serial2;
var ardVal = []; //array that will hold all values coming from arduino
var ardVal2 = [];
var img = [6];
var posY = 200;
var x = 1;
var posX1 = 1;
var posY1 = 1;
var posX2 = 1;
var posY2 = 1;
var earth_x;
var earth_y;
var middleRock_y = 0;
var leftRock_y = 0;
var rightRock_y = 0;
var triggerOne = 0;
var triggerTwo = 0;
var triggerThree = 0;
var almostThere = 0;

var ssPosition = 2;
var lives = 10; //making it 4 lives in reality, since each hit deducts more than one life.

/*function drawImage(Illustration, Position) {
image(Illustration,windowWidth/2 , windowHeight/2+position);
}*/

/*function drawStar(Illustration, Position) {
image(Illustration, x , y);
}*/

/*function drawStar(StarIllustration, Position) {
 
image(StarIllustration, x, (y = y + 10) );
 if (y >= windowHeight) { // This is resetting the stars
   y = 0;
 }

}*/


function preload() {
  img = [loadImage("Astronut.png"), loadImage("Earth.png"), loadImage("Mars.png"), loadImage("Small-Star.png"), loadImage("Big-Star.png"), loadImage("Spaceship.png"), loadImage("Asteroid.png"), loadImage("collision.png"), loadImage("game-over.png"), loadImage("welcome-to-mars.png")];
  spaceshipImage = loadImage("Spaceship.png");
}

function setup() {
  earth_x = (windowWidth) / 4;
  earth_y = (windowHeight) / 2;
  // var x = random ([0],[windowWidth]);
  createCanvas(1280, 1050);
  //Setting up the serial port for ASTEROIDS
  serial2 = new p5.SerialPort(); //create the serial port object
  serial2.open("/dev/cu.usbmodem1421"); //open the serialport. determined 
  serial2.on('open', ardCon2); //open the socket connection and execute the ardCon callback
  serial2.on('data', dataReceived2); //when data is received execute the dataReceived function

  //Setting up the serial port for Spaceship
  //serial = new p5.SerialPort(); //create the serial port object
  //serial.open("/dev/cu.usbmodem1411"); //open the serialport. determined 
  //serial.on('open', ardCon); //open the socket connection and execute the ardCon callback
  //serial.on('data', dataReceived); //when data is received execute the dataReceived function

  dataServer = PUBNUB.init({
    subscribe_key: 'sub-c-dac3ed42-9f77-11e6-9dd9-02ee2ddab7fe', //get these from the pubnub account online
    publish_key: 'pub-c-2863916b-0b91-41df-857f-f977c5f35737',
    ssl: true //enables a secure connection. This option has to be used if using the OCAD webspace
  });
  dataServer.subscribe( //start listening to a specific channel
    {
      channel: channelName, //this uses our variable to listen to the correct channel
      message: readIncoming //the value here must match up with the name of the function that handles the incoming data
    });
  myUserID = PUBNUB.uuid(); //get my unique userID from pubnub

}

function readIncoming(message) //when new data comes in it triggers this function, 
{ // this works becsuse we subscribed to the channel in setup()
  //if (message.userID != myUserID) {
  if (message.type == 'asteroid') {
    // console.log('received ' + message.position);
    if (message.position == 1) {
      triggerOne = 1;
    }
    if (message.position == 2) {
      triggerTwo = 1;
    }
    if (message.position == 3) {
      triggerThree = 1;
    }
  }
  if (message.type == 'voyager') {
    receivePos(message.position);
  }
  //}
}

function keyPressed() {
  if (key == 0) {
    sendRock(0);
  }
  if (key == 1) {
    sendRock(1);
  }
  if (key == 2) {
    sendRock(2);
  }
  if (key == 3) {
    sendRock(3);
  }
}

function sendRock(pos) {
  dataServer.publish({
    channel: channelName,
    message: {
      userID: myUserID, //set the message objects property name and value combos    
      position: pos,
      type: 'asteroid'

    }
  });
}

function sendVoyager(pos) {
  dataServer.publish({
    channel: channelName,
    message: {
      userID: myUserID, //set the message objects property name and value combos    
      position: pos,
      type: 'voyager'

    }
  });
}

function receivePos(pos) {
  ssPosition = pos;
}

function draw() {

  background("#151442");

  image(img[1], earth_x, earth_y);
  earth_y = earth_y + 8;


  image(img[4], 150, (posY = posY + 30));
  image(img[4], width / 2 - 50, (posY1 = posY1 + 30));
  image(img[4], width - 150, (posY2 = posY2 + 30));
  if (posY2 >= height) { // This is resetting the stars

    posY = 0;
    posY1 = -300;
    posY2 = -100;
  }

  //var rock_pos = ardVal2[3];
  // console.log(ardVal2[3]);

  //for (var i=0; i<= ardVal2.length; i++) {
  if (ardVal2[0] == 1) {
    triggerOne = 1;
    sendRock(1);
    almostThere++;
  }

  if (ardVal2[1] == 2) {
    triggerTwo = 1;
    sendRock(2);
    almostThere++;
  }

  if (ardVal2[2] == 3) {
    triggerThree = 1;
    sendRock(3);
    almostThere++;
  }

  if (triggerOne == 1) {
    image(img[6], windowWidth / 2 + (1 - 2) * 200 - 80 , leftRock_y);
    leftRock_y = leftRock_y + 50;
    if (leftRock_y >= windowHeight / 1.3) {
      triggerOne = 0;
      leftRock_y = 0;
    }
    checkCollision(leftRock_y, 1);
  }

  if (triggerTwo == 1) {
    image(img[6], windowWidth / 2 + (2 - 2) * 200 - 80, middleRock_y);
    middleRock_y = middleRock_y + 50;
    if (middleRock_y >= windowHeight / 1.3) {
      triggerTwo = 0;
      middleRock_y = 0;
    }
    checkCollision(middleRock_y, 2);
  }

  if (triggerThree == 1) {
    image(img[6], windowWidth / 2 + (3 - 2) * 200 - 80 , rightRock_y);
    rightRock_y = rightRock_y + 50;
    if (rightRock_y >= windowHeight / 1.3) {
      triggerThree = 0;
      rightRock_y = 0;
    }
    checkCollision(rightRock_y, 3);
  }


  //}


  //posX = random (windowWidth);
  var xpos = ardVal[0];
  // console.log(ardVal[0]);
  //image(spaceshipImage, xpos, 300);   
  // ellipse(width/2,height/2,ardVal[0],ardVal[0]); //apply the sensor value to the radius of the ellipse
  if (xpos > 100 && xpos < 400) {
    //image(spaceshipImage, 100, 300); //Spaceship position on the left side
    sendVoyager(1);

  }
  if (xpos > 400 && xpos < 900) {
    // image(spaceshipImage, windowWidth/2, 300); //Spaceship position on the center
    sendVoyager(2);
  }

  if (xpos > 900 && xpos < 1500) {
    //Spaceship position on the right
    sendVoyager(3);

  }
  image(spaceshipImage, windowWidth / 2 + (ssPosition - 2) * 200 - 80, 300); // change the number changes the distance
  // console.log(ssPosition);

  delay(50);

  if (lives == 0) {

    image(img[8], 300, 200);

  }

  if (almostThere > 28) {

    image(img[2], (windowWidth) / 4, 100);
    image(img[0], (windowWidth) / 4, 100);
    image(img[9], (windowWidth + 800) / 4, 100);
  }


}


function delay(ms) {
  var cur_d = new Date();
  var cur_ticks = cur_d.getTime();
  var ms_passed = 0;
  while (ms_passed < ms) {
    var d = new Date(); // Possible memory leak?
    var ticks = d.getTime();
    ms_passed = ticks - cur_ticks;
    // d = null; // Prevent memory leak?
  }
}

function checkCollision(y_position, position) {
  //  console.log(y_position);
  //  console.log(ssPosition);
  //  console.log(position);


  if (y_position > 300 && y_position < 500 && ssPosition == position) {
    //   console.log("BAM");
    image(img[7], windowWidth / 2 + (ssPosition - 2) * 200 - 150, y_position - 80);
    //collision
    if (lives > 0) {
      lives--;
      //startNewRound();
      //   console.log(lives);
    }
  }
}

function dataReceived() //this function is called every time data is received
{
  console.log('data received');
  var rawData = serial.readStringUntil('\r\n'); //read the incoming string until it sees a newline
  if (rawData.length > 1) //check that there is something in the string
  { //values received in pairs  index,value
    var incoming = rawData.split(","); //split the string into components using the comma as a delimiter
    for (var i = 0; i < incoming.length; i++) {
      ardVal[i] = parseInt(incoming[i]);
    }
  }
}
// SPACESHIP
function ardCon() {
  console.log("connected to the arduino");
}

function dataReceived2() //this function is called every time data is received
{

  var rawData = serial2.readStringUntil('\r\n'); //read the incoming string until it sees a newline
  if (rawData.length > 1) //check that there is something in the string
  { //values received in pairs  index,value
    var incoming = rawData.split(","); //split the string into components using the comma as a delimiter
    for (var i = 0; i < incoming.length; i++) {
      ardVal2[i] = parseInt(incoming[i]); //convert the values to ints and put them into the ardVal array
      //  console.log(ardVal2[i]);
    }
  }
}
// ASTEROIDS
function ardCon2() {
  console.log("connected to the arduino 2");
}