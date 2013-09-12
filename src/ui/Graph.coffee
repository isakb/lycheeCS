lychee
.define("lychee.ui.Graph")
.includes(["lychee.game.Graph"])
.exports (lychee, global) ->

  class lychee.ui.Graph extends lychee.game.Graph
    constructor: (renderer) ->
      @_renderer = (if renderer isnt undefined then renderer else null)
      @_clock = null
      @_offset =
        x: 0
        y: 0
        z: 0

      @_tween = null
      @_cache = tween: {}
      lychee.game.Graph.call this

    #
    # PUBLIC API
    #
    relayout: ->
      @_dirty = true

    update: (clock, delta) ->
      @_clock = clock
      if @_tween isnt null and (clock <= @_tween.start + @_tween.duration)
        cache = @_cache.tween
        t = (clock - @_tween.start) / @_tween.duration
        cache.x = @_tween.from.x + t * (@_tween.to.x - @_tween.from.x)
        cache.y = @_tween.from.y + t * (@_tween.to.y - @_tween.from.y)
        @setOffset cache
      else if @_tween isnt null

        # We didn't have enough time for the tween
        @setOffset @_tween.to
        @_tween.callback.call @_tween.scope  if @_tween.callback isnt null
        @_tween = null
      if @_dirty is true
        @_relayoutNode @_tree, null
        @_dirty = false
      @_updateNode @_tree, clock, delta

    render: (clock, delta) ->
      @_renderNode @_tree, @_offset.x, @_offset.y  if @_renderer isnt null

    getEntityByPosition: (x, y, z, convert = false) ->
      if convert
        x -= @_offset.x  if x isnt null
        y -= @_offset.y  if y isnt null
        z -= @_offset.z  if z isnt null
      lychee.game.Graph::getEntityByPosition.call this, x, y, z

    setTween: (duration, position, callback, scope) ->
      duration = (if typeof duration is "number" then duration else 0)
      callback = (if callback instanceof Function then callback else null)
      scope = (if scope isnt undefined then scope else global)
      tween = null
      if Object::toString.call(position) is "[object Object]"
        position.x = (if typeof position.x is "number" then position.x else @_offset.x)
        position.y = (if typeof position.y is "number" then position.y else @_offset.y)
        tween =
          start: @_clock
          duration: duration
          from:
            x: @_offset.x
            y: @_offset.y
          to: position
          callback: callback
          scope: scope
      @_tween = tween

    getOffset: ->
      @_offset

    setOffset: (offset) ->
      return false  if Object::toString.call(offset) isnt "[object Object]"
      @_offset.x = if typeof offset.x is "number" then offset.x else @_offset.x
      @_offset.y = if typeof offset.y is "number" then offset.y else @_offset.y
      @_offset.z = if typeof offset.z is "number" then offset.z else @_offset.z
      true


    #
    # PRIVATE API
    #
    _relayoutNode: (node, parent) ->
      node.entity.relayout parent.entity  if parent isnt null and parent.entity isnt null and node.entity isnt null and typeof node.entity.relayout is "function"
      for childNode in node.children
        @_relayoutNode childNode, node
      null

    _renderNode: (node, offsetX, offsetY) ->
      if node.entity isnt null
        @_renderer.renderUIEntity node.entity, offsetX, offsetY
        {x, y} = node.entity.getPosition()
        offsetX += x
        offsetY += y
      for childNode in node.children
        @_renderNode childNode, offsetX, offsetY
      null
