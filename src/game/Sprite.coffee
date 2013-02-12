lychee
.define("lychee.game.Sprite")
.includes(["lychee.game.Entity"])
.exports (lychee, global) ->

  class lychee.game.Sprite
    constructor: (data) ->
      settings = lychee.extend({}, data)
      @_image = null
      @_map = null

      # No Texture or Image validation
      @_image = settings.image  if settings.image isnt undefined
      @_map = settings.map  if Object::toString.call(settings.map) is "[object Object]"
      delete settings.image
      delete settings.map

      lychee.game.Entity.call this, settings
      settings = null


    setState: (id) ->
      result = lychee.game.Entity::setState.call(this, id)
      if result is true
        map = @_map[@getState()] or null
        if map isnt null
          @width = map.width  if map.width isnt undefined and typeof map.width is "number"
          @height = map.height  if map.height isnt undefined and typeof map.height is "number"
          @radius = map.radius  if map.radius isnt undefined and typeof map.radius is "number"
      result

    getImage: ->
      @_image

    getMap: ->
      state = @getState()
      frame = @getFrame()
      return @_map[state].frames[frame]  if @_map[state]? and @_map[state].frames? and @_map[state].frames[frame]?
      null
