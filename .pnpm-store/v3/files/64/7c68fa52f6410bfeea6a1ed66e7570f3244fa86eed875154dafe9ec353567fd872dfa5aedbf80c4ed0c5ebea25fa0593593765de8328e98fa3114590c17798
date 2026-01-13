'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeTimings;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function normalizeTimings(ast, _) {
  ast.walk(node => {
    if (node.type !== 'word') {
      return;
    }
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return;
    }
    const dimension = _postcssValueParser.default.unit(node.value);
    if (!dimension || dimension.unit !== 'ms' || value < 10) {
      return;
    }
    node.value = value / 1000 + 's';
  });
  return ast;
}