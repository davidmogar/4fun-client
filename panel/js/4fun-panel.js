var stage, stageWidth, stageHeight, loader;
var grass;

/* Define the players hashmap. Keys will be the token received and values the player */
var players = {}
 
$(function() {

  var ws = new WebSocket('ws://156.35.95.69:3001');

  /* We'll receive actions from the server. Process each one! */
  ws.onmessage = function(event) { processAnswer(event.data) };
  
  /* Initialize the game stage */
  initializeStage();
});

function processAnswer(data) {
  data = JSON.parse(data);

  switch(data.action) {
    case 'connect':
      processConnectAction(data.token, data.name);
      break;
    case 'move':
      processMoveAction(data.token, data.direction);
      break;
    case 'say':
      processSayAction(data.token, data.message);
      break;
    case 'stop':
      processStopAction(data.token);
      break;
  }
}

/**
 * Called every time a new player connects to the chat.
 *
 * @param {token} connection token.
 * @param {name} name given by the player.
 */
function processConnectAction(token, name) {
  if (!(token in players)) {
    var player = new Player(name);
    players[token] = player;
    stage.addChild(player);

    $('#chat').append('<p class="client-message">' + name + ' has been connected.</p>');
  }
}

/**
 * Called on move action. Moves the player in the specified direction.
 *
 * @param {token} connection token.
 * @param {direction} direction to where to move the player.
 */
function processMoveAction(token, direction) {
  if (token in players) { players[token].move(direction); }
}

/**
 * Called on say action. Prints a message on the chat panel.
 *
 * @param {token} connection token.
 * @param {message} message to be printed.
 */
function processSayAction(token, message) {
  if (token in players) {
    var chat = $('#chat');
    chat.append('<p><span>' + players[token].playerName + ':</span>' + message + '</p>');
    chat.scrollTop(chat[0].scrollHeight);
  }
}

/**
 * Called when a player request to stop.
 *
 * @param {token} connection token.
 */
function processStopAction(token) {
  if (token in players) { players[token].halt(); }
}

/**
 * Initializes the game stage.
 */
function initializeStage() {
  stage = new createjs.Stage('game-canvas');

  /* Add resize event listener to adjust images size */
  window.addEventListener('resize', resizeStage, false);

  /* Load assets of the game */
  manifest = [
    { src: 'player-bald.png', id: 'player-bald' },
    { src: 'player-beard.png', id: 'player-beard' },
    { src: 'player-young.png', id: 'player-young' }
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener('complete', handleComplete);
  loader.loadManifest(manifest, true, 'assets/');

  resizeStage();
}

/**
 * Called once all the assets are loaded.
 */
function handleComplete() {
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener('tick', tick);
}

/**
 * Resize the stage and save dimmensions for later calculations.
 */
function resizeStage() {
  var canvas = document.getElementById('game-canvas');

  stage.canvas.height = canvas.clientHeight;
  stage.canvas.width = canvas.clientWidth;

  /* Grab canvas with and height for later calculations */
  stageHeight = stage.canvas.height;
  stageWidth = stage.canvas.width;
}

/**
 * Called on each tick. Update player positions here.
 */
function tick(event) {
  var delta = event.delta / 1000;

  /* Call each player tick function */
  for (var playerToken in players) { players[playerToken].tick(delta); }

  stage.update(event);
}

/**
 * Player definition. This object use an Sprite internally and defines
 * some useful variables like player's name and velocity.
 */
var Player = function(name) {
  this.initialize(name);
}

Player.prototype = new createjs.Sprite();
Player.prototype.Sprite_initialize = Player.prototype.initialize;

/**
 * Initializes the player with random image and position.
 */
Player.prototype.initialize = function(name) {

  /* Define player sprite */
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
  this.x = Math.floor(Math.random() * (stageWidth - this.width));
  this.y = Math.floor(Math.random() * (stageHeight - this.height - 50)); // -50 to avoid title panel
  this.velocity = 60;
  this.gotoAndStop(['down', 'left', 'right', 'up'][Math.floor(Math.random() * 4)]);
  this.direction = '';
}

/**
 * Change the player direction.
 *
 * @param {direction} new player direction.
 */
Player.prototype.move = function(direction) {
  this.direction = direction;
  this.gotoAndPlay(direction);
}

/**
 * Halts the player in the current position. Not use stop as method name. Won't work.
 */
Player.prototype.halt = function() {
  this.stop();
  this.direction = '';
}

/**
 * Updates player position.
 *
 * @param {delta} delta value calculated on stage tick function.
 */
Player.prototype.tick = function(delta) {
  switch (this.direction) {
    case 'down':
      this.y += this.velocity * delta;
      if (this.y > stageHeight - this.height) {
        this.gotoAndPlay(this.direction = 'up');
      }
      break;
    case 'left':
      this.x -= this.velocity * delta;
      if (this.x < 0) {
        this.gotoAndPlay(this.direction = 'right');
      }
      break;
    case 'right':
      this.x += this.velocity * delta;
      if (this.x > stageWidth - this.width) {
        this.gotoAndPlay(this.direction = 'left');
      }
      break;
    case 'up':
      this.y -= this.velocity * delta;
      if (this.y < 0) {
        this.gotoAndPlay(this.direction = 'down');
      }
      break;
  }
}
