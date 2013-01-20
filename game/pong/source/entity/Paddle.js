lychee.define('game.entity.Paddle').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(image) {

		var settings = {
			width:     24,
			height:    104,
			collision: lychee.game.Entity.COLLISION.A,
			shape:     lychee.game.Entity.SHAPE.rectangle
		};


		this.__image = image || null;


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		getImage: function() {
			return this.__image;
		}

	};


	return Class;

});
