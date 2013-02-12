if typeof global isnt "undefined"
  global.lychee = {}
else
  @lychee = {}

do (lychee = lychee, global = (if typeof global isnt "undefined" then global else this)) ->
  _tree = {}
  _tags = {}

  # default paths
  _bases = lychee: "./lychee"

  lychee.define = (name) ->
    namespace = null
    classname = null
    if name.match(/\./)
      tmp = name.split(".")
      classname = tmp[tmp.length - 1]
      tmp.pop()
      namespace = tmp.join(".")
    else
      classname = name
      namespace = "lychee"
    new lychee.DefinitionBlock(namespace, classname)

  lychee.extend = (obj, objs...) ->
    for obj2 in objs
      if obj2
        for prop of obj2
          obj[prop] = obj2[prop]
    obj

  lychee.rebase = (settings) ->
    settings = (if Object::toString.call(settings) is "[object Object]" then settings else null)
    if settings isnt null
      for namespace of settings
        _bases[namespace] = settings[namespace]
    lychee

  lychee.tag = (settings) ->
    settings = (if Object::toString.call(settings) is "[object Object]" then settings else null)
    if settings isnt null
      for tag of settings
        values = null
        if Object::toString.call(settings[tag]) is "[object Array]"
          values = settings[tag]
        else values = [settings[tag]]  if typeof settings[tag] is "string"
        _tags[tag] = values  if values isnt null
    lychee

  lychee.getEnvironment = ->
    tree: _tree
    tags: _tags
    bases: _bases

  lychee.build = (callback, scope) ->
    throw "lychee.build: You need to include the lychee.Builder to build the dependency tree."


  class lychee.DefinitionBlock

    constructor: (space, name) ->
      # allows new lychee.DefinitionBlock('Renderer') without a namespace
      space = (if typeof name is "string" then space else null)
      name = (if typeof name is "string" then name else space)
      @_space = space
      @_name = name
      @_tags = {}
      @_requires = []
      @_includes = []
      @_exports = null
      @_supports = null
      this

    _throw: (message) ->
      console.warn "lychee.DefinitionBlock: Use lychee.define('" + @_space + "." + @_id + "')." + message + " instead.", this  if lychee.debug is true

    tags: (tags) ->
      if Object::toString.call(tags) isnt "[object Object]"
        @_throw "tags({ tag: 'value' })"
        return this
      for name of tags
        value = tags[name]
        @_tags[name] = value
      this

    supports: (supports) ->
      if not supports instanceof Function
        @_throw "supports(function() {})"
        return this
      @_supports = supports
      this

    requires: (requires) ->
      if Object::toString.call(requires) isnt "[object Array]"
        @_throw "requires([ 'array', 'of', 'requirements' ])"
        return this
      r = 0
      l = requires.length

      while r < l
        id = undefined
        if requires[r].match(/\./)
          id = requires[r]
        else if @_space isnt null
          id = @_space + "." + requires[r]
        else
          id = requires[r]
        @_requires.push id
        r++
      this

    includes: (includes) ->
      if Object::toString.call(includes) isnt "[object Array]"
        @_throw "includes([ 'array', 'of', 'includes' ])"
        return this
      i = 0
      l = includes.length

      while i < l
        id = undefined

        # TODO: This needs to be more generic
        # but dunno how atm
        if includes[i].match(/\./)
          id = includes[i]
        else if @_space isnt null
          id = @_space + "." + includes[i]
        else
          id = includes[i]
        @_includes.push id
        i++
      this

    exports: (exports) ->
      if not exports instanceof Function
        @_throw "exports(function(lychee, global) { })"
        return this
      @_exports = exports
      _tree[@_space + "." + @_name] = this  if (@_supports is null or @_supports.call(global, lychee, global) is true) and not _tree[@_space + "." + @_name]?


#
# *
# * POLYFILLS FOR CRAPPY ENVIRONMENTS
# *
# *
# * This is apparently only for
# * Internet Explorer and NodeJS
# *
# * Thanks for being 2 lazy 2 implement
# * the Console API, bitches! :)
# *
#
do (global = (if typeof global isnt "undefined" then global else this)) ->
  if global.console.log is undefined # stub!
    global.console.log = ->
  global.console.error = global.console.log  if global.console.error is undefined
  global.console.warn = global.console.log  if global.console.warn is undefined
  if global.console.group is undefined
    global.console.group = (title) ->
      console.log "~ ~ ~ " + title + "~ ~ ~"
  if global.console.groupEnd is undefined
    global.console.groupEnd = ->
      console.log "~ ~ ~ ~ ~ ~"
