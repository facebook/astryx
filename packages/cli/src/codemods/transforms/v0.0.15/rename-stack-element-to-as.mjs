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

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXOpeningElement)
    .filter((/** @type {any} */ path) => {
      const name = path.node.name;
      return name.type === 'JSXIdentifier' && TARGET_COMPONENTS.has(name.name);
    })
    .forEach((/** @type {any} */ path) => {
      path.node.attributes.forEach((/** @type {any} */ attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'element') {
          attr.name.name = 'as';
          hasChanges = true;
        }
      });
    });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
