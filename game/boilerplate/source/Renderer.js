
lychee.define('game.Renderer').requires([
	'lychee.ui.Text',
	'lychee.ui.Tile',
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

		renderEntity: function(entity, offsetX, offsetY) {

			if (entity instanceof lychee.ui.Text) {
				this.renderText(entity, offsetX, offsetY);
			} else if (entity instanceof lychee.ui.Tile) {
				// Do nothing, Tiles are only used for structure here.
				// this.renderTile(entity, offsetX, offsetY);
			} else if (entity instanceof game.entity.Sprite) {
				this.renderSprite(entity, offsetX, offsetY);
			}

		},

		renderSprite: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var settings = this.settings.map.sprite;
			var sprite = settings.image;


			var state = settings.states[entity.getState()];
			var frame = entity.getFrame();
			var pos = entity.getPosition();


			this.drawSprite(
				pos.x + offsetX - entity.width / 2,
				pos.y + offsetY - entity.height / 2,
				sprite,
				state.map[frame]
			);

		},

		renderText: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;

			var pos = entity.getPosition();
			this.drawText(
				pos.x + offsetX - entity.width / 2,
				pos.y + offsetY - entity.height / 2,
				entity.text,
				entity.font
			);

		}

	};


	return Class;

});

