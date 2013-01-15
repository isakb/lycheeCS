
lychee.define('lychee.math.Vector3').exports(function(lychee, global) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Class = function() {
		this._data = new _type(3);
	};


	Class.prototype.clone = function() {

		var clone = new Class();

		this.copy(clone);

		return clone;

	};


	Class.prototype.copy = function(vector) {

		vector.set(this._data[0], this._data[1], this._data[2]);

	};


	Class.prototype.set = function(x, y, z) {

		this._data[0] = x;
		this._data[1] = y;
		this._data[2] = z;

	};


	Class.prototype.add = function(vector) {

		this._data[0] += vector._data[0];
		this._data[1] += vector._data[1];
		this._data[2] += vector._data[2];

	};


	Class.prototype.subtract = function(vector) {

		this._data[0] -= vector._data[0];
		this._data[1] -= vector._data[1];
		this._data[2] -= vector._data[2];

	};


	Class.prototype.multiply = function(vector) {

		this._data[0] *= vector._data[0];
		this._data[1] *= vector._data[1];
		this._data[2] *= vector._data[2];

	};


	Class.prototype.divide = function(vector) {

		this._data[0] /= vector._data[0];
		this._data[1] /= vector._data[1];
		this._data[2] /= vector._data[2];

	};


	Class.prototype.min = function(vector) {

		this._data[0] = Math.min(this._data[0], vector._data[0])
		this._data[1] = Math.min(this._data[1], vector._data[1])
		this._data[2] = Math.min(this._data[2], vector._data[2])

	};


	Class.prototype.max = function(vector) {

		this._data[0] = Math.max(this._data[0], vector._data[0]);
		this._data[1] = Math.max(this._data[1], vector._data[1]);
		this._data[2] = Math.max(this._data[2], vector._data[2]);

	};


	Class.prototype.scale = function(scale) {

		this._data[0] *= scale;
		this._data[1] *= scale;
		this._data[2] *= scale;

	};


	Class.prototype.distance = function(vector) {

		var x = vector._data[0] - this._data[0];
		var y = vector._data[1] - this._data[1];
		var z = vector._data[2] - this._data[2];

		return Math.sqrt(x*x + y*y + z*z);

	};


	Class.prototype.squaredDistance = function(vector) {

		var x = vector._data[0] - this._data[0];
		var y = vector._data[1] - this._data[1];
		var z = vector._data[2] - this._data[2];

		return (x*x + y*y + z*z);

	};


	Class.prototype.length = function() {

		var x = this._data[0];
		var y = this._data[1];
		var z = this._data[2];

		return Math.sqrt(x*x + y*y + z*z);

	};


	Class.prototype.squaredLength = function() {

		var x = this._data[0];
		var y = this._data[1];
		var z = this._data[2];

		return (x*x + y*y + z*z);

	};


	Class.prototype.invert = function() {

		this._data[0] *= -1;
		this._data[1] *= -1;
		this._data[2] *= -1;

	};


	Class.prototype.normalize = function() {

		var x = this._data[0];
		var y = this._data[1];
		var z = this._data[2];

		var length = (x*x + y*y + z*z);
		if (length > 0) {

			length = 1 / Math.sqrt(length);

			this._data[0] *= length;
			this._data[1] *= length;
			this._data[2] *= length;

		}

	};


	Class.prototype.dot = function(vector) {

		return (
			  this._data[0] * vector._data[0]
			+ this._data[1] * vector._data[1]
			+ this._data[2] * vector._data[2]
		);

	};

	// For better compatibility
	Class.prototype.scalar = Class.prototype.dot;


	Class.prototype.cross = function(vector) {

		var ax = this._data[0],
			ay = this._data[1],
			az = this._data[2];

		var bx = vector._data[0],
			by = vector._data[1],
			bz = vector._data[2];

		this._data[0] = ay * bz - az * by;
		this._data[1] = az * bx - ax * bz;
		this._data[2] = ax * by - ay * bx;

	};


	Class.prototype.interpolate = function(vector, t) {

		this._data[0] += t * (vector._data[0] - this._data[0]);
		this._data[1] += t * (vector._data[1] - this._data[1]);
		this._data[2] += t * (vector._data[2] - this._data[2]);

	};


	Class.prototype.transformMatrix4 = function(matrix) {

		var x = this._data[0],
			y = this._data[1],
			z = this._data[2];


		this._data[0] = matrix._data[0]*x  +  matrix._data[4]*y  +  matrix._data[8]*z  + matrix._data[12];
		this._data[1] = matrix._data[1]*x  +  matrix._data[5]*y  +  matrix._data[9]*z  + matrix._data[13];
		this._data[2] = matrix._data[2]*x  +  matrix._data[6]*y  + matrix._data[10]*z  + matrix._data[14];

	};


	Class.prototype.transformQuaternion = function(quaternion) {

		var x = this._data[0],
			y = this._data[1],
			z = this._data[2];

		var qx = quaternion._data[0],
			qy = quaternion._data[1],
			qz = quaternion._data[2],
			qw = quaternion._data[3];

		var ix =  qw * x + qy * z - qz * y,
			iy =  qw * y + qz * x - qx * z,
			iz =  qw * z + qx * y - qy * x,
			iw = -qx * x - qy * y - qz * z;


		this._data[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		this._data[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		this._data[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

	};


	return Class;

});

