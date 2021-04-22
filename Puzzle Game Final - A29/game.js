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

//Global Variables
let numLevels = 15;				//Total number of levels
let currentLevel = 1;			//Current level tracker
let levelImages = [];			//stores return values of PS.imageLoad
let levelSizes = [3, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9];		//Dimension of each square level, stored in order of levels
let parsedLevels = [];			//stores each level once it has been parsed in order

let tempPath = [];				//stores the path the player draws before it is set
let setPaths = [];				//stores paths once they have been set
let startSpots = [];			//stores locations of all starting spots for each level
let isDrawing;					//flag for if the player is currently drawing
let currentColor;				//holds the currently selected color
let numFinished = 0;			//the number of completed paths for the current level
let finishedCounts = [1, 1, 3, 3, 3, 4, 6, 4, 7, 6, 7, 7, 9, 5, 5];		//the number of paths that need to be set for each level, stored in order
let startLocation;				//holds the start of the temppath

let sounds = ["lineBreak", "enterBubble", "levelChange", "endHover"];		//file names for all of the game's sounds


//parses a level image into a level and stores it in parsedLevels
let parseLevel = function(image) {
	let tempLevel = [];
	let data = image.data;

	//translates 1d image data into 2d image data.
	for (let i = 0; i < data.length; i++) {
		let temp = {x: i % image.width, y: Math.floor(i / image.height), color: data[i]}
		tempLevel.push(temp);
	}

	parsedLevels.push(tempLevel);

	//Used to initialize the start of the game with the first level
	if (image.source === "Levels/level1.gif") {
		loadLevel(levelSizes[0], levelSizes[0], 1);
	}

	//PS.debug("finished parsing " + image.source+'\n');
};

//Loads the provided level to the screen.
let loadLevel = function(gridX, gridY, level) {
	//reset the arrays
	startSpots = [];
	tempPath = [];
	setPaths = [];
	//PS.debug("loading level: " + level);

	//reset the game world with a call to PS.gridSize
	PS.gridSize(gridX, gridY);

	//re-establish bead attributes
	PS.radius(PS.ALL, PS.ALL, 50);
	PS.border(PS.ALL, PS.ALL, 0);
	PS.fade(PS.ALL, PS.ALL, 15);
	PS.gridColor(0x30b8c9);
	PS.borderColor(PS.ALL, PS.ALL, 0x000000);

	//update level title
	PS.statusText("Level: " + currentLevel);

	numFinished = 0;

	let tempLevel = parsedLevels[level - 1];

	//parse the non-white coordinates as starting locations
	for (let i = 0; i < tempLevel.length; i++) {
		let temp = tempLevel[i];
		PS.color(temp.x, temp.y, temp.color);
		if (PS.color(temp.x, temp.y) !== PS.COLOR_WHITE) {
			startSpots.push({x: temp.x, y: temp.y});
		}
	}

	//if not last level, load the next level into memory
	//This is done sequentially as the level images are loaded into memory asynchronously
	//but need to be stored sequentially
	if (currentLevel < numLevels) {
		levelImages.push(PS.imageLoad("Levels/level" + (currentLevel + 1) + ".gif", parseLevel, 1));
	}

	//play the level transition sound
	PS.audioPlay(sounds[2], {path: "Sounds/", fileTypes: ["mp3"]});

};

//deletes the temp path and resets all relevant data
let breakPath = function() {
	let temp = tempPath.length;
	isDrawing = false;				//Reset drawing flag

	//change all non starting locations back to white as they are not set
	for (let i = 0; i < tempPath.length; i++) {
		PS.color(tempPath[i].x, tempPath[i].y, PS.COLOR_WHITE);
	}

	PS.border(PS.ALL, PS.ALL, 0);

	//sets tempPath to empty
	tempPath = [];

	//play break path sound
	if (temp > 0) {
		PS.audioPlay(sounds[0], {path: "Sounds/", fileTypes: ["mp3"]});
	}
};

//helper function, returns true if the bead at the given coords is a starting location
let isStartSpot = function(x, y) {
	for(let i = 0; i < startSpots.length; i++) {
		if (x === startSpots[i].x && y === startSpots[i].y) {
			return true;
		}
	}

	return false;
};

//adds tempPath to setPath then resets tempPath back to empty
let pushToSetPath = function() {
	for (let i = 0; i < tempPath.length; i++) {
		setPaths.push(tempPath[i]);
	}
	tempPath = [];
};

//used to unset setPaths of specified color
let clearColor = function(color) {
	let flag = false;
	for (let i = 0; i < setPaths.length; i++) {						//iterate over all set paths
		if (PS.color(setPaths[i].x, setPaths[i].y) === color) {		//if bead matches color, set bead color to white
			PS.color(setPaths[i].x, setPaths[i].y, PS.COLOR_WHITE);
			//PS.debug("Clearing color "+color+'\n');
			flag = true;											//signifies if a path was actually removed
		}
	}
	let j = 0;
	while (j > 0 && j < setPaths.length) {									//iterate over setPath locations
		if (PS.color(setPaths[j].x, setPaths[j].y) === PS.COLOR_WHITE) {	//if location of removed bead, splice out the location data
			//PS.debug("here");
			setPaths.splice(j, 1);
			j--;
		}
		j++;
	}

	if (flag) {									//if a path was removed, decrement finished path count
		numFinished--;
		//PS.debug("Subtracting a finish\n");
	}
}

