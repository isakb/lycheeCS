lychee
.define("lychee.game.Jukebox")
.requires(["lychee.game.Loop"])
.includes(["lychee.Jukebox"])
.exports (lychee, global) ->

  class lychee.game.Jukebox
    constructor: (maxPoolSize, loop_) ->
      lychee.Jukebox.call this, maxPoolSize
      @_clock = 0
      @_effects = {}
      @_effectId = 0
      loop_.bind "update", @update, this  if loop_ instanceof lychee.game.Loop


    update: (clock, delta) ->
      for e of @_effects
        effect = @_effects[e]
        continue  if effect is null
        if effect.end <= @_clock
          @stop effect.id  if effect.type is "fade-out"
          @_effects[e] = null
          continue
        pos = (@_clock - effect.start) / (effect.end - effect.start)
        if effect.type is "fade-in"
          @setVolume effect.id, pos * effect.diff
        else @setVolume effect.id, (1 - pos) * effect.diff  if effect.type is "fade-out"
      @_clock = clock

    fadeIn: (id, duration, loop_, volume) ->
      id = (if typeof id is "string" then id else null)
      duration = (if typeof duration is "number" then duration else 1000)
      loop_ = (if loop_ is true then true else false)
      volume = (if typeof volume is "number" then volume else 1)
      if id isnt null
        @play id, loop_
        @setVolume id, 0
        effect =
          id: id
          type: "fade-in"
          start: @_clock
          end: @_clock + duration
          diff: volume

        @_effects[++@_effectId] = effect

    fadeOut: (id, duration) ->
      id = (if typeof id is "string" then id else null)
      duration = (if typeof duration is "number" then duration else 1000)
      if id isnt null
        currentVolume = @getVolume(id)
        effect =
          id: id
          type: "fade-out"
          start: @_clock
          end: @_clock + duration
          diff: currentVolume

        @_effects[++@_effectId] = effect

    removeEffects: (id, type) ->
      id = (if typeof id is "string" then id else null)
      type = (if typeof type is "string" then type else null)
      found = false
      for e of @_effects
        if @_effects[e] isnt null and (id is null or @_effects[e].id is id) and (type is null or @_effects[e].type is type)
          @_effects[e] = null
          found = true
      found
