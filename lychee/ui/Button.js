
lychee.define('lychee.ui.Button').requires([
	'lychee.ui.Sprite',
	'lychee.ui.Text'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__background = null;
		this.__label = null;

		if (
			typeof settings.background === 'object'
			&& settings.background instanceof lychee.ui.Sprite
		) {
			this.__background = settings.background;
		}

		if (
			typeof settings.label === 'object'
			&& settings.label instanceof lychee.ui.Text
		) {
			this.__label = settings.label;
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
		}

	};


	return Class;

});
