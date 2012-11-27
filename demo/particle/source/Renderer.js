
lychee.define('game.Renderer').includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(id) {

		lychee.Renderer.call(this, id);

	};

	Class.prototype = {

		renderParticle: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var pos = entity.getPosition();

			var posX = (pos.x + offsetX) | 0;
			var posY = (pos.y + offsetY) | 0;

			this.drawCircle(
				posX,
				posY,
				10,
				'#fff',
				true
			);

		}

	};


	return Class;

});

