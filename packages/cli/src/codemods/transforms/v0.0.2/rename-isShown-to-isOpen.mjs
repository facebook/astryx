/**
 * @file Codemod: Rename `isShown` prop to `isOpen` on Dialog, CommandPalette, and Popover
 * @see https://github.com/facebookexperimental/xds/pull/472
 */

export const meta = {
  title: 'Rename isShown → isOpen',
  description:
    'Renames the `isShown` prop to `isOpen` on XDSDialog, XDSCommandPalette, and XDSPopover for consistency.',
  pr: '#472',
};

const TARGET_COMPONENTS = ['XDSDialog', 'XDSCommandPalette', 'XDSPopover'];

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  TARGET_COMPONENTS.forEach((componentName) => {
    root
      .find(j.JSXOpeningElement, {
        name: {name: componentName},
      })
      .forEach((path) => {
        path.node.attributes.forEach((attr) => {
          if (attr.type === 'JSXAttribute' && attr.name.name === 'isShown') {
            attr.name.name = 'isOpen';
            hasChanges = true;
          }
        });
      });
  });

  return hasChanges ? root.toSource() : undefined;
}
