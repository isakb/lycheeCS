
lychee.define('game.state.Game').requires([
	'lychee.physics.ParticleEmitter'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__clock = 0;
		this.__graph = null;
		this.__emitter = null;
		this.__locked = false;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__locked = true;


			var width = this.game.settings.width;
			var height = this.game.settings.height;


			this.__graph = new game.Graph(this.game);

			this.__emitter = new lychee.physics.ParticleEmitter({
				angle: 90,
				position: {
					x: width / 2,
					y: height / 2,
					z: 0
				}
			}, this.__graph);

			this.__emitter.setSpawn(250, 1, {
				callback: function(spawn, delta, id) {

					spawn.settings.velocity.x = Math.sin(1/10 * id * 2 * Math.PI) * spawn.settings.defaults.velocity.x;
					spawn.settings.velocity.y = Math.cos(1/10 * id * 2 * Math.PI) * spawn.settings.defaults.velocity.y;

					this.spawn(spawn.amount, spawn.settings);

				},
				clear: function(spawn) {

				}
			}, {
				velocity: { x: 0, y: 0, z: 0 },
				defaults: {
					velocity: { x: 10, y: 10, z: 0 }
				}
			});


			this.__locked = false;


			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			this.__emitter = null;
			this.__graph = null;


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			this.__emitter.update(clock, delta);
			this.__graph.update(clock, delta);

			this.__clock = clock;

		},

		render: function(clock, delta) {

			this.__renderer.clear();
			this.__graph.render(clock, delta);
			this.__renderer.flush();

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;

			var offset = this.game.getOffset();

			position.x -= offset.x;
			position.y -= offset.y;


			if (this.__emitter !== null) {
				this.__emitter.setPosition(position);
			}

		}

	};


	return Class;

});
