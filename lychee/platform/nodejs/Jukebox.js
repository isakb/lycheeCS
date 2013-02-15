
lychee.define('Jukebox').tags({
	platform: 'nodejs'
}).requires([
	'lychee.Track'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var Class = function(maxPoolSize) {

		this.__map = {};

	};


	Class.prototype = {

		add: function(track) {

			if (track instanceof lychee.Track) {
				this.__map[track.id] = {
					muted:   false,
					playing: false
				};
			}

		},

		play: function(id, loop) {

			if (this.__map[id] !== undefined) {
				this.__map[id].playing = true;
				return true;
			}


			return false;

		},

		toggle: function(id, loop) {

			if (this.__map[id] !== undefined) {

				if (this.__map[id].playing === true) {
					this.__map[id].playing = false;
				} else {
					this.__map[id].playing = true;
				}

				return true;

			}


			return false;

	   	},

		stop: function(id) {

			if (id === null) {

				for (var id in this.__map) {
					this.__map[id].playing = false;
				}

				return true;

			} else if (this.__map[id] !== undefined) {
				this.__map[id].playing = false;
				return true;
			}


			return false;

		},

		mute: function(id) {

			if (id === null) {

				for (var id in this.__map) {
					this.__map[id].muted = true;
				}

				return true;

			} else if (this.__map[id] !== undefined) {
				this.__map[id].muted = true;
				return true;
			}


			return false;

		},

		unmute: function(id) {

			if (id === null) {

				for (var id in this.__map) {
					this.__map[id].muted = false;
				}

				return true;

			} else if (this.__map[id] !== undefined) {
				this.__map[id].muted = false;
				return true;
			}


			return false;

		},

		isMuted: function(id) {

			var found = false;

			if (id === null) {

				for (var id in this.__map) {
					if (this.__map[id].muted === true) {
						found = true;
						break;
					}
				}

			} else if (this.__map[id] !== undefined) {

				found = this.__map[id].muted === true;

			}


			return found;

		},

		isPlaying: function(id) {

			var found = false;

			if (id === null) {

				for (var id in this.__map) {
					if (this.__map[id].playing === true) {
						found = true;
						break;
					}
				}

			} else if (this.__map[id] !== undefined) {

				found = this.__map[id].playing === true;

			}


			return found;

		},

		getVolume: function(id) {
			return 0;
		},

		setVolume: function(id, volume) {

			if (
				id === null
				|| this.__map[id] !== undefined
			) {
				return true;
			}


			return false;

		}

	};


	return Class;

});

