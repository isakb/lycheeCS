lychee
.define("lychee.game.Graph")
.exports (lychee) ->

  class Node
    constructor: (@entity, @parent) ->
      @children = []

    setParent: (node) ->
      @parent = node  if node instanceof Node or node is null

    addChild: (node) ->
      # Search our children
      found = false
      for c in [0...@children.length]
        if @children[c] is node
          found = true
          break
      if not found
        # Unlink old parent
        node.parent.removeChild node  if node.parent isnt null
        # Set new parent and add child
        node.setParent this
        @children.push node

    removeChild: (node) ->
      # Search our children
      found = false
      c = 0
      l = @children.length
      while c < l
        if @children[c] is node
          found = true
          @children.splice c, 1
          l -= 1
        c += 1

      # Unlink old parent
      node.setParent null  if found is true


  class lychee.game.Graph
    constructor: ->
      @_dirty = false
      @_tree = new Node(null, null)

    #
    #	PUBLIC API
    #

    reset: ->
      @_dirty = false
      @_tree = new Node(null, null)

    add: (entity, parent) ->
      parent = if parent instanceof Node then parent else null
      node = @_getNodeByEntity(entity)
      if node is null
        node = new Node(entity, parent)
        if parent is null
          @_tree.addChild node
          @_dirty = true
      if parent isnt null
        parent.addChild node
        @_dirty = true
      node

    remove: (node) ->
      node = @_getNodeByEntity(entity)  if not node instanceof Node
      if node isnt null
        node.parent.removeChild node  if node.parent isnt null
        return true
      false

    update: (clock, delta) ->
      @_updateNode @_tree, clock, delta

    getEntityByPosition: (x, y, z) ->
      x = (if typeof x is "number" then x else null)
      y = (if typeof y is "number" then y else null)
      z = (if typeof z is "number" then z else null)
      found = @_getNodeByPosition(x, y, z)
      return found.entity  if found isnt null
      null


    #
    # PRIVATE API
    #
    _updateNode: (node, clock, delta) ->
      node.entity.update clock, delta  if node.entity isnt null
      c = 0
      l = node.children.length

      while c < l
        @_updateNode node.children[c], clock, delta
        c++

    _getNodeByEntity: (entity, node) ->
      return null  if entity is null
      node = @_tree  unless node?
      found = null
      found = node  if node.entity isnt null and node.entity is entity
      c = 0
      l = node.children.length

      while c < l
        found = @_getNodeByEntity(entity, node.children[c])
        break  if found isnt null
        c++
      found

    _getNodeByPosition: (x, y, z, node, posX, posY, posZ) ->
      unless node?
        node = @_tree
        posX = 0
        posY = 0
        posZ = 0
      found = null
      if node.entity isnt null
        position = node.entity.getPosition()
        hwidth = (node.entity.width / 2) or node.entity.radius or 0
        hheight = (node.entity.height / 2) or node.entity.radius or 0
        hdepth = (node.entity.depth / 2) or node.entity.radius or 0
        posX += position.x
        posY += position.y
        posZ += position.z
        found = node  if (x is null or (x >= posX - hwidth and x <= posX + hwidth)) and (y is null or (y >= posY - hheight and y <= posY + hheight)) and (z is null or (z >= posZ - hdepth and y <= posZ + hdepth))
      c = 0
      l = node.children.length

      while c < l
        foundchild = @_getNodeByPosition(x, y, z, node.children[c], posX, posY, posZ)
        found = foundchild  if foundchild isnt null
        c++
      found
