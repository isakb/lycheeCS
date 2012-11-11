
lychee.define('tool.UIGenerator').tags({
	platform: 'html'
}).requires([
	'lychee.ui.Button',
	'lychee.ui.Text',
	'lychee.ui.Sprite'
]).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var Class = function() {

		this.__canvas = document.createElement('canvas');
		this.__context = this.__canvas.getContext('2d');

		lychee.Events.call(this, 'uigenerator');

	};


	Class.prototype = {

		defaults: {
			offset: { x: 0, y: 0 },
			width: 100,
			height: 100
		},

		export: function(data) {

			var settings = lychee.extend({}, this.defaults, data);

			this.__render(settings, function(svg, png) {

				this.trigger('ready', [ {
					svg: svg,
					png: png
				} ]);

			}, this);

		},



		/*
		 * PRIVATE API
		 */

		__render: function(settings, callback, scope) {

			var element = document.createElement('div');

			if (Object.prototype.toString.call(settings.rules) === '[object Object]') {

				for (var property in settings.rules) {
					element.style.setProperty(property, settings.rules[property]);
				}

			}

			element.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");


			var serialized = new XMLSerializer().serializeToString(element);

			var x = settings.offset.x;
			var y = settings.offset.y;
			var width = settings.width;
			var height = settings.height;


			this.__canvas.width = width;
			this.__canvas.height = height;


			var svgdata = "data:image/svg+xml," +
				"<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "'>" +
					"<foreignObject width='100%' height='100%' x='" + x + "' y='" + y + "'>" +
					serialized +
					"</foreignObject>" +
				"</svg>";


			if (lychee.debug === true) {

				var copy = new Image();
				copy.src = svgdata;

				ui.Main.get('log').add(copy);

			}


			var svg = new Image();
			svg.src = svgdata;


			var that = this;

			svg.onload = function() {

				that.__context.drawImage(svg, 0, 0);


				var pngdata = that.__canvas.toDataURL('image/png');

				var png = new Image();
				png.src = pngdata;

				png.onload = function() {
					callback.call(scope, svg, png);
				};

			};

		}

	};


	return Class;

});
