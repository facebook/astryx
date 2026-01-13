"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateRule = generateRule;
var _generateLtr = _interopRequireDefault(require("./physical-rtl/generate-ltr"));
var _generateRtl = _interopRequireDefault(require("./physical-rtl/generate-rtl"));
var _genCSSRule = require("./utils/genCSSRule");
var _propertyPriorities = _interopRequireDefault(require("./utils/property-priorities"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function generateRule(className, key, value, pseudos, atRules) {
  const pairs = Array.isArray(value) ? value.map(eachValue => [key, eachValue]) : [[key, value]];
  const ltrPairs = pairs.map(_generateLtr.default);
  const ltrDecls = ltrPairs.map(pair => pair.join(':')).join(';');
  const rtlDecls = pairs.map(_generateRtl.default).filter(Boolean).map(pair => pair.join(':')).join(';');
  const ltrRule = (0, _genCSSRule.genCSSRule)(className, ltrDecls, pseudos, atRules);
  const rtlRule = !rtlDecls ? null : (0, _genCSSRule.genCSSRule)(className, rtlDecls, pseudos, atRules);
  const priority = (0, _propertyPriorities.default)(key) + pseudos.map(_propertyPriorities.default).reduce((a, b) => a + b, 0) + atRules.map(_propertyPriorities.default).reduce((a, b) => a + b, 0);
  return {
    priority,
    ltr: ltrRule,
    rtl: rtlRule
  };
}