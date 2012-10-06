
lychee.define('game.entity.Text').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(text, font, data) {

		var settings = data;

		this.text = text;
		this.font = font;

		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		setText: function(text) {
			this.text = text;
		},

		setPosition: function(position) {

			if (Object.prototype.toString.call(position) !== '[object Object]') {
				return false;
			}


			this.__position.x = position.x || this.__position.x;
			this.__position.y = position.y || this.__position.y;
			this.__position.z = position.z || this.__position.z;

			return true;

		}

	};


	return Class;

});

