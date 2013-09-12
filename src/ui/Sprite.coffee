lychee
.define("lychee.ui.Sprite")
.includes(["lychee.ui.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Sprite extends lychee.ui.Entity
    constructor: (data) ->
      settings = lychee.extend({}, data)
      @_image = null
      @_map = null
      # No Texture or Image validation
      @_image = settings.image  if settings.image isnt undefined
      @_map = settings.map  if Object::toString.call(settings.map) is "[object Object]"
      delete settings.image
      delete settings.map
      super settings
      settings = null

    setState: (id) ->
      result = lychee.ui.Entity::setState.call(this, id)
      if result is true
        w = @_map[@getState()].width
        h = @_map[@getState()].height
        @width = w  if w isnt undefined and typeof w is "number"
        @height = h  if h isnt undefined and typeof h is "number"
      result

    getImage: ->
      @_image

    getMap: ->
      state = @getState()
      frame = @getFrame()
      return @_map[state].frames[frame]  if @_map[state]? and @_map[state].frames? and @_map[state].frames[frame]?
      null
