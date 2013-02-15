
lychee.define('game.DeviceSpecificHacks').exports(function(lychee, global) {

	var _alreadyBound = false;
	var _orientation = 0;

	var Callback = function() {

		if (typeof global.navigator !== 'undefined') {

			if (global.navigator.appName === 'V8GL') {

				this.settings.fullscreen = true;

				_alreadyBound = true;

				return;

			} else if (global.navigator.userAgent.match(/iPad/)) {

				this.settings.fullscreen = true;

			} else if (global.navigator.userAgent.match(/Android/)) {

				if (_orientation !== 0) {
					// FIXME: What to do then? Crappy Android behaviours...
				}

				global.scrollTo(0, 1);

				this.settings.fullscreen = true;

			}

		}


		if (
			typeof global.addEventListener === 'function'
			&& _alreadyBound === false
		) {

			var that = this;

			global.addEventListener('orientationchange', function() {

				if (global.orientation === _orientation) {
					return;
				}

				_orientation = global.orientation;

				that.reset();

				// Renderer's viewport has changed, so reset the state itself
				var state = that.getState();
				state.leave && state.leave();
				state.enter && state.enter();

			});


			global.addEventListener('pagehide', function() {

			});

			global.addEventListener('pageshow', function() {

			});


			_alreadyBound = true;

		}

	};

	return Callback;

});
