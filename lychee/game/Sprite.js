
lychee.define('lychee.game.Sprite').includes([
	'lychee.game.Entity'
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


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		setState: function(id) {

			var result = lychee.game.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var map = this.__map[this.getState()] || null;
				if (map !== null) {

					if (map.width !== undefined && typeof map.width === 'number') {
						this.width = map.width;
					}

					if (map.height !== undefined && typeof map.height === 'number') {
						this.height = map.height;
					}

					if (map.radius !== undefined && typeof map.radius === 'number') {
						this.radius = map.radius;
					}

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

