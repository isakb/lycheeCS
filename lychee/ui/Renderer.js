
lychee.define('lychee.ui.Renderer').requires([
	'lychee.ui.Button',
	'lychee.ui.Text',
	'lychee.ui.Tile'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(id) {

		lychee.Renderer.call(this, id);

	};


	Class.prototype = {

		renderUIEntity: function(entity, offsetX, offsetY) {

			if (entity instanceof lychee.ui.Button) {
				this.renderUIButton(entity, offsetX, offsetY);
			} else if (entity instanceof lychee.ui.Sprite) {
				this.renderUISprite(entity, offsetX, offsetY);
			} else if (entity instanceof lychee.ui.Text) {
				this.renderUIText(entity, offsetX, offsetY);
			} else if (entity instanceof lychee.ui.Tile) {
				this.renderUITile(entity, offsetX, offsetY);
			}

		},

		renderUIButton: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var pos = entity.getPosition();


			var background = entity.getBackground();
			if (background !== null) {

				this.renderUISprite(
					background,
					pos.x + offsetX,
					pos.y + offsetY
				);

			}


			var label = entity.getLabel();
			if (label !== null) {

				this.renderUIText(
					label,
					pos.x + offsetX,
					pos.y + offsetY
				);

			}

		},

		renderUISprite: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var map = entity.getMap();
			var pos = entity.getPosition();
			var image = entity.getImage();


			this.drawSprite(
				pos.x + offsetX - entity.width / 2,
				pos.y + offsetY - entity.height / 2,
				image,
				map
			);

		},

		renderUIText: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var pos = entity.getPosition();

			this.drawText(
				pos.x + offsetX - entity.width / 2,
				pos.y + offsetY - entity.height / 2,
				entity.text,
				entity.font
			);

		},

		renderUITile: function(entity, offsetX, offsetY) {

			if (entity.color === null) return;

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var pos = entity.getPosition();

			this.drawBox(
				pos.x + offsetX - entity.width / 2,
				pos.y + offsetY - entity.height / 2,
				pos.x + offsetX + entity.width / 2,
				pos.y + offsetY + entity.height / 2,
				entity.color,
				true
			);

		}

	};


	return Class;

});

