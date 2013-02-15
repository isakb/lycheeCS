lychee
.define("Input")
.tags(platform: "html")
.includes(["lychee.Events"])
.supports((lychee, global) ->
  return true  if global.document and typeof global.document.addEventListener is "function"
  false
).exports (lychee, global) ->

  _instances = []
  _mouseactive = false

  _listeners =
    keydown: (event) ->
      i = 0
      l = _instances.length

      while i < l
        _instances[i]._processKey event.keyCode, event.ctrlKey, event.altKey, event.shiftKey
        i++

    touchstart: (event) ->
      event.preventDefault()
      event.stopPropagation()
      i = 0
      l = _instances.length

      while i < l
        if event.touches and event.touches.length
          t = 0
          tl = event.touches.length

          while t < tl
            _instances[i]._processTouch t, event.touches[t].pageX, event.touches[t].pageY
            t++
        else
          _instances[i]._processTouch 0, event.pageX, event.pageY
        i++

    touchmove: (event) ->
      i = 0
      l = _instances.length

      while i < l
        if event.touches and event.touches.length
          t = 0
          tl = event.touches.length

          while t < tl
            _instances[i]._processSwipe t, "move", event.touches[t].pageX, event.touches[t].pageY
            t++
        else
          _instances[i]._processSwipe 0, "move", event.pageX, event.pageY
        i++

    touchend: (event) ->
      i = 0
      l = _instances.length

      while i < l
        if event.touches and event.touches.length
          t = 0
          tl = event.touches.length

          while t < tl
            _instances[i]._processSwipe t, "end", event.touches[t].pageX, event.touches[t].pageY
            t++
        else
          _instances[i]._processSwipe 0, "end", event.pageX, event.pageY
        i++

    mousestart: (event) ->
      _mouseactive = true
      i = 0
      l = _instances.length

      while i < l
        _instances[i]._processTouch 0, event.pageX, event.pageY
        i++

    mousemove: (event) ->
      return  if _mouseactive is false
      i = 0
      l = _instances.length

      while i < l
        _instances[i]._processSwipe 0, "move", event.pageX, event.pageY
        i++

    mouseend: (event) ->
      return  if _mouseactive is false
      _mouseactive = false
      i = 0
      l = _instances.length

      while i < l
        _instances[i]._processSwipe 0, "end", event.pageX, event.pageY
        i++

  (->
    keyboard = "onkeydown" of global
    document.addEventListener "keydown", _listeners.keydown, true  if keyboard is true
    touch = "ontouchstart" of global
    mouse = "onmousedown" of global
    if touch is true
      document.addEventListener "touchstart", _listeners.touchstart, true
      document.addEventListener "touchmove", _listeners.touchmove, true
      document.addEventListener "touchend", _listeners.touchend, true
    else if mouse is true
      document.addEventListener "mousedown", _listeners.mousestart, true
      document.addEventListener "mousemove", _listeners.mousemove, true
      document.addEventListener "mouseup", _listeners.mouseend, true
      document.addEventListener "mouseout", _listeners.mouseend, true
    if lychee.debug is true
      methods = []
      methods.push "Keyboard"  if keyboard
      methods.push "Touch"  if touch
      methods.push "Mouse"  if mouse
      methods.push "NONE"  if methods.length is 0
      console.log "lychee.Input: Supported input methods are " + methods.join(", ")
  )()


  Class = class Input
    constructor: (data) ->
      settings = lychee.extend({}, data)
      settings.fireKey = !!settings.fireKey
      settings.fireModifier = !!settings.fireModifier
      settings.fireTouch = !!settings.fireTouch
      settings.fireSwipe = !!settings.fireSwipe
      settings.delay = (if typeof settings.delay is "number" then settings.delay else 0)
      @_fireKey = settings.fireKey
      @_fireModifier = settings.fireModifier
      @_fireTouch = settings.fireTouch
      @_fireSwipe = settings.fireSwipe
      @_delay = settings.delay
      @reset()
      lychee.Events.call this, "input"
      _instances.push this
      settings = null

    @KEYMAP =
      8: "backspace"
      9: "tab"
      13: "enter"
      16: "shift"
      17: "ctrl"
      18: "alt"
      19: "pause"
      27: "escape"
      32: "space"
      37: "left"
      38: "up"
      39: "right"
      40: "down"
      48: "0"
      49: "1"
      50: "2"
      51: "3"
      52: "4"
      53: "5"
      54: "6"
      55: "7"
      56: "8"
      57: "9"
      65: "a"
      66: "b"
      67: "c"
      68: "d"
      69: "e"
      70: "f"
      71: "g"
      72: "h"
      73: "i"
      74: "j"
      75: "k"
      76: "l"
      77: "m"
      78: "n"
      79: "o"
      80: "p"
      81: "q"
      82: "r"
      83: "s"
      84: "t"
      85: "u"
      86: "v"
      87: "w"
      88: "x"
      89: "y"
      90: "z"

    #
    # PUBLIC API
    #
    reset: ->
      @_touchareas = null # GC hint
      @_touchareas = {}
      @_swipes = null # GC hint
      @_swipes =
        0: null
        1: null
        2: null
        3: null
        4: null
        5: null
        6: null
        7: null
        8: null
        9: null

      @_clock = null # GC hint
      @_clock =
        key: Date.now()
        touch: Date.now()
        swipe: Date.now()

    addToucharea: (id, box) ->
      id = (if typeof id is "string" then id else null)
      if id isnt null and Object::toString.call(box) is "[object Object]" and @_touchareas[id] is undefined
        @_touchareas[id] =
          id: id
          x1: (if typeof box.x1 is "number" then box.x1 else 0)
          x2: (if typeof box.x2 is "number" then box.x2 else Infinity)
          y1: (if typeof box.y1 is "number" then box.y1 else 0)
          y2: (if typeof box.y2 is "number" then box.y2 else Infinity)

        return true
      false

    removeToucharea: (id) ->
      id = (if typeof id is "string" then id else null)
      if id isnt null and @_touchareas[id] isnt undefined
        delete @_touchareas[id]

        return true
      false


    #
    # PRIVATE API
    #
    _processKey: (code, ctrl, alt, shift) ->
      return  if @_fireKey is false

      # 1. Validate key event
      return  if Class.KEYMAP[code] is undefined
      ctrl = (if ctrl is true then true else false)
      alt = (if alt is true then true else false)
      shift = (if shift is true then true else false)

      # 2. Only fire after the enforced delay
      delta = Date.now() - @_clock.key
      return  if delta < @_delay

      # 3. Check for current key being a modifier
      return  if @_fireModifiers is false and (code is 16 or code is 17 or code is 18) and (ctrl is true or alt is true or shift is true)
      key = Class.KEYMAP[code]
      name = ""
      name += "ctrl-"  if ctrl is true and key isnt "ctrl"
      name += "alt-"  if alt is true and key isnt "alt"
      if shift is true and key isnt "shift"
        name += "shift-"

        # WTF is this shit?
        # t > T, but 0 > ! doesn't work.
        key = String.fromCharCode(code)
      name += key.toLowerCase()
      console.log "lychee.Input:", key, name, delta  if lychee.debug is true

      # allow bind('key') and bind('ctrl-a');
      @trigger "key", [key, name, delta, event]
      @trigger name, [delta, event]
      @_clock.key = Date.now()

    _processTouch: (id, x, y) ->
      return  if @_fireTouch is false

      # 1. Only fire after the enforced delay
      delta = Date.now() - @_clock.touch
      return  if delta < @_delay

      # Don't cancel the swipe event by default
      cancelSwipe = @trigger("touch", [id,
        x: x
        y: y
      , delta]) is true

      # 2. Fire known Touchareas
      for tid of @_touchareas
        toucharea = @_touchareas[tid]
        @trigger "toucharea-" + tid, [delta]  if x > toucharea.x1 and x < toucharea.x2 and y > toucharea.y1 and y < toucharea.y2
      @_clock.touch = Date.now()

      # 3. Fire Swipe Start, but only for tracked touches
      @_processSwipe id, "start", x, y  if cancelSwipe isnt true and @_swipes[id] is null

    _processSwipe: (id, state, x, y) ->
      return  if @_fireSwipe is false

      # 1. Only fire after the enforced delay
      delta = Date.now() - @_clock.swipe
      return  if delta < @_delay
      position =
        x: x
        y: y

      swipe =
        x: 0
        y: 0

      if @_swipes[id] isnt null
        swipe.x = x - @_swipes[id].x
        swipe.y = y - @_swipes[id].y
      if state is "start"
        @trigger "swipe", [id, "start", position, delta, swipe]
        @_swipes[id] =
          x: x
          y: y
      else if state is "move"
        @trigger "swipe", [id, "move", position, delta, swipe]
      else if state is "end"
        @trigger "swipe", [id, "end", position, delta, swipe]
        @_swipes[id] = null
      @_clock.swipe = Date.now()
