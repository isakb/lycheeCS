lychee
.define("lychee.game.State")
.includes(["lychee.Events"])
.exports (lychee) ->

  class State
    constructor: (game, id) ->
      @game = game
      @id = id
      lychee.Events.call this, "state-" + id

    enter: ->
      @trigger "enter"

    leave: ->
      @trigger "leave"

    render: (clock, delta) ->

    update: (clock, delta) ->
