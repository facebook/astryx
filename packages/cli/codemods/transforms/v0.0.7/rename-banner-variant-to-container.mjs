// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename XDSBanner variant to container
 * @see https://github.com/facebookexperimental/xds/pull/814
 *
 * Banner's `variant` prop (card/section) controlled container shape,
 * not visual treatment. Renamed to `container` to free `variant`
 * semantics for theming and make the API more honest.
 *
 * Also renames the type exports:
 * - XDSBannerVariant → XDSBannerContainer
 * - XDSBannerVariantMap → XDSBannerContainerMap
 */

export const meta = {
  title: 'Rename Banner variant → container',
  description:
    'Renames the `variant` prop on XDSBanner to `container`, and updates type references from XDSBannerVariant to XDSBannerContainer.',
  pr: '#814',
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

  // 1. Rename JSX prop: <XDSBanner variant="card" /> → <XDSBanner container="card" />
  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSBanner'},
    })
    .forEach((/** @type {any} */ path) => {
      path.node.attributes.forEach((/** @type {any} */ attr) => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'variant') {
          attr.name.name = 'container';
          hasChanges = true;
        }
      });
    });

  // 2. Rename type references: XDSBannerVariant → XDSBannerContainer
  root.find(j.Identifier, {name: 'XDSBannerVariant'}).forEach((/** @type {any} */ path) => {
    path.node.name = 'XDSBannerContainer';
    hasChanges = true;
  });

  // Note: XDSBannerVariantMap is removed entirely (theming now uses
  // XDSBannerStatusMap). Any augmentations of XDSBannerVariantMap should
  // be migrated to XDSBannerStatusMap manually.

  return hasChanges ? root.toSource() : undefined;
}
