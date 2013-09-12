lychee
.define("lychee.ui.Entity")
.includes(["lychee.game.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Entity extends lychee.game.Entity
    constructor: (data) ->
      settings = lychee.extend({}, data)
      @_layout = null
      @_value = null
      @_events = {}
      if settings.layout
        @setLayout settings.layout
        delete settings.layout
      lychee.game.Entity.call this, settings
      settings = null

    #
    #	PUBLIC API
    #

    hasEvent: (type) ->
      return false  if @_events[type] is undefined
      return false  if @_events[type].length is 0
      true

    bind: (type, callback, scope) ->
      @_events[type] = []  if @_events[type] is undefined
      @_events[type].push
        callback: callback
        scope: scope or global


    unbind: (type, callback, scope) ->
      callback = (if callback instanceof Function then callback else null)
      scope = (if scope isnt undefined then scope else null)
      return true  if @_events[type] is undefined
      found = false
      i = 0
      l = @_events[type].length

      while i < l
        entry = @_events[type][i]
        if (callback is null or entry.callback is callback) and (scope is null or entry.scope is scope)
          found = true
          @_events[type].splice i, 1
          l--
        i++
      found

    trigger: (type, data) ->
      passData = data
      passData = [this, @_value]  if data is undefined or Object::toString.call(data) isnt "[object Array]"
      success = false
      if @_events[type] isnt undefined
        i = 0
        l = @_events[type].length

        while i < l
          entry = @_events[type][i]
          entry.callback.apply entry.scope, passData
          i++
        success = true
      success

    relayout: (parent) ->
      cache = @_cache.position
      hwidth = parent.width / 2
      hheight = parent.height / 2
      layout = @_layout
      if layout isnt null
        if layout.position is "relative"
          cache.x = layout.x * hwidth  if layout.x >= -1 and layout.x <= 1
          cache.y = layout.y * hheight  if layout.y >= -1 and layout.y <= 1
        else if layout.position is "absolute"
          cache.x = layout.x  if layout.x >= -hwidth and layout.x <= hwidth
          cache.y = layout.y  if layout.y >= -hheight and layout.y <= hheight
        @setPosition cache

    getValue: ->
      @_value

    setValue: (value) ->
      @_value = value

    getLabel: ->
      null

    getLayout: ->
      @_layout

    setLayout: (layout) ->
      if @_layout is null
        @_layout =
          position: "absolute"
          x: 0
          y: 0
      return false  if Object::toString.call(layout) isnt "[object Object]"
      @_layout.position = (if typeof layout.position is "string" then layout.position else @_layout.position)
      @_layout.x = (if typeof layout.x is "number" then layout.x else @_layout.x)
      @_layout.y = (if typeof layout.y is "number" then layout.y else @_layout.y)
      true
