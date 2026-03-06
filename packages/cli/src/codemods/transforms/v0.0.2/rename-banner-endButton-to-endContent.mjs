/**
 * @file Codemod: Rename XDSBanner endButton to endContent
 * @see https://github.com/facebookexperimental/xds/pull/437
 */

export const meta = {
  title: 'Rename Banner endButton → endContent',
  description: 'Renames the `endButton` prop on XDSBanner to `endContent`.',
  pr: '#437',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSBanner'},
    })
    .forEach((path) => {
      path.node.attributes.forEach((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'endButton') {
          attr.name.name = 'endContent';
          hasChanges = true;
        }
      });
    });

  return hasChanges ? root.toSource() : undefined;
}
