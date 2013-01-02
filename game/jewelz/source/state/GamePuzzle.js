
lychee.define('game.state.GamePuzzle').requires([
	'game.scene.Overlay',
	'game.scene.UI'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input    = this.game.input;
		this.__jukebox  = this.game.jukebox;
		this.__loop     = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__clock = 0;
		this.__locked = false;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

		},

		render: function(clock, delta) {

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;

			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			this.game.setState('menu');

		}

	};


	return Class;

});
