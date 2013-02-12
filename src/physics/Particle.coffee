lychee
.define("lychee.physics.Particle")
.exports (lychee, global) ->

  class lychee.physics.Particle
    constructoor: (data) ->
      settings = lychee.extend({}, @defaults, data)
      @_force =
        x: 0
        y: 0
        z: 0

      @_position =
        x: 0
        y: 0
        z: 0

      @_velocity =
        x: 0
        y: 0
        z: 0

      @_damping = 1
      @_inverseMass = null
      settings.force isnt null and @setForce(settings.force)
      settings.mass isnt null and @setMass(settings.mass)
      settings.position isnt null and @setPosition(settings.position)
      settings.velocity isnt null and @setVelocity(settings.velocity)
      settings = null


    defaults:
      force: null
      mass: null
      position: null
      velocity: null


    #
    # PUBLIC API
    #
    update: (clock, delta) ->

      # Skip if our physical mass is Infinity
      return  if @_inverseMass is null
      t = delta / 1000
      if t > 0
        @_position.x += @_velocity.x * t
        @_position.y += @_velocity.y * t
        @_position.z += @_velocity.z * t
        @_velocity.x += (@_force.x * @_inverseMass) * t
        @_velocity.y += (@_force.y * @_inverseMass) * t
        @_velocity.z += (@_force.z * @_inverseMass) * t


    # This is a Math.pow(this._damping, t) in bitwise arithmetic
    # var damping = (this._damping << delta) / 1000;

    # this._velocity.x *= damping;
    # this._velocity.y *= damping;
    # this._velocity.z *= damping;

    #
    # GETTERS AND SETTERS
    #
    getDamping: ->
      @_damping

    setDamping: (damping) ->
      damping = (if typeof damping is "number" then damping else null)
      if damping isnt null
        @_damping = damping
        return true
      false

    getForce: ->
      @_force

    setForce: (force) ->
      if Object::toString.call(force) is "[object Object]"
        @_force.x = (if typeof force.x is "number" then force.x else @_force.x)
        @_force.y = (if typeof force.y is "number" then force.y else @_force.y)
        @_force.z = (if typeof force.z is "number" then force.z else @_force.z)
        return true
      false

    getMass: ->
      return (1 / @_inverseMass)  if @_inverseMass isnt null
      Infinity

    setMass: (mass) ->
      if mass isnt 0
        @_inverseMass = 1 / mass
        return true
      false

    getPosition: ->
      @_position

    setPosition: (position) ->
      if Object::toString.call(position) is "[object Object]"
        @_position.x = (if typeof position.x is "number" then position.x else @_position.x)
        @_position.y = (if typeof position.y is "number" then position.y else @_position.y)
        @_position.z = (if typeof position.z is "number" then position.z else @_position.z)
        return true
      false

    getVelocity: ->
      @_velocity

    setVelocity: (velocity) ->
      if Object::toString.call(velocity) is "[object Object]"
        @_velocity.x = (if typeof velocity.x is "number" then velocity.x else @_velocity.x)
        @_velocity.y = (if typeof velocity.y is "number" then velocity.y else @_velocity.y)
        @_velocity.z = (if typeof velocity.z is "number" then velocity.z else @_velocity.z)
        return true
      false
