/**
 * @file no-react-namespace-hooks.js
 * @description ESLint rule requiring direct imports of React hooks
 * instead of accessing them via the React namespace.
 *
 * Prefer:   import { useEffect } from 'react';  useEffect(...)
 * Avoid:    import React from 'react';           React.useEffect(...)
 *
 * This keeps imports explicit and consistent across the codebase.
 */

const REACT_HOOKS = new Set([
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useInsertionEffect',
  'useDebugValue',
  'useDeferredValue',
  'useTransition',
  'useId',
  'useSyncExternalStore',
  'useActionState',
  'useOptimistic',
  'useFormStatus',
]);

const noReactNamespaceHooksRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require direct imports of React hooks instead of React.useX() namespace access',
      category: 'XDS Conventions',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      noNamespaceHook:
        'Use a direct import instead of React.{{hook}}(). ' +
        "Import { {{hook}} } from 'react' and call {{hook}}() directly.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'React' &&
          callee.property.type === 'Identifier' &&
          REACT_HOOKS.has(callee.property.name)
        ) {
          const hook = callee.property.name;
          context.report({
            node: callee,
            messageId: 'noNamespaceHook',
            data: {hook},
            fix(fixer) {
              return fixer.replaceText(callee, hook);
            },
          });
        }
      },
    };
  },
};

export default noReactNamespaceHooksRule;
