
(function(lychee, global) {

	var fs = require('fs');
	var _environment = null;


	lychee.Preloader.prototype._load = function(url, type, _cache) {

		var that = this;


		// 1. JavaScript
		if (type === 'js') {

			this.__pending[url] = false;
			_cache[url] = '';

			if (_environment !== null) {
				require(_environment + "/" + url);
			} else {
				require(url);
			}


		// 2. JSON
		} else if (type === 'json') {

			this.__pending[url] = true;

			fs.readFile(url, 'utf8', function(err, raw) {

				that.__pending[url] = false;

				if (err) {
					_cache[url] = false;
				} else {

					var data = null;
					try {
						data = JSON.parse(raw);
					} catch(e) {
						console.warn('JSON file at ' + url + ' is invalid.');
					}

					_cache[url] = data;

				}

			});


		// 3. Images
		} else if (type.match(/bmp|gif|jpg|jpeg|png/)) {

			this.__pending[url] = true;

			fs.readFile(url, 'binary', function(err, data) {

				that.__pending[url] = false;

				if (err) {
					_cache[url] = null;
				} else {
					_cache[url] = data;
				}

			});


		// 4. CSS (not requird in NodeJS)
		} else if (type === 'css') {

			this.__pending[url] = false;
			_cache[url] = '';


		// 5. Unknown File Types (will be loaded as text)
		} else {

			this.__pending[url] = true;

			fs.readFile(url, 'utf8', function(err, data) {

				that.__pending[url] = false;

				if (err) {
					_cache[url] = null;
				} else {
					_cache[url] = data;
				}

			});

		}

	};


	module.exports = function(env) {

		if (typeof env === 'string') {
			_environment = env;
		}

	};

})(lychee, global);

