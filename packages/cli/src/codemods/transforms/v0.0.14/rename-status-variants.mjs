// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename status variants positive/negative → success/error
 * @see https://github.com/facebookexperimental/xds/issues/996
 *
 * Converges component APIs to match the token layer naming:
 * - `positive` → `success` (maps to --color-success)
 * - `negative` → `error` (maps to --color-error)
 * - `info` → `accent` (maps to --color-accent)
 *
 * Affected components:
 * - XDSStatusDot: variant="positive|negative|info" → variant="success|error|accent"
 * - XDSAvatarStatusDot: variant="positive|negative" → variant="success|error"
 * - XDSIcon: color="positive|negative" → color="success|error"
 * - XDSProgressBar: variant="positive|negative" → variant="success|error"
 *
 * Transforms JSX attributes, object properties (in files importing affected
 * components), TypeScript type annotations, and Storybook argType options.
 */

export const meta = {
  title: 'Rename status variants positive/negative → success/error',
  description:
    'Renames `positive` to `success`, `negative` to `error`, and `info` to `accent` ' +
    'on StatusDot, AvatarStatusDot, Icon, SVGIcon, and ProgressBar to align with token naming. ' +
    'The `info` -> `accent` rename is only applied to direct JSX attributes on these ' +
    'components (where the component is known); in context-blind locations (object ' +
    'properties, type unions) `info` is left untouched because it is a valid variant on ' +
    'other components such as Badge.',
  pr: '#996',
};

/** Rename mappings. */
const RENAMES = new Map([
  ['positive', 'success'],
  ['negative', 'error'],
  ['info', 'accent'],
]);

/**
 * Ambiguous renames that are only safe when the target component is known.
 *
 * `info` is a VALID variant on non-target components (notably XDSBadge, whose
 * BadgeVariantMap still has `info`). `positive`/`negative` are not retained by
 * any component post-migration, so renaming them is always safe. Therefore the
 * context-blind heuristic paths (object properties, type unions, and suffixed
 * props on wrapper components) must NOT rewrite `info` — only the precise path,
 * a direct JSX attribute on a known target component, may. Otherwise a
 * `variant: 'info'` on an unrelated Badge config in a file that merely also
 * imports e.g. XDSIcon gets wrongly rewritten to the invalid `accent`.
 */
const AMBIGUOUS_VALUES = new Set(['info']);


/**
 * Components and which props are affected.
 * Key: component name. Value: set of prop names to check.
 */
const COMPONENT_PROPS = new Map([
  ['XDSStatusDot', new Set(['variant'])],
  ['XDSAvatarStatusDot', new Set(['variant'])],
  ['XDSIcon', new Set(['color'])],
  ['XDSProgressBar', new Set(['variant'])],
]);

/** All affected component names for quick lookup. */
const TARGET_COMPONENTS = new Set(COMPONENT_PROPS.keys());

/** All affected prop names (variant, color). */
const TARGET_PROP_NAMES = new Set();
for (const props of COMPONENT_PROPS.values()) {
  for (const p of props) TARGET_PROP_NAMES.add(p);
}

/**
 * Check if a key matches a target prop — exact or case-insensitive suffix.
 * e.g. "dotVariant" matches because it ends with "variant".
 */
