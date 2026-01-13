"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateNamespace = validateNamespace;
var messages = _interopRequireWildcard(require("../messages"));
var _objectUtils = require("../utils/object-utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function validateNamespace(namespace) {
  let conditions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (!(0, _objectUtils.isPlainObject)(namespace)) {
    throw new Error(messages.ILLEGAL_NAMESPACE_VALUE);
  }
  const ns = namespace;
  for (const key in ns) {
    const val = ns[key];
    if (val === null || typeof val === 'string' || typeof val === 'number') {
      continue;
    }
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v === null || typeof v === 'string' || typeof v === 'number') {
          continue;
        }
        throw new Error(messages.ILLEGAL_PROP_ARRAY_VALUE);
      }
      continue;
    }
    if ((0, _objectUtils.isPlainObject)(val)) {
      if (key.startsWith('@') || key.startsWith(':')) {
        if (conditions.includes(key)) {
          throw new Error(messages.DUPLICATE_CONDITIONAL);
        }
        validateNamespace(val, [...conditions, key]);
      } else {
        validateConditionalStyles(val);
      }
      continue;
    }
    throw new Error(messages.ILLEGAL_PROP_VALUE);
  }
}
function validateConditionalStyles(val) {
  let conditions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  for (const key in val) {
    const v = val[key];
    if (!(key.startsWith('@') || key.startsWith(':') || key === 'default')) {
      throw new Error(messages.INVALID_PSEUDO_OR_AT_RULE);
    }
    if (conditions.includes(key)) {
      throw new Error(messages.DUPLICATE_CONDITIONAL);
    }
    if (v === null || typeof v === 'string' || typeof v === 'number') {
      continue;
    }
    if (Array.isArray(v)) {
      for (const vv of v) {
        if (vv === null || typeof vv === 'string' || typeof vv === 'number') {
          continue;
        }
        throw new Error(messages.ILLEGAL_PROP_VALUE);
      }
      continue;
    }
    if ((0, _objectUtils.isPlainObject)(v)) {
      validateConditionalStyles(v, [...conditions, key]);
      continue;
    }
    throw new Error(messages.ILLEGAL_PROP_VALUE);
  }
}