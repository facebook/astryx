'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeValue;
var _fontSizePxToRem = _interopRequireDefault(require("./normalizers/font-size-px-to-rem"));
var _leadingZero = _interopRequireDefault(require("./normalizers/leading-zero"));
var _quotes = _interopRequireDefault(require("./normalizers/quotes"));
var _timings = _interopRequireDefault(require("./normalizers/timings"));
var _whitespace = _interopRequireDefault(require("./normalizers/whitespace"));
var _zeroDimensions = _interopRequireDefault(require("./normalizers/zero-dimensions"));
var _detectUnclosedFns = _interopRequireDefault(require("./normalizers/detect-unclosed-fns"));
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
var _convertCamelCaseValues = _interopRequireDefault(require("./normalizers/convert-camel-case-values"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const normalizers = [_detectUnclosedFns.default, _whitespace.default, _timings.default, _zeroDimensions.default, _leadingZero.default, _quotes.default, _convertCamelCaseValues.default];
function normalizeValue(value, key, _ref) {
  let {
    useRemForFontSize
  } = _ref;
  if (value == null) {
    return value;
  }
  const parsedAST = (0, _postcssValueParser.default)(value);
  const relevantNormalizers = useRemForFontSize ? [...normalizers, _fontSizePxToRem.default] : normalizers;
  return relevantNormalizers.reduce((ast, fn) => fn(ast, key), parsedAST).toString();
}