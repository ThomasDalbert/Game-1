// Game constructor -->
function Game ( canvas ) {
	if ( canvas != undefined ) {
		this.initialize( canvas )
	}
	else {
		console.error( 'Constructor called without parameter.' )
	}
}

// Game methods -->
Game.prototype = {
	initialize : function ( canvas ) {
		this.canvas				= canvas
		this.keysDown			= {}
		this.clientCharacterId 	= ''
		this.clientCharacter 	= null
		this.instance 			= null

		var w = window
		this.canvas.prop( 'width' , w.innerWidth  )
				   .prop( 'height', w.innerHeight )
		
		this.socket = io.connect( 'http://127.0.0.1:8080' )
		var this2 = this
		this.copyServerDatas( function () {
			this2.keepInstanceUpdated()
			this2.listenForKeys()
		})

		return this
	},
	copyServerDatas : function ( callback ) {
		var this2 = this

		this.socket.once( 'serverDatas_arrived', function ( data ) {
			this2.clientCharacterId = data.id
			this2.instance 			= new Instance( data.instance )
			this2.clientCharacter   = this2.instance.characterList[ this2.clientCharacterId ]
			callback()
		})

		return this
	},
	keepInstanceUpdated : function () {
		var this2 = this

		this.socket.on( 'player_connected', function ( data ) {
			this2.instance.addCharacter( new Character ( data ) )
			this2.instance.characterList[ data.id ].draw()
		})
		.on( 'character_moved', function ( data ) {
			var characterToUpdate = this2.instance.characterList[ data.id ]
			switch ( data.property ) {
				case 'x' : 
					characterToUpdate.x = data.value
				break
				case 'y' :
					characterToUpdate.y = data.value
				break
			}
			characterToUpdate.updateCoordinates()
		})
		.on( 'character_startedToWrite', function ( characterId ) {
			console.log( 'Server notifies : client began to write. Putting him into "writing mode"...' )
			this2.instance.characterList[ characterId ].writing = true
		})
		.on( 'character_stoppedToWrite', function ( data ) {
			console.log( 'Server notifies : client stopped to write. Starts displaying the speech bubble...' )
			var characterStoppingToWrite = this2.instance.characterList[ data.id ]
			characterStoppingToWrite.writing = false
			if ( data.id !== this2.clientCharacterId ) {
				characterStoppingToWrite.speechBubble.updateTextContent( data.message )
			}
			characterStoppingToWrite.speechBubble.updateCoordinates( { x: characterStoppingToWrite.x, y: characterStoppingToWrite.y } )
			console.log( 'x : ' + characterStoppingToWrite.x + ' y : ' + characterStoppingToWrite.y )
												 characterStoppingToWrite.speechBubble.start()
		})
		.on( 'player_disconnected', function ( characterId ) {
			this2.instance.characterList[ characterId ].deleteCharacter()
			this2.instance.removeCharacter( characterId )
		})

		return this
	},
	listenForKeys : function () {
		var this2 			= this
		var backspacePushed = false

		$( document ).keydown( function ( event ) {
			if ( event.which === 8 ) {
				event.preventDefault()	// Prevents the browser to navigate back at backspace pressing
				backspacePushed = true
				$( this ).trigger( 'keypress' )
			}
			else if ( !this2.clientCharacter.writing && event.which !== 13 ) {
				console.log( 'Client is normally moving...' )
				this2.keysDown[ event.which ] = true
			}
		})
		.keypress( function ( event ) {
			if ( !this2.clientCharacter.writing && event.which === 13 ) {
				console.log( '"Enter" key found : client starts writing' )
				this2.keysDown[ 13 ] = true
			}
			else if ( this2.clientCharacter.writing ) {
				( event.which === 13 )	// Pressing "Enter"
					? (
						console.log( '"Enter" key found : client stops writing' ),
						this2.keysDown[ 13 ] = true
					)
					: (
						console.log( 'Key found : client is writing' ),
						( backspacePushed )
							? (
								backspacePushed = false,
								this2.clientCharacter.speechBubble.updateTextContent( 'backspace' )
							)
							: this2.clientCharacter.speechBubble.updateTextContent( String.fromCharCode( event.charCode ) )
					)
			}
		})
		.keyup( function ( event ) {
	    	delete this2.keysDown[ event.which ]
		})

		return this
	},
	updateServer : function ( modifier ) {
		if ( this.instance != null ) {
			if ( !this.clientCharacter.writing ) {
				var realSpeed = this.clientCharacter.speed * modifier,
					x = 'x',
					y = 'y'

				if ( 13 in this.keysDown ) {	// Pressing "Enter"
					delete this.keysDown[ 13 ]
					console.log( 'Notyfying to server : client started writing' )
					this.clientCharacter.writing = true
					this.socket.emit( 'character_startingToWrite' )
				}
				if ( 90 in this.keysDown ) { 	// Pressing Z
					this.socket.emit( 'character_moving', { property: y, value: this.clientCharacter.y - realSpeed } )
				}
				if ( 83 in this.keysDown ) { 	// Pressing S
					this.socket.emit( 'character_moving', { property: y, value: this.clientCharacter.y + realSpeed } )
				}
				if ( 81 in this.keysDown ) { 	// Pressing Q
					this.socket.emit( 'character_moving', { property: x, value: this.clientCharacter.x - realSpeed } )
				}
				if ( 68 in this.keysDown ) { 	// Pressing D
					this.socket.emit( 'character_moving', { property: x, value: this.clientCharacter.x + realSpeed } )
				}
			}
			else if ( this.clientCharacter.writing ) {
				if ( 13 in this.keysDown ) {	// Pressing "Enter"
					delete this.keysDown[ 13 ]
					console.log( 'Notyfying to server : client stopped writing' )
					this.clientCharacter.writing = false
					this.socket.emit( 'character_stoppingToWrite', this.clientCharacter.speechBubble.getMessage() )
				}
			}
		}

		return this
	},
	render : function () {
		this.canvas.drawLayers()
		return this
	},
	start : function () {
		var this2 = this
		var w = window
		requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame	// Cross-browser support for requestAnimationFrame
		var then = Date.now()

		main()
		
		function main () {	// The main game loop
			var now = Date.now(),
				delta = now - then

			this2.updateServer( delta / 1000 )
				 .render()

			then = now

			requestAnimationFrame( main )	// Request to do this again ASAP
		}
	}
}