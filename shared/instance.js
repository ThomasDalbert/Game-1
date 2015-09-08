if( !( typeof exports === 'undefined' ) ) {
	var Character = require( './character' )
}

// -------------- Instance constructor -------------- //
function Instance ( data ) {
	this.characterList = {}
	if ( data != undefined ) {
		this.initialize( data )
	}
}

// -------------- Instance methods -------------- //
Instance.prototype = {
	initialize : function ( data ) {
		var characterList = data.characterList
		for ( id in characterList ) {
			this.characterList[ id ] = new Character( characterList[ id ] )
			this.characterList[ id ].draw()
		}
		return this
	},
	addCharacter : function ( character ) {
		if ( this.isCharacterType( character ) ) {
			this.characterList[ character.id ] = character
		}
		return this
	},
	removeCharacter : function ( character_id ) {
		delete this.characterList[ character_id ]
		return this
	},
	isCharacterType : function ( object ) {
		if ( object instanceof Character ) {
			return true
		}
		else {
			console.error( '"character" parameter should be of "Character" type.' )
		}
		return false
	}
}

if( !( typeof exports === 'undefined' ) ) {
	module.exports = Instance
}