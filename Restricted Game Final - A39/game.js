/*
game.js for Perlenspiel 3.3.xd
Last revision: 2021-04-08 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-21 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Add code to the event handlers required by your project.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

let myTimerID;
let frameRate = 30;

let numLevels = 4;
let currentLevel = 1;
let sounds = ["Jump", "Win", "EndGame"];
let parsedLevels = [];
let winSoundDone = true;
let musicChannel;

let player = {

	dx: 0,
	dy: 0,
	onGround: true,
	jumpPower: -1.2

}
let playerSprite;
let playerMoveSlowdown = 2;
let playerMoveCooldown = 0;
//let playerJumpSlowdown = 1;
//let playerJumpCooldown = 0;

let goalCoords = [];
let powerCoords = [];

let gravity = 0.175;
let darknessFactor = 2;
let darknessFactorDefault = 2;
let lightDecayRate = 0.995;
let lightRadius = 4;
let lightRadiusDefault = 4;
let phraseNum = 0;

let phrases = ["Who am I?", "I am but a speck", "An empty being.", "My time may be short...", "But perhaps I can savor this fleeting moment.", "What's this?!",
"A pleasant glow.", "But alas, all things fade.", "Just like this light", "That beckons me onward...", "In an everlong pursuit of radiance", "Illuminating the world around me",
"And guiding me forth.", "Alas, my time here draws near", "Like this light of mine...", "I too, fade.", "With a final breath..."];

//parse the 1D level-image data into a 2D data structure
let parseLevel = function(image) {
	let tempLevel = [];
	let data = image.data;

	//translates 1d image data into 2d image data.
	for (let i = 0; i < data.length; i++) {
		let temp = {x: i % image.width, y: Math.floor(i / image.height), color: data[i]}
		tempLevel.push(temp);
	}

	parsedLevels.push(tempLevel);

	//If its the first level, load the level
	if (image.source === "Levels/level1.gif") {
		loadLevel(1);

		const TEAM = "spade";

		// This code should be the last thing
		// called by your PS.init() handler.
		// DO NOT MODIFY IT, except for the change
		// explained in the comment below.
		//PS.debug("here");
		PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
			if ( user === PS.ERROR ) {
				return;
			}
			PS.dbEvent( TEAM, "startup", user );
			PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
		}, { active : false } );
	}

}

//loads the specefied level to the game world
let loadLevel = function(level) {
	resetBoard(); //start with a fresh world

	let tempLevel = parsedLevels[level-1];
	let playerStart = {x: 0, y: PS.gridSize().height-1};

	//parse 2D level data into the respective bead's data
	for (let i = 0; i < tempLevel.length; i++) {
		if (tempLevel[i].color === PS.makeRGB(0, 255, 0)) {
			PS.data(tempLevel[i].x, tempLevel[i].y, "GOAL");
			goalCoords.push({x: tempLevel[i].x, y: tempLevel[i].y});
		}
		else if (tempLevel[i].color === PS.makeRGB(0, 0, 255)) {
			PS.data(tempLevel[i].x, tempLevel[i].y, "PLAYER START");
			playerStart.x = tempLevel[i].x;
			playerStart.y = tempLevel[i].y;
		}
		else if (tempLevel[i].color === PS.makeRGB(0, 0, 0)) {
			PS.data(tempLevel[i].x, tempLevel[i].y, "WALL");
		}
		else if (tempLevel[i].color === PS.makeRGB(255, 0, 0)) {
			PS.data(tempLevel[i].x, tempLevel[i].y, "SECRET");
		}
		else if (tempLevel[i].color === PS.makeRGB(125, 125, 125)) {
			PS.data(tempLevel[i].x, tempLevel[i].y, "POWERUP");
			powerCoords.push({x: tempLevel[i].x, y: tempLevel[i].y});
		}
	}

	//if its the first level, create the player sprite
	if (currentLevel === 1) {
		playerSprite = PS.spriteSolid(1, 1);
		PS.spriteAxis(playerSprite, 0, 1);
	}

	//move sprite to designated starting position
	PS.spriteMove(playerSprite, playerStart.x, playerStart.y);
	PS.spriteSolidColor(playerSprite, PS.COLOR_WHITE);

	//draw the lighting
	updateLighting();

	//start the timer
	myTimerID = PS.timerStart(60 / frameRate, onTick);

	//if there is a level after this one, parse it into memory.
	if (currentLevel < numLevels) {
		PS.imageLoad("Levels/level" + (currentLevel + 1) + ".gif", parseLevel, 1);
	}

	/*
	for (let i = 0; i < 32; i++ ) {
		for (let j = 0; j < 32; j++) {
			if (PS.data(j, i) === "WALL") {
				PS.debug("x: "+j+", y: "+i+", WALL\n");
			}
		}
	}

	 */
}
//timer function: runs each frame
let onTick = function() {
	if (playerMoveCooldown > 0) {
		playerMoveCooldown--;
	}

	darknessFactor /= lightDecayRate; //decrease the player's light's brightness

	//make the player fall if necessary
	updateY();

	//update all the lights
	updateLighting();

	//check if the player is at a noteworthy location
	checkLocation();
};

