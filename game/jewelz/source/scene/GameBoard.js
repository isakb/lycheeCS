
lychee.define('game.scene.GameBoard').requires([
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
		this.__hint    = null;
		this.__layers = {
			background: []
		};
		this.__locked  = false;
		this.__minHits = 1;
		this.__tween   = 300;
		this.__width   = 0;
		this.__height  = 0;
		this.__tile    = 0;
		this.__visible = false; // hint

		lychee.game.Graph.call(this);


		this.reset(settings);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function(data) {

			lychee.game.Graph.prototype.reset.call(this);

			this.setHint(false);

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


			var tile   = this.__tile;
			var image  = this.game.config.deco.image;
			var states = this.game.config.deco.states;
			var map    = this.game.config.deco.map;


			var state = 'default';

			for (var x = 0; x < this.__size.x; x++) {

				for (var y = 0; y < this.__size.y; y++) {

					if (x % 2 === 0) {
						state = 'mud-c';
					} else {
						state = 'mud-d';
					}

					if (x % 2 === 0 && y % 2 === 0) {
						state = 'mud-a';
					} else if (y % 2 === 0) {
						state = 'mud-b';
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
						entity.clearEffect();
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
					entity.clearTween();
					entity.setTween(y * tween, {
						y: y * tile + tile / 2
					}, lychee.game.Entity.TWEEN.bounceEaseOut);

				}
			}

			this.__hint = null;

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

				if (hitmap.length >= this.__minHits) {
					return hitmap;
				}

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
					var x = ((jewelz[j].getPosition().x / this.__tile) - 0.5) | 0;
					var y = ((jewelz[j].getPosition().y / this.__tile) - 0.5) | 0;

					jewelz[j].setState('destroy');
					jewelz[j].setPosition(this.__cache);

					this.__grid[x][y] = null;
					entities.push(jewelz[j]);

				}


				// This unlocks the Game Scene again
				this.__refreshGrid(entities);
				this.__refreshHint();

				entities = null;
				jewelz   = null;

			}

		},

		setHint: function(visible) {

			visible = visible === true ? true : false;

			this.__visible = visible;


			if (this.__hint === null) return;

			if (this.__visible === true) {

				for (var h = 0, l = this.__hint.length; h < l; h++) {

					this.__hint[h].setEffect(200, lychee.game.Entity.EFFECT.wobble, {
						x: 3,
						y: 1
					}, undefined, true);

				}

			} else {

				for (var h = 0, l = this.__hint.length; h < l; h++) {
					this.__hint[h].clearEffect();
				}

				this.__hint = null;

			}

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

			if (Object.prototype.toString.call(entities) !== '[object Array]') {
				return;
			}


			var tile  = this.__tile;
			var tween = this.__tween;

			for (var y = (this.__size.y - 1); y >= 0; y--) {

				var refresh = false;

				for (var x = 0; x < this.__size.x; x++) {

					if (this.__grid[x][y] === null) {

						var replacement = this.__getEntityByGrid(x, y - 1);
						if (replacement !== null) {

							replacement.clearTween();
							replacement.setTween(tween, {
								y: y * tile + tile / 2
							}, lychee.game.Entity.TWEEN.bounceEaseOut);


	 						this.__grid[x][y] = this.__grid[x][y - 1];
							this.__grid[x][y - 1] = null;

						} else if (y === 0 && entities.length > 0) {

							// PS: Fuck you, guy who designed the splice API.
							replacement = entities.splice(0, 1)[0];
							replacement.setState(replacement.getRandomState());

							this.__cache.x = x * tile + tile / 2;
							this.__cache.y = -1 * tile;

							replacement.setPosition(this.__cache);
							replacement.clearTween();
							replacement.setTween(tween, {
								y: y * tile + tile / 2
							}, lychee.game.Entity.TWEEN.bounceEaseOut);


							this.__grid[x][y] = replacement;

						}

					}

				}

			}


			if (entities.length > 0) {
				this.__refreshGrid(entities);
			} else {
				this.__loop.timeout(tween, function() {
					this.__locked = false;
				}, this);
			}

		},

		__refreshHint: function() {

			if (this.__hint !== null) return;


			for (var x = 0; x < this.__size.x; x++) {

				for (var y = 0; y < this.__size.y; y++) {

					var entity = this.__getEntityByGrid(x, y);
					if (entity !== null) {

						var hitmap = this.__hitJewelz(
							x,
							y,
							entity.getState()
						);


						if (hitmap.length >= this.__minHits) {
							this.__hint = hitmap;
							return;
						}

					}

				}

			}



			if (this.__hint === null) {

				var startX = (Math.random() * (this.__size.x - this.__minHits - 1)) | 0;
				var y      = (Math.random() * (this.__size.y - 1)) | 0;
				var state = this.__getEntityByGrid(startX, y).getState();


				for (var x = startX; x < startX + this.__minHits; x++) {
					this.__getEntityByGrid(x, y).setState(state);
				}

				this.__refreshHint();

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

