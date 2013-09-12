// Generated by CoffeeScript 1.6.3
(function() {
  lychee.define("lychee.ui.Tile").includes(["lychee.ui.Entity"]).exports(function(lychee, global) {
    lychee.ui.Tile = (function() {
      function Tile(settings) {
        settings.color = (typeof settings.color === "string" ? settings.color : null);
        this.color = settings.color;
        delete settings.color;
        settings.shape = lychee.game.Entity.SHAPE.rectangle;
        lychee.ui.Entity.call(this, settings);
      }

      return Tile;

    })();
    return lychee.ui.Tile;
  });

}).call(this);