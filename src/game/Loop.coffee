lychee
.define("lychee.game.Loop")
.includes(["lychee.Events"])
.supports((lychee, global) ->
  return true  if typeof setInterval is "function"
  false
).exports (lychee, global) ->

  _instances = []

  _listeners =
    interval: ->
      i = 0
      l = _instances.length

      while i < l
        instance = _instances[i]
        clock = Date.now() - instance._clock.start
        instance._updateLoop clock
        instance._renderLoop clock
        i++

  do (callsPerSecond = 1000 / 60) ->
    interval = typeof setInterval is "function"
    global.setInterval _listeners.interval, callsPerSecond  if interval is true
    if lychee.debug is true
      methods = []
      methods.push "setInterval"  if interval
      methods.push "NONE"  if methods.length is 0
      console.log "lychee.game.Loop: Supported interval methods are " + methods.join(", ")

  _timeoutId = 0
  _intervalId = 0


  class lychee.game.Loop
    constructor: (data) ->
      settings = lychee.extend({}, data)
      @_timeouts = {}
      @_intervals = {}
      @_state = "running"
      lychee.Events.call this, "loop"
      ok = @reset(settings.update, settings.render)
      _instances.push this  if ok is true
      settings = null

    #
    # PUBLIC API
    #
    reset: (updateFps, renderFps) ->
      updateFps = (if typeof updateFps is "number" then updateFps else 0)
      renderFps = (if typeof renderFps is "number" then renderFps else 0)
      updateFps = 0  if updateFps < 0
      renderFps = 0  if renderFps < 0
      return false  if updateFps is 0 and renderFps is 0
      @_clock =
        start: Date.now()
        update: 0
        render: 0

      @_ms = {}
      @_ms.update = 1000 / updateFps  if updateFps > 0
      @_ms.render = 1000 / updateFps  if renderFps > 0
      @_updateFps = updateFps
      @_renderFps = renderFps
      true

    start: ->
      @_state = "running"

    stop: ->
      @_state = "stopped"

    timeout: (delta, callback, scope) ->
      delta = (if typeof delta is "number" then delta else null)
      callback = (if callback instanceof Function then callback else null)
      scope = (if scope isnt undefined then scope else global)
      return null  if delta is null or callback is null
      id = _timeoutId++
      @_timeouts[id] =
        start: @_clock.update + delta
        callback: callback
        scope: scope

      that = this
      clear: ->
        that._timeouts[id] = null

    interval: (delta, callback, scope) ->
      delta = (if typeof delta is "number" then delta else null)
      callback = (if callback instanceof Function then callback else null)
      scope = (if scope isnt undefined then scope else global)
      return null  if delta is null or callback is null
      id = _intervalId++
      @_intervals[id] =
        start: @_clock.update + delta
        delta: delta
        step: 0
        callback: callback
        scope: scope

      that = this
      clear: ->
        that._intervals[id] = null

    isRunning: ->
      @_state is "running"


    #
    # PROTECTED API
    #
    _renderLoop: (clock) ->
      return  if @_state isnt "running"
      delta = clock - @_clock.render
      if delta >= @_ms.render
        @trigger "render", [clock, delta]
        @_clock.render = clock

    _updateLoop: (clock) ->
      return  if @_state isnt "running"
      delta = clock - @_clock.update
      if delta >= @_ms.update
        @trigger "update", [clock, delta]
        @_clock.update = clock
      data = undefined
      for iId of @_intervals
        data = @_intervals[iId]

        # Skip cleared intervals
        continue  if data is null
        curStep = Math.floor((clock - data.start) / data.delta)
        if curStep > data.step
          data.step = curStep
          data.callback.call data.scope, clock - data.start, curStep
      for tId of @_timeouts
        data = @_timeouts[tId]

        # Skip cleared timeouts
        continue  if data is null
        if clock >= data.start
          @_timeouts[tId] = null
          data.callback.call data.scope, clock
