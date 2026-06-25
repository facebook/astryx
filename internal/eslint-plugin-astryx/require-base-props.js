// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-base-props.js
 * @description ESLint rule enforcing that publicly exported component props
 * interfaces extend BaseProps (directly or via Omit/Pick).
 *
 * BaseProps provides the standard surface area every component should
 * support: xstyle overrides, data-* attributes, aria-* attributes, event
 * handlers, and a curated subset of HTML attributes with footguns removed.
 *
 * Only checks interfaces that are re-exported through the component's barrel
 * index.ts, so internal sub-component props are not flagged.
 */

import {COMPONENT_RULE_ALLOWED, isPubliclyExported} from './shared.js';

function hasBasePropsInHeritage(node) {
  if (!node.extends || node.extends.length === 0) {
    return false;
  }

  for (const heritage of node.extends) {
    const expr = heritage.expression;

    if (expr.type === 'Identifier' && expr.name === 'BaseProps') {
      return true;
    }

    if (
      expr.type === 'Identifier' &&
      (expr.name === 'Omit' || expr.name === 'Pick')
    ) {
      const typeParams = heritage.typeArguments?.params;
      if (typeParams && typeParams.length > 0) {
        const firstParam = typeParams[0];
        if (firstParam.type === 'TSTypeReference') {
          const innerName = firstParam.typeName?.name;
          if (
            innerName === 'BaseProps' ||
            innerName?.endsWith('Props')
          ) {
            return true;
          }
        }
      }
    }

    if (
      expr.type === 'Identifier' &&
      expr.name.endsWith('Props')
    ) {
      return true;
    }
  }

  return false;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require publicly exported *Props interfaces to extend BaseProps',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingBaseProps:
        '"{{name}}" should extend BaseProps to inherit xstyle, data-*, aria-*, and standard HTML attribute support.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNames: {
            type: 'array',
            items: {type: 'string'},
            description:
              'Interface names that are exempt from this rule.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowNames = new Set([
      ...COMPONENT_RULE_ALLOWED,
      ...(options.allowNames || []),
    ]);

    return {
      TSInterfaceDeclaration(node) {
        const name = node.id?.name;
        if (!name) return;

        if (!name.endsWith('Props')) return;
        // Render-callback prop bags (e.g. TableRenderProps) end in 'Props' but
        // are not component props — they describe render-function arguments.
        if (name.endsWith('RenderProps')) return;

        const parent = node.parent;
        const isExported =
          parent?.type === 'ExportNamedDeclaration' ||
          parent?.type === 'ExportDefaultDeclaration';
        if (!isExported) return;

        if (allowNames.has(name)) return;

        if (!isPubliclyExported(name, context.filename)) return;

        if (hasBasePropsInHeritage(node)) return;

        context.report({
          node: node.id,
          messageId: 'missingBaseProps',
          data: {name},
        });
      },
    };
  },
};

export default rule;
