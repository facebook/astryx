"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flatMapExpandedShorthands;
exports.getExpandedKeys = getExpandedKeys;
var _applicationOrder = _interopRequireDefault(require("./application-order"));
var _legacyExpandShorthands = _interopRequireDefault(require("./legacy-expand-shorthands"));
var _propertySpecificity = _interopRequireDefault(require("./property-specificity"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const expansions = {
  'application-order': _applicationOrder.default,
  'property-specificity': _propertySpecificity.default,
  'legacy-expand-shorthands': _legacyExpandShorthands.default
};
function getExpandedKeys(options) {
  return Object.keys(expansions[options.styleResolution ?? 'application-order']);
}
function flatMapExpandedShorthands(objEntry, options) {
  let [key, value] = objEntry;
  if (key.startsWith('var(') && key.endsWith(')')) {
    key = key.slice(4, -1);
  }
  const expansion = expansions[options.styleResolution ?? 'application-order'][key];
  if (expansion) {
    if (Array.isArray(value)) {
      throw new Error('Cannot use fallbacks for shorthands. Use the expansion instead.');
    }
    return expansion(value);
  }
  return [[key, value]];
}