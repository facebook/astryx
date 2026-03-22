/**
 * @file v0.0.7 transform manifest
 *
 * Lists all codemods for the v0.0.7 release in the order they should run.
 */

import renameBannerVariantToContainer, {
  meta as bannerVariantMeta,
} from './rename-banner-variant-to-container.mjs';

export default [
  {
    name: 'rename-banner-variant-to-container',
    transform: renameBannerVariantToContainer,
    meta: bannerVariantMeta,
  },
];
