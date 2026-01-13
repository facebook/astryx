"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = splitValue;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function printNode(node) {
  switch (node.type) {
    case 'word':
    case 'string':
      return `${node.value}`;
    case 'function':
      return `${node.value}(${node.nodes.map(printNode).join('')})`;
    default:
      return node.value;
  }
}
function splitValue(str) {
  if (str == null || typeof str === 'number') {
    return [str];
  }
  if (Array.isArray(str)) {
    return str;
  }
  const parsed = (0, _postcssValueParser.default)(str.trim());
  const nodes = parsed.nodes.filter(node => node.type !== 'space' && node.type !== 'div').map(printNode);
  if (nodes.length > 1 && nodes[nodes.length - 1].toLowerCase() === '!important') {
    return nodes.slice(0, nodes.length - 1).map(node => node + ' !important');
  }
  return nodes;
}