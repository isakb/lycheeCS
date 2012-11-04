
lychee.define('game.scene.GameBlast').requires([
	'game.entity.Deco',
	'game.entity.Jewel'
]).includes([
	'lychee.game.Graph'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.game = game;

		this.__loop = game.loop;
		this.__renderer = game.renderer;

		this.__config   = game.config.jewel;
		this.__position = { x: 0, y: 0 };
		this.__offset   = { x: 0, y: 0 };
		this.__size     = { x: 5, y: 5 };

		this.__cache   = {};
		this.__grid    = [];
		this.__layers  = {
			background: [],
			foreground: []
		};
		this.__locked  = false;
		this.__minHits = 1;
		this.__tween   = 300;
		this.__width   = 0;
		this.__height  = 0;
		this.__tile    = 0;

		lychee.game.Graph.call(this);


		this.reset(settings);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function(data) {

			lychee.game.Graph.prototype.reset.call(this);

			this.__width   = data.width;
			this.__height  = data.height;
			this.__tile    = data.tile;
			this.__minHits = data.hits;


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


			this.__layers.background = [];
			this.__layers.foreground = [];


			var tile   = this.__tile;
			var image  = this.game.config.deco.image;
			var states = this.game.config.deco.states;
			var map    = this.game.config.deco.map;


			var state = 'default';

			for (var x = 0; x < this.__size.x; x++) {

				for (var y = 0; y < this.__size.y; y++) {

					if (x % 2 === 0) {
						state = 'sand-c';
					} else {
						state = 'sand-d';
					}

					if (x % 2 === 0 && y % 2 === 0) {
						state = 'sand-a';
					} else if (y % 2 === 0) {
						state = 'sand-b';
					}


					var entity = new game.entity.Deco({
						position: {
							x: x * tile,
							y: y * tile
						},
						image: image,
						states: states,
						state: state,
						map: map
					});


					this.__layers.background.push(entity);

				}

			}

		},

		enter: function(data) {

			// Unlink map data
			data = JSON.parse(JSON.stringify(data));




			for (var e = 0, l = data.entities.length; e < l; e++) {
				this.__addEntity(data.entities[e]);
			}

		},

		leave: function() {

		},

		render: function(clock, delta) {

			if (this.__renderer !== null) {

				for (var b = 0, bl = this.__layers.background.length; b < bl; b++) {
					this.__renderer.renderDeco(this.__layers.background[b]);
				}


				this.__renderNode(
					this.__tree,
					this.__offset.x,
					this.__offset.y
				);


				for (var f = 0, fl = this.__layers.foreground.length; f < fl; f++) {
					this.__renderer.renderDeco(this.__layers.foreground[f]);
				}

			}

		},

		touch: function(x, y) {

			x /= this.__tile;
			y /= this.__tile;

			x |= 0;
			y |= 0;


			return null;

		},



		/*
		 * PRIVATE API
		 */

		__addEntity: function(raw) {

			raw.layer = typeof raw.layer === 'string' ? raw.layer : 'background';

			var tile = this.__tile;

			var entity = null;

			if (typeof game.entity[raw.type] !== undefined) {

				if (raw.type === 'Deco') {
					raw.data.image = this.game.config.deco.image;
					raw.data.states = this.game.config.deco.states;
					raw.data.map = this.game.config.deco.map;
				}


				raw.data.position.x = raw.data.position.x * this.__tile;
				raw.data.position.y = raw.data.position.y * this.__tile;


				entity = new game.entity[raw.type](raw.data);

			}


			if (entity !== null) {

				if (raw.layer === 'background') {
					this.__layers.background.push(entity);
				} else if (raw.layer === 'foreground') {
					this.__layers.foreground.push(entity);
				}

			}

		},

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

