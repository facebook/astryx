'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalizeWhitespace;
function normalizeWhitespace(ast, _) {
  if (ast.nodes[0].type === 'space') {
    ast.nodes.shift();
  }
  if (ast.nodes[ast.nodes.length - 1].type === 'space') {
    ast.nodes.pop();
  }
  ast.walk((node, idx) => {
    switch (node.type) {
      case 'space':
        {
          node.value = ' ';
          break;
        }
      case 'div':
        {
          if (node.value === ',') {
            node.before = '';
            node.after = '';
          } else {
            node.before = ' ';
            node.after = ' ';
          }
          break;
        }
      case 'function':
        {
          node.before = '';
          node.after = '';
          break;
        }
      case 'word':
        {
          if (node.value === '!important') {
            if (ast.nodes[idx - 1] && ast.nodes[idx - 1].type === 'space') {
              ast.nodes.splice(idx - 1, 1);
            }
          }
          break;
        }
      default:
        {
          break;
        }
    }
  });
  return ast;
}