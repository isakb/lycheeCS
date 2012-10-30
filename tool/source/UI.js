
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

		this.__generator = new tool.UIGenerator(null);
		this.__generator.bind('ready', this.__render, this);
		this.__generator.bind('ready', this.__export, this);


		this.__lightbox = new ui.Lightbox('ui-lightbox', 'Exported UI Entity');
		ui.Main.get('main').add(this.__lightbox);


		this.__initUI();
		this.__refresh();

	};


	Class.prototype = {

		defaults: {

			type: 'button'

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

		__refresh: function(flag) {

			this.__exportFlag = flag === true ? true : false;

			ui.Main.get('log').clear();

			this.__generator.export(this.settings);

		},

		__render: function(data) {

			var viewport = ui.Main.get('viewport');

			viewport.clear();


			if (data.sprite) {
				viewport.add(data.sprite);
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

