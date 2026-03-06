/**
 * @file Codemod: Replace XDSHStack/XDSVStack with XDSStack + direction prop
 * @see https://github.com/facebookexperimental/xds/pull/374
 */

export const meta = {
  title: 'Replace XDSHStack/XDSVStack with XDSStack',
  description:
    'Replaces `<XDSHStack>` with `<XDSStack direction="horizontal">` and `<XDSVStack>` with `<XDSStack direction="vertical">`. Also updates imports.',
  pr: '#374',
};

const REPLACEMENTS = {
  XDSHStack: 'horizontal',
  XDSVStack: 'vertical',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Rename JSX elements: <XDSHStack> → <XDSStack direction="horizontal">
  Object.entries(REPLACEMENTS).forEach(([oldName, direction]) => {
    // Opening elements
    root
      .find(j.JSXOpeningElement, {name: {name: oldName}})
      .forEach((path) => {
        path.node.name.name = 'XDSStack';
        // Add direction prop (prepend so it reads naturally)
        const directionAttr = j.jsxAttribute(
          j.jsxIdentifier('direction'),
          j.stringLiteral(direction),
        );
        path.node.attributes.unshift(directionAttr);
        hasChanges = true;
      });

    // Closing elements
    root
      .find(j.JSXClosingElement, {name: {name: oldName}})
      .forEach((path) => {
        path.node.name.name = 'XDSStack';
        hasChanges = true;
      });
  });

  // Update imports: replace XDSHStack/XDSVStack with XDSStack
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    // Match @xds/core imports (e.g. '@xds/core/Stack', '@xds/core/Layout', '@xds/core')
    if (!source.startsWith('@xds/core')) return;

    let needsXDSStack = false;
    const specifiersToRemove = [];

    path.node.specifiers.forEach((spec, index) => {
      if (spec.type === 'ImportSpecifier') {
        const importedName = spec.imported.name;
        if (importedName === 'XDSHStack' || importedName === 'XDSVStack') {
          specifiersToRemove.push(index);
          needsXDSStack = true;
        }
        if (importedName === 'XDSStack') {
          // Already importing XDSStack, just need to remove old ones
          needsXDSStack = false;
        }
      }
    });

    if (specifiersToRemove.length > 0) {
      // Check if XDSStack is already imported
      const alreadyHasStack = path.node.specifiers.some(
        (s) => s.type === 'ImportSpecifier' && s.imported.name === 'XDSStack',
      );

      // Remove old specifiers (reverse order to preserve indices)
      for (let i = specifiersToRemove.length - 1; i >= 0; i--) {
        path.node.specifiers.splice(specifiersToRemove[i], 1);
      }

      // Add XDSStack if not already present
      if (needsXDSStack && !alreadyHasStack) {
        path.node.specifiers.push(
          j.importSpecifier(j.identifier('XDSStack')),
        );
      }

      // If no specifiers left, remove the import entirely
      if (path.node.specifiers.length === 0) {
        j(path).remove();
      }

      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
