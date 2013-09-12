lychee
.define("lychee.game.Entity")
.exports (lychee) ->

  Class = class lychee.game.Entity
    constructor: (data) ->
      settings = lychee.extend({}, @defaults, data)
      @_clock = null
      @_animation = null
      @_collision = null
      @_effect = null
      @_position =
        x: 0
        y: 0
        z: 0

      @_velocity =
        x: 0
        y: 0
        z: 0

      @_shape = null
      @_state = "default"
      @_tween = null
      @_states = lychee.extend({}, @defaults.states, settings.states)

      # Reuse this cache for performance relevant methods
      @_cache =
        position: {}
        tween: {}
        effect: {}

      @width = settings.width
      @height = settings.height
      @radius = settings.radius
      @setPosition settings.position
      @setCollisionType settings.collision
      @setShape settings.shape
      @setState settings.state
      if Object::toString.call(settings.animation) is "[object Object]"
        if typeof settings.animation.duration is "number"
          duration = settings.animation.duration
          loop_ = !!settings.animation.loop
          delete settings.animation.duration
          delete settings.animation.loop
          @setAnimation duration, settings.animation, loop_
      settings = null


    @COLLISION =
      none: 0
      A: 1
      B: 2
      C: 3
      D: 4


    @EFFECT =
      wobble:
        duration: 1000
        defaults:
          x: 0
          y: 0
          z: 0

        callback: (effect, t) ->
          s = effect.settings
          if effect.origin is undefined
            position = @getPosition()
            effect.origin =
              x: position.x
              y: position.y
              z: position.z
          @_cache.effect.x = effect.origin.x + Math.sin(t * 2 * Math.PI) * s.x
          @_cache.effect.y = effect.origin.y + Math.sin(t * 2 * Math.PI) * s.y
          @_cache.effect.z = effect.origin.z + Math.sin(t * 2 * Math.PI) * s.z
          @setPosition @_cache.effect

        clear: (effect) ->
          @setPosition effect.origin


    @SHAPE =
      circle: 0
      sphere: 1
      rectangle: 2
      cuboid: 3
      polygon: 4


    @TWEEN =
      linear: (t, dx, dy, dz) ->
        {tween} = @_cache
        tween.x = t * dx
        tween.y = t * dy
        tween.z = t * dz
        tween

      easeIn: (t, dx, dy, dz) ->
        f = 1 * Math.pow(t, 3)
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween

      easeOut: (t, dx, dy, dz) ->
        f = Math.pow(t - 1, 3) + 1
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween

      easeInOut: (t, dx, dy, dz) ->
        f = if (t /= 0.5) < 1
          0.5 * Math.pow(t, 3)
        else
          0.5 * (Math.pow(t - 2, 3) + 2)
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween

      bounceEaseIn: (t, dx, dy, dz) ->
        k = 1 - t
        f = if (k /= 1) < (1 / 2.75)
          1 * (7.5625 * Math.pow(k, 2))
        else if k < (2 / 2.75)
          7.5625 * (k -= (1.5 / 2.75)) * k + .75
        else if k < (2.5 / 2.75)
          7.5625 * (k -= (2.25 / 2.75)) * k + .9375
        else
          7.5625 * (k -= (2.625 / 2.75)) * k + .984375
        {tween} = @_cache
        tween.x = (1 - f) * dx
        tween.y = (1 - f) * dy
        tween.z = (1 - f) * dz
        tween

      bounceEaseOut: (t, dx, dy, dz) ->
        f = if (t /= 1) < (1 / 2.75)
          1 * (7.5625 * Math.pow(t, 2))
        else if t < (2 / 2.75)
          7.5625 * (t -= (1.5 / 2.75)) * t + .75
        else if t < (2.5 / 2.75)
          7.5625 * (t -= (2.25 / 2.75)) * t + .9375
        else
          7.5625 * (t -= (2.625 / 2.75)) * t + .984375
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween

      sinEaseIn: (t, dx, dy, dz) ->
        f = -1 * Math.cos(t * Math.PI / 2) + 1
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween

      sinEaseOut: (t, dx, dy, dz) ->
        f = 1 * Math.sin(t * Math.PI / 2)
        {tween} = @_cache
        tween.x = f * dx
        tween.y = f * dy
        tween.z = f * dz
        tween


    #
    # Prototype
    #

    defaults:
      position:
        x: 0
        y: 0
        z: 0

      radius: 0
      width: 0
      height: 0
      shape: @SHAPE.circle
      collision: @COLLISION.none
      states:
        default: 0


    # Allows sync(null, true) for reset
    sync: (clock, force) ->
      force = (if force is true then true else false)
      @_clock = clock  if force is true
      if @_clock is null
        @_tween.start = clock  if @_tween isnt null
        @_effect.start = clock  if @_effect isnt null
        @_animation.start = clock  if @_animation isnt null
        @_clock = clock

    update: (clock, delta) ->

      # 1. Sync clocks initially
      # (if Entity was created before loop started)
      @sync clock  if @_clock is null
      t = 0
      dt = delta / 1000
      cache = @_cache.position

      # 2. Tweening
      if @_tween isnt null and (@_clock <= @_tween.start + @_tween.duration)
        t = (@_clock - @_tween.start) / @_tween.duration
        if typeof @_position.x is "number"
          cache.x = @_tween.to.x - @_tween.from.x
        else
          cache.x = 0
        if typeof @_position.y is "number"
          cache.y = @_tween.to.y - @_tween.from.y
        else
          cache.y = 0
        if typeof @_position.z is "number"
          cache.z = @_tween.to.z - @_tween.from.z
        else
          cache.z = 0
        diff = @_tween.callback.call(@_tween.scope, t, cache.x, cache.y, cache.z)
        cache.x = @_tween.from.x + diff.x  if typeof @_position.x is "number"
        cache.y = @_tween.from.y + diff.y  if typeof @_position.y is "number"
        cache.z = @_tween.from.z + diff.z  if typeof @_position.z is "number"
        @setPosition cache
      else if @_tween isnt null

        # We didn't have enough time for the tween
        @setPosition @_tween.to
        @_tween = null

      # 3. Velocities
      if @_velocity.x isnt 0 or @_velocity.y isnt 0 or @_velocity.z isnt 0
        cache.x = @_position.x
        cache.y = @_position.y
        cache.z = @_position.z
        cache.x += @_velocity.x * dt  if @_velocity.x isnt 0
        cache.y += @_velocity.y * dt  if @_velocity.y isnt 0
        cache.z += @_velocity.z * dt  if @_velocity.z isnt 0
        @setPosition cache

      # 4. Effects
      if @_effect isnt null and (@_clock <= @_effect.start + @_effect.duration)
        t = (@_clock - @_effect.start) / @_effect.duration
        @_effect.callback.call @_effect.scope, @_effect, t
      else if @_effect isnt null
        if @_effect.loop is true
          @_effect.start = @_clock
        else
          @_effect = null

      # 5. Animation (Interpolation)
      if @_animation isnt null and (@_clock <= @_animation.start + @_animation.duration)
        t = (@_clock - @_animation.start) / @_animation.duration

        # Note: Math.floor approach doesn't work for lastframeindex x.6-x.9
        @_animation.frame = Math.max(0, Math.ceil(t * @_animation.frames) - 1)
      else if @_animation isnt null
        if @_animation.loop is true
          @_animation.start = @_clock
        else
          @_animation = null
      @_clock = clock

    setTween: (duration, position, callback, scope) ->
      duration = (if typeof duration is "number" then duration else 0)
      callback = (if callback instanceof Function then callback else Class.TWEEN.linear)
      scope = (if scope isnt undefined then scope else this)
      if Object::toString.call(position) is "[object Object]"
        position.x = (if typeof position.x is "number" then position.x else @_position.x)
        position.y = (if typeof position.y is "number" then position.y else @_position.y)
        position.z = (if typeof position.z is "number" then position.z else @_position.z)
        pos = @getPosition()
        tween =
          start: @_clock
          duration: duration
          from:
            x: pos.x
            y: pos.y
            z: pos.z

          to: position
          callback: callback
          scope: scope

        @_tween = tween

    clearTween: ->
      @_tween = null

    getPosition: ->
      @_position

    getBounds: ->
      {
        x: @_position.x
        y: @_position.y
        @width
        @height
      }

    setPosition: (position) ->
      return false  if Object::toString.call(position) isnt "[object Object]"
      @_position.x = (if typeof position.x is "number" then position.x else @_position.x)
      @_position.y = (if typeof position.y is "number" then position.y else @_position.y)
      @_position.z = (if typeof position.z is "number" then position.z else @_position.z)
      true

    getVelocity: ->
      @_velocity

    setVelocity: (velocity) ->
      return false  if Object::toString.call(velocity) isnt "[object Object]"
      @_velocity.x = (if typeof velocity.x is "number" then velocity.x else @_velocity.x)
      @_velocity.y = (if typeof velocity.y is "number" then velocity.y else @_velocity.y)
      @_velocity.z = (if typeof velocity.z is "number" then velocity.z else @_velocity.z)
      true

    getState: ->
      @_state

    setState: (id) ->
      id = (if typeof id is "string" then id else null)
      if id isnt null and @_states[id] isnt undefined
        @_state = id
        return true
      false

    collidesWith: (entity) ->
      return false  if @getCollisionType() is Class.COLLISION.none or entity.getCollisionType() is Class.COLLISION.none
      shapeA = @getShape()
      shapeB = entity.getShape()
      posA = @getPosition()
      posB = entity.getPosition()
      if shapeA is Class.SHAPE.circle and shapeB is Class.SHAPE.circle
        collisionDistance = @radius + entity.radius
        realDistance = Math.sqrt(Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2))
        return true  if realDistance <= collisionDistance
      else if shapeA is Class.SHAPE.circle and shapeB is Class.SHAPE.rectangle
        radius = @radius
        halfWidth = entity.width / 2
        halfHeight = entity.height / 2
        return true  if (posA.x + radius > posB.x - halfWidth) and (posA.x - radius < posB.x + halfWidth) and (posA.y + radius > posB.y - halfHeight) and (posA.y - radius < posB.y + halfHeight)
      else if shapeA is Class.SHAPE.rectangle and shapeB is Class.SHAPE.circle
        radius = entity.radius
        halfWidth = @width / 2
        halfHeight = @height / 2
        return true  if (posA.x + radius > posB.x - halfWidth) and (posA.x - radius < posB.x + halfWidth) and (posA.y + radius > posB.y - halfHeight) and (posA.y - radius < posB.y + halfHeight)
      false

    getCollisionType: ->
      @_collision

    setCollisionType: (type) ->
      found = false
      for id of Class.COLLISION
        if type is Class.COLLISION[id]
          found = true
          break
      @_collision = type  if found is true
      found

    getShape: ->
      @_shape

    setShape: (shape) ->
      found = false
      for id of Class.SHAPE
        if shape is Class.SHAPE[id]
          found = true
          break
      @_shape = shape  if found is true
      found

    getFrame: ->
      if @_animation is null
        0
      else
        @_animation.frame

    setAnimation: (duration, settings, loop_) ->
      duration = (if typeof duration is "number" then duration else null)
      settings = (if Object::toString.call(settings) is "[object Object]" then settings else null)
      loop_ = (if loop_ is true then true else false)
      if duration isnt null or settings isnt null

        # Faster than an animationdefaults object lookup
        settings.frame = settings.frame or 0
        settings.frames = settings.frames or 10
        animation =
          start: @_clock
          frame: settings.frame
          frames: settings.frames
          duration: duration
          loop: loop_

        @_animation = animation

    clearAnimation: ->
      @_animation = null

    setEffect: (duration, data, settings, scope, loop_) ->
      duration = (if typeof duration is "number" then duration else ((if data.duration then data.duration else null)))
      settings = (if Object::toString.call(settings) is "[object Object]" then settings else null)
      scope = (if scope isnt undefined then scope else this)
      loop_ = (if loop_ is true then true else false)
      if duration isnt null and Object::toString.call(data) is "[object Object]" and data.callback instanceof Function
        position = @getPosition()
        effect =
          start: @_clock
          callback: data.callback
          clear: data.clear or null
          duration: duration
          scope: scope
          loop: loop_
          origin:
            x: position.x
            y: position.y
            z: position.z

        if Object::toString.call(data.defaults) is "[object Object]"
          effect.settings = lychee.extend({}, data.defaults, settings)
        else
          effect.settings = settings
        @_effect = effect

    clearEffect: ->
      @_effect.clear.call @_effect.scope, @_effect  if @_effect isnt null and @_effect.clear isnt null
      @_effect = null
