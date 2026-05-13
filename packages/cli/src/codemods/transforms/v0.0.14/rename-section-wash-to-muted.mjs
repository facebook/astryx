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
  //    Also handles options arrays inside variant argTypes config objects.
  const importsTarget =
    root.find(j.ImportSpecifier, {imported: {name: 'XDSSection'}}).length > 0 ||
    root.find(j.ImportSpecifier, {imported: {name: 'XDSToolbar'}}).length > 0;

  if (importsTarget) {
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType, {key: {name: 'variant'}}).forEach((path) => {
      const value = path.node.value;

      // variant: 'wash' → variant: 'muted'
      if (
        (value.type === 'StringLiteral' || value.type === 'Literal') &&
        value.value === 'wash'
      ) {
        value.value = 'muted';
        if (value.raw) value.raw = undefined;
        hasChanges = true;
      }

      // variant: { options: ['...', 'wash', '...'] } → replace 'wash' with 'muted'
      if (value.type === 'ObjectExpression') {
        const optionsProp = value.properties.find(
          (p) => p.key && p.key.name === 'options',
        );
        if (optionsProp && optionsProp.value.type === 'ArrayExpression') {
          optionsProp.value.elements.forEach((el) => {
            if (
              el &&
              (el.type === 'StringLiteral' || el.type === 'Literal') &&
              el.value === 'wash'
            ) {
              el.value = 'muted';
              if (el.raw) el.raw = undefined;
              hasChanges = true;
            }
          });
        }
      }
    });
  }

  // 3. JSX text children: replace "wash" text content adjacent to target components.
  //    Covers labels like <h4>wash</h4> that describe the variant in Storybook stories.
  if (importsTarget) {
    root.find(j.JSXText).forEach((path) => {
      if (path.node.value.trim() === 'wash') {
        path.node.value = path.node.value.replace('wash', 'muted');
        if (path.node.raw) path.node.raw = path.node.raw.replace('wash', 'muted');
        hasChanges = true;
      }
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
