// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-inline-merge-refs.js
 * @description Prevents unstable ref composition during render.
 */

const noInlineMergeRefsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent render-inline mergeRefs calls and unstable callback arguments to useMergedRefs',
      category: 'Astryx Conventions',
      recommended: true,
    },
    messages: {
      useHook:
        'Do not call mergeRefs inside a JSX ref prop. Use useMergedRefs so the callback ref remains stable across rerenders.',
      stableInput:
        'Do not pass an inline callback to useMergedRefs. Pass a stable ref directly or memoize the callback first.',
    },
    schema: [],
  },
  create(context) {
    const importedMergeRefs = new Set();
    const importedUseMergedRefs = new Set();

    function isInsideRefAttribute(node) {
      let current = node.parent;
      while (current) {
        if (current.type === 'JSXExpressionContainer') {
          const attribute = current.parent;
          return (
            attribute?.type === 'JSXAttribute' &&
            attribute.name?.type === 'JSXIdentifier' &&
            attribute.name.name === 'ref'
          );
        }
        current = current.parent;
      }
      return false;
    }

    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (
            specifier.type !== 'ImportSpecifier' ||
            specifier.imported.type !== 'Identifier'
          ) {
            continue;
          }
          if (specifier.imported.name === 'mergeRefs') {
            importedMergeRefs.add(specifier.local.name);
          } else if (specifier.imported.name === 'useMergedRefs') {
            importedUseMergedRefs.add(specifier.local.name);
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') {
          return;
        }
        if (
          importedMergeRefs.has(node.callee.name) &&
          isInsideRefAttribute(node)
        ) {
          context.report({node, messageId: 'useHook'});
          return;
        }
        if (importedUseMergedRefs.has(node.callee.name)) {
          for (const argument of node.arguments) {
            if (
              argument.type === 'ArrowFunctionExpression' ||
              argument.type === 'FunctionExpression'
            ) {
              context.report({node: argument, messageId: 'stableInput'});
            }
          }
        }
      },
    };
  },
};

export default noInlineMergeRefsRule;
