
lychee.define('Renderer').tags({
	platform: 'v8gl'
}).requires([
	'lychee.Font'
]).supports(function(lychee, global) {

	if (global.gl && global.glut) {
		return true;
	}

	return false;

}).exports(function(lychee, global) {

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;

		this.__id = id;

		this.__environment = {
			width: null,
			height: null,
			screen: {},
			offset: {}
		};

		this.__colorcache = {};
		this.__window = null;
		this.__state = null;
		this.__alpha = 1;
		this.__background = { r: 0, g: 0, b: 0 };
		this.__width = 0;
		this.__height = 0;

		this.context = null;

	};

	Class.prototype = {

		/*
		 * State and Environment Management
		 */

		reset: function(width, height, resetCache) {

			if (lychee.debug === true) {
				console.log('lychee.Renderer: reset', width, height, resetCache);
			}


			width = typeof width === 'number' ? width : this.__width;
			height = typeof height === 'number' ? height : this.__height;
			resetCache = resetCache === true ? true : false;

			if (resetCache === true) {
				this.__cache = {};
			}


			glut.initDisplayMode(glut.DOUBLE | glut.RGBA | glut.DEPTH);

			if (width !== this.__width || height !== this.__height) {

				if (this.__window !== null) {
					// Delete previous window
					glut.destroyWindow(this.__window);
				} else {
					// Delete the default window
					glut.destroyWindow(1);
				}

				glut.initWindowSize(width, height);

				this.__width = width;
				this.__height = height;
				this.__window = glut.createWindow(this.__id);

				glut.positionWindow(0, 0);

				// Texture Buffers need to be regenerated
				for (var id in this.__cache) {
					if (this.__cache[id] === null) continue;
					this.__cache[id].generate();
				}

			}


			gl.matrixMode(gl.PROJECTION);
			gl.loadIdentity();
			gl.ortho(0, this.__width, this.__height, 0, 0, 1);

			gl.disable(gl.DEPTH_TEST);


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

			gl.clearColor(this.__background.r, this.__background.g, this.__background.b, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		},

		flush: function() {

			if (this.__state !== 'running') return;

			glut.swapBuffers();

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

			this.__environment.width = this.__width;
			this.__environment.height = this.__height;

			this.__environment.screen.width = this.__width;
			this.__environment.screen.height = this.__height;

			this.__environment.offset.x = 0;
			this.__environment.offset.y = 0;

		},

		__hexToRGB: function(hex) {

			if (typeof hex === 'string') {

				if (hex.length === 7) {

					this.__colorcache.r = parseInt(hex[1] + hex[2], 16);
					this.__colorcache.g = parseInt(hex[3] + hex[4], 16);
					this.__colorcache.b = parseInt(hex[5] + hex[6], 16);

					return this.__colorcache;

				}

			}


			if (lychee.debug === true) {
				console.warn('lychee.Renderer: Invalid Hex Color "' + hex + '"');
			}


			this.__colorcache.r = 0;
			this.__colorcache.g = 0;
			this.__colorcache.b = 0;


			return this.__colorcache;

		},

		__translateToTexCoord: function(pos, full, inverted) {

			var result = 0;

			if (inverted === true) {
				result = (full - pos) / full;
				result = 1 - (pos / full);
			} else {
				result = pos / full;
			}

			return result;

		},



		/*
		 * Setters
		 */

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;

			if (alpha !== null && alpha >= 0 && alpha <= 1) {
				this.__alpha = alpha;
			}

		},

		setBackground: function(color) {

			color = typeof color === 'string' ? color : '#000000';

			var background = this.__hexToRGB(color);

			this.__background.r = background.r / 255;
			this.__background.g = background.g / 255;
			this.__background.b = background.b / 255;

		},



		/*
		 * Drawing API
		 */

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000000';
			background = background === true ? true : false;
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			gl.matrixMode(gl.MODELVIEW);
			gl.loadIdentity();


			var rgb_color = this.__hexToRGB(color);

			gl.color4f(rgb_color.r / 255, rgb_color.g / 255, rgb_color.b / 255, this.__alpha);


			if (background === false) {

				// TOP BORDER
				gl.begin(gl.QUADS);
				gl.vertex2i(x1, y1);
				gl.vertex2i(x2, y1);
				gl.vertex2i(x2, y1 + lineWidth);
				gl.vertex2i(x1, y1 + lineWidth);
				gl.end();

				// RIGHT BORDER
				gl.begin(gl.QUADS);
				gl.vertex2i(x2 - lineWidth, y1 + lineWidth);
				gl.vertex2i(x2, y1 + lineWidth);
				gl.vertex2i(x2, y2 - lineWidth);
				gl.vertex2i(x2 - lineWidth, y2 - lineWidth);
				gl.end();

				// BOTTOM BORDER
				gl.begin(gl.QUADS);
				gl.vertex2i(x1, y2 - lineWidth);
				gl.vertex2i(x2, y2 - lineWidth);
				gl.vertex2i(x2, y2);
				gl.vertex2i(x1, y2);
				gl.end();

				// LEFT BORDER
				gl.begin(gl.QUADS);
				gl.vertex2i(x1, y1 + lineWidth);
				gl.vertex2i(x1 + lineWidth, y1 + lineWidth);
				gl.vertex2i(x1 + lineWidth, y2 - lineWidth);
				gl.vertex2i(x1, y2 - lineWidth);
				gl.end();

			} else {

				gl.begin(gl.QUADS);
				gl.vertex2i(x1, y1);
				gl.vertex2i(x2, y1);
				gl.vertex2i(x2, y2);
				gl.vertex2i(x1, y2);
				gl.end();

			}

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000000';
			background = background === true ? true : false;
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			gl.matrixMode(gl.MODELVIEW);
			gl.loadIdentity();


			var rgb_color = this.__hexToRGB(color);

			gl.color4f(rgb_color.r / 255, rgb_color.g / 255, rgb_color.b / 255, this.__alpha);


			if (background === false) {

				gl.begin(gl.LINE_STRIP);

				for (var a = 0; a <= 360; a+= 5) {

					var angle = a / 180 * Math.PI;
					gl.vertex2i(
						x + Math.sin(angle) * radius,
						y + Math.cos(angle) * radius
					);

				}

				gl.end();

			} else {

				gl.begin(gl.TRIANGLE_FAN);

				gl.vertex2i(x, y);

				for (var a = 0; a <= 360; a += 5) {

					var angle = a / 180 * Math.PI;

					gl.vertex2i(x + Math.sin(angle) * radius, y + Math.cos(angle) * radius);

				}

				gl.end();

			}

		},

		// TODO: Support lineWidth
		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			if (this.__state !== 'running') return;

			color = typeof color === 'string' ? color : '#000000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;

 			gl.matrixMode(gl.MODELVIEW);
			gl.loadIdentity();


			var rgb_color = this.__hexToRGB(color);

			gl.color4f(rgb_color.r / 255, rgb_color.g / 255, rgb_color.b / 255, this.__alpha);

			gl.begin(gl.LINES);

			gl.vertex2i(x1, y1);
			gl.vertex2i(x2, y2);

			gl.end();

		},

		drawSprite: function(x1, y1, texture, map) {

			if (this.__state !== 'running') return;

			map = Object.prototype.toString.call(map) === '[object Object]' ? map : null;


			if (this.__cache[texture.url] === undefined) {

				this.__cache[texture.url] = texture;
				this.__cache[texture.url].generate();

				if (lychee.debug === true) {
					console.log("lychee.Renderer: cached texture", texture.url, texture.width + "x" + texture.height);
				}

			}


			var sx1, sy1, sx2, sy2;
			var x2, y2;


			if (map === null) {

				x2 = x1 + texture.width;
				y2 = y1 + texture.height;

				// Note: Texture coordinate system is rotating
				// beginning from bottom left to top left.
				sx1 = 0.0; sy1 = 0.0;
				sx2 = 1.0; sy2 = 1.0;


				gl.matrixMode(gl.MODELVIEW);
				gl.loadIdentity();

				gl.color4f(1.0, 1.0, 1.0, this.__alpha);

				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

				gl.enable(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, texture.id);

				gl.begin(gl.QUADS);
				gl.texCoord2f(sx1, sy1);
				gl.vertex2f(x1, y1);
				gl.texCoord2f(sx2, sy1);
				gl.vertex2f(x2, y1);
				gl.texCoord2f(sx2, sy2);
				gl.vertex2f(x2, y2);
				gl.texCoord2f(sx1, sy2);
				gl.vertex2f(x1, y2);
				gl.end();

				gl.disable(gl.TEXTURE_2D);

			} else {

				x2 = x1 + map.w;
				y2 = y1 + map.h;


				sx1 = this.__translateToTexCoord(map.x, texture.width);
				sy1 = this.__translateToTexCoord(map.y, texture.height);

				sx2 = this.__translateToTexCoord(map.x + map.w, texture.width);
				sy2 = this.__translateToTexCoord(map.y + map.h, texture.height);


				gl.matrixMode(gl.MODELVIEW);
				gl.loadIdentity();

				gl.color4f(1.0, 1.0, 1.0, this.__alpha);

				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

				gl.enable(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, texture.id);

				gl.begin(gl.QUADS);
				gl.texCoord2f(sx1, sy1);
				gl.vertex2f(x1, y1);
				gl.texCoord2f(sx2, sy1);
				gl.vertex2f(x2, y1);
				gl.texCoord2f(sx2, sy2);
				gl.vertex2f(x2, y2);
				gl.texCoord2f(sx1, sy2);
				gl.vertex2f(x1, y2);
				gl.end();

				gl.disable(gl.TEXTURE_2D);


				if (lychee.debug === true) {

					this.drawBox(
						x1,
						y1,
						x1 + map.w,
						y1 + map.h,
						'#ff0000',
						false,
						1
					);

				}

			}

		},


		// TODO: Evaluate if native Font Rendering shall be supported.
		drawText: function(x, y, text, font, color) {

			if (this.__state !== 'running') return;

			var t, l;

			// sprite based rendering
			if (font instanceof lychee.Font) {

				var settings = font.getSettings();
				var sprite = font.getSprite();


				var chr;

				// Measure text if we have to center it later
				if (x === 'center' || y === 'center') {

					var width = 0,
						height = 0;

					for (t = 0, l = text.length; t < l; t++)  {
						chr = font.get(text[t]);
						width += chr.real + settings.kerning;
						height = Math.max(height, chr.height);
					}

					if (x === 'center') {
						x = (this.__width / 2) - (width / 2);
					}

					if (y === 'center') {
						y = (this.__height / 2) - (height / 2);
					}

				}


				var margin = 0;
				var x1, y1, x2, y2;
				var sx1, sy1, sx2, sy2;

				for (t = 0, l = text.length; t < l; t++) {

					var chr = font.get(text[t]);
					var texture = chr.sprite || sprite;


					if (this.__cache[texture.url] === undefined) {

						this.__cache[texture.url] = texture;
						this.__cache[texture.url].generate();

						if (lychee.debug === true) {
							console.log("lychee.Renderer: cached texture", texture.url, texture.width + "x" + texture.height);
						}

					}



					x1 = x + margin - settings.spacing;
					y1 = y + settings.baseline;
					x2 = x1 + chr.width;
					y2 = y1 + chr.height;


					sx1 = this.__translateToTexCoord(chr.x, texture.width);
					sy1 = this.__translateToTexCoord(chr.y, texture.height);

					sx2 = this.__translateToTexCoord(chr.x + chr.width, texture.width);
					sy2 = this.__translateToTexCoord(chr.y + chr.height, texture.height);


					gl.matrixMode(gl.MODELVIEW);
					gl.loadIdentity();

					gl.color4f(1.0, 1.0, 1.0, this.__alpha);

					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

					gl.enable(gl.TEXTURE_2D);
					gl.bindTexture(gl.TEXTURE_2D, texture.id);

					gl.begin(gl.QUADS);
					gl.texCoord2f(sx1, sy1);
					gl.vertex2f(x1, y1);
					gl.texCoord2f(sx2, sy1);
					gl.vertex2f(x2, y1);
					gl.texCoord2f(sx2, sy2);
					gl.vertex2f(x2, y2);
					gl.texCoord2f(sx1, sy2);
					gl.vertex2f(x1, y2);
					gl.end();

					gl.disable(gl.TEXTURE_2D);


					if (lychee.debug === true) {

						this.drawBox(
							x + margin,
							y,
							x + margin + chr.real,
							y + chr.height,
							'#ffff00',
							false,
							1
						);

					}

					margin += chr.real + settings.kerning;

				}

			// text based rendering
			} else if (Object.prototype.toString.call(font) === '[object Object]'){

				font.color = typeof font.color === 'string' ? font.color : '#000000';
				font.font = typeof font.font === 'string' ? font.font : 'Arial';
				font.size = typeof font.size === 'number' ? font.size : 12;

			}

		}

	};


	return Class;

});

