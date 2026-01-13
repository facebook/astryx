"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = styleXKeyframes;
var _hash = _interopRequireDefault(require("./hash"));
var _index = _interopRequireDefault(require("./preprocess-rules/index"));
var _generateLtr = _interopRequireDefault(require("./physical-rtl/generate-ltr"));
var _generateRtl = _interopRequireDefault(require("./physical-rtl/generate-rtl"));
var _transformValue = _interopRequireDefault(require("./transform-value"));
var _dashify = _interopRequireDefault(require("./utils/dashify"));
var _objectUtils = require("./utils/object-utils");
var _defaultOptions = require("./utils/default-options");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function styleXKeyframes(frames) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultOptions.defaultOptions;
  const {
    classNamePrefix = 'x'
  } = options;
  const expandedObject = (0, _objectUtils.objMap)(frames, frame => _objectUtils.Pipe.create(frame).pipe(frame => expandFrameShorthands(frame, options)).pipe(x => (0, _objectUtils.objMapKeys)(x, _dashify.default)).pipe(x => (0, _objectUtils.objMap)(x, (value, key) => (0, _transformValue.default)(key, value, options))).done());
  const ltrStyles = (0, _objectUtils.objMap)(expandedObject, frame => (0, _objectUtils.objMapEntry)(frame, _generateLtr.default));
  const rtlStyles = (0, _objectUtils.objMap)(expandedObject, frame => (0, _objectUtils.objMapEntry)(frame, entry => (0, _generateRtl.default)(entry) ?? entry));
  const ltrString = constructKeyframesObj(ltrStyles);
  const rtlString = constructKeyframesObj(rtlStyles);
  const animationName = classNamePrefix + (0, _hash.default)('<>' + ltrString) + '-B';
  const ltr = `@keyframes ${animationName}{${ltrString}}`;
  const rtl = ltrString === rtlString ? null : `@keyframes ${animationName}{${rtlString}}`;
  return [animationName, {
    ltr,
    rtl,
    priority: 1
  }];
}
function expandFrameShorthands(frame, options) {
  return (0, _objectUtils.objFromEntries)((0, _objectUtils.objEntries)(frame).flatMap(pair => (0, _index.default)(pair, options).map(_ref => {
    let [key, value] = _ref;
    if (typeof value === 'string' || typeof value === 'number') {
      return [key, value];
    }
    return null;
  }).filter(Boolean)).filter(_ref2 => {
    let [_key, value] = _ref2;
    return value != null;
  }));
}
function constructKeyframesObj(frames) {
  return (0, _objectUtils.objEntries)(frames).map(_ref3 => {
    let [key, value] = _ref3;
    return `${key}{${(0, _objectUtils.objEntries)(value).map(_ref4 => {
      let [k, v] = _ref4;
      return `${k}:${v};`;
    }).join('')}}`;
  }).join('');
}