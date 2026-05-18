// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-stylex-null-override.js
 * @description Disallow null values as style overrides in stylex.create().
 *
 * Null values in StyleX style objects create a "remove this property" override
 * that requires property-key deduplication at runtime (via styleq). This
 * prevents the build from inlining style objects into pre-resolved class name
 * strings — a ~39KB savings and elimination of the styleq runtime dependency.
 *
 * Pattern 1 (OK): { default: null, ':hover': value }
 *   This means "no default, only on hover." StyleX compiles away the null —
 *   no null appears in the output. This is fine.
 *
 * Pattern 2 (BAD): { default: null, ':hover': null }
 *   This means "remove both default and hover from a base style." The null
 *   persists in compiled output and blocks build optimizations.
 *
 * Pattern 3 (BAD): transform: { default: null, ':active': null }
 *   Same as Pattern 2 — use an explicit value like 'none' instead.
 *
 * Fix: Replace null overrides with explicit values.
 *   transform: { default: null, ':active': null }  →  transform: 'none'
 *   backgroundImage: { default: null, ':hover': null }  →  backgroundImage: 'none'
 */

/**
 * Check if we're inside a stylex.create() call
 */
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

/**
 * Check if an ObjectExpression has ALL non-$$css values as null.
 * This is the "override/remove" pattern we want to flag.
 * If at least one value is non-null, it's the harmless
 * "default: null, ':hover': value" pattern.
 */
function isFullNullOverride(objectExpression) {
  const properties = objectExpression.properties.filter(
    p => p.type === 'Property' && p.key?.value !== '$$css'
  );
  return properties.length > 0 && properties.every(
    p => p.value?.type === 'Literal' && p.value.value === null
  );
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow null values as style overrides in stylex.create() — use explicit values instead',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noNullOverride:
        'Avoid null style overrides in stylex.create(). Use an explicit value like \'none\' instead. ' +
        'Null overrides prevent the build from inlining style objects into class name strings.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;

        // Only check: Object value where all entries are null
        // e.g., backgroundImage: { default: null, ':hover': null }
        // or transform: { default: null, ':active': null }
        if (
          node.value?.type === 'ObjectExpression' &&
          isFullNullOverride(node.value)
        ) {
          context.report({ node, messageId: 'noNullOverride' });
        }
      },
    };
  },
};

export default rule;
