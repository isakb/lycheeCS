
lychee.define('lychee.ui.Button').requires([
	'lychee.ui.Sprite',
	'lychee.ui.Text'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.__background = null;
		this.__label = null;

		settings.width = 0;
		settings.height = 0;


		if (
			settings.background != null
		) {

			this.__background = settings.background;

			if (settings.background.width > settings.width) {
				settings.width = settings.background.width;
			}

			if (settings.background.height > settings.height) {
				settings.height = settings.background.height;
			}

		}


		if (settings.label != null) {

			this.__label = settings.label;

			if (settings.label.width > settings.width) {
				settings.width = settings.label.width;
			}

			if (settings.label.height > settings.height) {
				settings.height = settings.label.height;
			}

		}


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		getBackground: function() {
			return this.__background;
		},

		getLabel: function() {
			return this.__label;
		},

		update: function(clock, delta) {

			if (this.__label !== null) {
				this.__label.update(clock, delta);
			}

			if (this.__background !== null) {
				this.__background.update(clock, delta);
			}

		}

	};


	return Class;

});
