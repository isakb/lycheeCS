lychee
.define("Track")
.tags(platform: "html")
.supports((lychee, global) ->
  return true  if global.Audio
  false
).exports (lychee, global) ->

  _mime =
    "3gp": ["audio/3gpp"]
    "aac": ["audio/aac", "audio/aacp"]
    "amr": ["audio/amr"]
    "caf": ["audio/x-caf", "audio/x-aiff; codecs=\"IMA-ADPCM, ADPCM\""]
    "m4a": ["audio/mp4; codecs=mp4a"]
    "mp3": ["audio/mpeg"]
    "mp4": ["audio/mp4"]
    "ogg": ["application/ogg", "audio/ogg", "audio/ogg; codecs=theora, vorbis"]
    "wav": ["audio/wave", "audio/wav", "audio/wav; codecs=\"1\"", "audio/x-wav", "audio/x-pn-wav"]
    "webm": ["audio/webm", "audio/webm; codecs=vorbis"]

  _audio = null
  _context = null

  if global.Audio
    # Basic Audio API
    _audio = new Audio()

    # Advanced Audio API
    if global.AudioContext
      _context = new AudioContext()
    else _context = new webkitAudioContext()  if global.webkitAudioContext

  _codecs = {}
  if _audio isnt null
    for ext of _mime
      data = _mime[ext]
      for d in [0...data.length]
        if _audio.canPlayType(data[d])
          _codecs[ext] = data[d]
        else _codecs[ext] = false  if _codecs[ext] is undefined

  _supportedFormats = []
  for ext of _codecs
    _supportedFormats.push ext  if _codecs[ext] isnt false
  console.log "lychee.Track: Supported media formats are " + _supportedFormats.join(", ")  if lychee.debug is true


  class Track
    constructor: (id, settings, isReady) ->
      isReady = (if isReady is true then true else false)
      throw "Your Browser does not support HTML5 Audio."  if _audio is null
      @id = id
      @settings = lychee.extend({}, @defaults, settings)
      @_endTime = 0
      @_isIdle = true
      @_isLooping = false
      @_isMuted = false
      @_isReady = isReady
      playableFormat = null
      f = 0
      l = @settings.formats.length

      while f < l
        format = @settings.formats[f]
        playableFormat = format  if playableFormat is null and _codecs[format] isnt false
        f++
      if playableFormat is null
        throw "Your Environment does only support these codecs: " + _supportedFormats.join(", ")
      else
        @_init @settings.base + "." + playableFormat


  class AdvancedAudioApi
    defaults:
      base: null
      buffer: null
      formats: []


    #
    #			 * PRIVATE API
    #
    _init: (url) ->

      # Shared context = more performance
      @_context = _context
      @_gain = @_context.createGainNode()
      @_loopingBuffer = null
      if @settings.buffer is null
        that = this
        xhr = new XMLHttpRequest()
        xhr.open "GET", url
        xhr.responseType = "arraybuffer"
        xhr.onload = ->
          that._context.decodeAudioData xhr.response, (buffer) ->
            that.settings.buffer = buffer
            that._isReady = true


        xhr.send()
      else
        @_isReady = true


    #
    #			 * PUBLIC API
    #
    play: (loop_) ->
      loop_ = (if loop_ is true then true else false)
      if @_isReady is true
        source = @_context.createBufferSource()
        source.buffer = @settings.buffer
        source.connect @_gain
        source.connect @_context.destination
        source.noteOn @_context.currentTime
        if loop_ is true
          source.loop = loop_
          @_loopingBuffer = source
          @_endTime = Infinity
        else
          @_endTime = Date.now() + (source.buffer.duration * 1000)
        @_isIdle = false
        @_isLooping = loop_

    stop: ->
      @_isIdle = true
      @_isLooping = false
      if @_loopingBuffer isnt null
        @_loopingBuffer.disconnect @_gain
        @_loopingBuffer.disconnect @_context.destination
        @_loopingBuffer = null


    # TODO: Implement pause and resume methods,
    # At the time this was written, there was only
    # a setTimeout() way of doing this, but it caused
    # several timing problems due to different behaviours
    # of timeouts if a Page/Tab is hidden
    pause: ->
      @_wasLoopingBeforePause = @_isLooping
      @stop()

    resume: ->
      @play @_wasLoopingBeforePause

    mute: ->
      if @_isMuted is false
        @_unmuteVolume = @_gain.gain.value
        @_gain.gain.value = 0
        @_isMuted = true

    unmute: ->
      if @_isMuted is true
        @_gain.gain.value = @_unmuteVolume or 1
        @_isMuted = false

    clone: ->
      id = @id
      settings = lychee.extend({}, @settings)
      new lychee.Track(id, settings, @_isReady)

    isIdle: ->
      @_isIdle = true  if Date.now() > @_endTime
      @_isIdle

    isMuted: ->
      @_isMuted

    isReady: ->
      @isIdle() and @_isReady

    getVolume: ->
      @_gain.gain.value

    setVolume: (volume) ->
      newVolume = Math.min(Math.max(0, volume), 1)
      @_gain.gain.value = newVolume


  class BasicAudioApi
    defaults:
      base: null
      formats: []


    #
    #			 * PRIVATE API
    #
    _init: (url) ->
      @_audio = new Audio(url)
      @_audio.autobuffer = true # old WebKit
      @_audio.preload = true # new WebKit
      @_audio.load()
      that = this
      @_audio.addEventListener "ended", (->
        that._onEnd()
      ), true
      if @_isReady is false
        @_audio.addEventListener "canplaythrough", (->
          that._isReady = true
        ), true
        setTimeout (->
          that._isReady = true
        ), 500

    _onEnd: ->
      if @_isLooping is true
        @play true
        false
      else
        @_isIdle = true
        true

    _resetPointer: ->
      try
        @_audio.currentTime = 0


    #
    #			 * PUBLIC API
    #
    play: (loop_) ->
      loop_ = (if loop_ is true then true else false)
      if @_isReady is true
        @_resetPointer()
        @_audio.play()
        @_endTime = Date.now() + (@_audio.duration * 1000)
        @_isIdle = false
        @_isLooping = loop_

    stop: ->
      @_isIdle = true
      @_isLooping = false
      @_audio.pause()
      @_resetPointer()

    pause: ->
      @_audio.pause()

    resume: ->
      @_audio.play()

    mute: ->
      if @_isMuted is false
        @_unmuteVolume = @_audio.volume
        @_audio.volume = 0
        @_isMuted = true

    unmute: ->
      if @_isMuted is true
        @_audio.volume = @_unmuteVolume or 1
        @_isMuted = false

    clone: ->
      id = @id
      settings = lychee.extend({}, @settings)
      new lychee.Track(id, settings, true)

    isIdle: ->
      return @_onEnd()  if Date.now() > @_endTime
      return @_onEnd()  if @_audio.currentTime >= @_audio.duration
      @_isIdle

    isMuted: ->
      @_isMuted

    isReady: ->
      @isIdle() and @_isReady is true

    getVolume: ->
      @_audio.volume

    setVolume: (volume) ->
      newVolume = Math.min(Math.max(0, volume), 1)
      @_audio.volume = newVolume


  apiPrototype = if _context isnt null
    AdvancedAudioApi.prototype
  else if _audio isnt null
    BasicAudioApi.prototype
  else
    {}

  for name, prop of apiPrototype
    Track::[name] = prop

  Track
