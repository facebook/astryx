'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attrs = attrs;
exports.legacyMerge = exports.keyframes = exports.firstThatWorks = exports.defineVars = exports.createTheme = exports.create = void 0;
exports.props = props;
exports.types = void 0;
var Types = _interopRequireWildcard(require("./VarTypes"));
var _styleq = require("styleq");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const errorForFn = name => new Error(`Unexpected 'stylex.${name}' call at runtime. Styles must be compiled by '@stylexjs/babel-plugin'.`);
const errorForType = key => errorForFn(`types.${key}`);
function attrs() {
  const {
    className,
    'data-style-src': dataStyleSrc,
    style
  } = props(...arguments);
  const result = {};
  if (className != null && className !== '') {
    result.class = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = Object.keys(style).map(key => `${key}:${style[key]};`).join('');
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    result['data-style-src'] = dataStyleSrc;
  }
  return result;
}
const create = exports.create = function stylexCreate(_styles) {
  throw errorForFn('create');
};
const createTheme = (_baseTokens, _overrides) => {
  throw errorForFn('createTheme');
};
exports.createTheme = createTheme;
const defineVars = exports.defineVars = function stylexDefineVars(_styles) {
  throw errorForFn('defineVars');
};
const firstThatWorks = function () {
  throw errorForFn('firstThatWorks');
};
exports.firstThatWorks = firstThatWorks;
const keyframes = _keyframes => {
  throw errorForFn('keyframes');
};
exports.keyframes = keyframes;
function props() {
  for (var _len = arguments.length, styles = new Array(_len), _key = 0; _key < _len; _key++) {
    styles[_key] = arguments[_key];
  }
  const [className, style, dataStyleSrc] = (0, _styleq.styleq)(styles);
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
const types = exports.types = {
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
function _legacyMerge() {
  for (var _len2 = arguments.length, styles = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    styles[_key2] = arguments[_key2];
  }
  const [className] = (0, _styleq.styleq)(styles);
  return className;
}
_legacyMerge.attrs = attrs;
_legacyMerge.create = create;
_legacyMerge.createTheme = createTheme;
_legacyMerge.defineVars = defineVars;
_legacyMerge.firstThatWorks = firstThatWorks;
_legacyMerge.keyframes = keyframes;
_legacyMerge.props = props;
_legacyMerge.types = types;
const legacyMerge = exports.legacyMerge = _legacyMerge;