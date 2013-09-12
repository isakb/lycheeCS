lychee
.define("lychee.ui.Renderer")
.requires(["lychee.ui.Button", "lychee.ui.Text", "lychee.ui.Tile"])
.includes(["lychee.Renderer"])
.exports (lychee, global) ->

  class lychee.ui.Renderer extends lychee.Renderer

    renderUIEntity: (entity, offsetX, offsetY) ->
      if entity instanceof lychee.ui.Button
        @renderUIButton entity, offsetX, offsetY
      else if entity instanceof lychee.ui.Sprite
        @renderUISprite entity, offsetX, offsetY
      else if entity instanceof lychee.ui.Text
        @renderUIText entity, offsetX, offsetY
      else if entity instanceof lychee.ui.Tile
        @renderUITile entity, offsetX, offsetY

    renderUIButton: (entity, offsetX = 0, offsetY = 0) ->
      {x, y} = entity.getPosition()
      x += offsetX
      y += offsetY
      background = entity.getBackground()
      if background isnt null
        @renderUISprite background, x, y
      label = entity.getLabel()
      if label isnt null
        @renderUIText label, x, y

    renderUISprite: (entity, offsetX = 0, offsetY = 0) ->
      {x, y, width, height} = entity.getBounds()
      x += offsetX - width / 2
      y += offsetY - height / 2
      @drawSprite x, y, entity.getImage(), entity.getMap()

    renderUIText: (entity, offsetX = 0, offsetY = 0) ->
      {x, y, width, height} = entity.getBounds()
      x += offsetX - width / 2
      y += offsetY - height / 2
      @drawText x, y, entity.text, entity.font

    renderUITile: (entity, offsetX = 0, offsetY = 0) ->
      return  unless entity.color?
      {x, y, width, height} = entity.getBounds()
      x += offsetX
      y += offsetY
      @drawBox x, y, x + width, y + height, entity.color, true
