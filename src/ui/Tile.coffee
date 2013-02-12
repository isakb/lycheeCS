lychee
.define("lychee.ui.Tile")
.includes(["lychee.ui.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Tile
    constructor: (settings) ->
      settings.color = (if typeof settings.color is "string" then settings.color else null)
      @color = settings.color
      delete settings.color

      settings.shape = lychee.game.Entity.SHAPE.rectangle
      lychee.ui.Entity.call this, settings

  #lychee.ui.Tile.prototype = {}  # FIXME: Redundant?

  lychee.ui.Tile
