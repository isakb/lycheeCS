lychee
.define("Events")
.exports (lychee, global) ->

  _id = 0

  class Events
    constructor: (@_namespace) ->
      _id += 1
      @_parents = []
      @_children = []
      @_events = {}
      @_eventsLength = 0
      @_id = _id
      @_callerId = 0

    subscribe: (object, as) ->
      return false  unless object instanceof Events
      (if as is "child" then @_children else @_parents).push object
      true

    unsubscribe: (object, as) ->
      return false  unless object instanceof Events
      as = if as is "child" then "child" else "parent"
      list = if as is "child" then @_children else @_parents
      found = false
      i = 0
      l = list.length
      while i < l
        entry = list[i]
        if entry is object
          found = true
          list.splice i, 1
          l--
        i++
      !!found

    bind: (type, callback, scope, once) ->
      passSelf = false
      if type.substr(0, 1) is "#"
        type = type.substr(1, type.length - 1)
        passSelf = true
      @_events[type] = []  if @_events[type] is undefined
      parents = type.match(/\./g)
      @_events[type].push
        parents: if parents isnt null then parents.length else 0
        callback: callback
        scope: scope or global
        passSelf: passSelf
        once: once or false
        at: @_callerId

    unbind: (type, callback, scope) ->
      callback = if callback instanceof Function then callback else null
      scope = if scope isnt undefined then scope else null
      return true  if @_events[type] is undefined
      found = false
      i = 0
      l = @_events[type].length
      while i < l
        entry = @_events[type][i]
        if (callback is null or entry.callback is callback) and
        (scope is null or entry.scope is scope)
          found = true
          @_events[type].splice i, 1
          l--
        i++
      !!found

    trigger: (type, data, direction) ->
      direction = if direction isnt undefined then direction else true
      data = []  if data is undefined
      data._origin = @_id  if data._origin is undefined
      data._handled = {}  if data._handled is undefined
      return null  if data._handled[@_id] is true
      return true  if direction is true and @_triggerChildren(type, data, direction) is true
      return true  if @_trigger(type, data) is true
      return true  if direction isnt false and direction isnt null and @_triggerParents(type, data, direction) is true
      false

    _trigger: (type, data) ->
      blocked = false
      data._handled[@_id] = true  if data isnt undefined
      @_callerId++
      if @_events[type] isnt undefined
        passData = data
        for entry in @_events[type]
          continue  if entry.at >= @_callerId
          if entry.passSelf is true
            passData = [this]
            passData.push.apply passData, data
          blocked = true  if entry.callback.apply(entry.scope, passData) is true
          @unbind type, entry.callback, entry.scope  if entry.once is true
      !!blocked

    _triggerChildren: (type, data, direction) ->
      blocked = false
      for child in @_children
        blocked = true  if child.trigger(type, data, direction) is true
      !!blocked

    _triggerParents: (type, data, direction) ->
      blocked = false
      if @_parents.length > 0
        newData = [this]
        newData.push.apply newData, data
        newData._origin = if data then data._origin else null
        newData._handled = if data then data._handled else null
        for parent in @_parents
          continue  if parent._id is data._origin
          blocked = true  if parent.trigger(@_namespace + "." + type, newData, direction) is true
      !!blocked
