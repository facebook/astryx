/**
 * @file Codemod: Migrate `background` prop to `variant` on XDSAppShell
 *
 * Transforms:
 * - background="wash" → variant="wash"
 * - background="surface" → variant="surface"
 * - background={expr} → variant={expr}
 * - No background prop → adds variant="surface" (old default was "surface", new default is "section")
 *
 * @see https://github.com/facebookexperimental/xds/pull/597
 */

export const meta = {
  title: 'Migrate background → variant on XDSAppShell',
  description:
    'Replaces the `background` prop with `variant` on XDSAppShell. Adds `variant="surface"` when no background was set (old default changed from "surface" to "section").',
  pr: '#597',
};

const TARGET_COMPONENT = 'XDSAppShell';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXOpeningElement, {
      name: {name: TARGET_COMPONENT},
    })
    .forEach((path) => {
      const attrs = path.node.attributes;

      // Find background prop index
      const bgIndex = attrs.findIndex(
        (attr) =>
          attr.type === 'JSXAttribute' && attr.name.name === 'background',
      );

      if (bgIndex !== -1) {
        // Rename background → variant
        attrs[bgIndex].name.name = 'variant';
        hasChanges = true;
      } else {
        // No background prop found — check there's no variant already
        const hasVariant = attrs.some(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'variant',
        );
        if (!hasVariant) {
          // Add variant="surface" (old default was "surface", new default is "section")
          attrs.push(
            j.jsxAttribute(
              j.jsxIdentifier('variant'),
              j.literal('surface'),
            ),
          );
          hasChanges = true;
        }
      }
    });

  return hasChanges ? root.toSource() : undefined;
}
