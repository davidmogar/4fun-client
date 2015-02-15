var stage, stageWidth, stageHeight, loader;
var grass;

/* Define the players hashmap. Key will be the token received and value the sprite */
var players = {}
 
$(function() {

  var ws = new WebSocket('ws://156.35.95.69:3001');

  ws.onmessage = function(event) {
    console.log(event.data);
    processAnswer(event.data);
  }

  ws.onopen = function(event) {
  }

  init();
});

function processAnswer(data) {
  data = JSON.parse(data);

  switch(data.action) {
    case 'connect':
      processConnectAction(data.token, data.argument);
      break;
    case 'move':
      processMoveAction(data.token, data.argument);
      break;
    case 'say':
      processSayAction(data.token, data.argument);
      break;
    case 'stop':
      processStopAction(data.token);
      break;
  }
}

function processConnectAction(token, name) {
  if (!(token in players)) {
    var player = new Player(name);
    players[token] = player;
    stage.addChild(player);

    $('#chat').append('<p class="client-message">' + name + ' has been connected.</p>');
  }
}

function processMoveAction(token, direction) {
  if (token in players) { players[token].move(direction); }
}

function processSayAction(token, message) {
  if (token in players) {
    var chat = $('#chat');
    chat.append('<p><span>' + players[token].playerName + ':</span>' + message + '</p>');
    chat.scrollTop(chat[0].scrollHeight);
  }
}

function processStopAction(token) {
  if (token in players) { players[token].halt(); }
}


function init() {
  stage = new createjs.Stage('game-canvas');

  /* Add resize event listener to adjust images size */
  window.addEventListener('resize', resize, false);

  manifest = [
    { src: 'player-bald.png', id: 'player-bald' },
    { src: 'player-beard.png', id: 'player-beard' },
    { src: 'player-young.png', id: 'player-young' }
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener('complete', handleComplete);
  loader.loadManifest(manifest, true, '../assets/');

  resize();
}

function handleComplete() {
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener('tick', tick);
}

function resize() {
  var canvas = document.getElementById('game-canvas');

  stage.canvas.height = canvas.clientHeight;
  stage.canvas.width = canvas.clientWidth;

  /* Grab canvas with and height for later calculations */
  stageHeight = stage.canvas.height;
  stageWidth = stage.canvas.width;
}

function tick(event) {
  var delta = event.delta / 1000;

  for (var playerToken in players) { players[playerToken].tick(delta); }

  stage.update(event);
}

var Player = function(name) {
  this.initialize(name);
}

Player.prototype = new createjs.Sprite();
Player.prototype.Sprite_initialize = Player.prototype.initialize;

Player.prototype.initialize = function(name, image, direction) {
  var image = ['player-bald', 'player-beard', 'player-young'][Math.floor(Math.random() * 3)]; 
  var spriteSheet = new createjs.SpriteSheet({
    images: [loader.getResult(image)],
    frames: { width: 64, height: 64, regX: 0, regY: 0 },
    animations: {
      down: [0, 2, 'down', 0.2],
      left: [3, 5, 'left', 0.2],
      right: [6, 8, 'right', 0.2],
      up: [9, 11, 'up', 0.2]
    }
  });

  this.constructor(spriteSheet);
  this.playerName = name;
  this.width = 64;
  this.height = 64;
  this.x = Math.floor(Math.random() * stageWidth - this.width);
  this.y = Math.floor(Math.random() * stageHeight - this.height);
  this.velocity = 60;
  this.gotoAndStop(['down', 'left', 'right', 'up'][Math.floor(Math.random() * 4)]);
  this.direction = '';
}

Player.prototype.move = function(direction) {
  this.direction = direction;
  this.gotoAndPlay(direction);
}

Player.prototype.halt = function() {
  this.stop();
  this.direction = '';
}

Player.prototype.tick = function(delta) {
  switch (this.direction) {
    case 'down':
      this.y += this.velocity * delta;
      if (this.y > stageHeight - this.height) {
        this.direction = 'up';
        this.gotoAndPlay('up');
      }
      break;
    case 'left':
      this.x -= this.velocity * delta;
      if (this.x < 0) {
        this.direction = 'right';
        this.gotoAndPlay('right');
      }
      break;
    case 'right':
      this.x += this.velocity * delta;
      if (this.x > stageWidth - this.width) {
        this.direction = 'left';
        this.gotoAndPlay('left');
      }
      break;
    case 'up':
      this.y -= this.velocity * delta;
      if (this.y < 0) {
        this.direction = 'down';
        this.gotoAndPlay('down');
      }
      break;
  }
}