//attempts to move the player horizontally if possible
let tryMove = function(direction) {
	if (playerMoveCooldown <= 0) {
		//Move in that direction
		if (PS.spriteMove(playerSprite).x + direction >= 0 && PS.spriteMove(playerSprite).x + direction < PS.gridSize().width) {
			PS.spriteMove(playerSprite, getNextX(direction), PS.spriteMove(playerSprite).y);
			playerMoveCooldown = playerMoveSlowdown;
			updateLighting();
		}
	}
};

//starts a jump
let initJump = function() {
	if (player.onGround) {
		player.dy = player.jumpPower;
		player.onGround = false;

		PS.audioPlay("Jump", {path: "Sounds/", fileTypes: ["wav"]});
	}
}

//handles updating the y position of the player each frame
let updateY = function() {
	player.dy += gravity;	//increase the downward velocity by gravity
	let playerX = PS.spriteMove(playerSprite).x;
	let playerY = PS.spriteMove(playerSprite).y;

	let nextY = getNextY();	//calculate next y location

	//if player is not going to move down this next frame and sitting atop a wall set them on ground and y0velocity to zero
	if (nextY === playerY &&
		((PS.data(playerX, Math.min(playerY+1, PS.gridSize().height-1)) === "WALL") || playerY >= PS.gridSize().height-1)) {
		player.dy = 0;
		player.onGround = true;
	}
	//if player is jumping upwards into a wall, stop them and set velocity to zero
	else if(PS.data(playerX, Math.max(nextY, 0)) === "WALL") {
		player.dy = 0;
		PS.spriteMove(playerSprite, playerX, nextY+1);
	}
	//if all is good, just move player to their next y position
	else {
		PS.spriteMove(playerSprite, playerX, nextY);
	}

};

//updates the brightness of the light surrounding the player
let updateLighting = function() {
	PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);

	//for a square around the player
	for (let dy = -lightRadius; dy <= lightRadius; dy++) {
		for (let dx = -lightRadius; dx <= lightRadius; dx++) {

			let coords = {x: PS.spriteMove(playerSprite).x + dx, y: PS.spriteMove(playerSprite).y + dy};

			if ((dy !== 0 || dx !== 0) && (coords.x >= 0 && coords.x < PS.gridSize().width && coords.y >= 0 && coords.y < PS.gridSize().height)
				&& PS.data(coords.x, coords.y) !== "WALL") { //if a valid position and not a wall or the player themself
				if (PS.data(coords.x, coords.y) === "POWERUP") { //if a powerup is found, draw the powerup
					PS.color(coords.x, coords.y, 180, 180, 180);
				}
				else {	//otherwise calculate the bead's brightness
					let lightLevel = calcLightLevel(dx, dy);
					PS.color(coords.x, coords.y, lightLevel, lightLevel, lightLevel);
				}
			}
		}
	}

	if (calcLightLevel(lightRadius, 0) < 1) {
		lightRadius--;
	}

	redrawWorld();
}

//helper function to calculate how bright the light should be for the given tile
let calcLightLevel = function(dx, dy) {
	let distance =  Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	return 175 / (distance * darknessFactor);
};

//check for horizontal collisions with walls
let getNextX = function(direction) {
	if (PS.data(PS.spriteMove(playerSprite).x + direction, PS.spriteMove(playerSprite).y) === "WALL") {
		return PS.spriteMove(playerSprite).x;
	}
	else {
		return PS.spriteMove(playerSprite).x + direction;
	}
}

//checks if the player would collide with a wall between its current vertical position and new vertical position next frame
//If it would collide, moves the player up to the wall
let getNextY = function() {
	let startY = PS.spriteMove(playerSprite).y;
	let endY = Math.floor(PS.spriteMove(playerSprite).y + player.dy);

	//PS.debug("startY: "+startY+", endY: "+endY+'\n');

	//if moving upward
	if (startY > endY) {
		for (let y = startY; y >= endY; y--) { //check all positions between current and next position for a wall
			if (y >= 0) {
				if (PS.data(PS.spriteMove(playerSprite).x, y) === "WALL") { //if hit a wall, move up to it.
					//player.dy = 0;
					return y;
				}
			}
			else {
				return 0;
			}
		}
	}
	//if moving downward
	else if (startY <= endY) {
		for (let y = startY; y <= endY; y++) {  //check all positions between current and next position for a wall
			if (y < PS.gridSize().height) {
				if (PS.data(PS.spriteMove(playerSprite).x, y) === "WALL") { //if hit a wall, move up to it.
					return y-1;
				}
			}
			else {
				return PS.gridSize().height-1;
			}
		}
	}
	return endY;
}

//redraw overwritten beads
let redrawWorld = function () {
	PS.alpha(PS.ALL, PS.ALL, 255);
	for (let i = 0; i < goalCoords.length; i++) {
		PS.color(goalCoords[i].x, goalCoords[i].y, 225, 225, 225);
	}
	PS.color(PS.spriteMove(playerSprite).x, PS.spriteMove(playerSprite).y, 255, 255, 255);
}

