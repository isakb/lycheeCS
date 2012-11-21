
lychee.define('lychee.physics.Particle').exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, this.defaults, data);


		this.__force = { x: 0, y: 0, z: 0 };
		this.__position = { x: 0, y: 0, z: 0 };
		this.__velocity = { x: 0, y: 0, z: 0 };

		this.__damping = 1;
		this.__inverseMass = null;


		settings.force !== null    && this.setForce(settings.force);
		settings.mass !== null     && this.setMass(settings.mass);
		settings.position !== null && this.setPosition(settings.position);
		settings.velocity !== null && this.setVelocity(settings.velocity);


		settings = null;

	};


	Class.prototype = {

		defaults: {
			force: null,
			mass: null,
			position: null,
			velocity: null
		},


		/*
		 * PUBLIC API
		 */

		update: function(clock, delta) {

			// Skip if our physical mass is Infinity
			if (this.__inverseMass === null) return;


			var t = delta / 1000;
			if (t > 0) {

				this.__position.x += this.__velocity.x * t;
				this.__position.y += this.__velocity.y * t;
				this.__position.z += this.__velocity.z * t;


				this.__velocity.x += (this.__force.x * this.__inverseMass) * t;
				this.__velocity.y += (this.__force.y * this.__inverseMass) * t;
				this.__velocity.z += (this.__force.z * this.__inverseMass) * t;


				// This is a Math.pow(this.__damping, t) in bitwise arithmetic
				// var damping = (this.__damping << delta) / 1000;

				// this.__velocity.x *= damping;
				// this.__velocity.y *= damping;
				// this.__velocity.z *= damping;

			}

		},



		/*
		 * GETTERS AND SETTERS
		 */

		getDamping: function() {
			return this.__damping;
		},

		setDamping: function(damping) {

			damping = typeof damping === 'number' ? damping : null;

			if (damping !== null) {
				this.__damping = damping;
				return true;
			}


			return false;

		},

		getForce: function() {
			return this.__force;
		},

		setForce: function(force) {

			if (Object.prototype.toString.call(force) === '[object Object]') {

				this.__force.x = typeof force.x === 'number' ? force.x : this.__force.x;
				this.__force.y = typeof force.y === 'number' ? force.y : this.__force.y;
				this.__force.z = typeof force.z === 'number' ? force.z : this.__force.z;


				return true;

			}


			return false;

		},

		getMass: function() {

			if (this.__inverseMass !== null) {
				return (1 / this.__inverseMass);
			}


			return Infinity;

		},

		setMass: function(mass) {

			if (mass !== 0) {
				this.__inverseMass = 1 / mass;
				return true;
			}


			return false;

		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (Object.prototype.toString.call(position) === '[object Object]') {

				this.__position.x = typeof position.x === 'number' ? position.x : this.__position.x;
				this.__position.y = typeof position.y === 'number' ? position.y : this.__position.y;
				this.__position.z = typeof position.z === 'number' ? position.z : this.__position.z;


				return true;

			}


			return false;

		},

		getVelocity: function() {
			return this.__velocity;
		},

		setVelocity: function(velocity) {

			if (Object.prototype.toString.call(velocity) === '[object Object]') {

				this.__velocity.x = typeof velocity.x === 'number' ? velocity.x : this.__velocity.x;
				this.__velocity.y = typeof velocity.y === 'number' ? velocity.y : this.__velocity.y;
				this.__velocity.z = typeof velocity.z === 'number' ? velocity.z : this.__velocity.z;


				return true;

			}


			return false;

		}

	};


	return Class;

});