//helper function loads next level if not last level
let nextLevel = function() {
	if (currentLevel < numLevels) {
		currentLevel++;
		loadLevel(levelSizes[currentLevel - 1], levelSizes[currentLevel - 1], currentLevel);
	}
}

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

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

	PS.gridSize( 3, 3 );

	//PS.radius(PS.ALL, PS.ALL, 50);

	//Set Borders
	PS.border(PS.ALL, 0, {top: 10, left: 0, bottom: 0, right: 0});

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	PS.statusText( "Connect The Dots" );

	// Add any other initialization code you need here.

	//load first level from memory
	levelImages.push(PS.imageLoad("Levels/level1.gif", parseLevel, 1));

	//load sounds from memory
	for (let i = 0; i < sounds.length; i++) {
		PS.audioLoad(sounds[i], {path: "Sounds/", fileTypes: ["mp3"]});
	}

	// Change this TEAM constant to your team name,
	// using ONLY alphabetic characters (a-z).
	// No numbers, spaces, punctuation or special characters!

	const TEAM = "spade";

	// This code should be the last thing
	// called by your PS.init() handler.
	// DO NOT MODIFY IT, except for the change
	// explained in the comment below.

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			return;
		}
		PS.dbEvent( TEAM, "startup", user );
		PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
	
	// Change the false in the final line above to true
	// before deploying the code to your Web site.
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

	if (isStartSpot(x, y)) {				//if we click a start spot
		isDrawing = true;					//start drawing
		currentColor = PS.color(x, y);		//set current color
		startLocation = {x: x, y: y};		//set starting location
		clearColor(currentColor);			//in case path was already set, remove it
	}

	//PS.debug(PS.color(x, y)+'\n');

	//update level
	if (numFinished < finishedCounts[currentLevel-1]) {
		PS.statusText("Level: " + currentLevel);
	}


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

	//PS.scale(PS.ALL, PS.ALL, 100);

	// Add code here for when the mouse button/touch is released over a bead.

	//PS.debug("x: "+x+", y: "+y+'\n');

	//helper to distinguish interacting with starting locations
	if (isStartSpot(x, y)) {
		PS.border(PS.ALL, PS.ALL, 0);
	}

	//it drawing and at other location of same color
	if (isDrawing && isStartSpot(x, y) && PS.color(x, y) === currentColor && (x !== startLocation.x || y !== startLocation.y)) {
		numFinished++;
		pushToSetPath();
		isDrawing = false;
	}
	else {
		breakPath();
	}

	//if all paths set, prompt to advance level
	if (numFinished >= finishedCounts[currentLevel-1] && currentLevel < numLevels) {
		PS.statusText("Level Complete, Press 'Space' to continue");
	}

	//if last level, congratulate and prompt restart
	else if (numFinished >= finishedCounts[currentLevel-1] && currentLevel >= numLevels) {
		PS.statusText("YOU WIN, PRESS 'R' TO RESTART");
	}

	//PS.debug(numFinished);


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

	//if drawing, play drawing sound
	if (isDrawing) {
		PS.audioPlay(sounds[1], {path: "Sounds/", fileTypes: ["mp3"]});
	}

	//helper to show interaction with starting locations
	if (isStartSpot(x, y)) {
		PS.border(x, y, 3);
		//PS.audioPlay(sounds[3], {path: "Sounds/", fileTypes: ["mp3"]});
	}

	// Add code here for when the mouse cursor/touch enters a bead.

	//if drawing
	if (isDrawing) {
		if (!isStartSpot(x, y)) {				//if not start/endpoint
			if (PS.color(x, y) === PS.COLOR_WHITE) {	//if white add to temp path and color bead
				tempPath.push({x: x, y: y});
				PS.color(x, y, currentColor);
			}
			else {
				breakPath();				//otherwise break path
				//PS.debug("here");
			}
		}

		//if start/endpoint of different color break path
		else if (isStartSpot(x, y) && (PS.color(x, y) !== currentColor || (x === startLocation.x && y === startLocation.y))) {
			breakPath();
		}

	}

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

	//helper to show interacting with starting locations
	if (!isDrawing && isStartSpot(x, y)) {
		PS.border(x, y, 0);
	}

	//if draw through end location, break path
	//This prevents over drawing through end locations
	if (isDrawing && isStartSpot(x, y) && (x !== startLocation.x || y !== startLocation.y)) {
		breakPath();
	}

	//if (!isDrawing && isStartSpot(x, y)) {
	//	PS.scale(x, y, 100);
	//}
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	//PS.debug( "PS.exitGrid() called\n" );
	//PS.scale(PS.ALL, PS.ALL, 100);



	// Add code here for when the mouse cursor/touch moves off the grid.
	//break path when mouse moves off grid
	if (isDrawing) {
		breakPath();
	}
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

	if (key === 82 || key === 114) {		//R KEY, resets game to level 1
		currentLevel = 1;
		loadLevel(levelSizes[currentLevel-1], levelSizes[currentLevel-1], currentLevel);
	}

	//if level is complete, proceed to next level
	else if (key === PS.KEY_SPACE && numFinished >= finishedCounts[currentLevel-1] && currentLevel < numLevels) { //SPACEBAR
		nextLevel();
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

