// SpeechBubble constructor -->
function SpeechBubble ( character ) {
	this.initialize( character )
}

// SpeechBubble methods -->
SpeechBubble.prototype = {
	initialize : function ( data ) {
		this.id			 = data.id
		this.x 			 = data.x + 35
		this.y			 = data.y + 20
		this.displayed   = false
		this.textContent = ''

		return this
	},
	draw : function () {
		game.canvas.drawText({
			layer		: true,
			groups		: [ this.id ],
			strokeWidth	: 2,
			name		: this.getSpeechBubble(),
			x			: this.x,
			y			: this.y,
			fillStyle	: '#000',
			fontSize	: '12px',
			fontFamily	: 'Verdana, sans-serif',
			text 		: this.textContent
		})
		this.displayed = true

		return this
	},
	undraw : function () {
		game.canvas.removeLayer( this.getSpeechBubble() )
		this.displayed = false

		return this
	},
	updateCoordinates : function ( coordinates ) {
		this.x = coordinates.x + 35
		this.y = coordinates.y - 20
		game.canvas.setLayer( this.getSpeechBubble(), { x: this.x, y: this.y } )

		return this
	},
	updateTextContent : function ( keyOrMessage ) {
		if ( keyOrMessage === 'backspace' ) {
			this.textContent = this.textContent.slice( 0, -1 )
		}
		else if ( typeof keyOrMessage === 'string' ) {
			this.textContent = ( keyOrMessage.length === 1 )
				? this.textContent + keyOrMessage
				: keyOrMessage
		}
		else {
			console.error( 'Incorrect paramater given to the "updateTextContent" method.' )
		}

		return this
	},
	start : function () {
		this.textContent = this.textContent.trim()
		if ( this.textContent !== '' ) {
			this.undraw().draw()
			console.log( 'Message drawn : ' + this.textContent )

			var TTL = (this.textContent.length * 250 > 2000)
				? this.textContent.length * 250
				: 2000

			var this2 = this
			setTimeout(function() {
				this2.undraw()
			}, TTL)

			this.textContent = ''
		}

		return this
	},
	getMessage : function () {
		return this.textContent
	},
	getSpeechBubble : function () {
		return this.id + '_speechBubbleText'
	}
}

if( !( typeof exports === 'undefined' ) ) {
	module.exports = SpeechBubble
}