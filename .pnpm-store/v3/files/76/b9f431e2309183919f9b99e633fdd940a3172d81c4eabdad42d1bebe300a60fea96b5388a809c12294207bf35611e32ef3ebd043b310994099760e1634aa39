"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._flattenRawStyleObject = _flattenRawStyleObject;
exports.flattenRawStyleObject = flattenRawStyleObject;
var _index = _interopRequireDefault(require("./index"));
var _PreRule = require("./PreRule");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function flattenRawStyleObject(style, options) {
  return _flattenRawStyleObject(style, [], options);
}
function _flattenRawStyleObject(style, keyPath, options) {
  const flattened = [];
  for (const _key in style) {
    const value = style[_key];
    const key = _key.match(/var\(--[a-z0-9]+\)/) ? _key.slice(4, -1) : _key;
    if (value === null || typeof value === 'string' || typeof value === 'number') {
      const pairs = (0, _index.default)([key, value], options);
      for (const [property, value] of pairs) {
        if (value === null) {
          flattened.push([property, new _PreRule.NullPreRule()]);
        } else {
          flattened.push([property, new _PreRule.PreRule(property, value, keyPath.includes(key) ? keyPath.map(k => k === key ? property : k) : [...keyPath, property])]);
        }
      }
      continue;
    }
    if (Array.isArray(value)) {
      const equivalentPairs = {};
      for (const eachVal of value) {
        const pairs = (0, _index.default)([key, eachVal], options);
        for (const [property, val] of pairs) {
          if (Array.isArray(val)) {
            if (equivalentPairs[property] == null) {
              equivalentPairs[property] = [...val];
            } else {
              equivalentPairs[property].push(...val);
            }
          } else if (equivalentPairs[property] == null) {
            equivalentPairs[property] = [val];
          } else {
            equivalentPairs[property].push(val);
          }
        }
      }
      Object.entries(equivalentPairs).map(_ref => {
        let [property, values] = _ref;
        return [property, [...new Set(values.filter(Boolean))]];
      }).map(_ref2 => {
        let [property, values] = _ref2;
        return [property, values.length === 0 ? null : values.length === 1 ? values[0] : values];
      }).forEach(_ref3 => {
        let [property, value] = _ref3;
        if (value === null) {
          flattened.push([property, new _PreRule.NullPreRule()]);
        } else {
          flattened.push([property, new _PreRule.PreRule(property, value, keyPath.includes(_key) ? keyPath.map(k => k === _key ? property : k) : [...keyPath, property])]);
        }
      });
      continue;
    }
    if (typeof value === 'object' && !key.startsWith(':') && !key.startsWith('@')) {
      const equivalentPairs = {};
      for (const condition in value) {
        const innerValue = value[condition];
        const pairs = _flattenRawStyleObject({
          [key]: innerValue
        }, keyPath.length > 0 ? [...keyPath, condition] : [key, condition], options);
        for (const [property, preRule] of pairs) {
          if (equivalentPairs[property] == null) {
            equivalentPairs[property] = {
              [condition]: preRule
            };
          } else {
            equivalentPairs[property][condition] = preRule;
          }
        }
      }
      for (const [property, obj] of Object.entries(equivalentPairs)) {
        const sortedKeys = Object.keys(obj);
        const rules = [];
        for (const condition of sortedKeys) {
          rules.push(obj[condition]);
        }
        flattened.push([property, _PreRule.PreRuleSet.create(rules)]);
      }
    }
    if (typeof value === 'object' && (key.startsWith(':') || key.startsWith('@'))) {
      const pairs = _flattenRawStyleObject(value, [...keyPath, _key], options);
      for (const [property, preRule] of pairs) {
        flattened.push([key + '_' + property, preRule]);
      }
    }
  }
  return flattened;
}