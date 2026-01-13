"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertStyleToClassName = convertStyleToClassName;
exports.default = variableFallbacks;
var _hash = _interopRequireDefault(require("./hash"));
var _dashify = _interopRequireDefault(require("./utils/dashify"));
var _transformValue = _interopRequireDefault(require("./transform-value"));
var _generateCssRule = require("./generate-css-rule");
var _defaultOptions = require("./utils/default-options");
var messages = _interopRequireWildcard(require("./messages"));
var _ruleUtils = require("./utils/rule-utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function convertStyleToClassName(objEntry, pseudos, atRules) {
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _defaultOptions.defaultOptions;
  const {
    classNamePrefix = 'x',
    debug = false,
    enableDebugClassNames = true
  } = options;
  const [key, rawValue] = objEntry;
  const dashedKey = key.startsWith('--') ? key : (0, _dashify.default)(key);
  let value = Array.isArray(rawValue) ? rawValue.map(eachValue => (0, _transformValue.default)(key, eachValue, options)) : (0, _transformValue.default)(key, rawValue, options);
  if (Array.isArray(value) && value.find(val => val.startsWith('var(') && val.endsWith(')'))) {
    value = variableFallbacks(value);
  }
  const sortedPseudos = (0, _ruleUtils.sortPseudos)(pseudos ?? []);
  const sortedAtRules = (0, _ruleUtils.sortAtRules)(atRules ?? []);
  const pseudoHashString = sortedPseudos.join('');
  const atRuleHashString = sortedAtRules.join('');
  const modifierHashString = pseudoHashString + atRuleHashString || 'null';
  const valueAsString = Array.isArray(value) ? value.join(', ') : value;
  const stringToHash = dashedKey + valueAsString + modifierHashString;
  const className = debug && enableDebugClassNames ? `${key}-${classNamePrefix}${(0, _hash.default)('<>' + stringToHash)}` : classNamePrefix + (0, _hash.default)('<>' + stringToHash);
  const cssRules = (0, _generateCssRule.generateRule)(className, dashedKey, value, pseudos, atRules);
  return [key, className, cssRules];
}
function variableFallbacks(values) {
  const firstVar = values.findIndex(val => val.startsWith('var(') && val.endsWith(')'));
  const lastVar = values.findLastIndex(val => val.startsWith('var(') && val.endsWith(')'));
  const valuesBeforeFirstVar = values.slice(0, firstVar);
  let varValues = values.slice(firstVar, lastVar + 1).reverse();
  const valuesAfterLastVar = values.slice(lastVar + 1);
  if (varValues.find(val => !val.startsWith('var(') || !val.endsWith(')'))) {
    throw new Error(messages.NON_CONTIGUOUS_VARS);
  }
  varValues = varValues.map(val => val.slice(4, -1));
  return [...(valuesBeforeFirstVar.length > 0 ? valuesBeforeFirstVar.map(val => composeVars(...varValues, val)) : composeVars(...varValues)), ...valuesAfterLastVar];
}
function composeVars() {
  for (var _len = arguments.length, vars = new Array(_len), _key = 0; _key < _len; _key++) {
    vars[_key] = arguments[_key];
  }
  const [first, ...rest] = vars;
  if (rest.length > 0) {
    return `var(${first},${composeVars(...rest)})`;
  } else if (first.startsWith('--')) {
    return `var(${first})`;
  } else {
    return first;
  }
}