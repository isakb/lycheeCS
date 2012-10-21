
lychee.define('lychee.game.Loop').includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _globalIntervalId = null,
		_timeoutId = 0,
		_intervalId = 0;

	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.__timeouts = {};
		this.__intervals = {};

		lychee.Events.call(this, 'loop');


		this.reset(settings.update, settings.render);

		settings = null;

	};


	Class.prototype = {

		reset: function(updateFps, renderFps) {

			updateFps = typeof updateFps === 'number' ? updateFps : null;
			renderFps = typeof renderFps === 'number' ? renderFps : null;


			if (
				updateFps === null || renderFps === null
				|| updateFps < 1 || renderFps < 1
			) {
				return false;
			}


			this.__clock = {
				start: Date.now(),
				update: 0,
				render: 0
			};

			this.__ms = {
				update: 1000 / updateFps,
				render: 1000 / renderFps
			};


			this.__updateFps = updateFps;
			this.__renderFps = renderFps;


			this.__setup();


			return true;

		},

		start: function() {
			this.__state = 'running';
		},

		stop: function() {
			this.__state = 'stopped';
		},

		timeout: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _timeoutId++;
			this.__timeouts[id] = {
				start: this.__clock.update + delta,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__timeouts[id] = null;
				}
			};

		},

		interval: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _intervalId++;
			this.__intervals[id] = {
				start: this.__clock.update + delta,
				delta: delta,
				step: 0,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__intervals[id] = null;
				}
			};

		},



		/*
		 * PROTECTED API
		 */

		_renderLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.render;
			if (delta >= this.__ms.render) {
				this.trigger('render', [ clock, delta ]);
				this.__clock.render = clock;
			}


		},

		_updateLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.update;
			if (
				delta >= this.__ms.update
				|| this.__ms.min === this.__ms.update
			) {
				this.trigger('update', [ clock, delta ]);
				this.__clock.update = clock;
			}


			var data;
			for (var iId in this.__intervals) {

				data = this.__intervals[iId];

				// Skip cleared intervals
				if (data === null) continue;

				var curStep = Math.floor((clock - data.start) / data.delta);
				if (curStep > data.step) {
					data.step = curStep;
					data.callback.call(data.scope, clock - data.start, curStep);
				}

			}


			for (var tId in this.__timeouts) {

				data = this.__timeouts[tId];

				// Skip cleared timeouts
				if (data === null) continue;

				if (clock >= data.start) {
					this.__timeouts[tId] = null;
					data.callback.call(data.scope, clock);
				}

			}

		},



		/*
		 * PRIVATE API
		 */

		__setup: function() {

			if (_globalIntervalId !== null) {
				global.clearInterval(_globalIntervalId);
			}


			this.__ms.min = this.__ms.update < this.__ms.render ? this.__ms.update : this.__ms.render;

			var that = this;

			_globalIntervalId = global.setInterval(function() {

				var clock = Date.now() - that.__clock.start;
				that._updateLoop(clock);
				that._renderLoop(clock);


			}, this.__ms.min);

		}

	};


	return Class;

});

