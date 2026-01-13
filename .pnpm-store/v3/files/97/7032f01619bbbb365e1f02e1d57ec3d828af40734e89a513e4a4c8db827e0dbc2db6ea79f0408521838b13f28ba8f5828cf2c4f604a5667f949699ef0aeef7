"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collectVarsByAtRule = collectVarsByAtRule;
exports.getDefaultValue = getDefaultValue;
exports.priorityForAtRule = priorityForAtRule;
exports.wrapWithAtRules = wrapWithAtRules;
const SPLIT_TOKEN = '__$$__';
function collectVarsByAtRule(key, _ref) {
  let {
    nameHash,
    value
  } = _ref;
  let collection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let atRules = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  if (typeof value === 'string' || typeof value === 'number') {
    const val = typeof value === 'number' ? value.toString() : value;
    const key = atRules.length === 0 ? 'default' : [...atRules].sort().join(SPLIT_TOKEN);
    collection[key] ??= [];
    collection[key].push(`--${nameHash}:${val};`);
    return;
  }
  if (value === null) {
    return;
  }
  if (Array.isArray(value)) {
    throw new Error('Array is not supported in stylex.defineVars');
  }
  if (typeof value === 'object') {
    if (value.default === undefined) {
      throw new Error('Default value is not defined for ' + key + ' variable.');
    }
    for (const atRule of Object.keys(value)) {
      collectVarsByAtRule(key, {
        nameHash,
        value: value[atRule]
      }, collection, atRule === 'default' ? atRules : [...atRules, atRule]);
    }
  }
}
function wrapWithAtRules(ltr, atRule) {
  return atRule.split(SPLIT_TOKEN).reduce((acc, atRule) => `${atRule}{${acc}}`, ltr);
}
function priorityForAtRule(atRule) {
  if (atRule === 'default') {
    return 0;
  }
  return atRule.split(SPLIT_TOKEN).length;
}
function getDefaultValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return value.toString();
  }
  if (value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    throw new Error('Array is not supported in stylex.defineVars');
  }
  if (typeof value === 'object') {
    if (value.default === undefined) {
      throw new Error('Default value is not defined for variable.');
    }
    return getDefaultValue(value.default);
  }
  throw new Error('Invalid value in stylex.defineVars');
}