// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-border-shorthand.js
 * @description Disallow border shorthand in stylex.create(). StyleX should use
 *   individual borderWidth, borderStyle, borderColor (or side-specific variants)
 *   instead of the combined `border` shorthand.
 */

/**
 * Border shorthand properties that should be split into longhand.
 * Maps shorthand → the three longhands to use instead.
 */
const SHORTHAND_MAP = {
  border: ['borderWidth', 'borderStyle', 'borderColor'],
  borderTop: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  borderRight: ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
  borderBottom: ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
  borderLeft: ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
  borderBlock: ['borderBlockWidth', 'borderBlockStyle', 'borderBlockColor'],
  borderInline: ['borderInlineWidth', 'borderInlineStyle', 'borderInlineColor'],
  borderBlockStart: ['borderBlockStartWidth', 'borderBlockStartStyle', 'borderBlockStartColor'],
  borderBlockEnd: ['borderBlockEndWidth', 'borderBlockEndStyle', 'borderBlockEndColor'],
  borderInlineStart: ['borderInlineStartWidth', 'borderInlineStartStyle', 'borderInlineStartColor'],
  borderInlineEnd: ['borderInlineEndWidth', 'borderInlineEndStyle', 'borderInlineEndColor'],
};

/** Values that are acceptable as shorthand (full resets). */
const ALLOWED_VALUES = new Set(['none', '0', 'inherit', 'initial', 'unset']);

function isInsideStylexCreate(node) {
  let current = node;
  while (current) {
    if (
      current.type === 'CallExpression' &&
      current.callee?.type === 'MemberExpression' &&
      current.callee.object?.name === 'stylex' &&
      current.callee.property?.name === 'create'
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function getStaticValue(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow border shorthand properties inside stylex.create(). ' +
        'Use borderWidth, borderStyle, borderColor (or side-specific variants) instead.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noBorderShorthand:
        'Don\'t use `{{prop}}` shorthand in stylex.create(). ' +
        'Split into {{replacements}} instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;

        const propName = node.key?.name || node.key?.value;
        if (!propName || !SHORTHAND_MAP[propName]) return;

        // Allow `border: 'none'` and similar resets
        const value = getStaticValue(node.value);
        if (value !== null && ALLOWED_VALUES.has(value)) return;

        const replacements = SHORTHAND_MAP[propName];
        context.report({
          node,
          messageId: 'noBorderShorthand',
          data: {
            prop: propName,
            replacements: replacements.join(', '),
          },
        });
      },
    };
  },
};

export default rule;
