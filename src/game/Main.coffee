lychee
.define("lychee.game.Main")
.requires(["lychee.game.Loop"])
.includes(["lychee.Events"])
.exports (lychee) ->

  class lychee.game.Main
    constructor: (settings) ->
      @settings = lychee.extend({}, @defaults, settings)
      @states = {}
      @_state = null
      lychee.Events.call this, "game"

    defaults:
      renderFps: 60
      updateFps: 60
      width: 1024
      height: 768

    load: ->
      # Default behaviour:
      # Directly initialize, load no assets
      @init()

    init: ->
      @loop = new lychee.game.Loop(
        render: @settings.renderFps
        update: @settings.updateFps
      )
      @loop.bind "update", @updateLoop, this
      @loop.bind "render", @renderLoop, this

    start: ->
      @loop.start()

    stop: ->
      @loop.stop()

    getState: (id) ->
      id = (if typeof id is "string" then id else null)
      @states[id] or @_state

    setState: (id, data) ->
      data = data or null
      oldState = @_state
      newState = @states[id] or null

      # stupid called -.-
      return false  if newState is null
      oldState.leave and oldState.leave()  if oldState isnt null
      newState.enter and newState.enter(data)
      @_state = newState
      true

    renderLoop: (t, dt) ->
      @_state.render and @_state.render(t, dt)  if @_state isnt null

    updateLoop: (t, dt) ->
      @_state.update and @_state.update(t, dt)  if @_state isnt null
