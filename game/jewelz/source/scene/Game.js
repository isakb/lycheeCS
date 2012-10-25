
lychee.define('game.scene.Game').requires([
	'game.entity.Jewel'
]).includes([
	'lychee.game.Graph'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.__loop = game.loop;
		this.__renderer = game.renderer;

		this.__config   = game.config.jewel;
		this.__position = { x: 0, y: 0 };
		this.__offset   = { x: 0, y: 0 };
		this.__size     = { x: 5, y: 5 };

		this.__cache  = {};
		this.__grid   = [];
		this.__locked = false;
		this.__tween  = 300;
		this.__width  = 0;
		this.__height = 0;
		this.__tile   = 0;

		lychee.game.Graph.call(this);


		this.reset(settings);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function(data) {

			lychee.game.Graph.prototype.reset.call(this);

			this.__width  = data.width;
			this.__height = data.height;
			this.__tile   = data.tile;

			this.__size.x = (this.__width / this.__tile) | 0;
			this.__size.y = (this.__height / this.__tile) | 0;

			this.__position.x = data.position.x;
			this.__position.y = data.position.y;


			for (var x = 0; x < this.__size.x; x++) {

				if (this.__grid[x] === undefined) this.__grid[x] = [];

				for (var y = 0; y < this.__size.y; y++) {
					if (this.__grid[x][y] === undefined) this.__grid[x][y] = null;
				}
			}


		},

		enter: function() {

			var tile  = this.__tile;
			var tween = this.__tween;


			for (var x = 0; x < this.__size.x; x++) {

				for (var y = 0; y < this.__size.y; y++) {

					this.__cache.x = (x * tile + tile / 2) | 0;
					this.__cache.y = -1 * tile;


					var entity = null;


					if (this.__grid[x][y] !== null) {

						entity = this.__grid[x][y];
						entity.setPosition(this.__cache);
						entity.sync(null, true);

					} else {

						entity = new game.entity.Jewel({
							image:  this.__config.image,
							states: this.__config.states,
							map:    this.__config.map,
							width:  tile,
							height: tile
						});

						entity.setPosition(this.__cache);

						this.__grid[x][y] = entity;
						this.add(entity);

					}


					entity.setState(entity.getRandomState());
					entity.setTween(y * tween, {
						y: y * tile + tile / 2
					}, lychee.game.Entity.TWEEN.bounceEaseOut);

				}
			}

		},

		leave: function() {

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

		touch: function(x, y) {

			x /= this.__tile;
			y /= this.__tile;

			x |= 0;
			y |= 0;


			if (
				this.__locked === false
				&& this.__grid[x] !== undefined
				&& this.__grid[x][y] != null
			) {

				var entity = this.__getEntityByGrid(x, y);
				if (entity === null || entity.getState() === 'destroy') return;

				var hitmap = this.__hitJewelz(
					x,
					y,
					entity.getState()
				);


				return hitmap;

			}


			return null;

		},

		destroyJewelz: function(jewelz) {

			if (Object.prototype.toString.call(jewelz) === '[object Array]') {

				this.__locked = true;

				this.__cache.y = -1 * this.__tile;

				var entities = [];

				for (var j = 0, l = jewelz.length; j < l; j++) {

					this.__cache.x = jewelz[j].getPosition().x;

					// Entities are positioned via center of gravity
					var x = (jewelz[j].getPosition().x / this.__tile) - 0.5;
					var y = (jewelz[j].getPosition().y / this.__tile) - 0.5;

					jewelz[j].setState('destroy');
					jewelz[j].setPosition(this.__cache);

					this.__grid[x][y] = null;
					entities.push(jewelz[j]);

				}


				this.__loop.timeout(0, function() {

					// This unlocks the Game Scene again
					this.__refreshGrid(entities);

					entities = null;
					jewelz   = null;

				}, this);

			}

		},

		setHint: function(active) {

lychee.debug === true && console.log('setting hint', active);

		},



		/*
		 * PRIVATE API
		 */

		__renderNode: function(node, offsetX, offsetY) {

			if (node.entity !== null) {

				this.__renderer.renderJewel(node.entity);

				offsetX += node.entity.getPosition().x;
				offsetY += node.entity.getPosition().y;

			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				this.__renderNode(node.children[c], offsetX, offsetY);
			}

		},

		__refreshGrid: function(entities) {


lychee.debug === true && console.log('refreshing grid', entities);

			this.__locked = false;

		},

		__getEntityByGrid: function(x, y) {

			if (
				this.__grid[x] !== undefined
				&& this.__grid[x][y] != null
			) {
				return this.__grid[x][y];
			}


			return null;

		},

		__hitJewelz: function(x, y, state, hitmap) {

			var returnHitmap = false;
			if (hitmap === undefined) {
				hitmap = [];
				returnHitmap = true;
			}


			var jewel = this.__getEntityByGrid(x, y);
			if (jewel !== null && jewel.getState() === state) {

				// Skip double entries in hitmap
				var found = false;
				for (var h = 0, l = hitmap.length; h < l; h++) {
					if (hitmap[h] === jewel) {
						found = true;
					}
				}


				if (found === true) {
					if (returnHitmap === true) {
						return hitmap;
					} else {
						return;
					}
				}


				hitmap.push(jewel);


				if (x - 1 >= 0 && x - 1 < this.__size.x) {
					this.__hitJewelz(x - 1, y, state, hitmap);
				}

				if (x + 1 >= 0 && x + 1 < this.__size.x) {
					this.__hitJewelz(x + 1, y, state, hitmap);
				}

				if (y - 1 >= 0 && y - 1 < this.__size.y) {
					this.__hitJewelz(x, y - 1, state, hitmap);
				}

				if (y + 1 >= 0 && y + 1 < this.__size.y) {
					this.__hitJewelz(x, y + 1, state, hitmap);
				}

			}

			if (returnHitmap === true) {
				return hitmap;
			}

		}

	};


	return Class;

});

