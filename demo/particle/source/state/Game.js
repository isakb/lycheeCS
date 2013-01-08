
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

		this.__particles = [];

		this.reset();

	};


	Class.prototype = {

		reset: function() {

		},

/*
		__createEmitter: function() {

			var width = this.game.settings.width;
			var height = this.game.settings.height;


			var emitter = new lychee.physics.ParticleEmitter({
				angle: 90,
				position: {
					x: width / 2,
					y: height / 2,
					z: 0
				}
			}, this.__graph);

			emitter.setSpawn(1000, 1, {
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


			return emitter;

		},
*/

		__createParticle: function() {

			var particle = new lychee.physics.Particle({
				position: {
					x: 0, y: 0, z: 0
				}
			});


			this.__graph.add(particle);


			return particle;

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			this.__graph = new game.Graph(this.game);
			this.__particles = [];


			this.__input.bind('touch', this.__processTouch, this);
			this.__input.bind('swipe', this.__processSwipe, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);
			this.__input.unbind('swipe', this.__processSwipe);

			this.__emitter = null;
			this.__graph = null;


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			for (var p = 0, l = this.__particles.length; p < l; p++) {
				this.__particles[p].update(clock, delta);
			}

			this.__graph.update(clock, delta);

			this.__clock = clock;

		},

		render: function(clock, delta) {

			this.__renderer.clear();
			this.__graph.render(clock, delta);
			this.__renderer.flush();

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;

			var offset = this.game.getOffset();

			position.x -= offset.x;
			position.y -= offset.y;


			if (this.__particles[id] === undefined) {
				this.__particles[id] = this.__createParticle();
			}


			if (this.__particles[id] !== undefined) {
				this.__particles[id].setPosition(position);
			}

		},

		__processSwipe: function(id, state, position, delta, swipe) {

			if (this.__locked === true) return;

			var offset = this.game.getOffset();

			position.x -= offset.x;
			position.y -= offset.y;


			if (state === 'move' && this.__particles[id] !== undefined) {
				this.__particles[id].setPosition(position);
			}

		}

	};


	return Class;

});
