
lychee.define('lychee.ui.Tile').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		settings.color = typeof settings.color === 'string' ? settings.color : null;

		this.color = settings.color;

		delete settings.color;


		settings.shape = lychee.game.Entity.SHAPE.rectangle;

		lychee.ui.Entity.call(this, settings);


	};


	Class.prototype = {

	};


	return Class;

});

