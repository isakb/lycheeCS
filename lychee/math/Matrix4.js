
lychee.define('lychee.math.Matrix4').exports(function(lychee, global) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Class = function() {

		this._data = new _type(16);

		this.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);

	};


	Class.IDENTITY = new _type(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);


	Class.prototype.clone = function() {

		var clone = new Class();

		clone.set(
			this._data[0],
			this._data[1],
			this._data[2],
			this._data[3],
			this._data[4],
			this._data[5],
			this._data[6],
			this._data[7],
			this._data[8],
			this._data[9],
			this._data[10],
			this._data[11],
			this._data[12],
			this._data[13],
			this._data[14],
			this._data[15]
		);

		return clone;

	};


	Class.prototype.copy = function(matrix) {

		matrix.set(
			this._data[0],
			this._data[1],
			this._data[2],
			this._data[3],
			this._data[4],
			this._data[5],
			this._data[6],
			this._data[7],
			this._data[8],
			this._data[9],
			this._data[10],
			this._data[11],
			this._data[12],
			this._data[13],
			this._data[14],
			this._data[15]
		);

	};


	Class.prototype.set = function(a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3) {

		this._data[0]  = a0;
		this._data[1]  = a1;
		this._data[2]  = a2;
		this._data[3]  = a3;
		this._data[4]  = b0;
		this._data[5]  = b1;
		this._data[6]  = b2;
		this._data[7]  = b3;
		this._data[8]  = c0;
		this._data[9]  = c1;
		this._data[10] = c2;
		this._data[11] = c3;
		this._data[12] = d0;
		this._data[13] = d1;
		this._data[14] = d2;
		this._data[15] = d3;

	};


	Class.prototype.transpose = function(matrix) {

		if (this === matrix) {

			var m01 = matrix[1], m02 = matrix[2], m03 = matrix[3];
			var m12 = matrix[6], m13 = matrix[7];
			var m23 = matrix[11];

			this._data[1]  = matrix._data[4];
			this._data[2]  = matrix._data[8];
			this._data[3]  = matrix._data[12];
			this._data[4]  = m01;
			this._data[6]  = matrix._data[9];
			this._data[7]  = matrix._data[13];
			this._data[8]  = m02;
			this._data[9]  = m12;
			this._data[11] = matrix._data[14];
			this._data[12] = m03;
			this._data[13] = m13;
			this._data[14] = m23;

		} else {

			this._data[0]  = matrix._data[0];
			this._data[1]  = matrix._data[4];
			this._data[2]  = matrix._data[8];
			this._data[3]  = matrix._data[12];
			this._data[4]  = matrix._data[1];
			this._data[5]  = matrix._data[5];
			this._data[6]  = matrix._data[9];
			this._data[7]  = matrix._data[13];
			this._data[8]  = matrix._data[2];
			this._data[9]  = matrix._data[6];
			this._data[10] = matrix._data[10];
			this._data[11] = matrix._data[14];
			this._data[12] = matrix._data[3];
			this._data[13] = matrix._data[7];
			this._data[14] = matrix._data[11];
			this._data[15] = matrix._data[15];

		}

	};


	Class.prototype.invert = function(matrix) {

		var m00 = matrix._data[0],  m01 = matrix._data[1],  m02 = matrix._data[2],  m03 = matrix._data[3];
		var m10 = matrix._data[4],  m11 = matrix._data[5],  m12 = matrix._data[6],  m13 = matrix._data[7];
		var m20 = matrix._data[8],  m21 = matrix._data[9],  m22 = matrix._data[10], m23 = matrix._data[11];
		var m30 = matrix._data[12], m31 = matrix._data[13], m32 = matrix._data[14], m33 = matrix._data[15];

		var b00 = m00 * m11 - m01 * m10;
		var b01 = m00 * m12 - m02 * m10;
		var b02 = m00 * m13 - m03 * m10;
		var b03 = m01 * m12 - m02 * m11;
		var b04 = m01 * m13 - m03 * m11;
		var b05 = m02 * m13 - m03 * m12;
		var b06 = m20 * m31 - m21 * m30;
		var b07 = m20 * m32 - m22 * m30;
		var b08 = m20 * m33 - m23 * m30;
		var b09 = m21 * m32 - m22 * m31;
		var b10 = m21 * m33 - m23 * m31;
		var b11 = m22 * m33 - m23 * m32;


		var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		if (det !== 0) {

			det = 1.0 / det;


			this._data[0]  = (m11 * b11 - m12 * b10 + m13 * b09) * det;
			this._data[1]  = (m02 * b10 - m01 * b11 - m03 * b09) * det;
			this._data[2]  = (m31 * b05 - m32 * b04 + m33 * b03) * det;
			this._data[3]  = (m22 * b04 - m21 * b05 - m23 * b03) * det;
			this._data[4]  = (m12 * b08 - m10 * b11 - m13 * b07) * det;
			this._data[5]  = (m00 * b11 - m02 * b08 + m03 * b07) * det;
			this._data[6]  = (m32 * b02 - m30 * b05 - m33 * b01) * det;
			this._data[7]  = (m20 * b05 - m22 * b02 + m23 * b01) * det;
			this._data[8]  = (m10 * b10 - m11 * b08 + m13 * b06) * det;
			this._data[9]  = (m01 * b08 - m00 * b10 - m03 * b06) * det;
			this._data[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
			this._data[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
			this._data[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
			this._data[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
			this._data[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
			this._data[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

		}

	};


	return Class;

});

