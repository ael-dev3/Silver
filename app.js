"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn2, res) => function __init() {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/fancy-canvas/size.mjs
  function size(_a) {
    var width = _a.width, height = _a.height;
    if (width < 0) {
      throw new Error("Negative width is not allowed for Size");
    }
    if (height < 0) {
      throw new Error("Negative height is not allowed for Size");
    }
    return {
      width,
      height
    };
  }
  function equalSizes(first, second) {
    return first.width === second.width && first.height === second.height;
  }
  var init_size = __esm({
    "node_modules/fancy-canvas/size.mjs"() {
    }
  });

  // node_modules/fancy-canvas/device-pixel-ratio.mjs
  function createObservable(win) {
    return new Observable(win);
  }
  var Observable;
  var init_device_pixel_ratio = __esm({
    "node_modules/fancy-canvas/device-pixel-ratio.mjs"() {
      Observable = /** @class */
      (function() {
        function Observable2(win) {
          var _this = this;
          this._resolutionListener = function() {
            return _this._onResolutionChanged();
          };
          this._resolutionMediaQueryList = null;
          this._observers = [];
          this._window = win;
          this._installResolutionListener();
        }
        Observable2.prototype.dispose = function() {
          this._uninstallResolutionListener();
          this._window = null;
        };
        Object.defineProperty(Observable2.prototype, "value", {
          get: function() {
            return this._window.devicePixelRatio;
          },
          enumerable: false,
          configurable: true
        });
        Observable2.prototype.subscribe = function(next) {
          var _this = this;
          var observer = { next };
          this._observers.push(observer);
          return {
            unsubscribe: function() {
              _this._observers = _this._observers.filter(function(o2) {
                return o2 !== observer;
              });
            }
          };
        };
        Observable2.prototype._installResolutionListener = function() {
          if (this._resolutionMediaQueryList !== null) {
            throw new Error("Resolution listener is already installed");
          }
          var dppx = this._window.devicePixelRatio;
          this._resolutionMediaQueryList = this._window.matchMedia("all and (resolution: ".concat(dppx, "dppx)"));
          this._resolutionMediaQueryList.addListener(this._resolutionListener);
        };
        Observable2.prototype._uninstallResolutionListener = function() {
          if (this._resolutionMediaQueryList !== null) {
            this._resolutionMediaQueryList.removeListener(this._resolutionListener);
            this._resolutionMediaQueryList = null;
          }
        };
        Observable2.prototype._reinstallResolutionListener = function() {
          this._uninstallResolutionListener();
          this._installResolutionListener();
        };
        Observable2.prototype._onResolutionChanged = function() {
          var _this = this;
          this._observers.forEach(function(observer) {
            return observer.next(_this._window.devicePixelRatio);
          });
          this._reinstallResolutionListener();
        };
        return Observable2;
      })();
    }
  });

  // node_modules/fancy-canvas/canvas-element-bitmap-size.mjs
  function bindTo(canvasElement, target) {
    if (target.type === "device-pixel-content-box") {
      return new DevicePixelContentBoxBinding(canvasElement, target.transform, target.options);
    }
    throw new Error("Unsupported binding target");
  }
  function canvasElementWindow(canvasElement) {
    return canvasElement.ownerDocument.defaultView;
  }
  function isDevicePixelContentBoxSupported() {
    return new Promise(function(resolve) {
      var ro = new ResizeObserver(function(entries) {
        resolve(entries.every(function(entry) {
          return "devicePixelContentBoxSize" in entry;
        }));
        ro.disconnect();
      });
      ro.observe(document.body, { box: "device-pixel-content-box" });
    }).catch(function() {
      return false;
    });
  }
  function predictedBitmapSize(canvasRect, ratio) {
    return size({
      width: Math.round(canvasRect.left * ratio + canvasRect.width * ratio) - Math.round(canvasRect.left * ratio),
      height: Math.round(canvasRect.top * ratio + canvasRect.height * ratio) - Math.round(canvasRect.top * ratio)
    });
  }
  var DevicePixelContentBoxBinding;
  var init_canvas_element_bitmap_size = __esm({
    "node_modules/fancy-canvas/canvas-element-bitmap-size.mjs"() {
      init_size();
      init_device_pixel_ratio();
      DevicePixelContentBoxBinding = /** @class */
      (function() {
        function DevicePixelContentBoxBinding2(canvasElement, transformBitmapSize, options) {
          var _a;
          this._canvasElement = null;
          this._bitmapSizeChangedListeners = [];
          this._suggestedBitmapSize = null;
          this._suggestedBitmapSizeChangedListeners = [];
          this._devicePixelRatioObservable = null;
          this._canvasElementResizeObserver = null;
          this._canvasElement = canvasElement;
          this._canvasElementClientSize = size({
            width: this._canvasElement.clientWidth,
            height: this._canvasElement.clientHeight
          });
          this._transformBitmapSize = transformBitmapSize !== null && transformBitmapSize !== void 0 ? transformBitmapSize : (function(size2) {
            return size2;
          });
          this._allowResizeObserver = (_a = options === null || options === void 0 ? void 0 : options.allowResizeObserver) !== null && _a !== void 0 ? _a : true;
          this._chooseAndInitObserver();
        }
        DevicePixelContentBoxBinding2.prototype.dispose = function() {
          var _a, _b;
          if (this._canvasElement === null) {
            throw new Error("Object is disposed");
          }
          (_a = this._canvasElementResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
          this._canvasElementResizeObserver = null;
          (_b = this._devicePixelRatioObservable) === null || _b === void 0 ? void 0 : _b.dispose();
          this._devicePixelRatioObservable = null;
          this._suggestedBitmapSizeChangedListeners.length = 0;
          this._bitmapSizeChangedListeners.length = 0;
          this._canvasElement = null;
        };
        Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElement", {
          get: function() {
            if (this._canvasElement === null) {
              throw new Error("Object is disposed");
            }
            return this._canvasElement;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElementClientSize", {
          get: function() {
            return this._canvasElementClientSize;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "bitmapSize", {
          get: function() {
            return size({
              width: this.canvasElement.width,
              height: this.canvasElement.height
            });
          },
          enumerable: false,
          configurable: true
        });
        DevicePixelContentBoxBinding2.prototype.resizeCanvasElement = function(clientSize) {
          this._canvasElementClientSize = size(clientSize);
          this.canvasElement.style.width = "".concat(this._canvasElementClientSize.width, "px");
          this.canvasElement.style.height = "".concat(this._canvasElementClientSize.height, "px");
          this._invalidateBitmapSize();
        };
        DevicePixelContentBoxBinding2.prototype.subscribeBitmapSizeChanged = function(listener) {
          this._bitmapSizeChangedListeners.push(listener);
        };
        DevicePixelContentBoxBinding2.prototype.unsubscribeBitmapSizeChanged = function(listener) {
          this._bitmapSizeChangedListeners = this._bitmapSizeChangedListeners.filter(function(l2) {
            return l2 !== listener;
          });
        };
        Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "suggestedBitmapSize", {
          get: function() {
            return this._suggestedBitmapSize;
          },
          enumerable: false,
          configurable: true
        });
        DevicePixelContentBoxBinding2.prototype.subscribeSuggestedBitmapSizeChanged = function(listener) {
          this._suggestedBitmapSizeChangedListeners.push(listener);
        };
        DevicePixelContentBoxBinding2.prototype.unsubscribeSuggestedBitmapSizeChanged = function(listener) {
          this._suggestedBitmapSizeChangedListeners = this._suggestedBitmapSizeChangedListeners.filter(function(l2) {
            return l2 !== listener;
          });
        };
        DevicePixelContentBoxBinding2.prototype.applySuggestedBitmapSize = function() {
          if (this._suggestedBitmapSize === null) {
            return;
          }
          var oldSuggestedSize = this._suggestedBitmapSize;
          this._suggestedBitmapSize = null;
          this._resizeBitmap(oldSuggestedSize);
          this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, this._suggestedBitmapSize);
        };
        DevicePixelContentBoxBinding2.prototype._resizeBitmap = function(newSize) {
          var oldSize = this.bitmapSize;
          if (equalSizes(oldSize, newSize)) {
            return;
          }
          this.canvasElement.width = newSize.width;
          this.canvasElement.height = newSize.height;
          this._emitBitmapSizeChanged(oldSize, newSize);
        };
        DevicePixelContentBoxBinding2.prototype._emitBitmapSizeChanged = function(oldSize, newSize) {
          var _this = this;
          this._bitmapSizeChangedListeners.forEach(function(listener) {
            return listener.call(_this, oldSize, newSize);
          });
        };
        DevicePixelContentBoxBinding2.prototype._suggestNewBitmapSize = function(newSize) {
          var oldSuggestedSize = this._suggestedBitmapSize;
          var finalNewSize = size(this._transformBitmapSize(newSize, this._canvasElementClientSize));
          var newSuggestedSize = equalSizes(this.bitmapSize, finalNewSize) ? null : finalNewSize;
          if (oldSuggestedSize === null && newSuggestedSize === null) {
            return;
          }
          if (oldSuggestedSize !== null && newSuggestedSize !== null && equalSizes(oldSuggestedSize, newSuggestedSize)) {
            return;
          }
          this._suggestedBitmapSize = newSuggestedSize;
          this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, newSuggestedSize);
        };
        DevicePixelContentBoxBinding2.prototype._emitSuggestedBitmapSizeChanged = function(oldSize, newSize) {
          var _this = this;
          this._suggestedBitmapSizeChangedListeners.forEach(function(listener) {
            return listener.call(_this, oldSize, newSize);
          });
        };
        DevicePixelContentBoxBinding2.prototype._chooseAndInitObserver = function() {
          var _this = this;
          if (!this._allowResizeObserver) {
            this._initDevicePixelRatioObservable();
            return;
          }
          isDevicePixelContentBoxSupported().then(function(isSupported) {
            return isSupported ? _this._initResizeObserver() : _this._initDevicePixelRatioObservable();
          });
        };
        DevicePixelContentBoxBinding2.prototype._initDevicePixelRatioObservable = function() {
          var _this = this;
          if (this._canvasElement === null) {
            return;
          }
          var win = canvasElementWindow(this._canvasElement);
          if (win === null) {
            throw new Error("No window is associated with the canvas");
          }
          this._devicePixelRatioObservable = createObservable(win);
          this._devicePixelRatioObservable.subscribe(function() {
            return _this._invalidateBitmapSize();
          });
          this._invalidateBitmapSize();
        };
        DevicePixelContentBoxBinding2.prototype._invalidateBitmapSize = function() {
          var _a, _b;
          if (this._canvasElement === null) {
            return;
          }
          var win = canvasElementWindow(this._canvasElement);
          if (win === null) {
            return;
          }
          var ratio = (_b = (_a = this._devicePixelRatioObservable) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : win.devicePixelRatio;
          var canvasRects = this._canvasElement.getClientRects();
          var newSize = (
            // eslint-disable-next-line no-negated-condition
            canvasRects[0] !== void 0 ? predictedBitmapSize(canvasRects[0], ratio) : size({
              width: this._canvasElementClientSize.width * ratio,
              height: this._canvasElementClientSize.height * ratio
            })
          );
          this._suggestNewBitmapSize(newSize);
        };
        DevicePixelContentBoxBinding2.prototype._initResizeObserver = function() {
          var _this = this;
          if (this._canvasElement === null) {
            return;
          }
          this._canvasElementResizeObserver = new ResizeObserver(function(entries) {
            var entry = entries.find(function(entry2) {
              return entry2.target === _this._canvasElement;
            });
            if (!entry || !entry.devicePixelContentBoxSize || !entry.devicePixelContentBoxSize[0]) {
              return;
            }
            var entrySize = entry.devicePixelContentBoxSize[0];
            var newSize = size({
              width: entrySize.inlineSize,
              height: entrySize.blockSize
            });
            _this._suggestNewBitmapSize(newSize);
          });
          this._canvasElementResizeObserver.observe(this._canvasElement, { box: "device-pixel-content-box" });
        };
        return DevicePixelContentBoxBinding2;
      })();
    }
  });

  // node_modules/fancy-canvas/canvas-rendering-target.mjs
  function tryCreateCanvasRenderingTarget2D(binding, contextOptions) {
    var mediaSize = binding.canvasElementClientSize;
    if (mediaSize.width === 0 || mediaSize.height === 0) {
      return null;
    }
    var bitmapSize = binding.bitmapSize;
    if (bitmapSize.width === 0 || bitmapSize.height === 0) {
      return null;
    }
    var context = binding.canvasElement.getContext("2d", contextOptions);
    if (context === null) {
      return null;
    }
    return new CanvasRenderingTarget2D(context, mediaSize, bitmapSize);
  }
  var CanvasRenderingTarget2D;
  var init_canvas_rendering_target = __esm({
    "node_modules/fancy-canvas/canvas-rendering-target.mjs"() {
      CanvasRenderingTarget2D = /** @class */
      (function() {
        function CanvasRenderingTarget2D2(context, mediaSize, bitmapSize) {
          if (mediaSize.width === 0 || mediaSize.height === 0) {
            throw new TypeError("Rendering target could only be created on a media with positive width and height");
          }
          this._mediaSize = mediaSize;
          if (bitmapSize.width === 0 || bitmapSize.height === 0) {
            throw new TypeError("Rendering target could only be created using a bitmap with positive integer width and height");
          }
          this._bitmapSize = bitmapSize;
          this._context = context;
        }
        CanvasRenderingTarget2D2.prototype.useMediaCoordinateSpace = function(f2) {
          try {
            this._context.save();
            this._context.setTransform(1, 0, 0, 1, 0, 0);
            this._context.scale(this._horizontalPixelRatio, this._verticalPixelRatio);
            return f2({
              context: this._context,
              mediaSize: this._mediaSize
            });
          } finally {
            this._context.restore();
          }
        };
        CanvasRenderingTarget2D2.prototype.useBitmapCoordinateSpace = function(f2) {
          try {
            this._context.save();
            this._context.setTransform(1, 0, 0, 1, 0, 0);
            return f2({
              context: this._context,
              mediaSize: this._mediaSize,
              bitmapSize: this._bitmapSize,
              horizontalPixelRatio: this._horizontalPixelRatio,
              verticalPixelRatio: this._verticalPixelRatio
            });
          } finally {
            this._context.restore();
          }
        };
        Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_horizontalPixelRatio", {
          get: function() {
            return this._bitmapSize.width / this._mediaSize.width;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_verticalPixelRatio", {
          get: function() {
            return this._bitmapSize.height / this._mediaSize.height;
          },
          enumerable: false,
          configurable: true
        });
        return CanvasRenderingTarget2D2;
      })();
    }
  });

  // node_modules/fancy-canvas/index.mjs
  var init_fancy_canvas = __esm({
    "node_modules/fancy-canvas/index.mjs"() {
      init_size();
      init_canvas_element_bitmap_size();
      init_canvas_rendering_target();
    }
  });

  // node_modules/lightweight-charts/dist/lightweight-charts.production.mjs
  function a(t, i) {
    const s = { 0: [], 1: [t.lineWidth, t.lineWidth], 2: [2 * t.lineWidth, 2 * t.lineWidth], 3: [6 * t.lineWidth, 6 * t.lineWidth], 4: [t.lineWidth, 4 * t.lineWidth] }[i];
    t.setLineDash(s);
  }
  function l(t, i, s, n) {
    t.beginPath();
    const e2 = t.lineWidth % 2 ? 0.5 : 0;
    t.moveTo(s, i + e2), t.lineTo(n, i + e2), t.stroke();
  }
  function o(t, i) {
    if (!t) throw new Error("Assertion failed" + (i ? ": " + i : ""));
  }
  function _(t) {
    if (void 0 === t) throw new Error("Value is undefined");
    return t;
  }
  function u(t) {
    if (null === t) throw new Error("Value is null");
    return t;
  }
  function c(t) {
    return u(_(t));
  }
  function f(t, ...i) {
    for (const s of i) for (const i2 in s) void 0 !== s[i2] && Object.prototype.hasOwnProperty.call(s, i2) && !["__proto__", "constructor", "prototype"].includes(i2) && ("object" != typeof s[i2] || void 0 === t[i2] || Array.isArray(s[i2]) ? t[i2] = s[i2] : f(t[i2], s[i2]));
    return t;
  }
  function p(t) {
    return "number" == typeof t && isFinite(t);
  }
  function v(t) {
    return "number" == typeof t && t % 1 == 0;
  }
  function m(t) {
    return "string" == typeof t;
  }
  function w(t) {
    return "boolean" == typeof t;
  }
  function g(t) {
    const i = t;
    if (!i || "object" != typeof i) return i;
    let s, n, e2;
    for (n in s = Array.isArray(i) ? [] : {}, i) i.hasOwnProperty(n) && (e2 = i[n], s[n] = e2 && "object" == typeof e2 ? g(e2) : e2);
    return s;
  }
  function M(t) {
    return null !== t;
  }
  function b(t) {
    return null === t ? void 0 : t;
  }
  function x(t, i, s) {
    return void 0 === i && (i = S), `${s = void 0 !== s ? `${s} ` : ""}${t}px ${i}`;
  }
  function y(t) {
    return t < 0 ? 0 : t > 255 ? 255 : Math.round(t) || 0;
  }
  function k(t) {
    return 0.199 * t[0] + 0.687 * t[1] + 0.114 * t[2];
  }
  function I() {
    return { ot: [{ _t: 0, ut: 0, wt: 0, gt: 0 }], vt: "", dt: "", ft: 0, ct: 0, lt: null };
  }
  function L(t, i, s, n, e2, r2) {
    t.fillRect(i + r2, s, n - 2 * r2, r2), t.fillRect(i + r2, s + e2 - r2, n - 2 * r2, r2), t.fillRect(i, s, r2, e2), t.fillRect(i + n - r2, s, r2, e2);
  }
  function z(t, i, s, n, e2, r2) {
    t.save(), t.globalCompositeOperation = "copy", t.fillStyle = r2, t.fillRect(i, s, n, e2), t.restore();
  }
  function O(t, i, s, n, e2, r2) {
    t.beginPath(), t.roundRect ? t.roundRect(i, s, n, e2, r2) : (t.lineTo(i + n - r2[1], s), 0 !== r2[1] && t.arcTo(i + n, s, i + n, s + r2[1], r2[1]), t.lineTo(i + n, s + e2 - r2[2]), 0 !== r2[2] && t.arcTo(i + n, s + e2, i + n - r2[2], s + e2, r2[2]), t.lineTo(i + r2[3], s + e2), 0 !== r2[3] && t.arcTo(i, s + e2, i, s + e2 - r2[3], r2[3]), t.lineTo(i, s + r2[0]), 0 !== r2[0] && t.arcTo(i, s, i + r2[0], s, r2[0]));
  }
  function N(t, i, s, n, e2, r2, h2 = 0, a2 = [0, 0, 0, 0], l2 = "") {
    if (t.save(), !h2 || !l2 || l2 === r2) return O(t, i, s, n, e2, a2), t.fillStyle = r2, t.fill(), void t.restore();
    const o2 = h2 / 2;
    var _2;
    O(t, i + o2, s + o2, n - h2, e2 - h2, (_2 = -o2, a2.map(((t2) => 0 === t2 ? t2 : t2 + _2)))), "transparent" !== r2 && (t.fillStyle = r2, t.fill()), "transparent" !== l2 && (t.lineWidth = h2, t.strokeStyle = l2, t.closePath(), t.stroke()), t.restore();
  }
  function F(t, i, s, n, e2, r2, h2) {
    t.save(), t.globalCompositeOperation = "copy";
    const a2 = t.createLinearGradient(0, 0, 0, e2);
    a2.addColorStop(0, r2), a2.addColorStop(1, h2), t.fillStyle = a2, t.fillRect(i, s, n, e2), t.restore();
  }
  function G(t) {
    return "left" === t || "right" === t;
  }
  function tt(t, i) {
    if (!p(t)) return "n/a";
    if (!v(i)) throw new TypeError("invalid length");
    if (i < 0 || i > 16) throw new TypeError("invalid length");
    if (0 === i) return t.toString();
    return ("0000000000000000" + t.toString()).slice(-i);
  }
  function vt(t, i, s, n) {
    const e2 = Number.isFinite(i), r2 = Number.isFinite(s);
    return e2 && r2 ? t(i, s) : e2 || r2 ? e2 ? i : s : n;
  }
  function Tt(t, i, s, n, e2 = 0, r2 = i.length) {
    let h2 = r2 - e2;
    for (; 0 < h2; ) {
      const r3 = h2 >> 1, a2 = e2 + r3;
      n(i[a2], s) === t ? (e2 = a2 + 1, h2 -= r3 + 1) : h2 = r3;
    }
    return e2;
  }
  function Et(t, i) {
    if (null === t) return i;
    if (null === i) return t;
    return { Fh: Math.min(t.Fh, i.Fh), Wh: Math.max(t.Wh, i.Wh) };
  }
  function At() {
    return new Bt();
  }
  function Ut(t) {
    return { ri: t.text(), Ei: t.coordinate(), Vi: t.fixedCoordinate?.(), R: t.textColor(), G: t.backColor(), It: t.visible?.() ?? true, pi: t.tickVisible?.() ?? true };
  }
  function Yt(t, i, s, n) {
    t.forEach(((t2) => {
      i(t2).forEach(((t3) => {
        t3.Yh() === s && n.push(t3);
      }));
    }));
  }
  function Kt(t) {
    return t.Ys();
  }
  function Zt(t) {
    return t.na();
  }
  function Gt(t) {
    return t.ea();
  }
  function si(t, i, s) {
    return Math.min(Math.max(t, i), s);
  }
  function ni(t, i, s) {
    return i - t <= s;
  }
  function oi(t, i) {
    const s = 100 * (t - i) / i;
    return i < 0 ? -s : s;
  }
  function _i(t, i) {
    const s = oi(t.Ze(), i), n = oi(t.Ge(), i);
    return new mt(s, n);
  }
  function ui(t, i) {
    const s = 100 * (t - i) / i + 100;
    return i < 0 ? -s : s;
  }
  function ci(t, i) {
    const s = ui(t.Ze(), i), n = ui(t.Ge(), i);
    return new mt(s, n);
  }
  function di(t, i) {
    const s = Math.abs(t);
    if (s < 1e-15) return 0;
    const n = Math.log10(s + i.El) + i.Bl;
    return t < 0 ? -n : n;
  }
  function fi(t, i) {
    const s = Math.abs(t);
    if (s < 1e-15) return 0;
    const n = Math.pow(10, s - i.Bl) - i.El;
    return t < 0 ? -n : n;
  }
  function pi(t, i) {
    if (null === t) return null;
    const s = di(t.Ze(), i), n = di(t.Ge(), i);
    return new mt(s, n);
  }
  function vi(t, i) {
    if (null === t) return null;
    const s = fi(t.Ze(), i), n = fi(t.Ge(), i);
    return new mt(s, n);
  }
  function mi(t) {
    if (null === t) return li;
    const i = Math.abs(t.Ge() - t.Ze());
    if (i >= 1 || i < 1e-15) return li;
    const s = Math.ceil(Math.abs(Math.log10(i))), n = li.Bl + s;
    return { Bl: n, El: 1 / Math.pow(10, n) };
  }
  function Mi(t) {
    return t.slice().sort(((t2, i) => u(t2._s()) - u(i._s())));
  }
  function yi(t) {
    return t instanceof Jt;
  }
  function Pi(t) {
    return { hu: t.hu, au: { te: t.lu.externalId }, ou: t.lu.cursorStyle };
  }
  function Ti(t, i, s, n) {
    for (const e2 of t) {
      const t2 = e2.Tt(n);
      if (null !== t2 && t2.Qn) {
        const n2 = t2.Qn(i, s);
        if (null !== n2) return { _u: e2, au: n2 };
      }
    }
    return null;
  }
  function Ri(t) {
    return void 0 !== t.Ys;
  }
  function Di(t, i, s) {
    const n = [t, ...t.Dt()], e2 = (function(t2, i2, s2) {
      let n2, e3;
      for (const a2 of t2) {
        const t3 = a2.Za?.(i2, s2) ?? [];
        for (const i3 of t3) r2 = i3.zOrder, h2 = n2?.zOrder, (!h2 || "top" === r2 && "top" !== h2 || "normal" === r2 && "bottom" === h2) && (n2 = i3, e3 = a2);
      }
      var r2, h2;
      return n2 && e3 ? { lu: n2, hu: e3 } : null;
    })(n, i, s);
    if ("top" === e2?.lu.zOrder) return Pi(e2);
    for (const r2 of n) {
      if (e2 && e2.hu === r2 && "bottom" !== e2.lu.zOrder && !e2.lu.isBackground) return Pi(e2);
      if (Ri(r2)) {
        const n2 = Ti(r2.Ys(t), i, s, t);
        if (null !== n2) return { hu: r2, _u: n2._u, au: n2.au };
      }
      if (e2 && e2.hu === r2 && "bottom" !== e2.lu.zOrder && e2.lu.isBackground) return Pi(e2);
    }
    return e2?.lu ? Pi(e2) : null;
  }
  function Bi(t, i) {
    return null === t || null === i ? t === i : t.Ye(i);
  }
  function Li(t, i) {
    return t.weight > i.weight ? t : i;
  }
  function $i(t) {
    if (t >= 1) return 0;
    let i = 0;
    for (; i < 8; i++) {
      const s = Math.round(t);
      if (Math.abs(s - t) < 1e-8) return i;
      t *= 10;
    }
    return i;
  }
  function qi(t) {
    return !p(t) && !m(t);
  }
  function ji(t) {
    return p(t);
  }
  function Ki(t, i, s) {
    return i.replace(/yyyy/g, ((t2) => tt(Yi(t2), 4))(t)).replace(/yy/g, ((t2) => tt(Yi(t2) % 100, 2))(t)).replace(/MMMM/g, ((t2, i2) => new Date(t2.getUTCFullYear(), t2.getUTCMonth(), 1).toLocaleString(i2, { month: "long" }))(t, s)).replace(/MMM/g, ((t2, i2) => new Date(t2.getUTCFullYear(), t2.getUTCMonth(), 1).toLocaleString(i2, { month: "short" }))(t, s)).replace(/MM/g, ((t2) => tt(((t3) => t3.getUTCMonth() + 1)(t2), 2))(t)).replace(/dd/g, ((t2) => tt(((t3) => t3.getUTCDate())(t2), 2))(t));
  }
  function Qi(t) {
    return 60 * t * 60 * 1e3;
  }
  function ts(t) {
    return 60 * t * 1e3;
  }
  function ns(t, i) {
    if (t.getUTCFullYear() !== i.getUTCFullYear()) return 70;
    if (t.getUTCMonth() !== i.getUTCMonth()) return 60;
    if (t.getUTCDate() !== i.getUTCDate()) return 50;
    for (let s = is.length - 1; s >= 0; --s) if (Math.floor(i.getTime() / is[s]._f) !== Math.floor(t.getTime() / is[s]._f)) return is[s].uf;
    return 0;
  }
  function es(t) {
    let i = t;
    if (m(t) && (i = hs(t)), !qi(i)) throw new Error("time must be of type BusinessDay");
    const s = new Date(Date.UTC(i.year, i.month - 1, i.day, 0, 0, 0, 0));
    return { cf: Math.round(s.getTime() / 1e3), df: i };
  }
  function rs(t) {
    if (!ji(t)) throw new Error("time must be of type isUTCTimestamp");
    return { cf: t };
  }
  function hs(t) {
    const i = new Date(t);
    if (isNaN(i.getTime())) throw new Error(`Invalid date string=${t}, expected format=yyyy-mm-dd`);
    return { day: i.getUTCDate(), month: i.getUTCMonth() + 1, year: i.getUTCFullYear() };
  }
  function as(t) {
    m(t.time) && (t.time = hs(t.time));
  }
  function _s() {
    return !!os && window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  }
  function us() {
    return !!os && /iPhone|iPad|iPod/.test(window.navigator.platform);
  }
  function cs(t) {
    return t + t % 2;
  }
  function ds(t) {
    os && void 0 !== window.chrome && t.addEventListener("mousedown", ((t2) => {
      if (1 === t2.button) return t2.preventDefault(), false;
    }));
  }
  function ps(t, i) {
    const s = t.clientX - i.clientX, n = t.clientY - i.clientY;
    return Math.sqrt(s * s + n * n);
  }
  function vs(t) {
    t.cancelable && t.preventDefault();
  }
  function ms(t) {
    return { _t: t.pageX, ut: t.pageY };
  }
  function ws(t) {
    return t.timeStamp || performance.now();
  }
  function gs(t, i) {
    for (let s = 0; s < t.length; ++s) if (t[s].identifier === i) return t[s];
    return null;
  }
  function bs(t, i) {
    return t.gv - i.gv;
  }
  function Ss(t, i, s) {
    const n = (t.gv - i.gv) / (t.wt - i.wt);
    return Math.sign(n) * Math.min(Math.abs(n), s);
  }
  function ys(t, s) {
    const n = u(t.ownerDocument).createElement("canvas");
    t.appendChild(n);
    const e2 = bindTo(n, { type: "device-pixel-content-box", options: { allowResizeObserver: true }, transform: (t2, i) => ({ width: Math.max(t2.width, i.width), height: Math.max(t2.height, i.height) }) });
    return e2.resizeCanvasElement(s), e2;
  }
  function ks(t) {
    t.width = 1, t.height = 1, t.getContext("2d")?.clearRect(0, 0, 1, 1);
  }
  function Ps(t, i, s, n) {
    t.Uh && t.Uh(i, s, n);
  }
  function Ts(t, i, s, n) {
    t.nt(i, s, n);
  }
  function Rs(t, i, s, n) {
    const e2 = t(s, n);
    for (const t2 of e2) {
      const s2 = t2.Tt(n);
      null !== s2 && i(s2);
    }
  }
  function Ds(t, i) {
    return (s) => {
      if (!(function(t2) {
        return void 0 !== t2.Ft;
      })(s)) return [];
      return (s.Ft()?.ol() ?? "") !== i ? [] : s.Ya?.(t) ?? [];
    };
  }
  function Is(t, i, s, n) {
    if (!t.length) return;
    let e2 = 0;
    const r2 = t[0].$t(n, true);
    let h2 = 1 === i ? s / 2 - (t[0].Hi() - r2 / 2) : t[0].Hi() - r2 / 2 - s / 2;
    h2 = Math.max(0, h2);
    for (let r3 = 1; r3 < t.length; r3++) {
      const a2 = t[r3], l2 = t[r3 - 1], o2 = l2.$t(n, false), _2 = a2.Hi(), u2 = l2.Hi();
      if (1 === i ? _2 > u2 - o2 : _2 < u2 + o2) {
        const n2 = u2 - o2 * i;
        a2.Ui(n2);
        const r4 = n2 - i * o2 / 2;
        if ((1 === i ? r4 < 0 : r4 > s) && h2 > 0) {
          const n3 = 1 === i ? -1 - r4 : r4 - s, a3 = Math.min(n3, h2);
          for (let s2 = e2; s2 < t.length; s2++) t[s2].Ui(t[s2].Hi() + i * a3);
          h2 -= a3;
        }
      } else e2 = r3, h2 = 1 === i ? u2 - o2 - _2 : _2 - (u2 + o2);
    }
  }
  function Bs(t, i) {
    return t.qa?.(i) ?? [];
  }
  function Es(t, i) {
    return t.Ys?.(i) ?? [];
  }
  function As(t, i) {
    return t.ds?.(i) ?? [];
  }
  function Ls(t, i) {
    return t.Ha?.(i) ?? [];
  }
  function Ns(t) {
    return (i) => i.Ka?.(t) ?? [];
  }
  function js(t) {
    return Boolean(t.handleScroll.mouseWheel || t.handleScale.mouseWheel);
  }
  function Ys(t) {
    return void 0 === t.open && void 0 === t.value;
  }
  function Ks(t) {
    return (function(t2) {
      return void 0 !== t2.open;
    })(t) || (function(t2) {
      return void 0 !== t2.value;
    })(t);
  }
  function Zs(t, i, s, n) {
    const e2 = s.value, r2 = { js: i, wt: t, Wt: [e2, e2, e2, e2], Gr: n };
    return void 0 !== s.color && (r2.R = s.color), r2;
  }
  function Gs(t, i, s, n) {
    const e2 = s.value, r2 = { js: i, wt: t, Wt: [e2, e2, e2, e2], Gr: n };
    return void 0 !== s.lineColor && (r2.vt = s.lineColor), void 0 !== s.topColor && (r2.eh = s.topColor), void 0 !== s.bottomColor && (r2.rh = s.bottomColor), r2;
  }
  function Xs(t, i, s, n) {
    const e2 = s.value, r2 = { js: i, wt: t, Wt: [e2, e2, e2, e2], Gr: n };
    return void 0 !== s.topLineColor && (r2.hh = s.topLineColor), void 0 !== s.bottomLineColor && (r2.ah = s.bottomLineColor), void 0 !== s.topFillColor1 && (r2.oh = s.topFillColor1), void 0 !== s.topFillColor2 && (r2._h = s.topFillColor2), void 0 !== s.bottomFillColor1 && (r2.uh = s.bottomFillColor1), void 0 !== s.bottomFillColor2 && (r2.dh = s.bottomFillColor2), r2;
  }
  function Js(t, i, s, n) {
    const e2 = { js: i, wt: t, Wt: [s.open, s.high, s.low, s.close], Gr: n };
    return void 0 !== s.color && (e2.R = s.color), e2;
  }
  function Qs(t, i, s, n) {
    const e2 = { js: i, wt: t, Wt: [s.open, s.high, s.low, s.close], Gr: n };
    return void 0 !== s.color && (e2.R = s.color), void 0 !== s.borderColor && (e2.Ht = s.borderColor), void 0 !== s.wickColor && (e2.nh = s.wickColor), e2;
  }
  function tn(t, i, s, n, e2) {
    const r2 = _(e2)(s), h2 = Math.max(...r2), a2 = Math.min(...r2), l2 = r2[r2.length - 1], o2 = [l2, h2, a2, l2], { time: u2, color: c2, ...d2 } = s;
    return { js: i, wt: t, Wt: o2, Gr: n, le: d2, R: c2 };
  }
  function sn(t) {
    return void 0 !== t.Wt;
  }
  function nn(t, i) {
    return void 0 !== i.customValues && (t.Ag = i.customValues), t;
  }
  function en(t) {
    return (i, s, n, e2, r2, h2) => (function(t2, i2) {
      return i2 ? i2(t2) : Ys(t2);
    })(n, h2) ? nn({ wt: i, js: s, Gr: e2 }, n) : nn(t(i, s, n, e2, r2), n);
  }
  function rn(t) {
    return { Candlestick: en(Qs), Bar: en(Js), Area: en(Gs), Baseline: en(Xs), Histogram: en(Zs), Line: en(Zs), Custom: en(tn) }[t];
  }
  function hn(t) {
    return { js: 0, Lg: /* @__PURE__ */ new Map(), Ea: t };
  }
  function an(t, i) {
    if (void 0 !== t && 0 !== t.length) return { zg: i.key(t[0].wt), Og: i.key(t[t.length - 1].wt) };
  }
  function ln(t) {
    let i;
    return t.forEach(((t2) => {
      void 0 === i && (i = t2.Gr);
    })), _(i);
  }
  function _n(t, i) {
    t.js = i, t.Lg.forEach(((t2) => {
      t2.js = i;
    }));
  }
  function un(t, i) {
    return t.wt < i;
  }
  function cn(t, i) {
    return i < t.wt;
  }
  function dn(t, i, s) {
    const n = i.Aa(), e2 = i.bi(), r2 = Rt(t, n, un), h2 = Dt(t, e2, cn);
    if (!s) return { from: r2, to: h2 };
    let a2 = r2, l2 = h2;
    return r2 > 0 && r2 < t.length && t[r2].wt >= n && (a2 = r2 - 1), h2 > 0 && h2 < t.length && t[h2 - 1].wt <= e2 && (l2 = h2 + 1), { from: a2, to: l2 };
  }
  function mn(t) {
    return { x: t._t, time: t.wt, originalData: t.MM, barColor: t.th };
  }
  function Mn(t) {
    const i = { value: t.Wt[3], time: t.Gr };
    return void 0 !== t.Ag && (i.customValues = t.Ag), i;
  }
  function bn(t) {
    const i = Mn(t);
    return void 0 !== t.R && (i.color = t.R), i;
  }
  function Sn(t) {
    const i = Mn(t);
    return void 0 !== t.vt && (i.lineColor = t.vt), void 0 !== t.eh && (i.topColor = t.eh), void 0 !== t.rh && (i.bottomColor = t.rh), i;
  }
  function xn(t) {
    const i = Mn(t);
    return void 0 !== t.hh && (i.topLineColor = t.hh), void 0 !== t.ah && (i.bottomLineColor = t.ah), void 0 !== t.oh && (i.topFillColor1 = t.oh), void 0 !== t._h && (i.topFillColor2 = t._h), void 0 !== t.uh && (i.bottomFillColor1 = t.uh), void 0 !== t.dh && (i.bottomFillColor2 = t.dh), i;
  }
  function Cn(t) {
    const i = { open: t.Wt[0], high: t.Wt[1], low: t.Wt[2], close: t.Wt[3], time: t.Gr };
    return void 0 !== t.Ag && (i.customValues = t.Ag), i;
  }
  function yn(t) {
    const i = Cn(t);
    return void 0 !== t.R && (i.color = t.R), i;
  }
  function kn(t) {
    const i = Cn(t), { R: s, Ht: n, nh: e2 } = t;
    return void 0 !== s && (i.color = s), void 0 !== n && (i.borderColor = n), void 0 !== e2 && (i.wickColor = e2), i;
  }
  function Pn(t) {
    return { Area: Sn, Line: bn, Baseline: xn, Histogram: bn, Bar: yn, Candlestick: kn, Custom: Tn }[t];
  }
  function Tn(t) {
    const i = t.Gr;
    return { ...t.le, time: i };
  }
  function En() {
    return { addDefaultPane: true, width: 0, height: 0, autoSize: false, layout: In, crosshair: Rn, grid: Dn, overlayPriceScales: { ...Vn }, leftPriceScale: { ...Vn, visible: false }, rightPriceScale: { ...Vn, visible: true }, timeScale: Bn, localization: { locale: os ? navigator.language : "", dateFormat: "dd MMM 'yy" }, handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true }, handleScale: { axisPressedMouseMove: { time: true, price: true }, axisDoubleClickReset: { time: true, price: true }, mouseWheel: true, pinch: true }, kineticScroll: { mouse: false, touch: true }, trackingMode: { exitMode: 1 } };
  }
  function Wn(t) {
    return (function(t2) {
      if (w(t2.handleScale)) {
        const i2 = t2.handleScale;
        t2.handleScale = { axisDoubleClickReset: { time: i2, price: i2 }, axisPressedMouseMove: { time: i2, price: i2 }, mouseWheel: i2, pinch: i2 };
      } else if (void 0 !== t2.handleScale) {
        const { axisPressedMouseMove: i2, axisDoubleClickReset: s } = t2.handleScale;
        w(i2) && (t2.handleScale.axisPressedMouseMove = { time: i2, price: i2 }), w(s) && (t2.handleScale.axisDoubleClickReset = { time: s, price: s });
      }
      const i = t2.handleScroll;
      w(i) && (t2.handleScroll = { horzTouchDrag: i, vertTouchDrag: i, mouseWheel: i, pressedMouseMove: i });
    })(t), t;
  }
  function Un(t) {
    if (m(t)) {
      const i = document.getElementById(t);
      return o(null !== i, `Cannot find element in DOM with id=${t}`), i;
    }
    return t;
  }
  function $n(t, i, s) {
    const n = Un(t), e2 = new Hn(n, i, s);
    return i.setOptions(e2.options()), e2;
  }
  function qn(t, i) {
    return $n(t, new ls(), ls.pf(i));
  }
  function Kn(t, i, s, n, e2, r2, h2) {
    if (0 === i.length || n.from >= i.length || n.to <= 0) return;
    const { context: a2, horizontalPixelRatio: l2, verticalPixelRatio: o2 } = t, _2 = i[n.from];
    let u2 = r2(t, _2), c2 = _2;
    if (n.to - n.from < 2) {
      const i2 = e2 / 2;
      a2.beginPath();
      const s2 = { _t: _2._t - i2, ut: _2.ut }, n2 = { _t: _2._t + i2, ut: _2.ut };
      a2.moveTo(s2._t * l2, s2.ut * o2), a2.lineTo(n2._t * l2, n2.ut * o2), h2(t, u2, s2, n2);
    } else {
      const e3 = (i2, s2) => {
        h2(t, u2, c2, s2), a2.beginPath(), u2 = i2, c2 = s2;
      };
      let d2 = c2;
      a2.beginPath(), a2.moveTo(_2._t * l2, _2.ut * o2);
      for (let h3 = n.from + 1; h3 < n.to; ++h3) {
        d2 = i[h3];
        const n2 = r2(t, d2);
        switch (s) {
          case 0:
            a2.lineTo(d2._t * l2, d2.ut * o2);
            break;
          case 1:
            a2.lineTo(d2._t * l2, i[h3 - 1].ut * o2), n2 !== u2 && (e3(n2, d2), a2.lineTo(d2._t * l2, i[h3 - 1].ut * o2)), a2.lineTo(d2._t * l2, d2.ut * o2);
            break;
          case 2: {
            const [t2, s2] = Jn(i, h3 - 1, h3);
            a2.bezierCurveTo(t2._t * l2, t2.ut * o2, s2._t * l2, s2.ut * o2, d2._t * l2, d2.ut * o2);
            break;
          }
        }
        1 !== s && n2 !== u2 && (e3(n2, d2), a2.moveTo(d2._t * l2, d2.ut * o2));
      }
      (c2 !== d2 || c2 === d2 && 1 === s) && h2(t, u2, c2, d2);
    }
  }
  function Gn(t, i) {
    return { _t: t._t - i._t, ut: t.ut - i.ut };
  }
  function Xn(t, i) {
    return { _t: t._t / i, ut: t.ut / i };
  }
  function Jn(t, i, s) {
    const n = Math.max(0, i - 1), e2 = Math.min(t.length - 1, s + 1);
    var r2, h2;
    return [(r2 = t[i], h2 = Xn(Gn(t[s], t[n]), Zn), { _t: r2._t + h2._t, ut: r2.ut + h2.ut }), Gn(t[s], Xn(Gn(t[e2], t[i]), Zn))];
  }
  function Qn(t, i) {
    const s = t.context;
    s.strokeStyle = i, s.stroke();
  }
  var e, r, h, d, S, C, P, T, R, D, V, B, E, A, W, H, U, $, q, j, Y, K, Z, X, J, Q, it, st, nt, et, rt, ht, at, lt, ot, _t, ut, ct, dt, ft, pt, mt, wt, gt, Mt, bt, St, xt, Ct, yt, kt, Pt, Rt, Dt, It, Vt, Bt, Lt, zt, Ot, Nt, Ft, Wt, Ht, $t, qt, jt, Xt, Jt, Qt, ti, ii, ri, hi, ai, li, wi, gi, bi, Si, xi, Ci, ki, Ii, Vi, Ei, Ai, zi, Oi, Ni, Fi, Wi, Hi, Ui, Yi, Zi, Gi, Xi, Ji, is, ss, ls, os, fs, Ms, xs, Cs, Vs, zs, Os, Fs, Ws, Hs, Us, $s, qs, on, fn, pn, vn, wn, gn, Rn, Dn, In, Vn, Bn, An, Ln, zn, On, Nn, Fn, Hn, Yn, Zn, te, ie, se, ne, Ce, Pe, Te, Re, De, Ie, Ve, yr;
  var init_lightweight_charts_production = __esm({
    "node_modules/lightweight-charts/dist/lightweight-charts.production.mjs"() {
      init_fancy_canvas();
      e = { title: "", visible: true, lastValueVisible: true, priceLineVisible: true, priceLineSource: 0, priceLineWidth: 1, priceLineColor: "", priceLineStyle: 2, baseLineVisible: true, baseLineWidth: 1, baseLineColor: "#B2B5BE", baseLineStyle: 0, priceFormat: { type: "price", precision: 2, minMove: 0.01 } };
      !(function(t) {
        t[t.Simple = 0] = "Simple", t[t.WithSteps = 1] = "WithSteps", t[t.Curved = 2] = "Curved";
      })(r || (r = {})), (function(t) {
        t[t.Solid = 0] = "Solid", t[t.Dotted = 1] = "Dotted", t[t.Dashed = 2] = "Dashed", t[t.LargeDashed = 3] = "LargeDashed", t[t.SparseDotted = 4] = "SparseDotted";
      })(h || (h = {}));
      d = class {
        constructor() {
          this.t = [];
        }
        i(t, i, s) {
          const n = { h: t, l: i, o: true === s };
          this.t.push(n);
        }
        _(t) {
          const i = this.t.findIndex(((i2) => t === i2.h));
          i > -1 && this.t.splice(i, 1);
        }
        u(t) {
          this.t = this.t.filter(((i) => i.l !== t));
        }
        p(t, i, s) {
          const n = [...this.t];
          this.t = this.t.filter(((t2) => !t2.o)), n.forEach(((n2) => n2.h(t, i, s)));
        }
        v() {
          return this.t.length > 0;
        }
        m() {
          this.t = [];
        }
      };
      S = "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";
      C = class {
        constructor(t) {
          this.M = { S: 1, C: 5, k: NaN, P: "", T: "", R: "", D: "", I: 0, V: 0, B: 0, A: 0, L: 0 }, this.O = t;
        }
        N() {
          const t = this.M, i = this.F(), s = this.W();
          return t.k === i && t.T === s || (t.k = i, t.T = s, t.P = x(i, s), t.A = 2.5 / 12 * i, t.I = t.A, t.V = i / 12 * t.C, t.B = i / 12 * t.C, t.L = 0), t.R = this.H(), t.D = this.U(), this.M;
        }
        H() {
          return this.O.N().layout.textColor;
        }
        U() {
          return this.O.$();
        }
        F() {
          return this.O.N().layout.fontSize;
        }
        W() {
          return this.O.N().layout.fontFamily;
        }
      };
      P = class {
        constructor(t, i) {
          this.q = /* @__PURE__ */ new Map(), this.j = t, i && (this.q = i);
        }
        Y(t, i) {
          if ("transparent" === t) return t;
          const s = this.K(t), n = s[3];
          return `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${i * n})`;
        }
        Z(t) {
          const i = this.K(t);
          return { G: `rgb(${i[0]}, ${i[1]}, ${i[2]})`, X: k(i) > 160 ? "black" : "white" };
        }
        J(t) {
          return k(this.K(t));
        }
        tt(t, i, s) {
          const [n, e2, r2, h2] = this.K(t), [a2, l2, o2, _2] = this.K(i), u2 = [y(n + s * (a2 - n)), y(e2 + s * (l2 - e2)), y(r2 + s * (o2 - r2)), (c2 = h2 + s * (_2 - h2), c2 <= 0 || c2 > 1 ? Math.min(Math.max(c2, 0), 1) : Math.round(1e4 * c2) / 1e4)];
          var c2;
          return `rgba(${u2[0]}, ${u2[1]}, ${u2[2]}, ${u2[3]})`;
        }
        K(t) {
          const i = this.q.get(t);
          if (i) return i;
          const s = (function(t2) {
            const i2 = document.createElement("div");
            i2.style.display = "none", document.body.appendChild(i2), i2.style.color = t2;
            const s2 = window.getComputedStyle(i2).color;
            return document.body.removeChild(i2), s2;
          })(t), n = s.match(/^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
          if (!n) {
            if (this.j.length) for (const i2 of this.j) {
              const s2 = i2(t);
              if (s2) return this.q.set(t, s2), s2;
            }
            throw new Error(`Failed to parse color: ${t}`);
          }
          const e2 = [parseInt(n[1], 10), parseInt(n[2], 10), parseInt(n[3], 10), n[4] ? parseFloat(n[4]) : 1];
          return this.q.set(t, e2), e2;
        }
      };
      T = class {
        constructor() {
          this.it = [];
        }
        st(t) {
          this.it = t;
        }
        nt(t, i, s) {
          this.it.forEach(((n) => {
            n.nt(t, i, s);
          }));
        }
      };
      R = class {
        nt(t, i, s) {
          t.useBitmapCoordinateSpace(((t2) => this.et(t2, i, s)));
        }
      };
      D = class extends R {
        constructor() {
          super(...arguments), this.rt = null;
        }
        ht(t) {
          this.rt = t;
        }
        et({ context: t, horizontalPixelRatio: i, verticalPixelRatio: s }) {
          if (null === this.rt || null === this.rt.lt) return;
          const n = this.rt.lt, e2 = this.rt, r2 = Math.max(1, Math.floor(i)) % 2 / 2, h2 = (h3) => {
            t.beginPath();
            for (let a2 = n.to - 1; a2 >= n.from; --a2) {
              const n2 = e2.ot[a2], l2 = Math.round(n2._t * i) + r2, o2 = n2.ut * s, _2 = h3 * s + r2;
              t.moveTo(l2, o2), t.arc(l2, o2, _2, 0, 2 * Math.PI);
            }
            t.fill();
          };
          e2.ct > 0 && (t.fillStyle = e2.dt, h2(e2.ft + e2.ct)), t.fillStyle = e2.vt, h2(e2.ft);
        }
      };
      V = { from: 0, to: 1 };
      B = class {
        constructor(t, i, s) {
          this.Mt = new T(), this.bt = [], this.St = [], this.xt = true, this.O = t, this.Ct = i, this.yt = s, this.Mt.st(this.bt);
        }
        kt(t) {
          this.Pt(), this.xt = true;
        }
        Tt() {
          return this.xt && (this.Rt(), this.xt = false), this.Mt;
        }
        Pt() {
          const t = this.yt.Dt();
          t.length !== this.bt.length && (this.St = t.map(I), this.bt = this.St.map(((t2) => {
            const i = new D();
            return i.ht(t2), i;
          })), this.Mt.st(this.bt));
        }
        Rt() {
          const t = 2 === this.Ct.N().mode || !this.Ct.It(), i = this.yt.Vt(), s = this.Ct.Bt(), n = this.O.Et();
          this.Pt(), i.forEach(((i2, e2) => {
            const r2 = this.St[e2], h2 = i2.At(s), a2 = i2.Lt();
            !t && null !== h2 && i2.It() && null !== a2 ? (r2.vt = h2.zt, r2.ft = h2.ft, r2.ct = h2.Ot, r2.ot[0].gt = h2.gt, r2.ot[0].ut = i2.Ft().Nt(h2.gt, a2.Wt), r2.dt = h2.Ht ?? this.O.Ut(r2.ot[0].ut / i2.Ft().$t()), r2.ot[0].wt = s, r2.ot[0]._t = n.qt(s), r2.lt = V) : r2.lt = null;
          }));
        }
      };
      E = class extends R {
        constructor(t) {
          super(), this.jt = t;
        }
        et({ context: t, bitmapSize: i, horizontalPixelRatio: s, verticalPixelRatio: n }) {
          if (null === this.jt) return;
          const e2 = this.jt.Yt.It, r2 = this.jt.Kt.It;
          if (!e2 && !r2) return;
          const h2 = Math.round(this.jt._t * s), o2 = Math.round(this.jt.ut * n);
          t.lineCap = "butt", e2 && h2 >= 0 && (t.lineWidth = Math.floor(this.jt.Yt.ct * s), t.strokeStyle = this.jt.Yt.R, t.fillStyle = this.jt.Yt.R, a(t, this.jt.Yt.Zt), (function(t2, i2, s2, n2) {
            t2.beginPath();
            const e3 = t2.lineWidth % 2 ? 0.5 : 0;
            t2.moveTo(i2 + e3, s2), t2.lineTo(i2 + e3, n2), t2.stroke();
          })(t, h2, 0, i.height)), r2 && o2 >= 0 && (t.lineWidth = Math.floor(this.jt.Kt.ct * n), t.strokeStyle = this.jt.Kt.R, t.fillStyle = this.jt.Kt.R, a(t, this.jt.Kt.Zt), l(t, o2, 0, i.width));
        }
      };
      A = class {
        constructor(t, i) {
          this.xt = true, this.Gt = { Yt: { ct: 1, Zt: 0, R: "", It: false }, Kt: { ct: 1, Zt: 0, R: "", It: false }, _t: 0, ut: 0 }, this.Xt = new E(this.Gt), this.Jt = t, this.yt = i;
        }
        kt() {
          this.xt = true;
        }
        Tt(t) {
          return this.xt && (this.Rt(), this.xt = false), this.Xt;
        }
        Rt() {
          const t = this.Jt.It(), i = this.yt.Qt().N().crosshair, s = this.Gt;
          if (2 === i.mode) return s.Kt.It = false, void (s.Yt.It = false);
          s.Kt.It = t && this.Jt.ti(this.yt), s.Yt.It = t && this.Jt.ii(), s.Kt.ct = i.horzLine.width, s.Kt.Zt = i.horzLine.style, s.Kt.R = i.horzLine.color, s.Yt.ct = i.vertLine.width, s.Yt.Zt = i.vertLine.style, s.Yt.R = i.vertLine.color, s._t = this.Jt.si(), s.ut = this.Jt.ni();
        }
      };
      W = class {
        constructor(t, i) {
          this.ht(t, i);
        }
        ht(t, i) {
          this.jt = t, this.ei = i;
        }
        $t(t, i) {
          return this.jt.It ? t.k + t.A + t.I : 0;
        }
        nt(t, i, s, n) {
          if (!this.jt.It || 0 === this.jt.ri.length) return;
          const e2 = this.jt.R, r2 = this.ei.G, h2 = t.useBitmapCoordinateSpace(((t2) => {
            const h3 = t2.context;
            h3.font = i.P;
            const a2 = this.hi(t2, i, s, n), l2 = a2.ai;
            return a2.li ? N(h3, l2.oi, l2._i, l2.ui, l2.ci, r2, l2.di, [l2.ft, 0, 0, l2.ft], r2) : N(h3, l2.fi, l2._i, l2.ui, l2.ci, r2, l2.di, [0, l2.ft, l2.ft, 0], r2), this.jt.pi && (h3.fillStyle = e2, h3.fillRect(l2.fi, l2.mi, l2.wi - l2.fi, l2.gi)), this.jt.Mi && (h3.fillStyle = i.D, h3.fillRect(a2.li ? l2.bi - l2.di : 0, l2._i, l2.di, l2.Si - l2._i)), a2;
          }));
          t.useMediaCoordinateSpace((({ context: t2 }) => {
            const s2 = h2.xi;
            t2.font = i.P, t2.textAlign = h2.li ? "right" : "left", t2.textBaseline = "middle", t2.fillStyle = e2, t2.fillText(this.jt.ri, s2.Ci, (s2._i + s2.Si) / 2 + s2.yi);
          }));
        }
        hi(t, i, s, n) {
          const { context: e2, bitmapSize: r2, mediaSize: h2, horizontalPixelRatio: a2, verticalPixelRatio: l2 } = t, o2 = this.jt.pi || !this.jt.ki ? i.C : 0, _2 = this.jt.Pi ? i.S : 0, u2 = i.A + this.ei.Ti, c2 = i.I + this.ei.Ri, d2 = i.V, f2 = i.B, p2 = this.jt.ri, v2 = i.k, m2 = s.Di(e2, p2), w2 = Math.ceil(s.Ii(e2, p2)), g2 = v2 + u2 + c2, M2 = i.S + d2 + f2 + w2 + o2, b2 = Math.max(1, Math.floor(l2));
          let S2 = Math.round(g2 * l2);
          S2 % 2 != b2 % 2 && (S2 += 1);
          const x2 = _2 > 0 ? Math.max(1, Math.floor(_2 * a2)) : 0, C2 = Math.round(M2 * a2), y2 = Math.round(o2 * a2), k2 = this.ei.Vi ?? this.ei.Bi ?? this.ei.Ei, P2 = Math.round(k2 * l2) - Math.floor(0.5 * l2), T2 = Math.floor(P2 + b2 / 2 - S2 / 2), R2 = T2 + S2, D2 = "right" === n, I2 = D2 ? h2.width - _2 : _2, V2 = D2 ? r2.width - x2 : x2;
          let B2, E2, A2;
          return D2 ? (B2 = V2 - C2, E2 = V2 - y2, A2 = I2 - o2 - d2 - _2) : (B2 = V2 + C2, E2 = V2 + y2, A2 = I2 + o2 + d2), { li: D2, ai: { _i: T2, mi: P2, Si: R2, ui: C2, ci: S2, ft: 2 * a2, di: x2, oi: B2, fi: V2, wi: E2, gi: b2, bi: r2.width }, xi: { _i: T2 / l2, Si: R2 / l2, Ci: A2, yi: m2 } };
        }
      };
      H = class {
        constructor(t) {
          this.Ai = { Ei: 0, G: "#000", Ri: 0, Ti: 0 }, this.Li = { ri: "", It: false, pi: true, ki: false, Ht: "", R: "#FFF", Mi: false, Pi: false }, this.zi = { ri: "", It: false, pi: false, ki: true, Ht: "", R: "#FFF", Mi: true, Pi: true }, this.xt = true, this.Oi = new (t || W)(this.Li, this.Ai), this.Ni = new (t || W)(this.zi, this.Ai);
        }
        ri() {
          return this.Fi(), this.Li.ri;
        }
        Ei() {
          return this.Fi(), this.Ai.Ei;
        }
        kt() {
          this.xt = true;
        }
        $t(t, i = false) {
          return Math.max(this.Oi.$t(t, i), this.Ni.$t(t, i));
        }
        Wi() {
          return this.Ai.Vi ?? null;
        }
        Hi() {
          return this.Ai.Vi ?? this.Ai.Bi ?? this.Ei();
        }
        Ui(t) {
          this.Ai.Bi = t ?? void 0;
        }
        $i() {
          return this.Fi(), this.Li.It || this.zi.It;
        }
        qi() {
          return this.Fi(), this.Li.It;
        }
        Tt(t) {
          return this.Fi(), this.Li.pi = this.Li.pi && t.N().ticksVisible, this.zi.pi = this.zi.pi && t.N().ticksVisible, this.Oi.ht(this.Li, this.Ai), this.Ni.ht(this.zi, this.Ai), this.Oi;
        }
        ji() {
          return this.Fi(), this.Oi.ht(this.Li, this.Ai), this.Ni.ht(this.zi, this.Ai), this.Ni;
        }
        Fi() {
          this.xt && (this.Li.pi = true, this.zi.pi = false, this.Yi(this.Li, this.zi, this.Ai));
        }
      };
      U = class extends H {
        constructor(t, i, s) {
          super(), this.Jt = t, this.Ki = i, this.Zi = s;
        }
        Yi(t, i, s) {
          if (t.It = false, 2 === this.Jt.N().mode) return;
          const n = this.Jt.N().horzLine;
          if (!n.labelVisible) return;
          const e2 = this.Ki.Lt();
          if (!this.Jt.It() || this.Ki.Gi() || null === e2) return;
          const r2 = this.Ki.Xi().Z(n.labelBackgroundColor);
          s.G = r2.G, t.R = r2.X;
          const h2 = 2 / 12 * this.Ki.k();
          s.Ti = h2, s.Ri = h2;
          const a2 = this.Zi(this.Ki);
          s.Ei = a2.Ei, t.ri = this.Ki.Ji(a2.gt, e2), t.It = true;
        }
      };
      $ = /[1-9]/g;
      q = class {
        constructor() {
          this.jt = null;
        }
        ht(t) {
          this.jt = t;
        }
        nt(t, i) {
          if (null === this.jt || false === this.jt.It || 0 === this.jt.ri.length) return;
          const s = t.useMediaCoordinateSpace((({ context: t2 }) => (t2.font = i.P, Math.round(i.Qi.Ii(t2, u(this.jt).ri, $)))));
          if (s <= 0) return;
          const n = i.ts, e2 = s + 2 * n, r2 = e2 / 2, h2 = this.jt.ss;
          let a2 = this.jt.Ei, l2 = Math.floor(a2 - r2) + 0.5;
          l2 < 0 ? (a2 += Math.abs(0 - l2), l2 = Math.floor(a2 - r2) + 0.5) : l2 + e2 > h2 && (a2 -= Math.abs(h2 - (l2 + e2)), l2 = Math.floor(a2 - r2) + 0.5);
          const o2 = l2 + e2, _2 = Math.ceil(0 + i.S + i.C + i.A + i.k + i.I);
          t.useBitmapCoordinateSpace((({ context: t2, horizontalPixelRatio: s2, verticalPixelRatio: n2 }) => {
            const e3 = u(this.jt);
            t2.fillStyle = e3.G;
            const r3 = Math.round(l2 * s2), h3 = Math.round(0 * n2), a3 = Math.round(o2 * s2), c2 = Math.round(_2 * n2), d2 = Math.round(2 * s2);
            if (t2.beginPath(), t2.moveTo(r3, h3), t2.lineTo(r3, c2 - d2), t2.arcTo(r3, c2, r3 + d2, c2, d2), t2.lineTo(a3 - d2, c2), t2.arcTo(a3, c2, a3, c2 - d2, d2), t2.lineTo(a3, h3), t2.fill(), e3.pi) {
              const r4 = Math.round(e3.Ei * s2), a4 = h3, l3 = Math.round((a4 + i.C) * n2);
              t2.fillStyle = e3.R;
              const o3 = Math.max(1, Math.floor(s2)), _3 = Math.floor(0.5 * s2);
              t2.fillRect(r4 - _3, a4, o3, l3 - a4);
            }
          })), t.useMediaCoordinateSpace((({ context: t2 }) => {
            const s2 = u(this.jt), e3 = 0 + i.S + i.C + i.A + i.k / 2;
            t2.font = i.P, t2.textAlign = "left", t2.textBaseline = "middle", t2.fillStyle = s2.R;
            const r3 = i.Qi.Di(t2, "Apr0");
            t2.translate(l2 + n, e3 + r3), t2.fillText(s2.ri, 0, 0);
          }));
        }
      };
      j = class {
        constructor(t, i, s) {
          this.xt = true, this.Xt = new q(), this.Gt = { It: false, G: "#4c525e", R: "white", ri: "", ss: 0, Ei: NaN, pi: true }, this.Ct = t, this.ns = i, this.Zi = s;
        }
        kt() {
          this.xt = true;
        }
        Tt() {
          return this.xt && (this.Rt(), this.xt = false), this.Xt.ht(this.Gt), this.Xt;
        }
        Rt() {
          const t = this.Gt;
          if (t.It = false, 2 === this.Ct.N().mode) return;
          const i = this.Ct.N().vertLine;
          if (!i.labelVisible) return;
          const s = this.ns.Et();
          if (s.Gi()) return;
          t.ss = s.ss();
          const n = this.Zi();
          if (null === n) return;
          t.Ei = n.Ei;
          const e2 = s.es(this.Ct.Bt());
          t.ri = s.rs(u(e2)), t.It = true;
          const r2 = this.ns.Xi().Z(i.labelBackgroundColor);
          t.G = r2.G, t.R = r2.X, t.pi = s.N().ticksVisible;
        }
      };
      Y = class {
        constructor() {
          this.hs = null, this.ls = 0;
        }
        _s() {
          return this.ls;
        }
        us(t) {
          this.ls = t;
        }
        Ft() {
          return this.hs;
        }
        cs(t) {
          this.hs = t;
        }
        ds(t) {
          return [];
        }
        fs() {
          return [];
        }
        It() {
          return true;
        }
      };
      !(function(t) {
        t[t.Normal = 0] = "Normal", t[t.Magnet = 1] = "Magnet", t[t.Hidden = 2] = "Hidden", t[t.MagnetOHLC = 3] = "MagnetOHLC";
      })(K || (K = {}));
      Z = class extends Y {
        constructor(t, i) {
          super(), this.yt = null, this.ps = NaN, this.vs = 0, this.ws = false, this.gs = /* @__PURE__ */ new Map(), this.Ms = false, this.bs = /* @__PURE__ */ new WeakMap(), this.Ss = /* @__PURE__ */ new WeakMap(), this.xs = NaN, this.Cs = NaN, this.ys = NaN, this.ks = NaN, this.ns = t, this.Ps = i;
          this.Ts = /* @__PURE__ */ ((t2, i2) => (s2) => {
            const n = i2(), e2 = t2();
            if (s2 === u(this.yt).Rs()) return { gt: e2, Ei: n };
            {
              const t3 = u(s2.Lt());
              return { gt: s2.Ds(n, t3), Ei: n };
            }
          })((() => this.ps), (() => this.Cs));
          const s = /* @__PURE__ */ ((t2, i2) => () => {
            const s2 = this.ns.Et().Is(t2()), n = i2();
            return s2 && Number.isFinite(n) ? { wt: s2, Ei: n } : null;
          })((() => this.vs), (() => this.si()));
          this.Vs = new j(this, t, s);
        }
        N() {
          return this.Ps;
        }
        Bs(t, i) {
          this.ys = t, this.ks = i;
        }
        Es() {
          this.ys = NaN, this.ks = NaN;
        }
        As() {
          return this.ys;
        }
        Ls() {
          return this.ks;
        }
        zs(t, i, s) {
          this.Ms || (this.Ms = true), this.ws = true, this.Os(t, i, s);
        }
        Bt() {
          return this.vs;
        }
        si() {
          return this.xs;
        }
        ni() {
          return this.Cs;
        }
        It() {
          return this.ws;
        }
        Ns() {
          this.ws = false, this.Fs(), this.ps = NaN, this.xs = NaN, this.Cs = NaN, this.yt = null, this.Es(), this.Ws();
        }
        Hs(t) {
          if (!this.Ps.doNotSnapToHiddenSeriesIndices) return t;
          const i = this.ns, s = i.Et();
          let n = null, e2 = null;
          for (const s2 of i.Us()) {
            const i2 = s2.qs().$s(t, -1);
            if (i2) {
              if (i2.js === t) return t;
              (null === n || i2.js > n) && (n = i2.js);
            }
            const r3 = s2.qs().$s(t, 1);
            if (r3) {
              if (r3.js === t) return t;
              (null === e2 || r3.js < e2) && (e2 = r3.js);
            }
          }
          const r2 = [n, e2].filter(M);
          if (0 === r2.length) return t;
          const h2 = s.qt(t), a2 = r2.map(((t2) => Math.abs(h2 - s.qt(t2))));
          return r2[a2.indexOf(Math.min(...a2))];
        }
        Ys(t) {
          let i = this.bs.get(t);
          i || (i = new A(this, t), this.bs.set(t, i));
          let s = this.Ss.get(t);
          return s || (s = new B(this.ns, this, t), this.Ss.set(t, s)), [i, s];
        }
        ti(t) {
          return t === this.yt && this.Ps.horzLine.visible;
        }
        ii() {
          return this.Ps.vertLine.visible;
        }
        Ks(t, i) {
          this.ws && this.yt === t || this.gs.clear();
          const s = [];
          return this.yt === t && s.push(this.Zs(this.gs, i, this.Ts)), s;
        }
        fs() {
          return this.ws ? [this.Vs] : [];
        }
        Gs() {
          return this.yt;
        }
        Ws() {
          this.ns.Xs().forEach(((t) => {
            this.bs.get(t)?.kt(), this.Ss.get(t)?.kt();
          })), this.gs.forEach(((t) => t.kt())), this.Vs.kt();
        }
        Js(t) {
          return t && !t.Rs().Gi() ? t.Rs() : null;
        }
        Os(t, i, s) {
          this.Qs(t, i, s) && this.Ws();
        }
        Qs(t, i, s) {
          const n = this.xs, e2 = this.Cs, r2 = this.ps, h2 = this.vs, a2 = this.yt, l2 = this.Js(s);
          this.vs = t, this.xs = isNaN(t) ? NaN : this.ns.Et().qt(t), this.yt = s;
          const o2 = null !== l2 ? l2.Lt() : null;
          return null !== l2 && null !== o2 ? (this.ps = i, this.Cs = l2.Nt(i, o2)) : (this.ps = NaN, this.Cs = NaN), n !== this.xs || e2 !== this.Cs || h2 !== this.vs || r2 !== this.ps || a2 !== this.yt;
        }
        Fs() {
          const t = this.ns.tn().map(((t2) => t2.qs().sn())).filter(M), i = 0 === t.length ? null : Math.max(...t);
          this.vs = null !== i ? i : NaN;
        }
        Zs(t, i, s) {
          let n = t.get(i);
          return void 0 === n && (n = new U(this, i, s), t.set(i, n)), n;
        }
      };
      X = class _X {
        constructor(t) {
          this.nn = /* @__PURE__ */ new Map(), this.en = [], this.rn = t;
        }
        hn(t, i) {
          const s = (function(t2, i2) {
            return void 0 === t2 ? i2 : { an: Math.max(t2.an, i2.an), ln: t2.ln || i2.ln };
          })(this.nn.get(t), i);
          this.nn.set(t, s);
        }
        _n() {
          return this.rn;
        }
        un(t) {
          const i = this.nn.get(t);
          return void 0 === i ? { an: this.rn } : { an: Math.max(this.rn, i.an), ln: i.ln };
        }
        cn() {
          this.dn(), this.en = [{ fn: 0 }];
        }
        pn(t) {
          this.dn(), this.en = [{ fn: 1, Wt: t }];
        }
        vn(t) {
          this.mn(), this.en.push({ fn: 5, Wt: t });
        }
        dn() {
          this.mn(), this.en.push({ fn: 6 });
        }
        wn() {
          this.dn(), this.en = [{ fn: 4 }];
        }
        gn(t) {
          this.dn(), this.en.push({ fn: 2, Wt: t });
        }
        Mn(t) {
          this.dn(), this.en.push({ fn: 3, Wt: t });
        }
        bn() {
          return this.en;
        }
        Sn(t) {
          for (const i of t.en) this.xn(i);
          this.rn = Math.max(this.rn, t.rn), t.nn.forEach(((t2, i) => {
            this.hn(i, t2);
          }));
        }
        static Cn() {
          return new _X(2);
        }
        static yn() {
          return new _X(3);
        }
        xn(t) {
          switch (t.fn) {
            case 0:
              this.cn();
              break;
            case 1:
              this.pn(t.Wt);
              break;
            case 2:
              this.gn(t.Wt);
              break;
            case 3:
              this.Mn(t.Wt);
              break;
            case 4:
              this.wn();
              break;
            case 5:
              this.vn(t.Wt);
              break;
            case 6:
              this.mn();
          }
        }
        mn() {
          const t = this.en.findIndex(((t2) => 5 === t2.fn));
          -1 !== t && this.en.splice(t, 1);
        }
      };
      J = class {
        formatTickmarks(t) {
          return t.map(((t2) => this.format(t2)));
        }
      };
      Q = ".";
      it = class extends J {
        constructor(t, i) {
          if (super(), i || (i = 1), p(t) && v(t) || (t = 100), t < 0) throw new TypeError("invalid base");
          this.Ki = t, this.kn = i, this.Pn();
        }
        format(t) {
          const i = t < 0 ? "\u2212" : "";
          return t = Math.abs(t), i + this.Tn(t);
        }
        Pn() {
          if (this.Rn = 0, this.Ki > 0 && this.kn > 0) {
            let t = this.Ki;
            for (; t > 1; ) t /= 10, this.Rn++;
          }
        }
        Tn(t) {
          const i = this.Ki / this.kn;
          let s = Math.floor(t), n = "";
          const e2 = void 0 !== this.Rn ? this.Rn : NaN;
          if (i > 1) {
            let r2 = +(Math.round(t * i) - s * i).toFixed(this.Rn);
            r2 >= i && (r2 -= i, s += 1), n = Q + tt(+r2.toFixed(this.Rn) * this.kn, e2);
          } else s = Math.round(s * i) / i, e2 > 0 && (n = Q + tt(0, e2));
          return s.toFixed(0) + n;
        }
      };
      st = class extends it {
        constructor(t = 100) {
          super(t);
        }
        format(t) {
          return `${super.format(t)}%`;
        }
      };
      nt = class extends J {
        constructor(t) {
          super(), this.Dn = t;
        }
        format(t) {
          let i = "";
          return t < 0 && (i = "-", t = -t), t < 995 ? i + this.In(t) : t < 999995 ? i + this.In(t / 1e3) + "K" : t < 999999995 ? (t = 1e3 * Math.round(t / 1e3), i + this.In(t / 1e6) + "M") : (t = 1e6 * Math.round(t / 1e6), i + this.In(t / 1e9) + "B");
        }
        In(t) {
          let i;
          const s = Math.pow(10, this.Dn);
          return i = (t = Math.round(t * s) / s) >= 1e-15 && t < 1 ? t.toFixed(this.Dn).replace(/\.?0+$/, "") : String(t), i.replace(/(\.[1-9]*)0+$/, ((t2, i2) => i2));
        }
      };
      et = /[2-9]/g;
      rt = class {
        constructor(t = 50) {
          this.Vn = 0, this.Bn = 1, this.En = 1, this.An = {}, this.Ln = /* @__PURE__ */ new Map(), this.zn = t;
        }
        On() {
          this.Vn = 0, this.Ln.clear(), this.Bn = 1, this.En = 1, this.An = {};
        }
        Ii(t, i, s) {
          return this.Nn(t, i, s).width;
        }
        Di(t, i, s) {
          const n = this.Nn(t, i, s);
          return ((n.actualBoundingBoxAscent || 0) - (n.actualBoundingBoxDescent || 0)) / 2;
        }
        Nn(t, i, s) {
          const n = s || et, e2 = String(i).replace(n, "0");
          if (this.Ln.has(e2)) return _(this.Ln.get(e2)).Fn;
          if (this.Vn === this.zn) {
            const t2 = this.An[this.En];
            delete this.An[this.En], this.Ln.delete(t2), this.En++, this.Vn--;
          }
          t.save(), t.textBaseline = "middle";
          const r2 = t.measureText(e2);
          return t.restore(), 0 === r2.width && i.length || (this.Ln.set(e2, { Fn: r2, Wn: this.Bn }), this.An[this.Bn] = e2, this.Vn++, this.Bn++), r2;
        }
      };
      ht = class {
        constructor(t) {
          this.Hn = null, this.M = null, this.Un = "right", this.$n = t;
        }
        qn(t, i, s) {
          this.Hn = t, this.M = i, this.Un = s;
        }
        nt(t) {
          null !== this.M && null !== this.Hn && this.Hn.nt(t, this.M, this.$n, this.Un);
        }
      };
      at = class {
        constructor(t, i, s) {
          this.jn = t, this.$n = new rt(50), this.Yn = i, this.O = s, this.F = -1, this.Xt = new ht(this.$n);
        }
        Tt() {
          const t = this.O.Kn(this.Yn);
          if (null === t) return null;
          const i = t.Zn(this.Yn) ? t.Gn() : this.Yn.Ft();
          if (null === i) return null;
          const s = t.Xn(i);
          if ("overlay" === s) return null;
          const n = this.O.Jn();
          return n.k !== this.F && (this.F = n.k, this.$n.On()), this.Xt.qn(this.jn.ji(), n, s), this.Xt;
        }
      };
      lt = class extends R {
        constructor() {
          super(...arguments), this.jt = null;
        }
        ht(t) {
          this.jt = t;
        }
        Qn(t, i) {
          if (!this.jt?.It) return null;
          const { ut: s, ct: n, te: e2 } = this.jt;
          return i >= s - n - 7 && i <= s + n + 7 ? { ie: this.jt, te: e2 } : null;
        }
        et({ context: t, bitmapSize: i, horizontalPixelRatio: s, verticalPixelRatio: n }) {
          if (null === this.jt) return;
          if (false === this.jt.It) return;
          const e2 = Math.round(this.jt.ut * n);
          e2 < 0 || e2 > i.height || (t.lineCap = "butt", t.strokeStyle = this.jt.R, t.lineWidth = Math.floor(this.jt.ct * s), a(t, this.jt.Zt), l(t, e2, 0, i.width));
        }
      };
      ot = class {
        constructor(t) {
          this.se = { ut: 0, R: "rgba(0, 0, 0, 0)", ct: 1, Zt: 0, It: false }, this.ne = new lt(), this.xt = true, this.ee = t, this.re = t.Qt(), this.ne.ht(this.se);
        }
        kt() {
          this.xt = true;
        }
        Tt() {
          return this.ee.It() ? (this.xt && (this.he(), this.xt = false), this.ne) : null;
        }
      };
      _t = class extends ot {
        constructor(t) {
          super(t);
        }
        he() {
          this.se.It = false;
          const t = this.ee.Ft(), i = t.ae().ae;
          if (2 !== i && 3 !== i) return;
          const s = this.ee.N();
          if (!s.baseLineVisible || !this.ee.It()) return;
          const n = this.ee.Lt();
          null !== n && (this.se.It = true, this.se.ut = t.Nt(n.Wt, n.Wt), this.se.R = s.baseLineColor, this.se.ct = s.baseLineWidth, this.se.Zt = s.baseLineStyle);
        }
      };
      ut = class extends R {
        constructor() {
          super(...arguments), this.jt = null;
        }
        ht(t) {
          this.jt = t;
        }
        le() {
          return this.jt;
        }
        et({ context: t, horizontalPixelRatio: i, verticalPixelRatio: s }) {
          const n = this.jt;
          if (null === n) return;
          const e2 = Math.max(1, Math.floor(i)), r2 = e2 % 2 / 2, h2 = Math.round(n.oe.x * i) + r2, a2 = n.oe.y * s;
          t.fillStyle = n._e, t.beginPath();
          const l2 = Math.max(2, 1.5 * n.ue) * i;
          t.arc(h2, a2, l2, 0, 2 * Math.PI, false), t.fill(), t.fillStyle = n.ce, t.beginPath(), t.arc(h2, a2, n.ft * i, 0, 2 * Math.PI, false), t.fill(), t.lineWidth = e2, t.strokeStyle = n.de, t.beginPath(), t.arc(h2, a2, n.ft * i + e2 / 2, 0, 2 * Math.PI, false), t.stroke();
        }
      };
      ct = [{ fe: 0, pe: 0.25, ve: 4, me: 10, we: 0.25, ge: 0, Me: 0.4, be: 0.8 }, { fe: 0.25, pe: 0.525, ve: 10, me: 14, we: 0, ge: 0, Me: 0.8, be: 0 }, { fe: 0.525, pe: 1, ve: 14, me: 14, we: 0, ge: 0, Me: 0, be: 0 }];
      dt = class {
        constructor(t) {
          this.Xt = new ut(), this.xt = true, this.Se = true, this.xe = performance.now(), this.Ce = this.xe - 1, this.ye = t;
        }
        ke() {
          this.Ce = this.xe - 1, this.kt();
        }
        Pe() {
          if (this.kt(), 2 === this.ye.N().lastPriceAnimation) {
            const t = performance.now(), i = this.Ce - t;
            if (i > 0) return void (i < 650 && (this.Ce += 2600));
            this.xe = t, this.Ce = t + 2600;
          }
        }
        kt() {
          this.xt = true;
        }
        Te() {
          this.Se = true;
        }
        It() {
          return 0 !== this.ye.N().lastPriceAnimation;
        }
        Re() {
          switch (this.ye.N().lastPriceAnimation) {
            case 0:
              return false;
            case 1:
              return true;
            case 2:
              return performance.now() <= this.Ce;
          }
        }
        Tt() {
          return this.xt ? (this.Rt(), this.xt = false, this.Se = false) : this.Se && (this.De(), this.Se = false), this.Xt;
        }
        Rt() {
          this.Xt.ht(null);
          const t = this.ye.Qt().Et(), i = t.Ie(), s = this.ye.Lt();
          if (null === i || null === s) return;
          const n = this.ye.Ve(true);
          if (n.Be || !i.Ee(n.js)) return;
          const e2 = { x: t.qt(n.js), y: this.ye.Ft().Nt(n.gt, s.Wt) }, r2 = n.R, h2 = this.ye.N().lineWidth, a2 = this.Ae(this.Le(), r2);
          this.Xt.ht({ _e: r2, ue: h2, ce: a2.ce, de: a2.de, ft: a2.ft, oe: e2 });
        }
        De() {
          const t = this.Xt.le();
          if (null !== t) {
            const i = this.Ae(this.Le(), t._e);
            t.ce = i.ce, t.de = i.de, t.ft = i.ft;
          }
        }
        Le() {
          return this.Re() ? performance.now() - this.xe : 2599;
        }
        ze(t, i, s, n) {
          const e2 = s + (n - s) * i;
          return this.ye.Qt().Xi().Y(t, e2);
        }
        Ae(t, i) {
          const s = t % 2600 / 2600;
          let n;
          for (const t2 of ct) if (s >= t2.fe && s <= t2.pe) {
            n = t2;
            break;
          }
          o(void 0 !== n, "Last price animation internal logic error");
          const e2 = (s - n.fe) / (n.pe - n.fe);
          return { ce: this.ze(i, e2, n.we, n.ge), de: this.ze(i, e2, n.Me, n.be), ft: (r2 = e2, h2 = n.ve, a2 = n.me, h2 + (a2 - h2) * r2) };
          var r2, h2, a2;
        }
      };
      ft = class extends ot {
        constructor(t) {
          super(t);
        }
        he() {
          const t = this.se;
          t.It = false;
          const i = this.ee.N();
          if (!i.priceLineVisible || !this.ee.It()) return;
          const s = this.ee.Ve(0 === i.priceLineSource);
          s.Be || (t.It = true, t.ut = s.Ei, t.R = this.ee.Oe(s.R), t.ct = i.priceLineWidth, t.Zt = i.priceLineStyle);
        }
      };
      pt = class extends H {
        constructor(t) {
          super(), this.Jt = t;
        }
        Yi(t, i, s) {
          t.It = false, i.It = false;
          const n = this.Jt;
          if (!n.It()) return;
          const e2 = n.N(), r2 = e2.lastValueVisible, h2 = "" !== n.Ne(), a2 = 0 === e2.seriesLastValueMode, l2 = n.Ve(false);
          if (l2.Be) return;
          r2 && (t.ri = this.Fe(l2, r2, a2), t.It = 0 !== t.ri.length), (h2 || a2) && (i.ri = this.We(l2, r2, h2, a2), i.It = i.ri.length > 0);
          const o2 = n.Oe(l2.R), _2 = this.Jt.Qt().Xi().Z(o2);
          s.G = _2.G, s.Ei = l2.Ei, i.Ht = n.Qt().Ut(l2.Ei / n.Ft().$t()), t.Ht = o2, t.R = _2.X, i.R = _2.X;
        }
        We(t, i, s, n) {
          let e2 = "";
          const r2 = this.Jt.Ne();
          return s && 0 !== r2.length && (e2 += `${r2} `), i && n && (e2 += this.Jt.Ft().He() ? t.Ue : t.$e), e2.trim();
        }
        Fe(t, i, s) {
          return i ? s ? this.Jt.Ft().He() ? t.$e : t.Ue : t.ri : "";
        }
      };
      mt = class _mt {
        constructor(t, i) {
          this.qe = t, this.je = i;
        }
        Ye(t) {
          return null !== t && (this.qe === t.qe && this.je === t.je);
        }
        Ke() {
          return new _mt(this.qe, this.je);
        }
        Ze() {
          return this.qe;
        }
        Ge() {
          return this.je;
        }
        Xe() {
          return this.je - this.qe;
        }
        Gi() {
          return this.je === this.qe || Number.isNaN(this.je) || Number.isNaN(this.qe);
        }
        Sn(t) {
          return null === t ? this : new _mt(vt(Math.min, this.Ze(), t.Ze(), -1 / 0), vt(Math.max, this.Ge(), t.Ge(), 1 / 0));
        }
        Je(t) {
          if (!p(t)) return;
          if (0 === this.je - this.qe) return;
          const i = 0.5 * (this.je + this.qe);
          let s = this.je - i, n = this.qe - i;
          s *= t, n *= t, this.je = i + s, this.qe = i + n;
        }
        Qe(t) {
          p(t) && (this.je += t, this.qe += t);
        }
        tr() {
          return { minValue: this.qe, maxValue: this.je };
        }
        static ir(t) {
          return null === t ? null : new _mt(t.minValue, t.maxValue);
        }
      };
      wt = class _wt {
        constructor(t, i) {
          this.sr = t, this.nr = i || null;
        }
        er() {
          return this.sr;
        }
        rr() {
          return this.nr;
        }
        tr() {
          return { priceRange: null === this.sr ? null : this.sr.tr(), margins: this.nr || void 0 };
        }
        static ir(t) {
          return null === t ? null : new _wt(mt.ir(t.priceRange), t.margins);
        }
      };
      gt = [2, 4, 8, 16, 32, 64, 128, 256, 512];
      Mt = "Custom series with conflation reducer must have a priceValueBuilder method";
      bt = class extends ot {
        constructor(t, i) {
          super(t), this.hr = i;
        }
        he() {
          const t = this.se;
          t.It = false;
          const i = this.hr.N();
          if (!this.ee.It() || !i.lineVisible) return;
          const s = this.hr.ar();
          null !== s && (t.It = true, t.ut = s, t.R = i.color, t.ct = i.lineWidth, t.Zt = i.lineStyle, t.te = this.hr.N().id);
        }
      };
      St = class extends H {
        constructor(t, i) {
          super(), this.ye = t, this.hr = i;
        }
        Yi(t, i, s) {
          t.It = false, i.It = false;
          const n = this.hr.N(), e2 = n.axisLabelVisible, r2 = "" !== n.title, h2 = this.ye;
          if (!e2 || !h2.It()) return;
          const a2 = this.hr.ar();
          if (null === a2) return;
          r2 && (i.ri = n.title, i.It = true), i.Ht = h2.Qt().Ut(a2 / h2.Ft().$t()), t.ri = this.lr(n.price), t.It = true;
          const l2 = this.ye.Qt().Xi().Z(n.axisLabelColor || n.color);
          s.G = l2.G;
          const o2 = n.axisLabelTextColor || l2.X;
          t.R = o2, i.R = o2, s.Ei = a2;
        }
        lr(t) {
          const i = this.ye.Lt();
          return null === i ? "" : this.ye.Ft().Ji(t, i.Wt);
        }
      };
      xt = class {
        constructor(t, i) {
          this.ye = t, this.Ps = i, this._r = new bt(t, this), this.jn = new St(t, this), this.ur = new at(this.jn, t, t.Qt());
        }
        cr(t) {
          f(this.Ps, t), this.kt(), this.ye.Qt().dr();
        }
        N() {
          return this.Ps;
        }
        pr() {
          return this._r;
        }
        vr() {
          return this.ur;
        }
        mr() {
          return this.jn;
        }
        kt() {
          this._r.kt(), this.jn.kt();
        }
        ar() {
          const t = this.ye, i = t.Ft();
          if (t.Qt().Et().Gi() || i.Gi()) return null;
          const s = t.Lt();
          return null === s ? null : i.Nt(this.Ps.price, s.Wt);
        }
      };
      Ct = class {
        constructor() {
          this.wr = /* @__PURE__ */ new WeakMap();
        }
        gr(t, i, s) {
          const n = 1 / i * s;
          if (t >= n) return 1;
          const e2 = n / t, r2 = Math.pow(2, Math.floor(Math.log2(e2)));
          return Math.min(r2, 512);
        }
        Mr(t, i, s, n = false, e2) {
          if (0 === t.length || i <= 1) return t;
          const r2 = this.br(i);
          if (r2 <= 1) return t;
          const h2 = this.Sr(t);
          let a2 = h2.Cr.get(r2);
          return void 0 !== a2 || (a2 = this.yr(t, r2, s, n, e2, h2.Cr), h2.Cr.set(r2, a2)), a2;
        }
        kr(t, i, s, n, e2 = false, r2) {
          if (s < 1 || 0 === t.length) return t;
          const h2 = this.Sr(t), a2 = h2.Cr.get(s);
          if (!a2) return this.Mr(t, s, n, e2, r2);
          const l2 = this.Pr(t, i, s, a2, e2, n, r2);
          return h2.Cr.set(s, l2), l2;
        }
        br(t) {
          if (t <= 2) return 2;
          for (const i of gt) if (t <= i) return i;
          return 512;
        }
        Tr(t) {
          if (0 === t.length) return 0;
          const i = t[0], s = t[t.length - 1];
          return 31 * t.length + 17 * i.js + 13 * s.js;
        }
        yr(t, i, s, n = false, e2, r2 = /* @__PURE__ */ new Map()) {
          if (2 === i) return this.Rr(t, 2, s, n, e2);
          const h2 = i / 2;
          let a2 = r2.get(h2);
          return a2 || (a2 = this.yr(t, h2, s, n, e2, r2), r2.set(h2, a2)), this.Dr(a2, s, n, e2);
        }
        Rr(t, i, s, n = false, e2) {
          const r2 = this.Ir(t, i, s, n, e2);
          return this.Vr(r2, n);
        }
        Dr(t, i, s = false, n) {
          const e2 = this.Ir(t, 2, i, s, n);
          return this.Vr(e2, s);
        }
        Ir(t, i, s, n = false, e2) {
          const r2 = [];
          for (let h2 = 0; h2 < t.length; h2 += i) {
            if (t.length - h2 >= i) {
              const i2 = this.Br(t[h2], t[h2 + 1], s, n, e2);
              i2.Er = false, r2.push(i2);
            } else if (0 === r2.length) r2.push(this.Ar(t[h2], true));
            else {
              const i2 = r2[r2.length - 1];
              r2[r2.length - 1] = this.Lr(i2, t[h2], s, n, e2);
            }
          }
          return r2;
        }
        zr(t, i) {
          return (t ?? 1) + (i ?? 1);
        }
        Br(t, i, s, n = false, e2) {
          if (!n || !s || !e2) {
            const s2 = t.Wt[1] > i.Wt[1] ? t.Wt[1] : i.Wt[1], n2 = t.Wt[2] < i.Wt[2] ? t.Wt[2] : i.Wt[2];
            return { Or: t.js, Nr: i.js, Fr: t.wt, Wr: i.wt, Hr: t.Wt[0], Ur: s2, $r: n2, qr: i.Wt[3], jr: this.zr(t.jr, i.jr), Yr: void 0, Er: false };
          }
          const r2 = s(this.Kr(t, e2), this.Kr(i, e2)), h2 = e2(r2), a2 = h2.length ? h2[h2.length - 1] : 0;
          return { Or: t.js, Nr: i.js, Fr: t.wt, Wr: i.wt, Hr: t.Wt[0], Ur: Math.max(t.Wt[1], a2), $r: Math.min(t.Wt[2], a2), qr: a2, jr: this.zr(t.jr, i.jr), Yr: r2, Er: false };
        }
        Lr(t, i, s, n = false, e2) {
          if (!n || !s || !e2) return { Or: t.Or, Nr: i.js, Fr: t.Fr, Wr: i.wt, Hr: t.Hr, Ur: t.Ur > i.Wt[1] ? t.Ur : i.Wt[1], $r: t.$r < i.Wt[2] ? t.$r : i.Wt[2], qr: i.Wt[3], jr: t.jr + (i.jr ?? 1), Yr: t.Yr, Er: false };
          const r2 = t.Yr, h2 = this.Kr(i, e2), a2 = r2 ? { data: r2, index: t.Or, originalTime: t.Fr, time: t.Fr, priceValues: e2(r2) } : null, l2 = a2 ? s(a2, h2) : h2.data, o2 = a2 ? e2(l2) : h2.priceValues, _2 = o2.length ? o2[o2.length - 1] : 0;
          return { Or: t.Or, Nr: i.js, Fr: t.Fr, Wr: i.wt, Hr: t.Hr, Ur: Math.max(t.Ur, _2), $r: Math.min(t.$r, _2), qr: _2, jr: t.jr + (i.jr ?? 1), Yr: l2, Er: false };
        }
        Zr(t, i, s, n, e2, r2, h2 = false, a2) {
          const l2 = i === n ? e2 : t[i];
          if (s - i == 1) return this.Ar(l2, true);
          const o2 = i + 1 === n ? e2 : t[i + 1];
          let _2 = this.Br(l2, o2, r2, h2, a2);
          for (let l3 = i + 2; l3 < s; l3++) {
            const i2 = l3 === n ? e2 : t[l3];
            _2 = this.Lr(_2, i2, r2, h2, a2);
          }
          return _2;
        }
        Kr(t, i) {
          const s = t.le ?? {};
          return { data: t.le, index: t.js, originalTime: t.Gr, time: t.wt, priceValues: i(s) };
        }
        Xr(t, i = false) {
          const s = true === i, n = !!t.Yr;
          return { ...{ js: t.Or, wt: t.Fr, Gr: t.Fr, Wt: [s ? t.qr : t.Hr, t.Ur, t.$r, t.qr], jr: t.jr }, le: s ? n ? t.Yr : { wt: t.Fr } : void 0 };
        }
        Vr(t, i = false) {
          return t.map(((t2) => this.Xr(t2, i)));
        }
        Pr(t, i, s, n, e2 = false, r2, h2) {
          if (0 === n.length) return n;
          const a2 = t.length - 1, l2 = Math.floor(a2 / s) * s;
          if (Math.min(l2 + s, t.length) - l2 < s && t.length > s) {
            const n2 = t.slice();
            return n2[n2.length - 1] = i, this.Mr(n2, s, r2, e2, h2);
          }
          if (Math.floor((a2 - 1) / s) === Math.floor(a2 / s) || 1 === n.length) {
            const o2 = Math.min(l2 + s, t.length), _2 = o2 - l2;
            if (_2 <= 0) return n;
            const u2 = 1 === _2 ? this.Ar(l2 === a2 ? i : t[l2], true) : this.Zr(t, l2, o2, a2, i, r2, e2, h2);
            return n[n.length - 1] = this.Xr(u2, e2), n;
          }
          {
            const n2 = t.slice();
            return n2[n2.length - 1] = i, this.Mr(n2, s, r2, e2, h2);
          }
        }
        Ar(t, i = false) {
          return { Or: t.js, Nr: t.js, Fr: t.wt, Wr: t.wt, Hr: t.Wt[0], Ur: t.Wt[1], $r: t.Wt[2], qr: t.Wt[3], jr: t.jr ?? 1, Yr: t.le, Er: i };
        }
        Sr(t) {
          const i = this.Jr(t), s = this.Tr(t);
          return i.Qr !== s && (i.Cr.clear(), i.Qr = s), i;
        }
        Jr(t) {
          let i = this.wr.get(t);
          return void 0 === i && (i = { Qr: this.Tr(t), Cr: /* @__PURE__ */ new Map() }, this.wr.set(t, i)), i;
        }
      };
      yt = class extends Y {
        constructor(t) {
          super(), this.ns = t;
        }
        Qt() {
          return this.ns;
        }
      };
      kt = { Bar: (t, i, s, n) => {
        const e2 = i.upColor, r2 = i.downColor, h2 = u(t(s, n)), a2 = c(h2.Wt[0]) <= c(h2.Wt[3]);
        return { th: h2.R ?? (a2 ? e2 : r2) };
      }, Candlestick: (t, i, s, n) => {
        const e2 = i.upColor, r2 = i.downColor, h2 = i.borderUpColor, a2 = i.borderDownColor, l2 = i.wickUpColor, o2 = i.wickDownColor, _2 = u(t(s, n)), d2 = c(_2.Wt[0]) <= c(_2.Wt[3]);
        return { th: _2.R ?? (d2 ? e2 : r2), ih: _2.Ht ?? (d2 ? h2 : a2), sh: _2.nh ?? (d2 ? l2 : o2) };
      }, Custom: (t, i, s, n) => ({ th: u(t(s, n)).R ?? i.color }), Area: (t, i, s, n) => {
        const e2 = u(t(s, n));
        return { th: e2.vt ?? i.lineColor, vt: e2.vt ?? i.lineColor, eh: e2.eh ?? i.topColor, rh: e2.rh ?? i.bottomColor };
      }, Baseline: (t, i, s, n) => {
        const e2 = u(t(s, n));
        return { th: e2.Wt[3] >= i.baseValue.price ? i.topLineColor : i.bottomLineColor, hh: e2.hh ?? i.topLineColor, ah: e2.ah ?? i.bottomLineColor, oh: e2.oh ?? i.topFillColor1, _h: e2._h ?? i.topFillColor2, uh: e2.uh ?? i.bottomFillColor1, dh: e2.dh ?? i.bottomFillColor2 };
      }, Line: (t, i, s, n) => {
        const e2 = u(t(s, n));
        return { th: e2.R ?? i.color, vt: e2.R ?? i.color };
      }, Histogram: (t, i, s, n) => ({ th: u(t(s, n)).R ?? i.color }) };
      Pt = class {
        constructor(t) {
          this.fh = (t2, i) => void 0 !== i ? i.Wt : this.ye.qs().ph(t2), this.ye = t, this.mh = kt[t.wh()];
        }
        gh(t, i) {
          return this.mh(this.fh, this.ye.N(), t, i);
        }
      };
      Rt = Tt.bind(null, true);
      Dt = Tt.bind(null, false);
      !(function(t) {
        t[t.NearestLeft = -1] = "NearestLeft", t[t.None = 0] = "None", t[t.NearestRight = 1] = "NearestRight";
      })(It || (It = {}));
      Vt = 30;
      Bt = class {
        constructor() {
          this.Mh = [], this.bh = /* @__PURE__ */ new Map(), this.Sh = /* @__PURE__ */ new Map(), this.xh = [];
        }
        Ch() {
          return this.yh() > 0 ? this.Mh[this.Mh.length - 1] : null;
        }
        kh() {
          return this.yh() > 0 ? this.Ph(0) : null;
        }
        sn() {
          return this.yh() > 0 ? this.Ph(this.Mh.length - 1) : null;
        }
        yh() {
          return this.Mh.length;
        }
        Gi() {
          return 0 === this.yh();
        }
        Ee(t) {
          return null !== this.Th(t, 0);
        }
        ph(t) {
          return this.$s(t);
        }
        $s(t, i = 0) {
          const s = this.Th(t, i);
          return null === s ? null : { ...this.Rh(s), js: this.Ph(s) };
        }
        Dh() {
          return this.Mh;
        }
        Ih(t, i, s) {
          if (this.Gi()) return null;
          let n = null;
          for (const e2 of s) {
            n = Et(n, this.Vh(t, i, e2));
          }
          return n;
        }
        ht(t) {
          this.Sh.clear(), this.bh.clear(), this.Mh = t, this.xh = t.map(((t2) => t2.js));
        }
        Bh() {
          return this.xh;
        }
        Ph(t) {
          return this.Mh[t].js;
        }
        Rh(t) {
          return this.Mh[t];
        }
        Th(t, i) {
          const s = this.Eh(t);
          if (null === s && 0 !== i) switch (i) {
            case -1:
              return this.Ah(t);
            case 1:
              return this.Lh(t);
            default:
              throw new TypeError("Unknown search mode");
          }
          return s;
        }
        Ah(t) {
          let i = this.zh(t);
          return i > 0 && (i -= 1), i !== this.Mh.length && this.Ph(i) < t ? i : null;
        }
        Lh(t) {
          const i = this.Oh(t);
          return i !== this.Mh.length && t < this.Ph(i) ? i : null;
        }
        Eh(t) {
          const i = this.zh(t);
          return i === this.Mh.length || t < this.Mh[i].js ? null : i;
        }
        zh(t) {
          return Rt(this.Mh, t, ((t2, i) => t2.js < i));
        }
        Oh(t) {
          return Dt(this.Mh, t, ((t2, i) => t2.js > i));
        }
        Nh(t, i, s) {
          let n = null;
          for (let e2 = t; e2 < i; e2++) {
            const t2 = this.Mh[e2].Wt[s];
            Number.isNaN(t2) || (null === n ? n = { Fh: t2, Wh: t2 } : (t2 < n.Fh && (n.Fh = t2), t2 > n.Wh && (n.Wh = t2)));
          }
          return n;
        }
        Vh(t, i, s) {
          if (this.Gi()) return null;
          let n = null;
          const e2 = u(this.kh()), r2 = u(this.sn()), h2 = Math.max(t, e2), a2 = Math.min(i, r2), l2 = Math.ceil(h2 / Vt) * Vt, o2 = Math.max(l2, Math.floor(a2 / Vt) * Vt);
          {
            const t2 = this.zh(h2), e3 = this.Oh(Math.min(a2, l2, i));
            n = Et(n, this.Nh(t2, e3, s));
          }
          let _2 = this.bh.get(s);
          void 0 === _2 && (_2 = /* @__PURE__ */ new Map(), this.bh.set(s, _2));
          for (let t2 = Math.max(l2 + 1, h2); t2 < o2; t2 += Vt) {
            const i2 = Math.floor(t2 / Vt);
            let e3 = _2.get(i2);
            if (void 0 === e3) {
              const t3 = this.zh(i2 * Vt), n2 = this.Oh((i2 + 1) * Vt - 1);
              e3 = this.Nh(t3, n2, s), _2.set(i2, e3);
            }
            n = Et(n, e3);
          }
          {
            const t2 = this.zh(o2), i2 = this.Oh(a2);
            n = Et(n, this.Nh(t2, i2, s));
          }
          return n;
        }
      };
      Lt = { setLineStyle: a };
      zt = class {
        constructor(t) {
          this.Hh = t;
        }
        nt(t, i, s) {
          this.Hh.draw(t, Lt);
        }
        Uh(t, i, s) {
          this.Hh.drawBackground?.(t, Lt);
        }
      };
      Ot = class {
        constructor(t) {
          this.Ln = null, this.$h = t;
        }
        Tt() {
          const t = this.$h.renderer();
          if (null === t) return null;
          if (this.Ln?.qh === t) return this.Ln.jh;
          const i = new zt(t);
          return this.Ln = { qh: t, jh: i }, i;
        }
        Yh() {
          return this.$h.zOrder?.() ?? "normal";
        }
      };
      Nt = class {
        constructor(t) {
          this.Kh = null, this.Zh = t;
        }
        Gh() {
          return this.Zh;
        }
        Ws() {
          this.Zh.updateAllViews?.();
        }
        Ys() {
          const t = this.Zh.paneViews?.() ?? [];
          if (this.Kh?.qh === t) return this.Kh.jh;
          const i = t.map(((t2) => new Ot(t2)));
          return this.Kh = { qh: t, jh: i }, i;
        }
        Qn(t, i) {
          return this.Zh.hitTest?.(t, i) ?? null;
        }
      };
      Ft = class extends Nt {
        ds() {
          return [];
        }
      };
      Wt = class {
        constructor(t) {
          this.Hh = t;
        }
        nt(t, i, s) {
          this.Hh.draw(t, Lt);
        }
        Uh(t, i, s) {
          this.Hh.drawBackground?.(t, Lt);
        }
      };
      Ht = class {
        constructor(t) {
          this.Ln = null, this.$h = t;
        }
        Tt() {
          const t = this.$h.renderer();
          if (null === t) return null;
          if (this.Ln?.qh === t) return this.Ln.jh;
          const i = new Wt(t);
          return this.Ln = { qh: t, jh: i }, i;
        }
        Yh() {
          return this.$h.zOrder?.() ?? "normal";
        }
      };
      $t = class {
        constructor(t, i) {
          this.Xt = new q(), this.Xh = t, this.Jh = i;
        }
        Tt() {
          return this.Xt.ht({ ss: this.Jh.ss(), ...Ut(this.Xh) }), this.Xt;
        }
      };
      qt = class extends H {
        constructor(t, i) {
          super(), this.Xh = t, this.Ki = i;
        }
        Yi(t, i, s) {
          const n = Ut(this.Xh);
          s.G = n.G, t.R = n.R;
          const e2 = 2 / 12 * this.Ki.k();
          s.Ti = e2, s.Ri = e2, s.Ei = n.Ei, s.Vi = n.Vi, t.ri = n.ri, t.It = n.It, t.pi = n.pi;
        }
      };
      jt = class extends Nt {
        constructor(t, i) {
          super(t), this.Qh = null, this.ta = null, this.ia = null, this.sa = null, this.ye = i;
        }
        fs() {
          const t = this.Zh.timeAxisViews?.() ?? [];
          if (this.Qh?.qh === t) return this.Qh.jh;
          const i = this.ye.Qt().Et(), s = t.map(((t2) => new $t(t2, i)));
          return this.Qh = { qh: t, jh: s }, s;
        }
        Ks() {
          const t = this.Zh.priceAxisViews?.() ?? [];
          if (this.ta?.qh === t) return this.ta.jh;
          const i = this.ye.Ft(), s = t.map(((t2) => new qt(t2, i)));
          return this.ta = { qh: t, jh: s }, s;
        }
        na() {
          const t = this.Zh.priceAxisPaneViews?.() ?? [];
          if (this.ia?.qh === t) return this.ia.jh;
          const i = t.map(((t2) => new Ht(t2)));
          return this.ia = { qh: t, jh: i }, i;
        }
        ea() {
          const t = this.Zh.timeAxisPaneViews?.() ?? [];
          if (this.sa?.qh === t) return this.sa.jh;
          const i = t.map(((t2) => new Ht(t2)));
          return this.sa = { qh: t, jh: i }, i;
        }
        ra(t, i) {
          return this.Zh.autoscaleInfo?.(t, i) ?? null;
        }
      };
      Xt = ["Area", "Line", "Baseline"];
      Jt = class extends yt {
        constructor(t, i, s, n, e2) {
          super(t), this.jt = At(), this._r = new ft(this), this.ha = [], this.aa = new _t(this), this.la = null, this.oa = null, this._a = null, this.ua = [], this.ca = new Ct(), this.da = /* @__PURE__ */ new Map(), this.fa = null, this.Ps = s, this.pa = i;
          const r2 = new pt(this);
          if (this.gs = [r2], this.ur = new at(r2, this, t), Xt.includes(this.pa) && (this.la = new dt(this)), this.va(), this.$h = n(this, this.Qt(), e2), "Custom" === this.pa) {
            const t2 = this.$h;
            t2.ma && this.wa(t2.ma);
          }
        }
        m() {
          null !== this._a && clearTimeout(this._a);
        }
        Oe(t) {
          return this.Ps.priceLineColor || t;
        }
        Ve(t) {
          const i = { Be: true }, s = this.Ft();
          if (this.Qt().Et().Gi() || s.Gi() || this.jt.Gi()) return i;
          const n = this.Qt().Et().Ie(), e2 = this.Lt();
          if (null === n || null === e2) return i;
          let r2, h2;
          if (t) {
            const t2 = this.jt.Ch();
            if (null === t2) return i;
            r2 = t2, h2 = t2.js;
          } else {
            const t2 = this.jt.$s(n.bi(), -1);
            if (null === t2) return i;
            if (r2 = this.jt.ph(t2.js), null === r2) return i;
            h2 = t2.js;
          }
          const a2 = r2.Wt[3], l2 = this.ga().gh(h2, { Wt: r2 }), o2 = s.Nt(a2, e2.Wt);
          return { Be: false, gt: a2, ri: s.Ji(a2, e2.Wt), Ue: s.Ma(a2), $e: s.ba(a2, e2.Wt), R: l2.th, Ei: o2, js: h2 };
        }
        ga() {
          return null !== this.oa || (this.oa = new Pt(this)), this.oa;
        }
        N() {
          return this.Ps;
        }
        cr(t) {
          const i = this.Qt(), { priceScaleId: s, visible: n, priceFormat: e2 } = t;
          void 0 !== s && s !== this.Ps.priceScaleId && i.Sa(this, s), void 0 !== n && n !== this.Ps.visible && i.xa();
          const r2 = void 0 !== t.conflationThresholdFactor;
          f(this.Ps, t), r2 && (this.da.clear(), this.Qt().dr()), void 0 !== e2 && (this.va(), i.Ca()), i.ya(this), i.ka(), this.$h.kt("options");
        }
        ht(t, i) {
          this.jt.ht(t), this.da.clear();
          const s = this.Qt().Et().N();
          s.enableConflation && s.precomputeConflationOnInit && this.Pa(s.precomputeConflationPriority), this.$h.kt("data"), null !== this.la && (i && i.Ta ? this.la.Pe() : 0 === t.length && this.la.ke());
          const n = this.Qt().Kn(this);
          this.Qt().Ra(n), this.Qt().ya(this), this.Qt().ka(), this.Qt().dr();
        }
        Da(t) {
          const i = new xt(this, t);
          return this.ha.push(i), this.Qt().ya(this), i;
        }
        Ia(t) {
          const i = this.ha.indexOf(t);
          -1 !== i && this.ha.splice(i, 1), this.Qt().ya(this);
        }
        Va() {
          return this.ha;
        }
        wh() {
          return this.pa;
        }
        Lt() {
          const t = this.Ba();
          return null === t ? null : { Wt: t.Wt[3], Ea: t.wt };
        }
        Ba() {
          const t = this.Qt().Et().Ie();
          if (null === t) return null;
          const i = t.Aa();
          return this.jt.$s(i, 1);
        }
        qs() {
          return this.jt;
        }
        wa(t) {
          this.fa = t, this.da.clear();
        }
        La() {
          return !!this.Qt().Et().N().enableConflation && this.za() > 1;
        }
        kr(t) {
          if (!this.La()) return;
          const i = this.za();
          if (!this.da.has(i)) return;
          const s = "Custom" === this.pa, n = s && this.fa || void 0, e2 = s && this.$h.Oa ? (t2) => {
            const i2 = t2, s2 = this.$h.Oa(i2);
            return Array.isArray(s2) ? s2 : ["number" == typeof s2 ? s2 : 0];
          } : void 0, r2 = this.ca.kr(this.jt.Dh(), t, i, n, s, e2), h2 = At();
          h2.ht(r2), this.da.set(i, h2);
        }
        Na() {
          const t = this.Qt().Et().N().enableConflation;
          if ("Custom" === this.pa && null === this.fa) return this.jt;
          if (!t) return this.jt;
          const i = this.za(), s = this.da.get(i);
          if (s) return s;
          this.Fa(i);
          return this.da.get(i) ?? this.jt;
        }
        Wa(t) {
          const i = this.jt.ph(t);
          return null === i ? null : "Bar" === this.pa || "Candlestick" === this.pa || "Custom" === this.pa ? { Hr: i.Wt[0], Ur: i.Wt[1], $r: i.Wt[2], qr: i.Wt[3] } : i.Wt[3];
        }
        Ha(t) {
          const i = [];
          Yt(this.ua, Kt, "top", i);
          const s = this.la;
          return null !== s && s.It() ? (null === this._a && s.Re() && (this._a = setTimeout((() => {
            this._a = null, this.Qt().Ua();
          }), 0)), s.Te(), i.unshift(s), i) : i;
        }
        Ys() {
          const t = [];
          this.$a() || t.push(this.aa), t.push(this.$h, this._r);
          const i = this.ha.map(((t2) => t2.pr()));
          return t.push(...i), Yt(this.ua, Kt, "normal", t), t;
        }
        qa() {
          return this.ja(Kt, "bottom");
        }
        Ya(t) {
          return this.ja(Zt, t);
        }
        Ka(t) {
          return this.ja(Gt, t);
        }
        Za(t, i) {
          return this.ua.map(((s) => s.Qn(t, i))).filter(((t2) => null !== t2));
        }
        ds() {
          return [this.ur, ...this.ha.map(((t) => t.vr()))];
        }
        Ks(t, i) {
          if (i !== this.hs && !this.$a()) return [];
          const s = [...this.gs];
          for (const t2 of this.ha) s.push(t2.mr());
          return this.ua.forEach(((t2) => {
            s.push(...t2.Ks());
          })), s;
        }
        fs() {
          const t = [];
          return this.ua.forEach(((i) => {
            t.push(...i.fs());
          })), t;
        }
        ra(t, i) {
          if (void 0 !== this.Ps.autoscaleInfoProvider) {
            const s = this.Ps.autoscaleInfoProvider((() => {
              const s2 = this.Ga(t, i);
              return null === s2 ? null : s2.tr();
            }));
            return wt.ir(s);
          }
          return this.Ga(t, i);
        }
        qh() {
          const t = this.Ps.priceFormat;
          return t.base ?? 1 / t.minMove;
        }
        Xa() {
          return this.Ja;
        }
        Ws() {
          this.$h.kt();
          for (const t of this.gs) t.kt();
          for (const t of this.ha) t.kt();
          this._r.kt(), this.aa.kt(), this.la?.kt(), this.ua.forEach(((t) => t.Ws()));
        }
        Ft() {
          return u(super.Ft());
        }
        At(t) {
          if (!(("Line" === this.pa || "Area" === this.pa || "Baseline" === this.pa) && this.Ps.crosshairMarkerVisible)) return null;
          const i = this.jt.ph(t);
          if (null === i) return null;
          return { gt: i.Wt[3], ft: this.Qa(), Ht: this.tl(), Ot: this.il(), zt: this.sl(t) };
        }
        Ne() {
          return this.Ps.title;
        }
        It() {
          return this.Ps.visible;
        }
        nl(t) {
          this.ua.push(new jt(t, this));
        }
        el(t) {
          this.ua = this.ua.filter(((i) => i.Gh() !== t));
        }
        rl() {
          if ("Custom" === this.pa) return (t) => this.$h.Oa(t);
        }
        hl() {
          if ("Custom" === this.pa) return (t) => this.$h.al(t);
        }
        ll() {
          return this.jt.Bh();
        }
        $a() {
          return !G(this.Ft().ol());
        }
        Ga(t, i) {
          if (!v(t) || !v(i) || this.jt.Gi()) return null;
          const s = "Line" === this.pa || "Area" === this.pa || "Baseline" === this.pa || "Histogram" === this.pa ? [3] : [2, 1], n = this.jt.Ih(t, i, s);
          let e2 = null !== n ? new mt(n.Fh, n.Wh) : null, r2 = null;
          if ("Histogram" === this.wh()) {
            const t2 = this.Ps.base, i2 = new mt(t2, t2);
            e2 = null !== e2 ? e2.Sn(i2) : i2;
          }
          return this.ua.forEach(((s2) => {
            const n2 = s2.ra(t, i);
            if (n2?.priceRange) {
              const t2 = new mt(n2.priceRange.minValue, n2.priceRange.maxValue);
              e2 = null !== e2 ? e2.Sn(t2) : t2;
            }
            n2?.margins && (r2 = n2.margins);
          })), new wt(e2, r2);
        }
        Qa() {
          switch (this.pa) {
            case "Line":
            case "Area":
            case "Baseline":
              return this.Ps.crosshairMarkerRadius;
          }
          return 0;
        }
        tl() {
          switch (this.pa) {
            case "Line":
            case "Area":
            case "Baseline": {
              const t = this.Ps.crosshairMarkerBorderColor;
              if (0 !== t.length) return t;
            }
          }
          return null;
        }
        il() {
          switch (this.pa) {
            case "Line":
            case "Area":
            case "Baseline":
              return this.Ps.crosshairMarkerBorderWidth;
          }
          return 0;
        }
        sl(t) {
          switch (this.pa) {
            case "Line":
            case "Area":
            case "Baseline": {
              const t2 = this.Ps.crosshairMarkerBackgroundColor;
              if (0 !== t2.length) return t2;
            }
          }
          return this.ga().gh(t).th;
        }
        va() {
          switch (this.Ps.priceFormat.type) {
            case "custom": {
              const t = this.Ps.priceFormat.formatter;
              this.Ja = { format: t, formatTickmarks: this.Ps.priceFormat.tickmarksFormatter ?? ((i) => i.map(t)) };
              break;
            }
            case "volume":
              this.Ja = new nt(this.Ps.priceFormat.precision);
              break;
            case "percent":
              this.Ja = new st(this.Ps.priceFormat.precision);
              break;
            default: {
              const t = Math.pow(10, this.Ps.priceFormat.precision);
              this.Ja = new it(t, this.Ps.priceFormat.minMove * t);
            }
          }
          null !== this.hs && this.hs._l();
        }
        ja(t, i) {
          const s = [];
          return Yt(this.ua, t, i, s), s;
        }
        za() {
          const { ul: t, cl: i, dl: s } = this.fl();
          return this.ca.gr(t, i, s);
        }
        fl() {
          const t = this.Qt().Et(), i = t.ul(), s = window.devicePixelRatio || 1, n = t.N().conflationThresholdFactor;
          return { ul: i, cl: s, dl: this.Ps.conflationThresholdFactor ?? n ?? 1 };
        }
        pl(t) {
          const i = this.jt.Dh();
          let s;
          if ("Custom" === this.pa && null !== this.fa) {
            const n2 = this.rl();
            if (!n2) throw new Error(Mt);
            s = this.ca.Mr(i, t, this.fa, true, ((t2) => n2(t2)));
          } else s = this.ca.Mr(i, t);
          const n = At();
          return n.ht(s), n;
        }
        Fa(t) {
          const i = this.pl(t);
          this.da.set(t, i);
        }
        Pa(t) {
          if ("Custom" === this.pa && (null === this.fa || !this.rl())) return;
          this.da.clear();
          const i = this.Qt().Et().vl();
          for (const s of i) {
            const i2 = () => {
              this.ml(s);
            }, n = "object" == typeof window && window || "object" == typeof self && self;
            n?.gl?.wl ? n.gl.wl((() => {
              i2();
            }), { Ml: t }) : Promise.resolve().then((() => i2()));
          }
        }
        ml(t) {
          if (this.da.has(t)) return;
          if (0 === this.jt.Dh().length) return;
          const i = this.pl(t);
          this.da.set(t, i);
        }
      };
      Qt = [3];
      ti = [0, 1, 2, 3];
      ii = class {
        constructor(t) {
          this.Ps = t;
        }
        bl(t, i, s) {
          let n = t;
          if (0 === this.Ps.mode) return n;
          const e2 = s.Rs(), r2 = e2.Lt();
          if (null === r2) return n;
          const h2 = e2.Nt(t, r2), a2 = s.Sl().filter(((t2) => t2 instanceof Jt)).reduce(((t2, n2) => {
            if (s.Zn(n2) || !n2.It()) return t2;
            const e3 = n2.Ft(), r3 = n2.qs();
            if (e3.Gi() || !r3.Ee(i)) return t2;
            const h3 = r3.ph(i);
            if (null === h3) return t2;
            const a3 = c(n2.Lt()), l3 = 3 === this.Ps.mode ? ti : Qt;
            return t2.concat(l3.map(((t3) => e3.Nt(h3.Wt[t3], a3.Wt))));
          }), []);
          if (0 === a2.length) return n;
          a2.sort(((t2, i2) => Math.abs(t2 - h2) - Math.abs(i2 - h2)));
          const l2 = a2[0];
          return n = e2.Ds(l2, r2), n;
        }
      };
      ri = class extends R {
        constructor() {
          super(...arguments), this.jt = null;
        }
        ht(t) {
          this.jt = t;
        }
        et({ context: t, bitmapSize: i, horizontalPixelRatio: s, verticalPixelRatio: n }) {
          if (null === this.jt) return;
          const e2 = Math.max(1, Math.floor(s));
          t.lineWidth = e2, (function(t2, i2) {
            t2.save(), t2.lineWidth % 2 && t2.translate(0.5, 0.5), i2(), t2.restore();
          })(t, (() => {
            const r2 = u(this.jt);
            if (r2.xl) {
              t.strokeStyle = r2.Cl, a(t, r2.yl), t.beginPath();
              for (const n2 of r2.kl) {
                const r3 = Math.round(n2.Pl * s);
                t.moveTo(r3, -e2), t.lineTo(r3, i.height + e2);
              }
              t.stroke();
            }
            if (r2.Tl) {
              t.strokeStyle = r2.Rl, a(t, r2.Dl), t.beginPath();
              for (const s2 of r2.Il) {
                const r3 = Math.round(s2.Pl * n);
                t.moveTo(-e2, r3), t.lineTo(i.width + e2, r3);
              }
              t.stroke();
            }
          }));
        }
      };
      hi = class {
        constructor(t) {
          this.Xt = new ri(), this.xt = true, this.yt = t;
        }
        kt() {
          this.xt = true;
        }
        Tt() {
          if (this.xt) {
            const t = this.yt.Qt().N().grid, i = { Tl: t.horzLines.visible, xl: t.vertLines.visible, Rl: t.horzLines.color, Cl: t.vertLines.color, Dl: t.horzLines.style, yl: t.vertLines.style, Il: this.yt.Rs().Vl(), kl: (this.yt.Qt().Et().Vl() || []).map(((t2) => ({ Pl: t2.coord }))) };
            this.Xt.ht(i), this.xt = false;
          }
          return this.Xt;
        }
      };
      ai = class {
        constructor(t) {
          this.$h = new hi(t);
        }
        pr() {
          return this.$h;
        }
      };
      li = { Bl: 4, El: 1e-4 };
      wi = class {
        constructor(t, i) {
          if (this.Al = t, this.Ll = i, (function(t2) {
            if (t2 < 0) return false;
            if (t2 > 1e18) return true;
            for (let i2 = t2; i2 > 1; i2 /= 10) if (i2 % 10 != 0) return false;
            return true;
          })(this.Al)) this.zl = [2, 2.5, 2];
          else {
            this.zl = [];
            for (let t2 = this.Al; 1 !== t2; ) {
              if (t2 % 2 == 0) this.zl.push(2), t2 /= 2;
              else {
                if (t2 % 5 != 0) throw new Error("unexpected base");
                this.zl.push(2, 2.5), t2 /= 5;
              }
              if (this.zl.length > 100) throw new Error("something wrong with base");
            }
          }
        }
        Ol(t, i, s) {
          const n = 0 === this.Al ? 0 : 1 / this.Al;
          let e2 = Math.pow(10, Math.max(0, Math.ceil(Math.log10(t - i)))), r2 = 0, h2 = this.Ll[0];
          for (; ; ) {
            const t2 = ni(e2, n, 1e-14) && e2 > n + 1e-14, i2 = ni(e2, s * h2, 1e-14), a3 = ni(e2, 1, 1e-14);
            if (!(t2 && i2 && a3)) break;
            e2 /= h2, h2 = this.Ll[++r2 % this.Ll.length];
          }
          if (e2 <= n + 1e-14 && (e2 = n), e2 = Math.max(1, e2), this.zl.length > 0 && (a2 = e2, l2 = 1, o2 = 1e-14, Math.abs(a2 - l2) < o2)) for (r2 = 0, h2 = this.zl[0]; ni(e2, s * h2, 1e-14) && e2 > n + 1e-14; ) e2 /= h2, h2 = this.zl[++r2 % this.zl.length];
          var a2, l2, o2;
          return e2;
        }
      };
      gi = class {
        constructor(t, i, s, n) {
          this.Nl = [], this.Ki = t, this.Al = i, this.Fl = s, this.Wl = n;
        }
        Ol(t, i) {
          if (t < i) throw new Error("high < low");
          const s = this.Ki.$t(), n = (t - i) * this.Hl() / s, e2 = new wi(this.Al, [2, 2.5, 2]), r2 = new wi(this.Al, [2, 2, 2.5]), h2 = new wi(this.Al, [2.5, 2, 2]), a2 = [];
          return a2.push(e2.Ol(t, i, n), r2.Ol(t, i, n), h2.Ol(t, i, n)), (function(t2) {
            if (t2.length < 1) throw Error("array is empty");
            let i2 = t2[0];
            for (let s2 = 1; s2 < t2.length; ++s2) t2[s2] < i2 && (i2 = t2[s2]);
            return i2;
          })(a2);
        }
        Ul() {
          const t = this.Ki, i = t.Lt();
          if (null === i) return void (this.Nl = []);
          const s = t.$t(), n = this.Fl(s - 1, i), e2 = this.Fl(0, i), r2 = this.Ki.N().entireTextOnly ? this.$l() / 2 : 0, h2 = r2, a2 = s - 1 - r2, l2 = Math.max(n, e2), o2 = Math.min(n, e2);
          if (l2 === o2) return void (this.Nl = []);
          const _2 = this.Ol(l2, o2);
          if (this.ql(i, _2, l2, o2, h2, a2), t.jl() && this.Yl(_2, o2, l2)) {
            const t2 = this.Ki.Kl();
            this.Zl(i, _2, h2, a2, t2, 2 * t2);
          }
          const u2 = this.Nl.map(((t2) => t2.Gl)), c2 = this.Ki.Xl(u2);
          for (let t2 = 0; t2 < this.Nl.length; t2++) this.Nl[t2].Jl = c2[t2];
        }
        Vl() {
          return this.Nl;
        }
        $l() {
          return this.Ki.k();
        }
        Hl() {
          return Math.ceil(2.5 * this.$l());
        }
        ql(t, i, s, n, e2, r2) {
          const h2 = this.Nl, a2 = this.Ki;
          let l2 = s % i;
          l2 += l2 < 0 ? i : 0;
          const o2 = s >= n ? 1 : -1;
          let _2 = null, u2 = 0;
          for (let c2 = s - l2; c2 > n; c2 -= i) {
            const s2 = this.Wl(c2, t, true);
            null !== _2 && Math.abs(s2 - _2) < this.Hl() || (s2 < e2 || s2 > r2 || (u2 < h2.length ? (h2[u2].Pl = s2, h2[u2].Jl = a2.Ql(c2), h2[u2].Gl = c2) : h2.push({ Pl: s2, Jl: a2.Ql(c2), Gl: c2 }), u2++, _2 = s2, a2.io() && (i = this.Ol(c2 * o2, n))));
          }
          h2.length = u2;
        }
        Zl(t, i, s, n, e2, r2) {
          const h2 = this.Nl, a2 = this.so(t, s, e2, r2), l2 = this.so(t, n, -r2, -e2), o2 = this.Wl(0, t, true) - this.Wl(i, t, true);
          h2.length > 0 && h2[0].Pl - a2.Pl < o2 / 2 && h2.shift(), h2.length > 0 && l2.Pl - h2[h2.length - 1].Pl < o2 / 2 && h2.pop(), h2.unshift(a2), h2.push(l2);
        }
        so(t, i, s, n) {
          const e2 = (s + n) / 2, r2 = this.Fl(i + s, t), h2 = this.Fl(i + n, t), a2 = Math.min(r2, h2), l2 = Math.max(r2, h2), o2 = Math.max(0.1, this.Ol(l2, a2)), _2 = this.Fl(i + e2, t), u2 = _2 - _2 % o2, c2 = this.Wl(u2, t, true);
          return { Jl: this.Ki.Ql(u2), Pl: c2, Gl: u2 };
        }
        Yl(t, i, s) {
          let n = c(this.Ki.er());
          return this.Ki.io() && (n = vi(n, this.Ki.no())), n.Ze() - i < t && s - n.Ge() < t;
        }
      };
      !(function(t) {
        t[t.Normal = 0] = "Normal", t[t.Logarithmic = 1] = "Logarithmic", t[t.Percentage = 2] = "Percentage", t[t.IndexedTo100 = 3] = "IndexedTo100";
      })(bi || (bi = {}));
      Si = new st();
      xi = new it(100, 1);
      Ci = class {
        constructor(t, i, s, n, e2) {
          this.eo = 0, this.ro = null, this.sr = null, this.ho = null, this.ao = { lo: false, oo: null }, this._o = false, this.uo = 0, this.co = 0, this.do = new d(), this.fo = new d(), this.po = [], this.vo = null, this.mo = null, this.wo = null, this.Mo = null, this.bo = null, this.Ja = xi, this.So = mi(null), this.xo = t, this.Ps = i, this.Co = s, this.yo = n, this.ko = e2, this.Po = new gi(this, 100, this.To.bind(this), this.Ro.bind(this));
        }
        ol() {
          return this.xo;
        }
        N() {
          return this.Ps;
        }
        cr(t) {
          if (f(this.Ps, t), this._l(), void 0 !== t.mode && this.Do({ ae: t.mode }), void 0 !== t.scaleMargins) {
            const i = _(t.scaleMargins.top), s = _(t.scaleMargins.bottom);
            if (i < 0 || i > 1) throw new Error(`Invalid top margin - expect value between 0 and 1, given=${i}`);
            if (s < 0 || s > 1) throw new Error(`Invalid bottom margin - expect value between 0 and 1, given=${s}`);
            if (i + s > 1) throw new Error(`Invalid margins - sum of margins must be less than 1, given=${i + s}`);
            this.Io(), this.wo = null;
          }
        }
        Vo() {
          return this.Ps.autoScale;
        }
        Bo() {
          return this._o;
        }
        io() {
          return 1 === this.Ps.mode;
        }
        He() {
          return 2 === this.Ps.mode;
        }
        Eo() {
          return 3 === this.Ps.mode;
        }
        no() {
          return this.So;
        }
        ae() {
          return { ln: this.Ps.autoScale, Ao: this.Ps.invertScale, ae: this.Ps.mode };
        }
        Do(t) {
          const i = this.ae();
          let s = null;
          void 0 !== t.ln && (this.Ps.autoScale = t.ln), void 0 !== t.ae && (this.Ps.mode = t.ae, 2 !== t.ae && 3 !== t.ae || (this.Ps.autoScale = true), this.ao.lo = false), 1 === i.ae && t.ae !== i.ae && (!(function(t2, i2) {
            if (null === t2) return false;
            const s2 = fi(t2.Ze(), i2), n2 = fi(t2.Ge(), i2);
            return isFinite(s2) && isFinite(n2);
          })(this.sr, this.So) ? this.Ps.autoScale = true : (s = vi(this.sr, this.So), null !== s && this.Lo(s))), 1 === t.ae && t.ae !== i.ae && (s = pi(this.sr, this.So), null !== s && this.Lo(s));
          const n = i.ae !== this.Ps.mode;
          n && (2 === i.ae || this.He()) && this._l(), n && (3 === i.ae || this.Eo()) && this._l(), void 0 !== t.Ao && i.Ao !== t.Ao && (this.Ps.invertScale = t.Ao, this.zo()), this.fo.p(i, this.ae());
        }
        Oo() {
          return this.fo;
        }
        k() {
          return this.Co.fontSize;
        }
        $t() {
          return this.eo;
        }
        No(t) {
          this.eo !== t && (this.eo = t, this.Io(), this.wo = null);
        }
        Fo() {
          if (this.ro) return this.ro;
          const t = this.$t() - this.Wo() - this.Ho();
          return this.ro = t, t;
        }
        er() {
          return this.Uo(), this.sr;
        }
        Lo(t, i) {
          const s = this.sr;
          (i || null === s && null !== t || null !== s && !s.Ye(t)) && (this.wo = null, this.sr = t);
        }
        $o(t) {
          this.Lo(t), this.qo(null !== t);
        }
        Gi() {
          return this.Uo(), 0 === this.eo || !this.sr || this.sr.Gi();
        }
        jo(t) {
          return this.Ao() ? t : this.$t() - 1 - t;
        }
        Nt(t, i) {
          return this.He() ? t = oi(t, i) : this.Eo() && (t = ui(t, i)), this.Ro(t, i);
        }
        Yo(t, i, s) {
          this.Uo();
          const n = this.Ho(), e2 = u(this.er()), r2 = e2.Ze(), h2 = e2.Ge(), a2 = this.Fo() - 1, l2 = this.Ao(), o2 = a2 / (h2 - r2), _2 = void 0 === s ? 0 : s.from, c2 = void 0 === s ? t.length : s.to, d2 = this.Ko();
          for (let s2 = _2; s2 < c2; s2++) {
            const e3 = t[s2], h3 = e3.gt;
            if (isNaN(h3)) continue;
            let a3 = h3;
            null !== d2 && (a3 = d2(e3.gt, i));
            const _3 = n + o2 * (a3 - r2), u2 = l2 ? _3 : this.eo - 1 - _3;
            e3.ut = u2;
          }
        }
        Zo(t, i, s) {
          this.Uo();
          const n = this.Ho(), e2 = u(this.er()), r2 = e2.Ze(), h2 = e2.Ge(), a2 = this.Fo() - 1, l2 = this.Ao(), o2 = a2 / (h2 - r2), _2 = void 0 === s ? 0 : s.from, c2 = void 0 === s ? t.length : s.to, d2 = this.Ko();
          for (let s2 = _2; s2 < c2; s2++) {
            const e3 = t[s2];
            let h3 = e3.Hr, a3 = e3.Ur, _3 = e3.$r, u2 = e3.qr;
            null !== d2 && (h3 = d2(e3.Hr, i), a3 = d2(e3.Ur, i), _3 = d2(e3.$r, i), u2 = d2(e3.qr, i));
            let c3 = n + o2 * (h3 - r2), f2 = l2 ? c3 : this.eo - 1 - c3;
            e3.Go = f2, c3 = n + o2 * (a3 - r2), f2 = l2 ? c3 : this.eo - 1 - c3, e3.Xo = f2, c3 = n + o2 * (_3 - r2), f2 = l2 ? c3 : this.eo - 1 - c3, e3.Jo = f2, c3 = n + o2 * (u2 - r2), f2 = l2 ? c3 : this.eo - 1 - c3, e3.Qo = f2;
          }
        }
        Ds(t, i) {
          const s = this.To(t, i);
          return this.t_(s, i);
        }
        t_(t, i) {
          let s = t;
          return this.He() ? s = (function(t2, i2) {
            return i2 < 0 && (t2 = -t2), t2 / 100 * i2 + i2;
          })(s, i) : this.Eo() && (s = (function(t2, i2) {
            return t2 -= 100, i2 < 0 && (t2 = -t2), t2 / 100 * i2 + i2;
          })(s, i)), s;
        }
        Sl() {
          return this.po;
        }
        Dt() {
          return this.mo || (this.mo = Mi(this.po)), this.mo;
        }
        i_(t) {
          -1 === this.po.indexOf(t) && (this.po.push(t), this._l(), this.s_());
        }
        n_(t) {
          const i = this.po.indexOf(t);
          if (-1 === i) throw new Error("source is not attached to scale");
          this.po.splice(i, 1), 0 === this.po.length && (this.Do({ ln: true }), this.Lo(null)), this._l(), this.s_();
        }
        Lt() {
          let t = null;
          for (const i of this.po) {
            const s = i.Lt();
            null !== s && ((null === t || s.Ea < t.Ea) && (t = s));
          }
          return null === t ? null : t.Wt;
        }
        Ao() {
          return this.Ps.invertScale;
        }
        Vl() {
          const t = null === this.Lt();
          if (null !== this.wo && (t || this.wo.e_ === t)) return this.wo.Vl;
          this.Po.Ul();
          const i = this.Po.Vl();
          return this.wo = { Vl: i, e_: t }, this.do.p(), i;
        }
        r_() {
          return this.do;
        }
        h_(t) {
          this.He() || this.Eo() || null === this.Mo && null === this.ho && (this.Gi() || (this.Mo = this.eo - t, this.ho = u(this.er()).Ke()));
        }
        a_(t) {
          if (this.He() || this.Eo()) return;
          if (null === this.Mo) return;
          this.Do({ ln: false }), (t = this.eo - t) < 0 && (t = 0);
          let i = (this.Mo + 0.2 * (this.eo - 1)) / (t + 0.2 * (this.eo - 1));
          const s = u(this.ho).Ke();
          i = Math.max(i, 0.1), s.Je(i), this.Lo(s);
        }
        l_() {
          this.He() || this.Eo() || (this.Mo = null, this.ho = null);
        }
        o_(t) {
          this.Vo() || null === this.bo && null === this.ho && (this.Gi() || (this.bo = t, this.ho = u(this.er()).Ke()));
        }
        __(t) {
          if (this.Vo()) return;
          if (null === this.bo) return;
          const i = u(this.er()).Xe() / (this.Fo() - 1);
          let s = t - this.bo;
          this.Ao() && (s *= -1);
          const n = s * i, e2 = u(this.ho).Ke();
          e2.Qe(n), this.Lo(e2, true), this.wo = null;
        }
        u_() {
          this.Vo() || null !== this.bo && (this.bo = null, this.ho = null);
        }
        Xa() {
          return this.Ja || this._l(), this.Ja;
        }
        Ji(t, i) {
          switch (this.Ps.mode) {
            case 2:
              return this.c_(oi(t, i));
            case 3:
              return this.Xa().format(ui(t, i));
            default:
              return this.lr(t);
          }
        }
        Ql(t) {
          switch (this.Ps.mode) {
            case 2:
              return this.c_(t);
            case 3:
              return this.Xa().format(t);
            default:
              return this.lr(t);
          }
        }
        Xl(t) {
          switch (this.Ps.mode) {
            case 2:
              return this.d_(t);
            case 3:
              return this.Xa().formatTickmarks(t);
            default:
              return this.f_(t);
          }
        }
        Ma(t) {
          return this.lr(t, u(this.vo).Xa());
        }
        ba(t, i) {
          return t = oi(t, i), this.c_(t, Si);
        }
        p_() {
          return this.po;
        }
        v_(t) {
          this.ao = { oo: t, lo: false };
        }
        Ws() {
          this.po.forEach(((t) => t.Ws()));
        }
        jl() {
          return this.Ps.ensureEdgeTickMarksVisible && this.Vo();
        }
        Kl() {
          return this.k() / 2;
        }
        _l() {
          this.wo = null;
          let t = 1 / 0;
          this.vo = null;
          for (const i2 of this.po) i2._s() < t && (t = i2._s(), this.vo = i2);
          let i = 100;
          null !== this.vo && (i = Math.round(this.vo.qh())), this.Ja = xi, this.He() ? (this.Ja = Si, i = 100) : this.Eo() ? (this.Ja = new it(100, 1), i = 100) : null !== this.vo && (this.Ja = this.vo.Xa()), this.Po = new gi(this, i, this.To.bind(this), this.Ro.bind(this)), this.Po.Ul();
        }
        s_() {
          this.mo = null;
        }
        m_() {
          return null === this.vo || this.He() || this.Eo() ? 1 : 1 / this.vo.qh();
        }
        Xi() {
          return this.ko;
        }
        qo(t) {
          this._o = t;
        }
        Wo() {
          return this.Ao() ? this.Ps.scaleMargins.bottom * this.$t() + this.co : this.Ps.scaleMargins.top * this.$t() + this.uo;
        }
        Ho() {
          return this.Ao() ? this.Ps.scaleMargins.top * this.$t() + this.uo : this.Ps.scaleMargins.bottom * this.$t() + this.co;
        }
        Uo() {
          this.ao.lo || (this.ao.lo = true, this.w_());
        }
        Io() {
          this.ro = null;
        }
        Ro(t, i) {
          if (this.Uo(), this.Gi()) return 0;
          t = this.io() && t ? di(t, this.So) : t;
          const s = u(this.er()), n = this.Ho() + (this.Fo() - 1) * (t - s.Ze()) / s.Xe();
          return this.jo(n);
        }
        To(t, i) {
          if (this.Uo(), this.Gi()) return 0;
          const s = this.jo(t), n = u(this.er()), e2 = n.Ze() + n.Xe() * ((s - this.Ho()) / (this.Fo() - 1));
          return this.io() ? fi(e2, this.So) : e2;
        }
        zo() {
          this.wo = null, this.Po.Ul();
        }
        w_() {
          if (this.Bo() && !this.Vo()) return;
          const t = this.ao.oo;
          if (null === t) return;
          let i = null;
          const s = this.p_();
          let n = 0, e2 = 0;
          for (const r3 of s) {
            if (!r3.It()) continue;
            const s2 = r3.Lt();
            if (null === s2) continue;
            const h3 = r3.ra(t.Aa(), t.bi());
            let a2 = h3 && h3.er();
            if (null !== a2) {
              switch (this.Ps.mode) {
                case 1:
                  a2 = pi(a2, this.So);
                  break;
                case 2:
                  a2 = _i(a2, s2.Wt);
                  break;
                case 3:
                  a2 = ci(a2, s2.Wt);
              }
              if (i = null === i ? a2 : i.Sn(u(a2)), null !== h3) {
                const t2 = h3.rr();
                null !== t2 && (n = Math.max(n, t2.above), e2 = Math.max(e2, t2.below));
              }
            }
          }
          if (this.jl() && (n = Math.max(n, this.Kl()), e2 = Math.max(e2, this.Kl())), n === this.uo && e2 === this.co || (this.uo = n, this.co = e2, this.wo = null, this.Io()), null !== i) {
            if (i.Ze() === i.Ge()) {
              const t2 = 5 * this.m_();
              this.io() && (i = vi(i, this.So)), i = new mt(i.Ze() - t2, i.Ge() + t2), this.io() && (i = pi(i, this.So));
            }
            if (this.io()) {
              const t2 = vi(i, this.So), s2 = mi(t2);
              if (r2 = s2, h2 = this.So, r2.Bl !== h2.Bl || r2.El !== h2.El) {
                const n2 = null !== this.ho ? vi(this.ho, this.So) : null;
                this.So = s2, i = pi(t2, s2), null !== n2 && (this.ho = pi(n2, s2));
              }
            }
            this.Lo(i);
          } else null === this.sr && (this.Lo(new mt(-0.5, 0.5)), this.So = mi(null));
          var r2, h2;
        }
        Ko() {
          return this.He() ? oi : this.Eo() ? ui : this.io() ? (t) => di(t, this.So) : null;
        }
        g_(t, i, s) {
          return void 0 === i ? (void 0 === s && (s = this.Xa()), s.format(t)) : i(t);
        }
        M_(t, i, s) {
          return void 0 === i ? (void 0 === s && (s = this.Xa()), s.formatTickmarks(t)) : i(t);
        }
        lr(t, i) {
          return this.g_(t, this.yo.priceFormatter, i);
        }
        f_(t, i) {
          const s = this.yo.priceFormatter;
          return this.M_(t, this.yo.tickmarksPriceFormatter ?? (s ? (t2) => t2.map(s) : void 0), i);
        }
        c_(t, i) {
          return this.g_(t, this.yo.percentageFormatter, i);
        }
        d_(t, i) {
          const s = this.yo.percentageFormatter;
          return this.M_(t, this.yo.tickmarksPercentageFormatter ?? (s ? (t2) => t2.map(s) : void 0), i);
        }
      };
      ki = class {
        constructor(t, i) {
          this.po = [], this.b_ = /* @__PURE__ */ new Map(), this.eo = 0, this.S_ = 0, this.x_ = 1, this.mo = null, this.C_ = false, this.y_ = new d(), this.ua = [], this.Jh = t, this.ns = i, this.k_ = new ai(this);
          const s = i.N();
          this.P_ = this.T_("left", s.leftPriceScale), this.R_ = this.T_("right", s.rightPriceScale), this.P_.Oo().i(this.D_.bind(this, this.P_), this), this.R_.Oo().i(this.D_.bind(this, this.R_), this), this.I_(s);
        }
        I_(t) {
          if (t.leftPriceScale && this.P_.cr(t.leftPriceScale), t.rightPriceScale && this.R_.cr(t.rightPriceScale), t.localization && (this.P_._l(), this.R_._l()), t.overlayPriceScales) {
            const i = Array.from(this.b_.values());
            for (const s of i) {
              const i2 = u(s[0].Ft());
              i2.cr(t.overlayPriceScales), t.localization && i2._l();
            }
          }
        }
        V_(t) {
          switch (t) {
            case "left":
              return this.P_;
            case "right":
              return this.R_;
          }
          return this.b_.has(t) ? _(this.b_.get(t))[0].Ft() : null;
        }
        m() {
          this.Qt().B_().u(this), this.P_.Oo().u(this), this.R_.Oo().u(this), this.po.forEach(((t) => {
            t.m && t.m();
          })), this.ua = this.ua.filter(((t) => {
            const i = t.Gh();
            return i.detached && i.detached(), false;
          })), this.y_.p();
        }
        E_() {
          return this.x_;
        }
        A_(t) {
          this.x_ = t;
        }
        Qt() {
          return this.ns;
        }
        ss() {
          return this.S_;
        }
        $t() {
          return this.eo;
        }
        L_(t) {
          this.S_ = t, this.z_();
        }
        No(t) {
          this.eo = t, this.P_.No(t), this.R_.No(t), this.po.forEach(((i) => {
            if (this.Zn(i)) {
              const s = i.Ft();
              null !== s && s.No(t);
            }
          })), this.z_();
        }
        O_(t) {
          this.C_ = t;
        }
        N_() {
          return this.C_;
        }
        F_() {
          return this.po.filter(yi);
        }
        Sl() {
          return this.po;
        }
        Zn(t) {
          const i = t.Ft();
          return null === i || this.P_ !== i && this.R_ !== i;
        }
        i_(t, i, s) {
          this.W_(t, i, s ? t._s() : this.po.length);
        }
        n_(t, i) {
          const s = this.po.indexOf(t);
          o(-1 !== s, "removeDataSource: invalid data source"), this.po.splice(s, 1), i || this.po.forEach(((t2, i2) => t2.us(i2)));
          const n = u(t.Ft()).ol();
          if (this.b_.has(n)) {
            const i2 = _(this.b_.get(n)), s2 = i2.indexOf(t);
            -1 !== s2 && (i2.splice(s2, 1), 0 === i2.length && this.b_.delete(n));
          }
          const e2 = t.Ft();
          e2 && e2.Sl().indexOf(t) >= 0 && (e2.n_(t), this.H_(e2)), this.mo = null;
        }
        Xn(t) {
          return t === this.P_ ? "left" : t === this.R_ ? "right" : "overlay";
        }
        U_() {
          return this.P_;
        }
        q_() {
          return this.R_;
        }
        j_(t, i) {
          t.h_(i);
        }
        Y_(t, i) {
          t.a_(i), this.z_();
        }
        K_(t) {
          t.l_();
        }
        Z_(t, i) {
          t.o_(i);
        }
        G_(t, i) {
          t.__(i), this.z_();
        }
        X_(t) {
          t.u_();
        }
        z_() {
          this.po.forEach(((t) => {
            t.Ws();
          }));
        }
        Rs() {
          let t = null;
          return this.ns.N().rightPriceScale.visible && 0 !== this.R_.Sl().length ? t = this.R_ : this.ns.N().leftPriceScale.visible && 0 !== this.P_.Sl().length ? t = this.P_ : 0 !== this.po.length && (t = this.po[0].Ft()), null === t && (t = this.R_), t;
        }
        Gn() {
          let t = null;
          return this.ns.N().rightPriceScale.visible ? t = this.R_ : this.ns.N().leftPriceScale.visible && (t = this.P_), t;
        }
        H_(t) {
          null !== t && t.Vo() && this.J_(t);
        }
        Q_(t) {
          const i = this.Jh.Ie();
          t.Do({ ln: true }), null !== i && t.v_(i), this.z_();
        }
        tu() {
          this.J_(this.P_), this.J_(this.R_);
        }
        iu() {
          this.H_(this.P_), this.H_(this.R_), this.po.forEach(((t) => {
            this.Zn(t) && this.H_(t.Ft());
          })), this.z_(), this.ns.dr();
        }
        Dt() {
          return null === this.mo && (this.mo = Mi(this.po)), this.mo;
        }
        su(t, i) {
          i = si(i, 0, this.po.length - 1);
          const s = this.po.indexOf(t);
          o(-1 !== s, "setSeriesOrder: invalid data source"), this.po.splice(s, 1), this.po.splice(i, 0, t), this.po.forEach(((t2, i2) => t2.us(i2))), this.mo = null;
          for (const t2 of [this.P_, this.R_]) t2.s_(), t2._l();
          this.ns.dr();
        }
        Vt() {
          return this.Dt().filter(yi);
        }
        nu() {
          return this.y_;
        }
        eu() {
          return this.k_;
        }
        nl(t) {
          this.ua.push(new Ft(t));
        }
        el(t) {
          this.ua = this.ua.filter(((i) => i.Gh() !== t)), t.detached && t.detached(), this.ns.dr();
        }
        ru() {
          return this.ua;
        }
        Za(t, i) {
          return this.ua.map(((s) => s.Qn(t, i))).filter(((t2) => null !== t2));
        }
        J_(t) {
          const i = t.p_();
          if (i && i.length > 0 && !this.Jh.Gi()) {
            const i2 = this.Jh.Ie();
            null !== i2 && t.v_(i2);
          }
          t.Ws();
        }
        W_(t, i, s) {
          let n = this.V_(i);
          if (null === n && (n = this.T_(i, this.ns.N().overlayPriceScales)), this.po.splice(s, 0, t), !G(i)) {
            const s2 = this.b_.get(i) || [];
            s2.push(t), this.b_.set(i, s2);
          }
          t.us(s), n.i_(t), t.cs(n), this.H_(n), this.mo = null;
        }
        D_(t, i, s) {
          i.ae !== s.ae && this.J_(t);
        }
        T_(t, i) {
          const s = { visible: true, autoScale: true, ...g(i) }, n = new Ci(t, s, this.ns.N().layout, this.ns.N().localization, this.ns.Xi());
          return n.No(this.$t()), n;
        }
      };
      Ii = class {
        constructor(t, i, s = 50) {
          this.Vn = 0, this.Bn = 1, this.En = 1, this.Ln = /* @__PURE__ */ new Map(), this.An = /* @__PURE__ */ new Map(), this.uu = t, this.cu = i, this.zn = s;
        }
        du(t) {
          const i = t.time, s = this.cu.cacheKey(i), n = this.Ln.get(s);
          if (void 0 !== n) return n.fu;
          if (this.Vn === this.zn) {
            const t2 = this.An.get(this.En);
            this.An.delete(this.En), this.Ln.delete(_(t2)), this.En++, this.Vn--;
          }
          const e2 = this.uu(t);
          return this.Ln.set(s, { fu: e2, Wn: this.Bn }), this.An.set(this.Bn, s), this.Vn++, this.Bn++, e2;
        }
      };
      Vi = class {
        constructor(t, i) {
          o(t <= i, "right should be >= left"), this.pu = t, this.vu = i;
        }
        Aa() {
          return this.pu;
        }
        bi() {
          return this.vu;
        }
        mu() {
          return this.vu - this.pu + 1;
        }
        Ee(t) {
          return this.pu <= t && t <= this.vu;
        }
        Ye(t) {
          return this.pu === t.Aa() && this.vu === t.bi();
        }
      };
      Ei = class {
        constructor() {
          this.wu = /* @__PURE__ */ new Map(), this.Ln = null, this.gu = false;
        }
        Mu(t) {
          this.gu = t, this.Ln = null;
        }
        bu(t, i) {
          this.Su(i), this.Ln = null;
          for (let s = i; s < t.length; ++s) {
            const i2 = t[s];
            let n = this.wu.get(i2.timeWeight);
            void 0 === n && (n = [], this.wu.set(i2.timeWeight, n)), n.push({ index: s, time: i2.time, weight: i2.timeWeight, originalTime: i2.originalTime });
          }
        }
        xu(t, i, s, n, e2) {
          const r2 = Math.ceil(i / t);
          return null !== this.Ln && this.Ln.Cu === r2 && e2 === this.Ln.yu && s === this.Ln.ku || (this.Ln = { yu: e2, ku: s, Vl: this.Pu(r2, s, n), Cu: r2 }), this.Ln.Vl;
        }
        Su(t) {
          if (0 === t) return void this.wu.clear();
          const i = [];
          this.wu.forEach(((s, n) => {
            t <= s[0].index ? i.push(n) : s.splice(Rt(s, t, ((i2) => i2.index < t)), 1 / 0);
          }));
          for (const t2 of i) this.wu.delete(t2);
        }
        Pu(t, i, s) {
          let n = [];
          const e2 = (t2) => !i || s.has(t2.index);
          for (const i2 of Array.from(this.wu.keys()).sort(((t2, i3) => i3 - t2))) {
            if (!this.wu.get(i2)) continue;
            const s2 = n;
            n = [];
            const r2 = s2.length;
            let h2 = 0;
            const a2 = _(this.wu.get(i2)), l2 = a2.length;
            let o2 = 1 / 0, u2 = -1 / 0;
            for (let i3 = 0; i3 < l2; i3++) {
              const l3 = a2[i3], _2 = l3.index;
              for (; h2 < r2; ) {
                const t2 = s2[h2], i4 = t2.index;
                if (!(i4 < _2 && e2(t2))) {
                  o2 = i4;
                  break;
                }
                h2++, n.push(t2), u2 = i4, o2 = 1 / 0;
              }
              if (o2 - _2 >= t && _2 - u2 >= t && e2(l3)) n.push(l3), u2 = _2;
              else if (this.gu) return s2;
            }
            for (; h2 < r2; h2++) e2(s2[h2]) && n.push(s2[h2]);
          }
          return n;
        }
      };
      Ai = class _Ai {
        constructor(t) {
          this.Tu = t;
        }
        Ru() {
          return null === this.Tu ? null : new Vi(Math.floor(this.Tu.Aa()), Math.ceil(this.Tu.bi()));
        }
        Du() {
          return this.Tu;
        }
        static Iu() {
          return new _Ai(null);
        }
      };
      zi = class {
        constructor(t, i, s, n) {
          this.S_ = 0, this.Vu = null, this.Bu = [], this.bo = null, this.Mo = null, this.Eu = new Ei(), this.Au = /* @__PURE__ */ new Map(), this.Lu = Ai.Iu(), this.zu = true, this.Ou = new d(), this.Nu = new d(), this.Fu = new d(), this.Wu = null, this.Hu = null, this.Uu = /* @__PURE__ */ new Map(), this.$u = -1, this.qu = [], this.ju = 1, this.Ps = i, this.yo = s, this.Yu = i.rightOffset, this.Ku = i.barSpacing, this.ns = t, this.Zu(i), this.cu = n, this.Gu(), this.Eu.Mu(i.uniformDistribution), this.Xu(), this.Ju();
        }
        N() {
          return this.Ps;
        }
        Qu(t) {
          f(this.yo, t), this.tc(), this.Gu();
        }
        cr(t, i) {
          f(this.Ps, t), this.Ps.fixLeftEdge && this.sc(), this.Ps.fixRightEdge && this.nc(), void 0 !== t.barSpacing && this.ns.gn(t.barSpacing), void 0 !== t.rightOffset && this.ns.Mn(t.rightOffset), this.Zu(t), void 0 === t.minBarSpacing && void 0 === t.maxBarSpacing || this.ns.gn(t.barSpacing ?? this.Ku), void 0 !== t.ignoreWhitespaceIndices && t.ignoreWhitespaceIndices !== this.Ps.ignoreWhitespaceIndices && this.Ju(), this.tc(), this.Gu(), void 0 === t.enableConflation && void 0 === t.conflationThresholdFactor || this.Xu(), this.Fu.p();
        }
        Is(t) {
          return this.Bu[t]?.time ?? null;
        }
        es(t) {
          return this.Bu[t] ?? null;
        }
        ec(t, i) {
          if (this.Bu.length < 1) return null;
          if (this.cu.key(t) > this.cu.key(this.Bu[this.Bu.length - 1].time)) return i ? this.Bu.length - 1 : null;
          const s = Rt(this.Bu, this.cu.key(t), ((t2, i2) => this.cu.key(t2.time) < i2));
          return this.cu.key(t) < this.cu.key(this.Bu[s].time) ? i ? s : null : s;
        }
        Gi() {
          return 0 === this.S_ || 0 === this.Bu.length || null === this.Vu;
        }
        rc() {
          return this.Bu.length > 0;
        }
        Ie() {
          return this.hc(), this.Lu.Ru();
        }
        ac() {
          return this.hc(), this.Lu.Du();
        }
        lc() {
          const t = this.Ie();
          if (null === t) return null;
          const i = { from: t.Aa(), to: t.bi() };
          return this.oc(i);
        }
        oc(t) {
          const i = Math.round(t.from), s = Math.round(t.to), n = u(this._c()), e2 = u(this.uc());
          return { from: u(this.es(Math.max(n, i))), to: u(this.es(Math.min(e2, s))) };
        }
        cc(t) {
          return { from: u(this.ec(t.from, true)), to: u(this.ec(t.to, true)) };
        }
        ss() {
          return this.S_;
        }
        L_(t) {
          if (!isFinite(t) || t <= 0) return;
          if (this.S_ === t) return;
          const i = this.ac(), s = this.S_;
          if (this.S_ = t, this.zu = true, this.Ps.lockVisibleTimeRangeOnResize && 0 !== s) {
            const i2 = this.Ku * t / s;
            this.Ku = i2;
          }
          if (this.Ps.fixLeftEdge && null !== i && i.Aa() <= 0) {
            const i2 = s - t;
            this.Yu -= Math.round(i2 / this.Ku) + 1, this.zu = true;
          }
          this.dc(), this.fc();
        }
        qt(t) {
          if (this.Gi() || !v(t)) return 0;
          const i = this.vc() + this.Yu - t;
          return this.S_ - (i + 0.5) * this.Ku - 1;
        }
        mc(t, i) {
          const s = this.vc(), n = void 0 === i ? 0 : i.from, e2 = void 0 === i ? t.length : i.to;
          for (let i2 = n; i2 < e2; i2++) {
            const n2 = t[i2].wt, e3 = s + this.Yu - n2, r2 = this.S_ - (e3 + 0.5) * this.Ku - 1;
            t[i2]._t = r2;
          }
        }
        wc(t, i) {
          const s = Math.ceil(this.gc(t));
          return i && this.Ps.ignoreWhitespaceIndices && !this.Mc(s) ? this.bc(s) : s;
        }
        Mn(t) {
          this.zu = true, this.Yu = t, this.fc(), this.ns.Sc(), this.ns.dr();
        }
        ul() {
          return this.Ku;
        }
        gn(t) {
          const i = this.Ku;
          if (this.xc(t), void 0 !== this.Ps.rightOffsetPixels && 0 !== i) {
            const t2 = this.Yu * i / this.Ku;
            this.Yu = t2;
          }
          this.fc(), this.ns.Sc(), this.ns.dr();
        }
        Cc() {
          return this.Yu;
        }
        Vl() {
          if (this.Gi()) return null;
          if (null !== this.Hu) return this.Hu;
          const t = this.Ku, i = 5 * (this.ns.N().layout.fontSize + 4) / 8 * (this.Ps.tickMarkMaxCharacterLength || 8), s = Math.round(i / t), n = u(this.Ie()), e2 = Math.max(n.Aa(), n.Aa() - s), r2 = Math.max(n.bi(), n.bi() - s), h2 = this.Eu.xu(t, i, this.Ps.ignoreWhitespaceIndices, this.Uu, this.$u), a2 = this._c() + s, l2 = this.uc() - s, o2 = this.yc(), _2 = this.Ps.fixLeftEdge || o2, c2 = this.Ps.fixRightEdge || o2;
          let d2 = 0;
          for (const t2 of h2) {
            if (!(e2 <= t2.index && t2.index <= r2)) continue;
            let s2;
            d2 < this.qu.length ? (s2 = this.qu[d2], s2.coord = this.qt(t2.index), s2.label = this.kc(t2), s2.weight = t2.weight) : (s2 = { needAlignCoordinate: false, coord: this.qt(t2.index), label: this.kc(t2), weight: t2.weight }, this.qu.push(s2)), this.Ku > i / 2 && !o2 ? s2.needAlignCoordinate = false : s2.needAlignCoordinate = _2 && t2.index <= a2 || c2 && t2.index >= l2, d2++;
          }
          return this.qu.length = d2, this.Hu = this.qu, this.qu;
        }
        Pc() {
          let t;
          this.zu = true, this.gn(this.Ps.barSpacing), t = void 0 !== this.Ps.rightOffsetPixels ? this.Ps.rightOffsetPixels / this.ul() : this.Ps.rightOffset, this.Mn(t);
        }
        Tc(t) {
          this.zu = true, this.Vu = t, this.fc(), this.sc();
        }
        Rc(t, i) {
          const s = this.gc(t), n = this.ul(), e2 = n + i * (n / 10);
          this.gn(e2), this.Ps.rightBarStaysOnScroll || this.Mn(this.Cc() + (s - this.gc(t)));
        }
        h_(t) {
          this.bo && this.u_(), null === this.Mo && null === this.Wu && (this.Gi() || (this.Mo = t, this.Dc()));
        }
        a_(t) {
          if (null === this.Wu) return;
          const i = si(this.S_ - t, 0, this.S_), s = si(this.S_ - u(this.Mo), 0, this.S_);
          0 !== i && 0 !== s && this.gn(this.Wu.ul * i / s);
        }
        l_() {
          null !== this.Mo && (this.Mo = null, this.Ic());
        }
        o_(t) {
          null === this.bo && null === this.Wu && (this.Gi() || (this.bo = t, this.Dc()));
        }
        __(t) {
          if (null === this.bo) return;
          const i = (this.bo - t) / this.ul();
          this.Yu = u(this.Wu).Cc + i, this.zu = true, this.fc();
        }
        u_() {
          null !== this.bo && (this.bo = null, this.Ic());
        }
        Vc() {
          this.Bc(this.Ps.rightOffset);
        }
        Bc(t, i = 400) {
          if (!isFinite(t)) throw new RangeError("offset is required and must be finite number");
          if (!isFinite(i) || i <= 0) throw new RangeError("animationDuration (optional) must be finite positive number");
          const s = this.Yu, n = performance.now();
          this.ns.vn({ Ec: (t2) => (t2 - n) / i >= 1, Ac: (e2) => {
            const r2 = (e2 - n) / i;
            return r2 >= 1 ? t : s + (t - s) * r2;
          } });
        }
        kt(t, i) {
          this.zu = true, this.Bu = t, this.Eu.bu(t, i), this.fc();
        }
        Lc() {
          return this.Ou;
        }
        zc() {
          return this.Nu;
        }
        Oc() {
          return this.Fu;
        }
        vc() {
          return this.Vu || 0;
        }
        Nc(t, i) {
          const s = t.mu(), n = i && this.Ps.rightOffsetPixels || 0;
          this.xc((this.S_ - n) / s), this.Yu = t.bi() - this.vc(), i && (this.Yu = n ? n / this.ul() : this.Ps.rightOffset), this.fc(), this.zu = true, this.ns.Sc(), this.ns.dr();
        }
        Fc() {
          const t = this._c(), i = this.uc();
          if (null === t || null === i) return;
          const s = !this.Ps.rightOffsetPixels && this.Ps.rightOffset || 0;
          this.Nc(new Vi(t, i + s), true);
        }
        Wc(t) {
          const i = new Vi(t.from, t.to);
          this.Nc(i);
        }
        rs(t) {
          return void 0 !== this.yo.timeFormatter ? this.yo.timeFormatter(t.originalTime) : this.cu.formatHorzItem(t.time);
        }
        Ju() {
          if (!this.Ps.ignoreWhitespaceIndices) return;
          this.Uu.clear();
          const t = this.ns.tn();
          for (const i of t) for (const t2 of i.ll()) this.Uu.set(t2, true);
          this.$u++;
        }
        Hc() {
          return this.ju;
        }
        vl() {
          const t = 1 / (window.devicePixelRatio || 1), i = this.Ps.minBarSpacing;
          if (i >= t) return [1];
          const s = [1];
          let n = 2;
          for (; n <= 512; ) {
            i < t / n && s.push(n), n *= 2;
          }
          return s;
        }
        yc() {
          const t = this.ns.N().handleScroll, i = this.ns.N().handleScale;
          return !(t.horzTouchDrag || t.mouseWheel || t.pressedMouseMove || t.vertTouchDrag || i.axisDoubleClickReset.time || i.axisPressedMouseMove.time || i.mouseWheel || i.pinch);
        }
        _c() {
          return 0 === this.Bu.length ? null : 0;
        }
        uc() {
          return 0 === this.Bu.length ? null : this.Bu.length - 1;
        }
        Uc(t) {
          return (this.S_ - 1 - t) / this.Ku;
        }
        gc(t) {
          const i = this.Uc(t), s = this.vc() + this.Yu - i;
          return Math.round(1e6 * s) / 1e6;
        }
        xc(t) {
          const i = this.Ku;
          this.Ku = t, this.dc(), i !== this.Ku && (this.zu = true, this.$c(), this.Xu());
        }
        hc() {
          if (!this.zu) return;
          if (this.zu = false, this.Gi()) return void this.qc(Ai.Iu());
          const t = this.vc(), i = this.S_ / this.Ku, s = this.Yu + t, n = new Vi(s - i + 1, s);
          this.qc(new Ai(n));
        }
        dc() {
          const t = si(this.Ku, this.jc(), this.Yc());
          this.Ku !== t && (this.Ku = t, this.zu = true);
        }
        Yc() {
          return this.Ps.maxBarSpacing > 0 ? this.Ps.maxBarSpacing : 0.5 * this.S_;
        }
        jc() {
          return this.Ps.fixLeftEdge && this.Ps.fixRightEdge && 0 !== this.Bu.length ? this.S_ / this.Bu.length : this.Ps.minBarSpacing;
        }
        Xu() {
          if (!this.Ps.enableConflation) return void (this.ju = 1);
          const t = 1 / (window.devicePixelRatio || 1) * (this.Ps.conflationThresholdFactor ?? 1);
          if (this.Ku >= t) return void (this.ju = 1);
          const i = t / this.Ku, s = Math.pow(2, Math.floor(Math.log2(i)));
          this.ju = Math.min(s, 512);
        }
        fc() {
          const t = this.Kc();
          null !== t && this.Yu < t && (this.Yu = t, this.zu = true);
          const i = this.Zc();
          this.Yu > i && (this.Yu = i, this.zu = true);
        }
        Kc() {
          const t = this._c(), i = this.Vu;
          if (null === t || null === i) return null;
          return t - i - 1 + (this.Ps.fixLeftEdge ? this.S_ / this.Ku : Math.min(2, this.Bu.length));
        }
        Zc() {
          return this.Ps.fixRightEdge ? 0 : this.S_ / this.Ku - Math.min(2, this.Bu.length);
        }
        Dc() {
          this.Wu = { ul: this.ul(), Cc: this.Cc() };
        }
        Ic() {
          this.Wu = null;
        }
        kc(t) {
          let i = this.Au.get(t.weight);
          return void 0 === i && (i = new Ii(((t2) => this.Gc(t2)), this.cu), this.Au.set(t.weight, i)), i.du(t);
        }
        Gc(t) {
          return this.cu.formatTickmark(t, this.yo);
        }
        qc(t) {
          const i = this.Lu;
          this.Lu = t, Bi(i.Ru(), this.Lu.Ru()) || this.Ou.p(), Bi(i.Du(), this.Lu.Du()) || this.Nu.p(), this.$c();
        }
        $c() {
          this.Hu = null;
        }
        tc() {
          this.$c(), this.Au.clear();
        }
        Gu() {
          this.cu.updateFormatter(this.yo);
        }
        sc() {
          if (!this.Ps.fixLeftEdge) return;
          const t = this._c();
          if (null === t) return;
          const i = this.Ie();
          if (null === i) return;
          const s = i.Aa() - t;
          if (s < 0) {
            const t2 = this.Yu - s - 1;
            this.Mn(t2);
          }
          this.dc();
        }
        nc() {
          this.fc(), this.dc();
        }
        Mc(t) {
          return !this.Ps.ignoreWhitespaceIndices || (this.Uu.get(t) || false);
        }
        bc(t) {
          const i = (function* (t2) {
            const i2 = Math.round(t2), s2 = i2 < t2;
            let n = 1;
            for (; ; ) s2 ? (yield i2 + n, yield i2 - n) : (yield i2 - n, yield i2 + n), n++;
          })(t), s = this.uc();
          for (; s; ) {
            const t2 = i.next().value;
            if (this.Uu.get(t2)) return t2;
            if (t2 < 0 || t2 > s) break;
          }
          return t;
        }
        Zu(t) {
          if (void 0 !== t.rightOffsetPixels) {
            const i = t.rightOffsetPixels / (t.barSpacing || this.Ku);
            this.ns.Mn(i);
          }
        }
      };
      !(function(t) {
        t[t.OnTouchEnd = 0] = "OnTouchEnd", t[t.OnNextTap = 1] = "OnNextTap";
      })(Oi || (Oi = {}));
      Ui = class {
        constructor(t, i, s) {
          this.Xc = [], this.Jc = [], this.Qc = null, this.S_ = 0, this.td = null, this.sd = new d(), this.nd = new d(), this.ed = null, this.rd = t, this.Ps = i, this.cu = s, this.ko = new P(this.Ps.layout.colorParsers), this.hd = new C(this), this.Jh = new zi(this, i.timeScale, this.Ps.localization, s), this.Ct = new Z(this, i.crosshair), this.ad = new ii(i.crosshair), i.addDefaultPane && (this.ld(0), this.Xc[0].A_(2)), this.od = this._d(0), this.ud = this._d(1);
        }
        Ca() {
          this.dd(X.yn());
        }
        dr() {
          this.dd(X.Cn());
        }
        Ua() {
          this.dd(new X(1));
        }
        ya(t) {
          const i = this.fd(t);
          this.dd(i);
        }
        pd() {
          return this.td;
        }
        vd(t) {
          if (this.td?.hu === t?.hu && this.td?.au?.te === t?.au?.te) return;
          const i = this.td;
          this.td = t, null !== i && this.ya(i.hu), null !== t && t.hu !== i?.hu && this.ya(t.hu);
        }
        N() {
          return this.Ps;
        }
        cr(t) {
          f(this.Ps, t), this.Xc.forEach(((i) => i.I_(t))), void 0 !== t.timeScale && this.Jh.cr(t.timeScale), void 0 !== t.localization && this.Jh.Qu(t.localization), (t.leftPriceScale || t.rightPriceScale) && this.sd.p(), this.od = this._d(0), this.ud = this._d(1), this.Ca();
        }
        md(t, i, s = 0) {
          const n = this.Xc[s];
          if (void 0 === n) return;
          if ("left" === t) return f(this.Ps, { leftPriceScale: i }), n.I_({ leftPriceScale: i }), this.sd.p(), void this.Ca();
          if ("right" === t) return f(this.Ps, { rightPriceScale: i }), n.I_({ rightPriceScale: i }), this.sd.p(), void this.Ca();
          const e2 = this.wd(t, s);
          null !== e2 && (e2.Ft.cr(i), this.sd.p());
        }
        wd(t, i) {
          const s = this.Xc[i];
          if (void 0 === s) return null;
          const n = s.V_(t);
          return null !== n ? { Gs: s, Ft: n } : null;
        }
        Et() {
          return this.Jh;
        }
        Xs() {
          return this.Xc;
        }
        gd() {
          return this.Ct;
        }
        Md() {
          return this.nd;
        }
        bd(t, i) {
          t.No(i), this.Sc();
        }
        L_(t) {
          this.S_ = t, this.Jh.L_(this.S_), this.Xc.forEach(((i) => i.L_(t))), this.Sc();
        }
        Sd(t) {
          1 !== this.Xc.length && (o(t >= 0 && t < this.Xc.length, "Invalid pane index"), this.Xc.splice(t, 1), this.Ca());
        }
        xd(t, i) {
          if (this.Xc.length < 2) return;
          o(t >= 0 && t < this.Xc.length, "Invalid pane index");
          const s = this.Xc[t], n = this.Xc.reduce(((t2, i2) => t2 + i2.E_()), 0), e2 = this.Xc.reduce(((t2, i2) => t2 + i2.$t()), 0), r2 = e2 - 30 * (this.Xc.length - 1);
          i = Math.min(r2, Math.max(30, i));
          const h2 = n / e2, a2 = s.$t();
          s.A_(i * h2);
          let l2 = i - a2, _2 = this.Xc.length - 1;
          for (const t2 of this.Xc) if (t2 !== s) {
            const i2 = Math.min(r2, Math.max(30, t2.$t() - l2 / _2));
            l2 -= t2.$t() - i2, _2 -= 1;
            const s2 = i2 * h2;
            t2.A_(s2);
          }
          this.Ca();
        }
        Cd(t, i) {
          o(t >= 0 && t < this.Xc.length && i >= 0 && i < this.Xc.length, "Invalid pane index");
          const s = this.Xc[t], n = this.Xc[i];
          this.Xc[t] = n, this.Xc[i] = s, this.Ca();
        }
        yd(t, i) {
          if (o(t >= 0 && t < this.Xc.length && i >= 0 && i < this.Xc.length, "Invalid pane index"), t === i) return;
          const [s] = this.Xc.splice(t, 1);
          this.Xc.splice(i, 0, s), this.Ca();
        }
        j_(t, i, s) {
          t.j_(i, s);
        }
        Y_(t, i, s) {
          t.Y_(i, s), this.ka(), this.dd(this.kd(t, 2));
        }
        K_(t, i) {
          t.K_(i), this.dd(this.kd(t, 2));
        }
        Z_(t, i, s) {
          i.Vo() || t.Z_(i, s);
        }
        G_(t, i, s) {
          i.Vo() || (t.G_(i, s), this.ka(), this.dd(this.kd(t, 2)));
        }
        X_(t, i) {
          i.Vo() || (t.X_(i), this.dd(this.kd(t, 2)));
        }
        Q_(t, i) {
          t.Q_(i), this.dd(this.kd(t, 2));
        }
        Pd(t) {
          this.Jh.h_(t);
        }
        Td(t, i) {
          const s = this.Et();
          if (s.Gi() || 0 === i) return;
          const n = s.ss();
          t = Math.max(1, Math.min(t, n)), s.Rc(t, i), this.Sc();
        }
        Rd(t) {
          this.Dd(0), this.Id(t), this.Vd();
        }
        Bd(t) {
          this.Jh.a_(t), this.Sc();
        }
        Ed() {
          this.Jh.l_(), this.dr();
        }
        Dd(t) {
          this.Jh.o_(t);
        }
        Id(t) {
          this.Jh.__(t), this.Sc();
        }
        Vd() {
          this.Jh.u_(), this.dr();
        }
        tn() {
          return this.Jc;
        }
        Us() {
          return null === this.Qc && (this.Qc = this.Jc.filter(((t) => t.It()))), this.Qc;
        }
        xa() {
          this.Qc = null;
        }
        Ad(t, i, s, n, e2) {
          this.Ct.Bs(t, i);
          let r2 = NaN, h2 = this.Jh.wc(t, true);
          const a2 = this.Jh.Ie();
          null !== a2 && (h2 = Math.min(Math.max(a2.Aa(), h2), a2.bi())), h2 = this.Ct.Hs(h2);
          const l2 = n.Rs(), o2 = l2.Lt();
          if (null !== o2 && (r2 = l2.Ds(i, o2)), r2 = this.ad.bl(r2, h2, n), this.Ct.zs(h2, r2, n), this.Ua(), !e2) {
            const e3 = Di(n, t, i);
            this.vd(e3 && { hu: e3.hu, au: e3.au, ou: e3.ou || null }), this.nd.p(this.Ct.Bt(), { x: t, y: i }, s);
          }
        }
        Ld(t, i, s) {
          const n = s.Rs(), e2 = n.Lt(), r2 = n.Nt(t, u(e2)), h2 = this.Jh.ec(i, true), a2 = this.Jh.qt(u(h2));
          this.Ad(a2, r2, null, s, true);
        }
        zd(t) {
          this.gd().Ns(), this.Ua(), t || this.nd.p(null, null, null);
        }
        ka() {
          const t = this.Ct.Gs();
          if (null !== t) {
            const i = this.Ct.As(), s = this.Ct.Ls();
            this.Ad(i, s, null, t);
          }
          this.Ct.Ws();
        }
        Od(t, i, s) {
          const n = this.Jh.Is(0);
          void 0 !== i && void 0 !== s && this.Jh.kt(i, s);
          const e2 = this.Jh.Is(0), r2 = this.Jh.vc(), h2 = this.Jh.Ie();
          if (null !== h2 && null !== n && null !== e2) {
            const i2 = h2.Ee(r2), a2 = this.cu.key(n) > this.cu.key(e2), l2 = null !== t && t > r2 && !a2, o2 = this.Jh.N().allowShiftVisibleRangeOnWhitespaceReplacement, _2 = i2 && (!(void 0 === s) || o2) && this.Jh.N().shiftVisibleRangeOnNewBar;
            if (l2 && !_2) {
              const i3 = t - r2;
              this.Jh.Mn(this.Jh.Cc() - i3);
            }
          }
          this.Jh.Tc(t);
        }
        Ra(t) {
          null !== t && t.iu();
        }
        Kn(t) {
          if ((function(t2) {
            return t2 instanceof ki;
          })(t)) return t;
          const i = this.Xc.find(((i2) => i2.Dt().includes(t)));
          return void 0 === i ? null : i;
        }
        Sc() {
          this.Xc.forEach(((t) => t.iu())), this.ka();
        }
        m() {
          this.Xc.forEach(((t) => t.m())), this.Xc.length = 0, this.Ps.localization.priceFormatter = void 0, this.Ps.localization.percentageFormatter = void 0, this.Ps.localization.timeFormatter = void 0;
        }
        Nd() {
          return this.hd;
        }
        Jn() {
          return this.hd.N();
        }
        B_() {
          return this.sd;
        }
        Fd(t, i) {
          const s = this.ld(i);
          this.Wd(t, s), this.Jc.push(t), this.xa(), 1 === this.Jc.length ? this.Ca() : this.dr();
        }
        Hd(t) {
          const i = this.Kn(t), s = this.Jc.indexOf(t);
          o(-1 !== s, "Series not found");
          const n = u(i);
          this.Jc.splice(s, 1), n.n_(t), t.m && t.m(), this.xa(), this.Jh.Ju(), this.Ud(n);
        }
        Sa(t, i) {
          const s = u(this.Kn(t));
          s.n_(t, true), s.i_(t, i, true);
        }
        Fc() {
          const t = X.Cn();
          t.cn(), this.dd(t);
        }
        $d(t) {
          const i = X.Cn();
          i.pn(t), this.dd(i);
        }
        wn() {
          const t = X.Cn();
          t.wn(), this.dd(t);
        }
        gn(t) {
          const i = X.Cn();
          i.gn(t), this.dd(i);
        }
        Mn(t) {
          const i = X.Cn();
          i.Mn(t), this.dd(i);
        }
        vn(t) {
          const i = X.Cn();
          i.vn(t), this.dd(i);
        }
        dn() {
          const t = X.Cn();
          t.dn(), this.dd(t);
        }
        qd() {
          return this.Ps.rightPriceScale.visible ? "right" : "left";
        }
        jd(t, i) {
          o(i >= 0, "Index should be greater or equal to 0");
          if (i === this.Yd(t)) return;
          const s = u(this.Kn(t));
          s.n_(t);
          const n = this.ld(i);
          this.Wd(t, n), 0 === s.Sl().length && this.Ud(s), this.Ca();
        }
        Kd() {
          return this.ud;
        }
        $() {
          return this.od;
        }
        Ut(t) {
          const i = this.ud, s = this.od;
          if (i === s) return i;
          if (t = Math.max(0, Math.min(100, Math.round(100 * t))), null === this.ed || this.ed.eh !== s || this.ed.rh !== i) this.ed = { eh: s, rh: i, Zd: /* @__PURE__ */ new Map() };
          else {
            const i2 = this.ed.Zd.get(t);
            if (void 0 !== i2) return i2;
          }
          const n = this.ko.tt(s, i, t / 100);
          return this.ed.Zd.set(t, n), n;
        }
        Gd(t) {
          return this.Xc.indexOf(t);
        }
        Xi() {
          return this.ko;
        }
        Xd() {
          return this.Jd();
        }
        Jd(t) {
          const i = new ki(this.Jh, this);
          this.Xc.push(i);
          const s = t ?? this.Xc.length - 1, n = X.yn();
          return n.hn(s, { an: 0, ln: true }), this.dd(n), i;
        }
        ld(t) {
          return o(t >= 0, "Index should be greater or equal to 0"), (t = Math.min(this.Xc.length, t)) < this.Xc.length ? this.Xc[t] : this.Jd(t);
        }
        Yd(t) {
          return this.Xc.findIndex(((i) => i.F_().includes(t)));
        }
        kd(t, i) {
          const s = new X(i);
          if (null !== t) {
            const n = this.Xc.indexOf(t);
            s.hn(n, { an: i });
          }
          return s;
        }
        fd(t, i) {
          return void 0 === i && (i = 2), this.kd(this.Kn(t), i);
        }
        dd(t) {
          this.rd && this.rd(t), this.Xc.forEach(((t2) => t2.eu().pr().kt()));
        }
        Wd(t, i) {
          const s = t.N().priceScaleId, n = void 0 !== s ? s : this.qd();
          i.i_(t, n), G(n) || t.cr(t.N());
        }
        _d(t) {
          const i = this.Ps.layout;
          return "gradient" === i.background.type ? 0 === t ? i.background.topColor : i.background.bottomColor : i.background.color;
        }
        Ud(t) {
          !t.N_() && 0 === t.Sl().length && this.Xc.length > 1 && this.Xc.splice(this.Gd(t), 1);
        }
      };
      !(function(t) {
        t[t.Disabled = 0] = "Disabled", t[t.Continuous = 1] = "Continuous", t[t.OnDataUpdate = 2] = "OnDataUpdate";
      })(Ni || (Ni = {})), (function(t) {
        t[t.LastBar = 0] = "LastBar", t[t.LastVisible = 1] = "LastVisible";
      })(Fi || (Fi = {})), (function(t) {
        t.Solid = "solid", t.VerticalGradient = "gradient";
      })(Wi || (Wi = {})), (function(t) {
        t[t.Year = 0] = "Year", t[t.Month = 1] = "Month", t[t.DayOfMonth = 2] = "DayOfMonth", t[t.Time = 3] = "Time", t[t.TimeWithSeconds = 4] = "TimeWithSeconds";
      })(Hi || (Hi = {}));
      Yi = (t) => t.getUTCFullYear();
      Zi = class {
        constructor(t = "yyyy-MM-dd", i = "default") {
          this.Qd = t, this.tf = i;
        }
        du(t) {
          return Ki(t, this.Qd, this.tf);
        }
      };
      Gi = class {
        constructor(t) {
          this.if = t || "%h:%m:%s";
        }
        du(t) {
          return this.if.replace("%h", tt(t.getUTCHours(), 2)).replace("%m", tt(t.getUTCMinutes(), 2)).replace("%s", tt(t.getUTCSeconds(), 2));
        }
      };
      Xi = { sf: "yyyy-MM-dd", nf: "%h:%m:%s", ef: " ", rf: "default" };
      Ji = class {
        constructor(t = {}) {
          const i = { ...Xi, ...t };
          this.hf = new Zi(i.sf, i.rf), this.af = new Gi(i.nf), this.lf = i.ef;
        }
        du(t) {
          return `${this.hf.du(t)}${this.lf}${this.af.du(t)}`;
        }
      };
      is = [{ _f: (ss = 1, 1e3 * ss), uf: 10 }, { _f: ts(1), uf: 20 }, { _f: ts(5), uf: 21 }, { _f: ts(30), uf: 22 }, { _f: Qi(1), uf: 30 }, { _f: Qi(3), uf: 31 }, { _f: Qi(6), uf: 32 }, { _f: Qi(12), uf: 33 }];
      ls = class {
        options() {
          return this.Ps;
        }
        setOptions(t) {
          this.Ps = t, this.updateFormatter(t.localization);
        }
        preprocessData(t) {
          Array.isArray(t) ? (function(t2) {
            t2.forEach(as);
          })(t) : as(t);
        }
        createConverterToInternalObj(t) {
          return u((function(t2) {
            return 0 === t2.length ? null : qi(t2[0].time) || m(t2[0].time) ? es : rs;
          })(t));
        }
        key(t) {
          return "object" == typeof t && "cf" in t ? t.cf : this.key(this.convertHorzItemToInternal(t));
        }
        cacheKey(t) {
          const i = t;
          return void 0 === i.df ? new Date(1e3 * i.cf).getTime() : new Date(Date.UTC(i.df.year, i.df.month - 1, i.df.day)).getTime();
        }
        convertHorzItemToInternal(t) {
          return ji(i = t) ? rs(i) : qi(i) ? es(i) : es(hs(i));
          var i;
        }
        updateFormatter(t) {
          if (!this.Ps) return;
          const i = t.dateFormat;
          this.Ps.timeScale.timeVisible ? this.ff = new Ji({ sf: i, nf: this.Ps.timeScale.secondsVisible ? "%h:%m:%s" : "%h:%m", ef: "   ", rf: t.locale }) : this.ff = new Zi(i, t.locale);
        }
        formatHorzItem(t) {
          const i = t;
          return this.ff.du(new Date(1e3 * i.cf));
        }
        formatTickmark(t, i) {
          const s = (function(t2, i2, s2) {
            switch (t2) {
              case 0:
              case 10:
                return i2 ? s2 ? 4 : 3 : 2;
              case 20:
              case 21:
              case 22:
              case 30:
              case 31:
              case 32:
              case 33:
                return i2 ? 3 : 2;
              case 50:
                return 2;
              case 60:
                return 1;
              case 70:
                return 0;
            }
          })(t.weight, this.Ps.timeScale.timeVisible, this.Ps.timeScale.secondsVisible), n = this.Ps.timeScale;
          if (void 0 !== n.tickMarkFormatter) {
            const e2 = n.tickMarkFormatter(t.originalTime, s, i.locale);
            if (null !== e2) return e2;
          }
          return (function(t2, i2, s2) {
            const n2 = {};
            switch (i2) {
              case 0:
                n2.year = "numeric";
                break;
              case 1:
                n2.month = "short";
                break;
              case 2:
                n2.day = "numeric";
                break;
              case 3:
                n2.hour12 = false, n2.hour = "2-digit", n2.minute = "2-digit";
                break;
              case 4:
                n2.hour12 = false, n2.hour = "2-digit", n2.minute = "2-digit", n2.second = "2-digit";
            }
            const e2 = void 0 === t2.df ? new Date(1e3 * t2.cf) : new Date(Date.UTC(t2.df.year, t2.df.month - 1, t2.df.day));
            return new Date(e2.getUTCFullYear(), e2.getUTCMonth(), e2.getUTCDate(), e2.getUTCHours(), e2.getUTCMinutes(), e2.getUTCSeconds(), e2.getUTCMilliseconds()).toLocaleString(s2, n2);
          })(t.time, s, i.locale);
        }
        maxTickMarkWeight(t) {
          let i = t.reduce(Li, t[0]).weight;
          return i > 30 && i < 50 && (i = 30), i;
        }
        fillWeightsForPoints(t, i) {
          !(function(t2, i2 = 0) {
            if (0 === t2.length) return;
            let s = 0 === i2 ? null : t2[i2 - 1].time.cf, n = null !== s ? new Date(1e3 * s) : null, e2 = 0;
            for (let r2 = i2; r2 < t2.length; ++r2) {
              const i3 = t2[r2], h2 = new Date(1e3 * i3.time.cf);
              null !== n && (i3.timeWeight = ns(h2, n)), e2 += i3.time.cf - (s || i3.time.cf), s = i3.time.cf, n = h2;
            }
            if (0 === i2 && t2.length > 1) {
              const i3 = Math.ceil(e2 / (t2.length - 1)), s2 = new Date(1e3 * (t2[0].time.cf - i3));
              t2[0].timeWeight = ns(new Date(1e3 * t2[0].time.cf), s2);
            }
          })(t, i);
        }
        static pf(t) {
          return f({ localization: { dateFormat: "dd MMM 'yy" } }, t ?? {});
        }
      };
      os = "undefined" != typeof window;
      fs = class {
        constructor(t, i, s) {
          this.vf = 0, this.mf = null, this.wf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY }, this.gf = 0, this.Mf = null, this.bf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY }, this.Sf = null, this.xf = false, this.Cf = null, this.yf = null, this.kf = false, this.Pf = false, this.Tf = false, this.Rf = null, this.Df = null, this.If = null, this.Vf = null, this.Bf = null, this.Ef = null, this.Af = null, this.Lf = 0, this.zf = false, this.Of = false, this.Nf = false, this.Ff = 0, this.Wf = null, this.Hf = !us(), this.Uf = (t2) => {
            this.$f(t2);
          }, this.qf = (t2) => {
            if (this.jf(t2)) {
              const i2 = this.Yf(t2);
              if (++this.gf, this.Mf && this.gf > 1) {
                const { Kf: s2 } = this.Zf(ms(t2), this.bf);
                s2 < 30 && !this.Tf && this.Gf(i2, this.Jf.Xf), this.Qf();
              }
            } else {
              const i2 = this.Yf(t2);
              if (++this.vf, this.mf && this.vf > 1) {
                const { Kf: s2 } = this.Zf(ms(t2), this.wf);
                s2 < 5 && !this.Pf && this.tp(i2, this.Jf.ip), this.sp();
              }
            }
          }, this.np = t, this.Jf = i, this.Ps = s, this.ep();
        }
        m() {
          null !== this.Rf && (this.Rf(), this.Rf = null), null !== this.Df && (this.Df(), this.Df = null), null !== this.Vf && (this.Vf(), this.Vf = null), null !== this.Bf && (this.Bf(), this.Bf = null), null !== this.Ef && (this.Ef(), this.Ef = null), null !== this.If && (this.If(), this.If = null), this.rp(), this.sp();
        }
        hp(t) {
          this.Vf && this.Vf();
          const i = this.ap.bind(this);
          if (this.Vf = () => {
            this.np.removeEventListener("mousemove", i);
          }, this.np.addEventListener("mousemove", i), this.jf(t)) return;
          const s = this.Yf(t);
          this.tp(s, this.Jf.lp), this.Hf = true;
        }
        sp() {
          null !== this.mf && clearTimeout(this.mf), this.vf = 0, this.mf = null, this.wf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY };
        }
        Qf() {
          null !== this.Mf && clearTimeout(this.Mf), this.gf = 0, this.Mf = null, this.bf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY };
        }
        ap(t) {
          if (this.Nf || null !== this.yf) return;
          if (this.jf(t)) return;
          const i = this.Yf(t);
          this.tp(i, this.Jf.op), this.Hf = true;
        }
        _p(t) {
          const i = gs(t.changedTouches, u(this.Wf));
          if (null === i) return;
          if (this.Ff = ws(t), null !== this.Af) return;
          if (this.Of) return;
          this.zf = true;
          const s = this.Zf(ms(i), u(this.yf)), { up: n, cp: e2, Kf: r2 } = s;
          if (this.kf || !(r2 < 5)) {
            if (!this.kf) {
              const t2 = 0.5 * n, i2 = e2 >= t2 && !this.Ps.dp(), s2 = t2 > e2 && !this.Ps.fp();
              i2 || s2 || (this.Of = true), this.kf = true, this.Tf = true, this.rp(), this.Qf();
            }
            if (!this.Of) {
              const s2 = this.Yf(t, i);
              this.Gf(s2, this.Jf.pp), vs(t);
            }
          }
        }
        vp(t) {
          if (0 !== t.button) return;
          const i = this.Zf(ms(t), u(this.Cf)), { Kf: s } = i;
          if (s >= 5 && (this.Pf = true, this.sp()), this.Pf) {
            const i2 = this.Yf(t);
            this.tp(i2, this.Jf.mp);
          }
        }
        Zf(t, i) {
          const s = Math.abs(i._t - t._t), n = Math.abs(i.ut - t.ut);
          return { up: s, cp: n, Kf: s + n };
        }
        wp(t) {
          let i = gs(t.changedTouches, u(this.Wf));
          if (null === i && 0 === t.touches.length && (i = t.changedTouches[0]), null === i) return;
          this.Wf = null, this.Ff = ws(t), this.rp(), this.yf = null, this.Ef && (this.Ef(), this.Ef = null);
          const s = this.Yf(t, i);
          if (this.Gf(s, this.Jf.gp), ++this.gf, this.Mf && this.gf > 1) {
            const { Kf: t2 } = this.Zf(ms(i), this.bf);
            t2 < 30 && !this.Tf && this.Gf(s, this.Jf.Xf), this.Qf();
          } else this.Tf || (this.Gf(s, this.Jf.Mp), this.Jf.Mp && vs(t));
          0 === this.gf && vs(t), 0 === t.touches.length && this.xf && (this.xf = false, vs(t));
        }
        $f(t) {
          if (0 !== t.button) return;
          const i = this.Yf(t);
          if (this.Cf = null, this.Nf = false, this.Bf && (this.Bf(), this.Bf = null), _s()) {
            this.np.ownerDocument.documentElement.removeEventListener("mouseleave", this.Uf);
          }
          if (!this.jf(t)) if (this.tp(i, this.Jf.bp), ++this.vf, this.mf && this.vf > 1) {
            const { Kf: s } = this.Zf(ms(t), this.wf);
            s < 5 && !this.Pf && this.tp(i, this.Jf.ip), this.sp();
          } else this.Pf || this.tp(i, this.Jf.Sp);
        }
        rp() {
          null !== this.Sf && (clearTimeout(this.Sf), this.Sf = null);
        }
        xp(t) {
          if (null !== this.Wf) return;
          const i = t.changedTouches[0];
          this.Wf = i.identifier, this.Ff = ws(t);
          const s = this.np.ownerDocument.documentElement;
          this.Tf = false, this.kf = false, this.Of = false, this.yf = ms(i), this.Ef && (this.Ef(), this.Ef = null);
          {
            const i2 = this._p.bind(this), n2 = this.wp.bind(this);
            this.Ef = () => {
              s.removeEventListener("touchmove", i2), s.removeEventListener("touchend", n2);
            }, s.addEventListener("touchmove", i2, { passive: false }), s.addEventListener("touchend", n2, { passive: false }), this.rp(), this.Sf = setTimeout(this.Cp.bind(this, t), 240);
          }
          const n = this.Yf(t, i);
          this.Gf(n, this.Jf.yp), this.Mf || (this.gf = 0, this.Mf = setTimeout(this.Qf.bind(this), 500), this.bf = ms(i));
        }
        kp(t) {
          if (0 !== t.button) return;
          const i = this.np.ownerDocument.documentElement;
          _s() && i.addEventListener("mouseleave", this.Uf), this.Pf = false, this.Cf = ms(t), this.Bf && (this.Bf(), this.Bf = null);
          {
            const t2 = this.vp.bind(this), s2 = this.$f.bind(this);
            this.Bf = () => {
              i.removeEventListener("mousemove", t2), i.removeEventListener("mouseup", s2);
            }, i.addEventListener("mousemove", t2), i.addEventListener("mouseup", s2);
          }
          if (this.Nf = true, this.jf(t)) return;
          const s = this.Yf(t);
          this.tp(s, this.Jf.Pp), this.mf || (this.vf = 0, this.mf = setTimeout(this.sp.bind(this), 500), this.wf = ms(t));
        }
        ep() {
          this.np.addEventListener("mouseenter", this.hp.bind(this)), this.np.addEventListener("touchcancel", this.rp.bind(this));
          {
            const t = this.np.ownerDocument, i = (t2) => {
              this.Jf.Tp && (t2.composed && this.np.contains(t2.composedPath()[0]) || t2.target && this.np.contains(t2.target) || this.Jf.Tp());
            };
            this.Df = () => {
              t.removeEventListener("touchstart", i);
            }, this.Rf = () => {
              t.removeEventListener("mousedown", i);
            }, t.addEventListener("mousedown", i), t.addEventListener("touchstart", i, { passive: true });
          }
          us() && (this.If = () => {
            this.np.removeEventListener("dblclick", this.qf);
          }, this.np.addEventListener("dblclick", this.qf)), this.np.addEventListener("mouseleave", this.Rp.bind(this)), this.np.addEventListener("touchstart", this.xp.bind(this), { passive: true }), ds(this.np), this.np.addEventListener("mousedown", this.kp.bind(this)), this.Dp(), this.np.addEventListener("touchmove", (() => {
          }), { passive: false });
        }
        Dp() {
          void 0 === this.Jf.Ip && void 0 === this.Jf.Vp && void 0 === this.Jf.Bp || (this.np.addEventListener("touchstart", ((t) => this.Ep(t.touches)), { passive: true }), this.np.addEventListener("touchmove", ((t) => {
            if (2 === t.touches.length && null !== this.Af && void 0 !== this.Jf.Vp) {
              const i = ps(t.touches[0], t.touches[1]) / this.Lf;
              this.Jf.Vp(this.Af, i), vs(t);
            }
          }), { passive: false }), this.np.addEventListener("touchend", ((t) => {
            this.Ep(t.touches);
          })));
        }
        Ep(t) {
          1 === t.length && (this.zf = false), 2 !== t.length || this.zf || this.xf ? this.Ap() : this.Lp(t);
        }
        Lp(t) {
          const i = this.np.getBoundingClientRect() || { left: 0, top: 0 };
          this.Af = { _t: (t[0].clientX - i.left + (t[1].clientX - i.left)) / 2, ut: (t[0].clientY - i.top + (t[1].clientY - i.top)) / 2 }, this.Lf = ps(t[0], t[1]), void 0 !== this.Jf.Ip && this.Jf.Ip(), this.rp();
        }
        Ap() {
          null !== this.Af && (this.Af = null, void 0 !== this.Jf.Bp && this.Jf.Bp());
        }
        Rp(t) {
          if (this.Vf && this.Vf(), this.jf(t)) return;
          if (!this.Hf) return;
          const i = this.Yf(t);
          this.tp(i, this.Jf.zp), this.Hf = !us();
        }
        Cp(t) {
          const i = gs(t.touches, u(this.Wf));
          if (null === i) return;
          const s = this.Yf(t, i);
          this.Gf(s, this.Jf.Op), this.Tf = true, this.xf = true;
        }
        jf(t) {
          return t.sourceCapabilities && void 0 !== t.sourceCapabilities.firesTouchEvents ? t.sourceCapabilities.firesTouchEvents : ws(t) < this.Ff + 500;
        }
        Gf(t, i) {
          i && i.call(this.Jf, t);
        }
        tp(t, i) {
          i && i.call(this.Jf, t);
        }
        Yf(t, i) {
          const s = i || t, n = this.np.getBoundingClientRect() || { left: 0, top: 0 };
          return { clientX: s.clientX, clientY: s.clientY, pageX: s.pageX, pageY: s.pageY, screenX: s.screenX, screenY: s.screenY, localX: s.clientX - n.left, localY: s.clientY - n.top, ctrlKey: t.ctrlKey, altKey: t.altKey, shiftKey: t.shiftKey, metaKey: t.metaKey, Np: !t.type.startsWith("mouse") && "contextmenu" !== t.type && "click" !== t.type, Fp: t.type, Wp: s.target, _u: t.view, Hp: () => {
            "touchstart" !== t.type && vs(t);
          } };
        }
      };
      Ms = class {
        constructor(t, i, s) {
          this.Up = null, this.$p = null, this.qp = true, this.jp = null, this.Yp = t, this.Kp = t.Zp()[i], this.Gp = t.Zp()[s], this.Xp = document.createElement("tr"), this.Xp.style.height = "1px", this.Jp = document.createElement("td"), this.Jp.style.position = "relative", this.Jp.style.padding = "0", this.Jp.style.margin = "0", this.Jp.setAttribute("colspan", "3"), this.Qp(), this.Xp.appendChild(this.Jp), this.qp = this.Yp.N().layout.panes.enableResize, this.qp ? this.tv() : (this.Up = null, this.$p = null);
        }
        m() {
          null !== this.$p && this.$p.m();
        }
        iv() {
          return this.Xp;
        }
        sv() {
          return size({ width: this.Kp.sv().width, height: 1 });
        }
        nv() {
          return size({ width: this.Kp.nv().width, height: 1 * window.devicePixelRatio });
        }
        ev(t, i, s) {
          const n = this.nv();
          t.fillStyle = this.Yp.N().layout.panes.separatorColor, t.fillRect(i, s, n.width, n.height);
        }
        kt() {
          this.Qp(), this.Yp.N().layout.panes.enableResize !== this.qp && (this.qp = this.Yp.N().layout.panes.enableResize, this.qp ? this.tv() : (null !== this.Up && (this.Jp.removeChild(this.Up.rv), this.Jp.removeChild(this.Up.hv), this.Up = null), null !== this.$p && (this.$p.m(), this.$p = null)));
        }
        tv() {
          const t = document.createElement("div"), i = t.style;
          i.position = "fixed", i.display = "none", i.zIndex = "49", i.top = "0", i.left = "0", i.width = "100%", i.height = "100%", i.cursor = "row-resize", this.Jp.appendChild(t);
          const s = document.createElement("div"), n = s.style;
          n.position = "absolute", n.zIndex = "50", n.top = "-4px", n.height = "9px", n.width = "100%", n.backgroundColor = "", n.cursor = "row-resize", this.Jp.appendChild(s);
          const e2 = { lp: this.av.bind(this), zp: this.lv.bind(this), Pp: this.ov.bind(this), yp: this.ov.bind(this), mp: this._v.bind(this), pp: this._v.bind(this), bp: this.uv.bind(this), gp: this.uv.bind(this) };
          this.$p = new fs(s, e2, { dp: () => false, fp: () => true }), this.Up = { hv: s, rv: t };
        }
        Qp() {
          this.Jp.style.background = this.Yp.N().layout.panes.separatorColor;
        }
        av(t) {
          null !== this.Up && (this.Up.hv.style.backgroundColor = this.Yp.N().layout.panes.separatorHoverColor);
        }
        lv(t) {
          null !== this.Up && null === this.jp && (this.Up.hv.style.backgroundColor = "");
        }
        ov(t) {
          if (null === this.Up) return;
          const i = this.Kp.cv().E_() + this.Gp.cv().E_(), s = i / (this.Kp.sv().height + this.Gp.sv().height), n = 30 * s;
          i <= 2 * n || (this.jp = { dv: t.pageY, fv: this.Kp.cv().E_(), pv: i - n, vv: i, mv: s, wv: n }, this.Up.rv.style.display = "block");
        }
        _v(t) {
          const i = this.jp;
          if (null === i) return;
          const s = (t.pageY - i.dv) * i.mv, n = si(i.fv + s, i.wv, i.pv);
          this.Kp.cv().A_(n), this.Gp.cv().A_(i.vv - n), this.Yp.Qt().Ca();
        }
        uv(t) {
          null !== this.jp && null !== this.Up && (this.jp = null, this.Up.rv.style.display = "none");
        }
      };
      xs = class {
        constructor(t, i, s, n) {
          this.Mv = null, this.bv = null, this.Sv = null, this.xv = null, this.Cv = null, this.yv = 0, this.kv = 0, this.Pv = t, this.Tv = i, this.Rv = s, this.kn = n;
        }
        Dv(t, i) {
          if (null !== this.Mv) {
            if (this.Mv.wt === i) return void (this.Mv.gv = t);
            if (Math.abs(this.Mv.gv - t) < this.kn) return;
          }
          this.xv = this.Sv, this.Sv = this.bv, this.bv = this.Mv, this.Mv = { wt: i, gv: t };
        }
        fe(t, i) {
          if (null === this.Mv || null === this.bv) return;
          if (i - this.Mv.wt > 50) return;
          let s = 0;
          const n = Ss(this.Mv, this.bv, this.Tv), e2 = bs(this.Mv, this.bv), r2 = [n], h2 = [e2];
          if (s += e2, null !== this.Sv) {
            const t2 = Ss(this.bv, this.Sv, this.Tv);
            if (Math.sign(t2) === Math.sign(n)) {
              const i2 = bs(this.bv, this.Sv);
              if (r2.push(t2), h2.push(i2), s += i2, null !== this.xv) {
                const t3 = Ss(this.Sv, this.xv, this.Tv);
                if (Math.sign(t3) === Math.sign(n)) {
                  const i3 = bs(this.Sv, this.xv);
                  r2.push(t3), h2.push(i3), s += i3;
                }
              }
            }
          }
          let a2 = 0;
          for (let t2 = 0; t2 < r2.length; ++t2) a2 += h2[t2] / s * r2[t2];
          Math.abs(a2) < this.Pv || (this.Cv = { gv: t, wt: i }, this.kv = a2, this.yv = (function(t2, i2) {
            const s2 = Math.log(i2);
            return Math.log(1 * s2 / -t2) / s2;
          })(Math.abs(a2), this.Rv));
        }
        Ac(t) {
          const i = u(this.Cv), s = t - i.wt;
          return i.gv + this.kv * (Math.pow(this.Rv, s) - 1) / Math.log(this.Rv);
        }
        Ec(t) {
          return null === this.Cv || this.Iv(t) === this.yv;
        }
        Iv(t) {
          const i = t - u(this.Cv).wt;
          return Math.min(i, this.yv);
        }
      };
      Cs = class {
        constructor(t, i) {
          this.Vv = void 0, this.Bv = void 0, this.Ev = void 0, this.ws = false, this.Av = t, this.Lv = i, this.zv();
        }
        kt() {
          this.zv();
        }
        Ov() {
          this.Vv && this.Av.removeChild(this.Vv), this.Bv && this.Av.removeChild(this.Bv), this.Vv = void 0, this.Bv = void 0;
        }
        Nv() {
          return this.ws !== this.Fv() || this.Ev !== this.Wv();
        }
        Wv() {
          return this.Lv.Qt().Xi().J(this.Lv.N().layout.textColor) > 160 ? "dark" : "light";
        }
        Fv() {
          return this.Lv.N().layout.attributionLogo;
        }
        Hv() {
          const t = new URL(location.href);
          return t.hostname ? "&utm_source=" + t.hostname + t.pathname : "";
        }
        zv() {
          this.Nv() && (this.Ov(), this.ws = this.Fv(), this.ws && (this.Ev = this.Wv(), this.Bv = document.createElement("style"), this.Bv.innerText = "a#tv-attr-logo{--fill:#131722;--stroke:#fff;position:absolute;left:10px;bottom:10px;height:19px;width:35px;margin:0;padding:0;border:0;z-index:3;}a#tv-attr-logo[data-dark]{--fill:#D1D4DC;--stroke:#131722;}", this.Vv = document.createElement("a"), this.Vv.href = `https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart${this.Hv()}`, this.Vv.title = "Charting by TradingView", this.Vv.id = "tv-attr-logo", this.Vv.target = "_blank", this.Vv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="19" fill="none"><g fill-rule="evenodd" clip-path="url(#a)" clip-rule="evenodd"><path fill="var(--stroke)" d="M2 0H0v10h6v9h21.4l.5-1.3 6-15 1-2.7H23.7l-.5 1.3-.2.6a5 5 0 0 0-7-.9V0H2Zm20 17h4l5.2-13 .8-2h-7l-1 2.5-.2.5-1.5 3.8-.3.7V17Zm-.8-10a3 3 0 0 0 .7-2.7A3 3 0 1 0 16.8 7h4.4ZM14 7V2H2v6h6v9h4V7h2Z"/><path fill="var(--fill)" d="M14 2H2v6h6v9h6V2Zm12 15h-7l6-15h7l-6 15Zm-7-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></g><defs><clipPath id="a"><path fill="var(--stroke)" d="M0 0h35v19H0z"/></clipPath></defs></svg>', this.Vv.toggleAttribute("data-dark", "dark" === this.Ev), this.Av.appendChild(this.Bv), this.Av.appendChild(this.Vv)));
        }
      };
      Vs = class {
        constructor(i, s, n, e2) {
          this.Ki = null, this.Uv = null, this.$v = false, this.qv = new rt(200), this.jv = null, this.Yv = 0, this.Kv = false, this.Zv = () => {
            this.Kv || this.yt.Gv().Qt().dr();
          }, this.Xv = () => {
            this.Kv || this.yt.Gv().Qt().dr();
          }, this.yt = i, this.Ps = s, this.Co = s.layout, this.hd = n, this.Jv = "left" === e2, this.Qv = Ds("normal", e2), this.tm = Ds("top", e2), this.im = Ds("bottom", e2), this.Jp = document.createElement("div"), this.Jp.style.height = "100%", this.Jp.style.overflow = "hidden", this.Jp.style.width = "25px", this.Jp.style.left = "0", this.Jp.style.position = "relative", this.sm = ys(this.Jp, size({ width: 16, height: 16 })), this.sm.subscribeSuggestedBitmapSizeChanged(this.Zv);
          const r2 = this.sm.canvasElement;
          r2.style.position = "absolute", r2.style.zIndex = "1", r2.style.left = "0", r2.style.top = "0", this.nm = ys(this.Jp, size({ width: 16, height: 16 })), this.nm.subscribeSuggestedBitmapSizeChanged(this.Xv);
          const h2 = this.nm.canvasElement;
          h2.style.position = "absolute", h2.style.zIndex = "2", h2.style.left = "0", h2.style.top = "0";
          const a2 = { Pp: this.ov.bind(this), yp: this.ov.bind(this), mp: this._v.bind(this), pp: this._v.bind(this), Tp: this.rm.bind(this), bp: this.uv.bind(this), gp: this.uv.bind(this), ip: this.hm.bind(this), Xf: this.hm.bind(this), lp: this.am.bind(this), zp: this.lv.bind(this) };
          this.$p = new fs(this.nm.canvasElement, a2, { dp: () => !this.Ps.handleScroll.vertTouchDrag, fp: () => true });
        }
        m() {
          this.$p.m(), this.nm.unsubscribeSuggestedBitmapSizeChanged(this.Xv), ks(this.nm.canvasElement), this.nm.dispose(), this.sm.unsubscribeSuggestedBitmapSizeChanged(this.Zv), ks(this.sm.canvasElement), this.sm.dispose(), null !== this.Ki && this.Ki.r_().u(this), this.Ki = null;
        }
        iv() {
          return this.Jp;
        }
        k() {
          return this.Co.fontSize;
        }
        lm() {
          const t = this.hd.N();
          return this.jv !== t.P && (this.qv.On(), this.jv = t.P), t;
        }
        om() {
          if (null === this.Ki) return 0;
          let t = 0;
          const i = this.lm(), s = u(this.sm.canvasElement.getContext("2d", { colorSpace: this.yt.Gv().N().layout.colorSpace }));
          s.save();
          const n = this.Ki.Vl();
          s.font = this._m(), n.length > 0 && (t = Math.max(this.qv.Ii(s, n[0].Jl), this.qv.Ii(s, n[n.length - 1].Jl)));
          const e2 = this.um();
          for (let i2 = e2.length; i2--; ) {
            const n2 = this.qv.Ii(s, e2[i2].ri());
            n2 > t && (t = n2);
          }
          const r2 = this.Ki.Lt();
          if (null !== r2 && null !== this.Uv && (2 !== (h2 = this.Ps.crosshair).mode && h2.horzLine.visible && h2.horzLine.labelVisible)) {
            const i2 = this.Ki.Ds(1, r2), n2 = this.Ki.Ds(this.Uv.height - 2, r2);
            t = Math.max(t, this.qv.Ii(s, this.Ki.Ji(Math.floor(Math.min(i2, n2)) + 0.11111111111111, r2)), this.qv.Ii(s, this.Ki.Ji(Math.ceil(Math.max(i2, n2)) - 0.11111111111111, r2)));
          }
          var h2;
          s.restore();
          const a2 = t || 34;
          return cs(Math.ceil(i.S + i.C + i.V + i.B + 5 + a2));
        }
        dm(t) {
          null !== this.Uv && equalSizes(this.Uv, t) || (this.Uv = t, this.Kv = true, this.sm.resizeCanvasElement(t), this.nm.resizeCanvasElement(t), this.Kv = false, this.Jp.style.width = `${t.width}px`, this.Jp.style.height = `${t.height}px`);
        }
        fm() {
          return u(this.Uv).width;
        }
        cs(t) {
          this.Ki !== t && (null !== this.Ki && this.Ki.r_().u(this), this.Ki = t, t.r_().i(this.do.bind(this), this));
        }
        Ft() {
          return this.Ki;
        }
        On() {
          const t = this.yt.cv();
          this.yt.Gv().Qt().Q_(t, u(this.Ft()));
        }
        pm(t) {
          if (null === this.Uv) return;
          const i = { colorSpace: this.yt.Gv().N().layout.colorSpace };
          if (1 !== t) {
            this.vm(), this.sm.applySuggestedBitmapSize();
            const t2 = tryCreateCanvasRenderingTarget2D(this.sm, i);
            null !== t2 && (t2.useBitmapCoordinateSpace(((t3) => {
              this.wm(t3), this.gm(t3);
            })), this.yt.Mm(t2, this.im), this.bm(t2), this.yt.Mm(t2, this.Qv), this.Sm(t2));
          }
          this.nm.applySuggestedBitmapSize();
          const s = tryCreateCanvasRenderingTarget2D(this.nm, i);
          null !== s && (s.useBitmapCoordinateSpace((({ context: t2, bitmapSize: i2 }) => {
            t2.clearRect(0, 0, i2.width, i2.height);
          })), this.xm(s), this.yt.Mm(s, this.tm));
        }
        nv() {
          return this.sm.bitmapSize;
        }
        ev(t, i, s, n) {
          const e2 = this.nv();
          if (e2.width > 0 && e2.height > 0 && (t.drawImage(this.sm.canvasElement, i, s), n)) {
            const n2 = this.nm.canvasElement;
            t.drawImage(n2, i, s);
          }
        }
        kt() {
          this.Ki?.Vl();
        }
        ov(t) {
          if (null === this.Ki || this.Ki.Gi() || !this.Ps.handleScale.axisPressedMouseMove.price) return;
          const i = this.yt.Gv().Qt(), s = this.yt.cv();
          this.$v = true, i.j_(s, this.Ki, t.localY);
        }
        _v(t) {
          if (null === this.Ki || !this.Ps.handleScale.axisPressedMouseMove.price) return;
          const i = this.yt.Gv().Qt(), s = this.yt.cv(), n = this.Ki;
          i.Y_(s, n, t.localY);
        }
        rm() {
          if (null === this.Ki || !this.Ps.handleScale.axisPressedMouseMove.price) return;
          const t = this.yt.Gv().Qt(), i = this.yt.cv(), s = this.Ki;
          this.$v && (this.$v = false, t.K_(i, s));
        }
        uv(t) {
          if (null === this.Ki || !this.Ps.handleScale.axisPressedMouseMove.price) return;
          const i = this.yt.Gv().Qt(), s = this.yt.cv();
          this.$v = false, i.K_(s, this.Ki);
        }
        hm(t) {
          this.Ps.handleScale.axisDoubleClickReset.price && this.On();
        }
        am(t) {
          if (null === this.Ki) return;
          !this.yt.Gv().Qt().N().handleScale.axisPressedMouseMove.price || this.Ki.He() || this.Ki.Eo() || this.Cm(1);
        }
        lv(t) {
          this.Cm(0);
        }
        um() {
          const t = [], i = null === this.Ki ? void 0 : this.Ki;
          return ((s) => {
            for (let n = 0; n < s.length; ++n) {
              const e2 = s[n].Ks(this.yt.cv(), i);
              for (let i2 = 0; i2 < e2.length; i2++) t.push(e2[i2]);
            }
          })(this.yt.cv().Dt()), t;
        }
        wm({ context: t, bitmapSize: i }) {
          const { width: s, height: n } = i, e2 = this.yt.cv().Qt(), r2 = e2.$(), h2 = e2.Kd();
          r2 === h2 ? z(t, 0, 0, s, n, r2) : F(t, 0, 0, s, n, r2, h2);
        }
        gm({ context: t, bitmapSize: i, horizontalPixelRatio: s }) {
          if (null === this.Uv || null === this.Ki || !this.Ki.N().borderVisible) return;
          t.fillStyle = this.Ki.N().borderColor;
          const n = Math.max(1, Math.floor(this.lm().S * s));
          let e2;
          e2 = this.Jv ? i.width - n : 0, t.fillRect(e2, 0, n, i.height);
        }
        bm(t) {
          if (null === this.Uv || null === this.Ki) return;
          const i = this.Ki.Vl(), s = this.Ki.N(), n = this.lm(), e2 = this.Jv ? this.Uv.width - n.C : 0;
          s.borderVisible && s.ticksVisible && t.useBitmapCoordinateSpace((({ context: t2, horizontalPixelRatio: r2, verticalPixelRatio: h2 }) => {
            t2.fillStyle = s.borderColor;
            const a2 = Math.max(1, Math.floor(h2)), l2 = Math.floor(0.5 * h2), o2 = Math.round(n.C * r2);
            t2.beginPath();
            for (const s2 of i) t2.rect(Math.floor(e2 * r2), Math.round(s2.Pl * h2) - l2, o2, a2);
            t2.fill();
          })), t.useMediaCoordinateSpace((({ context: t2 }) => {
            t2.font = this._m(), t2.fillStyle = s.textColor ?? this.Co.textColor, t2.textAlign = this.Jv ? "right" : "left", t2.textBaseline = "middle";
            const r2 = this.Jv ? Math.round(e2 - n.V) : Math.round(e2 + n.C + n.V), h2 = i.map(((i2) => this.qv.Di(t2, i2.Jl)));
            for (let s2 = i.length; s2--; ) {
              const n2 = i[s2];
              t2.fillText(n2.Jl, r2, n2.Pl + h2[s2]);
            }
          }));
        }
        vm() {
          if (null === this.Uv || null === this.Ki) return;
          let t = this.Uv.height / 2;
          const i = [], s = this.Ki.Dt().slice(), n = this.yt.cv(), e2 = this.lm();
          this.Ki === n.Gn() && this.yt.cv().Dt().forEach(((t2) => {
            n.Zn(t2) && s.push(t2);
          }));
          const r2 = this.Ki.Sl()[0], h2 = this.Ki;
          s.forEach(((s2) => {
            const e3 = s2.Ks(n, h2);
            e3.forEach(((t2) => {
              t2.$i() && null === t2.Wi() && (t2.Ui(null), i.push(t2));
            })), r2 === s2 && e3.length > 0 && (t = e3[0].Ei());
          }));
          this.Ki.N().alignLabels && this.ym(i, e2, t);
        }
        ym(t, i, s) {
          if (null === this.Uv) return;
          const n = t.filter(((t2) => t2.Ei() <= s)), e2 = t.filter(((t2) => t2.Ei() > s));
          n.sort(((t2, i2) => i2.Ei() - t2.Ei())), n.length && e2.length && e2.push(n[0]), e2.sort(((t2, i2) => t2.Ei() - i2.Ei()));
          for (const s2 of t) {
            const t2 = Math.floor(s2.$t(i) / 2), n2 = s2.Ei();
            n2 > -t2 && n2 < t2 && s2.Ui(t2), n2 > this.Uv.height - t2 && n2 < this.Uv.height + t2 && s2.Ui(this.Uv.height - t2);
          }
          Is(n, 1, this.Uv.height, i), Is(e2, -1, this.Uv.height, i);
        }
        Sm(t) {
          if (null === this.Uv) return;
          const i = this.um(), s = this.lm(), n = this.Jv ? "right" : "left";
          i.forEach(((i2) => {
            if (i2.qi()) {
              i2.Tt(u(this.Ki)).nt(t, s, this.qv, n);
            }
          }));
        }
        xm(t) {
          if (null === this.Uv || null === this.Ki) return;
          const i = this.yt.Gv().Qt(), s = [], n = this.yt.cv(), e2 = i.gd().Ks(n, this.Ki);
          e2.length && s.push(e2);
          const r2 = this.lm(), h2 = this.Jv ? "right" : "left";
          s.forEach(((i2) => {
            i2.forEach(((i3) => {
              i3.Tt(u(this.Ki)).nt(t, r2, this.qv, h2);
            }));
          }));
        }
        Cm(t) {
          this.Jp.style.cursor = 1 === t ? "ns-resize" : "default";
        }
        do() {
          const t = this.om();
          this.Yv < t && this.yt.Gv().Qt().Ca(), this.Yv = t;
        }
        _m() {
          return x(this.Co.fontSize, this.Co.fontFamily);
        }
      };
      zs = class _zs {
        constructor(i, s) {
          this.Uv = size({ width: 0, height: 0 }), this.km = null, this.Pm = null, this.Tm = null, this.Rm = null, this.Dm = false, this.Im = new d(), this.Vm = new d(), this.Bm = 0, this.Em = false, this.Am = null, this.Lm = false, this.zm = null, this.Om = null, this.Kv = false, this.Zv = () => {
            this.Kv || null === this.Nm || this.ns().dr();
          }, this.Xv = () => {
            this.Kv || null === this.Nm || this.ns().dr();
          }, this.Lv = i, this.Nm = s, this.Nm.nu().i(this.Fm.bind(this), this, true), this.Wm = document.createElement("td"), this.Wm.style.padding = "0", this.Wm.style.position = "relative";
          const n = document.createElement("div");
          n.style.width = "100%", n.style.height = "100%", n.style.position = "relative", n.style.overflow = "hidden", this.Hm = document.createElement("td"), this.Hm.style.padding = "0", this.Um = document.createElement("td"), this.Um.style.padding = "0", this.Wm.appendChild(n), this.sm = ys(n, size({ width: 16, height: 16 })), this.sm.subscribeSuggestedBitmapSizeChanged(this.Zv);
          const e2 = this.sm.canvasElement;
          e2.style.position = "absolute", e2.style.zIndex = "1", e2.style.left = "0", e2.style.top = "0", this.nm = ys(n, size({ width: 16, height: 16 })), this.nm.subscribeSuggestedBitmapSizeChanged(this.Xv);
          const r2 = this.nm.canvasElement;
          r2.style.position = "absolute", r2.style.zIndex = "2", r2.style.left = "0", r2.style.top = "0", this.Xp = document.createElement("tr"), this.Xp.appendChild(this.Hm), this.Xp.appendChild(this.Wm), this.Xp.appendChild(this.Um), this.$m(), this.$p = new fs(this.nm.canvasElement, this, { dp: () => null === this.Am && !this.Lv.N().handleScroll.vertTouchDrag, fp: () => null === this.Am && !this.Lv.N().handleScroll.horzTouchDrag });
        }
        m() {
          null !== this.km && this.km.m(), null !== this.Pm && this.Pm.m(), this.Tm = null, this.nm.unsubscribeSuggestedBitmapSizeChanged(this.Xv), ks(this.nm.canvasElement), this.nm.dispose(), this.sm.unsubscribeSuggestedBitmapSizeChanged(this.Zv), ks(this.sm.canvasElement), this.sm.dispose(), null !== this.Nm && (this.Nm.nu().u(this), this.Nm.m()), this.$p.m();
        }
        cv() {
          return u(this.Nm);
        }
        qm(t) {
          null !== this.Nm && this.Nm.nu().u(this), this.Nm = t, null !== this.Nm && this.Nm.nu().i(_zs.prototype.Fm.bind(this), this, true), this.$m(), this.Lv.Zp().indexOf(this) === this.Lv.Zp().length - 1 ? (this.Tm = this.Tm ?? new Cs(this.Wm, this.Lv), this.Tm.kt()) : (this.Tm?.Ov(), this.Tm = null);
        }
        Gv() {
          return this.Lv;
        }
        iv() {
          return this.Xp;
        }
        $m() {
          if (null !== this.Nm && (this.jm(), 0 !== this.ns().tn().length)) {
            if (null !== this.km) {
              const t = this.Nm.U_();
              this.km.cs(u(t));
            }
            if (null !== this.Pm) {
              const t = this.Nm.q_();
              this.Pm.cs(u(t));
            }
          }
        }
        Ym() {
          null !== this.km && this.km.kt(), null !== this.Pm && this.Pm.kt();
        }
        E_() {
          return null !== this.Nm ? this.Nm.E_() : 0;
        }
        A_(t) {
          this.Nm && this.Nm.A_(t);
        }
        lp(t) {
          if (!this.Nm) return;
          this.Km();
          const i = t.localX, s = t.localY;
          this.Zm(i, s, t);
        }
        Pp(t) {
          this.Km(), this.Gm(), this.Zm(t.localX, t.localY, t);
        }
        op(t) {
          if (!this.Nm) return;
          this.Km();
          const i = t.localX, s = t.localY;
          this.Zm(i, s, t);
        }
        Sp(t) {
          null !== this.Nm && (this.Km(), this.Xm(t));
        }
        ip(t) {
          null !== this.Nm && this.Jm(this.Vm, t);
        }
        Xf(t) {
          this.ip(t);
        }
        mp(t) {
          this.Km(), this.Qm(t), this.Zm(t.localX, t.localY, t);
        }
        bp(t) {
          null !== this.Nm && (this.Km(), this.Em = false, this.tw(t));
        }
        Mp(t) {
          null !== this.Nm && this.Xm(t);
        }
        Op(t) {
          if (this.Em = true, null === this.Am) {
            const i = { x: t.localX, y: t.localY };
            this.iw(i, i, t);
          }
        }
        zp(t) {
          null !== this.Nm && (this.Km(), this.Nm.Qt().vd(null), this.sw());
        }
        nw() {
          return this.Im;
        }
        ew() {
          return this.Vm;
        }
        Ip() {
          this.Bm = 1, this.ns().dn();
        }
        Vp(t, i) {
          if (!this.Lv.N().handleScale.pinch) return;
          const s = 5 * (i - this.Bm);
          this.Bm = i, this.ns().Td(t._t, s);
        }
        yp(t) {
          this.Em = false, this.Lm = null !== this.Am, this.Gm();
          const i = this.ns().gd();
          null !== this.Am && i.It() && (this.zm = { x: i.si(), y: i.ni() }, this.Am = { x: t.localX, y: t.localY });
        }
        pp(t) {
          if (null === this.Nm) return;
          const i = t.localX, s = t.localY;
          if (null === this.Am) this.Qm(t);
          else {
            this.Lm = false;
            const n = u(this.zm), e2 = n.x + (i - this.Am.x), r2 = n.y + (s - this.Am.y);
            this.Zm(e2, r2, t);
          }
        }
        gp(t) {
          0 === this.Gv().N().trackingMode.exitMode && (this.Lm = true), this.rw(), this.tw(t);
        }
        Qn(t, i) {
          const s = this.Nm;
          return null === s ? null : Di(s, t, i);
        }
        hw(i, s) {
          u("left" === s ? this.km : this.Pm).dm(size({ width: i, height: this.Uv.height }));
        }
        sv() {
          return this.Uv;
        }
        dm(t) {
          equalSizes(this.Uv, t) || (this.Uv = t, this.Kv = true, this.sm.resizeCanvasElement(t), this.nm.resizeCanvasElement(t), this.Kv = false, this.Wm.style.width = t.width + "px", this.Wm.style.height = t.height + "px");
        }
        aw() {
          const t = u(this.Nm);
          t.H_(t.U_()), t.H_(t.q_());
          for (const i of t.Sl()) if (t.Zn(i)) {
            const s = i.Ft();
            null !== s && t.H_(s), i.Ws();
          }
          for (const i of t.ru()) i.Ws();
        }
        nv() {
          return this.sm.bitmapSize;
        }
        ev(t, i, s, n) {
          const e2 = this.nv();
          if (e2.width > 0 && e2.height > 0 && (t.drawImage(this.sm.canvasElement, i, s), n)) {
            const n2 = this.nm.canvasElement;
            null !== t && t.drawImage(n2, i, s);
          }
        }
        pm(t) {
          if (0 === t) return;
          if (null === this.Nm) return;
          t > 1 && this.aw(), null !== this.km && this.km.pm(t), null !== this.Pm && this.Pm.pm(t);
          const i = { colorSpace: this.Lv.N().layout.colorSpace };
          if (1 !== t) {
            this.sm.applySuggestedBitmapSize();
            const t2 = tryCreateCanvasRenderingTarget2D(this.sm, i);
            null !== t2 && (t2.useBitmapCoordinateSpace(((t3) => {
              this.wm(t3);
            })), this.Nm && (this.lw(t2, Bs), this.ow(t2), this.lw(t2, Es), this.lw(t2, As)));
          }
          this.nm.applySuggestedBitmapSize();
          const s = tryCreateCanvasRenderingTarget2D(this.nm, i);
          null !== s && (s.useBitmapCoordinateSpace((({ context: t2, bitmapSize: i2 }) => {
            t2.clearRect(0, 0, i2.width, i2.height);
          })), this._w(s), this.lw(s, Ls), this.lw(s, As));
        }
        uw() {
          return this.km;
        }
        cw() {
          return this.Pm;
        }
        Mm(t, i) {
          this.lw(t, i);
        }
        Fm() {
          null !== this.Nm && this.Nm.nu().u(this), this.Nm = null;
        }
        Xm(t) {
          this.Jm(this.Im, t);
        }
        Jm(t, i) {
          const s = i.localX, n = i.localY;
          t.v() && t.p(this.ns().Et().wc(s), { x: s, y: n }, i);
        }
        wm({ context: t, bitmapSize: i }) {
          const { width: s, height: n } = i, e2 = this.ns(), r2 = e2.$(), h2 = e2.Kd();
          r2 === h2 ? z(t, 0, 0, s, n, h2) : F(t, 0, 0, s, n, r2, h2);
        }
        ow(t) {
          const i = u(this.Nm), s = i.eu().pr().Tt(i);
          null !== s && s.nt(t, false);
        }
        _w(t) {
          this.dw(t, Es, Ts, this.ns().gd());
        }
        lw(t, i) {
          const s = u(this.Nm), n = s.Dt(), e2 = s.ru();
          for (const s2 of e2) this.dw(t, i, Ps, s2);
          for (const s2 of n) this.dw(t, i, Ps, s2);
          for (const s2 of e2) this.dw(t, i, Ts, s2);
          for (const s2 of n) this.dw(t, i, Ts, s2);
        }
        dw(t, i, s, n) {
          const e2 = u(this.Nm), r2 = e2.Qt().pd(), h2 = null !== r2 && r2.hu === n, a2 = null !== r2 && h2 && void 0 !== r2.au ? r2.au.ie : void 0;
          Rs(i, ((i2) => s(i2, t, h2, a2)), n, e2);
        }
        jm() {
          if (null === this.Nm) return;
          const t = this.Lv, i = this.Nm.U_().N().visible, s = this.Nm.q_().N().visible;
          i || null === this.km || (this.Hm.removeChild(this.km.iv()), this.km.m(), this.km = null), s || null === this.Pm || (this.Um.removeChild(this.Pm.iv()), this.Pm.m(), this.Pm = null);
          const n = t.Qt().Nd();
          i && null === this.km && (this.km = new Vs(this, t.N(), n, "left"), this.Hm.appendChild(this.km.iv())), s && null === this.Pm && (this.Pm = new Vs(this, t.N(), n, "right"), this.Um.appendChild(this.Pm.iv()));
        }
        fw(t) {
          return t.Np && this.Em || null !== this.Am;
        }
        Zm(t, i, s) {
          t = Math.max(0, Math.min(t, this.Uv.width - 1)), i = Math.max(0, Math.min(i, this.Uv.height - 1)), this.ns().Ad(t, i, s, u(this.Nm));
        }
        sw() {
          this.ns().zd();
        }
        rw() {
          this.Lm && (this.Am = null, this.sw());
        }
        iw(t, i, s) {
          this.Am = t, this.Lm = false, this.Zm(i.x, i.y, s);
          const n = this.ns().gd();
          this.zm = { x: n.si(), y: n.ni() };
        }
        ns() {
          return this.Lv.Qt();
        }
        tw(t) {
          if (!this.Dm) return;
          const i = this.ns(), s = this.cv();
          if (i.X_(s, s.Rs()), this.Rm = null, this.Dm = false, i.Vd(), null !== this.Om) {
            const t2 = performance.now(), s2 = i.Et();
            this.Om.fe(s2.Cc(), t2), this.Om.Ec(t2) || i.vn(this.Om);
          }
        }
        Km() {
          this.Am = null;
        }
        Gm() {
          if (!this.Nm) return;
          if (this.ns().dn(), document.activeElement !== document.body && document.activeElement !== document.documentElement) u(document.activeElement).blur();
          else {
            const t = document.getSelection();
            null !== t && t.removeAllRanges();
          }
          !this.Nm.Rs().Gi() && this.ns().Et().Gi();
        }
        Qm(t) {
          if (null === this.Nm) return;
          const i = this.ns(), s = i.Et();
          if (s.Gi()) return;
          const n = this.Lv.N(), e2 = n.handleScroll, r2 = n.kineticScroll;
          if ((!e2.pressedMouseMove || t.Np) && (!e2.horzTouchDrag && !e2.vertTouchDrag || !t.Np)) return;
          const h2 = this.Nm.Rs(), a2 = performance.now();
          if (null !== this.Rm || this.fw(t) || (this.Rm = { x: t.clientX, y: t.clientY, cf: a2, pw: t.localX, mw: t.localY }), null !== this.Rm && !this.Dm && (this.Rm.x !== t.clientX || this.Rm.y !== t.clientY)) {
            if (t.Np && r2.touch || !t.Np && r2.mouse) {
              const t2 = s.ul();
              this.Om = new xs(0.2 / t2, 7 / t2, 0.997, 15 / t2), this.Om.Dv(s.Cc(), this.Rm.cf);
            } else this.Om = null;
            h2.Gi() || i.Z_(this.Nm, h2, t.localY), i.Dd(t.localX), this.Dm = true;
          }
          this.Dm && (h2.Gi() || i.G_(this.Nm, h2, t.localY), i.Id(t.localX), null !== this.Om && this.Om.Dv(s.Cc(), a2));
        }
      };
      Os = class {
        constructor(i, s, n, e2, r2) {
          this.xt = true, this.Uv = size({ width: 0, height: 0 }), this.Zv = () => this.pm(3), this.Jv = "left" === i, this.hd = n.Nd, this.Ps = s, this.ww = e2, this.gw = r2, this.Jp = document.createElement("div"), this.Jp.style.width = "25px", this.Jp.style.height = "100%", this.Jp.style.overflow = "hidden", this.sm = ys(this.Jp, size({ width: 16, height: 16 })), this.sm.subscribeSuggestedBitmapSizeChanged(this.Zv);
        }
        m() {
          this.sm.unsubscribeSuggestedBitmapSizeChanged(this.Zv), ks(this.sm.canvasElement), this.sm.dispose();
        }
        iv() {
          return this.Jp;
        }
        sv() {
          return this.Uv;
        }
        dm(t) {
          equalSizes(this.Uv, t) || (this.Uv = t, this.sm.resizeCanvasElement(t), this.Jp.style.width = `${t.width}px`, this.Jp.style.height = `${t.height}px`, this.xt = true);
        }
        pm(t) {
          if (t < 3 && !this.xt) return;
          if (0 === this.Uv.width || 0 === this.Uv.height) return;
          this.xt = false, this.sm.applySuggestedBitmapSize();
          const i = tryCreateCanvasRenderingTarget2D(this.sm, { colorSpace: this.Ps.layout.colorSpace });
          null !== i && i.useBitmapCoordinateSpace(((t2) => {
            this.wm(t2), this.gm(t2);
          }));
        }
        nv() {
          return this.sm.bitmapSize;
        }
        ev(t, i, s) {
          const n = this.nv();
          n.width > 0 && n.height > 0 && t.drawImage(this.sm.canvasElement, i, s);
        }
        gm({ context: t, bitmapSize: i, horizontalPixelRatio: s, verticalPixelRatio: n }) {
          if (!this.ww()) return;
          t.fillStyle = this.Ps.timeScale.borderColor;
          const e2 = Math.floor(this.hd.N().S * s), r2 = Math.floor(this.hd.N().S * n), h2 = this.Jv ? i.width - e2 : 0;
          t.fillRect(h2, 0, e2, r2);
        }
        wm({ context: t, bitmapSize: i }) {
          z(t, 0, 0, i.width, i.height, this.gw());
        }
      };
      Fs = Ns("normal");
      Ws = Ns("top");
      Hs = Ns("bottom");
      Us = class {
        constructor(i, s) {
          this.Mw = null, this.bw = null, this.M = null, this.Sw = false, this.Uv = size({ width: 0, height: 0 }), this.xw = new d(), this.qv = new rt(5), this.Kv = false, this.Zv = () => {
            this.Kv || this.Lv.Qt().dr();
          }, this.Xv = () => {
            this.Kv || this.Lv.Qt().dr();
          }, this.Lv = i, this.cu = s, this.Ps = i.N().layout, this.Vv = document.createElement("tr"), this.Cw = document.createElement("td"), this.Cw.style.padding = "0", this.yw = document.createElement("td"), this.yw.style.padding = "0", this.Jp = document.createElement("td"), this.Jp.style.height = "25px", this.Jp.style.padding = "0", this.kw = document.createElement("div"), this.kw.style.width = "100%", this.kw.style.height = "100%", this.kw.style.position = "relative", this.kw.style.overflow = "hidden", this.Jp.appendChild(this.kw), this.sm = ys(this.kw, size({ width: 16, height: 16 })), this.sm.subscribeSuggestedBitmapSizeChanged(this.Zv);
          const n = this.sm.canvasElement;
          n.style.position = "absolute", n.style.zIndex = "1", n.style.left = "0", n.style.top = "0", this.nm = ys(this.kw, size({ width: 16, height: 16 })), this.nm.subscribeSuggestedBitmapSizeChanged(this.Xv);
          const e2 = this.nm.canvasElement;
          e2.style.position = "absolute", e2.style.zIndex = "2", e2.style.left = "0", e2.style.top = "0", this.Vv.appendChild(this.Cw), this.Vv.appendChild(this.Jp), this.Vv.appendChild(this.yw), this.Pw(), this.Lv.Qt().B_().i(this.Pw.bind(this), this), this.$p = new fs(this.nm.canvasElement, this, { dp: () => true, fp: () => !this.Lv.N().handleScroll.horzTouchDrag });
        }
        m() {
          this.$p.m(), null !== this.Mw && this.Mw.m(), null !== this.bw && this.bw.m(), this.nm.unsubscribeSuggestedBitmapSizeChanged(this.Xv), ks(this.nm.canvasElement), this.nm.dispose(), this.sm.unsubscribeSuggestedBitmapSizeChanged(this.Zv), ks(this.sm.canvasElement), this.sm.dispose();
        }
        iv() {
          return this.Vv;
        }
        Tw() {
          return this.Mw;
        }
        Rw() {
          return this.bw;
        }
        Pp(t) {
          if (this.Sw) return;
          this.Sw = true;
          const i = this.Lv.Qt();
          !i.Et().Gi() && this.Lv.N().handleScale.axisPressedMouseMove.time && i.Pd(t.localX);
        }
        yp(t) {
          this.Pp(t);
        }
        Tp() {
          const t = this.Lv.Qt();
          !t.Et().Gi() && this.Sw && (this.Sw = false, this.Lv.N().handleScale.axisPressedMouseMove.time && t.Ed());
        }
        mp(t) {
          const i = this.Lv.Qt();
          !i.Et().Gi() && this.Lv.N().handleScale.axisPressedMouseMove.time && i.Bd(t.localX);
        }
        pp(t) {
          this.mp(t);
        }
        bp() {
          this.Sw = false;
          const t = this.Lv.Qt();
          t.Et().Gi() && !this.Lv.N().handleScale.axisPressedMouseMove.time || t.Ed();
        }
        gp() {
          this.bp();
        }
        ip() {
          this.Lv.N().handleScale.axisDoubleClickReset.time && this.Lv.Qt().wn();
        }
        Xf() {
          this.ip();
        }
        lp() {
          this.Lv.Qt().N().handleScale.axisPressedMouseMove.time && this.Cm(1);
        }
        zp() {
          this.Cm(0);
        }
        sv() {
          return this.Uv;
        }
        Dw() {
          return this.xw;
        }
        Iw(i, n, e2) {
          equalSizes(this.Uv, i) || (this.Uv = i, this.Kv = true, this.sm.resizeCanvasElement(i), this.nm.resizeCanvasElement(i), this.Kv = false, this.Jp.style.width = `${i.width}px`, this.Jp.style.height = `${i.height}px`, this.xw.p(i)), null !== this.Mw && this.Mw.dm(size({ width: n, height: i.height })), null !== this.bw && this.bw.dm(size({ width: e2, height: i.height }));
        }
        Vw() {
          const t = this.Bw();
          return Math.ceil(t.S + t.C + t.k + t.A + t.I + t.Ew);
        }
        kt() {
          this.Lv.Qt().Et().Vl();
        }
        nv() {
          return this.sm.bitmapSize;
        }
        ev(t, i, s, n) {
          const e2 = this.nv();
          if (e2.width > 0 && e2.height > 0 && (t.drawImage(this.sm.canvasElement, i, s), n)) {
            const n2 = this.nm.canvasElement;
            t.drawImage(n2, i, s);
          }
        }
        pm(t) {
          if (0 === t) return;
          const i = { colorSpace: this.Ps.colorSpace };
          if (1 !== t) {
            this.sm.applySuggestedBitmapSize();
            const s2 = tryCreateCanvasRenderingTarget2D(this.sm, i);
            null !== s2 && (s2.useBitmapCoordinateSpace(((t2) => {
              this.wm(t2), this.gm(t2), this.Aw(s2, Hs);
            })), this.bm(s2), this.Aw(s2, Fs)), null !== this.Mw && this.Mw.pm(t), null !== this.bw && this.bw.pm(t);
          }
          this.nm.applySuggestedBitmapSize();
          const s = tryCreateCanvasRenderingTarget2D(this.nm, i);
          null !== s && (s.useBitmapCoordinateSpace((({ context: t2, bitmapSize: i2 }) => {
            t2.clearRect(0, 0, i2.width, i2.height);
          })), this.Lw([...this.Lv.Qt().tn(), this.Lv.Qt().gd()], s), this.Aw(s, Ws));
        }
        Aw(t, i) {
          const s = this.Lv.Qt().tn();
          for (const n of s) Rs(i, ((i2) => Ps(i2, t, false, void 0)), n, void 0);
          for (const n of s) Rs(i, ((i2) => Ts(i2, t, false, void 0)), n, void 0);
        }
        wm({ context: t, bitmapSize: i }) {
          z(t, 0, 0, i.width, i.height, this.Lv.Qt().Kd());
        }
        gm({ context: t, bitmapSize: i, verticalPixelRatio: s }) {
          if (this.Lv.N().timeScale.borderVisible) {
            t.fillStyle = this.zw();
            const n = Math.max(1, Math.floor(this.Bw().S * s));
            t.fillRect(0, 0, i.width, n);
          }
        }
        bm(t) {
          const i = this.Lv.Qt().Et(), s = i.Vl();
          if (!s || 0 === s.length) return;
          const n = this.cu.maxTickMarkWeight(s), e2 = this.Bw(), r2 = i.N();
          r2.borderVisible && r2.ticksVisible && t.useBitmapCoordinateSpace((({ context: t2, horizontalPixelRatio: i2, verticalPixelRatio: n2 }) => {
            t2.strokeStyle = this.zw(), t2.fillStyle = this.zw();
            const r3 = Math.max(1, Math.floor(i2)), h2 = Math.floor(0.5 * i2);
            t2.beginPath();
            const a2 = Math.round(e2.C * n2);
            for (let n3 = s.length; n3--; ) {
              const e3 = Math.round(s[n3].coord * i2);
              t2.rect(e3 - h2, 0, r3, a2);
            }
            t2.fill();
          })), t.useMediaCoordinateSpace((({ context: t2 }) => {
            const i2 = e2.S + e2.C + e2.A + e2.k / 2;
            t2.textAlign = "center", t2.textBaseline = "middle", t2.fillStyle = this.H(), t2.font = this._m();
            for (const e3 of s) if (e3.weight < n) {
              const s2 = e3.needAlignCoordinate ? this.Ow(t2, e3.coord, e3.label) : e3.coord;
              t2.fillText(e3.label, s2, i2);
            }
            this.Lv.N().timeScale.allowBoldLabels && (t2.font = this.Nw());
            for (const e3 of s) if (e3.weight >= n) {
              const s2 = e3.needAlignCoordinate ? this.Ow(t2, e3.coord, e3.label) : e3.coord;
              t2.fillText(e3.label, s2, i2);
            }
          }));
        }
        Ow(t, i, s) {
          const n = this.qv.Ii(t, s), e2 = n / 2, r2 = Math.floor(i - e2) + 0.5;
          return r2 < 0 ? i += Math.abs(0 - r2) : r2 + n > this.Uv.width && (i -= Math.abs(this.Uv.width - (r2 + n))), i;
        }
        Lw(t, i) {
          const s = this.Bw();
          for (const n of t) for (const t2 of n.fs()) t2.Tt().nt(i, s);
        }
        zw() {
          return this.Lv.N().timeScale.borderColor;
        }
        H() {
          return this.Ps.textColor;
        }
        F() {
          return this.Ps.fontSize;
        }
        _m() {
          return x(this.F(), this.Ps.fontFamily);
        }
        Nw() {
          return x(this.F(), this.Ps.fontFamily, "bold");
        }
        Bw() {
          null === this.M && (this.M = { S: 1, L: NaN, A: NaN, I: NaN, ts: NaN, C: 5, k: NaN, P: "", Qi: new rt(), Ew: 0 });
          const t = this.M, i = this._m();
          if (t.P !== i) {
            const s = this.F();
            t.k = s, t.P = i, t.A = 3 * s / 12, t.I = 3 * s / 12, t.ts = 9 * s / 12, t.L = 0, t.Ew = 4 * s / 12, t.Qi.On();
          }
          return this.M;
        }
        Cm(t) {
          this.Jp.style.cursor = 1 === t ? "ew-resize" : "default";
        }
        Pw() {
          const t = this.Lv.Qt(), i = t.N();
          i.leftPriceScale.visible || null === this.Mw || (this.Cw.removeChild(this.Mw.iv()), this.Mw.m(), this.Mw = null), i.rightPriceScale.visible || null === this.bw || (this.yw.removeChild(this.bw.iv()), this.bw.m(), this.bw = null);
          const s = { Nd: this.Lv.Qt().Nd() }, n = () => i.leftPriceScale.borderVisible && t.Et().N().borderVisible, e2 = () => t.Kd();
          i.leftPriceScale.visible && null === this.Mw && (this.Mw = new Os("left", i, s, n, e2), this.Cw.appendChild(this.Mw.iv())), i.rightPriceScale.visible && null === this.bw && (this.bw = new Os("right", i, s, n, e2), this.yw.appendChild(this.bw.iv()));
        }
      };
      $s = !!os && !!navigator.userAgentData && navigator.userAgentData.brands.some(((t) => t.brand.includes("Chromium"))) && !!os && (navigator?.userAgentData?.platform ? "Windows" === navigator.userAgentData.platform : navigator.userAgent.toLowerCase().indexOf("win") >= 0);
      qs = class {
        constructor(t, i, s) {
          var n;
          this.Fw = [], this.Ww = [], this.Hw = 0, this.eo = 0, this.S_ = 0, this.Uw = 0, this.$w = 0, this.qw = null, this.jw = false, this.Im = new d(), this.Vm = new d(), this.nd = new d(), this.Yw = null, this.Kw = null, this.Av = t, this.Ps = i, this.cu = s, this.Vv = document.createElement("div"), this.Vv.classList.add("tv-lightweight-charts"), this.Vv.style.overflow = "hidden", this.Vv.style.direction = "ltr", this.Vv.style.width = "100%", this.Vv.style.height = "100%", (n = this.Vv).style.userSelect = "none", n.style.webkitUserSelect = "none", n.style.msUserSelect = "none", n.style.MozUserSelect = "none", n.style.webkitTapHighlightColor = "transparent", this.Zw = document.createElement("table"), this.Zw.setAttribute("cellspacing", "0"), this.Vv.appendChild(this.Zw), this.Gw = this.Xw.bind(this), js(this.Ps) && this.Jw(true), this.ns = new Ui(this.rd.bind(this), this.Ps, s), this.Qt().Md().i(this.Qw.bind(this), this), this.tg = new Us(this, this.cu), this.Zw.appendChild(this.tg.iv());
          const e2 = i.autoSize && this.ig();
          let r2 = this.Ps.width, h2 = this.Ps.height;
          if (e2 || 0 === r2 || 0 === h2) {
            const i2 = t.getBoundingClientRect();
            r2 = r2 || i2.width, h2 = h2 || i2.height;
          }
          this.sg(r2, h2), this.ng(), t.appendChild(this.Vv), this.eg(), this.ns.Et().Oc().i(this.ns.Ca.bind(this.ns), this), this.ns.B_().i(this.ns.Ca.bind(this.ns), this);
        }
        Qt() {
          return this.ns;
        }
        N() {
          return this.Ps;
        }
        Zp() {
          return this.Fw;
        }
        rg() {
          return this.tg;
        }
        m() {
          this.Jw(false), 0 !== this.Hw && window.cancelAnimationFrame(this.Hw), this.ns.Md().u(this), this.ns.Et().Oc().u(this), this.ns.B_().u(this), this.ns.m();
          for (const t of this.Fw) this.Zw.removeChild(t.iv()), t.nw().u(this), t.ew().u(this), t.m();
          this.Fw = [];
          for (const t of this.Ww) this.hg(t);
          this.Ww = [], u(this.tg).m(), null !== this.Vv.parentElement && this.Vv.parentElement.removeChild(this.Vv), this.nd.m(), this.Im.m(), this.Vm.m(), this.ag();
        }
        sg(i, s, n = false) {
          if (this.eo === s && this.S_ === i) return;
          const e2 = (function(i2) {
            const s2 = Math.floor(i2.width), n2 = Math.floor(i2.height);
            return size({ width: s2 - s2 % 2, height: n2 - n2 % 2 });
          })(size({ width: i, height: s }));
          this.eo = e2.height, this.S_ = e2.width;
          const r2 = this.eo + "px", h2 = this.S_ + "px";
          u(this.Vv).style.height = r2, u(this.Vv).style.width = h2, this.Zw.style.height = r2, this.Zw.style.width = h2, n ? this.lg(X.yn(), performance.now()) : this.ns.Ca();
        }
        pm(t) {
          void 0 === t && (t = X.yn());
          for (let i = 0; i < this.Fw.length; i++) this.Fw[i].pm(t.un(i).an);
          this.Ps.timeScale.visible && this.tg.pm(t._n());
        }
        cr(t) {
          const i = js(this.Ps);
          this.ns.cr(t);
          const s = js(this.Ps);
          s !== i && this.Jw(s), t.layout?.panes && this.og(), this.eg(), this._g(t);
        }
        nw() {
          return this.Im;
        }
        ew() {
          return this.Vm;
        }
        Md() {
          return this.nd;
        }
        ug(t = false) {
          null !== this.qw && (this.lg(this.qw, performance.now()), this.qw = null);
          const i = this.cg(null), s = document.createElement("canvas");
          s.width = i.width, s.height = i.height;
          const n = u(s.getContext("2d"));
          return this.cg(n, t), s;
        }
        dg(t) {
          if ("left" === t && !this.fg()) return 0;
          if ("right" === t && !this.pg()) return 0;
          if (0 === this.Fw.length) return 0;
          return u("left" === t ? this.Fw[0].uw() : this.Fw[0].cw()).fm();
        }
        vg() {
          return this.Ps.autoSize && null !== this.Yw;
        }
        hv() {
          return this.Vv;
        }
        mg(t) {
          this.Kw = t, this.Kw ? this.hv().style.setProperty("cursor", t) : this.hv().style.removeProperty("cursor");
        }
        wg() {
          return this.Kw;
        }
        gg(t) {
          return _(this.Fw[t]).sv();
        }
        og() {
          this.Ww.forEach(((t) => {
            t.kt();
          }));
        }
        _g(t) {
          (void 0 !== t.autoSize || !this.Yw || void 0 === t.width && void 0 === t.height) && (t.autoSize && !this.Yw && this.ig(), false === t.autoSize && null !== this.Yw && this.ag(), t.autoSize || void 0 === t.width && void 0 === t.height || this.sg(t.width || this.S_, t.height || this.eo));
        }
        cg(i, s) {
          let n = 0, e2 = 0;
          const r2 = this.Fw[0], h2 = (t, n2) => {
            let e3 = 0;
            for (let r3 = 0; r3 < this.Fw.length; r3++) {
              const h3 = this.Fw[r3], a3 = u("left" === t ? h3.uw() : h3.cw()), l2 = a3.nv();
              if (null !== i && a3.ev(i, n2, e3, s), e3 += l2.height, r3 < this.Fw.length - 1) {
                const t2 = this.Ww[r3], s2 = t2.nv();
                null !== i && t2.ev(i, n2, e3), e3 += s2.height;
              }
            }
          };
          if (this.fg()) {
            h2("left", 0);
            n += u(r2.uw()).nv().width;
          }
          for (let t = 0; t < this.Fw.length; t++) {
            const r3 = this.Fw[t], h3 = r3.nv();
            if (null !== i && r3.ev(i, n, e2, s), e2 += h3.height, t < this.Fw.length - 1) {
              const s2 = this.Ww[t], r4 = s2.nv();
              null !== i && s2.ev(i, n, e2), e2 += r4.height;
            }
          }
          if (n += r2.nv().width, this.pg()) {
            h2("right", n);
            n += u(r2.cw()).nv().width;
          }
          const a2 = (t, s2, n2) => {
            u("left" === t ? this.tg.Tw() : this.tg.Rw()).ev(u(i), s2, n2);
          };
          if (this.Ps.timeScale.visible) {
            const t = this.tg.nv();
            if (null !== i) {
              let n2 = 0;
              this.fg() && (a2("left", n2, e2), n2 = u(r2.uw()).nv().width), this.tg.ev(i, n2, e2, s), n2 += t.width, this.pg() && a2("right", n2, e2);
            }
            e2 += t.height;
          }
          return size({ width: n, height: e2 });
        }
        Mg() {
          let i = 0, s = 0, n = 0;
          for (const t of this.Fw) this.fg() && (s = Math.max(s, u(t.uw()).om(), this.Ps.leftPriceScale.minimumWidth)), this.pg() && (n = Math.max(n, u(t.cw()).om(), this.Ps.rightPriceScale.minimumWidth)), i += t.E_();
          s = cs(s), n = cs(n);
          const e2 = this.S_, r2 = this.eo, h2 = Math.max(e2 - s - n, 0), a2 = 1 * this.Ww.length, l2 = this.Ps.timeScale.visible;
          let o2 = l2 ? Math.max(this.tg.Vw(), this.Ps.timeScale.minimumHeight) : 0;
          var _2;
          o2 = (_2 = o2) + _2 % 2;
          const c2 = a2 + o2, d2 = r2 < c2 ? 0 : r2 - c2, f2 = d2 / i;
          let p2 = 0;
          const v2 = window.devicePixelRatio || 1;
          for (let i2 = 0; i2 < this.Fw.length; ++i2) {
            const e3 = this.Fw[i2];
            e3.qm(this.ns.Xs()[i2]);
            let r3 = 0, a3 = 0;
            a3 = i2 === this.Fw.length - 1 ? Math.ceil((d2 - p2) * v2) / v2 : Math.round(e3.E_() * f2 * v2) / v2, r3 = Math.max(a3, 2), p2 += r3, e3.dm(size({ width: h2, height: r3 })), this.fg() && e3.hw(s, "left"), this.pg() && e3.hw(n, "right"), e3.cv() && this.ns.bd(e3.cv(), r3);
          }
          this.tg.Iw(size({ width: l2 ? h2 : 0, height: o2 }), l2 ? s : 0, l2 ? n : 0), this.ns.L_(h2), this.Uw !== s && (this.Uw = s), this.$w !== n && (this.$w = n);
        }
        Jw(t) {
          t ? this.Vv.addEventListener("wheel", this.Gw, { passive: false }) : this.Vv.removeEventListener("wheel", this.Gw);
        }
        bg(t) {
          switch (t.deltaMode) {
            case t.DOM_DELTA_PAGE:
              return 120;
            case t.DOM_DELTA_LINE:
              return 32;
          }
          return $s ? 1 / window.devicePixelRatio : 1;
        }
        Xw(t) {
          if (!(0 !== t.deltaX && this.Ps.handleScroll.mouseWheel || 0 !== t.deltaY && this.Ps.handleScale.mouseWheel)) return;
          const i = this.bg(t), s = i * t.deltaX / 100, n = -i * t.deltaY / 100;
          if (t.cancelable && t.preventDefault(), 0 !== n && this.Ps.handleScale.mouseWheel) {
            const i2 = Math.sign(n) * Math.min(1, Math.abs(n)), s2 = t.clientX - this.Vv.getBoundingClientRect().left;
            this.Qt().Td(s2, i2);
          }
          0 !== s && this.Ps.handleScroll.mouseWheel && this.Qt().Rd(-80 * s);
        }
        lg(t, i) {
          const s = t._n();
          3 === s && this.Sg(), 3 !== s && 2 !== s || (this.xg(t), this.Cg(t, i), this.tg.kt(), this.Fw.forEach(((t2) => {
            t2.Ym();
          })), 3 === this.qw?._n() && (this.qw.Sn(t), this.Sg(), this.xg(this.qw), this.Cg(this.qw, i), t = this.qw, this.qw = null)), this.pm(t);
        }
        Cg(t, i) {
          for (const s of t.bn()) this.xn(s, i);
        }
        xg(t) {
          const i = this.ns.Xs();
          for (let s = 0; s < i.length; s++) t.un(s).ln && i[s].tu();
        }
        xn(t, i) {
          const s = this.ns.Et();
          switch (t.fn) {
            case 0:
              s.Fc();
              break;
            case 1:
              s.Wc(t.Wt);
              break;
            case 2:
              s.gn(t.Wt);
              break;
            case 3:
              s.Mn(t.Wt);
              break;
            case 4:
              s.Pc();
              break;
            case 5:
              t.Wt.Ec(i) || s.Mn(t.Wt.Ac(i));
          }
        }
        rd(t) {
          null !== this.qw ? this.qw.Sn(t) : this.qw = t, this.jw || (this.jw = true, this.Hw = window.requestAnimationFrame(((t2) => {
            if (this.jw = false, this.Hw = 0, null !== this.qw) {
              const i = this.qw;
              this.qw = null, this.lg(i, t2);
              for (const s of i.bn()) if (5 === s.fn && !s.Wt.Ec(t2)) {
                this.Qt().vn(s.Wt);
                break;
              }
            }
          })));
        }
        Sg() {
          this.ng();
        }
        hg(t) {
          this.Zw.removeChild(t.iv()), t.m();
        }
        ng() {
          const t = this.ns.Xs(), i = t.length, s = this.Fw.length;
          for (let t2 = i; t2 < s; t2++) {
            const t3 = _(this.Fw.pop());
            this.Zw.removeChild(t3.iv()), t3.nw().u(this), t3.ew().u(this), t3.m();
            const i2 = this.Ww.pop();
            void 0 !== i2 && this.hg(i2);
          }
          for (let n = s; n < i; n++) {
            const i2 = new zs(this, t[n]);
            if (i2.nw().i(this.yg.bind(this, i2), this), i2.ew().i(this.kg.bind(this, i2), this), this.Fw.push(i2), n > 0) {
              const t2 = new Ms(this, n - 1, n);
              this.Ww.push(t2), this.Zw.insertBefore(t2.iv(), this.tg.iv());
            }
            this.Zw.insertBefore(i2.iv(), this.tg.iv());
          }
          for (let s2 = 0; s2 < i; s2++) {
            const i2 = t[s2], n = this.Fw[s2];
            n.cv() !== i2 ? n.qm(i2) : n.$m();
          }
          this.eg(), this.Mg();
        }
        Pg(t, i, s, n) {
          const e2 = /* @__PURE__ */ new Map();
          if (null !== t) {
            this.ns.tn().forEach(((i2) => {
              const s2 = i2.qs().$s(t);
              null !== s2 && e2.set(i2, s2);
            }));
          }
          let r2;
          if (null !== t) {
            const i2 = this.ns.Et().es(t)?.originalTime;
            void 0 !== i2 && (r2 = i2);
          }
          const h2 = this.Qt().pd(), a2 = null !== h2 && h2.hu instanceof Jt ? h2.hu : void 0, l2 = null !== h2 && void 0 !== h2.au ? h2.au.te : void 0, o2 = this.Tg(n);
          return { Gr: r2, js: t ?? void 0, Rg: i ?? void 0, Dg: -1 !== o2 ? o2 : void 0, Ig: a2, Vg: e2, Bg: l2, Eg: s ?? void 0 };
        }
        Tg(t) {
          let i = -1;
          if (t) i = this.Fw.indexOf(t);
          else {
            const t2 = this.Qt().gd().Gs();
            null !== t2 && (i = this.Qt().Xs().indexOf(t2));
          }
          return i;
        }
        yg(t, i, s, n) {
          this.Im.p((() => this.Pg(i, s, n, t)));
        }
        kg(t, i, s, n) {
          this.Vm.p((() => this.Pg(i, s, n, t)));
        }
        Qw(t, i, s) {
          this.mg(this.Qt().pd()?.ou ?? null), this.nd.p((() => this.Pg(t, i, s)));
        }
        eg() {
          const t = this.Ps.timeScale.visible ? "" : "none";
          this.tg.iv().style.display = t;
        }
        fg() {
          return this.Fw[0].cv().U_().N().visible;
        }
        pg() {
          return this.Fw[0].cv().q_().N().visible;
        }
        ig() {
          return "ResizeObserver" in window && (this.Yw = new ResizeObserver(((t) => {
            const i = t[t.length - 1];
            i && this.sg(i.contentRect.width, i.contentRect.height);
          })), this.Yw.observe(this.Av, { box: "border-box" }), true);
        }
        ag() {
          null !== this.Yw && this.Yw.disconnect(), this.Yw = null;
        }
      };
      on = class {
        constructor(t) {
          this.Ng = /* @__PURE__ */ new Map(), this.Fg = /* @__PURE__ */ new Map(), this.Wg = /* @__PURE__ */ new Map(), this.Hg = [], this.cu = t;
        }
        m() {
          this.Ng.clear(), this.Fg.clear(), this.Wg.clear(), this.Hg = [];
        }
        Ug(t, i) {
          let s = 0 !== this.Ng.size, n = false;
          const e2 = this.Fg.get(t);
          if (void 0 !== e2) if (1 === this.Fg.size) s = false, n = true, this.Ng.clear();
          else for (const i2 of this.Hg) i2.pointData.Lg.delete(t) && (n = true);
          let r2 = [];
          if (0 !== i.length) {
            const s2 = i.map(((t2) => t2.time)), e3 = this.cu.createConverterToInternalObj(i), h3 = rn(t.wh()), a2 = t.rl(), l2 = t.hl();
            r2 = i.map(((i2, r3) => {
              const o2 = e3(i2.time), _2 = this.cu.key(o2);
              let u2 = this.Ng.get(_2);
              void 0 === u2 && (u2 = hn(o2), this.Ng.set(_2, u2), n = true);
              const c2 = h3(o2, u2.js, i2, s2[r3], a2, l2);
              return u2.Lg.set(t, c2), c2;
            }));
          }
          s && this.$g(), this.qg(t, r2);
          let h2 = -1;
          if (n) {
            const t2 = [];
            this.Ng.forEach(((i2) => {
              t2.push({ timeWeight: 0, time: i2.Ea, pointData: i2, originalTime: ln(i2.Lg) });
            })), t2.sort(((t3, i2) => this.cu.key(t3.time) - this.cu.key(i2.time))), h2 = this.jg(t2);
          }
          return this.Yg(t, h2, (function(t2, i2, s2) {
            const n2 = an(t2, s2), e3 = an(i2, s2);
            if (void 0 !== n2 && void 0 !== e3) return { Kg: false, Ta: n2.Og >= e3.Og && n2.zg >= e3.zg };
          })(this.Fg.get(t), e2, this.cu));
        }
        Hd(t) {
          return this.Ug(t, []);
        }
        Zg(t, i, s) {
          if (s && t.La()) throw new Error("Historical updates are not supported when conflation is enabled. Conflation requires data to be processed in order.");
          const n = i;
          !(function(t2) {
            void 0 === t2.Gr && (t2.Gr = t2.time);
          })(n), this.cu.preprocessData(i);
          const e2 = this.cu.createConverterToInternalObj([i])(i.time), r2 = this.Wg.get(t);
          if (!s && void 0 !== r2 && this.cu.key(e2) < this.cu.key(r2)) throw new Error(`Cannot update oldest data, last time=${r2}, new time=${e2}`);
          let h2 = this.Ng.get(this.cu.key(e2));
          if (s && void 0 === h2) throw new Error("Cannot update non-existing data point when historicalUpdate is true");
          const a2 = void 0 === h2;
          void 0 === h2 && (h2 = hn(e2), this.Ng.set(this.cu.key(e2), h2));
          const l2 = rn(t.wh()), o2 = t.rl(), _2 = t.hl(), u2 = l2(e2, h2.js, i, n.Gr, o2, _2), c2 = !s && !a2 && void 0 !== r2 && this.cu.key(e2) === this.cu.key(r2);
          h2.Lg.set(t, u2), s ? this.Gg(t, u2, h2.js) : c2 && t.La() && sn(u2) ? (t.kr(u2), this.Xg(t, u2)) : this.Xg(t, u2);
          const d2 = { Ta: sn(u2), Kg: s };
          if (!a2) return this.Yg(t, -1, d2);
          const f2 = { timeWeight: 0, time: h2.Ea, pointData: h2, originalTime: ln(h2.Lg) }, p2 = Rt(this.Hg, this.cu.key(f2.time), ((t2, i2) => this.cu.key(t2.time) < i2));
          this.Hg.splice(p2, 0, f2);
          for (let t2 = p2; t2 < this.Hg.length; ++t2) _n(this.Hg[t2].pointData, t2);
          return this.cu.fillWeightsForPoints(this.Hg, p2), this.Yg(t, p2, d2);
        }
        Jg(t, i) {
          const s = this.Fg.get(t);
          if (void 0 === s || i <= 0) return [[], this.Qg()];
          i = Math.min(i, s.length);
          const n = s.splice(-i).reverse();
          0 === s.length ? this.Wg.delete(t) : this.Wg.set(t, s[s.length - 1].wt);
          for (const i2 of n) {
            const s2 = this.Ng.get(this.cu.key(i2.wt));
            if (s2 && (s2.Lg.delete(t), 0 === s2.Lg.size)) {
              this.Ng.delete(this.cu.key(s2.Ea)), this.Hg.splice(s2.js, 1);
              for (let t2 = s2.js; t2 < this.Hg.length; ++t2) _n(this.Hg[t2].pointData, t2);
            }
          }
          return [n, this.Yg(t, this.Hg.length - 1, { Kg: false, Ta: false })];
        }
        Xg(t, i) {
          let s = this.Fg.get(t);
          void 0 === s && (s = [], this.Fg.set(t, s));
          const n = 0 !== s.length ? s[s.length - 1] : null;
          null === n || this.cu.key(i.wt) > this.cu.key(n.wt) ? sn(i) && s.push(i) : sn(i) ? s[s.length - 1] = i : s.splice(-1, 1), this.Wg.set(t, i.wt);
        }
        Gg(t, i, s) {
          const n = this.Fg.get(t);
          if (void 0 === n) return;
          const e2 = Rt(n, s, ((t2, i2) => t2.js < i2));
          sn(i) ? n[e2] = i : n.splice(e2, 1);
        }
        qg(t, i) {
          0 !== i.length ? (this.Fg.set(t, i.filter(sn)), this.Wg.set(t, i[i.length - 1].wt)) : (this.Fg.delete(t), this.Wg.delete(t));
        }
        $g() {
          for (const t of this.Hg) 0 === t.pointData.Lg.size && this.Ng.delete(this.cu.key(t.time));
        }
        jg(t) {
          let i = -1;
          for (let s = 0; s < this.Hg.length && s < t.length; ++s) {
            const n = this.Hg[s], e2 = t[s];
            if (this.cu.key(n.time) !== this.cu.key(e2.time)) {
              i = s;
              break;
            }
            e2.timeWeight = n.timeWeight, _n(e2.pointData, s);
          }
          if (-1 === i && this.Hg.length !== t.length && (i = Math.min(this.Hg.length, t.length)), -1 === i) return -1;
          for (let s = i; s < t.length; ++s) _n(t[s].pointData, s);
          return this.cu.fillWeightsForPoints(t, i), this.Hg = t, i;
        }
        tM() {
          if (0 === this.Fg.size) return null;
          let t = 0;
          return this.Fg.forEach(((i) => {
            0 !== i.length && (t = Math.max(t, i[i.length - 1].js));
          })), t;
        }
        Yg(t, i, s) {
          const n = this.Qg();
          if (-1 !== i) this.Fg.forEach(((i2, e2) => {
            n.F_.set(e2, { le: i2, iM: e2 === t ? s : void 0 });
          })), this.Fg.has(t) || n.F_.set(t, { le: [], iM: s }), n.Et.sM = this.Hg, n.Et.nM = i;
          else {
            const i2 = this.Fg.get(t);
            n.F_.set(t, { le: i2 || [], iM: s });
          }
          return n;
        }
        Qg() {
          return { F_: /* @__PURE__ */ new Map(), Et: { vc: this.tM() } };
        }
      };
      fn = class {
        constructor(t, i, s) {
          this.eM = true, this.rM = true, this.hM = true, this.aM = [], this.lM = null, this.oM = -1, this.ee = t, this.re = i, this._M = s;
        }
        kt(t) {
          this.eM = true, "data" === t && (this.rM = true), "options" === t && (this.hM = true);
        }
        Tt() {
          return this.ee.It() ? (this.uM(), null === this.lM ? null : this.cM) : null;
        }
        dM() {
          this.aM = this.aM.map(((t) => ({ ...t, ...this.ee.ga().gh(t.wt) })));
        }
        fM() {
          this.lM = null;
        }
        uM() {
          const t = this.re.Et(), i = t.N().enableConflation ? t.Hc() : 0;
          i !== this.oM && (this.rM = true, this.oM = i), this.rM && (this.pM(), this.rM = false), this.hM && (this.dM(), this.hM = false), this.eM && (this.vM(), this.eM = false);
        }
        vM() {
          const t = this.ee.Ft(), i = this.re.Et();
          if (this.fM(), i.Gi() || t.Gi()) return;
          const s = i.Ie();
          if (null === s) return;
          if (0 === this.ee.qs().yh()) return;
          const n = this.ee.Lt();
          null !== n && (this.lM = dn(this.aM, s, this._M), this.mM(t, i, n.Wt), this.wM());
        }
      };
      pn = class {
        constructor(t, i) {
          this.gM = t, this.Ki = i;
        }
        nt(t, i, s) {
          this.gM.draw(t, this.Ki, i, s);
        }
      };
      vn = class extends fn {
        constructor(t, i, s) {
          super(t, i, false), this.$h = s, this.cM = new pn(this.$h.renderer(), ((i2) => {
            const s2 = t.Lt();
            return null === s2 ? null : t.Ft().Nt(i2, s2.Wt);
          }));
        }
        get ma() {
          return this.$h.conflationReducer;
        }
        Oa(t) {
          return this.$h.priceValueBuilder(t);
        }
        al(t) {
          return this.$h.isWhitespace(t);
        }
        pM() {
          const t = this.ee.ga();
          this.aM = this.ee.Na().Dh().map(((i) => ({ wt: i.js, _t: NaN, ...t.gh(i.js), MM: i.le })));
        }
        mM(t, i) {
          i.mc(this.aM, b(this.lM));
        }
        wM() {
          this.$h.update({ bars: this.aM.map(mn), barSpacing: this.re.Et().ul(), visibleRange: this.lM, conflationFactor: this.re.Et().Hc() }, this.ee.N());
        }
      };
      wn = { color: "#2196f3" };
      gn = (t, i, s) => {
        const n = c(s);
        return new vn(t, i, n);
      };
      Rn = { vertLine: { color: "#9598A1", width: 1, style: 3, visible: true, labelVisible: true, labelBackgroundColor: "#131722" }, horzLine: { color: "#9598A1", width: 1, style: 3, visible: true, labelVisible: true, labelBackgroundColor: "#131722" }, mode: 1, doNotSnapToHiddenSeriesIndices: false };
      Dn = { vertLines: { color: "#D6DCDE", style: 0, visible: true }, horzLines: { color: "#D6DCDE", style: 0, visible: true } };
      In = { background: { type: "solid", color: "#FFFFFF" }, textColor: "#191919", fontSize: 12, fontFamily: S, panes: { enableResize: true, separatorColor: "#E0E3EB", separatorHoverColor: "rgba(178, 181, 189, 0.2)" }, attributionLogo: true, colorSpace: "srgb", colorParsers: [] };
      Vn = { autoScale: true, mode: 0, invertScale: false, alignLabels: true, borderVisible: true, borderColor: "#2B2B43", entireTextOnly: false, visible: false, ticksVisible: false, scaleMargins: { bottom: 0.1, top: 0.2 }, minimumWidth: 0, ensureEdgeTickMarksVisible: false };
      Bn = { rightOffset: 0, barSpacing: 6, minBarSpacing: 0.5, maxBarSpacing: 0, fixLeftEdge: false, fixRightEdge: false, lockVisibleTimeRangeOnResize: false, rightBarStaysOnScroll: false, borderVisible: true, borderColor: "#2B2B43", visible: true, timeVisible: false, secondsVisible: true, shiftVisibleRangeOnNewBar: true, allowShiftVisibleRangeOnWhitespaceReplacement: false, ticksVisible: false, uniformDistribution: false, minimumHeight: 0, allowBoldLabels: true, ignoreWhitespaceIndices: false, enableConflation: false, conflationThresholdFactor: 1, precomputeConflationOnInit: false, precomputeConflationPriority: "background" };
      An = class {
        constructor(t, i, s) {
          this.Yp = t, this.bM = i, this.SM = s ?? 0;
        }
        applyOptions(t) {
          this.Yp.Qt().md(this.bM, t, this.SM);
        }
        options() {
          return this.Ki().N();
        }
        width() {
          return G(this.bM) ? this.Yp.dg(this.bM) : 0;
        }
        setVisibleRange(t) {
          this.setAutoScale(false), this.Ki().$o(new mt(t.from, t.to));
        }
        getVisibleRange() {
          let t, i, s = this.Ki().er();
          if (null === s) return null;
          if (this.Ki().io()) {
            const n = this.Ki().m_(), e2 = $i(n);
            s = vi(s, this.Ki().no()), t = Number((Math.round(s.Ze() / n) * n).toFixed(e2)), i = Number((Math.round(s.Ge() / n) * n).toFixed(e2));
          } else t = s.Ze(), i = s.Ge();
          return { from: t, to: i };
        }
        setAutoScale(t) {
          this.applyOptions({ autoScale: t });
        }
        Ki() {
          return u(this.Yp.Qt().wd(this.bM, this.SM)).Ft;
        }
      };
      Ln = class {
        constructor(t, i, s, n) {
          this.Yp = t, this.yt = s, this.xM = i, this.CM = n;
        }
        getHeight() {
          return this.yt.$t();
        }
        setHeight(t) {
          const i = this.Yp.Qt(), s = i.Gd(this.yt);
          i.xd(s, t);
        }
        getStretchFactor() {
          return this.yt.E_();
        }
        setStretchFactor(t) {
          this.yt.A_(t), this.Yp.Qt().Ca();
        }
        paneIndex() {
          return this.Yp.Qt().Gd(this.yt);
        }
        moveTo(t) {
          const i = this.paneIndex();
          i !== t && (o(t >= 0 && t < this.Yp.Zp().length, "Invalid pane index"), this.Yp.Qt().yd(i, t));
        }
        getSeries() {
          return this.yt.F_().map(((t) => this.xM(t))) ?? [];
        }
        getHTMLElement() {
          const t = this.Yp.Zp();
          return t && 0 !== t.length && t[this.paneIndex()] ? t[this.paneIndex()].iv() : null;
        }
        attachPrimitive(t) {
          this.yt.nl(t), t.attached && t.attached({ chart: this.CM, requestUpdate: () => this.yt.Qt().Ca() });
        }
        detachPrimitive(t) {
          this.yt.el(t);
        }
        priceScale(t) {
          if (null === this.yt.V_(t)) throw new Error(`Cannot find price scale with id: ${t}`);
          return new An(this.Yp, t, this.paneIndex());
        }
        setPreserveEmptyPane(t) {
          this.yt.O_(t);
        }
        preserveEmptyPane() {
          return this.yt.N_();
        }
        addCustomSeries(t, i = {}, s = 0) {
          return this.CM.addCustomSeries(t, i, s);
        }
        addSeries(t, i = {}) {
          return this.CM.addSeries(t, i, this.paneIndex());
        }
      };
      zn = { color: "#FF0000", price: 0, lineStyle: 2, lineWidth: 1, lineVisible: true, axisLabelVisible: true, title: "", axisLabelColor: "", axisLabelTextColor: "" };
      On = class {
        constructor(t) {
          this.hr = t;
        }
        applyOptions(t) {
          this.hr.cr(t);
        }
        options() {
          return this.hr.N();
        }
        yM() {
          return this.hr;
        }
      };
      Nn = class {
        constructor(t, i, s, n, e2, r2) {
          this.kM = new d(), this.ee = t, this.PM = i, this.TM = s, this.cu = e2, this.CM = n, this.RM = r2;
        }
        m() {
          this.kM.m();
        }
        priceFormatter() {
          return this.ee.Xa();
        }
        priceToCoordinate(t) {
          const i = this.ee.Lt();
          return null === i ? null : this.ee.Ft().Nt(t, i.Wt);
        }
        coordinateToPrice(t) {
          const i = this.ee.Lt();
          return null === i ? null : this.ee.Ft().Ds(t, i.Wt);
        }
        barsInLogicalRange(t) {
          if (null === t) return null;
          const i = new Ai(new Vi(t.from, t.to)).Ru(), s = this.ee.qs();
          if (s.Gi()) return null;
          const n = s.$s(i.Aa(), 1), e2 = s.$s(i.bi(), -1), r2 = u(s.kh()), h2 = u(s.sn());
          if (null !== n && null !== e2 && n.js > e2.js) return { barsBefore: t.from - r2, barsAfter: h2 - t.to };
          const a2 = { barsBefore: null === n || n.js === r2 ? t.from - r2 : n.js - r2, barsAfter: null === e2 || e2.js === h2 ? h2 - t.to : h2 - e2.js };
          return null !== n && null !== e2 && (a2.from = n.Gr, a2.to = e2.Gr), a2;
        }
        setData(t) {
          this.cu, this.ee.wh(), this.PM.DM(this.ee, t), this.IM("full");
        }
        update(t, i = false) {
          this.ee.wh(), this.PM.VM(this.ee, t, i), this.IM("update");
        }
        pop(t = 1) {
          const i = this.PM.BM(this.ee, t);
          0 !== i.length && this.IM("update");
          const s = Pn(this.seriesType());
          return i.map(((t2) => s(t2)));
        }
        dataByIndex(t, i) {
          const s = this.ee.qs().$s(t, i);
          if (null === s) return null;
          return Pn(this.seriesType())(s);
        }
        data() {
          const t = Pn(this.seriesType());
          return this.ee.qs().Dh().map(((i) => t(i)));
        }
        subscribeDataChanged(t) {
          this.kM.i(t);
        }
        unsubscribeDataChanged(t) {
          this.kM._(t);
        }
        applyOptions(t) {
          this.ee.cr(t);
        }
        options() {
          return g(this.ee.N());
        }
        priceScale() {
          return this.TM.priceScale(this.ee.Ft().ol(), this.getPane().paneIndex());
        }
        createPriceLine(t) {
          const i = f(g(zn), t), s = this.ee.Da(i);
          return new On(s);
        }
        removePriceLine(t) {
          this.ee.Ia(t.yM());
        }
        priceLines() {
          return this.ee.Va().map(((t) => new On(t)));
        }
        seriesType() {
          return this.ee.wh();
        }
        lastValueData(t) {
          const i = this.ee.Ve(t);
          return i.Be ? { noData: true } : { noData: false, price: i.gt, color: i.R };
        }
        attachPrimitive(t) {
          this.ee.nl(t), t.attached && t.attached({ chart: this.CM, series: this, requestUpdate: () => this.ee.Qt().Ca(), horzScaleBehavior: this.cu });
        }
        detachPrimitive(t) {
          this.ee.el(t), t.detached && t.detached(), this.ee.Qt().Ca();
        }
        getPane() {
          const t = this.ee, i = u(this.ee.Qt().Kn(t));
          return this.RM(i);
        }
        moveToPane(t) {
          this.ee.Qt().jd(this.ee, t);
        }
        seriesOrder() {
          const t = this.ee.Qt().Kn(this.ee);
          return null === t ? -1 : t.F_().indexOf(this.ee);
        }
        setSeriesOrder(t) {
          const i = this.ee.Qt().Kn(this.ee);
          null !== i && i.su(this.ee, t);
        }
        IM(t) {
          this.kM.v() && this.kM.p(t);
        }
      };
      Fn = class {
        constructor(t, i, s) {
          this.EM = new d(), this.Nu = new d(), this.xw = new d(), this.ns = t, this.Jh = t.Et(), this.tg = i, this.Jh.Lc().i(this.AM.bind(this)), this.Jh.zc().i(this.LM.bind(this)), this.tg.Dw().i(this.zM.bind(this)), this.cu = s;
        }
        m() {
          this.Jh.Lc().u(this), this.Jh.zc().u(this), this.tg.Dw().u(this), this.EM.m(), this.Nu.m(), this.xw.m();
        }
        scrollPosition() {
          return this.Jh.Cc();
        }
        scrollToPosition(t, i) {
          i ? this.Jh.Bc(t, 1e3) : this.ns.Mn(t);
        }
        scrollToRealTime() {
          this.Jh.Vc();
        }
        getVisibleRange() {
          const t = this.Jh.lc();
          return null === t ? null : { from: t.from.originalTime, to: t.to.originalTime };
        }
        setVisibleRange(t) {
          const i = { from: this.cu.convertHorzItemToInternal(t.from), to: this.cu.convertHorzItemToInternal(t.to) }, s = this.Jh.cc(i);
          this.ns.$d(s);
        }
        getVisibleLogicalRange() {
          const t = this.Jh.ac();
          return null === t ? null : { from: t.Aa(), to: t.bi() };
        }
        setVisibleLogicalRange(t) {
          o(t.from <= t.to, "The from index cannot be after the to index."), this.ns.$d(t);
        }
        resetTimeScale() {
          this.ns.wn();
        }
        fitContent() {
          this.ns.Fc();
        }
        logicalToCoordinate(t) {
          const i = this.ns.Et();
          return i.Gi() ? null : i.qt(t);
        }
        coordinateToLogical(t) {
          return this.Jh.Gi() ? null : this.Jh.wc(t);
        }
        timeToIndex(t, i) {
          const s = this.cu.convertHorzItemToInternal(t);
          return this.Jh.ec(s, i);
        }
        timeToCoordinate(t) {
          const i = this.timeToIndex(t, false);
          return null === i ? null : this.Jh.qt(i);
        }
        coordinateToTime(t) {
          const i = this.ns.Et(), s = i.wc(t), n = i.es(s);
          return null === n ? null : n.originalTime;
        }
        width() {
          return this.tg.sv().width;
        }
        height() {
          return this.tg.sv().height;
        }
        subscribeVisibleTimeRangeChange(t) {
          this.EM.i(t);
        }
        unsubscribeVisibleTimeRangeChange(t) {
          this.EM._(t);
        }
        subscribeVisibleLogicalRangeChange(t) {
          this.Nu.i(t);
        }
        unsubscribeVisibleLogicalRangeChange(t) {
          this.Nu._(t);
        }
        subscribeSizeChange(t) {
          this.xw.i(t);
        }
        unsubscribeSizeChange(t) {
          this.xw._(t);
        }
        applyOptions(t) {
          this.Jh.cr(t);
        }
        options() {
          return { ...g(this.Jh.N()), barSpacing: this.Jh.ul() };
        }
        AM() {
          this.EM.v() && this.EM.p(this.getVisibleRange());
        }
        LM() {
          this.Nu.v() && this.Nu.p(this.getVisibleLogicalRange());
        }
        zM(t) {
          this.xw.p(t.width, t.height);
        }
      };
      Hn = class {
        constructor(t, i, s) {
          this.OM = /* @__PURE__ */ new Map(), this.NM = /* @__PURE__ */ new Map(), this.FM = new d(), this.WM = new d(), this.HM = new d(), this.Xc = /* @__PURE__ */ new WeakMap(), this.UM = new on(i);
          const n = void 0 === s ? g(En()) : f(g(En()), Wn(s));
          this.$M = i, this.Yp = new qs(t, n, i), this.Yp.nw().i(((t2) => {
            this.FM.v() && this.FM.p(this.qM(t2()));
          }), this), this.Yp.ew().i(((t2) => {
            this.WM.v() && this.WM.p(this.qM(t2()));
          }), this), this.Yp.Md().i(((t2) => {
            this.HM.v() && this.HM.p(this.qM(t2()));
          }), this);
          const e2 = this.Yp.Qt();
          this.jM = new Fn(e2, this.Yp.rg(), this.$M);
        }
        remove() {
          this.Yp.nw().u(this), this.Yp.ew().u(this), this.Yp.Md().u(this), this.jM.m(), this.Yp.m(), this.OM.clear(), this.NM.clear(), this.FM.m(), this.WM.m(), this.HM.m(), this.UM.m();
        }
        resize(t, i, s) {
          this.autoSizeActive() || this.Yp.sg(t, i, s);
        }
        addCustomSeries(t, i = {}, s = 0) {
          const n = ((t2) => ({ type: "Custom", isBuiltIn: false, defaultOptions: { ...wn, ...t2.defaultOptions() }, YM: gn, KM: t2 }))(c(t));
          return this.ZM(n, i, s);
        }
        addSeries(t, i = {}, s = 0) {
          return this.ZM(t, i, s);
        }
        removeSeries(t) {
          const i = _(this.OM.get(t)), s = this.UM.Hd(i);
          this.Yp.Qt().Hd(i), this.GM(s), this.OM.delete(t), this.NM.delete(i);
        }
        DM(t, i) {
          this.GM(this.UM.Ug(t, i));
        }
        VM(t, i, s) {
          this.GM(this.UM.Zg(t, i, s));
        }
        BM(t, i) {
          const [s, n] = this.UM.Jg(t, i);
          return 0 !== s.length && this.GM(n), s;
        }
        subscribeClick(t) {
          this.FM.i(t);
        }
        unsubscribeClick(t) {
          this.FM._(t);
        }
        subscribeCrosshairMove(t) {
          this.HM.i(t);
        }
        unsubscribeCrosshairMove(t) {
          this.HM._(t);
        }
        subscribeDblClick(t) {
          this.WM.i(t);
        }
        unsubscribeDblClick(t) {
          this.WM._(t);
        }
        priceScale(t, i = 0) {
          return new An(this.Yp, t, i);
        }
        timeScale() {
          return this.jM;
        }
        applyOptions(t) {
          this.Yp.cr(Wn(t));
        }
        options() {
          return this.Yp.N();
        }
        takeScreenshot(t = false, i = false) {
          let s, n;
          try {
            i || (s = this.Yp.Qt().N().crosshair.mode, this.Yp.cr({ crosshair: { mode: 2 } })), n = this.Yp.ug(t);
          } finally {
            i || void 0 === s || this.Yp.Qt().cr({ crosshair: { mode: s } });
          }
          return n;
        }
        addPane(t = false) {
          const i = this.Yp.Qt().Xd();
          return i.O_(t), this.XM(i);
        }
        removePane(t) {
          this.Yp.Qt().Sd(t);
        }
        swapPanes(t, i) {
          this.Yp.Qt().Cd(t, i);
        }
        autoSizeActive() {
          return this.Yp.vg();
        }
        chartElement() {
          return this.Yp.hv();
        }
        panes() {
          return this.Yp.Qt().Xs().map(((t) => this.XM(t)));
        }
        paneSize(t = 0) {
          const i = this.Yp.gg(t);
          return { height: i.height, width: i.width };
        }
        setCrosshairPosition(t, i, s) {
          const n = this.OM.get(s);
          if (void 0 === n) return;
          const e2 = this.Yp.Qt().Kn(n);
          null !== e2 && this.Yp.Qt().Ld(t, i, e2);
        }
        clearCrosshairPosition() {
          this.Yp.Qt().zd(true);
        }
        horzBehaviour() {
          return this.$M;
        }
        ZM(t, i = {}, s = 0) {
          o(void 0 !== t.YM), (function(t2) {
            if (void 0 === t2 || "custom" === t2.type) return;
            const i2 = t2;
            void 0 !== i2.minMove && void 0 === i2.precision && (i2.precision = $i(i2.minMove));
          })(i.priceFormat), "Candlestick" === t.type && (function(t2) {
            void 0 !== t2.borderColor && (t2.borderUpColor = t2.borderColor, t2.borderDownColor = t2.borderColor), void 0 !== t2.wickColor && (t2.wickUpColor = t2.wickColor, t2.wickDownColor = t2.wickColor);
          })(i);
          const n = f(g(e), g(t.defaultOptions), i), r2 = t.YM, h2 = new Jt(this.Yp.Qt(), t.type, n, r2, t.KM);
          this.Yp.Qt().Fd(h2, s);
          const a2 = new Nn(h2, this, this, this, this.$M, ((t2) => this.XM(t2)));
          return this.OM.set(a2, h2), this.NM.set(h2, a2), a2;
        }
        GM(t) {
          const i = this.Yp.Qt();
          i.Od(t.Et.vc, t.Et.sM, t.Et.nM), t.F_.forEach(((t2, i2) => i2.ht(t2.le, t2.iM))), i.Et().Ju(), i.Sc();
        }
        JM(t) {
          return _(this.NM.get(t));
        }
        qM(t) {
          const i = /* @__PURE__ */ new Map();
          t.Vg.forEach(((t2, s2) => {
            const n = s2.wh(), e2 = Pn(n)(t2);
            if ("Custom" !== n) o(Ks(e2));
            else {
              const t3 = s2.hl();
              o(!t3 || false === t3(e2));
            }
            i.set(this.JM(s2), e2);
          }));
          const s = void 0 !== t.Ig && this.NM.has(t.Ig) ? this.JM(t.Ig) : void 0;
          return { time: t.Gr, logical: t.js, point: t.Rg, paneIndex: t.Dg, hoveredSeries: s, hoveredObjectId: t.Bg, seriesData: i, sourceEvent: t.Eg };
        }
        XM(t) {
          let i = this.Xc.get(t);
          return i || (i = new Ln(this.Yp, ((t2) => this.JM(t2)), t, this), this.Xc.set(t, i)), i;
        }
      };
      Yn = class extends fn {
        constructor(t, i) {
          super(t, i, true);
        }
        mM(t, i, s) {
          i.mc(this.aM, b(this.lM)), t.Yo(this.aM, s, b(this.lM));
        }
        QM(t, i) {
          return { wt: t, gt: i, _t: NaN, ut: NaN };
        }
        pM() {
          const t = this.ee.ga();
          this.aM = this.ee.Na().Dh().map(((i) => {
            let s;
            if ((i.jr ?? 1) > 1) {
              const t2 = i.Wt[1], n = i.Wt[2], e2 = i.Wt[3];
              s = Math.abs(t2 - e2) > Math.abs(n - e2) ? t2 : n;
            } else s = i.Wt[3];
            return this.tb(i.js, s, t);
          }));
        }
      };
      Zn = 6;
      te = class extends R {
        constructor() {
          super(...arguments), this.rt = null;
        }
        ht(t) {
          this.rt = t;
        }
        et(t) {
          if (null === this.rt) return;
          const { ot: i, lt: s, ib: n, sb: e2, ct: r2, Zt: h2, nb: l2 } = this.rt;
          if (null === s) return;
          const o2 = t.context;
          o2.lineCap = "butt", o2.lineWidth = r2 * t.verticalPixelRatio, a(o2, h2), o2.lineJoin = "round";
          const _2 = this.eb.bind(this);
          void 0 !== e2 && Kn(t, i, e2, s, n, _2, Qn), l2 && (function(t2, i2, s2, n2, e3) {
            if (n2.to - n2.from <= 0) return;
            const { horizontalPixelRatio: r3, verticalPixelRatio: h3, context: a2 } = t2;
            let l3 = null;
            const o3 = Math.max(1, Math.floor(r3)) % 2 / 2, _3 = s2 * h3 + o3;
            for (let s3 = n2.to - 1; s3 >= n2.from; --s3) {
              const n3 = i2[s3];
              if (n3) {
                const i3 = e3(t2, n3);
                i3 !== l3 && (a2.beginPath(), null !== l3 && a2.fill(), a2.fillStyle = i3, l3 = i3);
                const s4 = Math.round(n3._t * r3) + o3, u2 = n3.ut * h3;
                a2.moveTo(s4, u2), a2.arc(s4, u2, _3, 0, 2 * Math.PI);
              }
            }
            a2.fill();
          })(t, i, l2, s, _2);
        }
      };
      ie = class extends te {
        eb(t, i) {
          return i.vt;
        }
      };
      se = class extends Yn {
        constructor() {
          super(...arguments), this.cM = new ie();
        }
        tb(t, i, s) {
          return { ...this.QM(t, i), ...s.gh(t) };
        }
        wM() {
          const t = this.ee.N(), i = { ot: this.aM, Zt: t.lineStyle, sb: t.lineVisible ? t.lineType : void 0, ct: t.lineWidth, nb: t.pointMarkersVisible ? t.pointMarkersRadius || t.lineWidth / 2 + 2 : void 0, lt: this.lM, ib: this.re.Et().ul() };
          this.cM.ht(i);
        }
      };
      ne = { type: "Line", isBuiltIn: true, defaultOptions: { color: "#2196f3", lineStyle: 0, lineWidth: 3, lineType: 0, lineVisible: true, crosshairMarkerVisible: true, crosshairMarkerRadius: 4, crosshairMarkerBorderColor: "", crosshairMarkerBorderWidth: 2, crosshairMarkerBackgroundColor: "", lastPriceAnimation: 0, pointMarkersVisible: false }, YM: (t, i) => new se(t, i) };
      Ce = class extends fn {
        constructor(t, i) {
          super(t, i, false);
        }
        mM(t, i, s) {
          i.mc(this.aM, b(this.lM)), t.Zo(this.aM, s, b(this.lM));
        }
        Lb(t, i, s) {
          return { wt: t, Hr: i.Wt[0], Ur: i.Wt[1], $r: i.Wt[2], qr: i.Wt[3], _t: NaN, Go: NaN, Xo: NaN, Jo: NaN, Qo: NaN };
        }
        pM() {
          const t = this.ee.ga();
          this.aM = this.ee.Na().Dh().map(((i) => this.tb(i.js, i, t)));
        }
      };
      Pe = class extends R {
        constructor() {
          super(...arguments), this.jt = null, this.Ib = 0;
        }
        ht(t) {
          this.jt = t;
        }
        et(t) {
          if (null === this.jt || 0 === this.jt.qs.length || null === this.jt.lt) return;
          const { horizontalPixelRatio: i } = t;
          if (this.Ib = (function(t2, i2) {
            if (t2 >= 2.5 && t2 <= 4) return Math.floor(3 * i2);
            const s2 = 1 - 0.2 * Math.atan(Math.max(4, t2) - 4) / (0.5 * Math.PI), n2 = Math.floor(t2 * s2 * i2), e2 = Math.floor(t2 * i2), r2 = Math.min(n2, e2);
            return Math.max(Math.floor(i2), r2);
          })(this.jt.ul, i), this.Ib >= 2) {
            Math.floor(i) % 2 != this.Ib % 2 && this.Ib--;
          }
          const s = this.jt.qs;
          this.jt.zb && this.Ob(t, s, this.jt.lt), this.jt.Mi && this.gm(t, s, this.jt.lt);
          const n = this.Nb(i);
          (!this.jt.Mi || this.Ib > 2 * n) && this.Fb(t, s, this.jt.lt);
        }
        Ob(t, i, s) {
          if (null === this.jt) return;
          const { context: n, horizontalPixelRatio: e2, verticalPixelRatio: r2 } = t;
          let h2 = "", a2 = Math.min(Math.floor(e2), Math.floor(this.jt.ul * e2));
          a2 = Math.max(Math.floor(e2), Math.min(a2, this.Ib));
          const l2 = Math.floor(0.5 * a2);
          let o2 = null;
          for (let t2 = s.from; t2 < s.to; t2++) {
            const s2 = i[t2];
            s2.sh !== h2 && (n.fillStyle = s2.sh, h2 = s2.sh);
            const _2 = Math.round(Math.min(s2.Go, s2.Qo) * r2), u2 = Math.round(Math.max(s2.Go, s2.Qo) * r2), c2 = Math.round(s2.Xo * r2), d2 = Math.round(s2.Jo * r2);
            let f2 = Math.round(e2 * s2._t) - l2;
            const p2 = f2 + a2 - 1;
            null !== o2 && (f2 = Math.max(o2 + 1, f2), f2 = Math.min(f2, p2));
            const v2 = p2 - f2 + 1;
            n.fillRect(f2, c2, v2, _2 - c2), n.fillRect(f2, u2 + 1, v2, d2 - u2), o2 = p2;
          }
        }
        Nb(t) {
          let i = Math.floor(1 * t);
          this.Ib <= 2 * i && (i = Math.floor(0.5 * (this.Ib - 1)));
          const s = Math.max(Math.floor(t), i);
          return this.Ib <= 2 * s ? Math.max(Math.floor(t), Math.floor(1 * t)) : s;
        }
        gm(t, i, s) {
          if (null === this.jt) return;
          const { context: n, horizontalPixelRatio: e2, verticalPixelRatio: r2 } = t;
          let h2 = "";
          const a2 = this.Nb(e2);
          let l2 = null;
          for (let t2 = s.from; t2 < s.to; t2++) {
            const s2 = i[t2];
            s2.ih !== h2 && (n.fillStyle = s2.ih, h2 = s2.ih);
            let o2 = Math.round(s2._t * e2) - Math.floor(0.5 * this.Ib);
            const _2 = o2 + this.Ib - 1, u2 = Math.round(Math.min(s2.Go, s2.Qo) * r2), c2 = Math.round(Math.max(s2.Go, s2.Qo) * r2);
            if (null !== l2 && (o2 = Math.max(l2 + 1, o2), o2 = Math.min(o2, _2)), this.jt.ul * e2 > 2 * a2) L(n, o2, u2, _2 - o2 + 1, c2 - u2 + 1, a2);
            else {
              const t3 = _2 - o2 + 1;
              n.fillRect(o2, u2, t3, c2 - u2 + 1);
            }
            l2 = _2;
          }
        }
        Fb(t, i, s) {
          if (null === this.jt) return;
          const { context: n, horizontalPixelRatio: e2, verticalPixelRatio: r2 } = t;
          let h2 = "";
          const a2 = this.Nb(e2);
          for (let t2 = s.from; t2 < s.to; t2++) {
            const s2 = i[t2];
            let l2 = Math.round(Math.min(s2.Go, s2.Qo) * r2), o2 = Math.round(Math.max(s2.Go, s2.Qo) * r2), _2 = Math.round(s2._t * e2) - Math.floor(0.5 * this.Ib), u2 = _2 + this.Ib - 1;
            if (s2.th !== h2) {
              const t3 = s2.th;
              n.fillStyle = t3, h2 = t3;
            }
            this.jt.Mi && (_2 += a2, l2 += a2, u2 -= a2, o2 -= a2), l2 > o2 || n.fillRect(_2, l2, u2 - _2 + 1, o2 - l2 + 1);
          }
        }
      };
      Te = class extends Ce {
        constructor() {
          super(...arguments), this.cM = new Pe();
        }
        tb(t, i, s) {
          return { ...this.Lb(t, i, s), ...s.gh(t) };
        }
        wM() {
          const t = this.ee.N();
          this.cM.ht({ qs: this.aM, ul: this.re.Et().ul(), zb: t.wickVisible, Mi: t.borderVisible, lt: this.lM });
        }
      };
      Re = { type: "Candlestick", isBuiltIn: true, defaultOptions: { upColor: "#26a69a", downColor: "#ef5350", wickVisible: true, borderVisible: true, borderColor: "#378658", borderUpColor: "#26a69a", borderDownColor: "#ef5350", wickColor: "#737375", wickUpColor: "#26a69a", wickDownColor: "#ef5350" }, YM: (t, i) => new Te(t, i) };
      De = class extends R {
        constructor() {
          super(...arguments), this.jt = null, this.Wb = [];
        }
        ht(t) {
          this.jt = t, this.Wb = [];
        }
        et({ context: t, horizontalPixelRatio: i, verticalPixelRatio: s }) {
          if (null === this.jt || 0 === this.jt.ot.length || null === this.jt.lt) return;
          this.Wb.length || this.Hb(i);
          const n = Math.max(1, Math.floor(s)), e2 = Math.round(this.jt.Ub * s) - Math.floor(n / 2), r2 = e2 + n;
          for (let i2 = this.jt.lt.from; i2 < this.jt.lt.to; i2++) {
            const h2 = this.jt.ot[i2], a2 = this.Wb[i2 - this.jt.lt.from], l2 = Math.round(h2.ut * s);
            let o2, _2;
            t.fillStyle = h2.th, l2 <= e2 ? (o2 = l2, _2 = r2) : (o2 = e2, _2 = l2 - Math.floor(n / 2) + n), t.fillRect(a2.Aa, o2, a2.bi - a2.Aa + 1, _2 - o2);
          }
        }
        Hb(t) {
          if (null === this.jt || 0 === this.jt.ot.length || null === this.jt.lt) return void (this.Wb = []);
          const i = Math.ceil(this.jt.ul * t) <= 1 ? 0 : Math.max(1, Math.floor(t)), s = Math.round(this.jt.ul * t) - i;
          this.Wb = new Array(this.jt.lt.to - this.jt.lt.from);
          for (let i2 = this.jt.lt.from; i2 < this.jt.lt.to; i2++) {
            const n2 = this.jt.ot[i2], e2 = Math.round(n2._t * t);
            let r2, h2;
            if (s % 2) {
              const t2 = (s - 1) / 2;
              r2 = e2 - t2, h2 = e2 + t2;
            } else {
              const t2 = s / 2;
              r2 = e2 - t2, h2 = e2 + t2 - 1;
            }
            this.Wb[i2 - this.jt.lt.from] = { Aa: r2, bi: h2, $b: e2, oe: n2._t * t, wt: n2.wt };
          }
          for (let t2 = this.jt.lt.from + 1; t2 < this.jt.lt.to; t2++) {
            const s2 = this.Wb[t2 - this.jt.lt.from], n2 = this.Wb[t2 - this.jt.lt.from - 1];
            s2.wt === n2.wt + 1 && (s2.Aa - n2.bi !== i + 1 && (n2.$b > n2.oe ? n2.bi = s2.Aa - i - 1 : s2.Aa = n2.bi + i + 1));
          }
          let n = Math.ceil(this.jt.ul * t);
          for (let t2 = this.jt.lt.from; t2 < this.jt.lt.to; t2++) {
            const i2 = this.Wb[t2 - this.jt.lt.from];
            i2.bi < i2.Aa && (i2.bi = i2.Aa);
            const s2 = i2.bi - i2.Aa + 1;
            n = Math.min(s2, n);
          }
          if (i > 0 && n < 4) for (let t2 = this.jt.lt.from; t2 < this.jt.lt.to; t2++) {
            const i2 = this.Wb[t2 - this.jt.lt.from];
            i2.bi - i2.Aa + 1 > n && (i2.$b > i2.oe ? i2.bi -= 1 : i2.Aa += 1);
          }
        }
      };
      Ie = class extends Yn {
        constructor() {
          super(...arguments), this.cM = new De();
        }
        tb(t, i, s) {
          return { ...this.QM(t, i), ...s.gh(t) };
        }
        wM() {
          const t = { ot: this.aM, ul: this.re.Et().ul(), lt: this.lM, Ub: this.ee.Ft().Nt(this.ee.N().base, u(this.ee.Lt()).Wt) };
          this.cM.ht(t);
        }
      };
      Ve = { type: "Histogram", isBuiltIn: true, defaultOptions: { color: "#26a69a", base: 0 }, YM: (t, i) => new Ie(t, i) };
      yr = { ...e, color: "#2196f3" };
    }
  });

  // src/workbench/format.ts
  function formatPrice(value, digits = 3) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }
  function formatInteger(value) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0
    }).format(value);
  }
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return `${new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }).format(date)} UTC`;
  }
  function formatDateOnly(isoString) {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC"
    }).format(date);
  }
  var init_format = __esm({
    "src/workbench/format.ts"() {
      "use strict";
    }
  });

  // src/workbench/timestampValidation.ts
  function parseUtcTimestampText(value) {
    const trimmed = value.trim();
    const match = UTC_TIMESTAMP_PATTERN.exec(trimmed);
    if (!match) {
      return null;
    }
    const [, rawYear, rawMonth, rawDay, rawHour, rawMinute, rawSecond, rawFraction = ""] = match;
    const year = Number(rawYear);
    const month = Number(rawMonth);
    const day = Number(rawDay);
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    const second = Number(rawSecond);
    const millisecond = Number(rawFraction.slice(0, 3).padEnd(3, "0"));
    if (year < 1e3 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) {
      return null;
    }
    const epochMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    if (!Number.isFinite(epochMs)) {
      return null;
    }
    const date = new Date(epochMs);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || date.getUTCHours() !== hour || date.getUTCMinutes() !== minute || date.getUTCSeconds() !== second || date.getUTCMilliseconds() !== millisecond) {
      return null;
    }
    return {
      epochMs,
      hasNonZeroSubMillisecondPrecision: /[1-9]/.test(rawFraction.slice(3))
    };
  }
  function parseUtcTimestampTextToMs(value) {
    return parseUtcTimestampText(value)?.epochMs ?? null;
  }
  function isUtcTimestampTextForMs(value, expectedMs) {
    const parsed = parseUtcTimestampText(value);
    return parsed !== null && parsed.epochMs === expectedMs && !parsed.hasNonZeroSubMillisecondPrecision;
  }
  function assertUtcTimestampTextForMs(value, expectedMs, fieldName, epochFieldName, lineNumber) {
    const parsed = parseUtcTimestampText(value);
    if (parsed === null) {
      throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
    }
    if (parsed.epochMs !== expectedMs || parsed.hasNonZeroSubMillisecondPrecision) {
      throw new Error(`${fieldName} does not match ${epochFieldName} at line ${lineNumber}`);
    }
  }
  var UTC_TIMESTAMP_PATTERN;
  var init_timestampValidation = __esm({
    "src/workbench/timestampValidation.ts"() {
      "use strict";
      UTC_TIMESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]00:00)$/i;
    }
  });

  // src/workbench/freshness.ts
  function requireUtcMs(value, fieldName) {
    const epochMs = parseUtcTimestampTextToMs(value);
    if (epochMs === null) {
      throw new Error(`Invalid ${fieldName}`);
    }
    return epochMs;
  }
  function formatElapsedDuration(durationMs) {
    const clampedMs = Math.max(0, durationMs);
    if (clampedMs < MINUTE_MS) {
      return "under 1m";
    }
    const days = Math.floor(clampedMs / DAY_MS);
    const hours = Math.floor(clampedMs % DAY_MS / HOUR_MS);
    const minutes = Math.floor(clampedMs % HOUR_MS / MINUTE_MS);
    if (days > 0) {
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }
  function describeExportAge(downloadedAtUtc, nowMs = Date.now()) {
    const downloadedAtMs = requireUtcMs(downloadedAtUtc, "downloaded_at_utc");
    return `Exported ${formatElapsedDuration(nowMs - downloadedAtMs)} ago`;
  }
  function describeCoverageFreshness(coverage, downloadedAtUtc) {
    const downloadedAtMs = requireUtcMs(downloadedAtUtc, "downloaded_at_utc");
    const lastCloseMs = requireUtcMs(coverage.last_close_time_utc, "last_close_time_utc");
    const ageMs = Math.max(0, downloadedAtMs - lastCloseMs);
    const intervalMs = INTERVAL_DURATION_MS[coverage.interval];
    const freshThresholdMs = intervalMs * 1.5;
    const quietThresholdMs = Math.max(intervalMs * 6, HOUR_MS);
    const tone = ageMs <= freshThresholdMs ? "fresh" : ageMs <= quietThresholdMs ? "quiet" : "stale";
    const shortLabel = ageMs < MINUTE_MS ? "closed at refresh" : `${formatElapsedDuration(ageMs)} before refresh`;
    return {
      ageMs,
      tone,
      shortLabel,
      label: `Latest candle ${shortLabel}`
    };
  }
  var MINUTE_MS, HOUR_MS, DAY_MS, INTERVAL_DURATION_MS;
  var init_freshness = __esm({
    "src/workbench/freshness.ts"() {
      "use strict";
      init_timestampValidation();
      MINUTE_MS = 6e4;
      HOUR_MS = 60 * MINUTE_MS;
      DAY_MS = 24 * HOUR_MS;
      INTERVAL_DURATION_MS = {
        "1m": MINUTE_MS,
        "5m": 5 * MINUTE_MS,
        "15m": 15 * MINUTE_MS,
        "1h": HOUR_MS,
        "4h": 4 * HOUR_MS,
        "1d": DAY_MS,
        "1w": 7 * DAY_MS
      };
    }
  });

  // src/workbench/candleValidation.ts
  function parseFiniteNumber(rawValue, fieldName, lineNumber) {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
    }
    const value = Number(trimmedValue);
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
    }
    return value;
  }
  function parseInteger(rawValue, fieldName, lineNumber) {
    const trimmedValue = rawValue.trim();
    if (!INTEGER_TEXT_PATTERN.test(trimmedValue)) {
      throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
    }
    const value = parseFiniteNumber(rawValue, fieldName, lineNumber);
    if (!Number.isSafeInteger(value)) {
      throw new Error(`Invalid ${fieldName} at line ${lineNumber}`);
    }
    return value;
  }
  function validateRange(row, lineNumber) {
    if (row.close_time <= row.open_time) {
      throw new Error(`Invalid candle timestamps at line ${lineNumber}`);
    }
    const candleSpanMs = row.close_time - row.open_time + 1;
    if (candleSpanMs > INTERVAL_SPAN_MS[row.interval]) {
      throw new Error(`Candle span exceeds ${row.interval} at line ${lineNumber}`);
    }
    if (row.volume < 0) {
      throw new Error(`Invalid volume at line ${lineNumber}`);
    }
    if (row.trade_count < 0) {
      throw new Error(`Invalid trade_count at line ${lineNumber}`);
    }
    const highestBodyValue = Math.max(row.open, row.close);
    const lowestBodyValue = Math.min(row.open, row.close);
    if (row.high < highestBodyValue || row.low > lowestBodyValue || row.high < row.low) {
      throw new Error(`Invalid OHLC range at line ${lineNumber}`);
    }
  }
  function parseCandleCsv(text, options = {}) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      return [];
    }
    const header = (lines[0] ?? "").replace(/^\uFEFF/, "").trim();
    if (header !== EXPECTED_HEADER) {
      const datasetDetail = options.datasetLabel ? ` for ${options.datasetLabel}` : "";
      throw new Error(`Malformed candle header${datasetDetail}`);
    }
    const candles = [];
    let previousOpenTime = null;
    let previousCloseTime = null;
    for (let index = 1; index < lines.length; index += 1) {
      const line = lines[index]?.trim();
      if (!line) {
        continue;
      }
      const lineNumber = index + 1;
      const parts = line.split(",");
      if (parts.length !== 12) {
        throw new Error(`Malformed candle row at line ${lineNumber}`);
      }
      const intervalValue = parts[5]?.trim();
      if (!VALID_INTERVALS.has(intervalValue)) {
        throw new Error(`Invalid interval at line ${lineNumber}`);
      }
      const row = {
        open_time: parseInteger(parts[0], "open_time", lineNumber),
        close_time: parseInteger(parts[1], "close_time", lineNumber),
        open_time_utc: parts[2]?.trim() ?? "",
        close_time_utc: parts[3]?.trim() ?? "",
        symbol: parts[4]?.trim() ?? "",
        interval: intervalValue,
        open: parseFiniteNumber(parts[6], "open", lineNumber),
        high: parseFiniteNumber(parts[7], "high", lineNumber),
        low: parseFiniteNumber(parts[8], "low", lineNumber),
        close: parseFiniteNumber(parts[9], "close", lineNumber),
        volume: parseFiniteNumber(parts[10], "volume", lineNumber),
        trade_count: parseInteger(parts[11], "trade_count", lineNumber)
      };
      if (!row.symbol) {
        throw new Error(`Missing symbol at line ${lineNumber}`);
      }
      if (options.expectedInterval && row.interval !== options.expectedInterval) {
        throw new Error(`Unexpected interval at line ${lineNumber}`);
      }
      assertUtcTimestampTextForMs(
        row.open_time_utc,
        row.open_time,
        "open_time_utc",
        "open_time",
        lineNumber
      );
      assertUtcTimestampTextForMs(
        row.close_time_utc,
        row.close_time,
        "close_time_utc",
        "close_time",
        lineNumber
      );
      if (previousOpenTime !== null && row.open_time <= previousOpenTime) {
        throw new Error(`Non-ascending open_time at line ${lineNumber}`);
      }
      if (previousCloseTime !== null && row.open_time <= previousCloseTime) {
        throw new Error(`Overlapping candle timestamps at line ${lineNumber}`);
      }
      validateRange(row, lineNumber);
      candles.push(row);
      previousOpenTime = row.open_time;
      previousCloseTime = row.close_time;
    }
    return candles;
  }
  var EXPECTED_HEADER, VALID_INTERVALS, INTERVAL_SPAN_MS, INTEGER_TEXT_PATTERN;
  var init_candleValidation = __esm({
    "src/workbench/candleValidation.ts"() {
      "use strict";
      init_timestampValidation();
      EXPECTED_HEADER = [
        "open_time",
        "close_time",
        "open_time_utc",
        "close_time_utc",
        "symbol",
        "interval",
        "open",
        "high",
        "low",
        "close",
        "volume",
        "trade_count"
      ].join(",");
      VALID_INTERVALS = /* @__PURE__ */ new Set(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]);
      INTERVAL_SPAN_MS = {
        "1m": 6e4,
        "5m": 5 * 6e4,
        "15m": 15 * 6e4,
        "1h": 60 * 6e4,
        "4h": 4 * 60 * 6e4,
        "1d": 24 * 60 * 6e4,
        "1w": 7 * 24 * 60 * 6e4
      };
      INTEGER_TEXT_PATTERN = /^-?\d+$/;
    }
  });

  // src/workbench/movingAverage.ts
  function createEmptyValues(length) {
    return Array(length).fill(Number.NaN);
  }
  function calculateMovingAverageValues(candles, period, mode) {
    const values = createEmptyValues(candles.length);
    if (candles.length < period) {
      return values;
    }
    let rollingSum = 0;
    if (mode === "sma") {
      for (let index = 0; index < candles.length; index += 1) {
        rollingSum += candles[index].close;
        if (index >= period) {
          rollingSum -= candles[index - period].close;
        }
        if (index >= period - 1) {
          values[index] = rollingSum / period;
        }
      }
      return values;
    }
    const multiplier = 2 / (period + 1);
    let emaValue = 0;
    for (let index = 0; index < candles.length; index += 1) {
      const close = candles[index].close;
      rollingSum += close;
      if (index === period - 1) {
        emaValue = rollingSum / period;
        values[index] = emaValue;
        continue;
      }
      if (index >= period) {
        emaValue = close * multiplier + emaValue * (1 - multiplier);
        values[index] = emaValue;
      }
    }
    return values;
  }
  var init_movingAverage = __esm({
    "src/workbench/movingAverage.ts"() {
      "use strict";
    }
  });

  // src/terminal/terminalData.ts
  function requireObject(value, context) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Invalid ${context}`);
    }
    return value;
  }
  function requireNonEmptyString(value, context) {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Invalid ${context}`);
    }
    return value.trim();
  }
  function normalizeOptionalString(value, context) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return requireNonEmptyString(value, context);
  }
  function requirePositiveSafeInteger(value, context) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
      throw new Error(`Invalid ${context}`);
    }
    return value;
  }
  function parseTimestampText(textValue, epochValue, utcFieldName, epochFieldName) {
    const text = requireNonEmptyString(textValue, utcFieldName);
    if (epochValue === void 0 || epochValue === null) {
      const epochMs = parseUtcTimestampTextToMs(text);
      if (epochMs === null) {
        throw new Error(`Invalid ${utcFieldName}`);
      }
      return {
        text,
        epochMs
      };
    }
    if (typeof epochValue !== "number" || !Number.isSafeInteger(epochValue) || epochValue < 0) {
      throw new Error(`Invalid ${epochFieldName}`);
    }
    if (!isUtcTimestampTextForMs(text, epochValue)) {
      throw new Error(`${utcFieldName} does not match ${epochFieldName}`);
    }
    return {
      text,
      epochMs: epochValue
    };
  }
  function compareIntervals(left, right) {
    return INTERVAL_ORDER.indexOf(left.interval) - INTERVAL_ORDER.indexOf(right.interval);
  }
  function normalizeCoverageEntry(value, seenIntervals) {
    const entry = value;
    const intervalText = requireNonEmptyString(entry.interval, "coverage interval");
    if (!VALID_INTERVALS2.has(intervalText)) {
      throw new Error(`Invalid coverage interval: ${intervalText}`);
    }
    const interval = intervalText;
    if (seenIntervals.has(interval)) {
      throw new Error(`Duplicate coverage interval: ${interval}`);
    }
    seenIntervals.add(interval);
    const rows = requirePositiveSafeInteger(entry.rows, `coverage rows for ${interval}`);
    const first = parseTimestampText(
      entry.first_open_time_utc,
      entry.first_open_time,
      "first_open_time_utc",
      "first_open_time"
    );
    const last = parseTimestampText(
      entry.last_close_time_utc,
      entry.last_close_time,
      "last_close_time_utc",
      "last_close_time"
    );
    if (first.epochMs > last.epochMs) {
      throw new Error(`Coverage window is reversed for ${interval}`);
    }
    return {
      interval,
      rows,
      first_open_time_utc: first.text,
      last_close_time_utc: last.text
    };
  }
  function buildIndicatorSeries(rows, period) {
    const values = calculateMovingAverageValues(rows, period, "ema");
    const points = [];
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      if (Number.isNaN(value)) {
        continue;
      }
      points.push({
        time: rows[index].open_time / 1e3,
        value
      });
    }
    return points;
  }
  function parseTerminalMetadata(payload) {
    const rawMetadata = requireObject(payload, "terminal metadata");
    const pair = requireObject(rawMetadata.pair, "pair metadata");
    const coverageValues = rawMetadata.coverage;
    if (!Array.isArray(coverageValues) || coverageValues.length === 0) {
      throw new Error("Missing metadata coverage");
    }
    const seenIntervals = /* @__PURE__ */ new Set();
    const coverage = coverageValues.map((entry) => normalizeCoverageEntry(entry, seenIntervals)).sort(compareIntervals);
    return {
      source: requireNonEmptyString(rawMetadata.source, "metadata source"),
      apiUrl: normalizeOptionalString(rawMetadata.api_url, "metadata api_url"),
      downloadedAtUtc: parseTimestampText(
        rawMetadata.downloaded_at_utc,
        void 0,
        "downloaded_at_utc",
        "downloaded_at_utc"
      ).text,
      pairDisplayName: requireNonEmptyString(pair.display_name, "pair display_name"),
      pairId: requireNonEmptyString(pair.pair_id, "pair pair_id"),
      coverage
    };
  }
  function parseTerminalDataset(csvText, interval) {
    const rows = parseCandleCsv(csvText, {
      expectedInterval: interval,
      datasetLabel: `Silver terminal ${interval}`
    });
    if (!rows.length) {
      throw new Error(`No candles available for ${interval}`);
    }
    return {
      rows,
      ema20: buildIndicatorSeries(rows, 20),
      ema50: buildIndicatorSeries(rows, 50)
    };
  }
  function getCoverageEntry(metadata, interval) {
    return metadata.coverage.find((entry) => entry.interval === interval);
  }
  function chooseInitialTimeframe(coverage, requestedInterval) {
    if (!coverage.length) {
      throw new Error("No metadata coverage available");
    }
    const availableIntervals = coverage.map((entry) => entry.interval);
    if (requestedInterval && VALID_INTERVALS2.has(requestedInterval) && availableIntervals.includes(requestedInterval)) {
      return requestedInterval;
    }
    return availableIntervals.includes("1h") ? "1h" : availableIntervals[0];
  }
  var INTERVAL_ORDER, VALID_INTERVALS2;
  var init_terminalData = __esm({
    "src/terminal/terminalData.ts"() {
      "use strict";
      init_candleValidation();
      init_movingAverage();
      init_timestampValidation();
      INTERVAL_ORDER = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
      VALID_INTERVALS2 = new Set(INTERVAL_ORDER);
    }
  });

  // src/terminal/main.ts
  var require_main = __commonJS({
    "src/terminal/main.ts"() {
      init_lightweight_charts_production();
      init_format();
      init_freshness();
      init_terminalData();
      var TIMEFRAME_ORDER = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];
      var TIMEFRAME_SHORTCUTS = {
        Digit1: "1m",
        Digit2: "5m",
        Digit3: "15m",
        Digit4: "1h",
        Digit5: "4h",
        Digit6: "1d",
        Digit7: "1w"
      };
      function mustFind(id) {
        const element = document.getElementById(id);
        if (!(element instanceof HTMLElement)) {
          throw new Error(`Missing element: #${id}`);
        }
        return element;
      }
      function getElements() {
        return {
          headlinePrice: mustFind("headline-price"),
          headlineChange: mustFind("headline-change"),
          headlineCoverage: mustFind("headline-coverage"),
          currentCsvLink: mustFind("current-csv-link"),
          panelTitle: mustFind("panel-title"),
          sourcePill: mustFind("source-pill"),
          pairPill: mustFind("pair-pill"),
          downloadedPill: mustFind("downloaded-pill"),
          freshnessPill: mustFind("freshness-pill"),
          legendSymbol: mustFind("legend-symbol"),
          legendInterval: mustFind("legend-interval"),
          legendTime: mustFind("legend-time"),
          legendValues: mustFind("legend-values"),
          timeframeToolbar: mustFind("timeframe-toolbar"),
          loadingMask: mustFind("loading-mask"),
          chart: mustFind("chart"),
          sidebarTitle: mustFind("sidebar-title"),
          coverageList: mustFind("coverage-list"),
          stats: {
            rows: mustFind("stat-rows"),
            close: mustFind("stat-close"),
            range: mustFind("stat-range"),
            volume: mustFind("stat-volume"),
            trades: mustFind("stat-trades"),
            window: mustFind("stat-window"),
            dataLag: mustFind("stat-data-lag")
          },
          tools: {
            ema: mustFind("tool-ema"),
            volume: mustFind("tool-volume"),
            fit: mustFind("tool-fit")
          }
        };
      }
      function toTimestamp(value) {
        return Math.floor(value / 1e3);
      }
      function formatNumber(value, digits = 2) {
        return formatPrice(value, digits);
      }
      function formatSigned(value, digits) {
        return `${value >= 0 ? "+" : ""}${formatNumber(value, digits)}`;
      }
      function buildVolumeColor(row) {
        return row.close >= row.open ? "rgba(78, 201, 176, 0.55)" : "rgba(255, 107, 122, 0.55)";
      }
      function compareCoverage(left, right) {
        return TIMEFRAME_ORDER.indexOf(left.interval) - TIMEFRAME_ORDER.indexOf(right.interval);
      }
      function applyFreshnessTone(element, tone) {
        element.classList.remove("freshness-fresh", "freshness-quiet", "freshness-stale");
        element.classList.add(`freshness-${tone}`);
      }
      var SilverTerminalApp = class {
        constructor() {
          this.elements = getElements();
          this.datasetCache = /* @__PURE__ */ new Map();
          this.metadata = null;
          this.selectedTimeframe = null;
          this.showIndicators = true;
          this.showVolume = true;
          this.activationToken = 0;
          this.currentRows = [];
          this.currentRowsByTime = /* @__PURE__ */ new Map();
          this.chart = qn(this.elements.chart, {
            autoSize: true,
            layout: {
              background: { type: Wi.Solid, color: "#081322" },
              textColor: "#c6d4ea",
              fontFamily: '"JetBrains Mono", monospace'
            },
            grid: {
              vertLines: { color: "rgba(150, 170, 197, 0.08)" },
              horzLines: { color: "rgba(150, 170, 197, 0.08)" }
            },
            crosshair: {
              mode: K.MagnetOHLC,
              vertLine: {
                color: "rgba(213, 222, 234, 0.28)",
                labelBackgroundColor: "#0f1f36"
              },
              horzLine: {
                color: "rgba(213, 222, 234, 0.28)",
                labelBackgroundColor: "#0f1f36"
              }
            },
            rightPriceScale: {
              borderColor: "rgba(150, 170, 197, 0.18)"
            },
            timeScale: {
              borderColor: "rgba(150, 170, 197, 0.18)",
              rightOffset: 0,
              fixLeftEdge: true,
              fixRightEdge: true,
              lockVisibleTimeRangeOnResize: true,
              timeVisible: true,
              secondsVisible: false
            },
            handleScroll: {
              mouseWheel: true,
              pressedMouseMove: true,
              horzTouchDrag: true,
              vertTouchDrag: true
            },
            handleScale: {
              axisPressedMouseMove: true,
              mouseWheel: true,
              pinch: true
            },
            localization: {
              priceFormatter: (price) => formatPrice(price, 3)
            }
          });
          this.candleSeries = this.chart.addSeries(Re, {
            upColor: "#4ec9b0",
            downColor: "#ff6b7a",
            borderVisible: false,
            wickUpColor: "#4ec9b0",
            wickDownColor: "#ff6b7a",
            priceLineColor: "#c7d0de",
            lastValueVisible: true
          });
          this.volumeSeries = this.chart.addSeries(Ve, {
            priceFormat: { type: "volume" },
            priceScaleId: "",
            base: 0,
            lastValueVisible: false,
            priceLineVisible: false
          });
          this.ema20Series = this.chart.addSeries(ne, {
            color: "#f7b955",
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false
          });
          this.ema50Series = this.chart.addSeries(ne, {
            color: "#7aa2ff",
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false
          });
          this.candleSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.08, bottom: 0.24 }
          });
          this.volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.78, bottom: 0 }
          });
          this.chart.subscribeCrosshairMove((param) => {
            this.updateLegendFromRow(this.lookupRow(param));
          });
          this.wireToolButtons();
        }
        async start() {
          try {
            this.setLoading(true, "Loading metadata...");
            this.metadata = await this.loadMetadata();
            const availableIntervals = [...this.metadata.coverage].sort(compareCoverage).map((entry) => entry.interval);
            this.renderMetadata();
            this.buildTimeframeToolbar(availableIntervals);
            this.buildCoverageList(availableIntervals);
            this.wireKeyboard(availableIntervals);
            const requestedInterval = new URL(window.location.href).searchParams.get("tf");
            const initialInterval = chooseInitialTimeframe(this.metadata.coverage, requestedInterval);
            await this.activateTimeframe(initialInterval);
            void Promise.allSettled(
              availableIntervals.filter((interval) => interval !== initialInterval).map((interval) => this.loadDataset(interval))
            );
          } catch (error) {
            console.error(error);
            this.setLoading(true, "Unable to load the chart. Check metadata and CSV files.");
            this.elements.legendValues.textContent = "Failed to initialize chart data.";
          }
        }
        async loadMetadata() {
          const response = await fetch("./data/hyperliquid/slv_usdc_metadata.json", { cache: "no-store" });
          if (!response.ok) {
            throw new Error("Failed to load metadata");
          }
          const payload = await response.json();
          return parseTerminalMetadata(payload);
        }
        async loadDataset(interval) {
          const cached = this.datasetCache.get(interval);
          if (cached) {
            return cached;
          }
          const promise = (async () => {
            const response = await fetch(`./data/hyperliquid/slv_usdc_${interval}.csv`, {
              cache: "no-store"
            });
            if (!response.ok) {
              throw new Error(`Failed to load ${interval} candles`);
            }
            return parseTerminalDataset(await response.text(), interval);
          })().catch((error) => {
            this.datasetCache.delete(interval);
            throw error;
          });
          this.datasetCache.set(interval, promise);
          return promise;
        }
        renderMetadata() {
          if (!this.metadata) {
            return;
          }
          this.elements.legendSymbol.textContent = this.metadata.pairDisplayName;
          this.elements.sourcePill.textContent = this.metadata.source;
          this.elements.pairPill.textContent = this.metadata.pairId;
          this.elements.downloadedPill.textContent = describeExportAge(this.metadata.downloadedAtUtc);
          this.elements.downloadedPill.title = `Refreshed ${formatDateTime(this.metadata.downloadedAtUtc)}`;
        }
        buildTimeframeToolbar(intervals) {
          this.elements.timeframeToolbar.replaceChildren();
          for (const interval of intervals) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "timeframe-button";
            button.dataset.timeframe = interval;
            button.textContent = interval.toUpperCase();
            button.addEventListener("click", () => {
              void this.activateTimeframe(interval);
            });
            this.elements.timeframeToolbar.append(button);
          }
        }
        buildCoverageList(intervals) {
          if (!this.metadata) {
            return;
          }
          this.elements.coverageList.replaceChildren();
          for (const interval of intervals) {
            const coverage = getCoverageEntry(this.metadata, interval);
            if (!coverage) {
              continue;
            }
            const button = document.createElement("button");
            button.type = "button";
            button.className = "coverage-card";
            button.dataset.timeframe = interval;
            button.innerHTML = `
        <div class="coverage-tag">${interval.toUpperCase()}</div>
        <div class="coverage-text">
          <strong>${formatDateOnly(coverage.first_open_time_utc)} -> ${formatDateOnly(coverage.last_close_time_utc)}</strong>
          <span>${formatInteger(coverage.rows)} candles</span>
        </div>
        <div class="coverage-meta">
          <strong>${interval === "1w" ? "Weekly" : "Rolling"}</strong>
          <span>${coverage.rows} rows</span>
        </div>
      `;
            button.addEventListener("click", () => {
              void this.activateTimeframe(interval);
            });
            this.elements.coverageList.append(button);
          }
        }
        wireToolButtons() {
          this.elements.tools.ema.addEventListener("click", () => {
            this.showIndicators = !this.showIndicators;
            this.elements.tools.ema.classList.toggle("is-active", this.showIndicators);
            this.ema20Series.applyOptions({ visible: this.showIndicators });
            this.ema50Series.applyOptions({ visible: this.showIndicators });
          });
          this.elements.tools.volume.addEventListener("click", () => {
            this.showVolume = !this.showVolume;
            this.elements.tools.volume.classList.toggle("is-active", this.showVolume);
            this.volumeSeries.applyOptions({ visible: this.showVolume });
          });
          this.elements.tools.fit.addEventListener("click", () => {
            this.chart.timeScale().fitContent();
          });
        }
        wireKeyboard(intervals) {
          window.addEventListener("keydown", (event) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
              return;
            }
            const interval = TIMEFRAME_SHORTCUTS[event.code];
            if (interval && intervals.includes(interval)) {
              event.preventDefault();
              void this.activateTimeframe(interval);
            }
          });
        }
        async activateTimeframe(interval) {
          if (!this.metadata) {
            return;
          }
          this.selectedTimeframe = interval;
          const token = ++this.activationToken;
          this.setLoading(true, `Loading ${interval} candles...`);
          this.updateCoverageSelection(interval);
          try {
            const dataset = await this.loadDataset(interval);
            if (token !== this.activationToken) {
              return;
            }
            this.currentRows = dataset.rows;
            this.currentRowsByTime = new Map(
              dataset.rows.map((row) => [Math.floor(row.open_time / 1e3), row])
            );
            const candleData = dataset.rows.map((row) => ({
              time: toTimestamp(row.open_time),
              open: row.open,
              high: row.high,
              low: row.low,
              close: row.close
            }));
            const volumeData = dataset.rows.map((row) => ({
              time: toTimestamp(row.open_time),
              value: row.volume,
              color: buildVolumeColor(row)
            }));
            const ema20Data = dataset.ema20.map((point) => ({
              time: point.time,
              value: point.value
            }));
            const ema50Data = dataset.ema50.map((point) => ({
              time: point.time,
              value: point.value
            }));
            this.candleSeries.setData(candleData);
            this.volumeSeries.setData(volumeData);
            this.ema20Series.setData(ema20Data);
            this.ema50Series.setData(ema50Data);
            this.volumeSeries.applyOptions({ visible: this.showVolume });
            this.ema20Series.applyOptions({ visible: this.showIndicators });
            this.ema50Series.applyOptions({ visible: this.showIndicators });
            const latestRow = dataset.rows[dataset.rows.length - 1] ?? null;
            this.updateLegendFromRow(latestRow);
            this.updateHeadline(dataset);
            this.updateSidebar(interval, dataset);
            this.elements.panelTitle.textContent = `SLV/USDC - ${interval}`;
            this.elements.legendInterval.textContent = interval;
            this.elements.currentCsvLink.href = `./data/hyperliquid/slv_usdc_${interval}.csv`;
            this.elements.currentCsvLink.textContent = `${interval.toUpperCase()} CSV`;
            this.chart.timeScale().fitContent();
            this.updateUrl(interval);
            this.setLoading(false);
          } catch (error) {
            console.error(error);
            if (token === this.activationToken) {
              this.setLoading(true, "Unable to load the chart. Check metadata and CSV files.");
              this.elements.legendValues.textContent = "Failed to initialize chart data.";
            }
          }
        }
        lookupRow(param) {
          if (!param.time) {
            return this.currentRows[this.currentRows.length - 1] ?? null;
          }
          const timeValue = typeof param.time === "number" ? param.time : Math.floor(new Date(String(param.time)).getTime() / 1e3);
          return this.currentRowsByTime.get(timeValue) ?? this.currentRows[this.currentRows.length - 1] ?? null;
        }
        updateLegendFromRow(row) {
          if (!row) {
            this.elements.legendTime.textContent = "--";
            this.elements.legendValues.textContent = "No candle selected";
            return;
          }
          const change = row.close - row.open;
          const changePct = row.open === 0 ? 0 : change / row.open * 100;
          const parts = [
            `O ${formatNumber(row.open, 3)}`,
            `H ${formatNumber(row.high, 3)}`,
            `L ${formatNumber(row.low, 3)}`,
            `C ${formatNumber(row.close, 3)}`,
            `${formatSigned(change, 3)} (${formatSigned(changePct, 2)}%)`,
            `Vol ${formatNumber(row.volume, 2)}`
          ];
          this.elements.legendTime.textContent = formatDateTime(row.close_time_utc);
          this.elements.legendValues.textContent = parts.join("   ");
        }
        updateHeadline(dataset) {
          const latest = dataset.rows[dataset.rows.length - 1];
          const previous = dataset.rows[dataset.rows.length - 2] ?? latest;
          const change = latest.close - previous.close;
          const changePct = previous.close === 0 ? 0 : change / previous.close * 100;
          this.elements.headlinePrice.textContent = formatNumber(latest.close, 3);
          this.elements.headlineChange.textContent = `${formatSigned(change, 3)} (${formatSigned(changePct, 2)}%)`;
          this.elements.headlineChange.classList.toggle("is-positive", change >= 0);
          this.elements.headlineChange.classList.toggle("is-negative", change < 0);
        }
        updateSidebar(interval, dataset) {
          if (!this.metadata) {
            return;
          }
          const coverage = getCoverageEntry(this.metadata, interval);
          const latest = dataset.rows[dataset.rows.length - 1];
          const highs = dataset.rows.map((row) => row.high);
          const lows = dataset.rows.map((row) => row.low);
          const totalVolume = dataset.rows.reduce((sum, row) => sum + row.volume, 0);
          const totalTrades = dataset.rows.reduce((sum, row) => sum + row.trade_count, 0);
          const averageTrades = totalTrades / dataset.rows.length;
          this.elements.sidebarTitle.textContent = `${interval} snapshot`;
          this.elements.stats.rows.textContent = formatInteger(dataset.rows.length);
          this.elements.stats.close.textContent = formatNumber(latest.close, 3);
          this.elements.stats.range.textContent = `${formatNumber(Math.min(...lows), 3)} - ${formatNumber(Math.max(...highs), 3)}`;
          this.elements.stats.volume.textContent = formatNumber(totalVolume, 2);
          this.elements.stats.trades.textContent = formatNumber(averageTrades, 2);
          this.elements.stats.window.textContent = coverage ? `${formatDateOnly(coverage.first_open_time_utc)} to ${formatDateOnly(coverage.last_close_time_utc)}` : "--";
          this.elements.headlineCoverage.textContent = coverage ? `${formatDateOnly(coverage.first_open_time_utc)} -> ${formatDateOnly(coverage.last_close_time_utc)}` : "Coverage unavailable";
          if (coverage) {
            const freshness = describeCoverageFreshness(coverage, this.metadata.downloadedAtUtc);
            this.elements.freshnessPill.textContent = freshness.label;
            this.elements.stats.dataLag.textContent = freshness.shortLabel;
            applyFreshnessTone(this.elements.freshnessPill, freshness.tone);
            applyFreshnessTone(this.elements.stats.dataLag, freshness.tone);
          } else {
            this.elements.freshnessPill.textContent = "Data freshness unavailable";
            this.elements.stats.dataLag.textContent = "--";
          }
        }
        updateCoverageSelection(interval) {
          document.querySelectorAll("[data-timeframe]").forEach((element) => {
            element.classList.toggle("is-active", element.dataset.timeframe === interval);
          });
        }
        updateUrl(interval) {
          const url = new URL(window.location.href);
          url.searchParams.set("tf", interval);
          window.history.replaceState({}, "", url);
        }
        setLoading(visible, message = "Loading...") {
          this.elements.loadingMask.textContent = message;
          this.elements.loadingMask.classList.toggle("is-hidden", !visible);
        }
      };
      window.addEventListener("load", () => {
        const app = new SilverTerminalApp();
        void app.start();
      });
    }
  });
  require_main();
})();
/*! Bundled license information:

lightweight-charts/dist/lightweight-charts.production.mjs:
  (*!
   * @license
   * TradingView Lightweight Charts™ v5.1.0
   * Copyright (c) 2025 TradingView, Inc.
   * Licensed under Apache License 2.0 https://www.apache.org/licenses/LICENSE-2.0
   *)
*/
