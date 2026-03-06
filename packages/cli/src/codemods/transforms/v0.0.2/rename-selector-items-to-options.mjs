/**
 * @file Codemod: Rename XDSSelector `items` prop to `options`
 * @see https://github.com/facebookexperimental/xds/pull/479
 */

export const meta = {
  title: 'Rename Selector items → options',
  description: 'Renames the `items` prop on XDSSelector to `options`.',
  pr: '#479',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Find <XDSSelector items={...} /> and rename to options
  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSSelector'},
    })
    .forEach((path) => {
      path.node.attributes.forEach((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'items') {
          attr.name.name = 'options';
          hasChanges = true;
        }
      });
    });

  return hasChanges ? root.toSource() : undefined;
}
