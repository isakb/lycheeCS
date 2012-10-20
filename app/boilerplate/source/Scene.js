
lychee.define('game.Scene').includes([
	'lychee.ui.Graph'
]).exports(function(lychee, global) {

	var Class = function(game) {

		this.__dragOffset = { x: 0, y: 0};

		lychee.ui.Graph.call(this, game.renderer);

	};

	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		render: function(clock, delta) {

			if (this.__renderer !== null) {

				this.__renderer.clear();

				this.__renderNode(
					this.__tree,
					this.__offset.x + this.__dragOffset.x,
					this.__offset.y + this.__dragOffset.y
				);

				this.__renderer.flush();

			}

		},

		getDragOffset: function() {
			return this.__dragOffset;
		},

		setDragOffset: function(x, y) {

			this.__dragOffset.x = typeof x === 'number' ? x : this.__dragOffset.x;
			this.__dragOffset.y = typeof y === 'number' ? y : this.__dragOffset.y;

		},

		scrollTo: function(node, callback, scope) {

			if (node && node.entity !== null) {

				var entity = node.entity;
				var position = entity.getPosition();
				var offset = this.getOffset();

				this.setTween(300, {
					x: -1 * (position.x - entity.width / 2),
					y: -1 * (position.y - entity.height / 2)
				}, callback, scope);

			}

		}

	};


	return Class;

});

