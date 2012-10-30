
lychee.define('tool.UIGenerator').tags({
	platform: 'html'
}).requires([
	'lychee.ui.Button',
	'lychee.ui.Text',
	'lychee.ui.Sprite'
]).includes([
	'lychee.Events',
	'lychee.ui.Renderer'
]).exports(function(lychee, global) {

	var Class = function() {

		lychee.ui.Renderer.call(this, 'uigenerator');
		lychee.Events.call(this, 'uigenerator');

	};


	Class.prototype = {

		export: function(data) {

			var settings = lychee.extend({}, this.defaults, data);


			var element = document.createElement('div');

			// serialize the DOM node to a String

			// Create well formed data URL with our DOM string wrapped in SVG

			// create new, actual image
			var img = new Image();
			img.src = dataUri;

			// when loaded, fire onload callback with actual image node
			img.onload = function() {
				if(callback) {
					callback.call(this, this);
				}
			};



console.log('exporting...', settings);

		},



		/*
		 * PRIVATE API
		 */

		__render: function(settings, callback, scope) {

			var element = document.createElement('div');

			element.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

			var serialized = new XMLSerializer().serializeToString(elem);


			var x1 = 10;
			var y1 = 10;
			var width = 100;
			var height = 100;

			var svgdata = "data:image/svg+xml," +
				"<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "'>" +
					"<foreignObject width='100%' height='100%' x='" + x1 + "' y='" + y1 + "'>" +
					serialized +
					"</foreignObject>" +
				"</svg>";


			var image = new Image();
			image.src = svgdata;

			callback.call(scope, image);

		}

	};


	return Class;

});
