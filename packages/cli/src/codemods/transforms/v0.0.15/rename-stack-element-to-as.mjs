// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename `element` prop to `as` on Stack components
 */

export const meta = {
  title: 'Rename element → as on Stack components',
  description:
    'Renames the `element` prop to `as` on XDSStack, XDSHStack, XDSVStack, and XDSStackItem for consistency with other polymorphic components.',
};

const TARGET_COMPONENTS = new Set([
  'XDSStack',
  'XDSHStack',
  'XDSVStack',
  'XDSStackItem',
]);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXOpeningElement)
    .filter((path) => {
      const name = path.node.name;
      return name.type === 'JSXIdentifier' && TARGET_COMPONENTS.has(name.name);
    })
    .forEach((path) => {
      path.node.attributes.forEach((attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'element') {
          attr.name.name = 'as';
          hasChanges = true;
        }
      });
    });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
