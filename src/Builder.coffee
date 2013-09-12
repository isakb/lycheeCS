do (lychee = lychee, global = (if typeof global isnt "undefined" then global else this)) ->
  # Asynchronous loading, this file
  # can be ready before lycheeJS core.
  global.lychee = lychee = {}  if lychee is undefined

  class lychee.Builder
    constructor: ->
      @_attachments = {}
      @_classes = {}
      @_namespaces = {}
      @_packages = {}

      # will be set in build()
      @_tree = null
      @_bases = null
      @_tags = null
      @_buildStart = null
      @_buildOrder = []
      @_loading =
        packages: {}
        classes: {}

      @_buildCallback = null
      @_buildScope = null
      @_clock = 0

      # This stuff here can't timeout on slow internet connections!
      @_preloader = new lychee.Preloader(timeout: Infinity)
      @_preloader.bind "ready", @_load, this
      @_preloader.bind "error", @_unload, this


    #
    #
    # Loading Stuff
    #
    #
    _load: (assets, mappings) ->
      refresh = false
      for url of assets
        content = assets[url]
        mapping = mappings[url]
        uid = mapping.packageId + "." + mapping.classId
        if mapping isnt null

          # 1. Parse Package Configuration
          if mapping.packageId isnt null and mapping.classId is null
            @_packages[mapping.packageId] = content
            @_loading.packages[mapping.packageId] = false
            refresh = true
          else if mapping.packageId isnt null and mapping.classId isnt null
            mapping._loading--
            if url.substr(-2) is "js" and @_classes[uid] is undefined
              unless @_classes[uid]?
                lyDefBlock = @_tree[uid]
                if lyDefBlock isnt undefined
                  console.log "> using " + mapping.url  if lychee.debug is true
                  @_classes[uid] = lyDefBlock
                  @_attachments[uid] = mapping.attachments  if mapping.attachments.length > 0
                  @_preloader.load mapping.attachments, mapping  if mapping._loading isnt 0
                else if mapping.alternatives isnt undefined
                  candidate = mapping.alternatives[0]
                  candidate.namespaceId = mapping.namespaceId
                  candidate.refererId = mapping.refererId
                  candidate._loading = candidate.attachments.length + 1
                  candidate.alternatives =
                    mapping.alternatives.splice(1, mapping.alternatives.length - 1)  if mapping.alternatives.length > 1
                  @_loading.classes[uid] = true
                  @_preloader.load candidate.url, candidate
                else
                  console.warn "> loading " + uid + " failed. Either corrupt definition block at " + url + " or no alternatives available. (refered by " + mapping.refererId + ")"  if lychee.debug is true

                  # This will silently ignore the mistake and still "try" to build successfully.
                  @_loading.classes[uid] = false
                  @_classes[uid] = null
                  @_tree[uid] = null
            if mapping._loading is 0
              @_loading.classes[uid] = false
              refresh = true
            if mapping.namespaceId isnt null
              map = @_namespaces[mapping.packageId + "." + mapping.namespaceId]
              map._loading--
              @_loading.classes[mapping.packageId + "." + mapping.namespaceId] = false  if map.loading is 0
      @_refresh()  if refresh is true

    _unload: (assets, mappings) ->
      for url of mappings
        mapping = mappings[url]
        if mapping.packageId isnt null and mapping.classId is null
          @_packages[mapping.packageId] = null
          @_loading.packages[mapping.packageId] = false
        else if mapping.packageId isnt null and mapping.classId isnt null
          console.warn "Package Tree index is corrupt, couldn't load " + url + " (refered by " + mapping.packageId + "." + mapping.classId + ")"  if lychee.debug is true
          @_classes[mapping.packageId + "." + mapping.classId] = null
          if mapping.multiple isnt true
            @_loading.classes[mapping.packageId + "." + mapping.classId] = false
            console.log "No Alternatives available for " + url
      @_refresh()

    load: (packageId, classId, refererId) ->
      packageId = (if typeof packageId is "string" then packageId else null)
      classId = (if typeof classId is "string" then classId else null)
      refererId = (if typeof refererId is "string" then refererId else null)

      # 1. Load Package Configuration
      if packageId isnt null and classId is null
        if @_packages[packageId] is undefined
          url = (@_bases[packageId] or "") + "/package.json"
          console.log "> loading " + packageId + ": " + url  if lychee.debug is true
          @_loading.packages[packageId] = true
          @_preloader.load url,
            packageId: packageId
            classId: classId

          return

      # 2. Load Class
      else if packageId isnt null and classId isnt null

        # Wait for next _refresh() if package config wasn't loaded yet
        return  unless @_packages[packageId]?
        if @_classes[packageId + "." + classId] is undefined
          candidates = @_fuzzySearch(packageId, classId)
          if candidates isnt null
            if lychee.debug is true
              urls = [c.url for c in candidates]
              console.log "> loading " + packageId + "." + classId, urls.join(", ")
            namespaceId = null
            if classId.indexOf("*") > 0
              namespaceId = classId.substr(0, classId.indexOf("*") - 1)
              overallRequired = 0
              for c in candidates
                overallRequired += c.attachments.length + 1
              @_loading.classes[packageId + "." + namespaceId] = true
              @_namespaces[packageId + "." + namespaceId] = loading: overallRequired
            if candidates.length > 0
              candidate = candidates[0]
              candidate.namespaceId = namespaceId
              candidate.refererId = refererId
              candidate._loading = candidate.attachments.length + 1
              candidate.alternatives = candidates.splice(1, candidates.length - 1)  if candidates.length > 1
              @_loading.classes[candidate.packageId + "." + candidate.classId] = true
              @_preloader.load candidate.url, candidate
              return
      console.warn "> loading " + packageId + "." + classId + " failed. (required by " + refererId + ")"  if lychee.debug is true


    #
    #
    # Parsing Stuff
    #
    #
    _getAllIdsFromTree: (tree, prefix, ids) ->
      prefix = (if typeof prefix is "string" then prefix else "")
      returnTree = false
      if not Array.isArray(ids)
        ids = []
        returnTree = true
      for id of tree
        node = tree[id]
        type = Object::toString.call(node)
        subprefix = (if prefix.length then prefix + "/" + id else id)
        switch type

          # 1. Valid Class Definition
          when "[object Array]"
            ids.push subprefix
          when "[object Object]"
            @_getAllIdsFromTree node, subprefix, ids
      ids  if returnTree is true

    _getNamespace: (namespace, scope) ->
      pointer = scope
      ns = namespace.split(".")
      for name in ns
        pointer[name] = {}  if pointer[name] is undefined
        pointer = pointer[name]
      pointer

    _getNodeFromTree: (tree, path, seperator) ->
      node = tree
      tmp = path.split(seperator)
      node = node[tmp.shift()]  while tmp.length
      node

    _fuzzySearch: (packageId, classId) ->
      base = @_bases[packageId]
      id = ""
      path = classId.split(".").join("/")
      config = @_packages[packageId] or null
      return null  if config is null and @_loading.packages[packageId] is true
      candidates = []
      if config isnt null
        tree = config.tree
        all = @_getAllIdsFromTree(tree, "")
        filtered = {}

        # 1. Tags have highest priority
        for tag of @_tags
          values = @_tags[tag]
          v = 0
          l = values.length

          while v < l
            value = values[v]
            if config.tags[tag] and config.tags[tag][value]
              folder = config.tags[tag][value]
              id = null
              a = 0
              al = all.length

              while a < al
                if all[a].substr(0, folder.length) is folder

                  # 1.1. Namespace
                  # e.g. /tag/value/namespace/Class
                  if path.indexOf("*") > 0
                    namespace = path.substr(0, path.indexOf("*") - 1)
                    if all[a].substr(folder.length + 1, namespace.length) is namespace
                      id = namespace + "." + all[a].substr(folder.length + namespace.length + 2).split("/").join(".")
                      if filtered[id] is undefined
                        filtered[id] = [all[a]]
                      else
                        filtered[id].push all[a]

                  # 1.2. Simple Includes
                  # e.g. /tag/value/Class
                  else if all[a].substr(folder.length + 1, path.length) is path
                    id = classId
                    if filtered[id] is undefined
                      filtered[id] = [all[a]]
                    else
                      filtered[id].push all[a]
                a += 1
            v += 1

          # 2. No Tag-based search
          id = classId
          a = 0
          al = all.length

          while a < al

            # 2.1 direct includes
            # e.g. lychee/Font.js > lychee.Font
            if all[a] is path
              if filtered[id] is undefined
                filtered[id] = [all[a]]
              else
                filtered[id].push all[a]
              break

            # 2.2. subfolder includes
            # e.g. lychee/parser/ASTScope.js > lychee.ASTScope
            else if filtered[id] is undefined and all[a].substr(-1 * path.length) is path

              # 2.2.1 validate folder against other tags
              isInvalid = false
              for tag of @_tags
                for otherValue of config.tags[tag]
                  v = 0
                  l = @_tags[tag].length

                  while v < l
                    value = @_tags[tag][v]
                    if value isnt otherValue
                      folder = config.tags[tag][otherValue]
                      if all[a].substr(0, folder.length) is folder
                        isInvalid = true
                        break
                    v += 1
                  break  if isInvalid is true
                break  if isInvalid is true

              # 2.2.2 If the folder is validated, check if it was already set
              if isInvalid is false
                if filtered[id] is undefined
                  filtered[id] = [all[a]]
                else if filtered[id] isnt undefined
                  alreadyInFiltered = false
                  f = 0
                  fl = filtered[id].length

                  while f < fl
                    if filtered[id][f] is all[a]
                      alreadyInFiltered = true
                      break
                    f += 1
                  filtered[id].push all[a]  if alreadyInFiltered is false
            a += 1
        if Object.keys(filtered).length > 0
          for id of filtered
            nodes = filtered[id]
            multiple = nodes.length > 1
            n = 0
            nl = nodes.length

            while n < nl
              candidate =
                packageId: packageId
                classId: id
                url: @_bases[packageId] + "/" + nodes[n] + ".js"
                multiple: multiple
                attachments: []

              extensions = @_getNodeFromTree(tree, nodes[n], "/")
              e = 0
              el = extensions.length

              while e < el
                ext = extensions[e]
                candidate.attachments.push @_bases[packageId] + "/" + nodes[n] + "." + ext  if ext isnt "js"
                e += 1
              candidates.push candidate
              n += 1
      else
        candidates.push
          packageId: packageId
          classId: classId
          url: @_bases[packageId] + "/" + path + ".js"
          multiple: false
          attachments: []

      if candidates.length > 0
        candidates
      else
        null

    _refresh: ->
      allDependenciesLoaded = true

      # 1. Walk the Tree and load dependencies
      for id of @_tree
        continue  if @_tree[id] is null
        node = @_tree[id]
        nodeId = node._space + "." + node._name
        entry = null
        for entry in node._requires
          if @_requiresLoad(entry) is true
            allDependenciesLoaded = false
            packageId = entry.split(".")[0]
            classId = [].concat(entry.split(".").splice(1)).join(".")
            @load packageId, classId, nodeId

        for entry in node._includes
          if @_requiresLoad(entry) is true
            allDependenciesLoaded = false
            packageId = entry.split(".")[0]
            classId = [].concat(entry.split(".").splice(1)).join(".")
            @load packageId, classId, nodeId


      # 2. Check the loading tree and find out if something hasn't been parsed yet
      for id of @_loading.classes
        allDependenciesLoaded = false  if @_namespaces[id] is undefined and @_tree[id] is undefined

      # 2. If all dependencies are loaded, sort the dependency tree
      @_startBuild()  if allDependenciesLoaded is true

    _requiresLoad: (reference) ->

      # Namespace Include Reference
      if reference.indexOf("*") > 0
        path = reference.substr(0, reference.indexOf("*") - 1)
        return false  if @_loading.classes[path] isnt undefined
      else
        path = reference
        return false  if @_loading.classes[path] isnt undefined
      true


    #
    #
    # Building Stuff
    #
    #
    build: (env, callback, scope) ->
      console.group "lychee.Builder"  if lychee.debug is true
      @_clock = Date.now()
      @_tree = if lychee.isObject(env.tree) then env.tree else {}
      @_bases = if lychee.isObject(env.bases) then env.bases else {}
      @_tags = if lychee.isObject(env.tags) then env.tags else {}
      callback = if callback instanceof Function then callback else ->
      scope = if scope isnt undefined then scope else global
      @_buildCallback = callback
      @_buildScope = scope
      @_buildStart = Object.keys(@_tree)[0]  if Object.keys(@_tree).length is 1
      console.log "Loading Dependencies for " + @_buildStart  if lychee.debug is true

      # 1. Load Package Configurations
      # (will automatically refresh afterwards)
      for id of @_bases
        @load id, null

    _startBuild: ->
      @_buildOrder = []
      @_sort @_buildStart, @_buildOrder
      if lychee.debug is true
        console.log "Starting Build"
        console.log @_buildOrder
        console.groupEnd()

      for b in @_buildOrder
        @_export @_tree[b]

      duration = Date.now() - @_clock
      console.log "COMPILE TIME END: Finished in " + duration + "ms"  if lychee.debug is true
      @_buildCallback.call @_buildScope, @_buildScope.lychee, @_buildScope

    _export: (lyDefBlock) ->
      id = lyDefBlock._space + "." + lyDefBlock._name
      classname = lyDefBlock._name
      namespace = @_getNamespace(lyDefBlock._space, @_buildScope)
      attachmentsmap = null
      attachments = @_attachments[id] or null
      if attachments isnt null
        attachmentsmap = {}
        for url in attachments
          tmp = url.split("/")
          id = tmp[tmp.length - 1].substr(classname.length + 1)
          attachmentsmap[id] = @_preloader.get(url)
      data = null
      data = lyDefBlock._exports.call(lyDefBlock._exports, lychee, global, attachmentsmap)  if lyDefBlock._exports isnt null
      includes = lyDefBlock._includes
      if includes.length and data?
        proto = {}
        for prop of data::
          proto[prop] = data::[prop]
        namespace[classname] = data
        namespace[classname]:: = {}
        args = [namespace[classname]::]
        for id in includes
          incLyDefBlock = @_getNodeFromTree(@_buildScope, id, ".")
          if not incLyDefBlock or not incLyDefBlock::
            console.warn "Inclusion of " + id + " failed. You either forgot to return it inside lychee.exports() or created an invalid definition block."  if lychee.debug is true
          else
            args.push @_getNodeFromTree(@_buildScope, id, ".")::
        args.push proto
        lychee.extend.apply lychee, args
      else namespace[classname] = data  if data?

    _sort: (reference, list, visited) ->
      visited = visited or {}
      if visited[reference] isnt true
        visited[reference] = true
        if reference.indexOf("*") > 0
          namespace = reference.substr(0, reference.length - 2)
          for id of @_tree
            @_sort id, list, visited  if id.substr(0, namespace.length) is namespace
        else
          node = @_tree[reference]
          return  if node is null
          for r in node._requires
            @_sort r, list, visited
          for i in node._includes
            @_sort i, list, visited
          list.push reference


    #
    #
    # Code Merging Stuff
    #
    #
    generate: (env) ->
      code = ""

      # lychee core will be included later by Parser and Compiler
      namespaces = lychee: true
      b = undefined
      l = undefined
      reference = undefined
      lyDefBlock = undefined

      # 1. Preparation of Namespaces
      for reference in @_buildOrder
        lyDefBlock = @_tree[reference]
        code += @_prepareCodeNamespace(lyDefBlock._space, namespaces)

      # 2. Definition Blocks (exports)
      for reference in @_buildOrder
        lyDefBlock = @_tree[reference]
        code += reference + " = (" + lyDefBlock._exports.toString() + ")(this.lychee, this);\n"

      # 3. Inheritation (includes)
      code += "(function(map, global) {                                \n"
      code += "                                                        \n"
      code += "  var _get = function(path) {                           \n"
      code += "                                                        \n"
      code += "    var node = global;                                  \n"
      code += "    var tmp = path.split('.');                          \n"
      code += "                                                        \n"
      code += "    var t = 0;                                          \n"
      code += "    while(t < tmp.length) {                             \n"
      code += "      node = node[tmp[t++]];                            \n"
      code += "    }                                                   \n"
      code += "                                                        \n"
      code += "    return node;                                        \n"
      code += "                                                        \n"
      code += "  };                                                    \n"
      code += "                                                        \n"
      code += "                                                        \n"
      code += "  for (var name in map) {                               \n"
      code += "                                                        \n"
      code += "    var ref = _get(name);                               \n"
      code += "    var proto = {};                                     \n"
      code += "    for (var prop in ref.prototype) {                   \n"
      code += "      proto[prop] = ref.prototype[prop];                \n"
      code += "    }                                                   \n"
      code += "                                                        \n"
      code += "    ref.prototype = {};                                 \n"
      code += "                                                        \n"
      code += "    var args = [ ref.prototype ];                       \n"
      code += "                                                        \n"
      code += "    for (var i = 0, l = map[name].length; i < l; i++) { \n"
      code += "      args.push(_get(map[name][i]).prototype);          \n"
      code += "    }                                                   \n"
      code += "                                                        \n"
      code += "    args.push(proto);                                   \n"
      code += "                                                        \n"
      code += "    lychee.extend.apply(lychee, args);                  \n"
      code += "                                                        \n"
      code += "  }                                                     \n"
      code += "                                                        \n"
      code += "})({                                                    \n"
      b = 0
      l = @_buildOrder.length

      while b < l
        reference = @_buildOrder[b]
        lyDefBlock = @_tree[reference]
        if lyDefBlock._includes.length
          code += "\t'" + reference + "': ['"
          code += lyDefBlock._includes.join("','")
          code += "']"
          if b < l - 1
            code += ",\n"
          else
            code += "\n"
        b++
      code += "}, this);                                               \n"

      # 4. Initialization
      code += "(" + @_buildCallback + ")(this.lychee, this);"
      code

    _prepareCodeNamespace: (namespace, alreadyDefined) ->
      tmp = namespace.split(".")
      ns = tmp[0]
      code = ""
      t = 0
      l = tmp.length

      while t < l
        if alreadyDefined[ns] isnt true
          code += ns + " = {};\n"
          alreadyDefined[ns] = true
        ns += "." + tmp[t + 1]  if typeof tmp[t + 1] is "string"
        t++
      code

  _builder = null
  lychee.build = (callback, scope) ->
    _builder = new lychee.Builder()
    _builder.build lychee.getEnvironment(), callback, scope

  lychee.generate = (callback, scope) ->
    callback = (if callback instanceof Function then callback else ->
    )
    scope = (if scope isnt undefined then scope else global)
    _builder = new lychee.Builder()  if _builder is null
    code = _builder.generate(lychee.getEnvironment())
    callback.call scope, code
