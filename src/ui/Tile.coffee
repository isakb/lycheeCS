lychee
.define("lychee.ui.Tile")
.includes(["lychee.ui.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Tile extends lychee.ui.Entity
    constructor: (settings) ->
      settings.color = (if typeof settings.color is "string" then settings.color else null)
      @color = settings.color
      delete settings.color
      settings.shape = lychee.game.Entity.SHAPE.rectangle
      super settings

  lychee.ui.Tile
