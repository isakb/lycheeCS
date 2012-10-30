
lychee.define('game.scene.UI').requires([
	'game.Score'
]).includes([
	'lychee.ui.Graph'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.game = game;

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
					color: '#333333',
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

		},

		enter: function() {

			this.score.bind('update', this.__updateScore, this);
			this.score.set('time', this.game.settings.play.time);
			this.score.set('points', 0);

		},

		leave: function() {
			this.score.unbind('update', this.__updateScore);
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

