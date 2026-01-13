'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeLeadingZero;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function normalizeLeadingZero(ast, _) {
  ast.walk(node => {
    if (node.type !== 'word') {
      return;
    }
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return;
    }
    const dimension = _postcssValueParser.default.unit(node.value);
    if (value < 1 && value >= 0) {
      node.value = value.toString().replace('0.', '.') + (dimension ? dimension.unit : '');
    }
  });
  return ast;
}