function matchesPropName(keyName) {
  if (TARGET_PROP_NAMES.has(keyName)) return true;
  const lower = keyName.toLowerCase();
  for (const prop of TARGET_PROP_NAMES) {
    if (lower.endsWith(prop.toLowerCase()) && lower !== prop.toLowerCase()) return true;
  }
  return false;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /**
   * Rename a string literal value if it matches our renames.
   * Unwraps TSAsExpression (e.g. 'positive' as const) to reach the literal.
   * @returns {boolean} whether a rename occurred
   */
  function renameValue(node, {precise = false} = {}) {
    if (!node) return false;

    // Unwrap TSAsExpression (e.g. 'positive' as const → StringLiteral)
    const target = node.type === 'TSAsExpression' ? node.expression : node;

    const isString =
      target.type === 'StringLiteral' || target.type === 'Literal';
    if (!isString || typeof target.value !== 'string') return false;

    const replacement = RENAMES.get(target.value);
    if (!replacement) return false;

    // Ambiguous values (e.g. `info`) are only renamed in a precise context
    // where the target component is known (a direct JSX attribute on a target).
    // In context-blind paths they may belong to a component that legitimately
    // keeps the value (e.g. Badge's `info`), so leave them untouched.
    if (!precise && AMBIGUOUS_VALUES.has(target.value)) return false;

    target.value = replacement;
    if (target.raw) target.raw = undefined;
    return true;
  }

  /**
   * Rename elements in an array (handles TSAsExpression wrapping).
   */
  function renameArrayElements(node, {precise = false} = {}) {
    let arrayNode = node;
    if (arrayNode.type === 'TSAsExpression') arrayNode = arrayNode.expression;
    if (arrayNode.type !== 'ArrayExpression') return;
    arrayNode.elements.forEach((el) => {
      if (renameValue(el, {precise})) hasChanges = true;
    });
  }

  // Determine early: does this file import any target component?
  const importsTarget = [...TARGET_COMPONENTS].some(
    (name) =>
      root.find(j.ImportSpecifier, {imported: {name}}).length > 0,
  );

  // 1. JSX attributes on target components
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName) return;

    const isDirectTarget = TARGET_COMPONENTS.has(componentName);
    // For non-target components, only check suffixed props if file imports targets
    if (!isDirectTarget && !importsTarget) return;

    path.node.attributes.forEach((attr) => {
      if (attr.type !== 'JSXAttribute') return;
      const attrName = attr.name.name;

      if (isDirectTarget) {
        // Direct targets: only their specific props
        const targetProps = COMPONENT_PROPS.get(componentName);
        if (!targetProps.has(attrName)) return;
      } else {
        // Non-target components: suffixed prop names only
        // (e.g. dotVariant on ChangelogSection wrapping XDSStatusDot)
        if (!matchesPropName(attrName) || TARGET_PROP_NAMES.has(attrName)) return;
      }

      // Only a direct JSX attribute on a target component is a precise context
      // where the component (and thus the validity of `info`) is known. The
      // wrapper/suffixed-prop case is a heuristic and must not touch ambiguous
      // values.
      const precise = isDirectTarget;
      const value = attr.value;

      // variant="positive" (string literal)
      if (renameValue(value, {precise})) {
        hasChanges = true;
        return;
      }

      // variant={'positive'} (expression container)
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        value.expression
      ) {
        if (renameValue(value.expression, {precise})) {
          hasChanges = true;
          return;
        }

        // variant={condition ? 'positive' : 'negative'} (ternary)
        if (value.expression.type === 'ConditionalExpression') {
          if (renameValue(value.expression.consequent, {precise}))
            hasChanges = true;
          if (renameValue(value.expression.alternate, {precise}))
            hasChanges = true;
        }
      }
    });
  });

  // 2. Object properties in files importing target components.
  //    Handles args objects, config objects, Storybook argTypes, etc.
  if (importsTarget) {
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType).forEach((path) => {
      const key = path.node.key;
      const keyName =
        key.type === 'Identifier'
          ? key.name
          : key.type === 'StringLiteral' || key.type === 'Literal'
            ? key.value
            : null;

      if (!keyName || !matchesPropName(keyName)) return;

      const value = path.node.value;

      // variant: 'positive' → variant: 'success'
      if (renameValue(value)) {
        hasChanges = true;
        return;
      }

      // variant: { options: ['positive', 'negative', ...] }
      if (value.type === 'ObjectExpression') {
        const optionsProp = value.properties.find(
          (p) => p.key && (p.key.name === 'options' || p.key.value === 'options'),
        );
        if (optionsProp) {
          renameArrayElements(optionsProp.value);
        }
      }

      // variant: ['positive', 'negative'] or [...] as Type[]
      renameArrayElements(value);
    });
  }

  // 3. TypeScript type references: 'positive' | 'negative' in union types
  if (importsTarget) {
    root.find(j.TSLiteralType).forEach((path) => {
      const lit = path.node.literal;
      if (renameValue(lit)) hasChanges = true;
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
