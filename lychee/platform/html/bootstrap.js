
(function(lychee, global) {

	lychee.Preloader.prototype._load = function(url, type, _cache) {

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


		// 5. Unknown File Types (will be loaded as text)
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

	};

})(this.lychee, this);

