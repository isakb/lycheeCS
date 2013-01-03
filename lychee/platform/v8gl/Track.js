
lychee.define('Track').tags({
	platform: 'v8gl'
}).supports(function(lychee, global) {

	if (global.navigator && global.navigator.appName === 'V8GL') {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var Class = function(id, settings, isReady) {

	};



	Class.prototype = {

		defaults: {
			base: null,
			buffer: null,
			formats: []
		},



		/*
		 * PUBLIC API
		 */
		play: function(loop) {
		},

		stop: function() {
		},

		pause: function() {
		},

		resume: function() {
		},

		mute: function() {
		},

		unmute: function() {
		},

		clone: function() {
		},

		isIdle: function() {
		},

		isMuted: function() {
		},

		isReady: function() {
		},

		getVolume: function() {
		},

		setVolume: function(volume) {
		}

	};


	return Class;

});

