
lychee.define('lychee.ui.Button').requires([
	'lychee.ui.Label'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__label = null;

		if (settings.label != null && settings.label instanceof lychee.ui.Label) {
			this.__label = settings.label;
		} else {
			throw "settings.label needs to be a lychee.ui.Label instance.";
		}


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		getLabel: function() {
			return this.__label;
		}

	};


	return Class;

});
