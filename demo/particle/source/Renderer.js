
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

console.log(pos.x, pos.y);

			this.drawCircle(
				pos.x + offsetX,
				pos.y + offsetY,
				10,
				'#fff',
				true
			);

		}

	};


	return Class;

});

