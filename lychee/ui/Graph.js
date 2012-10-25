
lychee.define('lychee.ui.Graph').includes([
	'lychee.game.Graph'
]).exports(function(lychee, global) {

	var Class = function(renderer) {

		this.__renderer = renderer !== undefined ? renderer : null;

		this.__clock = null;
		this.__offset = { x: 0, y: 0, z: 0 };
		this.__tween = null;

		this.__cache = {
			tween: {}
		};

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

			this.__clock = clock;


			if (this.__tween !== null && (clock <= this.__tween.start + this.__tween.duration)) {

				var cache = this.__cache.tween;
				var t = (clock - this.__tween.start) / this.__tween.duration;

				cache.x = this.__tween.from.x + t * (this.__tween.to.x - this.__tween.from.x);
				cache.y = this.__tween.from.y + t * (this.__tween.to.y - this.__tween.from.y);

				this.setOffset(cache);

			} else if (this.__tween !== null) {

				// We didn't have enough time for the tween
				this.setOffset(this.__tween.to);

				if (this.__tween.callback !== null) {
					this.__tween.callback.call(this.__tween.scope);
				}

				this.__tween = null;

			}


			if (this.__dirty === true) {

				this.__relayoutNode(this.__tree, null);
				this.__dirty = false;

			}

			this.__updateNode(this.__tree, clock, delta);

		},

		render: function(clock, delta) {

			if (this.__renderer !== null) {

				this.__renderNode(
					this.__tree,
					this.__offset.x,
					this.__offset.y
				);

			}

		},

		getEntityByPosition: function(x, y, z, convert) {

			convert = convert === true ? true : false;

			if (convert === true) {

				if (x !== null) {
					x -= this.__offset.x;
				}

				if (y !== null) {
					y -= this.__offset.y;
				}

				if (z !== null) {
					z -= this.__offset.z;
				}

			}


			return lychee.game.Graph.prototype.getEntityByPosition.call(this, x, y, z);

		},

		setTween: function(duration, position, callback, scope) {

			duration = typeof duration === 'number' ? duration : 0;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			var tween = null;

			if (Object.prototype.toString.call(position) === '[object Object]') {

				position.x = typeof position.x === 'number' ? position.x : this.__offset.x;
				position.y = typeof position.y === 'number' ? position.y : this.__offset.y;

				tween = {
					start: this.__clock,
					duration: duration,
					from: {
						x: this.__offset.x,
						y: this.__offset.y
					},
					to: position,
					callback: callback,
					scope: scope
				};

			}


			this.__tween = tween;

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

		},

		__renderNode: function(node, offsetX, offsetY) {

			if (node.entity !== null) {

				this.__renderer.renderUIEntity(node.entity, offsetX, offsetY);

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

