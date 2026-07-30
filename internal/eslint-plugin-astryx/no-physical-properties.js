// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-physical-properties.js
 * @description Disallow physical left/right CSS properties (and physical
 *   left/right VALUES) inside stylex.create(). Physical properties don't flip
 *   under RTL; the CSS logical-property equivalents (inline-start/inline-end,
 *   start/end) do, so they're required for correct right-to-left rendering.
 *
 *   Two kinds of violation are detected:
 *   1. KEY-BASED — the object key is itself a banned physical property
 *      (e.g. `marginLeft`, `borderRightColor`, `left`, `borderTopLeftRadius`).
 *      The suggested fix renames the key to the logical equivalent.
 *   2. VALUE-BASED — the key is fine, but a specific physical VALUE is used
 *      (e.g. `textAlign: 'left'`, `float: 'right'`, `clear: 'left'`). The
 *      suggested fix replaces only the value; the key is left alone.
 *
 * SEVERITY: shipped at `warn` in BOTH the `strict` and `recommended` tiers
 *   (see index.js). The core package still has known un-migrated Phase-4
 *   physical properties (Calendar radii, Slider positioning, Table gradients)
 *   that would break CI if this were an `error`. Ship at warn until RTL Phase 4
 *   (Calendar/Slider/Table) migration lands; flip to error afterward.
 *
 * AUTOFIX: this rule is fixable (`meta.fixable: 'code'`).
 *   - VALUE-BASED fixes are always safe: only the value literal is replaced.
 *   - KEY-BASED fixes rename the key token, but ONLY when the logical key is not
 *     already present in the same style object. If BOTH the physical and logical
 *     key are present, renaming would produce a duplicate property (and the two
 *     silently collide — last one wins in LTR), so instead of autofixing we
 *     surface a distinct `physicalKeyConflict` message for a human to resolve.
 */

/**
 * Physical property KEYS → their CSS logical equivalent.
 * When one of these appears as an object key inside stylex.create(), flag it
 * and suggest the logical rename.
 *
 * The corner-radius mappings are diagonal-aware: a physical corner is named
 * <vertical><horizontal>, while the logical corner is named <block><inline>.
 *   top-left     → start(block) start(inline) → borderStartStartRadius
 *   top-right    → start(block) end(inline)   → borderStartEndRadius
 *   bottom-left  → end(block)   start(inline) → borderEndStartRadius
 *   bottom-right → end(block)   end(inline)   → borderEndEndRadius
 */
const PHYSICAL_KEY_MAP = {
  // Margin
  marginLeft: 'marginInlineStart',
  marginRight: 'marginInlineEnd',
  // Padding
  paddingLeft: 'paddingInlineStart',
  paddingRight: 'paddingInlineEnd',
  // Border side shorthands
  borderLeft: 'borderInlineStart',
  borderRight: 'borderInlineEnd',
  // Border side longhands (left)
  borderLeftWidth: 'borderInlineStartWidth',
  borderLeftStyle: 'borderInlineStartStyle',
  borderLeftColor: 'borderInlineStartColor',
  // Border side longhands (right)
  borderRightWidth: 'borderInlineEndWidth',
  borderRightStyle: 'borderInlineEndStyle',
  borderRightColor: 'borderInlineEndColor',
  // Inset
  left: 'insetInlineStart',
  right: 'insetInlineEnd',
  // Corner radii (diagonal-aware: vertical+horizontal → block+inline)
  borderTopLeftRadius: 'borderStartStartRadius',
  borderTopRightRadius: 'borderStartEndRadius',
  borderBottomLeftRadius: 'borderEndStartRadius',
  borderBottomRightRadius: 'borderEndEndRadius',
};

/**
 * Property KEYS whose physical left/right VALUES should be flagged. The key
 * itself is fine — only the specific physical value literal is a violation.
 * Maps `key → { physicalValue → logicalValue }`.
 */
const PHYSICAL_VALUE_MAP = {
  textAlign: { left: 'start', right: 'end' },
  float: { left: 'inline-start', right: 'inline-end' },
  clear: { left: 'inline-start', right: 'inline-end' },
};

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

/**
 * Does the given ObjectExpression already contain a Property whose key is
 * `keyName`? Handles both identifier keys (`marginLeft`) and string-literal
 * keys (`'marginLeft'`).
 */
function objectHasKey(objectExpression, keyName) {
  if (!objectExpression || objectExpression.type !== 'ObjectExpression') {
    return false;
  }
  return objectExpression.properties.some((prop) => {
    if (prop.type !== 'Property') return false;
    const name = prop.key?.name ?? prop.key?.value;
    return name === keyName;
  });
}

const rule = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Disallow physical left/right CSS properties and values inside ' +
        'stylex.create(). Use the CSS logical equivalents ' +
        '(inline-start/inline-end, start/end) for RTL support.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      physicalKey:
        'Use `{{logical}}` instead of `{{physical}}` for RTL support.',
      physicalValue:
        'Use `{{prop}}: \'{{logical}}\'` instead of ' +
        '`{{prop}}: \'{{physical}}\'` for RTL support.',
      physicalKeyConflict:
        '`{{physical}}` conflicts with `{{logical}}` already set on this ' +
        'style object — remove `{{physical}}`.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;

        const propName = node.key?.name || node.key?.value;
        if (!propName) return;

        // KEY-BASED: the object key is itself a physical property.
        const logicalKey = PHYSICAL_KEY_MAP[propName];
        if (logicalKey) {
          // Guard: if the logical key is ALSO present in the same object,
          // renaming would create a duplicate/silent collision. Ambiguous
          // which value the author meant — surface a distinct message, no fix.
          if (objectHasKey(node.parent, logicalKey)) {
            context.report({
              node: node.key,
              messageId: 'physicalKeyConflict',
              data: {
                physical: propName,
                logical: logicalKey,
              },
            });
            return;
          }

          // Preserve the original key's quoting: a string-literal key is
          // replaced with a quoted string; an identifier key stays unquoted.
          // All logical names are valid identifiers.
          const isStringLiteralKey =
            node.key.type === 'Literal' && typeof node.key.value === 'string';
          const newKeyText = isStringLiteralKey
            ? `'${logicalKey}'`
            : logicalKey;

          context.report({
            node: node.key,
            messageId: 'physicalKey',
            data: {
              physical: propName,
              logical: logicalKey,
            },
            fix(fixer) {
              return fixer.replaceText(node.key, newKeyText);
            },
          });
          return;
        }

        // VALUE-BASED: the key is fine, but the value may be physical.
        const valueMap = PHYSICAL_VALUE_MAP[propName];
        if (valueMap) {
          const value = getStaticValue(node.value);
          if (value !== null && valueMap[value]) {
            const logicalValue = valueMap[value];
            context.report({
              node: node.value,
              messageId: 'physicalValue',
              data: {
                prop: propName,
                physical: value,
                logical: logicalValue,
              },
              fix(fixer) {
                return fixer.replaceText(node.value, `'${logicalValue}'`);
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
