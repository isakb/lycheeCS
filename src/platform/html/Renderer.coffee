
#	 Hint for check against undefined:
#
#	typeof CanvasRenderingContext2D is:
#	> function in Chrome, Firefox, IE10
#	> object in Safari, Safari Mobile

lychee
.define("Renderer")
.tags(platform: "html")
.requires(["lychee.Font"])
.supports((lychee, global) ->
  if typeof global.document isnt "undefined" and typeof global.document.createElement is "function" and typeof global.CanvasRenderingContext2D isnt "undefined"
    canvas = global.document.createElement("canvas")
    return true  if typeof canvas.getContext is "function"
  false
).exports (lychee, global) ->

  class Renderer
    constructor: (id) ->
      id = (if typeof id is "string" then id else null)
      @_id = id
      @_canvas = global.document.createElement("canvas")
      @_ctx = @_canvas.getContext("2d")
      @_environment =
        width: null
        height: null
        screen: {}
        offset: {}

      @_cache = {}
      @_state = null
      @_alpha = 1
      @_background = null
      @_width = 0
      @_height = 0

      # required for requestAnimationFrame
      @context = @_canvas
      @_canvas.id = @_id  if @_id isnt null
      global.document.body.appendChild @_canvas  unless @_canvas.parentNode


    #
    #	State and Environment Management
    #
    reset: (width, height, resetCache) ->
      width = (if typeof width is "number" then width else @_width)
      height = (if typeof height is "number" then height else @_height)
      resetCache = (if resetCache is true then true else false)
      @_cache = {}  if resetCache is true
      canvas = @_canvas
      @_width = width
      @_height = height
      canvas.width = width
      canvas.height = height
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      @_updateEnvironment()

    start: ->
      @_state = "running"  if @_state isnt "running"

    stop: ->
      @_state = "stopped"

    clear: ->
      return  if @_state isnt "running"

      # Some mobile devices have weird issues on rotations with clearRect()
      # Seems to be if the renderbuffer got bigger after rotation
      # this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

      # fillRect() renders correctly
      ctx = @_ctx
      canvas = @_canvas
      ctx.fillStyle = @_background
      ctx.fillRect 0, 0, canvas.width, canvas.height

    flush: ->

    isRunning: ->
      @_state is "running"

    getEnvironment: ->
      @_updateEnvironment()
      @_environment


    #
    # PRIVATE API: Helpers
    #
    _updateEnvironment: ->
      env = @_environment
      env.screen.width = global.innerWidth
      env.screen.height = global.innerHeight
      env.offset.x = @_canvas.offsetLeft
      env.offset.y = @_canvas.offsetTop
      env.width = @_width
      env.height = @_height


    #
    # Setters
    #
    setAlpha: (alpha) ->
      alpha = (if typeof alpha is "number" then alpha else null)
      @_ctx.globalAlpha = alpha  if alpha isnt null and alpha >= 0 and alpha <= 1

    setBackground: (color) ->
      color = (if typeof color is "string" then color else "#000000")
      @_background = color
      @_canvas.style.backgroundColor = color


    #
    # Drawing API
    #
    drawTriangle: (x1, y1, x2, y2, x3, y3, color, background, lineWidth) ->
      return  if @_state isnt "running"
      color = (if typeof color is "string" then color else "#000000")
      background = (if background is true then true else false)
      lineWidth = (if typeof lineWidth is "number" then lineWidth else 1)
      ctx = @_ctx
      ctx.beginPath()
      ctx.moveTo x1, y1
      ctx.lineTo x2, y2
      ctx.lineTo x3, y3
      ctx.lineTo x1, y1
      if background is false
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.stroke()
      else
        ctx.fillStyle = color
        ctx.fill()
      ctx.closePath()


    # points, x1, y1, [ ... x(a), y(a) ... ], [ color, background, lineWidth ]
    drawPolygon: (points, x1, y1) ->
      return  if @_state isnt "running"
      l = arguments.length
      if points > 3
        optargs = l - (points * 2) - 1
        color = "#000000"
        background = false
        lineWidth = 1
        if optargs is 3
          color = arguments[l - 3]
          background = arguments[l - 2]
          lineWidth = arguments[l - 1]
        else if optargs is 2
          color = arguments[l - 2]
          background = arguments[l - 1]
        else color = arguments[l - 1]  if optargs is 1
        ctx = @_ctx
        ctx.beginPath()
        ctx.moveTo x1, y1
        p = 1

        while p < points
          ctx.lineTo arguments[1 + p * 2], arguments[1 + p * 2 + 1]
          p++
        ctx.lineTo x1, y1
        if background is false
          ctx.lineWidth = lineWidth
          ctx.strokeStyle = color
          ctx.stroke()
        else
          ctx.fillStyle = color
          ctx.fill()
        ctx.closePath()

    drawBox: (x1, y1, x2, y2, color, background, lineWidth) ->
      return  if @_state isnt "running"
      color = (if typeof color is "string" then color else "#000000")
      background = (if background is true then true else false)
      lineWidth = (if typeof lineWidth is "number" then lineWidth else 1)
      ctx = @_ctx
      if background is false
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.strokeRect x1, y1, x2 - x1, y2 - y1
      else
        ctx.fillStyle = color
        ctx.fillRect x1, y1, x2 - x1, y2 - y1

    drawCircle: (x, y, radius, color, background, lineWidth) ->
      return  if @_state isnt "running"
      color = (if typeof color is "string" then color else "#000000")
      background = (if background is true then true else false)
      lineWidth = (if typeof lineWidth is "number" then lineWidth else 1)
      ctx = @_ctx
      ctx.beginPath()
      ctx.arc x, y, radius, 0, Math.PI * 2
      if background is false
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.stroke()
      else
        ctx.fillStyle = color
        ctx.fill()
      ctx.closePath()

    drawLine: (x1, y1, x2, y2, color, lineWidth) ->
      return  if @_state isnt "running"
      color = (if typeof color is "string" then color else "#000000")
      lineWidth = (if typeof lineWidth is "number" then lineWidth else 1)
      ctx = @_ctx
      ctx.beginPath()
      ctx.moveTo x1, y1
      ctx.lineTo x2, y2
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      ctx.stroke()
      ctx.closePath()

    drawSprite: (x1, y1, sprite, map) ->
      return  if @_state isnt "running"
      map = (if Object::toString.call(map) is "[object Object]" then map else null)
      if map is null
        @_ctx.drawImage sprite, x1, y1
      else
        @drawBox x1, y1, x1 + map.w, y1 + map.h, "#ff0000", false, 1  if lychee.debug is true
        @_ctx.drawImage sprite, map.x, map.y, map.w, map.h, x1, y1, map.w, map.h

    drawText: (x1, y1, text, font) ->
      return  if @_state isnt "running"
      font = (if font instanceof lychee.Font then font else null)
      if font isnt null
        settings = font.getSettings()
        sprite = font.getSprite()
        chr = undefined
        t = undefined
        l = undefined

        # Measure text if we have to center it later
        if x1 is "center" or y1 is "center"
          width = 0
          height = 0
          t = 0
          l = text.length

          while t < l
            chr = font.get(text[t])
            width += chr.real + settings.kerning
            height = Math.max(height, chr.height)
            t++
          x1 = (@_width / 2) - (width / 2)  if x1 is "center"
          y1 = (@_height / 2) - (height / 2)  if y1 is "center"
        margin = 0
        t = 0
        l = text.length

        while t < l
          chr = font.get(text[t])
          @drawBox x1 + margin, y1, x1 + margin + chr.real, y1 + chr.height, "#ffff00", false, 1  if lychee.debug is true
          @_ctx.drawImage chr.sprite or sprite, chr.x, chr.y, chr.width, chr.height, x1 + margin - settings.spacing, y1 + settings.baseline, chr.width, chr.height
          margin += chr.real + settings.kerning
          t++
