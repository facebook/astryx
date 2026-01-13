"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IncludedStyles = void 0;
exports.default = stylexInclude;
var messages = _interopRequireWildcard(require("./messages"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
let number = 0;
function uuid() {
  return `__included_${++number}__`;
}
class IncludedStyles {
  constructor(astNode) {
    this.astNode = astNode;
  }
}
exports.IncludedStyles = IncludedStyles;
function stylexInclude(firstArg) {
  if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 0) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }
  return {
    [uuid()]: new IncludedStyles(firstArg.node)
  };
}