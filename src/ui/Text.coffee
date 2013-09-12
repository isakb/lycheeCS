lychee
.define("lychee.ui.Text")
.requires(["lychee.Font"])
.includes(["lychee.ui.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Text extends lychee.ui.Entity
    constructor: (settings) ->
      @font = settings.font or null
      @set settings.text
      settings.width = @width
      settings.height = @height
      delete settings.text
      delete settings.font
      lychee.ui.Entity.call this, settings

    get: ->
      @text

    set: (text) ->
      text = (if typeof text is "string" then text else "")
      @text = text
      if @font instanceof lychee.Font
        fs = @font.getSettings()
        width = 0
        height = 0
        t = 0
        l = @text.length

        while t < l
          chr = @font.get(@text[t])
          width += chr.real + fs.kerning
          height = Math.max(height, chr.height)
          t++
        @width = width
        @height = height
