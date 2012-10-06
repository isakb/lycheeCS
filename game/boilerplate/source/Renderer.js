
lychee.define('game.Renderer').requires([
	'game.entity.Text',
	'game.entity.Sprite'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(id) {

		lychee.Renderer.call(this, id);

	};

	Class.prototype = {

		reset: function(width, height, resetCache, settings) {

			lychee.Renderer.prototype.reset.call(this, width, height, resetCache);

			if (Object.prototype.toString.call(settings) === '[object Object]') {
				this.settings = lychee.extend({}, settings);
			}

		},

		renderSprite: function(entity) {

			var settings = this.settings.map.sprite;
			var sprite = settings.image;


			var state = settings.states[entity.getState()];
			var frame = entity.getFrame();
			var pos = entity.getPosition();


			this.drawSprite(
				pos.x,
				pos.y,
				sprite,
				state.map[frame]
			);

		},

		renderText: function(entity) {

			var pos = entity.getPosition();
			this.drawText(
				pos.x,
				pos.y,
				entity.text,
				entity.font
			);

		}

	};


	return Class;

});

