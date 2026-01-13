'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertFontSizeToRem;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ROOT_FONT_SIZE = 16;
function convertFontSizeToRem(ast, key) {
  if (key !== 'fontSize') {
    return ast;
  }
  ast.walk(node => {
    if (node.type !== 'word') {
      return;
    }
    const dimension = _postcssValueParser.default.unit(node.value);
    if (dimension && dimension.unit === 'px') {
      node.value = `${parseFloat(dimension.number) / ROOT_FONT_SIZE}rem`;
    }
  });
  return ast;
}