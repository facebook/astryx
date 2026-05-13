/**
 * @file Codemod: Rename Section/Toolbar variant "wash" to "muted"
 * @see https://github.com/facebookexperimental/xds/pull/2063
 *
 * XDSSection and XDSToolbar renamed the `variant="wash"` value to
 * `variant="muted"` for consistency with XDSCard, which already uses
 * `muted` for the same `--color-background-muted` token.
 *
 * Transforms:
 * - <XDSSection variant="wash" /> → <XDSSection variant="muted" />
 * - <XDSToolbar variant="wash" /> → <XDSToolbar variant="muted" />
 * - Object properties: { variant: 'wash' } → { variant: 'muted' }
 *   (only in files that import XDSSection or XDSToolbar)
 */

export const meta = {
  title: 'Rename Section/Toolbar variant "wash" to "muted"',
  description:
    'Renames `variant="wash"` to `variant="muted"` on XDSSection and XDSToolbar ' +
    'to align with XDSCard which already uses `muted` for the same background token.',
  pr: '#2063',
};

/** Components affected by this rename. */
const TARGET_COMPONENTS = new Set(['XDSSection', 'XDSToolbar']);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename JSX attribute value: variant="wash" → variant="muted"
  //    Only on XDSSection and XDSToolbar.
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !TARGET_COMPONENTS.has(componentName)) return;

    path.node.attributes.forEach((attr) => {
      if (attr.type !== 'JSXAttribute') return;
      if (attr.name.name !== 'variant') return;

      const value = attr.value;

      // variant="wash" (string literal)
      if (
        value &&
        (value.type === 'StringLiteral' || value.type === 'Literal') &&
        value.value === 'wash'
      ) {
        value.value = 'muted';
        if (value.raw) value.raw = undefined;
        hasChanges = true;
      }

      // variant={'wash'} (expression container with string literal)
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        value.expression &&
        (value.expression.type === 'StringLiteral' || value.expression.type === 'Literal') &&
        value.expression.value === 'wash'
      ) {
        value.expression.value = 'muted';
        if (value.expression.raw) value.expression.raw = undefined;
        hasChanges = true;
      }
    });
  });

  // 2. Object properties in files that import XDSSection or XDSToolbar.
  //    Handles Storybook args like: { variant: 'wash' } → { variant: 'muted' }
  const importsTarget =
    root.find(j.ImportSpecifier, {imported: {name: 'XDSSection'}}).length > 0 ||
    root.find(j.ImportSpecifier, {imported: {name: 'XDSToolbar'}}).length > 0;

  if (importsTarget) {
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType, {key: {name: 'variant'}}).forEach((path) => {
      const value = path.node.value;
      if (
        (value.type === 'StringLiteral' || value.type === 'Literal') &&
        value.value === 'wash'
      ) {
        value.value = 'muted';
        if (value.raw) value.raw = undefined;
        hasChanges = true;
      }
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
