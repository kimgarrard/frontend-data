// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"bundle.js":[function(require,module,exports) {
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function (d3$1, topojson) {
  'use strict';

  var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX dc: <http://purl.org/dc/elements/1.1/>\nPREFIX dct: <http://purl.org/dc/terms/>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX edm: <http://www.europeana.eu/schemas/edm/>\nPREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>\nPREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>\nPREFIX geo: <http://www.opengis.net/ont/geosparql#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX gn: <http://www.geonames.org/ontology#>\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\n# een foto per land (met type, img, lat en long van de plaats\nSELECT  (SAMPLE(?cho) AS ?cho) \n\t\t\t\t(SAMPLE(?title) AS ?title) \n        (SAMPLE(?typeLabel) AS ?type) \n        (SAMPLE(?img) AS ?img) \n        (SAMPLE(?lat) AS ?lat)\n        (SAMPLE(?long) AS ?long)\n        ?landLabel \n\nWHERE {\n  # vind alleen foto's\n  <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .\n  ?type skos:prefLabel ?typeLabel .   \n  ?cho edm:object ?type .\n\n  # ?cho dc:title ?title .\n  ?cho edm:isShownBy ?img .\n  ?cho dc:title ?title .\n\n  # vind bij de objecten het land\n  ?cho dct:spatial ?place .\n  ?place skos:exactMatch/gn:parentCountry ?land .\n  # ?place skos:prefLabel ?placeName .\n  ?land gn:name ?landLabel .\n  \n  # vind bij de plaats van de foto de lat/long\n  ?place skos:exactMatch/wgs84:lat ?lat .\n  ?place skos:exactMatch/wgs84:long ?long .      \n\n} GROUP BY ?landLabel\nORDER BY ?landLabel \nLIMIT 10";
  var endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql";
  var svg = d3$1.select('svg');
  var width = 200;
  var height = 200;
  var projection = d3$1.geoNaturalEarth1();
  var pathGenerator = d3$1.geoPath().projection(projection); //functies setupMap() en drawMap() van Laurens
  //https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0

  setupMap();
  drawMap();
  zoomToMap();
  data(); //Alle data functies aanroepen
  //Code van Laurens
  //https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3

  function data() {
    var data;
    return regeneratorRuntime.async(function data$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(loadJSONData(endpoint, query));

          case 2:
            data = _context.sent;
            //pas werken met data wanneer data is omgezet in json
            data = data.map(cleanData);
            data = changeImageURL(data); //code van Laurens, aangepast naar type
            // data = transformData(data)

            console.log(data);
            data = plotImages(data);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    });
  } //Code van Laurens
  //Load the data and return a promise which resolves with said data


  function loadJSONData(url, query) {
    return d3$1.json(endpoint + "?query=" + encodeURIComponent(query) + "&format=json").then(function (data) {
      return data.results.bindings;
    });
  } //Code van Laurens
  //This function gets the nested value out of the object in each property in our data


  function cleanData(data) {
    var result = {};
    Object.entries(data).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          propValue = _ref2[1];

      result[key] = propValue.value;
    });
    return result;
  } //Vervang 'http' door 'https'


  function changeImageURL(results) {
    results.map(function (result) {
      result.img = result.img.replace('http', 'https');
    });
    return results;
  } // //Nest the data per type
  // function transformData(source){
  //   let transformed =  d3.nest()
  // 		.key(function(d) { return d.type; })
  // 		.entries(source);
  //   transformed.forEach(type => {
  //     type.amount = type.values.length
  //   })
  //   return transformed
  // }


  function setupMap() {
    svg.append('path').attr('class', 'sphere').attr('d', pathGenerator({
      type: 'Sphere'
    }));
  }

  function drawMap() {
    d3$1.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(function (data) {
      var countries = topojson.feature(data, data.objects.countries);
      svg.selectAll('path').data(countries.features).enter().append('path').attr('class', 'country').attr('d', pathGenerator);
    });
  }

  function zoomToMap() {
    svg.call(d3.zoom().extent([[0, 0], [width, height]]).scaleExtent([1, 2]).on("zoom", zoomed));
  }

  function zoomed() {
    svg.attr("transform", d3.event.transform);
  }

  function plotImages(dataImg) {
    svg.selectAll('imageDiv').data(dataImg).enter() //dankzij hulp van Laurens
    .append('image').attr("xlink:href", function (d) {
      return d.img;
    }).attr('class', 'images').attr('x', function (d) {
      return projection([d.long, d.lat])[0];
    }).attr('y', function (d) {
      return projection([d.long, d.lat])[1];
    }).on("mouseover", handleMouseOver); // .on("mouseout", handleMouseOut);

    return dataImg;
  } // Create Event Handlers for mouse


  function handleMouseOver(data) {
    // Add interactivity
    // Specify where to put label of text
    svg //.data(data)
    .append("text").text('test').attr('class', 'tekst'); //         	.attr('x', function(d) {
    //   return projection([d.long, d.lat])[0]
    // })
    // .attr('y', function(d) {
    //   return projection([d.long, d.lat])[1]
    // })
    // .text(function() {
    //   return [d.x, d.y];  // Value of the text
    // });
    //console.log(text)
    // .text(function() {
    // return [d.x, d.y];  // Value of the text
    // });
  }
})(d3, topojson);
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60046" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","bundle.js"], null)
//# sourceMappingURL=/bundle.81605655.js.map