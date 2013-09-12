// Generated by CoffeeScript 1.6.3
(function() {
  (function(lychee, global) {
    var _builder;
    if (lychee === void 0) {
      global.lychee = lychee = {};
    }
    lychee.Builder = (function() {
      function Builder() {
        this._attachments = {};
        this._classes = {};
        this._namespaces = {};
        this._packages = {};
        this._tree = null;
        this._bases = null;
        this._tags = null;
        this._buildStart = null;
        this._buildOrder = [];
        this._loading = {
          packages: {},
          classes: {}
        };
        this._buildCallback = null;
        this._buildScope = null;
        this._clock = 0;
        this._preloader = new lychee.Preloader({
          timeout: Infinity
        });
        this._preloader.bind("ready", this._load, this);
        this._preloader.bind("error", this._unload, this);
      }

      Builder.prototype._load = function(assets, mappings) {
        var candidate, content, lyDefBlock, map, mapping, refresh, uid, url;
        refresh = false;
        for (url in assets) {
          content = assets[url];
          mapping = mappings[url];
          uid = mapping.packageId + "." + mapping.classId;
          if (mapping !== null) {
            if (mapping.packageId !== null && mapping.classId === null) {
              this._packages[mapping.packageId] = content;
              this._loading.packages[mapping.packageId] = false;
              refresh = true;
            } else if (mapping.packageId !== null && mapping.classId !== null) {
              mapping._loading--;
              if (url.substr(-2) === "js" && this._classes[uid] === void 0) {
                if (this._classes[uid] == null) {
                  lyDefBlock = this._tree[uid];
                  if (lyDefBlock !== void 0) {
                    if (lychee.debug === true) {
                      console.log("> using " + mapping.url);
                    }
                    this._classes[uid] = lyDefBlock;
                    if (mapping.attachments.length > 0) {
                      this._attachments[uid] = mapping.attachments;
                    }
                    if (mapping._loading !== 0) {
                      this._preloader.load(mapping.attachments, mapping);
                    }
                  } else if (mapping.alternatives !== void 0) {
                    candidate = mapping.alternatives[0];
                    candidate.namespaceId = mapping.namespaceId;
                    candidate.refererId = mapping.refererId;
                    candidate._loading = candidate.attachments.length + 1;
                    candidate.alternatives = mapping.alternatives.length > 1 ? mapping.alternatives.splice(1, mapping.alternatives.length - 1) : void 0;
                    this._loading.classes[uid] = true;
                    this._preloader.load(candidate.url, candidate);
                  } else {
                    if (lychee.debug === true) {
                      console.warn("> loading " + uid + " failed. Either corrupt definition block at " + url + " or no alternatives available. (refered by " + mapping.refererId + ")");
                    }
                    this._loading.classes[uid] = false;
                    this._classes[uid] = null;
                    this._tree[uid] = null;
                  }
                }
              }
              if (mapping._loading === 0) {
                this._loading.classes[uid] = false;
                refresh = true;
              }
              if (mapping.namespaceId !== null) {
                map = this._namespaces[mapping.packageId + "." + mapping.namespaceId];
                map._loading--;
                if (map.loading === 0) {
                  this._loading.classes[mapping.packageId + "." + mapping.namespaceId] = false;
                }
              }
            }
          }
        }
        if (refresh === true) {
          return this._refresh();
        }
      };

      Builder.prototype._unload = function(assets, mappings) {
        var mapping, url;
        for (url in mappings) {
          mapping = mappings[url];
          if (mapping.packageId !== null && mapping.classId === null) {
            this._packages[mapping.packageId] = null;
            this._loading.packages[mapping.packageId] = false;
          } else if (mapping.packageId !== null && mapping.classId !== null) {
            if (lychee.debug === true) {
              console.warn("Package Tree index is corrupt, couldn't load " + url + " (refered by " + mapping.packageId + "." + mapping.classId + ")");
            }
            this._classes[mapping.packageId + "." + mapping.classId] = null;
            if (mapping.multiple !== true) {
              this._loading.classes[mapping.packageId + "." + mapping.classId] = false;
              console.log("No Alternatives available for " + url);
            }
          }
        }
        return this._refresh();
      };

      Builder.prototype.load = function(packageId, classId, refererId) {
        var c, candidate, candidates, namespaceId, overallRequired, url, urls, _i, _len;
        packageId = (typeof packageId === "string" ? packageId : null);
        classId = (typeof classId === "string" ? classId : null);
        refererId = (typeof refererId === "string" ? refererId : null);
        if (packageId !== null && classId === null) {
          if (this._packages[packageId] === void 0) {
            url = (this._bases[packageId] || "") + "/package.json";
            if (lychee.debug === true) {
              console.log("> loading " + packageId + ": " + url);
            }
            this._loading.packages[packageId] = true;
            this._preloader.load(url, {
              packageId: packageId,
              classId: classId
            });
            return;
          }
        } else if (packageId !== null && classId !== null) {
          if (this._packages[packageId] == null) {
            return;
          }
          if (this._classes[packageId + "." + classId] === void 0) {
            candidates = this._fuzzySearch(packageId, classId);
            if (candidates !== null) {
              if (lychee.debug === true) {
                urls = [
                  (function() {
                    var _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = candidates.length; _i < _len; _i++) {
                      c = candidates[_i];
                      _results.push(c.url);
                    }
                    return _results;
                  })()
                ];
                console.log("> loading " + packageId + "." + classId, urls.join(", "));
              }
              namespaceId = null;
              if (classId.indexOf("*") > 0) {
                namespaceId = classId.substr(0, classId.indexOf("*") - 1);
                overallRequired = 0;
                for (_i = 0, _len = candidates.length; _i < _len; _i++) {
                  c = candidates[_i];
                  overallRequired += c.attachments.length + 1;
                }
                this._loading.classes[packageId + "." + namespaceId] = true;
                this._namespaces[packageId + "." + namespaceId] = {
                  loading: overallRequired
                };
              }
              if (candidates.length > 0) {
                candidate = candidates[0];
                candidate.namespaceId = namespaceId;
                candidate.refererId = refererId;
                candidate._loading = candidate.attachments.length + 1;
                if (candidates.length > 1) {
                  candidate.alternatives = candidates.splice(1, candidates.length - 1);
                }
                this._loading.classes[candidate.packageId + "." + candidate.classId] = true;
                this._preloader.load(candidate.url, candidate);
                return;
              }
            }
          }
        }
        if (lychee.debug === true) {
          return console.warn("> loading " + packageId + "." + classId + " failed. (required by " + refererId + ")");
        }
      };

      Builder.prototype._getAllIdsFromTree = function(tree, prefix, ids) {
        var id, node, returnTree, subprefix, type;
        prefix = (typeof prefix === "string" ? prefix : "");
        returnTree = false;
        if (Object.prototype.toString.call(ids) !== "[object Array]") {
          ids = [];
          returnTree = true;
        }
        for (id in tree) {
          node = tree[id];
          type = Object.prototype.toString.call(node);
          subprefix = (prefix.length ? prefix + "/" + id : id);
          switch (type) {
            case "[object Array]":
              ids.push(subprefix);
              break;
            case "[object Object]":
              this._getAllIdsFromTree(node, subprefix, ids);
          }
        }
        if (returnTree === true) {
          return ids;
        }
      };

      Builder.prototype._getNamespace = function(namespace, scope) {
        var name, ns, pointer, _i, _len;
        pointer = scope;
        ns = namespace.split(".");
        for (_i = 0, _len = ns.length; _i < _len; _i++) {
          name = ns[_i];
          if (pointer[name] === void 0) {
            pointer[name] = {};
          }
          pointer = pointer[name];
        }
        return pointer;
      };

      Builder.prototype._getNodeFromTree = function(tree, path, seperator) {
        var node, tmp;
        node = tree;
        tmp = path.split(seperator);
        while (tmp.length) {
          node = node[tmp.shift()];
        }
        return node;
      };

      Builder.prototype._fuzzySearch = function(packageId, classId) {
        var a, al, all, alreadyInFiltered, base, candidate, candidates, config, e, el, ext, extensions, f, filtered, fl, folder, id, isInvalid, l, multiple, n, namespace, nl, nodes, otherValue, path, tag, tree, v, value, values;
        base = this._bases[packageId];
        id = "";
        path = classId.split(".").join("/");
        config = this._packages[packageId] || null;
        if (config === null && this._loading.packages[packageId] === true) {
          return null;
        }
        candidates = [];
        if (config !== null) {
          tree = config.tree;
          all = this._getAllIdsFromTree(tree, "");
          filtered = {};
          for (tag in this._tags) {
            values = this._tags[tag];
            v = 0;
            l = values.length;
            while (v < l) {
              value = values[v];
              if (config.tags[tag] && config.tags[tag][value]) {
                folder = config.tags[tag][value];
                id = null;
                a = 0;
                al = all.length;
                while (a < al) {
                  if (all[a].substr(0, folder.length) === folder) {
                    if (path.indexOf("*") > 0) {
                      namespace = path.substr(0, path.indexOf("*") - 1);
                      if (all[a].substr(folder.length + 1, namespace.length) === namespace) {
                        id = namespace + "." + all[a].substr(folder.length + namespace.length + 2).split("/").join(".");
                        if (filtered[id] === void 0) {
                          filtered[id] = [all[a]];
                        } else {
                          filtered[id].push(all[a]);
                        }
                      }
                    } else if (all[a].substr(folder.length + 1, path.length) === path) {
                      id = classId;
                      if (filtered[id] === void 0) {
                        filtered[id] = [all[a]];
                      } else {
                        filtered[id].push(all[a]);
                      }
                    }
                  }
                  a += 1;
                }
              }
              v += 1;
            }
            id = classId;
            a = 0;
            al = all.length;
            while (a < al) {
              if (all[a] === path) {
                if (filtered[id] === void 0) {
                  filtered[id] = [all[a]];
                } else {
                  filtered[id].push(all[a]);
                }
                break;
              } else if (filtered[id] === void 0 && all[a].substr(-1 * path.length) === path) {
                isInvalid = false;
                for (tag in this._tags) {
                  for (otherValue in config.tags[tag]) {
                    v = 0;
                    l = this._tags[tag].length;
                    while (v < l) {
                      value = this._tags[tag][v];
                      if (value !== otherValue) {
                        folder = config.tags[tag][otherValue];
                        if (all[a].substr(0, folder.length) === folder) {
                          isInvalid = true;
                          break;
                        }
                      }
                      v += 1;
                    }
                    if (isInvalid === true) {
                      break;
                    }
                  }
                  if (isInvalid === true) {
                    break;
                  }
                }
                if (isInvalid === false) {
                  if (filtered[id] === void 0) {
                    filtered[id] = [all[a]];
                  } else if (filtered[id] !== void 0) {
                    alreadyInFiltered = false;
                    f = 0;
                    fl = filtered[id].length;
                    while (f < fl) {
                      if (filtered[id][f] === all[a]) {
                        alreadyInFiltered = true;
                        break;
                      }
                      f += 1;
                    }
                    if (alreadyInFiltered === false) {
                      filtered[id].push(all[a]);
                    }
                  }
                }
              }
              a += 1;
            }
          }
          if (Object.keys(filtered).length > 0) {
            for (id in filtered) {
              nodes = filtered[id];
              multiple = nodes.length > 1;
              n = 0;
              nl = nodes.length;
              while (n < nl) {
                candidate = {
                  packageId: packageId,
                  classId: id,
                  url: this._bases[packageId] + "/" + nodes[n] + ".js",
                  multiple: multiple,
                  attachments: []
                };
                extensions = this._getNodeFromTree(tree, nodes[n], "/");
                e = 0;
                el = extensions.length;
                while (e < el) {
                  ext = extensions[e];
                  if (ext !== "js") {
                    candidate.attachments.push(this._bases[packageId] + "/" + nodes[n] + "." + ext);
                  }
                  e += 1;
                }
                candidates.push(candidate);
                n += 1;
              }
            }
          }
        } else {
          candidates.push({
            packageId: packageId,
            classId: classId,
            url: this._bases[packageId] + "/" + path + ".js",
            multiple: false,
            attachments: []
          });
        }
        if (candidates.length > 0) {
          return candidates;
        } else {
          return null;
        }
      };

      Builder.prototype._refresh = function() {
        var allDependenciesLoaded, classId, entry, id, node, nodeId, packageId, _i, _j, _len, _len1, _ref, _ref1;
        allDependenciesLoaded = true;
        for (id in this._tree) {
          if (this._tree[id] === null) {
            continue;
          }
          node = this._tree[id];
          nodeId = node._space + "." + node._name;
          entry = null;
          _ref = node._requires;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            entry = _ref[_i];
            if (this._requiresLoad(entry) === true) {
              allDependenciesLoaded = false;
              packageId = entry.split(".")[0];
              classId = [].concat(entry.split(".").splice(1)).join(".");
              this.load(packageId, classId, nodeId);
            }
          }
          _ref1 = node._includes;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            entry = _ref1[_j];
            if (this._requiresLoad(entry) === true) {
              allDependenciesLoaded = false;
              packageId = entry.split(".")[0];
              classId = [].concat(entry.split(".").splice(1)).join(".");
              this.load(packageId, classId, nodeId);
            }
          }
        }
        for (id in this._loading.classes) {
          if (this._namespaces[id] === void 0 && this._tree[id] === void 0) {
            allDependenciesLoaded = false;
          }
        }
        if (allDependenciesLoaded === true) {
          return this._startBuild();
        }
      };

      Builder.prototype._requiresLoad = function(reference) {
        var path;
        if (reference.indexOf("*") > 0) {
          path = reference.substr(0, reference.indexOf("*") - 1);
          if (this._loading.classes[path] !== void 0) {
            return false;
          }
        } else {
          path = reference;
          if (this._loading.classes[path] !== void 0) {
            return false;
          }
        }
        return true;
      };

      Builder.prototype.build = function(env, callback, scope) {
        var id, _results;
        if (lychee.debug === true) {
          console.group("lychee.Builder");
        }
        this._clock = Date.now();
        this._tree = (Object.prototype.toString.call(env.tree) === "[object Object]" ? env.tree : {});
        this._bases = (Object.prototype.toString.call(env.bases) === "[object Object]" ? env.bases : {});
        this._tags = (Object.prototype.toString.call(env.tags) === "[object Object]" ? env.tags : {});
        callback = (callback instanceof Function ? callback : function() {});
        scope = (scope !== void 0 ? scope : global);
        this._buildCallback = callback;
        this._buildScope = scope;
        if (Object.keys(this._tree).length === 1) {
          this._buildStart = Object.keys(this._tree)[0];
        }
        if (lychee.debug === true) {
          console.log("Loading Dependencies for " + this._buildStart);
        }
        _results = [];
        for (id in this._bases) {
          _results.push(this.load(id, null));
        }
        return _results;
      };

      Builder.prototype._startBuild = function() {
        var b, duration, _i, _len, _ref;
        this._buildOrder = [];
        this._sort(this._buildStart, this._buildOrder);
        if (lychee.debug === true) {
          console.log("Starting Build");
          console.log(this._buildOrder);
          console.groupEnd();
        }
        _ref = this._buildOrder;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          b = _ref[_i];
          this._export(this._tree[b]);
        }
        duration = Date.now() - this._clock;
        if (lychee.debug === true) {
          console.log("COMPILE TIME END: Finished in " + duration + "ms");
        }
        return this._buildCallback.call(this._buildScope, this._buildScope.lychee, this._buildScope);
      };

      Builder.prototype._export = function(lyDefBlock) {
        var args, attachments, attachmentsmap, classname, data, id, incLyDefBlock, includes, namespace, prop, proto, tmp, url, _i, _j, _len, _len1;
        id = lyDefBlock._space + "." + lyDefBlock._name;
        classname = lyDefBlock._name;
        namespace = this._getNamespace(lyDefBlock._space, this._buildScope);
        attachmentsmap = null;
        attachments = this._attachments[id] || null;
        if (attachments !== null) {
          attachmentsmap = {};
          for (_i = 0, _len = attachments.length; _i < _len; _i++) {
            url = attachments[_i];
            tmp = url.split("/");
            id = tmp[tmp.length - 1].substr(classname.length + 1);
            attachmentsmap[id] = this._preloader.get(url);
          }
        }
        data = null;
        if (lyDefBlock._exports !== null) {
          data = lyDefBlock._exports.call(lyDefBlock._exports, lychee, global, attachmentsmap);
        }
        includes = lyDefBlock._includes;
        if (includes.length && (data != null)) {
          proto = {};
          for (prop in data.prototype) {
            proto[prop] = data.prototype[prop];
          }
          namespace[classname] = data;
          namespace[classname].prototype = {};
          args = [namespace[classname].prototype];
          for (_j = 0, _len1 = includes.length; _j < _len1; _j++) {
            id = includes[_j];
            incLyDefBlock = this._getNodeFromTree(this._buildScope, id, ".");
            if (!incLyDefBlock || !incLyDefBlock.prototype) {
              if (lychee.debug === true) {
                console.warn("Inclusion of " + id + " failed. You either forgot to return it inside lychee.exports() or created an invalid definition block.");
              }
            } else {
              args.push(this._getNodeFromTree(this._buildScope, id, ".").prototype);
            }
          }
          args.push(proto);
          return lychee.extend.apply(lychee, args);
        } else {
          if (data != null) {
            return namespace[classname] = data;
          }
        }
      };

      Builder.prototype._sort = function(reference, list, visited) {
        var i, id, namespace, node, r, _i, _j, _len, _len1, _ref, _ref1, _results;
        visited = visited || {};
        if (visited[reference] !== true) {
          visited[reference] = true;
          if (reference.indexOf("*") > 0) {
            namespace = reference.substr(0, reference.length - 2);
            _results = [];
            for (id in this._tree) {
              if (id.substr(0, namespace.length) === namespace) {
                _results.push(this._sort(id, list, visited));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          } else {
            node = this._tree[reference];
            if (node === null) {
              return;
            }
            _ref = node._requires;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              r = _ref[_i];
              this._sort(r, list, visited);
            }
            _ref1 = node._includes;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              i = _ref1[_j];
              this._sort(i, list, visited);
            }
            return list.push(reference);
          }
        }
      };

      Builder.prototype.generate = function(env) {
        var b, code, l, lyDefBlock, namespaces, reference, _i, _j, _len, _len1, _ref, _ref1;
        code = "";
        namespaces = {
          lychee: true
        };
        b = void 0;
        l = void 0;
        reference = void 0;
        lyDefBlock = void 0;
        _ref = this._buildOrder;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          reference = _ref[_i];
          lyDefBlock = this._tree[reference];
          code += this._prepareCodeNamespace(lyDefBlock._space, namespaces);
        }
        _ref1 = this._buildOrder;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          reference = _ref1[_j];
          lyDefBlock = this._tree[reference];
          code += reference + " = (" + lyDefBlock._exports.toString() + ")(this.lychee, this);\n";
        }
        code += "(function(map, global) {                                \n";
        code += "                                                        \n";
        code += "  var _get = function(path) {                           \n";
        code += "                                                        \n";
        code += "    var node = global;                                  \n";
        code += "    var tmp = path.split('.');                          \n";
        code += "                                                        \n";
        code += "    var t = 0;                                          \n";
        code += "    while(t < tmp.length) {                             \n";
        code += "      node = node[tmp[t++]];                            \n";
        code += "    }                                                   \n";
        code += "                                                        \n";
        code += "    return node;                                        \n";
        code += "                                                        \n";
        code += "  };                                                    \n";
        code += "                                                        \n";
        code += "                                                        \n";
        code += "  for (var name in map) {                               \n";
        code += "                                                        \n";
        code += "    var ref = _get(name);                               \n";
        code += "    var proto = {};                                     \n";
        code += "    for (var prop in ref.prototype) {                   \n";
        code += "      proto[prop] = ref.prototype[prop];                \n";
        code += "    }                                                   \n";
        code += "                                                        \n";
        code += "    ref.prototype = {};                                 \n";
        code += "                                                        \n";
        code += "    var args = [ ref.prototype ];                       \n";
        code += "                                                        \n";
        code += "    for (var i = 0, l = map[name].length; i < l; i++) { \n";
        code += "      args.push(_get(map[name][i]).prototype);          \n";
        code += "    }                                                   \n";
        code += "                                                        \n";
        code += "    args.push(proto);                                   \n";
        code += "                                                        \n";
        code += "    lychee.extend.apply(lychee, args);                  \n";
        code += "                                                        \n";
        code += "  }                                                     \n";
        code += "                                                        \n";
        code += "})({                                                    \n";
        b = 0;
        l = this._buildOrder.length;
        while (b < l) {
          reference = this._buildOrder[b];
          lyDefBlock = this._tree[reference];
          if (lyDefBlock._includes.length) {
            code += "\t'" + reference + "': ['";
            code += lyDefBlock._includes.join("','");
            code += "']";
            if (b < l - 1) {
              code += ",\n";
            } else {
              code += "\n";
            }
          }
          b++;
        }
        code += "}, this);                                               \n";
        code += "(" + this._buildCallback + ")(this.lychee, this);";
        return code;
      };

      Builder.prototype._prepareCodeNamespace = function(namespace, alreadyDefined) {
        var code, l, ns, t, tmp;
        tmp = namespace.split(".");
        ns = tmp[0];
        code = "";
        t = 0;
        l = tmp.length;
        while (t < l) {
          if (alreadyDefined[ns] !== true) {
            code += ns + " = {};\n";
            alreadyDefined[ns] = true;
          }
          if (typeof tmp[t + 1] === "string") {
            ns += "." + tmp[t + 1];
          }
          t++;
        }
        return code;
      };

      return Builder;

    })();
    _builder = null;
    lychee.build = function(callback, scope) {
      _builder = new lychee.Builder();
      return _builder.build(lychee.getEnvironment(), callback, scope);
    };
    return lychee.generate = function(callback, scope) {
      var code;
      callback = (callback instanceof Function ? callback : function() {});
      scope = (scope !== void 0 ? scope : global);
      if (_builder === null) {
        _builder = new lychee.Builder();
      }
      code = _builder.generate(lychee.getEnvironment());
      return callback.call(scope, code);
    };
  })(lychee, (typeof global !== "undefined" ? global : this));

}).call(this);