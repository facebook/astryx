"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateEntry;
function validateEntry(_ref) {
  let [key, value] = _ref;
  if (Array.isArray(value)) {
    value.forEach(val => validateSimplyEntry([key, val]));
  } else {
    validateSimplyEntry([key, value]);
  }
}
function validateSimplyEntry(_ref2) {
  let [key, _value] = _ref2;
  if (BANNED_KEYS.has(key)) {
    throw new Error('Banned key: ' + key);
  }
}
const BANNED_KEYS = new Set(['background', 'transition', 'grid']);