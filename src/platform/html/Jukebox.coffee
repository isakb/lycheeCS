lychee
.define("Jukebox")
.tags(platform: "html")
.requires(["lychee.Track"])
.exports (lychee, global) ->

  class Jukebox
    constructor: (maxPoolSize) ->
      @_maxPoolSize = (if typeof maxPoolSize is "number" then maxPoolSize else 8)
      @_tracks = {}
      @_pool = {}
      @_poolSize = 0

    add: (track) ->
      @_tracks[track.id] = track  if track instanceof lychee.Track

    play: (id, loop_) ->
      id = (if typeof id is "string" then id else null)
      loop_ = (if loop_ is true then true else false)
      throw new Error("Unknown Track ID, add the Track before playing it.")  if id is null or @_tracks[id] is undefined
      pId = undefined
      track = undefined

      # Try to find an identical idling track
      for pId of @_pool
        track = @_pool[pId]
        if track.id is id and track.isReady() is true
          track.play loop_
          return true

      # Try to use free pool space for playback
      if @_poolSize < @_maxPoolSize
        pId = ++@_poolSize
        @_pool[pId] = @_tracks[id].clone()
        @_pool[pId].play loop_
        return true

      # No free poolspace? Overwrite an idling track with requested one
      for pId of @_pool
        track = @_pool[pId]
        if @_poolSize is @_maxPoolSize and track.isReady() is true
          @_pool[pId] = @_tracks[id].clone()
          @_pool[pId].play loop_
          return true

      # FIXME: No idling track in pool? What to do now?
      false

    toggle: (id, loop_) ->
      id = (if typeof id is "string" then id else null)
      loop_ = (if loop_ is true then true else false)
      if id isnt null
        if @isPlaying(id) is true
          return @stop(id)
        else
          return @play(id, loop_)
      false

    stop: (id) ->
      id = (if typeof id is "string" then id else null)
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if id is null or track.id is id
          found = true
          track.stop()
      found

    mute: (id) ->
      id = (if typeof id is "string" then id else null)
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if id is null or track.id is id
          found = true
          track.mute()
      found

    unmute: (id) ->
      id = (if typeof id is "string" then id else null)
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if id is null or track.id is id
          found = true
          track.unmute()
      found

    isMuted: (id) ->
      id = (if typeof id is "string" then id else null)
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if (id is null or track.id is id) and track.isMuted() is true
          found = true
          break
      found

    isPlaying: (id) ->
      id = (if typeof id is "string" then id else null)
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if (id is null or track.id is id) and track.isIdle() is false
          found = true
          break
      found

    getVolume: (id) ->
      id = (if typeof id is "string" then id else null)
      volume = 0
      if id isnt null
        for pId of @_pool
          track = @_pool[pId]
          volume = Math.max(volume, track.getVolume())  if track.id is id
      volume

    setVolume: (id, volume) ->
      id = (if typeof id is "string" then id else null)
      volume = (if typeof volume is "number" then volume else null)
      return false  if volume > 1 or volume < 0
      found = false
      for pId of @_pool
        track = @_pool[pId]
        if id is null or track.id is id
          track.setVolume volume
          found = true
      found
