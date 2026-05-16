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
    'on StatusDot, AvatarStatusDot, Icon, and ProgressBar to align with token naming.',
  pr: '#996',
};

/** Rename mappings. */
const RENAMES = new Map([
  ['positive', 'success'],
  ['negative', 'error'],
  ['info', 'accent'],
]);

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

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /**
   * Rename a string literal value if it matches our renames.
   * @returns {boolean} whether a rename occurred
   */
  function renameValue(node) {
    if (!node) return false;
    const isString =
      node.type === 'StringLiteral' || node.type === 'Literal';
    if (!isString || typeof node.value !== 'string') return false;

    const replacement = RENAMES.get(node.value);
    if (!replacement) return false;

    node.value = replacement;
    if (node.raw) node.raw = undefined;
    return true;
  }

  // 1. JSX attributes on target components
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !TARGET_COMPONENTS.has(componentName)) return;

    const targetProps = COMPONENT_PROPS.get(componentName);

    path.node.attributes.forEach((attr) => {
      if (attr.type !== 'JSXAttribute') return;
      if (!targetProps.has(attr.name.name)) return;

      const value = attr.value;

      // variant="positive" (string literal)
      if (renameValue(value)) {
        hasChanges = true;
        return;
      }

      // variant={'positive'} (expression container)
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        value.expression
      ) {
        if (renameValue(value.expression)) {
          hasChanges = true;
          return;
        }

        // variant={condition ? 'positive' : 'negative'} (ternary)
        if (value.expression.type === 'ConditionalExpression') {
          if (renameValue(value.expression.consequent)) hasChanges = true;
          if (renameValue(value.expression.alternate)) hasChanges = true;
        }
      }
    });
  });

  // 2. Object properties in files importing target components.
  //    Handles args objects, config objects, etc.
  const importsTarget = [...TARGET_COMPONENTS].some(
    (name) =>
      root.find(j.ImportSpecifier, {imported: {name}}).length > 0,
  );

  if (importsTarget) {
    // Prop keys that are affected
    const targetPropNames = new Set();
    for (const props of COMPONENT_PROPS.values()) {
      for (const p of props) targetPropNames.add(p);
    }

    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType).forEach((path) => {
      const key = path.node.key;
      const keyName =
        key.type === 'Identifier'
          ? key.name
          : key.type === 'StringLiteral' || key.type === 'Literal'
            ? key.value
            : null;

      if (!keyName || !targetPropNames.has(keyName)) return;

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
        if (optionsProp && optionsProp.value.type === 'ArrayExpression') {
          optionsProp.value.elements.forEach((el) => {
            if (renameValue(el)) hasChanges = true;
          });
        }
      }

      // variant: ['positive', 'negative'] (array shorthand for argTypes)
      if (value.type === 'ArrayExpression') {
        value.elements.forEach((el) => {
          if (renameValue(el)) hasChanges = true;
        });
      }
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
