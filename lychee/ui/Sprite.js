
lychee.define('lychee.ui.Sprite').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__image = null;
		this.__map = null;


		// No Texture or Image validation
		if (settings.image !== undefined) {
			this.__image = settings.image;
		}

		if (
			Object.prototype.toString.call(settings.map) === '[object Object]'
		) {
			this.__map = settings.map;
		}

		delete settings.image;
		delete settings.map;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var w = this.__map[this.getState()].width;
				var h = this.__map[this.getState()].height;

				if (w !== undefined && typeof w === 'number') {
					this.width = w;
				}

				if (h !== undefined && typeof h === 'number') {
					this.height = h;
				}

			}


			return result;

		},

		getImage: function() {
			return this.__image;
		},

		getMap: function() {

			var state = this.getState();
			var frame = this.getFrame();


			if (
				this.__map[state] != null
				&& this.__map[state].frames != null
				&& this.__map[state].frames[frame] != null
			) {
				return this.__map[state].frames[frame];
			}


			return null;

		}

	};


	return Class;

});
