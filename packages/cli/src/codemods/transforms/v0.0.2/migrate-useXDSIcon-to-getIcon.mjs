/**
 * @file Codemod: Migrate useXDSIcon → getIcon, remove IconRegistryContext
 * @see https://github.com/facebookexperimental/xds/pull/531
 *
 * - Renames useXDSIcon(...) calls to getIcon(...)
 * - Updates import specifiers: useXDSIcon → getIcon
 * - Updates import source from IconRegistry to globalIconRegistry (internal imports)
 * - Removes IconRegistryContext from imports (removes entire import if nothing left)
 * - Removes IconRegistryContext.Provider JSX wrappers (replaces with children)
 */

export const meta = {
  title: 'Migrate useXDSIcon → getIcon, remove IconRegistryContext',
  description:
    'Renames useXDSIcon() to getIcon(), updates import sources from IconRegistry to globalIconRegistry, and removes IconRegistryContext usage.',
  pr: '#531',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename useXDSIcon → getIcon in call expressions
  root
    .find(j.CallExpression, {
      callee: {type: 'Identifier', name: 'useXDSIcon'},
    })
    .forEach((path) => {
      path.node.callee.name = 'getIcon';
      hasChanges = true;
    });

  // 2. Update import specifiers: useXDSIcon → getIcon
  root.find(j.ImportSpecifier).forEach((path) => {
    const imported = path.node.imported;
    if (imported.type === 'Identifier' && imported.name === 'useXDSIcon') {
      const oldLocal = path.node.local ? path.node.local.name : null;
      imported.name = 'getIcon';
      // If local name matched old imported name, update it too
      if (oldLocal === 'useXDSIcon') {
        path.node.local.name = 'getIcon';
      }
      hasChanges = true;
    }
  });

  // 3. Remove IconRegistryContext from import specifiers
  root.find(j.ImportDeclaration).forEach((path) => {
    const specifiers = path.node.specifiers;
    if (!specifiers) return;

    const filtered = specifiers.filter((s) => {
      if (
        s.type === 'ImportSpecifier' &&
        s.imported.type === 'Identifier' &&
        s.imported.name === 'IconRegistryContext'
      ) {
        hasChanges = true;
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      // All specifiers removed — remove the entire import
      j(path).remove();
    } else if (filtered.length !== specifiers.length) {
      path.node.specifiers = filtered;
    }
  });

  // 4. Update import source: '../Icon/IconRegistry' or similar → '../Icon/globalIconRegistry'
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (typeof source === 'string' && source.includes('IconRegistry') && !source.includes('globalIconRegistry')) {
      path.node.source.value = source.replace(
        /IconRegistry$/,
        'globalIconRegistry',
      );
      hasChanges = true;
    }
  });

  // 5. Remove <IconRegistryContext.Provider> wrappers — replace with children
  root.find(j.JSXElement).forEach((path) => {
    const opening = path.node.openingElement;
    if (
      opening.name.type === 'JSXMemberExpression' &&
      opening.name.object.type === 'JSXIdentifier' &&
      opening.name.object.name === 'IconRegistryContext' &&
      opening.name.property.type === 'JSXIdentifier' &&
      opening.name.property.name === 'Provider'
    ) {
      // Replace the Provider element with its children
      const children = path.node.children;
      if (children.length === 1) {
        j(path).replaceWith(children[0]);
      } else {
        // Wrap multiple children in a fragment
        j(path).replaceWith(
          j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), children),
        );
      }
      hasChanges = true;
    }
  });

  // 6. Remove identifiers referencing IconRegistryContext (variable declarations, etc.)
  root
    .find(j.VariableDeclarator, {
      init: {type: 'Identifier', name: 'IconRegistryContext'},
    })
    .forEach((path) => {
      j(path.parent).remove();
      hasChanges = true;
    });

  return hasChanges ? root.toSource() : undefined;
}
