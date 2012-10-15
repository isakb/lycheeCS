
lychee.define('game.Renderer').requires([
	'lychee.ui.Text',
	'lychee.ui.Tile',
	'game.entity.Jewel'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(id) {

		lychee.Renderer.call(this, id);

		this.settings = lychee.extend({}, this.defaults);

		this.__map = {};

	};

	Class.prototype = {

		defaults: {
			sprite: null,
			map: null,
			tile: 0
		},

		reset: function(width, height, resetCache, settings) {

			lychee.Renderer.prototype.reset.call(this, width, height, resetCache);

			if (Object.prototype.toString.call(settings) === '[object Object]') {
				this.settings = lychee.extend({}, this.settings, settings);
			}


			this.__map.w = this.settings.tile;
			this.__map.h = this.settings.tile;


		},

		renderEntity: function(entity, offsetX, offsetY) {

			if (entity instanceof lychee.ui.Text) {
				this.renderText(entity, offsetX, offsetY);
			}

		},

		renderJewel: function(entity) {

			var map = this.settings.map['jewel-' + entity.getColor()];
			var tile = this.settings.tile;
			var sprite = this.settings.sprite;
			var pos = entity.getPosition();

			this.__map.x = map.x * tile;
			this.__map.y = map.y * tile;


			this.drawSprite(
				pos.x - tile / 2,
				pos.y - tile / 2,
				sprite,
				this.__map
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

