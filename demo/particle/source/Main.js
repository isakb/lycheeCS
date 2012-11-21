
lychee.define('game.Main').requires([
	'lychee.Input',
	'game.Graph',
	'game.Renderer',
	'game.state.Game',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		lychee.game.Main.call(this, settings);

		this.__offset = { x: 0, y: 0 };

		this.load();

	};


	Class.prototype = {

		defaults: {
			title: 'boilerplate',
			base: './asset',
			fullscreen: false,
			renderFps: 60,
			updateFps: 60,
			width: 896,
			height: 386
		},

		load: function() {

			// This demo requires no loaded assets

			lychee.game.Main.prototype.load.call(this);

		},

		reset: function() {

			game.DeviceSpecificHacks.call(this);

			var env = this.renderer.getEnvironment();

			if (this.settings.fullscreen === true) {
				this.settings.width = env.screen.width;
				this.settings.height = env.screen.height;
			} else {
				this.settings.width = this.defaults.width;
				this.settings.height = this.defaults.height;
			}


			this.renderer.reset(this.settings.width, this.settings.height, false);

			this.__offset = env.offset; // Linked

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);

			this.renderer = new game.Renderer('game');

			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true
			);

			this.renderer.setBackground("#222222");


			this.reset();


			this.input = new lychee.Input({
				delay: 0,
				fireModifiers: true
			});


			this.states = {
				game:    new game.state.Game(this)
			};


			this.setState('game');

			this.start();

		},

		getOffset: function() {
			return this.__offset;
		}

	};


	return Class;

});
