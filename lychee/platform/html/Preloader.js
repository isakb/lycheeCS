
// Preloader is platform specific and required for lychee.Builder
(function(lychee, global) {

	var _instances = [];
	var _cache = {};


	var _globalIntervalId = null;
	var _globalInterval   = function() {

		var timedOutInstances = 0;

		for (var i = 0, l = _instances.length; i < l; i++) {

			var instance = _instances[i];
			var isReady  = true;

			for (var url in instance.__pending) {
				if (
					instance.__pending[url] === true
					|| _cache[url] === undefined
				) {
					isReady = false;
				}
			}


			var timedOut = false;
			if (instance.__clock !== null) {
				timedOut = Date.now() >= instance.__clock + instance.__timeout;
			}


			if (isReady === true || timedOut === true) {

				var errors = {};
				var ready  = {};
				var map    = {};

				for (var url in instance.__pending) {

					if (instance.__fired[url] === undefined) {

						if (instance.__pending[url] === false) {

							ready[url] = _cache[url] || null;
							map[url] = instance.__map[url] || null;

						} else {
							errors[url] = null;
						}

						instance.__fired[url] = true;

					}

				}


				if (Object.keys(errors).length > 0) {
					instance.trigger('error', [ errors ]);
				}


				if (Object.keys(ready).length > 0) {
					instance.trigger('ready', [ ready, map ]);
				}


				// Reset the clock if the lychee.Preloader timed out
				if (timedOut === true) {
					timedOutInstances++;
				}

			}

		}


		if (timedOutInstances === _instances.length) {

			if (lychee.debug === true) {
				console.log('lychee.Preloader: Nothing to do, switching to idle mode.');
			}

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__clock = null;
			}

			global.clearInterval(_globalIntervalId);
			_globalIntervalId = null;

		}

	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		settings.timeout  = typeof settings.timeout === 'number' ? settings.timeout : this.defaults.timeout;


		this.__timeout  = settings.timeout;

		this.__events  = {};
		this.__fired   = {}; // cached fired events per request
		this.__map     = {}; // associated data per request
		this.__pending = {}; // pending requests
		this.__clock   = null;


		_instances.push(this);


		settings = null;

	};


	Class.prototype = {

		defaults: {
			timeout: 3000
		},



		/*
		 * EVENT BINDINGS
		 *
		 * (not using lychee.Events
		 *  due to no-dependency
		 *  reasons)
		 */

		bind: function(event, callback, scope) {

			event = typeof event === 'string' ? event : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : this;


			if (event !== null && callback !== null) {

				this.__events[event] = {
					callback: callback,
					scope: scope
				};

			}

		},

		unbind: function(event) {

			event = typeof event === 'string' ? event : null;


			if (event !== null && this.__events[event] !== undefined) {
				delete this.__events[event];
				return true;
			}


			return false;

		},

		trigger: function(event, args) {

			args = Object.prototype.toString.call(args) === '[object Array]' ? args : [];


			if (this.__events[event] !== undefined) {
				this.__events[event].callback.apply(this.__events[event].scope, args);
				return true;
			}


			return false;

		},



		/*
		 * PUBLIC API
		 */

		load: function(urls, map, forced) {

			urls = typeof urls === 'string' ? [ urls ] : urls;
			map = map !== undefined ? map : null;
			forced = typeof forced === 'string' ? forced : null;


			if (Object.prototype.toString.call(urls) !== '[object Array]') {
				return false;
			}


			this.__clock = Date.now();


			// 1. Load the assets via platform-specific APIs
			for (var u = 0, l = urls.length; u < l; u++) {

				var url = urls[u];
				var tmp = url.split(/\./);


				if (this.__pending[url] === undefined) {

					if (map !== null) {
						this.__map[url] = map;
					}


					// 1.1 Check if another lychee.Preloader
					// instance already loaded the requested
					// URL to the shared cache.

					if (_cache[url] != null) {

						this.__pending[url] = false;

					} else {

						if (forced !== null) {
							this._load(url, forced);
						} else {
							this._load(url, tmp[tmp.length - 1]);
						}

					}

				}

			}


			// 2. Start the global interval
			if (_globalIntervalId === null) {
				_globalIntervalId = global.setInterval(function() {
					_globalInterval();
				}, 100);
			}

		},

		get: function(url) {

			if (_cache.resource[url] !== undefined) {
				return _cache.resource[url];
			}


			return null;

		},



		/*
		 * PLATFORM-SPECIFIC Implementation
		 */

		_load: function(url, type) {

			var that = this;


			// 1. JavaScript
			if (type === 'js') {

				this.__pending[url] = true;

				var script = document.createElement('script');
				script.async = true;
				script.onload = function() {
					that.__pending[url] = false;
					_cache[url] = '';
				};
				script.src = url;

				document.body.appendChild(script);


			// 2. JSON
			} else if (type === 'json') {

				this.__pending[url] = true;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');
				xhr.onreadystatechange = function() {

					if (xhr.readyState === 4) {

						var data = null;
						try {
							data = JSON.parse(xhr.responseText);
						} catch(e) {
							console.warn('JSON file at ' + url + ' is invalid.');
						}

						that.__pending[url] = false;
						_cache[url] = data;

					}

				};

				xhr.send(null);


			// 3. Images
			} else if (type.match(/bmp|gif|jpg|jpeg|png/)) {

				this.__pending[url] = true;

				var img = new Image();
				img.onload = function() {
					that.__pending[url] = false;
					_cache[url] = this;
				};
				img.src = url;


			// 4. CSS (won't affect JavaScript anyhow)
			} else if (type === 'css') {

				this.__pending[url] = false;
				_cache[url] = '';

				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = url;

				document.head.appendChild(link);


			// 5. Unknown File Types (will be load as text)
			} else {

				this.__pending[url] = true;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function() {

					if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 304) {

						var data = xhr.responseText || xhr.responseXML || null;

						that.__pending[url] = false;
						_cache[url] = data;

					}

				};

				xhr.send(null);

			}

		}

	};


	lychee.Preloader = Class;

})(this.lychee, this);

