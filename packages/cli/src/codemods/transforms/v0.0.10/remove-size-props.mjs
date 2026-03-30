/**
 * @file Codemod: Remove size prop from XDSStatusDot and XDSProgressBar
 * @see https://github.com/facebookexperimental/xds/issues/904
 *
 * StatusDot and ProgressBar now have a single fixed size (8px).
 * The `size` prop has been removed from both components.
 *
 * This codemod handles:
 * 1. JSX prop removal: <XDSStatusDot size="sm" /> → <XDSStatusDot />
 * 2. JSX prop removal: <XDSProgressBar size="md" /> → <XDSProgressBar />
 * 3. Object property removal in spread patterns: { size: "sm", ...rest } → { ...rest }
 * 4. Destructuring removal: const { size, ...rest } = props → const { ...rest } = props
 * 5. Type reference cleanup: XDSStatusDotSize, XDSProgressBarSize imports removed
 */

const TARGET_COMPONENTS = new Set([
  'XDSStatusDot',
  'XDSProgressBar',
]);

const SIZE_TYPE_IMPORTS = new Set([
  'XDSStatusDotSize',
  'XDSProgressBarSize',
]);

export const meta = {
  title: 'Remove size prop from StatusDot and ProgressBar',
  description:
    'StatusDot and ProgressBar now have a single fixed size (8px). Removes the `size` prop from JSX, object literals, destructuring patterns, and cleans up size type imports.',
  pr: '#966',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Remove size JSX prop from target components
  root
    .find(j.JSXOpeningElement)
    .filter((path) => {
      const name = path.node.name;
      // Handle simple names like <XDSStatusDot>
      if (name.type === 'JSXIdentifier') {
        return TARGET_COMPONENTS.has(name.name);
      }
      return false;
    })
    .forEach((path) => {
      const attrs = path.node.attributes;
      const sizeIdx = attrs.findIndex(
        (attr) =>
          attr.type === 'JSXAttribute' &&
          attr.name &&
          attr.name.name === 'size',
      );
      if (sizeIdx !== -1) {
        attrs.splice(sizeIdx, 1);
        hasChanges = true;
      }
    });

  // 2. Remove size type imports (XDSStatusDotSize, XDSProgressBarSize)
  root.find(j.ImportDeclaration).forEach((path) => {
    const specifiers = path.node.specifiers;
    if (!specifiers) return;

    const toRemove = [];
    for (let i = 0; i < specifiers.length; i++) {
      const spec = specifiers[i];
      const importedName =
        spec.imported?.name || spec.local?.name;
      if (importedName && SIZE_TYPE_IMPORTS.has(importedName)) {
        toRemove.push(i);
      }
    }

    if (toRemove.length > 0) {
      // Remove in reverse order to preserve indices
      for (let i = toRemove.length - 1; i >= 0; i--) {
        specifiers.splice(toRemove[i], 1);
      }
      // If no specifiers left, remove entire import
      if (specifiers.length === 0) {
        j(path).remove();
      }
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
