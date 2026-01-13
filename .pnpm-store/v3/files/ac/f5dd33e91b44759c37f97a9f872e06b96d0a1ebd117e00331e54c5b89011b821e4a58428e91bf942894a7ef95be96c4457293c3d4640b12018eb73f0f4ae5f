"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = styleXCreateTheme;
var _hash = _interopRequireDefault(require("./hash"));
var _stylexVarsUtils = require("./stylex-vars-utils");
var _types = require("./types");
var _defaultOptions = require("./utils/default-options");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function styleXCreateTheme(themeVars, variables, options) {
  if (typeof themeVars.__themeName__ !== 'string') {
    throw new Error('Can only override variables theme created with stylex.defineVars().');
  }
  const {
    classNamePrefix
  } = {
    ..._defaultOptions.defaultOptions,
    ...options
  };
  const rulesByAtRule = {};
  const sortedKeys = Object.keys(variables).sort();
  for (const key of sortedKeys) {
    const value = (0, _types.isCSSType)(variables[key]) ? variables[key].value : variables[key];
    const nameHash = themeVars[key].slice(6, -1);
    (0, _stylexVarsUtils.collectVarsByAtRule)(key, {
      nameHash,
      value
    }, rulesByAtRule);
  }
  const sortedAtRules = Object.keys(rulesByAtRule).sort((a, b) => a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b));
  const atRulesStringForHash = sortedAtRules.map(atRule => (0, _stylexVarsUtils.wrapWithAtRules)(rulesByAtRule[atRule].join(''), atRule)).join('');
  const overrideClassName = classNamePrefix + (0, _hash.default)(atRulesStringForHash);
  const stylesToInject = {};
  for (const atRule of sortedAtRules) {
    const decls = rulesByAtRule[atRule].join('');
    const rule = `.${overrideClassName}, .${overrideClassName}:root{${decls}}`;
    if (atRule === 'default') {
      stylesToInject[overrideClassName] = {
        ltr: rule,
        priority: 0.5,
        rtl: null
      };
    } else {
      stylesToInject[overrideClassName + '-' + (0, _hash.default)(atRule)] = {
        ltr: (0, _stylexVarsUtils.wrapWithAtRules)(rule, atRule),
        priority: 0.5 + 0.1 * (0, _stylexVarsUtils.priorityForAtRule)(atRule),
        rtl: null
      };
    }
  }
  const themeClass = `${overrideClassName} ${themeVars.__themeName__}`;
  return [{
    $$css: true,
    [themeVars.__themeName__]: themeClass
  }, stylesToInject];
}