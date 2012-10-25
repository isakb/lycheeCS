
lychee.define('game.state.Result').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var _entityId = 0;

	var Class = function(game) {

		lychee.game.State.call(this, game, 'result');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__locked = true;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			this.__entities = {};

			var hwidth = this.game.settings.width / 2;
			var hheight = this.game.settings.height / 2;

			var font = this.game.fonts.headline;
			if (hwidth < 200) {
				font = this.game.fonts.normal;
			}


			this.__entities.headline = new lychee.ui.Text({
				text: 'Game Over',
				font: font,
				position: {
					x: 0,
					y: -hheight - 60
				}
			});

			this.__entities.points = new lychee.ui.Text({
				text: '0 Points',
				font: font,
				position: {
					x: 0,
					y: hheight + 50
				}
			});

			this.__entities.hint = new lychee.ui.Text({
				text: 'Touch to get back to Menu',
				font: this.game.fonts.small,
				position: {
					x: 0,
					y: hheight + 50
				}
			});

		},

		enter: function(data) {

			if (Object.prototype.toString.call(data) === '[object Object]') {
				data.points	= (data.points === null ? 0 : data.points) + '';
			}


			lychee.game.State.prototype.enter.call(this);

			this.__locked = true;


			var hwidth = this.game.settings.width / 2;
			var hheight = this.game.settings.height / 2;


			this.__entities.headline.setPosition({
				y: -hheight - 60
			});
			this.__entities.headline.setTween(2000, {
				y: -60
			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			this.__entities.points.set(data.points + ' Points');
			this.__entities.points.setPosition({
				y: hheight + 50
			});
   			this.__entities.points.setTween(2000, {
   				y: 0
   			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			this.__entities.hint.setPosition({
				y: hheight + 50
			});

			this.__loop.timeout(3000, function() {

				this.__entities.hint.setTween(500, {
					y: hheight - 20
				}, lychee.game.Entity.TWEEN.easeOut);

				this.__locked = false;

			}, this);

			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__entities[e].update(clock, delta);
			}

		},

		render: function(clock, delta) {

			this.__renderer.clear();


			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__renderer.renderUIText(this.__entities[e], this.game.settings.width / 2, this.game.settings.height / 2);
			}


			this.__renderer.flush();

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;
			this.game.setState('menu');

		}

	};


	return Class;

});
