/*
game.js for Perlenspiel 3.3.x
Last revision: 2021-03-24 (BM)

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

//Global Variables
let coinList = [];
let pegList = [];
let myTimerID;
let path = {path:"audio\\", volume:0.1};

let initBoard = function (width, height) {

	//PS.debug("init: ("+width+", "+height+")\n");

	//set up board pegs
	for (let i = 2; i < height; i++) {
		if (i % 2 === 0) {
			for (let j = 0; j <= width; j++) {
				if ((j + i) % 3 === 0) {
					//PS.debug(j + ", " + i + "\n");
					pegList.push(PS.spriteSolid(1, 1));
					PS.spriteMove(pegList[pegList.length - 1], j, i);
				}
			}
		}
	}

	//add top and bottom covers
	PS.color(PS.ALL, 0, PS.COLOR_RED);
	PS.color(PS.ALL, PS.gridSize().height-1, PS.COLOR_RED);

};

//Actions to take on each frame
let onTick = function() {

	//move all sprites downward
	for (let i = 0; i < coinList.length && coinList.length > 0; i++) {
		//PS.debug("Here in moving down: "+i + "\n");
		PS.spriteMove(coinList[i], PS.spriteMove(coinList[i]).x, PS.spriteMove(coinList[i]).y+1);
		//PS.debug(PS.spriteMove(coinList[i]).y);
	}

	//delete all sprites not in bounds for garbage collection
	for (let i = 0; i < coinList.length && coinList.length > 0; i++) {
		if (PS.spriteMove(coinList[i]).x >= PS.gridSize().width || PS.spriteMove(coinList[i]).x < 0
			|| PS.spriteMove(coinList[i]).y >= PS.gridSize().height || PS.spriteMove(coinList[i]).y < 0) {
			PS.spriteDelete(coinList[i]);
			coinList.splice(i, 1);
			i--;
		}
	}

	//Redraw world
	//redraw pegs
	for (let i = 0; i < pegList.length; i++) {
		PS.color(PS.spriteMove(pegList[i]).x, PS.spriteMove(pegList[i]).y, PS.COLOR_BLACK);
		PS.alpha(PS.spriteMove(pegList[i]).x, PS.spriteMove(pegList[i]).y, 255)
		PS.radius(PS.spriteMove(pegList[i]).x, PS.spriteMove(pegList[i]).y, 50)
	}

	//change coins to circular
	for (let i = 0; i < coinList.length; i++) {
		PS.radius(PS.spriteMove(coinList[i]).x, PS.spriteMove(coinList[i]).y, 50)
	}

	//redraw borders
	PS.color(PS.ALL, 0, PS.COLOR_RED);
	PS.alpha(PS.ALL, 0, 255);
	PS.radius(PS.ALL, 0, 0);
	PS.color(PS.ALL, PS.gridSize().height-1, PS.COLOR_RED);
	PS.alpha(PS.ALL, PS.gridSize().height-1, 255);
	PS.radius(PS.ALL, PS.gridSize().height-1, 0);
};

let collide = function (s1, p1, s2, p2, type) {
	//TODO: check type of collision
	//coin on peg or coin on coin

	//For now, just handle all collisions as coin on peg
	//By moving the peg to either side

	//PS.debug("Collision detected: ");
	if (type === PS.SPRITE_OVERLAP) {
		//PS.debug("Type accounted\n");
		if (PS.random(2) === 1) {
			PS.spriteMove(s1, PS.spriteMove(s1).x+1, PS.spriteMove(s1).y);
			//PS.debug("Moved\n");
		} else {
			PS.spriteMove(s1, PS.spriteMove(s1).x-1, PS.spriteMove(s1).y);
			//PS.debug("Other Moved\n");
		}

		//play clink sound
		PS.audioPlay("clink", path);

	}
}

let addCoin = function(x) {
	let temp = PS.spriteSolid(1,1);
	PS.spriteMove(temp, x, 1);
	PS.spriteSolidColor(temp, PS.COLOR_BLUE);
	PS.spriteCollide(temp, collide);
	coinList.push(temp);
}

PS.init = function( system, options ) {
	// Change this string to your team name
	// Use only ALPHABETIC characters
	// No numbers, spaces or punctuation!

	const TEAM = "spade";

	// Begin with essential setup
	// Establish initial grid size
	PS.gridSize( 30, 36 ); // or whatever size you want

	// Install additional initialization code
	// here as needed

	//change Title
	//PS.statusText("Pachinko");

	//Turn off Grid borders
	PS.border(PS.ALL, PS.ALL, 0);

	//initialize pegs
	initBoard(PS.gridSize().width-1, PS.gridSize().height-1);

	//load clink sound
	PS.audioLoad("clink", path);

	//start onTick timer
	myTimerID = PS.timerStart(8, onTick);

	// PS.dbLogin() must be called at the END
	// of the PS.init() event handler (as shown)
	// DO NOT MODIFY THIS FUNCTION CALL
	// except as instructed

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			return PS.dbErase( TEAM );
		}
		PS.dbEvent( TEAM, "startup", user );
		PS.dbSave( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
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

	//add coin to top of grid at corresponding x pos
	addCoin(x);

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

