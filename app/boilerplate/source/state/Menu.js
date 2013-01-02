
lychee.define('game.state.Menu').requires([
	'game.Scene'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__current = null;
		this.__locked = true;
		this.__scene = null;

		this.__welcome = null;
		this.__settings = null;


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var hwidth  = this.game.settings.width / 2;
			var hheight = this.game.settings.height / 2;
			var entity = null;


			this.__scene = new game.Scene(this.game);


			this.__welcome = this.__scene.add(new lychee.ui.Tile({
				color: '#222',
				width: this.game.settings.width,
				height: this.game.settings.height,
				position: {
					x: hwidth,
					y: hheight
				}
			}), null);

			this.__scene.add(new lychee.ui.Text({
				text: this.game.settings.title,
				font: this.game.fonts.headline,
				layout: {
					position: 'absolute',
					x: 0,
					y: -hheight + 80
				}
			}), this.__welcome);

			this.__scene.add(new lychee.ui.Text({
				text: 'powered by lycheeJS',
				font: this.game.fonts.small,
				layout: {
					position: 'absolute',
					x: 0,
					y: hheight - 30
				}
			}), this.__welcome);

			entity = new lychee.ui.Text({
				text: 'Launch App',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: -24
				}
			});

			entity.bind('touch', function(entity) {
				this.game.setState('game', this.game.scenes[0]);
			}, this);

			this.__scene.add(entity, this.__welcome);

			entity = new lychee.ui.Text({
				text: 'Settings',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: 24
				}
			});

			entity.bind('touch', function(entity) {
				this.__scene.scrollTo(this.__settings);
			}, this);

			this.__scene.add(entity, this.__welcome);





			this.__settings = this.__scene.add(new lychee.ui.Tile({
				color: '#56789f',
				width: this.game.settings.width,
				height: this.game.settings.height,
				position: {
					x: hwidth * 3,
					y: hheight
				}
			}), null);

			entity = new lychee.ui.Text({
				text: 'Settings',
				font: this.game.fonts.headline,
				layout: {
					position: 'absolute',
					x: 0,
					y: -hheight + 80
				}
			});

			entity.bind('touch', function(entity) {
				this.__scene.scrollTo(this.__welcome);
			}, this);

			this.__scene.add(entity, this.__settings);

			entity = new lychee.ui.Text({
				text: 'Fullscreen: ' + (this.game.settings.fullscreen === true ? 'On' : 'Off'),
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: -24
				}
			});

			entity.bind('touch', function(entity) {

				this.game.settings.fullscreen = this.game.settings.fullscreen === true ? false : true;

				entity.set('Fullscreen: ' + (this.game.settings.fullscreen === true ? 'On' : 'Off'));

				this.game.reset();
				this.reset();

				this.__scene.scrollTo(this.__settings);

			}, this);

			this.__scene.add(entity, this.__settings);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__scene.scrollTo(this.__welcome, function() {
				this.__locked = false;
			}, this);

			this.__locked = false;

			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__scene !== null) {
				this.__scene.update(clock, delta);
			}

		},

		render: function(clock, delta) {

			if (this.__scene !== null) {
				this.__scene.render(clock, delta);
			}

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;


			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			var entity = this.__scene.getEntityByPosition(position.x, position.y, null, true);
			if (
				entity !== null
				&& entity.hasEvent('touch') === true
			) {
				entity.trigger('touch', [ entity ]);
			}

		}

	};


	return Class;

});

