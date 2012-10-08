
lychee.define('lychee.ui.Graph').includes([
	'lychee.game.Graph'
]).exports(function(lychee) {

	var Class = function() {

		this.__offset = { x: 0, y: 0, z: 0 };

		lychee.game.Graph.call(this);

	};


	Class.prototype = {



		/*
		 * PUBLIC API
		 */

		relayout: function() {
			this.__dirty = true;
		},

		update: function(clock, delta) {

			if (this.__dirty === true) {
				this.__relayoutNode(this.__tree, null);
				this.__dirty = false;
			}

			this.__updateNode(this.__tree, clock, delta);

		},

		// TODO: Not implemented yet
		scrollTo: function(node) {

			if (node && node.entity != null) {

			}

		},

		getOffset: function() {
			return this.__offset;
		},

		setOffset: function(offset) {

			if (Object.prototype.toString.call(offset) !== '[object Object]') {
				return false;
			}

			this.__offset.x = typeof offset.x === 'number' ? offset.x : this.__offset.x;
			this.__offset.y = typeof offset.y === 'number' ? offset.y : this.__offset.y;
			this.__offset.z = typeof offset.z === 'number' ? offset.z : this.__offset.z;

			return true;

		},


		/*
		 * PRIVATE API
		 */

		__relayoutNode: function(node, parent) {

			if (
				parent !== null
				&& parent.entity !== null
				&& node.entity !== null
				&& typeof node.entity.relayout === 'function'
			) {
				node.entity.relayout(parent.entity);
			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				this.__relayoutNode(node.children[c], node);
			}

		}

	};


	return Class;

});

