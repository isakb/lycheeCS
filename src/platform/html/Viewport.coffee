lychee
.define("Viewport")
.tags(platform: "html")
.includes(["lychee.Events"])
.supports((lychee, global) ->
  return true  if typeof global.addEventListener is "function" and typeof global.innerWidth is "number" and typeof global.innerHeight is "number"
  false
).exports (lychee, global) ->

  # I know, there's null and 0.
  # This is wanted. See below.
  _clock =
    orientationchange: null
    resize: 0

  _active = true
  _instances = []

  _listeners =
    orientationchange: ->
      _clock.orientationchange = Date.now()
      i = 0
      l = _instances.length

      while i < l
        _instances[i]._processOrientation global.orientation
        i++

    resize: ->

      # This fixes the multiple resize events bug
      # The DOM-concept related Bug by design:
      # 1. resize
      # 2. orientationchange
      # 3. resize (optional, if device was fast enough)
      # 4. orientationchange
      # 5. resize (if reflow was bad)
      # 6. resize
      if _clock.orientationchange is null or (_clock.orientationchange isnt null and _clock.resize < _clock.orientationchange)
        _clock.resize = Date.now()
        i = 0
        l = _instances.length

        while i < l
          ((instance) ->
            setTimeout (->
              instance._processReshape global.innerWidth, global.innerHeight
            ), 500
          ) _instances[i]
          i++

    focus: ->
      if _active is false
        i = 0
        l = _instances.length

        while i < l
          _instances[i]._processShow()
          i++
        _active = true

    blur: ->
      if _active is true
        i = 0
        l = _instances.length

        while i < l
          _instances[i]._processHide()
          i++
        _active = false

  do ->
    methods = []
    if typeof global.onorientationchange isnt "undefined"
      methods.push "orientationchange"
      global.addEventListener "orientationchange", _listeners.orientationchange, true
    if typeof global.onfocus isnt "undefined"
      methods.push "focus"
      global.addEventListener "focus", _listeners.focus, true
    if typeof global.onblur isnt "undefined"
      methods.push "blur"
      global.addEventListener "blur", _listeners.blur, true
    global.addEventListener "resize", _listeners.resize, true
    console.log "lychee.Viewport: Supported methods are " + methods.join(", ")  if lychee.debug is true


  class Viewport
    constructor: ->
      @_orientation = (if typeof global.orientation is "number" then global.orientation else 0)
      @_width = global.innerWidth
      @_height = global.innerHeight
      lychee.Events.call this, "viewport"
      _instances.push this


    #
    # PRIVATE API
    #
    _processOrientation: (orientation) ->
      @_orientation = orientation

    _processReshape: (width, height) ->
      @_width = width
      @_height = height

      #    TOP
      #  _______
      # |       |
      # |       |
      # |       |
      # |       |
      # |       |
      # [X][X][X] <- buttons
      #
      #  BOTTOM
      if @_orientation is 0
        if width > height
          @trigger "reshape", ["landscape", "landscape", @_width, @_height]
        else
          @trigger "reshape", ["portrait", "portrait", @_width, @_height]

      #    ____________    B
      # T |            [x] O
      # O |            [x] T
      # P |____________[x] T
      #                    O
      #                    M
      else if @_orientation is 90
        if width > height
          @trigger "reshape", ["portrait", "landscape", @_width, @_height]
        else
          @trigger "reshape", ["landscape", "portrait", @_width, @_height]

      # B    ____________
      # O [x]            | T
      # T [x]            | O
      # T [x]____________| P
      # O
      # M
      else if @_orientation is -90
        if width > height
          @trigger "reshape", ["portrait", "landscape", @_width, @_height]
        else
          @trigger "reshape", ["landscape", "portrait", @_width, @_height]

    _processShow: ->
      @trigger "show", []

    _processHide: ->
      @trigger "hide", []
