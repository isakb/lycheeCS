
lychee.define('tool.UI').requires([
	'tool.UIGenerator',
	'ui.Main',
	'ui.Button',
	'ui.Input',
	'ui.Lightbox',
	'ui.Option',
	'ui.Radios',
	'ui.Select',
	'ui.Textarea'
]).exports(function(lychee, global) {


	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__exportFlag = false;
		this.__templates = {
			button: '',
			input:  ''
		};

		this.__generator = new tool.UIGenerator(null);
		this.__generator.bind('ready', this.__render, this);
		this.__generator.bind('ready', this.__export, this);

		this.__lightbox = new ui.Lightbox('ui-lightbox', 'Exported UI Entity');
		ui.Main.get('main').add(this.__lightbox);


		var templates = [
			'./asset/ui/button.css'
		];


		this.__preloader = new lychee.Preloader();

		this.__preloader.bind('ready', function(assets) {

			this.__templates.button = assets[templates[0]];

			this.__initUI();
			this.__refresh();

		}, this);

		this.__preloader.bind('error', function(urls) {

			if (lychee.debug === true) {
				console.warn('Preloader error for these urls: ', urls);
			}

		}, this);


		this.__preloader.load(templates, null, 'txt');

	};


	Class.prototype = {

		defaults: {

			type: 'button',
			width: 100,
			height: 100

		},



		/*
		 * PRIVATE API
		 */
		__initUI: function() {

			var select = null;
			var options = null;


			var navi = ui.Main.get('navi');

			select = new ui.Select(function(value) {
				this.settings.type = value;
				this.__refresh();
			}, this);

			new ui.Option('lychee.ui.Button', 'button').addTo(select);
			new ui.Option('lychee.ui.Sprite', 'sprite').addTo(select);
			new ui.Option('lychee.ui.Tile',   'tile').addTo(select);

			select.set(this.settings.type);

			navi.add('Type', select);


			navi.add('Width', new ui.Input('number', this.settings.width, function(value) {
				this.settings.width = value;
				this.__refresh();
			}, this));

			navi.add('Height', new ui.Input('number', this.settings.height, function(value) {
				this.settings.height = value;
				this.__refresh();
			}, this));

			navi.add('Debug Mode', new ui.Radios([ 'on', 'off' ], 'off', function(value) {

				if (value === 'on') {

					lychee.debug = true;
					ui.Main.get('log').show();

				} else {

					lychee.debug = false;
					ui.Main.get('log').clear();
					ui.Main.get('log').hide();

				}

			}, this));

			this.__textarea = new ui.Textarea(this.__templates.button, function(value) {

				var rulesets = this.__parse(value);

				// TODO: Make UIGenerator compatible with multiple layers
				this.settings.rules = rulesets.background;
				this.__refresh();

			}, this);

			navi.add(null, this.__textarea);


			var actions = document.createElement('div');
			actions.className = 'ui-actions';

			var refresh = new ui.Button('refresh', function() {
				this.__refresh();
			}, this);
			refresh.__element.className = 'cancel';
			refresh.addTo(actions);

			new ui.Button('export', function() {
				this.__refresh(true);
			}, this).addTo(actions);

			navi.add(null, actions);

		},



		/*
		 * PRIVATE API
		 */

		__parse: function(code) {

			var lines = code.split('\n');


			var cache   = { 'default': {} };
			var ruleset = cache['default'];

			for (var l = 0, ll = lines.length; l < ll; l++) {

				var line = lines[l].replace(/^\s+/,'').replace(/\s+$/,'');

				if (line === '') continue;


				if (line.substr(0,1) === '#') {

					var id = line.replace(/\{/,'').replace(/\s+$/,'').substr(1);
					cache[id] = {};
					ruleset = cache[id];

					continue;

				} else if (line === '}') {

					continue;

				} else {

					var simple = line.match(/([A-Za-z0-9\-]+)\:\s([A-Za-z0-9\#\s]+)\;/);
					var parameters = line.match(/([A-Za-z0-9\-]+)\:\s([A-Za-z0-9]+)\((([0-9\s?\.?]+\,?){1,4})\)\;/);

					if (simple) {
						ruleset[simple[1]] = simple[2];
					} else if (parameters) {
						ruleset[parameters[1]] = parameters[2] + '(' + parameters[3] + ')';
					} else if (line.substr(0,5) === '-css-') {

						var dotpos = line.indexOf(':');
						var property = line.substr(5, dotpos - 5);
						var value = line.substr(dotpos + 1).replace(/\;/,'').replace(/^\s+/,'').replace(/\s+$/,'');

						ruleset[property] = value;

					} else {
						console.warn('Could not interpret line: ', line);
					}

				}

			}


			return cache;

		},

		__refresh: function(flag) {

			this.__exportFlag = flag === true ? true : false;

			ui.Main.get('log').clear();

			this.__generator.export(this.settings);

		},

		__render: function(data) {

			var viewport = ui.Main.get('viewport');

			viewport.clear();


			if (data.png !== null) {
				viewport.add(data.png);
			}

		},

		__export: function(data) {

			if (this.__exportFlag === true) {

				this.__lightbox.set(null);


				// TODO: Show exported lychee.ui entity usage and its settings


				this.__lightbox.show();


				this.__refresh();

			}

		}

	}


	return Class;

});

