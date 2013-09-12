lychee
.define("lychee.ui.Button")
.requires(["lychee.ui.Sprite", "lychee.ui.Text"])
.includes(["lychee.ui.Entity"])
.exports (lychee, global) ->

  class lychee.ui.Button extends lychee.ui.Entity
    constructor: (data) ->
      settings = lychee.extend({}, data)
      @_background = null
      @_label = null
      settings.width = 0
      settings.height = 0
      if settings.background?
        @_background = settings.background
        settings.width = settings.background.width  if settings.background.width > settings.width
        settings.height = settings.background.height  if settings.background.height > settings.height
      if settings.label?
        @_label = settings.label
        settings.width = settings.label.width  if settings.label.width > settings.width
        settings.height = settings.label.height  if settings.label.height > settings.height
      super settings
      settings = null


    getBackground: ->
      @_background

    getLabel: ->
      @_label

    update: (clock, delta) ->
      @_label.update clock, delta  if @_label isnt null
      @_background.update clock, delta  if @_background isnt null
