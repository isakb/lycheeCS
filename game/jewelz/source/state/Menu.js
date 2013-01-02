
lychee.define('game.state.Menu').requires([
	'game.Scene'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__renderer = this.game.renderer;

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
				width: this.game.settings.width,
				height: this.game.settings.height,
				color: '#222222',
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
				text: 'New Game',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: -24
				}
			});

			entity.bind('touch', function(entity) {
				this.__scene.scrollTo(this.__newgame);
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

			entity = new lychee.ui.Text({
				text: 'Credits',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: 72
				}
			});

			entity.bind('touch', function(entity) {
				this.game.setState('credits');
			}, this);

			this.__scene.add(entity, this.__welcome);


			this.__newgame = this.__scene.add(new lychee.ui.Tile({
				width: this.game.settings.width,
				height: this.game.settings.height,
				color: '#444488',
				position: {
					x: hwidth,
					y: -hheight * 3
				}
			}), null);


			entity = new lychee.ui.Text({
				text: 'New Game',
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

			this.__scene.add(entity, this.__newgame);

			entity = new lychee.ui.Text({
				text: 'Classical Board',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: -24
				}
			});

			entity.bind('touch', function(entity) {
				this.game.setState('gameboard');
			}, this);

			this.__scene.add(entity, this.__newgame);

			entity = new lychee.ui.Text({
				text: 'Puzzle Game',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: 24
				}
			});

			entity.bind('touch', function(entity) {
//				this.game.setState('gamepuzzle');
			}, this);

			this.__scene.add(entity, this.__newgame);


// TODO: Remove this notification

			this.__scene.add(new lychee.ui.Text({
				text: '(coming soon)',
				font: this.game.fonts.small,
				layout: {
					position: 'absolute',
					x: 0,
					y: 52
				}
			}), this.__newgame);

// End of TODO


			entity = new lychee.ui.Text({
				text: 'Blast Game',
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					// y: 72
					y: 96
				}
			});

			entity.bind('touch', function(entity) {
				this.game.setState('gameblast', this.game.config.maps['01']);
			}, this);

			this.__scene.add(entity, this.__newgame);


			this.__settings = this.__scene.add(new lychee.ui.Tile({
				width: this.game.settings.width,
				height: this.game.settings.height,
				color: '#444488',
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

			entity = new lychee.ui.Text({
				text: 'Music: ' + (this.game.settings.music === true ? 'On' : 'Off'),
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: 24
				}
			});

			entity.bind('touch', function(entity) {

				this.game.settings.music = this.game.settings.music === true ? false : true;

				entity.set('Music: ' + (this.game.settings.music === true ? 'On' : 'Off'));

			}, this);

			this.__scene.add(entity, this.__settings);

 			entity = new lychee.ui.Text({
				text: 'Sound: ' + (this.game.settings.sound === true ? 'On' : 'Off'),
				font: this.game.fonts.normal,
				layout: {
					position: 'absolute',
					x: 0,
					y: 72
				}
			});

			entity.bind('touch', function(entity) {

				this.game.settings.sound = this.game.settings.sound === true ? false : true;

				entity.set('Sound: ' + (this.game.settings.sound === true ? 'On' : 'Off'));

			}, this);

			this.__scene.add(entity, this.__settings);


		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__locked = true;

			this.__scene.scrollTo(this.__welcome, function() {
				this.__locked = false;
			}, this);

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

			this.__renderer.clear();

			if (this.__scene !== null) {
				this.__scene.render(clock, delta);
			}

			this.__renderer.flush();

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;


			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			var entity = this.__scene.getEntityByPosition(position.x, position.y, null, true);
			if (entity !== null) {

				if (this.game.settings.sound === true) {
					this.game.jukebox.play('click');
				}

				entity.trigger('touch', [ entity ]);

			}

		}

	};


	return Class;

});

