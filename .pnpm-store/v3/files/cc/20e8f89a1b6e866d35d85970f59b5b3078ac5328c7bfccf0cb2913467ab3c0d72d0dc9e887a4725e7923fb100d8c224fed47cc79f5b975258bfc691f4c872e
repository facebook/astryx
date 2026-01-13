'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeQuotes;
function normalizeQuotes(ast, _) {
  ast.walk(node => {
    if (node.type !== 'string') {
      return;
    }
    if (node.value === '') {
      node.quote = '"';
    }
  });
  return ast;
}