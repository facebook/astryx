// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-ref-prop.js
 * @description ESLint rule enforcing that publicly exported XDS component props
 * interfaces declare a `ref` property.
 *
 * Every XDS component should expose ref forwarding so consumers can access
 * the underlying DOM element. In React 19, ref is a regular prop — components
 * just need `ref?: React.Ref<T>` in their props interface.
 *
 * Only checks interfaces that are re-exported through the component's barrel
 * index.ts, so internal sub-component props are not flagged.
 */

import {COMPONENT_RULE_ALLOWED, isPubliclyExported} from './shared.js';

function hasRefProperty(node) {
  for (const member of node.body.body) {
    if (member.type !== 'TSPropertySignature') continue;
    const name = member.key?.name || member.key?.value;
    if (name === 'ref') return true;
  }
  return false;
}

function inheritsRef(node) {
  if (!node.extends || node.extends.length === 0) return false;

  for (const heritage of node.extends) {
    const expr = heritage.expression;

    if (
      expr.type === 'Identifier' &&
      expr.name.startsWith('XDS') &&
      expr.name.endsWith('Props') &&
      expr.name !== 'XDSBaseProps'
    ) {
      return true;
    }

    if (
      expr.type === 'Identifier' &&
      expr.name === 'Omit'
    ) {
      const typeParams = heritage.typeArguments?.params;
      if (typeParams && typeParams.length >= 2) {
        const innerName = typeParams[0]?.typeName?.name;
        if (
          innerName?.startsWith('XDS') &&
          innerName?.endsWith('Props') &&
          innerName !== 'XDSBaseProps'
        ) {
          if (!isRefOmitted(typeParams[1])) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function isRefOmitted(typeNode) {
  if (typeNode.type === 'TSLiteralType' && typeNode.literal?.value === 'ref') {
    return true;
  }
  if (typeNode.type === 'TSUnionType') {
    return typeNode.types.some(
      (t) => t.type === 'TSLiteralType' && t.literal?.value === 'ref',
    );
  }
  return false;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require publicly exported XDS*Props interfaces to declare a ref property',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingRef:
        '"{{name}}" should declare a `ref` property so consumers can access the underlying DOM element.',
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

        if (!name.startsWith('XDS') || !name.endsWith('Props')) return;

        const parent = node.parent;
        const isExported =
          parent?.type === 'ExportNamedDeclaration' ||
          parent?.type === 'ExportDefaultDeclaration';
        if (!isExported) return;

        if (allowNames.has(name)) return;

        if (!isPubliclyExported(name, context.filename)) return;

        if (hasRefProperty(node)) return;

        if (inheritsRef(node)) return;

        context.report({
          node: node.id,
          messageId: 'missingRef',
          data: {name},
        });
      },
    };
  },
};

export default rule;
