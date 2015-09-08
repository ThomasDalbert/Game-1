var jade 	   = require( 'jade' )
var morgan     = require( 'morgan' )
var express    = require( 'express' )
var app 	   = express()

var clientPath = __dirname + '/../client/'
var sharedPath = __dirname + '/../shared/'

// -------------- Configuration -------------- //
app.set( 'views',     clientPath + 'views' )			// Views folder
.use( express.static( clientPath + 'javascript' ) )		// Auto-load
.use( express.static( clientPath + 'stylesheets' ) )	// Auto-load
.use( express.static( clientPath + 'lib') )				// Auto-load
.use( express.static( sharedPath ) )					// Auto-load
.use( morgan('dev') )									// Logger


// -------------- Routes -------------- //
app.get( '/', function ( req, res ) {
	res.render( 'index.jade' )
})

// -------------- Sockets -------------- //
var server = app.listen( process.env.PORT || 8080, function () {
	console.log( 'Server is running...' )
})
var sio = require( 'socket.io' ).listen( server )


var SpeechBubble = require( '../shared/speechBubble' )
var Character 	 = require( '../shared/character' )
var Instance  	 = require( '../shared/instance' )

var instance1  = new Instance()

sio.sockets.on( 'connection', function ( socket ) {
	// on connection
	var socketId = socket.id
	console.log( 'Client connected : ' + socketId )
	var newCharacter = new Character( socketId )
	instance1.addCharacter( newCharacter )
	var currentCharacter = instance1.characterList[ socketId ]
	sio.to( socketId ).emit( 'serverDatas_arrived', { id: socketId, instance: instance1 } )
	socket.broadcast.emit( 'player_connected', newCharacter )

	// on moving character
	socket.on( 'character_moving', function ( data ) {
		if ( data.property === 'x' ) {
			currentCharacter.x = data.value
			sio.emit( 'character_moved', { id: socketId, property: 'x', value: currentCharacter.x } )
		}
		else if ( data.property === 'y' ) {
			currentCharacter.y = data.value
			sio.emit( 'character_moved', { id: socketId, property: 'y', value: currentCharacter.y } )
		}
	})
	// on writing character
	socket.on( 'character_startingToWrite', function () {
		currentCharacter.writing = true
		sio.emit( 'character_startedToWrite', socketId )	// à modifier par un broadcast

		socket.on( 'character_stoppingToWrite', function( message ) {
			currentCharacter.writing = false
			sio.emit( 'character_stoppedToWrite', { id: socketId, message: message } )
		})
	})
	// on disconnection
	socket.on( 'disconnect', function () {
		console.log( 'Client disconnected : ' + socketId )
		instance1.removeCharacter( socketId )
		sio.emit( 'player_disconnected', socketId )
	})
})