/**
 * @file v0.0.15 transform manifest
 *
 * Lists all codemods for the v0.0.15 release in the order they should run.
 */

import renameStatusVariants, {
  meta as renameStatusVariantsMeta,
} from './rename-status-variants.mjs';

export default [
  {
    name: 'rename-status-variants',
    transform: renameStatusVariants,
    meta: renameStatusVariantsMeta,
  },
];
