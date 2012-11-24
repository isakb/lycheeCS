
lychee.define('lychee.game.Entity').exports(function(lychee) {

	var Class = function(data) {

		var settings = lychee.extend({}, this.defaults, data);


		this.__clock = null;

		this.__animation = null;
		this.__collision = null;
		this.__effect = null;
		this.__position = { x: 0, y: 0, z: 0 };
		this.__shape = null;
		this.__state = 'default';
		this.__tween = null;


		this.__states = lychee.extend({}, this.defaults.states, settings.states);


		// Reuse this cache for performance relevant methods
		this.__cache = {
			position: {},
			tween: {},
			effect: {}
		};


		this.width  = settings.width;
		this.height = settings.height;
		this.radius = settings.radius;


		this.setPosition(settings.position);
		this.setCollisionType(settings.collision);
		this.setShape(settings.shape);
		this.setState(settings.state);


		if (Object.prototype.toString.call(settings.animation) === '[object Object]') {

			if (typeof settings.animation.duration === 'number') {

				var duration = settings.animation.duration;
				var loop = settings.animation.loop === true ? true : false;

				delete settings.animation.duration;
				delete settings.animation.loop;

				this.setAnimation(duration, settings.animation, loop);

			}

		}


		settings = null;

	};


	Class.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	Class.EFFECT = {

		wobble: {

			duration: 1000,

			defaults: {
				x: 0,
				y: 0,
				z: 0
			},

			callback: function(effect, t) {

				var s = effect.settings;

				if (effect.origin === undefined) {

					var position = this.getPosition();
					effect.origin = {
						x: position.x,
						y: position.y,
						z: position.z
					};

				}

				this.__cache.effect.x = effect.origin.x + Math.sin(t * 2 * Math.PI) * s.x;
				this.__cache.effect.y = effect.origin.y + Math.sin(t * 2 * Math.PI) * s.y;
				this.__cache.effect.z = effect.origin.z + Math.sin(t * 2 * Math.PI) * s.z;

				this.setPosition(this.__cache.effect);

			},

			clear: function(effect) {
				this.setPosition(effect.origin);
			}

		}

	};


	Class.SHAPE = {
		circle:    0,
		sphere:    1,
		rectangle: 2,
		cuboid:    3,
		polygon:   4
	};


	Class.TWEEN = {

		linear: function(t, dx, dy, dz) {

			this.__cache.tween.x = t * dx;
			this.__cache.tween.y = t * dy;
			this.__cache.tween.z = t * dz;

			return this.__cache.tween;

		},

		easeIn: function(t, dx, dy, dz) {

			var f = 1 * Math.pow(t, 3);

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		},

		easeOut: function(t, dx, dy, dz) {

			var f = Math.pow(t - 1, 3) + 1;

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		},

		easeInOut: function(t, dx, dy, dz) {

			var f;

			if ((t /= 0.5) < 1) {
				f = 0.5 * Math.pow(t, 3);
			} else {
				f = 0.5 * (Math.pow(t - 2, 3) + 2);
			}

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		},

		bounceEaseIn: function(t, dx, dy, dz) {

			var k = 1 - t;
			var f;
			if ((k /= 1) < ( 1 / 2.75 )) {
				f = 1 * ( 7.5625 * Math.pow(k, 2) );
			} else if (k < ( 2 / 2.75 )) {
				f = 7.5625 * ( k -= ( 1.5 / 2.75 )) * k + .75;
			} else if (k < ( 2.5 / 2.75 )) {
				f = 7.5625 * ( k -= ( 2.25 / 2.75 )) * k + .9375;
			} else {
				f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + .984375;
			}

			this.__cache.tween.x = (1 - f) * dx;
			this.__cache.tween.y = (1 - f) * dy;
			this.__cache.tween.z = (1 - f) * dz;

			return this.__cache.tween;

		},

		bounceEaseOut: function(t, dx, dy, dz) {

			var f;
			if ((t /= 1) < ( 1 / 2.75 )) {
				f = 1 * ( 7.5625 * Math.pow(t, 2) );
			} else if (t < ( 2 / 2.75 )) {
				f = 7.5625 * ( t -= ( 1.5 / 2.75 )) * t + .75;
			} else if (t < ( 2.5 / 2.75 )) {
				f = 7.5625 * ( t -= ( 2.25 / 2.75 )) * t + .9375;
			} else {
				f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + .984375;
			}

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		},

		sinEaseIn: function(t, dx, dy, dz) {

			var f = -1 * Math.cos(t * Math.PI / 2 ) + 1;

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		},

		sinEaseOut: function(t, dx, dy, dz) {

			var f = 1 * Math.sin(t * Math.PI / 2);

			this.__cache.tween.x = f * dx;
			this.__cache.tween.y = f * dy;
			this.__cache.tween.z = f * dz;

			return this.__cache.tween;

		}

	};


	Class.prototype = {

		defaults: {

			position: {
				x: 0, y: 0, z: 0
			},

			radius: 0,
			width:  0,
			height: 0,

			shape: Class.SHAPE.circle,
			collision: Class.COLLISION.none,

			states: {
				'default': 0
			}

		},

		// Allows sync(null, true) for reset
		sync: function(clock, force) {

			force = force === true ? true : false;

			if (force === true) {
				this.__clock = clock;
			}

			if (this.__clock === null) {

				if (this.__tween !== null) {
					this.__tween.start = clock;
				}

				if (this.__effect !== null) {
					this.__effect.start = clock;
				}

				if (this.__animation !== null) {
					this.__animation.start = clock;
				}

				this.__clock = clock;

			}

		},

		update: function(clock, delta) {


			// Sync clocks initially (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var t = 0;
			var dt = delta / 1000;

			if (this.__tween !== null && (this.__clock <= this.__tween.start + this.__tween.duration)) {

				var cache = this.__cache.position;
				t = (this.__clock - this.__tween.start) / this.__tween.duration;


				if (typeof this.__position.x === 'number') {
					cache.x = this.__tween.to.x - this.__tween.from.x;
				} else {
					cache.x = 0;
				}

				if (typeof this.__position.y === 'number') {
					cache.y = this.__tween.to.y - this.__tween.from.y;
				} else {
					cache.y = 0;
				}

				if (typeof this.__position.z === 'number') {
					cache.z = this.__tween.to.z - this.__tween.from.z;
				} else {
					cache.z = 0;
				}


				var diff = this.__tween.callback.call(this.__tween.scope, t, cache.x, cache.y, cache.z);

				if (typeof this.__position.x === 'number') {
					cache.x = this.__tween.from.x + diff.x;
				}

				if (typeof this.__position.y === 'number') {
					cache.y = this.__tween.from.y + diff.y;
				}

				if (typeof this.__position.z === 'number') {
					cache.z = this.__tween.from.z + diff.z;
				}

				this.setPosition(cache);

			} else if (this.__tween !== null) {

				// We didn't have enough time for the tween
				this.setPosition(this.__tween.to);
				this.__tween = null;

			}


			if (this.__effect !== null && (this.__clock <= this.__effect.start + this.__effect.duration)) {

				t = (this.__clock - this.__effect.start) / this.__effect.duration;
				this.__effect.callback.call(this.__effect.scope, this.__effect, t);

			} else if (this.__effect !== null) {

				if (this.__effect.loop === true) {
					this.__effect.start = this.__clock;
				} else {
					this.__effect = null;
				}

			}


			if (this.__animation !== null && (this.__clock <= this.__animation.start + this.__animation.duration)) {

				t = (this.__clock - this.__animation.start) / this.__animation.duration;

				// Note: Math.floor approach doesn't work for lastframeindex x.6-x.9
				this.__animation.frame = Math.max(0, Math.ceil(t * this.__animation.frames) - 1);

			} else if (this.__animation !== null) {

				if (this.__animation.loop === true) {
					this.__animation.start = this.__clock;
				} else {
					this.__animation = null;
				}

			}


			this.__clock = clock;

		},

		setTween: function(duration, position, callback, scope) {

			duration = typeof duration === 'number' ? duration : 0;
			callback = callback instanceof Function ? callback : Class.TWEEN.linear;
			scope = scope !== undefined ? scope : this;


			var tween = null;
			if (Object.prototype.toString.call(position) === '[object Object]') {

				position.x = typeof position.x === 'number' ? position.x : this.__position.x;
				position.y = typeof position.y === 'number' ? position.y : this.__position.y;
				position.z = typeof position.z === 'number' ? position.z : this.__position.z;

				var pos = this.getPosition();

				tween = {
					start: this.__clock,
					duration: duration,
					from: {
						x: pos.x,
						y: pos.y,
						z: pos.z
					},
					to: position,
					callback: callback,
					scope: scope
				};

			}


			this.__tween = tween;

		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (Object.prototype.toString.call(position) !== '[object Object]') {
				return false;
			}


			this.__position.x = typeof position.x === 'number' ? position.x : this.__position.x;
			this.__position.y = typeof position.y === 'number' ? position.y : this.__position.y;
			this.__position.z = typeof position.z === 'number' ? position.z : this.__position.z;

			return true;

		},

		getState: function() {
			return this.__state;
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__states[id] !== undefined) {
				this.__state = id;
				return true;
			}


			return false;

		},

		collidesWith: function(entity) {

			if (
				this.getCollisionType() === Class.COLLISION.none
				|| entity.getCollisionType() === Class.COLLISION.none
			) {
				return false;
			}


			var shapeA = this.getShape();
			var shapeB = entity.getShape();
			var posA = this.getPosition();
			var posB = entity.getPosition();


			if (
				shapeA === Class.SHAPE.circle
				&& shapeB === Class.SHAPE.circle
			) {

				var collisionDistance = this.radius + entity.radius;
				var realDistance = Math.sqrt(
					Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2)
				);


				if (realDistance <= collisionDistance) {
					return true;
				}

			} else if (
				shapeA === Class.SHAPE.circle
				&& shapeB === Class.SHAPE.rectangle
			) {

				var radius = this.radius;
				var halfWidth = entity.width / 2;
				var halfHeight = entity.height / 2;

				if (
					(posA.x + radius > posB.x - halfWidth)
					&& (posA.x - radius < posB.x + halfWidth)
					&& (posA.y + radius > posB.y - halfHeight)
					&& (posA.y - radius < posB.y + halfHeight)
				) {
					return true;
				}

			} else if (
				shapeA === Class.SHAPE.rectangle
				&& shapeB === Class.SHAPE.circle
			) {

				var radius = entity.radius;
				var halfWidth = this.width / 2;
				var halfHeight = this.height / 2;

				if (
					(posA.x + radius > posB.x - halfWidth)
					&& (posA.x - radius < posB.x + halfWidth)
					&& (posA.y + radius > posB.y - halfHeight)
					&& (posA.y - radius < posB.y + halfHeight)
				) {
					return true;
				}

			}


			return false;

		},

		getCollisionType: function() {
			return this.__collision;
		},

		setCollisionType: function(type) {

			var found = false;

			for (var id in Class.COLLISION) {

				if (type === Class.COLLISION[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {
				this.__collision = type;
			}


			return found;

		},

		getShape: function() {
			return this.__shape;
		},

		setShape: function(shape) {

			var found = false;

			for (var id in Class.SHAPE) {

				if (shape === Class.SHAPE[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {
				this.__shape = shape;
			}


			return found;

		},

		getFrame: function() {

			if (this.__animation === null) {
				return 0;
			} else {
				return this.__animation.frame;
			}

		},

		setAnimation: function(duration, settings, loop) {

			duration = typeof duration === 'number' ? duration : null;
			settings = Object.prototype.toString.call(settings) === '[object Object]' ? settings : null;
			loop = loop === true ? true : false;


			var animation = null;
			if (duration !== null || settings !== null) {

				// Faster than an animationdefaults object lookup
				settings.frame  = settings.frame || 0;
				settings.frames = settings.frames || 10;


				animation = {
					start: this.__clock,
					frame: settings.frame,
					frames: settings.frames,
					duration: duration,
					loop: loop
				};

			}


			this.__animation = animation;

		},

		clearAnimation: function() {
			this.__animation = null;
		},

		setEffect: function(duration, data, settings, scope, loop) {

			duration = typeof duration === 'number' ? duration : (data.duration ? data.duration : null);
			settings = Object.prototype.toString.call(settings) === '[object Object]' ? settings : null;
			scope = scope !== undefined ? scope : this;
			loop = loop === true ? true : false;


			var effect = null;
			if (duration !== null && Object.prototype.toString.call(data) === '[object Object]') {

				if (data.callback instanceof Function) {

					var position = this.getPosition();

					effect = {
						start: this.__clock,
						callback: data.callback,
						clear: data.clear || null,
						duration: duration,
						scope: scope,
						loop: loop,
						origin: {
							x: position.x,
							y: position.y,
							z: position.z
						}
					};

					if (Object.prototype.toString.call(data.defaults) === '[object Object]') {
						effect.settings = lychee.extend({}, data.defaults, settings);
					} else {
						effect.settings = settings;
					}

				}

			}


			this.__effect = effect;

		},

		clearEffect: function() {

			if (this.__effect !== null && this.__effect.clear !== null) {
				this.__effect.clear.call(this.__effect.scope, this.__effect);
			}

			this.__effect = null;

		}

	};


	return Class;

});

