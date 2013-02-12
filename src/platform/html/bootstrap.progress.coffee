do (lychee, global = this) ->
  _bar = null
  _progress = null
  _message = null

  if typeof global.document isnt "undefined" and typeof global.document.addEventListener is "function"
    _bar = global.document.createElement("div")
    _bar.id = "bootstrap-progress-bar"
    _progress = global.document.createElement("div")
    _progress.id = "bootstrap-progress-progress"
    _message = global.document.createElement("div")
    _message.id = "bootstrap-progress-message"
    _bar.appendChild _progress
    _bar.appendChild _message
    global.document.addEventListener "DOMContentLoaded", (->
      global.document.body.appendChild _bar
    ), false

  _count = (obj) ->
    count = 0
    for o of obj
      count++  if obj[o] is true
    count

  lychee.Preloader::_progress = (url, _cache) ->

    # called inside lychee.build()
    if url is null and _cache is null
      _bar.parentNode.removeChild _bar
      return
    ready = Object.keys(_cache).length
    loading = _count(@_pending)
    percentage = (ready / (ready + loading) * 100) | 0
    _progress.style.width = percentage + "%"  if _progress isnt null
    _message.innerText = url + " (" + loading + " left)"  if _message isnt null
