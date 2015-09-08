if( !( typeof exports === 'undefined' ) ) {
	var SpeechBubble = require( './speechBubble' )
}

// -------------- Character constructor -------------- //
function Character ( data ) {
	if ( typeof data === 'string' ) {
		data = { id: data }
		this.initialize( data )
	}
	else if ( data.id != undefined ) {
		this.initialize( data )
	}
	else {
		console.error( 'Specifying an id to the "Character" constructor is neccessary.' )
	}
}

// -------------- Character methods -------------- //
Character.prototype = {
	initialize : function ( data ) {
		this.id	   		  = data.id
		this.speed 		  = data.speed 	   	 || 256											// Movement in pixels per second
		this.color 		  = data.color 	   	 || this.getRandomColor()
		this.strokeWidth  = data.strokeWidth || 2
		this.radius		  = data.radius 	 || 15
		this.x 			  = data.x 		   	 || Math.random() * ( 1707 - this.radius / 2 )	// Random x across the map
		this.y 			  = data.y 		   	 || Math.random() * ( 843  - this.radius / 2 )	// Random y across the map
		this.writing	  = false

		var this2 = this
		setTimeout(function() {		// setTimeOut is to avoid maximum call stack size
			this2.speechBubble = new SpeechBubble( { id: this2.id, x: this2.x, y: this2.y } )
		}, 10)

		return this
	},
	draw : function () {
		game.canvas.drawArc({	// Drawing the circle 
			layer       : true,
			groups      : [ this.getCharacter() ],
			strokeStyle : this.color,
			strokeWidth : this.strokeWidth,
			name        : this.id + '_circle',
			radius      : this.radius,
			x			: this.x,
			y			: this.y
		})

		var canvas_circleLayer = game.canvas.getLayer( this.id + '_circle' )
		game.canvas.drawVector({		// Drawing the angle
			layer       : true,
			groups      : canvas_circleLayer.groups,
			strokeStyle : canvas_circleLayer.strokeStyle,
			strokeWidth : canvas_circleLayer.strokeWidth,
			name        : this.id + '_angle',
			x           : this.x - 12,
			y           : this.y - 7,
			a1          : 140,
			l1          : 26,
			a2          : 0,
			l2          : 26
		})

		return this
	},
	updateCoordinates : function () {
		game.canvas.setLayer( this.id + '_circle', { x: this.x, 	 y: this.y     } )
		game.canvas.setLayer( this.id +  '_angle', { x: this.x - 12, y: this.y - 7 } )
		if ( this.speechBubble.displayed ) {
			this.speechBubble.updateCoordinates( { x: this.x, y: this.y } )
		}

		return this
	},
	getRandomColor : function () {
		var colors = [
			'#FF0000', 
			'#FF00A9', 
			'#5E00FF',
			'#00D3FF', 
			'#00711F', 
			'#3CFF00', 
			'#FFA900',
			'#FF3A00'
		]

		return colors[ Math.floor( Math.random() * colors.length ) ]
	},
	getCharacter : function () {
		return this.id.toString()
	},
	deleteCharacter : function () {
		game.canvas.removeLayerGroup( this.getCharacter() )
		return this
	}
}

if( !( typeof exports === 'undefined' ) ) {
	module.exports = Character
}