
(function(lychee, global) {

	// Asynchronous loading, this file
	// can be ready before lycheeJS core.

	if (lychee === undefined) {
		global.lychee = lychee = {};
	}


	lychee.Builder = function() {

		this.__packages = {};
		this.__namespaces = {};
		this.__classes = {};

		// will be set in build()
		this.__tree = null;
		this.__bases = null;
		this.__tags = null;
		this.__buildStart = null;
		this.__buildOrder = [];

		this.__loading = {
			packages: {},
			classes: {}
		};


		this.__buildCallback = null;
		this.__buildScope = null;


		this.__clock = 0;


		this.__preloader = new lychee.Preloader({
			timeout: 2000
		});

		this.__preloader.bind('ready', this.__load, this);
		this.__preloader.bind('error', this.__unload, this);

	};

	lychee.Builder.prototype = {

		/*
		 *
		 * Loading Stuff
		 *
		 */
		__load: function(assets, mappings) {

			var refresh = false;
			for (var url in assets) {

				var content = assets[url];
				var mapping = mappings[url];

				if (
					mapping !== null
				) {

					// 1. Parse Package Configuration
					if (mapping.packageId !== null && mapping.classId === null) {

						this.__packages[mapping.packageId] = content;
						this.__loading.packages[mapping.packageId] = false;
						refresh = true;

					} else if (mapping.packageId !== null && mapping.classId !== null) {

						mapping._loading--;


						if (
							url.substr(-2) === 'js'
							&& this.__classes[mapping.packageId + '.' + mapping.classId] === undefined
						) {

							if (this.__classes[mapping.packageId + '.' + mapping.classId] == null) {

								var lyDefBlock = this.__tree[mapping.packageId + '.' + mapping.classId];
								if (lyDefBlock !== undefined) {

									if (lychee.debug === true) {
										console.log('> using ' + mapping.url);
									}

									this.__classes[mapping.packageId + '.' + mapping.classId] = lyDefBlock;

									if (mapping._loading !== 0) {
										this.__preloader.load(mapping.attachments, mapping);
									}

								} else {

									if (lychee.debug === true) {
										console.warn('> loading ' + mapping.packageId + '.' + mapping.classId + ' failed. Corrupt definition block at ' + url + '. (refered by ' + mapping.refererId + ')');
									}


									// This will silently ignore the mistake and still "try" to build successfully.
									this.__loading.classes[mapping.packageId + '.' + mapping.classId] = false;
									this.__classes[mapping.packageId + '.' + mapping.classId] = null;
									this.__tree[mapping.packageId + '.' + mapping.classId] = null;

								}

							}

						}


						if (mapping._loading === 0) {

							this.__loading.classes[mapping.packageId + '.' + mapping.classId] = false;
							refresh = true;

						}


						if (mapping.namespaceId !== null) {

							var map = this.__namespaces[mapping.packageId + '.' + mapping.namespaceId];
							map._loading--;


							if (map.loading === 0) {
								this.__loading.classes[mapping.packageId + '.' + mapping.namespaceId] = false;
							}

						}

					}

				}

			}


			if (refresh === true) {
				this.__refresh();
			}

		},

		__unload: function(mappings) {

			for (var url in mappings) {

				var mapping = mappings[url];
				if (mapping.packageId !== null && mapping.classId === null) {

					this.__packages[mapping.packageId] = null;
					this.__loading.packages[mapping.packageId] = false;

				} else if (mapping.packageId !== null && mapping.classId !== null) {

					if (lychee.debug === true) {
						console.warn('Package Tree index is corrupt, couldn\'t load ' + url + ' (refered by ' + mapping.packageId + '.' + mapping.classId + ')');
					}


					this.__classes[mapping.packageId + '.' + mapping.classId] = null;

					if (mapping.multiple !== true) {

						this.__loading.classes[mapping.packageId + '.' + mapping.classId] = false;

						console.log('No Alternatives available for ' + url);

					}

				}

			}

			this.__refresh();

		},

		load: function(packageId, classId, refererId) {

			packageId = typeof packageId === 'string' ? packageId : null;
			classId = typeof classId === 'string' ? classId : null;
			refererId = typeof refererId === 'string' ? refererId : null;


			// 1. Load Package Configuration
			if (packageId !== null && classId === null) {

				if (this.__packages[packageId] === undefined) {

					var url = (this.__bases[packageId] || '') + '/package.json';

					if (lychee.debug === true) {
						console.log('> loading ' + packageId + ': ' + url);
					}

					this.__loading.packages[packageId] = true;

					this.__preloader.load(url, {
						packageId: packageId,
						classId: classId
					});

				}

			// 2. Load Class
			} else if (packageId !== null && classId !== null) {

				// Wait for next __refresh() if package config wasn't loaded yet
				if (this.__packages[packageId] === undefined) return;


				if (this.__classes[packageId + '.' + classId] === undefined) {

					var candidates = this.__fuzzySearch(packageId, classId);
					if (candidates !== null) {

						if (lychee.debug === true) {

							var urls = [];
							for (var c = 0, l = candidates.length; c < l; c++) {
								urls.push(candidates[c].url);
							}

							console.log('> loading ' + packageId + '.' + classId, urls.join(', '));

						}


						var namespaceId = null;
						if (classId.indexOf('*') > 0) {

							namespaceId = classId.substr(0, classId.indexOf('*') - 1);

							var overallRequired = 0;
							for (var c = 0, l = candidates.length; c < l; c++) {
								overallRequired += candidates[c].attachments.length + 1;
							}


							this.__loading.classes[packageId + '.' + namespaceId] = true;

							this.__namespaces[packageId + '.' + namespaceId] = {
								loading: overallRequired
							};

						}


						for (var c = 0, l = candidates.length; c < l; c++) {

							var candidate = candidates[c];

							candidate.namespaceId = namespaceId;
							candidate.refererId = refererId;
							candidate._loading = candidate.attachments.length + 1;


							this.__loading.classes[candidate.packageId + '.' + candidate.classId] = true;
							this.__preloader.load(candidate.url, candidate);

						}

					} else {

						if (lychee.debug === true) {
							console.warn('> loading ' + packageId + '.' + classId + ' failed. (required by ' + refererId + ')');
						}

					}

				}

			}

		},



		/*
		 *
		 * Parsing Stuff
		 *
		 */
		__getAllIdsFromTree: function(tree, prefix, ids) {

			prefix = typeof prefix === 'string' ? prefix : '';


			var returnTree = false;

			if (Object.prototype.toString.call(ids) !== '[object Array]') {
				ids = [];
				returnTree = true;
			}


			for (var id in tree) {

				var node = tree[id];
				var type = Object.prototype.toString.call(node);
				var subprefix = prefix.length ? prefix + '/' + id : id;

				switch(type) {

					// 1. Valid Class Definition
					case '[object Array]':
						ids.push(subprefix);
					break;


					case '[object Object]':
						this.__getAllIdsFromTree(node, subprefix, ids);
					break;

				}

			}



			if (returnTree === true) {
				return ids;
			}

		},

		__getNamespace: function(namespace, scope) {

			var pointer = scope;

			var ns = namespace.split('.');
			for (var n = 0, l = ns.length; n < l; n++) {

				var name = ns[n];

				if (pointer[name] === undefined) {
					pointer[name] = {};
				}

				pointer = pointer[name];

			}


			return pointer;

		},

		__getNodeFromTree: function(tree, path, seperator) {

			var node = tree;
			var tmp = path.split(seperator);

			var t = 0;
			while (t < tmp.length) {
				node = node[tmp[t++]];
			}


			return node;

		},

		__fuzzySearch: function(packageId, classId) {

			var base = this.__bases[packageId];
			var id = '';
			var path = classId.split('.').join('/');


			var config = this.__packages[packageId] || null;
			if (config === null && this.__loading.packages[packageId] === true) {
				return null;
			}


			var candidates = [];

			if (config !== null) {

				var tree = config.tree;
				var all = this.__getAllIdsFromTree(tree, '');
				var filtered = {};


				// 1. Tags have highest priority
				for (var tag in this.__tags) {

					var values = this.__tags[tag];

					for (var v = 0, l = values.length; v < l; v++) {

						var value = values[v];

						if (config.tags[tag] && config.tags[tag][value]) {

							var folder = config.tags[tag][value];
							var id = null;

							for (var a = 0, al = all.length; a < al; a++) {

								if (all[a].substr(0, folder.length) === folder) {

									// 1.1. Namespace
									// e.g. /tag/value/namespace/Class
									if (path.indexOf('*') > 0) {

										var namespace = path.substr(0, path.indexOf('*') - 1);
										if (all[a].substr(folder.length + 1, namespace.length) === namespace) {

											id = namespace + '.' + all[a].substr(folder.length + namespace.length + 2).split('/').join('.');

											if (filtered[id] === undefined) {
												filtered[id] = [ all[a] ];
											} else {
												filtered[id].push(all[a]);
											}

										}

									// 1.2. Simple Includes
									// e.g. /tag/value/Class
									} else if (all[a].substr(folder.length + 1, path.length) === path) {

										id = classId;

										if (filtered[id] === undefined) {
											filtered[id] = [ all[a] ];
										} else {
											filtered[id].push(all[a]);
										}

									}

								}

							}

						}

					}


					// 2. No Tag-based search
					id = classId;

					for (var a = 0, al = all.length; a < al; a++) {

						// 2.1 direct includes
						// e.g. lychee/Font.js > lychee.Font
						if (all[a] === path) {

							if (filtered[id] === undefined) {
								filtered[id] = [ all[a] ];
							} else {
								filtered[id].push(all[a]);
							}

							break;

						// 2.2. subfolder includes
						// e.g. lychee/parser/ASTScope.js > lychee.ASTScope
						} else if (filtered[id] === undefined && all[a].substr(-1 * path.length) === path) {

							// 2.2.1 validate folder against other tags
							var isInvalid = false;
							for (var tag in this.__tags) {

								for (var otherValue in config.tags[tag]) {

									for (var v = 0, l = this.__tags[tag].length; v < l; v++) {

										var value = this.__tags[tag][v];
										if (value !== otherValue) {

											var folder = config.tags[tag][otherValue];
											if (all[a].substr(0, folder.length) === folder) {
												isInvalid = true;
												break;
											}

										}

									}

									if (isInvalid === true) break;

								}

								if (isInvalid === true) break;

							}


							// 2.2.2 If the folder is validated, check if it was already set
							if (isInvalid === false) {

								if (filtered[id] === undefined) {
									filtered[id] = [ all[a] ];
								} else if (filtered[id] !== undefined) {

									var alreadyInFiltered = false;

									for (var f = 0, fl = filtered[id].length; f < fl; f++) {
										if (filtered[id][f] === all[a]) {
											alreadyInFiltered = true;
											break;
										}
									}

									if (alreadyInFiltered === false) {
										filtered[id].push(all[a]);
									}

								}

							}

						}

					}

				}


				if (Object.keys(filtered).length > 0) {

					for (id in filtered) {

						var nodes = filtered[id];
						var multiple = nodes.length > 1;
						for (var n = 0, nl = nodes.length; n < nl; n++) {

							var candidate = {
								packageId: packageId,
								classId: id,
								url: this.__bases[packageId] + '/' + nodes[n] + '.js',
								multiple: multiple,
								attachments: []
							};

							var extensions = this.__getNodeFromTree(tree, nodes[n], '/');
							for (var e = 0, el = extensions.length; e < el; e++) {

								var ext = extensions[e];
								if (ext !== 'js') {
									candidate.attachments.push(this.__bases[packageId] + '/' + nodes[n] + '.' + ext);
								}
							}


							candidates.push(candidate);

						}

					}

				}

			} else {

				candidates.push({
					packageId: packageId,
					classId: classId,
					url: this.__bases[packageId] + '/' + path + '.js',
					multiple: false,
					attachments: []
				});

			}


			if (candidates.length > 0) {
				return candidates;
			} else {
				return null;
			}

		},

		__refresh: function() {

			var allDependenciesLoaded = true;


			// 1. Walk the Tree and load dependencies
			for (var id in this.__tree) {

				if (this.__tree[id] === null) continue;

				var node = this.__tree[id];
				var nodeId = node._space + '.' + node._name;
				var entry = null;


				for (var r = 0, l = node._requires.length; r < l; r++) {

					entry = node._requires[r];

					if (this.__requiresLoad(entry) === true) {

						allDependenciesLoaded = false;

						var packageId = entry.split('.')[0];
						var classId = [].concat(entry.split('.').splice(1)).join('.');

						this.load(packageId, classId, nodeId);

					}

				}


				for (var i = 0, l = node._includes.length; i < l; i++) {

					entry = node._includes[i];

					if (this.__requiresLoad(entry) === true) {

						allDependenciesLoaded = false;

						var packageId = entry.split('.')[0];
						var classId = [].concat(entry.split('.').splice(1)).join('.');

						this.load(packageId, classId, nodeId);

					}

				}

			}


			// 2. Check the loading tree and find out if something hasn't been parsed yet
			for (var id in this.__loading.classes) {

				if (
					this.__namespaces[id] === undefined && this.__tree[id] === undefined
				) {
					allDependenciesLoaded = false;
				}

			}


			// 2. If all dependencies are loaded, sort the dependency tree
			if (allDependenciesLoaded === true) {
				this.__startBuild();
			}

		},

		__requiresLoad: function(reference) {

			// Namespace Include Reference
			if (reference.indexOf('*') > 0) {

				var path = reference.substr(0, reference.indexOf('*') - 1);
				if (this.__loading.classes[path] !== undefined) {
					return false;
				}

			} else {

				var path = reference;
				if (this.__loading.classes[path] !== undefined) {
					return false;
				}

			}


			return true;

		},



		/*
		 *
		 * Building Stuff
		 *
		 */
		build: function(env, callback, scope) {

			if (lychee.debug === true) {
				console.group('lychee.Builder');
			}

			this.__clock = Date.now();

			this.__tree = Object.prototype.toString.call(env.tree) === '[object Object]' ? env.tree : {};
			this.__bases = Object.prototype.toString.call(env.bases) === '[object Object]' ? env.bases : {};
			this.__tags = Object.prototype.toString.call(env.tags) === '[object Object]' ? env.tags : {};


			callback = callback instanceof Function ? callback : function() {};
			scope = scope !== undefined ? scope : global;

			this.__buildCallback = callback;
			this.__buildScope = scope;


			if (Object.keys(this.__tree).length === 1) {
				this.__buildStart = Object.keys(this.__tree)[0];
			}


			if (lychee.debug === true) {
				console.log('Loading Dependencies for ' + this.__buildStart);
			}

			// 1. Load Package Configurations
			// (will automatically refresh afterwards)
			for (var id in this.__bases) {
				this.load(id, null);
			}

		},

		__startBuild: function() {

			this.__buildOrder = [];
			this.__sort(this.__buildStart, this.__buildOrder);


			if (lychee.debug === true) {
				console.log('Starting Build');
				console.log(this.__buildOrder);
				console.groupEnd();
			}


			for (var b = 0, l = this.__buildOrder.length; b < l; b++) {
				this.__export(this.__tree[this.__buildOrder[b]]);
			}


			var duration = Date.now() - this.__clock;
			if (lychee.debug === true) {
				console.log('COMPILE TIME END: Finished in ' + duration + 'ms');
			}


			this.__buildCallback.call(this.__buildScope, this.__buildScope.lychee, this.__buildScope);

		},

		__export: function(lyDefBlock) {

			var namespace = this.__getNamespace(lyDefBlock._space, this.__buildScope);
			var classname = lyDefBlock._name;


			var data = null;
			if (lyDefBlock._exports !== null) {
				data = lyDefBlock._exports.call(lyDefBlock._exports, lychee, global);
			}


			var includes = lyDefBlock._includes;
			if (includes.length && data != null) {

				var proto = {};
				for (var prop in data.prototype) {
					proto[prop] = data.prototype[prop];
				}


				namespace[classname] = data;
				namespace[classname].prototype = {};


				var args = [
					namespace[classname].prototype
				];


				for (var i = 0, l = includes.length; i < l; i++) {

					var id = includes[i];

					var incLyDefBlock = this.__getNodeFromTree(this.__buildScope, id, '.');
					if (!incLyDefBlock || !incLyDefBlock.prototype) {

						if (lychee.debug === true) {
							console.warn('Inclusion of ' + id + 'failed. You either forgot to return it inside lychee.exports() or created an invalid definition block.');
						}

					} else {
						args.push(this.__getNodeFromTree(this.__buildScope, id, '.').prototype);
					}

				}


				args.push(proto);

				lychee.extend.apply(lychee, args);

			} else if (data != null) {
				namespace[classname] = data;
			}

		},

		__sort: function(reference, list, visited) {

			visited = visited || {};


			if (visited[reference] !== true) {

				visited[reference] = true;

				if (reference.indexOf('*') > 0) {

					var namespace = reference.substr(0, reference.length - 2);
					for (var id in this.__tree) {

						if (id.substr(0, namespace.length) === namespace) {
							this.__sort(id, list, visited);
						}

					}


				} else {

					var node = this.__tree[reference];
					if (node === null) return;

					for (var r = 0, rl = node._requires.length; r < rl; r++) {
						this.__sort(node._requires[r], list, visited);
					}

					for (var i = 0, il = node._includes.length; i < il; i++) {
						this.__sort(node._includes[i], list, visited);
					}

					list.push(reference);

				}

			}


		},



		/*
		 *
		 * Code Merging Stuff
		 *
		 */
		getCode: function() {

			var base = lychee.getEnvironment().bases.lychee;

			var code = '';
			var namespaces = {
				// lychee core will be included later by Parser and Compiler
				lychee: true
			};


			var b, l, reference, lyDefBlock;

			for (b = 0, l = this.__buildOrder.length; b < l; b++) {

				reference = this.__buildOrder[b];
				lyDefBlock = this.__tree[reference];

				code += this.__prepareCodeNamespace(lyDefBlock._space, namespaces);

			}


			for (b = 0, l = this.__buildOrder.length; b < l; b++) {

				reference = this.__buildOrder[b];
				lyDefBlock = this.__tree[reference];

				code += reference + ' = (' + lyDefBlock._exports.toString() + ')(this.lychee, this);\n';

			}


			code += '(' + this.__buildCallback + ')(this.lychee, this);';

			return code;

		},

		__prepareCodeNamespace: function(namespace, alreadyDefined) {

			var tmp = namespace.split('.');
			var ns = tmp[0];
			var code = '';

			for (var t = 0, l = tmp.length; t < l; t++) {

				if (alreadyDefined[ns] !== true) {
					code += ns + ' = {};\n';
					alreadyDefined[ns] = true;
				}

				if (typeof tmp[t + 1] === 'string') {
					ns += '.' + tmp[t + 1];
				}

			}


			return code;

		}

	};


	lychee.build = function(callback, scope) {

		var builder = new lychee.Builder();
		var env = lychee.getEnvironment();

		builder.build(env, callback, scope);

		return builder;

	};

})(lychee, typeof global !== 'undefined' ? global : this);

