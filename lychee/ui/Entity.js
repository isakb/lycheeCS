
lychee.define('lychee.ui.Entity').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__layout = null;
		this.__value = null;
		this.___events = {};


		if (settings.layout) {
			this.setLayout(settings.layout);
			delete settings.layout;
		}


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		hasEvent: function(type) {

			if (this.___events[type] === undefined) {
				return false;
			}

			if (this.___events[type].length === 0) {
				return false;
			}

			return true;

		},

		bind: function(type, callback, scope) {

			if (this.___events[type] === undefined) {
				this.___events[type] = [];
			}


			this.___events[type].push({
				callback: callback,
				scope: scope || global
			});

		},

		unbind: function(type, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : null;

			if (this.___events[type] === undefined) {
				return true;
			}

			var found = false;

			for (var i = 0, l = this.___events[type].length; i < l; i++) {

				var entry = this.___events[type][i];

				if (
					(callback === null || entry.callback === callback)
					&& (scope === null || entry.scope === scope)
				) {
					found = true;
					this.___events[type].splice(i, 1);
					l--;
				}

			}


			return found;

		},

		trigger: function(type, data) {

			var passData = data;
			if (data === undefined || Object.prototype.toString.call(data) !== '[object Array]') {
				passData = [ this, this.__value ];
			}


			var success = false;

			if (this.___events[type] !== undefined) {

				for (var i = 0, l = this.___events[type].length; i < l; i++) {

					var entry = this.___events[type][i];
					entry.callback.apply(entry.scope, passData);

				}

				success = true;

			}


			return success;

		},

		relayout: function(parent) {

			var cache = this.__cache.position;

			var hwidth = parent.width / 2;
			var hheight = parent.height / 2;


			var layout = this.__layout;
			if (layout !== null) {

				if (layout.position === 'relative') {

					if (layout.x >= -1 && layout.x <= 1) {
						cache.x = layout.x * hwidth;
					}

					if (layout.y >= -1 && layout.y <= 1) {
						cache.y = layout.y * hheight;
					}

				} else if (layout.position === 'absolute') {

					if (layout.x >= -hwidth && layout.x <= hwidth) {
						cache.x = layout.x;
					}

					if (layout.y >= -hheight && layout.y <= hheight) {
						cache.y = layout.y;
					}

				}


				this.setPosition(cache);

			}

		},

		getValue: function() {
			return this.__value;
		},

		setValue: function(value) {
			this.__value = value;
		},

		getLabel: function() {
			return null;
		},

		getLayout: function() {
			return this.__layout;
		},

		setLayout: function(layout) {

			if (this.__layout === null) {

				this.__layout = {
					position: 'absolute',
					x: 0, y: 0
				};

			}


			if (Object.prototype.toString.call(layout) !== '[object Object]') {
				return false;
			}


			this.__layout.position = typeof layout.position === 'string' ? layout.position : this.__layout.position;
			this.__layout.x        = typeof layout.x === 'number' ? layout.x : this.__layout.x;
			this.__layout.y        = typeof layout.y === 'number' ? layout.y : this.__layout.y;


			return true;

		}

	};


	return Class;

});