//check the players position and take appropriate actions
let checkLocation = function () {
	if (PS.data(PS.spriteMove(playerSprite).x, PS.spriteMove(playerSprite).y) === "GOAL") { //on a goal tile
		if (winSoundDone) {
			PS.timerStop(myTimerID);
			PS.audioPlay(sounds[1], {path: "Sounds/", fileTypes: ["wav"], volume: 0.35, onLoad: updateWinSoundDone, onEnd: nextLevel});
		}
	}
	else if (PS.data(PS.spriteMove(playerSprite).x, PS.spriteMove(playerSprite).y) === "SECRET") {	//on a secret tile
		PS.statusText("Congrats, you found a Super Secret Spot!");
	}
	else if (PS.data(PS.spriteMove(playerSprite).x, PS.spriteMove(playerSprite).y) === "POWERUP") {  //on a powerup tile
		//lightRadius++;
		phraseNum++;		//show next phrase
		PS.statusText(phrases[phraseNum]);

		darknessFactor = Math.sqrt(darknessFactor);	//increase player light brightness

		//remove the powerup from the board
		PS.data(PS.spriteMove(playerSprite).x, PS.spriteMove(playerSprite).y, 0);
		for (let i = 0; i < powerCoords.length; i++) {
			if (powerCoords[i].x === PS.spriteMove(playerSprite).x && powerCoords[i].y === PS.spriteMove(playerSprite).y) {
				powerCoords.splice(i, 1);
			}
		}
	}
	else{
		PS.statusText(phrases[phraseNum]);
	}
}

//This is basically just a semaphore so the audio doesn't constantly play over itself
let updateWinSoundDone = function() {
	winSoundDone = !winSoundDone;
}

//if another level exists, go to it, otherwise play end game animation
let nextLevel = function() {
	if (currentLevel < numLevels) {
		currentLevel++;
		loadLevel(currentLevel);
		winSoundDone = true;
	}
	else {
		winGame();
	}
}

//resets board to defaults
let resetBoard = function() {
	PS.gridSize( 32, 32 );
	PS.border(PS.ALL, PS.ALL, 0);
	PS.gridColor(PS.COLOR_BLACK);
	PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
	PS.statusText( "Touch Gray" );
	PS.statusColor(PS.COLOR_GRAY_LIGHT);

	//empty goal and power arrays to get them ready for next level
	goalCoords = [];
	powerCoords = [];

	//reset defaults
	lightRadius = lightRadiusDefault;
	darknessFactor = darknessFactorDefault;
}

//init end game animation
let winGame = function() {
	PS.audioFade(musicChannel, PS.CURRENT, 0);
	PS.audioPlay(sounds[2], {path: "Sounds/", fileTypes: ["wav"], volume: 0.30});
	PS.fade(PS.ALL, PS.ALL, 240, {onEnd: fadeToBlack});
	PS.statusText("Enlightenment");
	PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);
}

let getChannel = function(data) {
	musicChannel = data.channel;
}

//second half of end game animation
let fadeToBlack = function() {
	PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
	PS.statusFade(240, {onEnd: null});;
	PS.statusColor(PS.COLOR_BLACK);

	//reload page after a delay
	setTimeout(function(){
		location.reload();
	}, 8500);
}

PS.init = function( system, options ) {
	// Uncomment the following code line
	// to verify operation:

	// PS.debug( "PS.init() called\n" );

	// This function should normally begin
	// with a call to PS.gridSize( x, y )
	// where x and y are the desired initial
	// dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the
	// default dimensions (8 x 8).
	// Uncomment the following code line and change
	// the x and y parameters as needed.

	resetBoard(); //set board to defaults

	PS.keyRepeat(true, 1, 1);	//disable key repeat delay

	//load all sounds
	for (let i = 0; i < sounds.length; i++) {
		PS.audioLoad(sounds[i], {path: "Sounds/", fileTypes: ["wav"]});
	}

	//load background music
	PS.audioLoad("Music", {path: "Music/", fileTypes: ["mp3"], loop: true, lock: true, autoplay: true, volume: 0.15, onLoad: getChannel});

	//load first status message
	PS.statusText(phrases[phraseNum]);

	//load first level
	PS.imageLoad("Levels/level1.gif", parseLevel, 1);

};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
	switch (key) {
		case PS.KEY_ARROW_LEFT:
			tryMove(-1);
			break;
		case 97:
			tryMove(-1);
			break;
		case PS.KEY_ARROW_RIGHT:
			tryMove(1);
			break;
		case 100:
			tryMove(1);
			break;
		case PS.KEY_SPACE:
			initJump();
			break;
		case 119:
			initJump();
			break;
		case PS.KEY_ARROW_UP:
			initJump();
			break;
		default:
			break;
	}

};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
	if (key === 119 || key === PS.KEY_ARROW_UP || key === PS.KEY_SPACE) {
		if (!player.onGround && player.dy < 0) {
			player.dy = 0;
		}
	}
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

	//	 var device = sensors.wheel; // check for scroll wheel
	//
	//	 if ( device ) {
	//	   PS.debug( "PS.input(): " + device + "\n" );
	//	 }

	// Add code here for when an input event is detected.
};

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};
