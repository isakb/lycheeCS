
lychee.define('game.entity.Sprite').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		settings.states = {
			first:  0,
			second: 1,
			third:  2,
			fourth: 3,
			fifth:  4
		};

		lychee.game.Entity.call(this, settings);

	};


	Class.prototype = {

	};


	return Class;

});

