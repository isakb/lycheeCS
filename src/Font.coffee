lychee
.define("Font")
.exports (lychee) ->

  class Font
    constructor: (spriteOrImages, settings) ->
      @settings = lychee.extend({}, @defaults, settings)
      @settings.kerning = @settings.spacing  if @settings.kerning > @settings.spacing
      @_cache = {}
      @_images = null
      @_sprite = null
      if Array.isArray spriteOrImages
        @_images = spriteOrImages
      else
        @_sprite = spriteOrImages
      @_init()


    defaults:

      # default charset from 32-126
      charset: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
      baseline: 0
      spacing: 0
      kerning: 0
      map: null

    _init: ->
      # Single Image Mode
      if @_images isnt null
        @_initImages()
      # Sprite Image Mode
      else if @_sprite isnt null and Array.isArray @settings.map
        test = @settings.map[0]
        if lychee.isObject test
          @_initSpriteXY()
        else if typeof test is "number"
          @_initSpriteX()

    _initImages: ->
      c = 0
      l = @settings.charset.length

      while c < l
        image = @_images[c] or null
        continue  if image is null
        chr =
          id: @settings.charset[c]
          image: image
          width: image.width
          height: image.height
          x: 0
          y: 0

        @_cache[chr.id] = chr
        c++

    _initSpriteX: ->
      offset = @settings.spacing
      c = 0
      l = @settings.charset.length

      while c < l
        chr =
          id: @settings.charset[c]
          width: @settings.map[c] + @settings.spacing * 2
          height: @_sprite.height
          real: @settings.map[c]
          x: offset - @settings.spacing
          y: 0

        offset += chr.width
        @_cache[chr.id] = chr
        c++

    _initSpriteXY: ->
      c = 0
      l = @settings.charset.length

      while c < l
        frame = @settings.map[c]
        chr =
          id: @settings.charset[c]
          width: frame.width + @settings.spacing * 2
          height: frame.height
          real: frame.width
          x: frame.x - @settings.spacing
          y: frame.y

        @_cache[chr.id] = chr
        c++

    get: (id) ->
      return @_cache[id]  if @_cache[id] isnt undefined
      null

    getSettings: ->
      @settings

    getSprite: ->
      @_sprite
