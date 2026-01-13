var styleq = {};

var hasRequiredStyleq;

function requireStyleq () {
	if (hasRequiredStyleq) return styleq;
	hasRequiredStyleq = 1;

	Object.defineProperty(styleq, "__esModule", {
	  value: true
	});
	styleq.styleq = void 0;
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
	var styleq$1 = styleq.styleq = createStyleq();
	styleq$1.factory = createStyleq;
	return styleq;
}

var styleqExports = /*@__PURE__*/ requireStyleq();

const errorForFn = name => new Error(`Unexpected 'stylex.${name}' call at runtime. Styles must be compiled by '@stylexjs/babel-plugin'.`);
const errorForType = key => errorForFn(`types.${key}`);
const create = function stylexCreate(_styles) {
  throw errorForFn('create');
};
const createTheme = (_baseTokens, _overrides) => {
  throw errorForFn('createTheme');
};
const defineConsts = function stylexDefineConsts(_styles) {
  throw errorForFn('defineConsts');
};
const defineVars = function stylexDefineVars(_styles) {
  throw errorForFn('defineVars');
};
const defineMarker = () => {
  throw errorForFn('defineMarker');
};
const firstThatWorks = (..._styles) => {
  throw errorForFn('firstThatWorks');
};
const keyframes = _keyframes => {
  throw errorForFn('keyframes');
};
const positionTry = _positionTry => {
  throw errorForFn('positionTry');
};
function props(...styles) {
  const [className, style, dataStyleSrc] = styleqExports.styleq(styles);
  const result = {};
  if (className != null && className !== '') {
    result.className = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style;
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    result['data-style-src'] = dataStyleSrc;
  }
  return result;
}
const viewTransitionClass = _viewTransitionClass => {
  throw errorForFn('viewTransitionClass');
};
const defaultMarker = () => {
  throw errorForFn('defaultMarker');
};
const when = {
  ancestor: _p => {
    throw errorForFn('when.ancestor');
  },
  descendant: _p => {
    throw errorForFn('when.descendant');
  },
  siblingBefore: _p => {
    throw errorForFn('when.siblingBefore');
  },
  siblingAfter: _p => {
    throw errorForFn('when.siblingAfter');
  },
  anySibling: _p => {
    throw errorForFn('when.anySibling');
  }
};
const types = {
  angle: _v => {
    throw errorForType('angle');
  },
  color: _v => {
    throw errorForType('color');
  },
  url: _v => {
    throw errorForType('url');
  },
  image: _v => {
    throw errorForType('image');
  },
  integer: _v => {
    throw errorForType('integer');
  },
  lengthPercentage: _v => {
    throw errorForType('lengthPercentage');
  },
  length: _v => {
    throw errorForType('length');
  },
  percentage: _v => {
    throw errorForType('percentage');
  },
  number: _v => {
    throw errorForType('number');
  },
  resolution: _v => {
    throw errorForType('resolution');
  },
  time: _v => {
    throw errorForType('time');
  },
  transformFunction: _v => {
    throw errorForType('transformFunction');
  },
  transformList: _v => {
    throw errorForType('transformList');
  }
};
function _legacyMerge(...styles) {
  const [className] = styleqExports.styleq(styles);
  return className;
}
_legacyMerge.create = create;
_legacyMerge.createTheme = createTheme;
_legacyMerge.defineConsts = defineConsts;
_legacyMerge.defineMarker = defineMarker;
_legacyMerge.defineVars = defineVars;
_legacyMerge.defaultMarker = defaultMarker;
_legacyMerge.firstThatWorks = firstThatWorks;
_legacyMerge.keyframes = keyframes;
_legacyMerge.positionTry = positionTry;
_legacyMerge.props = props;
_legacyMerge.types = types;
_legacyMerge.when = when;
_legacyMerge.viewTransitionClass = viewTransitionClass;
const legacyMerge = _legacyMerge;

export { create, createTheme, defaultMarker, defineConsts, defineMarker, defineVars, firstThatWorks, keyframes, legacyMerge, positionTry, props, types, viewTransitionClass, when };
