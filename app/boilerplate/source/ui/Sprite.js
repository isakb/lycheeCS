
lychee.define('game.ui.Sprite').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		settings.states = {
			first: 0,
			second: 1,
			third: 2
		};

		lychee.ui.Entity.call(this, settings);

	};


	Class.prototype = {

	};


	return Class;

});

