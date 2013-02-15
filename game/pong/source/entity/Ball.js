lychee.define('game.entity.Ball').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(image) {

		var settings = {
			radius:    11,
			collision: lychee.game.Entity.COLLISION.A,
			shape:     lychee.game.Entity.SHAPE.circle
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
