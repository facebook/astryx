"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.types = exports.messages = exports.keyframes = exports.firstThatWorks = exports.defineVars = exports.createTheme = exports.create = exports.PSEUDO_ELEMENT_PRIORITY = exports.PSEUDO_CLASS_PRIORITIES = exports.AT_RULE_PRIORITIES = void 0;
var _stylexCreate = _interopRequireDefault(require("./stylex-create"));
var _stylexDefineVars = _interopRequireDefault(require("./stylex-define-vars"));
var _stylexCreateTheme = _interopRequireDefault(require("./stylex-create-theme"));
var _stylexKeyframes = _interopRequireDefault(require("./stylex-keyframes"));
var _stylexFirstThatWorks = _interopRequireDefault(require("./stylex-first-that-works"));
var _hash = _interopRequireDefault(require("./hash"));
var _fileBasedIdentifier = _interopRequireDefault(require("./utils/file-based-identifier"));
var m = _interopRequireWildcard(require("./messages"));
var _types = _interopRequireWildcard(require("./types"));
exports.types = _types;
var _propertyPriorities = require("./utils/property-priorities");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const create = exports.create = _stylexCreate.default;
const defineVars = exports.defineVars = _stylexDefineVars.default;
const createTheme = exports.createTheme = _stylexCreateTheme.default;
const keyframes = exports.keyframes = _stylexKeyframes.default;
const utils = exports.utils = {
  hash: _hash.default,
  genFileBasedIdentifier: _fileBasedIdentifier.default
};
const messages = exports.messages = m;
const firstThatWorks = exports.firstThatWorks = _stylexFirstThatWorks.default;
const PSEUDO_CLASS_PRIORITIES = exports.PSEUDO_CLASS_PRIORITIES = _propertyPriorities.PSEUDO_CLASS_PRIORITIES;
const AT_RULE_PRIORITIES = exports.AT_RULE_PRIORITIES = _propertyPriorities.AT_RULE_PRIORITIES;
const PSEUDO_ELEMENT_PRIORITY = exports.PSEUDO_ELEMENT_PRIORITY = _propertyPriorities.PSEUDO_ELEMENT_PRIORITY;