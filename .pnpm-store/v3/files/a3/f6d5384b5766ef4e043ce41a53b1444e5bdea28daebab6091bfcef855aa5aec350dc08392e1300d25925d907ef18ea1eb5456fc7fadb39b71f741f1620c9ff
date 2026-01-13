'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeZeroDimensions;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const angles = ['deg', 'grad', 'turn', 'rad'];
const timings = ['ms', 's'];
const fraction = 'fr';
const percentage = '%';
function normalizeZeroDimensions(ast, _) {
  let endFunction = 0;
  ast.walk(node => {
    if (node.type === 'function' && !endFunction) {
      endFunction = node.sourceEndIndex ?? 0;
    }
    if (endFunction > 0 && node.sourceIndex > endFunction) {
      endFunction = 0;
    }
    if (node.type !== 'word') {
      return;
    }
    const dimension = _postcssValueParser.default.unit(node.value);
    if (!dimension || dimension.number !== '0') {
      return;
    }
    if (angles.indexOf(dimension.unit) !== -1) {
      node.value = '0deg';
    } else if (timings.indexOf(dimension.unit) !== -1) {
      node.value = '0s';
    } else if (dimension.unit === fraction) {
      node.value = '0fr';
    } else if (dimension.unit === percentage) {
      node.value = '0%';
    } else if (!endFunction) {
      node.value = '0';
    }
  });
  return ast;
}