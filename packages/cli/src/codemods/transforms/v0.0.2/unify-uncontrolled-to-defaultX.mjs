/**
 * @file Codemod: Rename initialX props to defaultX pattern
 * @see https://github.com/facebookexperimental/xds/pull/470
 *
 * Standardizes uncontrolled state prop naming from `initialX` to `defaultX`.
 */

export const meta = {
  title: 'Unify uncontrolled state → defaultX pattern',
  description:
    'Renames initialIsSideNavCollapsed, initialIsOpen, initialIsExpanded to their defaultX equivalents.',
  pr: '#470',
};

const RENAMES = [
  {
    component: 'XDSAppShell',
    oldProp: 'initialIsSideNavCollapsed',
    newProp: 'defaultIsSideNavCollapsed',
  },
  {
    component: 'XDSCollapsible',
    oldProp: 'initialIsOpen',
    newProp: 'defaultIsOpen',
  },
  {
    component: 'XDSBanner',
    oldProp: 'initialIsExpanded',
    newProp: 'defaultIsExpanded',
  },
];

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  for (const {component, oldProp, newProp} of RENAMES) {
    root
      .find(j.JSXOpeningElement, {
        name: {name: component},
      })
      .forEach((path) => {
        path.node.attributes.forEach((attr) => {
          if (attr.type === 'JSXAttribute' && attr.name.name === oldProp) {
            attr.name.name = newProp;
            hasChanges = true;
          }
        });
      });
  }

  return hasChanges ? root.toSource() : undefined;
}
