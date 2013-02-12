lychee
.define("lychee.ui.Renderer")
.requires(["lychee.ui.Button", "lychee.ui.Text", "lychee.ui.Tile"])
.includes(["lychee.Renderer"])
.exports (lychee, global) ->

  class lychee.ui.Renderer
    constructor: (id) ->
      lychee.Renderer.call this, id

    renderUIEntity: (entity, offsetX, offsetY) ->
      if entity instanceof lychee.ui.Button
        @renderUIButton entity, offsetX, offsetY
      else if entity instanceof lychee.ui.Sprite
        @renderUISprite entity, offsetX, offsetY
      else if entity instanceof lychee.ui.Text
        @renderUIText entity, offsetX, offsetY
      else @renderUITile entity, offsetX, offsetY  if entity instanceof lychee.ui.Tile

    renderUIButton: (entity, offsetX, offsetY) ->
      offsetX = offsetX or 0
      offsetY = offsetY or 0
      pos = entity.getPosition()
      background = entity.getBackground()
      @renderUISprite background, pos.x + offsetX, pos.y + offsetY  if background isnt null
      label = entity.getLabel()
      @renderUIText label, pos.x + offsetX, pos.y + offsetY  if label isnt null

    renderUISprite: (entity, offsetX, offsetY) ->
      offsetX = offsetX or 0
      offsetY = offsetY or 0
      map = entity.getMap()
      pos = entity.getPosition()
      image = entity.getImage()
      @drawSprite pos.x + offsetX - entity.width / 2, pos.y + offsetY - entity.height / 2, image, map

    renderUIText: (entity, offsetX, offsetY) ->
      offsetX = offsetX or 0
      offsetY = offsetY or 0
      pos = entity.getPosition()
      @drawText pos.x + offsetX - entity.width / 2, pos.y + offsetY - entity.height / 2, entity.text, entity.font

    renderUITile: (entity, offsetX, offsetY) ->
      return  if entity.color is null
      offsetX = offsetX or 0
      offsetY = offsetY or 0
      pos = entity.getPosition()
      @drawBox pos.x + offsetX - entity.width / 2, pos.y + offsetY - entity.height / 2, pos.x + offsetX + entity.width / 2, pos.y + offsetY + entity.height / 2, entity.color, true
