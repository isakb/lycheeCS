
lychee.define('Track').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	// This is a stub implementation, so it does simply nothing
	return true;

}).exports(function(lychee, global) {

	if (lychee.debug === true) {
		console.log("lychee.Track: Supported media formats are NONE");
	}



	var Class = function(id, settings, isReady) {

		// isReady = isReady === true ? true : false;


		this.id = id;
		this.settings = lychee.extend({}, this.defaults, settings);

		this.__isIdle = true;
		this.__isLooping = false;
		this.__isMuted = false;
		this.__isReady = true;

	};


	Class.prototype = {

		defaults: {
			base: null,
			formats: []
		},



		/*
		 * PUBLIC API
		 */

		play: function(loop) {

			loop = loop === true ? true : false;


			if (this.__isReady === true) {
				this.__isIdle = true; // Nothing to do, so it's idling
				this.__isLooping = loop;
			}

		},

		stop: function() {
			this.__isIdle = true;
			this.__isLooping = false;
		},

		pause: function() {},

		resume: function() {},

		mute: function() {

			if (this.__isMuted === false) {
				this.__isMuted = true;
				return true;
			}

			return false;

		},

		unmute: function() {

			if (this.__isMuted === true) {
				this.__isMuted = false;
				return true;
			}

			return false;

		},

		getVolume: function() {
			return 0;
		},

		setVolume: function(volume) {
			return true;
		},

		clone: function() {

			var id = this.id;
			var settings = lychee.extend({}, this.settings);

			return new lychee.Track(id, settings, true);

		},

		isIdle: function() {
			return this.__isIdle;
		},

		isMuted: function() {
			return this.__isMuted;
		},

		isReady: function() {
			return this.isIdle() && this.__isReady === true;
		}

	};


	return Class;

});

