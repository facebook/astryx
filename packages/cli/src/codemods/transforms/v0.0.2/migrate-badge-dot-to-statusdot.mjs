/**
 * @file Codemod: Migrate Badge dot mode → StatusDot
 * @see https://github.com/facebookexperimental/xds/pull/945
 *
 * Converts XDSBadge with shape="dot" to XDSStatusDot.
 * Variant mapping: success→positive, error→negative, others unchanged.
 * Passes through label prop for a11y.
 */

export const meta = {
  title: 'Migrate Badge dot → StatusDot',
  description: 'Converts XDSBadge shape="dot" to XDSStatusDot.',
  pr: '#945',
};

const VARIANT_MAP = {
  success: 'positive',
  error: 'negative',
  warning: 'warning',
  info: 'info',
  neutral: 'neutral',
};

function isDotMode(path) {
  const opening = path.node.openingElement;

  // Dot mode is indicated by shape="dot" prop
  const hasShapeDot = opening.attributes.some(
    (attr) =>
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === 'shape' &&
      attr.value &&
      (attr.value.type === 'Literal' || attr.value.type === 'StringLiteral') &&
      attr.value.value === 'dot',
  );
  if (!hasShapeDot) return false;

  // If icon prop is present, leave alone
  const hasIcon = opening.attributes.some(
    (attr) =>
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === 'icon',
  );
  if (hasIcon) return false;

  return true;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Find all XDSBadge JSX elements
  root.find(j.JSXElement).forEach((path) => {
    const opening = path.node.openingElement;
    if (
      opening.name.type !== 'JSXIdentifier' ||
      opening.name.name !== 'XDSBadge'
    ) {
      return;
    }

    if (!isDotMode(path)) return;

    // Map variant
    const variantAttr = opening.attributes.find(
      (attr) =>
        attr.type === 'JSXAttribute' &&
        attr.name.name === 'variant',
    );

    let newVariantValue = 'neutral'; // default
    if (variantAttr) {
      if (
        variantAttr.value &&
        (variantAttr.value.type === 'StringLiteral' ||
          variantAttr.value.type === 'Literal')
      ) {
        const oldVariant = variantAttr.value.value;
        newVariantValue =
          Object.hasOwn(VARIANT_MAP, oldVariant)
            ? VARIANT_MAP[oldVariant]
            : oldVariant;
      } else if (
        variantAttr.value &&
        variantAttr.value.type === 'JSXExpressionContainer'
      ) {
        // Dynamic variant — pass through as-is, no mapping possible
        newVariantValue = null;
      }
    }

    // Build new attributes
    const newAttributes = [];

    // Add mapped variant
    if (newVariantValue !== null) {
      newAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('variant'),
          j.stringLiteral(newVariantValue),
        ),
      );
    } else if (variantAttr) {
      // Dynamic variant — keep original attribute
      newAttributes.push(variantAttr);
    }

    // Pass through other props (skip variant and shape since we handled them)
    for (const attr of opening.attributes) {
      if (attr.type === 'JSXSpreadAttribute') {
        newAttributes.push(attr);
        continue;
      }
      if (attr.name.name === 'variant') continue;
      if (attr.name.name === 'shape') continue;
      newAttributes.push(attr);
    }

    // Replace with self-closing XDSStatusDot
    const newElement = j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier('XDSStatusDot'),
        newAttributes,
        true,
      ),
      null,
      [],
    );

    j(path).replaceWith(newElement);
    hasChanges = true;
  });

  if (!hasChanges) return undefined;

  // Handle imports
  const badgeImports = root.find(j.ImportDeclaration).filter((path) => {
    const source = path.node.source.value;
    return (
      typeof source === 'string' &&
      (source === '@xds/core' ||
        source === '@xds/core/Badge' ||
        source.endsWith('/Badge'))
    );
  });

  // Check if any XDSBadge usages remain
  const remainingBadgeUsages = root
    .find(j.JSXIdentifier, {name: 'XDSBadge'})
    .size();

  // Add XDSStatusDot import if not already present
  const hasStatusDotImport =
    root
      .find(j.ImportSpecifier, {
        imported: {name: 'XDSStatusDot'},
      })
      .size() > 0 ||
    root
      .find(j.ImportDefaultSpecifier)
      .filter(
        (path) => path.node.local.name === 'XDSStatusDot',
      )
      .size() > 0;

  if (!hasStatusDotImport) {
    const newImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('XDSStatusDot'))],
      j.stringLiteral('@xds/core/StatusDot'),
    );

    // Insert after the last existing xds import, or at the top
    const xdsImports = root.find(j.ImportDeclaration).filter((path) => {
      const source = path.node.source.value;
      return typeof source === 'string' && source.includes('@xds/core');
    });

    if (xdsImports.size() > 0) {
      xdsImports.at(-1).insertAfter(newImport);
    } else {
      const allImports = root.find(j.ImportDeclaration);
      if (allImports.size() > 0) {
        allImports.at(-1).insertAfter(newImport);
      } else {
        root.get().node.program.body.unshift(newImport);
      }
    }
  }

  // Remove XDSBadge import if no remaining usages
  if (remainingBadgeUsages === 0) {
    badgeImports.forEach((path) => {
      const specifiers = path.node.specifiers;
      if (!specifiers) return;

      const filtered = specifiers.filter((s) => {
        if (
          s.type === 'ImportSpecifier' &&
          s.imported.type === 'Identifier' &&
          s.imported.name === 'XDSBadge'
        ) {
          return false;
        }
        if (
          s.type === 'ImportDefaultSpecifier' &&
          s.local.name === 'XDSBadge'
        ) {
          return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        j(path).remove();
      } else if (filtered.length !== specifiers.length) {
        path.node.specifiers = filtered;
      }
    });
  }

  return root.toSource();
}
