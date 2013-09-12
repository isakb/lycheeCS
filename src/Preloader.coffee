
# Preloader is platform specific and required for lychee.Builder
do (lychee = lychee, global = (if typeof global isnt "undefined" then global else this)) ->
  _instances = []
  _cache = {}
  _globalIntervalId = null
  _globalInterval = ->
    timedOutInstances = 0

    for instance in _instances
      isReady = true
      for url of instance._pending
        isReady = false  if instance._pending[url] is true or _cache[url] is undefined
      timedOut = false
      timedOut = Date.now() >= instance._clock + instance._timeout  if instance._clock isnt null
      if isReady is true or timedOut is true
        errors = {}
        ready = {}
        map = {}
        for url of instance._pending
          if instance._fired[url] is undefined
            if instance._pending[url] is false
              ready[url] = _cache[url] or null
            else
              errors[url] = null
            map[url] = instance._map[url] or null
            instance._fired[url] = true
        instance.trigger "error", [errors, map]  if Object.keys(errors).length > 0
        instance.trigger "ready", [ready, map]  if Object.keys(ready).length > 0

        # Reset the clock if the lychee.Preloader timed out
        timedOutInstances++  if timedOut is true


    if timedOutInstances is _instances.length
      console.log "lychee.Preloader: Nothing to do, switching to idle mode."  if lychee.debug is true
      for i in _instances
        i._clock = null
      global.clearInterval _globalIntervalId
      _globalIntervalId = null


  class lychee.Preloader

    constructor: (data) ->
      settings = lychee.extend({}, data)
      settings.timeout = (if typeof settings.timeout is "number" then settings.timeout else @defaults.timeout)
      @_timeout = settings.timeout
      @_events = {}
      @_fired = {} # cached fired events per request
      @_map = {} # associated data per request
      @_pending = {} # pending requests
      @_clock = null
      _instances.push this
      settings = null


    defaults:
      timeout: 3000


    #
    # EVENT BINDINGS
    #
    # (not using lychee.Events
    #  due to no-dependency
    #  reasons)
    #
    bind: (event, callback, scope) ->
      event = (if typeof event is "string" then event else null)
      callback = (if callback instanceof Function then callback else null)
      scope = (if scope isnt undefined then scope else this)
      if event isnt null and callback isnt null
        @_events[event] =
          callback: callback
          scope: scope

    unbind: (event) ->
      event = (if typeof event is "string" then event else null)
      if event isnt null and @_events[event] isnt undefined
        delete @_events[event]
        return true
      false

    trigger: (event, args = []) ->
      if @_events[event]
        @_events[event].callback.apply @_events[event].scope, args
        return true
      false


    #
    # PUBLIC API
    #
    load: (urls, map = null, forced) ->
      urls = if typeof urls is "string" then [urls] else urls
      return false  unless Array.isArray(urls)
      map = if map isnt undefined then map else null
      forced = if typeof forced is "string" then forced else null
      @_clock = Date.now()

      # 1. Load the assets via platform-specific APIs
      u = 0
      l = urls.length

      while u < l
        url = urls[u]
        tmp = url.split(/\./)
        if @_pending[url] is undefined
          @_map[url] = map  if map isnt null

          # 1.1 Check if another lychee.Preloader
          # instance already loaded the requested
          # URL to the shared cache.
          if _cache[url]?
            @_pending[url] = false
          else
            if forced isnt null
              @_load url, forced, _cache
            else
              @_load url, tmp[tmp.length - 1], _cache
        u++

      # 2. Start the global interval
      if _globalIntervalId is null
        _globalIntervalId = global.setInterval((->
          _globalInterval()
        ), 100)

    get: (url) ->
      return _cache[url]  if _cache[url] isnt undefined
      null


    #
    # PLATFORM-SPECIFIC Implementation
    #

    _load: (url, type, _cache) ->
      throw new Error "lychee.Preloader: You need to include the platform-specific bootstrap.js to load other files."

    _progress: (url, _cache) ->
