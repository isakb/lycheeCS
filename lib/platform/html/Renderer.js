// Generated by CoffeeScript 1.6.3
(function() {
  lychee.define("Renderer").tags({
    platform: "html"
  }).requires(["lychee.Font"]).supports(function(lychee, global) {
    var canvas;
    if (typeof global.document !== "undefined" && typeof global.document.createElement === "function" && typeof global.CanvasRenderingContext2D !== "undefined") {
      canvas = global.document.createElement("canvas");
      if (typeof canvas.getContext === "function") {
        return true;
      }
    }
    return false;
  }).exports(function(lychee, global) {
    var Renderer;
    return Renderer = (function() {
      function Renderer(id) {
        id = (typeof id === "string" ? id : null);
        this._id = id;
        this._canvas = global.document.createElement("canvas");
        this._ctx = this._canvas.getContext("2d");
        this._environment = {
          width: null,
          height: null,
          screen: {},
          offset: {}
        };
        this._cache = {};
        this._state = null;
        this._alpha = 1;
        this._background = null;
        this._width = 0;
        this._height = 0;
        this.context = this._canvas;
        if (this._id !== null) {
          this._canvas.id = this._id;
        }
        if (!this._canvas.parentNode) {
          global.document.body.appendChild(this._canvas);
        }
      }

      Renderer.prototype.reset = function(width, height, resetCache) {
        var canvas;
        width = (typeof width === "number" ? width : this._width);
        height = (typeof height === "number" ? height : this._height);
        resetCache = (resetCache === true ? true : false);
        if (resetCache === true) {
          this._cache = {};
        }
        canvas = this._canvas;
        this._width = width;
        this._height = height;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        return this._updateEnvironment();
      };

      Renderer.prototype.start = function() {
        if (this._state !== "running") {
          return this._state = "running";
        }
      };

      Renderer.prototype.stop = function() {
        return this._state = "stopped";
      };

      Renderer.prototype.clear = function() {
        var canvas, ctx;
        if (this._state !== "running") {
          return;
        }
        ctx = this._ctx;
        canvas = this._canvas;
        ctx.fillStyle = this._background;
        return ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      Renderer.prototype.flush = function() {};

      Renderer.prototype.isRunning = function() {
        return this._state === "running";
      };

      Renderer.prototype.getEnvironment = function() {
        this._updateEnvironment();
        return this._environment;
      };

      Renderer.prototype._updateEnvironment = function() {
        var env;
        env = this._environment;
        env.screen.width = global.innerWidth;
        env.screen.height = global.innerHeight;
        env.offset.x = this._canvas.offsetLeft;
        env.offset.y = this._canvas.offsetTop;
        env.width = this._width;
        return env.height = this._height;
      };

      Renderer.prototype.setAlpha = function(alpha) {
        alpha = (typeof alpha === "number" ? alpha : null);
        if (alpha !== null && alpha >= 0 && alpha <= 1) {
          return this._ctx.globalAlpha = alpha;
        }
      };

      Renderer.prototype.setBackground = function(color) {
        color = (typeof color === "string" ? color : "#000000");
        this._background = color;
        return this._canvas.style.backgroundColor = color;
      };

      Renderer.prototype.drawTriangle = function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {
        var ctx;
        if (this._state !== "running") {
          return;
        }
        color = (typeof color === "string" ? color : "#000000");
        background = (background === true ? true : false);
        lineWidth = (typeof lineWidth === "number" ? lineWidth : 1);
        ctx = this._ctx;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x1, y1);
        if (background === false) {
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = color;
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.fill();
        }
        return ctx.closePath();
      };

      Renderer.prototype.drawPolygon = function(points, x1, y1) {
        var background, color, ctx, l, lineWidth, optargs, p;
        if (this._state !== "running") {
          return;
        }
        l = arguments.length;
        if (points > 3) {
          optargs = l - (points * 2) - 1;
          color = "#000000";
          background = false;
          lineWidth = 1;
          if (optargs === 3) {
            color = arguments[l - 3];
            background = arguments[l - 2];
            lineWidth = arguments[l - 1];
          } else if (optargs === 2) {
            color = arguments[l - 2];
            background = arguments[l - 1];
          } else {
            if (optargs === 1) {
              color = arguments[l - 1];
            }
          }
          ctx = this._ctx;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          p = 1;
          while (p < points) {
            ctx.lineTo(arguments[1 + p * 2], arguments[1 + p * 2 + 1]);
            p++;
          }
          ctx.lineTo(x1, y1);
          if (background === false) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.stroke();
          } else {
            ctx.fillStyle = color;
            ctx.fill();
          }
          return ctx.closePath();
        }
      };

      Renderer.prototype.drawBox = function(x1, y1, x2, y2, color, background, lineWidth) {
        var ctx;
        if (this._state !== "running") {
          return;
        }
        color = (typeof color === "string" ? color : "#000000");
        background = (background === true ? true : false);
        lineWidth = (typeof lineWidth === "number" ? lineWidth : 1);
        ctx = this._ctx;
        if (background === false) {
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = color;
          return ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        } else {
          ctx.fillStyle = color;
          return ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
      };

      Renderer.prototype.drawCircle = function(x, y, radius, color, background, lineWidth) {
        var ctx;
        if (this._state !== "running") {
          return;
        }
        color = (typeof color === "string" ? color : "#000000");
        background = (background === true ? true : false);
        lineWidth = (typeof lineWidth === "number" ? lineWidth : 1);
        ctx = this._ctx;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (background === false) {
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = color;
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.fill();
        }
        return ctx.closePath();
      };

      Renderer.prototype.drawLine = function(x1, y1, x2, y2, color, lineWidth) {
        var ctx;
        if (this._state !== "running") {
          return;
        }
        color = (typeof color === "string" ? color : "#000000");
        lineWidth = (typeof lineWidth === "number" ? lineWidth : 1);
        ctx = this._ctx;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
        return ctx.closePath();
      };

      Renderer.prototype.drawSprite = function(x1, y1, sprite, map) {
        if (this._state !== "running") {
          return;
        }
        map = (Object.prototype.toString.call(map) === "[object Object]" ? map : null);
        if (map === null) {
          return this._ctx.drawImage(sprite, x1, y1);
        } else {
          if (lychee.debug === true) {
            this.drawBox(x1, y1, x1 + map.w, y1 + map.h, "#ff0000", false, 1);
          }
          return this._ctx.drawImage(sprite, map.x, map.y, map.w, map.h, x1, y1, map.w, map.h);
        }
      };

      Renderer.prototype.drawText = function(x1, y1, text, font) {
        var chr, height, l, margin, settings, sprite, t, width, _results;
        if (this._state !== "running") {
          return;
        }
        font = (font instanceof lychee.Font ? font : null);
        if (font !== null) {
          settings = font.getSettings();
          sprite = font.getSprite();
          chr = void 0;
          t = void 0;
          l = void 0;
          if (x1 === "center" || y1 === "center") {
            width = 0;
            height = 0;
            t = 0;
            l = text.length;
            while (t < l) {
              chr = font.get(text[t]);
              width += chr.real + settings.kerning;
              height = Math.max(height, chr.height);
              t++;
            }
            if (x1 === "center") {
              x1 = (this._width / 2) - (width / 2);
            }
            if (y1 === "center") {
              y1 = (this._height / 2) - (height / 2);
            }
          }
          margin = 0;
          t = 0;
          l = text.length;
          _results = [];
          while (t < l) {
            chr = font.get(text[t]);
            if (lychee.debug === true) {
              this.drawBox(x1 + margin, y1, x1 + margin + chr.real, y1 + chr.height, "#ffff00", false, 1);
            }
            this._ctx.drawImage(chr.sprite || sprite, chr.x, chr.y, chr.width, chr.height, x1 + margin - settings.spacing, y1 + settings.baseline, chr.width, chr.height);
            margin += chr.real + settings.kerning;
            _results.push(t++);
          }
          return _results;
        }
      };

      return Renderer;

    })();
  });

}).call(this);