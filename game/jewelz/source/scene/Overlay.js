
lychee.define('game.scene.Overlay').includes([
	'lychee.ui.Graph'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.game = game;

		this.__loop = game.loop;
		this.__root = null;
		this.__visible = true;

		lychee.ui.Graph.call(this, game.renderer);


		this.reset(settings);

	};


	Class.prototype = {

		reset: function(data) {

			if (this.__root === null) {

				this.__root = this.add(new lychee.ui.Tile({
					color: '#222222',
					width: data.width,
					height: data.height,
					position: {
						x: data.position.x,
						y: data.position.y
					}
				}));


				this.__intro = this.add(new lychee.ui.Text({
					text: '3',
					font: this.game.fonts.headline,
					position: {
						x: 0, y: 0
					}
				}), this.__root).entity;

			} else {

				this.__root.width  = data.width;
				this.__root.height = data.height;
				this.__root.setPosition(data.position);

			}

		},

		enter: function() {

			if (this.game.settings.sound === true) {
				this.game.jukebox.play('countdown');
			}


			this.__visible = true;

			this.__loop.timeout(0, function(clock, delta) {
				this.__intro.set('3');
			}, this);

			this.__loop.timeout(1000, function() {
				this.__intro.set('2');
			}, this);

			this.__loop.timeout(2000, function() {
				this.__intro.set('1');
			}, this);

			this.__loop.timeout(3000, function() {
				this.__intro.set('Go!');
			}, this);

			this.__loop.timeout(4000, function() {
				this.__visible = false;
			}, this);

		},

		leave: function() {

		},

		render: function() {

			if (this.__visible === true) {

				this.__renderNode(
					this.__tree,
					this.__offset.x,
					this.__offset.y
				);

			}

		},

		isVisible: function() {
			return this.__visible === true;
		},



		/*
		 * PRIVATE API
		 */

		__renderNode: function(node, offsetX, offsetY) {

			if (node.entity !== null) {

				if (node === this.__root) {
					this.__renderer.setAlpha(0.5);
				}

				this.__renderer.renderUIEntity(node.entity, offsetX, offsetY);

				offsetX += node.entity.getPosition().x;
				offsetY += node.entity.getPosition().y;


				if (node === this.__root) {
					this.__renderer.setAlpha(1);
				}

			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				this.__renderNode(node.children[c], offsetX, offsetY);
			}

		}

	};


	return Class;

});

