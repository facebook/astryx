"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = styleXDefineVars;
var _hash = _interopRequireDefault(require("./hash"));
var _objectUtils = require("./utils/object-utils");
var _defaultOptions = require("./utils/default-options");
var _stylexVarsUtils = require("./stylex-vars-utils");
var _types = require("./types");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function styleXDefineVars(variables, options) {
  const {
    classNamePrefix,
    themeName,
    debug
  } = {
    ..._defaultOptions.defaultOptions,
    ...options
  };
  const themeNameHash = classNamePrefix + (0, _hash.default)(themeName);
  const typedVariables = {};
  const variablesMap = (0, _objectUtils.objMap)(variables, (value, key) => {
    const nameHash = key.startsWith('--') ? key.slice(2) : debug ? key + '-' + classNamePrefix + (0, _hash.default)(`${themeName}.${key}`) : classNamePrefix + (0, _hash.default)(`${themeName}.${key}`);
    if ((0, _types.isCSSType)(value)) {
      const v = value;
      typedVariables[nameHash] = {
        initialValue: (0, _stylexVarsUtils.getDefaultValue)(v.value),
        syntax: v.syntax
      };
      return {
        nameHash,
        value: v.value
      };
    }
    return {
      nameHash,
      value: value
    };
  });
  const themeVariablesObject = (0, _objectUtils.objMap)(variablesMap, _ref => {
    let {
      nameHash
    } = _ref;
    return `var(--${nameHash})`;
  });
  const injectableStyles = constructCssVariablesString(variablesMap, themeNameHash);
  const injectableTypes = (0, _objectUtils.objMap)(typedVariables, (_ref2, nameHash) => {
    let {
      initialValue: iv,
      syntax
    } = _ref2;
    return {
      ltr: `@property --${nameHash} { syntax: "${syntax}"; inherits: true;${iv != null ? ` initial-value: ${iv}` : ''} }`,
      rtl: null,
      priority: 0
    };
  });
  return [{
    ...themeVariablesObject,
    __themeName__: themeNameHash
  }, {
    ...injectableTypes,
    ...injectableStyles
  }];
}
function constructCssVariablesString(variables, themeNameHash) {
  const rulesByAtRule = {};
  for (const [key, {
    nameHash,
    value
  }] of Object.entries(variables)) {
    (0, _stylexVarsUtils.collectVarsByAtRule)(key, {
      nameHash,
      value
    }, rulesByAtRule);
  }
  const result = {};
  for (const [atRule, value] of Object.entries(rulesByAtRule)) {
    const suffix = atRule === 'default' ? '' : `-${(0, _hash.default)(atRule)}`;
    const selector = `:root, .${themeNameHash}`;
    let ltr = `${selector}{${value.join('')}}`;
    if (atRule !== 'default') {
      ltr = (0, _stylexVarsUtils.wrapWithAtRules)(ltr, atRule);
    }
    result[themeNameHash + suffix] = {
      ltr,
      rtl: null,
      priority: (0, _stylexVarsUtils.priorityForAtRule)(atRule) * 0.1
    };
  }
  return result;
}