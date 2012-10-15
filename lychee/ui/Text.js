
lychee.define('lychee.ui.Text').requires([
	'lychee.Font'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		this.font = settings.font || null;

		this.set(settings.text);

		settings.width = this.width;
		settings.height = this.height;

		delete settings.text;
		delete settings.font;


		lychee.ui.Entity.call(this, settings);

	};


	Class.prototype = {

		get: function() {
			return this.text;
		},

		set: function(text) {

			text = typeof text === 'string' ? text : '';


			this.text = text;

			if (this.font instanceof lychee.Font) {

				var fs = this.font.getSettings();
				var width = 0;
				var height = 0;

				for (var t = 0, l = this.text.length; t < l; t++) {
					var chr = this.font.get(this.text[t]);
					width += chr.real + fs.kerning;
					height = Math.max(height, chr.height);
				}

				this.width = width;
				this.height = height;

			}

		}

	};


	return Class;

});

