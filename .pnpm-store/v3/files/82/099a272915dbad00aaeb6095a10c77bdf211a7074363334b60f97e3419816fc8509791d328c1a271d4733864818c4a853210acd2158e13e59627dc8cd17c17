'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleq = void 0;
var cache = new WeakMap();
var compiledKey = '$$css';
function createStyleq(options) {
  var disableCache;
  var disableMix;
  var transform;
  if (options != null) {
    disableCache = options.disableCache === true;
    disableMix = options.disableMix === true;
    transform = options.transform;
  }
  return function styleq() {
    var definedProperties = [];
    var className = '';
    var inlineStyle = null;
    var debugString = '';
    var nextCache = disableCache ? null : cache;
    var styles = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
      styles[i] = arguments[i];
    }
    while (styles.length > 0) {
      var possibleStyle = styles.pop();
      if (possibleStyle == null || possibleStyle === false) {
        continue;
      }
      if (Array.isArray(possibleStyle)) {
        for (var _i = 0; _i < possibleStyle.length; _i++) {
          styles.push(possibleStyle[_i]);
        }
        continue;
      }
      var style = transform != null ? transform(possibleStyle) : possibleStyle;
      if (style.$$css != null) {
        var classNameChunk = '';
        if (nextCache != null && nextCache.has(style)) {
          var cacheEntry = nextCache.get(style);
          if (cacheEntry != null) {
            classNameChunk = cacheEntry[0];
            debugString = cacheEntry[2];
            definedProperties.push.apply(definedProperties, cacheEntry[1]);
            nextCache = cacheEntry[3];
          }
        } else {
          var definedPropertiesChunk = [];
          for (var prop in style) {
            var value = style[prop];
            if (prop === compiledKey) {
              var compiledKeyValue = style[prop];
              if (compiledKeyValue !== true) {
                debugString = debugString ? compiledKeyValue + '; ' + debugString : compiledKeyValue;
              }
              continue;
            }
            if (typeof value === 'string' || value === null) {
              if (!definedProperties.includes(prop)) {
                definedProperties.push(prop);
                if (nextCache != null) {
                  definedPropertiesChunk.push(prop);
                }
                if (typeof value === 'string') {
                  classNameChunk += classNameChunk ? ' ' + value : value;
                }
              }
            } else {
              console.error("styleq: ".concat(prop, " typeof ").concat(String(value), " is not \"string\" or \"null\"."));
            }
          }
          if (nextCache != null) {
            var weakMap = new WeakMap();
            nextCache.set(style, [classNameChunk, definedPropertiesChunk, debugString, weakMap]);
            nextCache = weakMap;
          }
        }
        if (classNameChunk) {
          className = className ? classNameChunk + ' ' + className : classNameChunk;
        }
      } else {
        if (disableMix) {
          if (inlineStyle == null) {
            inlineStyle = {};
          }
          inlineStyle = Object.assign({}, style, inlineStyle);
        } else {
          var subStyle = null;
          for (var _prop in style) {
            var _value = style[_prop];
            if (_value !== undefined) {
              if (!definedProperties.includes(_prop)) {
                if (_value != null) {
                  if (inlineStyle == null) {
                    inlineStyle = {};
                  }
                  if (subStyle == null) {
                    subStyle = {};
                  }
                  subStyle[_prop] = _value;
                }
                definedProperties.push(_prop);
                nextCache = null;
              }
            }
          }
          if (subStyle != null) {
            inlineStyle = Object.assign(subStyle, inlineStyle);
          }
        }
      }
    }
    var styleProps = [className, inlineStyle, debugString];
    return styleProps;
  };
}
var styleq = exports.styleq = createStyleq();
styleq.factory = createStyleq;