
lychee.define('game.entity.Jewel').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		this.__lastStateId = null;

		lychee.game.Sprite.call(this, settings);

	};


	Class.prototype = {

		getRandomState: function() {

			if (this.__lastStateId === null) {

				this.__lastStateId = 0;

				for (var id in this.__states) {
					if (this.__states[id] > this.__lastStateId) {
						this.__lastStateId = this.__states[id];
					}
				}

			}


			var rand = Math.random() * this.__lastStateId | 0;
			var found = "default";

			for (var id in this.__states) {
				if (this.__states[id] === rand) {
					found = id;
				}
			}


			return found;

		}

	};


	return Class;

});

