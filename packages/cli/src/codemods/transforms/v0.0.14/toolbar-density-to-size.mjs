/**
 * @file Codemod: Migrate XDSToolbar density prop to size prop
 *
 * In the next release, XDSToolbar replaces `density` with `size`:
 *   - `density="compact"` → `size="sm"`
 *   - `density="default"` → removed (md is the default)
 *   - No density prop → no change needed
 *
 * The new `size` prop also cascades to child components (Button, TextInput,
 * TabList, Selector, etc.) via XDSSizeContext, so explicit `size` props on
 * children inside a toolbar may become redundant. That cleanup is left to
 * developers since it's a design decision, not a correctness issue.
 */

export const meta = {
  title: 'Migrate XDSToolbar density to size',
  description:
    'Replaces `density="compact"` with `size="sm"` and removes `density="default"` ' +
    '(md is the new default) on XDSToolbar components. Also handles Storybook ' +
    'args/argTypes objects that reference the density prop.',
  pr: '#1448',
};

/** Map from old density values to new size values (null = remove prop). */
const DENSITY_TO_SIZE = {
  compact: 'sm',
  default: null, // md is the default, no prop needed
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName =
      name.type === 'JSXIdentifier' ? name.name : null;
    if (componentName !== 'XDSToolbar') return;

    const attrs = path.node.attributes;
    const densityIdx = attrs.findIndex(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'density',
    );
    if (densityIdx === -1) return;

    const densityAttr = attrs[densityIdx];
    const value = densityAttr.value;

    // density="compact" or density="default" (string literal)
    if (value && (value.type === 'StringLiteral' || value.type === 'Literal')) {
      const densityValue = value.value;
      const sizeValue = DENSITY_TO_SIZE[densityValue];

      if (sizeValue === undefined) {
        // Unknown density value — leave it for manual review
        return;
      }

      if (sizeValue === null) {
        // density="default" → remove the prop entirely
        attrs.splice(densityIdx, 1);
      } else {
        // density="compact" → size="sm"
        attrs[densityIdx] = j.jsxAttribute(
          j.jsxIdentifier('size'),
          j.stringLiteral(sizeValue),
        );
      }
      hasChanges = true;
      return;
    }

    // density={expression} — rename prop to size, wrap in ternary
    // density={someVar} → size={someVar === 'compact' ? 'sm' : 'md'}
    if (
      value &&
      value.type === 'JSXExpressionContainer' &&
      value.expression.type !== 'JSXEmptyExpression'
    ) {
      const expr = value.expression;
      const newExpr = j.conditionalExpression(
        j.binaryExpression('===', expr, j.stringLiteral('compact')),
        j.stringLiteral('sm'),
        j.stringLiteral('md'),
      );
      attrs[densityIdx] = j.jsxAttribute(
        j.jsxIdentifier('size'),
        j.jsxExpressionContainer(newExpr),
      );
      hasChanges = true;
    }
  });

  // ---- 2. Object properties: Storybook args/argTypes ----
  // Handles patterns like:
  //   args: { density: 'compact' }  →  args: { size: 'sm' }
  //   argTypes: { density: {...} }  →  argTypes: { size: {...} }
  // Only transforms when the file imports XDSToolbar (scoping check).
  const importsToolbar = root.find(j.ImportSpecifier, {
    imported: {name: 'XDSToolbar'},
  }).length > 0;

  if (importsToolbar) {
    // jscodeshift uses Property (default parser) or ObjectProperty (babel/tsx parser)
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType, {key: {name: 'density'}}).forEach((path) => {
      const value = path.node.value;

      // args: { density: 'compact' } → args: { size: 'sm' }
      if (value.type === 'StringLiteral' || value.type === 'Literal') {
        const densityValue = value.value;
        const sizeValue = DENSITY_TO_SIZE[densityValue];
        if (sizeValue === undefined) return;

        if (sizeValue === null) {
          // density: 'default' → remove property
          const parent = path.parent.node;
          if (parent.type === 'ObjectExpression') {
            const idx = parent.properties.indexOf(path.node);
            if (idx !== -1) {
              parent.properties.splice(idx, 1);
              hasChanges = true;
            }
          }
        } else {
          // density: 'compact' → size: 'sm'
          path.node.key = j.identifier('size');
          path.node.value = j.stringLiteral(sizeValue);
          hasChanges = true;
        }
        return;
      }

      // argTypes: { density: {control: 'radio', options: [...]} }
      // → argTypes: { size: {control: 'radio', options: ['sm', 'md', 'lg']} }
      if (value.type === 'ObjectExpression') {
        path.node.key = j.identifier('size');
        // Update options array if present
        const optionsProp = value.properties.find(
          (p) => p.key?.name === 'options',
        );
        if (optionsProp && optionsProp.value.type === 'ArrayExpression') {
          optionsProp.value = j.arrayExpression([
            j.stringLiteral('sm'),
            j.stringLiteral('md'),
            j.stringLiteral('lg'),
          ]);
        }
        hasChanges = true;
      }
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
