
lychee.define('game.scene.UI').requires([
	'game.Score'
]).includes([
	'lychee.ui.Graph'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.game = game;

		this.__background = [];
		this.__loop = game.loop;
		this.__root = null;

		// Score is public for state.Game access
		this.score = null;

		lychee.ui.Graph.call(this, game.renderer);


		this.reset(settings);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function(data) {

			if (this.__root === null) {

				this.score = new game.Score();


				this.__entities = {};

				this.__root = this.add(new lychee.ui.Tile({
					color: null,
					width: data.width,
					height: data.height,
					position: {
						x: data.position.x,
						y: data.position.y
					}
				}));

				this.add(new lychee.ui.Text({
					text: 'Score:',
					font: this.game.fonts.normal,
					position: {
						x: 0,
						y: -84
					}
				}), this.__root);

				this.__entities.points = this.add(new lychee.ui.Text({
					text: '0',
					font: this.game.fonts.normal,
					position: {
						x: 0, y: -42
					}
				}), this.__root).entity;

				this.add(new lychee.ui.Text({
					text: 'Time:',
					font: this.game.fonts.normal,
					position: {
						x: 0,
						y: 42
					}
				}), this.__root);

				this.__entities.time = this.add(new lychee.ui.Text({
					text: '0',
					font: this.game.fonts.normal,
					position: {
						x: 0, y: 84
					}
				}), this.__root).entity;

			} else {

				this.__root.width  = data.width;
				this.__root.height = data.height;
				this.__root.setPosition(data.position);

			}


			this.__background = [];


			var sizeX = Math.round(data.width / data.tile);
			var sizeY = Math.round(data.height / data.tile);

			var state = 'default';

			for (var x = 0; x <= sizeX; x++) {
				for (var y = 0; y <= sizeY; y++) {

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
						image: this.game.config.deco.image,
						states: this.game.config.deco.states,
						state: state,
						map: this.game.config.deco.map,
						position: {
							x: x * data.tile + data.position.x - data.width / 2,
							y: y * data.tile + data.position.y - data.height / 2
						}
					});

					this.__background.push(entity);

				}
			}

		},

		enter: function() {

			this.score.bind('update', this.__updateScore, this);
			this.score.set('time', this.game.settings.play.time);
			this.score.set('points', 0);

		},

		leave: function() {
			this.score.unbind('update', this.__updateScore);
		},

		render: function(clock, delta) {

			if (this.__renderer !== null) {

				for (var b = 0, bl = this.__background.length; b < bl; b++) {
					this.__renderer.renderDeco(this.__background[b]);
				}

				this.__renderNode(
					this.__tree,
					this.__offset.x,
					this.__offset.y
				);

			}

		},


		/*
		 * PRIVATE API
		 */

		__updateScore: function(data) {

			this.__entities.points.set(data.points + '');

			var time = (data.time / 1000) | 0;
			this.__entities.time.set(time + '');

		}

	};


	return Class;

});

