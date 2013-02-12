lychee
.define("lychee.physics.ParticleEmitter")
.requires(["lychee.physics.Particle"])
.exports (lychee, global) ->

  class lychee.physics.ParticleEmitter
    constructor: (data, graph) ->
      settings = lychee.extend({}, @defaults, data)
      @_graph = null
      @_particles = []
      @_position =
        x: 0
        y: 0
        z: 0

      @_cache =
        position:
          x: 0
          y: 0
          z: 0

        settings:
          position:
            x: 0
            y: 0
            z: 0

          velocity:
            x: 0
            y: 0
            z: 0

          mass: 1

      @_clock = null
      @_spawn = null
      @_graph = graph  if graph isnt null
      settings.position isnt null and @setPosition(settings.position)
      settings = null


    @SPAWN =
      linear:
        interval: 1000
        amount: 1
        defaults: {}

        callback: (spawn, delta, id) ->
          @spawn spawn.amount, spawn.settings

        clear: (spawn) ->


    defaults:
      position: null


    #
    # PUBLIC API
    #
    sync: (clock, delta) ->
      @_clock = clock
      p = 0
      l = @_particles.length

      while p < l
        @_particles[p].sync clock, delta
        p++

    update: (clock, delta) ->
      @sync clock, delta  if @_clock is null
      if @_spawn isnt null and @_graph isnt null and @_spawn.amount isnt null
        data = @_spawn
        curStep = Math.floor((clock - data.start) / data.delta)
        if curStep > data.step
          data.step = curStep
          data.callback.call data.scope, data, clock - data.start, curStep

    getPosition: ->
      @_position

    setPosition: (position) ->
      if Object::toString.call(position) is "[object Object]"
        @_position.x = (if typeof position.x is "number" then position.x else @_position.x)
        @_position.y = (if typeof position.y is "number" then position.y else @_position.y)
        @_position.z = (if typeof position.z is "number" then position.z else @_position.z)
        return true
      false

    spawn: (amount, data) ->
      amount = (if typeof amount is "number" then amount else null)
      data = (if Object::toString.call(data) is "[object Object]" then data else null)
      return  if amount is null or data is null
      settings = @_cache.settings
      a = 0

      while a < amount
        if data.position
          settings.position.x = data.position.x or @_position.x
          settings.position.y = data.position.y or @_position.y
          settings.position.z = data.position.z or @_position.z
        else
          settings.position.x = @_position.x
          settings.position.y = @_position.y
          settings.position.z = @_position.z
        if data.velocity and Object::toString.call(data.velocity.x) is "[object Array]"
          settings.velocity.x = (data.velocity.x[0] + Math.random() * (data.velocity.x[1] - data.velocity.x[0])) | 0
          settings.velocity.y = (data.velocity.y[0] + Math.random() * (data.velocity.y[1] - data.velocity.y[0])) | 0
          settings.velocity.z = (data.velocity.z[0] + Math.random() * (data.velocity.z[1] - data.velocity.z[0])) | 0
        else if data.velocity
          settings.velocity.x = data.velocity.x or 0
          settings.velocity.y = data.velocity.y or 0
          settings.velocity.z = data.velocity.z or 0
        else
          settings.velocity.x = 0
          settings.velocity.y = 0
          settings.velocity.z = 0
        if Object::toString.call(data.mass) is "[object Array]"
          settings.mass = data.mass[0] + Math.random() * (data.mass[1] - data.mass[0])
        else
          settings.mass = data.mass or 1
        particle = new lychee.physics.Particle(settings)
        @_graph.add particle
        a++

    setSpawn: (delta, amount, data, settings, scope) ->
      delta = (if typeof delta is "number" then delta else ((if data.delta then data.delta else null)))
      amount = (if typeof amount is "number" then amount else ((if data.amount then data.amount else null)))
      settings = (if Object::toString.call(settings) is "[object Object]" then settings else null)
      scope = (if scope isnt undefined then scope else this)
      spawn = null
      if delta isnt null and Object::toString.call(data) is "[object Object]"
        if data.callback instanceof Function
          spawn =
            start: @_clock
            delta: delta
            step: 0
            amount: amount
            callback: data.callback
            clear: data.clear or null
            scope: scope

          if Object::toString.call(data.defaults) is "[object Object]"
            spawn.settings = lychee.extend({}, data.defaults, settings)
          else
            spawn.settings = settings
      @_spawn = spawn  if spawn isnt null
