// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-unstable-merged-refs.js
 * @description Prevents unstable ref composition during render.
 */

const noUnstableMergedRefsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent render-time mergeRefs calls used as JSX refs and unstable callback arguments to useMergedRefs',
      category: 'Astryx Conventions',
      recommended: true,
    },
    messages: {
      useHook:
        'Do not create a JSX ref with mergeRefs during render. Use useMergedRefs so the callback ref remains stable across rerenders.',
      stableInput:
        'Do not pass an inline callback to useMergedRefs. Pass a stable ref directly or memoize the callback first.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const mergeRefsVariables = new Map();
    const reportedMergeRefsVariables = new WeakSet();

    function findRefAttribute(node) {
      let current = node.parent;
      while (current) {
        if (current.type === 'JSXExpressionContainer') {
          const attribute = current.parent;
          return attribute?.type === 'JSXAttribute' &&
            attribute.name?.type === 'JSXIdentifier' &&
            attribute.name.name === 'ref'
            ? attribute
            : null;
        }
        current = current.parent;
      }
      return null;
    }

    function findReferencedVariable(identifier) {
      let scope = sourceCode.getScope(identifier);
      while (scope) {
        const variable = scope.set?.get(identifier.name);
        if (variable) {
          return variable.references.some(
            reference => reference.identifier === identifier,
          )
            ? variable
            : null;
        }
        scope = scope.upper;
      }
      return null;
    }

    function isNamedImport(identifier, importedName) {
      const variable = findReferencedVariable(identifier);
      return variable?.defs.some(
        definition =>
          definition.type === 'ImportBinding' &&
          definition.node.type === 'ImportSpecifier' &&
          definition.node.imported.type === 'Identifier' &&
          definition.node.imported.name === importedName,
      );
    }

    function unwrap(node) {
      let current = node;
      while (
        current &&
        (current.type === 'TSAsExpression' ||
          current.type === 'TSSatisfiesExpression' ||
          current.type === 'TSNonNullExpression')
      ) {
        current = current.expression;
      }
      return current;
    }

    function enclosingFunction(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === 'ArrowFunctionExpression' ||
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression'
        ) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }

    return {
      VariableDeclarator(node) {
        const initializer = unwrap(node.init);
        const declarationFunction = enclosingFunction(node);
        if (
          node.id.type !== 'Identifier' ||
          initializer?.type !== 'CallExpression' ||
          initializer.callee.type !== 'Identifier' ||
          !isNamedImport(initializer.callee, 'mergeRefs') ||
          declarationFunction == null
        ) {
          return;
        }
        const [variable] = sourceCode.getDeclaredVariables(node);
        if (variable) {
          mergeRefsVariables.set(variable, {
            call: initializer,
            functionNode: declarationFunction,
          });
        }
      },
      Identifier(node) {
        if (findRefAttribute(node) == null) {
          return;
        }
        const variable = findReferencedVariable(node);
        const declaration = variable
          ? mergeRefsVariables.get(variable)
          : undefined;
        if (
          variable &&
          declaration?.functionNode === enclosingFunction(node) &&
          !reportedMergeRefsVariables.has(variable)
        ) {
          reportedMergeRefsVariables.add(variable);
          context.report({node: declaration.call, messageId: 'useHook'});
        }
      },
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') {
          return;
        }
        if (
          isNamedImport(node.callee, 'mergeRefs') &&
          findRefAttribute(node) != null
        ) {
          context.report({node, messageId: 'useHook'});
          return;
        }
        if (isNamedImport(node.callee, 'useMergedRefs')) {
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

export default noUnstableMergedRefsRule;
