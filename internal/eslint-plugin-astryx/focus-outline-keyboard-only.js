// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focus-outline-keyboard-only.js
 * @description Focus outlines must key off `:focus-visible`, never `:focus` or
 * `:focus-within`.
 *
 * A focus outline is a KEYBOARD affordance. `:focus` and `:focus-within` also
 * match a plain mouse click, so a ring written against them is shown to
 * pointer users who never asked for it — and on the paths where it is easy to
 * miss in review: an overlay that restores focus to its trigger after a
 * click-to-dismiss puts the ring back up with no keyboard involved (this is
 * exactly what ComplexSelector shipped).
 *
 * `:focus-visible` asks the browser instead of guessing, and a text input
 * still matches it when clicked — so nothing is lost by using it.
 *
 * BAD
 *   outline: {default: 'none', ':focus': '2px solid …'}
 *   ':focus-within': {outline: '2px solid …'}
 *
 * GOOD
 *   outline: {default: 'none', ':focus-visible': '2px solid …'}
 *   outlineWidth: {default: '0', ':has(:focus-visible)': '2px'}   // ring on a
 *                                                                 // wrapper
 *   focusOutlineStyles.focusVisible / .focusWithin                // preferred:
 *                                                                 // the shared
 *                                                                 // utility
 *
 * SCOPE: `outline` and its longhands only, and only where the ring is DRAWN.
 * Suppressing an outline on a broader selector (`outline: {':focus': 'none'}`,
 * as AppShell does for the skip link's programmatic target) is legitimate and
 * is not flagged. A field's `:focus-within` border and inset box-shadow (see
 * `Field/inputStyles.stylex.ts`) are a different treatment with a different
 * rule — the field says "you are typing here" — so this rule deliberately does
 * not police `borderColor` or `boxShadow`.
 */

const OUTLINE_PROPERTIES = new Set([
  'outline',
  'outlineWidth',
  'outlineStyle',
  'outlineColor',
  'outlineOffset',
]);

/**
 * Does this StyleX condition key match pointer focus as well as keyboard
 * focus?
 *
 * `:focus-visible` in any form is fine, including `:has(:focus-visible)`.
 * A `:not(:focus-within)` segment is an exclusion, not a focus state — it is
 * how hover styles step aside for a focused field — so drop `:not(…)` before
 * looking.
 */
function isPointerFocusKey(key) {
  if (typeof key !== 'string' || !key.includes('focus')) return false;
  const withoutNegations = key.replace(/:not\([^)]*\)/g, '');
  if (withoutNegations.includes('focus-visible')) return false;
  return /:focus(-within)?(?![-\w])/.test(withoutNegations);
}

function keyOf(property) {
  if (!property || property.type !== 'Property') return null;
  if (property.key?.type === 'Literal') return String(property.key.value);
  if (property.key?.type === 'Identifier' && !property.computed) {
    return property.key.name;
  }
  return null;
}

/**
 * Does this value PAINT a ring, or does it take one away?
 *
 * Only the painting case is a defect. Suppressing an outline on a broader
 * selector is legitimate and sometimes the point: AppShell's `<main>` is
 * focusable only as the skip link's programmatic target, and it kills the UA
 * ring with `outline: {default: null, ':focus': 'none'}` — deliberately for
 * every kind of focus, not just the keyboard kind.
 */
function drawsARing(valueNode) {
  if (!valueNode) return false;
  if (valueNode.type === 'Literal') {
    const value = valueNode.value;
    if (value == null) return false;
    const text = String(value).trim();
    return text !== '' && text !== 'none' && text !== '0' && text !== '0px';
  }
  // A template literal, a token lookup, a variable — assume it paints.
  return true;
}

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

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Focus outlines must use :focus-visible (keyboard), not :focus or :focus-within',
      category: 'Accessibility',
      recommended: true,
    },
    messages: {
      pointerFocusOutline:
        "Focus outline keyed off '{{key}}', which also matches a mouse click. " +
        'Use \':focus-visible\' (or \':has(:focus-visible)\' when the ring is on a wrapper) — ' +
        'better still, the shared focusOutlineStyles from utils/focusOutline.stylex.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;

        const key = keyOf(node);
        if (key == null) return;

        // Shape 1 — outline property, focus condition inside:
        //   outline: {default: 'none', ':focus': '…'}
        if (OUTLINE_PROPERTIES.has(key) && node.value?.type === 'ObjectExpression') {
          for (const condition of node.value.properties) {
            const conditionKey = keyOf(condition);
            if (isPointerFocusKey(conditionKey) && drawsARing(condition.value)) {
              context.report({
                node: condition,
                messageId: 'pointerFocusOutline',
                data: {key: conditionKey},
              });
            }
          }
          return;
        }

        // Shape 2 — focus condition, outline properties inside:
        //   ':focus-within': {outline: '…', outlineOffset: '2px'}
        if (isPointerFocusKey(key) && node.value?.type === 'ObjectExpression') {
          const drawsOutline = node.value.properties.some(
            inner =>
              OUTLINE_PROPERTIES.has(keyOf(inner)) && drawsARing(inner.value),
          );
          if (drawsOutline) {
            context.report({
              node,
              messageId: 'pointerFocusOutline',
              data: {key},
            });
          }
        }
      },
    };
  },
};

export default rule;
