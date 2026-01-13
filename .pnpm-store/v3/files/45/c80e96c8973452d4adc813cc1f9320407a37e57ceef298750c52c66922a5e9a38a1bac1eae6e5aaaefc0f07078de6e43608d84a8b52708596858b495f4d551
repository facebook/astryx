'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertCamelCasedValues;
var _dashify = _interopRequireDefault(require("../dashify"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function convertCamelCasedValues(ast, key) {
  if (key !== 'transitionProperty' && key !== 'willChange') {
    return ast;
  }
  const nodes = ast.nodes;
  if (!nodes) {
    return ast;
  }
  nodes.forEach(node => {
    if (node.type === 'word' && !node.value.startsWith('--')) {
      node.value = (0, _dashify.default)(node.value);
    }
  });
  return ast;
}