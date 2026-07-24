// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename XDSSelector `items` prop to `options`
 * @see https://github.com/facebookexperimental/xds/pull/479
 */

export const meta = {
  title: 'Rename Selector items → options',
  description: 'Renames the `items` prop on XDSSelector to `options`.',
  pr: '#479',
};

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Find <XDSSelector items={...} /> and rename to options
  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSSelector'},
    })
    .forEach((/** @type {any} */ path) => {
      path.node.attributes.forEach((/** @type {any} */ attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'items') {
          attr.name.name = 'options';
          hasChanges = true;
        }
      });
    });

  return hasChanges ? root.toSource() : undefined;
}
