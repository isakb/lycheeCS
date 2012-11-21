
lychee.define('game.Graph').includes([
	'lychee.game.Graph'
]).exports(function(lychee, global) {

	var Class = function(game) {

		this.__renderer = game.renderer || null;
		this.__offset = { x: 0, y: 0 };

		lychee.game.Graph.call(this);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		render: function(clock, delta) {

			if (this.__renderer !== null) {

				this.__renderNode(
					this.__tree,
					this.__offset.x,
					this.__offset.y
				);

			}

		},

		setOffset: function(offset) {

			if (Object.prototype.toString.call(offset) === '[object Object]') {

				this.__offset.x = typeof offset.x === 'number' ? offset.x : this.__offset.x;
				this.__offset.y = typeof offset.y === 'number' ? offset.y : this.__offset.y;

				return true;

			}


			return false;

		},


		/*
		 * PRIVATE API
		 */

		__renderNode: function(node, offsetX, offsetY) {

			if (node.entity !== null) {

				this.__renderer.renderParticle(node.entity, offsetX, offsetY);

				offsetX += node.entity.getPosition().x;
				offsetY += node.entity.getPosition().y;

			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				this.__renderNode(node.children[c], offsetX, offsetY);
			}

		}

	};


	return Class;

});

