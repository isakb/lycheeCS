
lychee.define('game.Scene').includes([
	'lychee.ui.Graph'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.ui.Graph.call(this, game.renderer);

	};

	Class.prototype = {

		/*
		 * PUBLIC API
		 */

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

