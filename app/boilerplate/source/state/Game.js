
lychee.define('game.state.Game').requires([
	'game.Scene'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__renderer = this.game.renderer;

		this.__clock = 0;
		this.__locked = true;
		this.__drag = null;
		this.__scene = null;

	};


	Class.prototype = {

		__createEntity: function(raw) {

			if (raw.type === 'Tile') {

				raw.data.width = this.game.settings.width;
				raw.data.height = this.game.settings.height;
				raw.data.position.x *= raw.data.width;
				raw.data.position.y *= raw.data.height;

			} else if (raw.type === 'Text') {

				raw.data.font = this.game.fonts[raw.data.font];

			} else if (raw.type === 'Sprite') {

				raw.data.image = this.game.config.sprite.image;
				raw.data.states = this.game.config.sprite.states;
				raw.data.map = this.game.config.sprite.map;

			}

			var entity = null;
			if (lychee.ui[raw.type]) {

				entity = new lychee.ui[raw.type](raw.data);

				if (raw.id === 'exit') {

					entity.bind('touch', function() {
						this.game.setState('menu');
					}, this);

				}

			}


			return entity;

		},

		enter: function(scene) {

			scene = JSON.parse(JSON.stringify(scene));

			lychee.game.State.prototype.enter.call(this);


			var width = this.game.settings.width;
			var height = this.game.settings.height;


			this.__scene = new game.Scene(this.game);


			this.__nodes = {};
			for (var e = 0, l = scene.entities.length; e < l; e++) {

				var raw = scene.entities[e];
				var entity = this.__createEntity(raw);
				var parent = this.__nodes[raw.parent] || null;

				if (raw.id != null) {
					this.__nodes[raw.id] = this.__scene.add(entity, parent);
				} else {
					this.__scene.add(entity, parent);
				}

			}


			this.__scene.relayout();
			this.__scene.update(0, 0);

			this.__locked = true;

			// Wait for next update() call
			this.game.loop.timeout(0, function() {
				this.__locked = false;
			}, this);


			this.__input.bind('touch', this.__processTouch, this);
			this.__input.bind('swipe', this.__processSwipe, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('swipe', this.__processSwipe);
			this.__input.unbind('touch', this.__processTouch);

			this.__scene = null;


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			this.__clock = clock;


			if (this.__drag !== null) {
				this.__scene.setDragOffset(-this.__drag.offset.x, 0);
			}

			if (this.__scene !== null) {
				this.__scene.update(clock, delta);
			}

		},

		render: function(clock, delta) {

			if (this.__scene !== null) {
				this.__scene.render(clock, delta);
			}

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;

			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			var entity = this.__scene.getEntityByPosition(position.x, position.y, null, true);
			if (entity !== null && entity.hasEvent('touch')) {
				entity.trigger('touch', [ entity ]);
				return true;
			}


			return false;

		},

		__processSwipe: function(id, type, position, delta, swipe) {

			if (this.__locked === true) return;

			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			if (type === 'start') {

				this.__drag = {
					start: {
						x: position.x,
						y: position.y
					},
					offset: { x: 0, y : 0 }
				};

			} else if (this.__drag !== null && type === 'move') {

				this.__drag.offset.x = this.__drag.start.x - position.x;
				this.__drag.offset.y = this.__drag.start.y - position.y;

			} else if (this.__drag !== null && type === 'end') {

				var width = this.game.settings.width;
				var height = this.game.settings.height;

				var dragOffset = this.__scene.getDragOffset();
				var sceneOffset = this.__scene.getOffset();
				var tweenOffset = { x: sceneOffset.x, y: sceneOffset.y };


				this.__scene.setOffset({
					x: sceneOffset.x + dragOffset.x
				});


				if (Math.abs(this.__drag.offset.x) > width / 4) {

					if (dragOffset.x > 0) {
						tweenOffset.x += width;
					} else if (dragOffset.x < 0) {
						tweenOffset.x -= width;
					}


					var tile = this.__getTileByPosition(-tweenOffset.x + width / 2, height / 2);
					if (tile === null) {
						// Tween back from the initially set offset
						tweenOffset.x = this.__scene.getOffset().x - dragOffset.x;
					}

				}


				// Remember: drag offset is linked
				this.__scene.setDragOffset(0, 0);


				this.__scene.setTween(300, {
					x: tweenOffset.x,
					y: tweenOffset.y
				}, function() {
					this.__locked = false;
				}, this);


				this.__locked = true;
				this.__drag = null;

			}

		},

		__getTileByPosition: function(x, y) {

			if (this.__nodes !== null) {

				for (var id in this.__nodes) {

					var entity = this.__nodes[id].entity;
					if (entity !== null) {

						var position = entity.getPosition();
						if (position.x === x && position.y === y) {
							return entity;
						}

					}

				}

			}


			return null;

		}

	};


	return Class;

});
