do (lychee = @lychee, global = this) ->

  lychee.Preloader::_load = (url, type, _cache) ->
    that = this

    # 1. JavaScript
    if type is "js"
      @_pending[url] = true
      script = document.createElement("script")
      script.async = true
      script.onload = ->
        that._pending[url] = false
        _cache[url] = ""
        that._progress url, _cache

      script.src = url
      document.body.appendChild script

    # 2. JSON
    else if type is "json"
      @_pending[url] = true
      xhr = new XMLHttpRequest()
      xhr.open "GET", url, true
      xhr.setRequestHeader "Content-Type", "application/json; charset=utf8"
      xhr.onreadystatechange = ->
        if xhr.readyState is 4
          data = null
          try
            data = JSON.parse(xhr.responseText)
          catch e
            console.warn "JSON file at " + url + " is invalid."
          that._pending[url] = false
          _cache[url] = data
          that._progress url, _cache

      xhr.send null

    # 3. Images
    else if type.match(/bmp|gif|jpg|jpeg|png/)
      @_pending[url] = true
      img = new Image()
      img.onload = ->
        that._pending[url] = false
        _cache[url] = this
        that._progress url, _cache

      img.src = url

    # 4. CSS (won't affect JavaScript anyhow)
    else if type is "css"
      @_pending[url] = false
      _cache[url] = ""
      link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      document.head.appendChild link

    # 5. Unknown File Types (will be loaded as text)
    else
      @_pending[url] = true
      xhr = new XMLHttpRequest()
      xhr.open "GET", url, true
      xhr.onreadystatechange = ->
        if xhr.readyState is 4 and xhr.status is 200 or xhr.status is 304
          data = xhr.responseText or xhr.responseXML or null
          that._pending[url] = false
          _cache[url] = data
          that._progress url, _cache

      xhr.send null
