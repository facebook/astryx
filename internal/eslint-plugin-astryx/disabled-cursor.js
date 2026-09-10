// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file disabled-cursor.js
 * @description A `cursor` must give way to `default` on a disabled element.
 *
 * The cursor is the only affordance a pointer user gets before they commit to
 * a click. `cursor: pointer` on a disabled control promises a click the
 * control will not honour, and nothing takes that promise away for you:
 * `disabled` and `[aria-disabled]` do not change what the element's own
 * `cursor` declaration paints.
 *
 * `default` and not `not-allowed`: a disabled control sealed behind
 * `pointer-events: none` is never hit-tested, so it shows whatever its
 * ancestor shows, and no declaration on it can change that. One cursor
 * everywhere beats a stronger one we can only paint on some of them — and the
 * disabled state already carries its own visual treatment. This also matches
 * the internal XDS convention.
 *
 * A component's separate `disabled` style object is not the answer either. It
 * only helps where the author remembered to write one, on the element the
 * author had in mind — the inner input, not the label that wraps it; the
 * trigger, not the icon inside it. Asking the question per component is what
 * leaves the gaps.
 *
 * So the answer goes on the declaration itself, where it cannot be missed:
 *
 *   BAD   cursor: 'pointer'
 *   GOOD  cursor: {
 *           default: 'pointer',
 *           ':is(:disabled,[aria-disabled="true"])': 'default',
 *         }
 *
 * The guarded condition outranks the default in StyleX's own ordering, so it
 * wins the moment the element is disabled, and on an element that can never
 * be disabled it is a no-op.
 *
 * SCOPE: every `cursor` a component writes, whatever the value. That breadth
 * is not tidiness — StyleX merges `props()` one PROPERTY at a time, so a later
 * style setting `cursor` at all replaces the earlier declaration's conditions
 * along with its value. SegmentedControlItem shipped exactly that: a guarded
 * `cursor: pointer` on the base, and `disabled: {cursor: 'default'}` applied
 * after it, which threw the guard away and left a disabled segment answering
 * with a plain arrow. So the guard belongs on whichever declaration lands
 * last, and the rule cannot know which one that is.
 *
 * `default` itself needs no guard, and a cursor whose value is computed
 * rather than written (`interactive ? 'grab' : undefined`) is left alone — the
 * rule cannot know what it resolves to. The Chromium sweep in
 * `.github/scripts/disabled-cursor-audit.js` measures the rendered result for
 * both.
 */

/** The condition a disabled element matches, and what it must get. */
const DISABLED_CONDITION = ':is(:disabled,[aria-disabled="true"])';
const DISABLED_CURSOR = 'default';

/**
 * Cursors that need the guard: everything except the disabled cursor itself.
 *
 * `inherit` and `auto` are on the list rather than waved through — a control
 * inheriting `pointer` from an interactive ancestor promises exactly what the
 * guard exists to take back.
 */
function needsGuard(value) {
  return typeof value === 'string' && value !== DISABLED_CURSOR;
}

/**
 * Already handled, in any spelling a hand might use.
 *
 * A `:not()` group is dropped before the test: the hover guard this codebase
 * writes everywhere — `:hover:where(:not(:disabled,[aria-disabled="true"]))` —
 * names the disabled state in order to EXCLUDE it, and reading that as
 * "handled" would wave through the very declaration the rule exists for.
 */
function hasDisabledCondition(keys) {
  return keys.some(key => {
    if (typeof key !== 'string') return false;
    const positive = key.replace(/:not\([^)]*\)/g, '');
    return /:disabled|\[aria-disabled/.test(positive);
  });
}

function keyOf(property) {
  if (!property || property.type !== 'Property') return null;
  if (property.key?.type === 'Literal') return String(property.key.value);
  if (property.key?.type === 'Identifier' && !property.computed) {
    return property.key.name;
  }
  return null;
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
    fixable: 'code',
    docs: {
      description:
        'A cursor must give way to default on a disabled element',
      category: 'Accessibility',
      recommended: true,
    },
    messages: {
      unguardedCursor:
        "cursor: '{{value}}' is what a disabled element gets too. " +
        `Add '${DISABLED_CONDITION}': '${DISABLED_CURSOR}' to the declaration ` +
        'so the pointer stops promising an interaction the control refuses.',
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode();

    /** `':is(...)': 'default'`, quoted the way the file already quotes. */
    const guardEntry = `'${DISABLED_CONDITION}': '${DISABLED_CURSOR}'`;

    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;
        if (keyOf(node) !== 'cursor') return;

        // A written-out value: rewrite it into the conditional form.
        if (node.value.type === 'Literal' && needsGuard(node.value.value)) {
          const value = node.value.value;
          context.report({
            node: node.value,
            messageId: 'unguardedCursor',
            data: {value},
            fix(fixer) {
              return fixer.replaceText(
                node.value,
                `{default: '${value}', ${guardEntry}}`,
              );
            },
          });
          return;
        }

        // Already conditional: the default branch is the one a disabled
        // element falls through to, so that is the branch that needs the
        // guard beside it.
        if (node.value.type !== 'ObjectExpression') return;
        const branches = node.value.properties.filter(
          property => property.type === 'Property',
        );
        const keys = branches.map(keyOf);
        if (hasDisabledCondition(keys)) return;

        const defaultBranch = branches.find(
          (property, index) => keys[index] === 'default',
        );
        if (
          !defaultBranch ||
          defaultBranch.value.type !== 'Literal' ||
          !needsGuard(defaultBranch.value.value)
        ) {
          return;
        }

        context.report({
          node: defaultBranch.value,
          messageId: 'unguardedCursor',
          data: {value: defaultBranch.value.value},
          fix(fixer) {
            const last = branches[branches.length - 1];
            const after = source.getTokenAfter(last);
            return after?.value === ','
              ? fixer.insertTextAfter(after, ` ${guardEntry},`)
              : fixer.insertTextAfter(last, `, ${guardEntry}`);
          },
        });
      },
    };
  },
};

export default rule;
export {DISABLED_CONDITION, DISABLED_CURSOR, hasDisabledCondition, needsGuard};
