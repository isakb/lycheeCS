
lychee.define('Renderer').tags({
	platform: 'html'
}).requires([
	'lychee.Font'
]).supports(function(lychee, global) {

	if (
		global.document
		&& typeof global.document.createElement === 'function'
		&& typeof global.CanvasRenderingContext2D === 'function'
	) {

		var canvas = global.document.createElement('canvas');
		if (typeof canvas.getContext === 'function') {
			return true;
		}

	}

	return false;

}).exports(function(lychee, global) {

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;

		this.__id = id;
		this.__canvas = global.document.createElement('canvas');
		this.__ctx = this.__canvas.getContext('2d');

		this.__environment = {
			width: null,
			height: null,
			screen: {},
			offset: {}
		};

		this.__state = null;
		this.__alpha = 1;
		this.__background = null;
		this.__width = 0;
		this.__height = 0;

		// required for requestAnimationFrame
		this.context = this.__canvas;


		if (this.__id !== null) {
			this.__canvas.id = this.__id;
		}


		if (!this.__canvas.parentNode) {
			global.document.body.appendChild(this.__canvas);
		}

	};

	Class.prototype = {

		/*
		 * State and Environment Management
		 */

		reset: function(width, height, resetCache) {

			width = typeof width === 'number' ? width : this.__width;
			height = typeof height === 'number' ? height : this.__height;
			resetCache = resetCache === true ? true : false;

			if (resetCache === true) {
				this.__cache = {};
			}


			this.__width = width;
			this.__height = height;

			this.__canvas.width = width;
			this.__canvas.height = height;

			this.__canvas.style.width = width + 'px';
			this.__canvas.style.height = height + 'px';


			this.__updateEnvironment();

		},

		start: function() {
			if (this.__state !== 'running') {
				this.__state = 'running';
			}
		},

		stop: function() {
			this.__state = 'stopped';
		},

		clear: function() {

			if (this.__state !== 'running') return;

			this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);

		},

		flush: function() {

		},

		isRunning: function() {
			return this.__state === 'running';
		},

		getEnvironment: function() {
			this.__updateEnvironment();
			return this.__environment;
		},



		/*
		 * PRIVATE API: Helpers
		 */

		__updateEnvironment: function() {

			this.__environment.screen.width = global.innerWidth;
			this.__environment.screen.height = global.innerHeight;

			this.__environment.offset.x = this.__canvas.offsetLeft;
			this.__environment.offset.y = this.__canvas.offsetTop;

			this.__environment.width = this.__width;
			this.__environment.height = this.__height;

		},



		/*
		 * Setters
		 */

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;

			if (alpha !== null && alpha >= 0 && alpha <= 1) {
				this.__ctx.globalAlpha = alpha;
			}

		},

		setBackground: function(color) {

			color = typeof color === 'string' ? color : '#000';

			this.__background = color;
			this.__canvas.style.backgroundColor = color;

		},



		/*
		 * Drawing API
		 */

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000';
			background = background === true ? true : false;
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			if (background === false) {
				this.__ctx.lineWidth = lineWidth;
				this.__ctx.strokeStyle = color;
				this.__ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
			} else {
				this.__ctx.fillStyle = color;
				this.__ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
			}

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000';
			background = background === true ? true : false;
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			this.__ctx.beginPath();

			this.__ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);

			if (background === false) {
				this.__ctx.lineWidth = lineWidth;
				this.__ctx.strokeStyle = color;
				this.__ctx.stroke();
			} else {
				this.__ctx.fillStyle = color;
				this.__ctx.fill();
			}

			this.__ctx.closePath();

		},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;

			this.__ctx.beginPath();

			this.__ctx.moveTo(x1, y1);
			this.__ctx.lineTo(x2, y2);

			this.__ctx.lineWidth = lineWidth;
			this.__ctx.strokeStyle = color;
			this.__ctx.stroke();

			this.__ctx.closePath();

		},

		drawSprite: function(x1, y1, sprite, map) {

			if (this.__state !== 'running') return;

			map = Object.prototype.toString.call(map) === '[object Object]' ? map : null;


			if (map === null) {

				this.__ctx.drawImage(sprite, x1, y1);

			} else {

				if (lychee.debug === true) {

					this.drawBox(
						x1,
						y1,
						x1 + map.w,
						y1 + map.h,
						'#f00',
						false,
						1
					);

				}


				this.__ctx.drawImage(
					sprite,
					map.x,
					map.y,
					map.w,
					map.h,
					x1,
					y1,
					map.w,
					map.h
				);

			}

		},

		drawText: function(x1, y1, text, font) {

			if (this.__state !== 'running') return;

			var t, l;

			// sprite based rendering
			if (font instanceof lychee.Font) {

				var settings = font.getSettings();
				var sprite = font.getSprite();


				var chr;

				// Measure text if we have to center it later
				if (x1 === 'center' || y1 === 'center') {

					var width = 0,
						height = 0;

					for (t = 0, l = text.length; t < l; t++)  {
						chr = font.get(text[t]);
						width += chr.real + settings.kerning;
						height = Math.max(height, chr.height);
					}

					if (x1 === 'center') {
						x1 = (this.__width / 2) - (width / 2);
					}

					if (y1 === 'center') {
						y1 = (this.__height / 2) - (height / 2);
					}

				}


				var margin = 0;

				for (t = 0, l = text.length; t < l; t++) {

					var chr = font.get(text[t]);

					if (lychee.debug === true) {

						this.drawBox(
							x1 + margin,
							y1,
							x1 + margin + chr.real,
							y1 + chr.height,
							'#ff0',
							false,
							1
						);

					}

					this.__ctx.drawImage(
						chr.sprite || sprite,
						chr.x,
						chr.y,
						chr.width,
						chr.height,
						x1 + margin - settings.spacing,
						y1 + settings.baseline,
						chr.width,
						chr.height
					);

					margin += chr.real + settings.kerning;

				}

			// text based rendering
			} else if (Object.prototype.toString.call(font) === '[object Object]'){

				font.color = typeof font.color === 'string' ? font.color : '#000';
				font.font = typeof font.font === 'string' ? font.font : 'Arial';
				font.size = typeof font.size === 'number' ? font.size : 12;


				if (x1 === 'center' || y1 === 'center') {

					var width = 0;
					for (t = 0, l = text.length; t < l; t++) {
						var m = this.__ctx.measureText(text[t]);
						width += m.charWidth;
					}


					if (x1 === 'center') {
						x1 = (this.__width / 2) - (width / 2);
					}

					if (y1 === 'center') {
						y1 = (this.__height / 2) - (data.size / 2);
					}

				}


				this.__ctx.font = font.size + 'px "' + font.font + '"';
				this.__ctx.fillStyle = font.color;
				this.__ctx.fillText(text, x1, y1);

			}

		}

	};


	return Class;

});

