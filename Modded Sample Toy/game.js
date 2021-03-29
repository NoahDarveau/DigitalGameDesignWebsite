//Noah Darveau
//Team Spade
//Mod 1: Now Plays random sound effects
//Mod 2: Added Cursor to show which box is currently selected
//Mod 3: Allows Users to type a letter onto each box
//Mod 4: Allows user to change box selection with the arrow keys
//Mod 5: Spacebar makes an all new grid with a new background color






/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // do not remove this directive!

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

//keep track of our currently selected box
let currentBox;

//array holding all the random sounds.
let sounds = ["fx_click", "fx_tick", "fx_bang", "fx_bang", "fx_blip",  "fx_bloop", "fx_boop", "fx_beep",  "fx_pop", "fx_pop", "fx_chirp1", "fx_rip", "fx_scratch",  "fx_squink", "fx_squirp", "fx_squish", "fx_bucket",
    "fx_ding", "fx_zurp", "fx_tweet", "fx_squawk" ];

PS.init = function( system, options ) {

	// Establish inital grid dimensions
	
	PS.gridSize( 13, 8 );
	
	// Set background color to Perlenspiel logo gray
	
	PS.gridColor( 0x303030 );
	
	// Change status line color and text

	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Arrow Keys or Click to Highlight, then type" );

	//Highlight first box
    PS.color(0, 0, PS.COLOR_GRAY_LIGHT);

    //assign current box
    currentBox = [0, 0];
	
	// Preload click sounds
    PS.audioLoad( "fx_click" );
    PS.audioLoad( "fx_tick" );
    PS.audioLoad( "fx_bang" );
    PS.audioLoad( "fx_blip" );
    PS.audioLoad( "fx_bloop" );
    PS.audioLoad( "fx_boop" );
    PS.audioLoad( "fx_beep" );
    PS.audioLoad( "fx_pop" );
    PS.audioLoad( "fx_pop" );
    PS.audioLoad( "fx_chirp1" );
    PS.audioLoad( "fx_rip" );
    PS.audioLoad( "fx_scratch" );
    PS.audioLoad( "fx_squink" );
    PS.audioLoad( "fx_squirp" );
    PS.audioLoad( "fx_squish" );
    PS.audioLoad( "fx_bucket" );
    PS.audioLoad( "fx_ding" );
    PS.audioLoad( "fx_zurp" );
    PS.audioLoad( "fx_tweet" );
    PS.audioLoad( "fx_squawk" );
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
	// Toggle color of touched bead from white to black and back again
	// NOTE: The default value of a bead's [data] is 0, which happens to be equal to PS.COLOR_BLACK

	//PS.color( x, y, data ); // set color to current value of data
	
	// Decide what the next color should be.
	// If the current value was black, change it to white.
	// Otherwise change it to black.

	//let next; // variable to save next color

	//if ( data === PS.COLOR_BLACK ) {
//		next = PS.COLOR_WHITE;
	//}
	//else {
	//	next = PS.COLOR_BLACK;
	//}

	// NOTE: The above statement could be expressed more succinctly using JavaScript's ternary operator:
	// let next = ( data === PS.COLOR_BLACK ) ? PS.COLOR_WHITE : PS.COLOR_BLACK;
	
	// Remember the newly-changed color by storing it in the bead's data.
	
	//PS.data( x, y, next );

    //de-highlight old focused box
    PS.color(currentBox[0], currentBox[1], PS.DEFAULT);

    //assign new focused box
    currentBox = [x, y];

    //highlight new focused box
    PS.color(currentBox[0], currentBox[1], PS.COLOR_GRAY_LIGHT);

    //Play Random sound
    PS.audioPlay( sounds[PS.random(sounds.length) - 1] );
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

// UNCOMMENT the following code BLOCK to expose the PS.release() event handler:

/*

PS.release = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

*/

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.enter() event handler:

/*

PS.enter = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

*/

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exit() event handler:

/*

PS.exit = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

*/

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyDown() event handler:


PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

    //de-highlight old focused box
    PS.color(currentBox[0], currentBox[1], PS.DEFAULT);

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.

    //handle keyboard input
    switch(key) {
        case PS.KEY_ARROW_LEFT:                                      //Move selection left if possible
            if (currentBox[0] > 0) {
                currentBox = [currentBox[0] - 1, currentBox[1]];
            }
            break;
        case PS.KEY_ARROW_RIGHT:                                     //Move selection right if possible
            if (currentBox[0] < PS.gridSize().width - 1) {
                currentBox = [currentBox[0] + 1, currentBox[1]];
            }
            break;
        case PS.KEY_ARROW_UP:                                        //Move selection up if possible
            if (currentBox[1] > 0) {
                currentBox = [currentBox[0], currentBox[1] - 1];
            }
            break;
        case PS.KEY_ARROW_DOWN:                                      //Move selection down if possible
            if (currentBox[1] < PS.gridSize().height - 1) {
                currentBox = [currentBox[0], currentBox[1] + 1];
            }
            break;
        case PS.KEY_SPACE:                                           //Randomize Grid and reset focused box
            PS.gridSize(PS.random(32), PS.random(32));
            currentBox = [0, 0];
            PS.gridColor (PS.makeRGB(PS.random(255), PS.random(255), PS.random(255)));
            break;
        default:                                                     //Otherwise set glyph to selected key
            PS.glyph(currentBox[0], currentBox[1], key);
    }

    //Highlight new focused box
    PS.color(currentBox[0], currentBox[1], PS.COLOR_GRAY_LIGHT);

    //play random sound
    PS.audioPlay( sounds[PS.random(sounds.length) - 1] );
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

// UNCOMMENT the following code BLOCK to expose the PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

// UNCOMMENT the following code BLOCK to expose the PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

// UNCOMMENT the following code BLOCK to expose the PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

*/
