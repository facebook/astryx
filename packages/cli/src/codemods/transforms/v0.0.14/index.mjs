/**
 * @file v0.0.14 transform manifest
 *
 * Lists all codemods for the v0.0.14 release in the order they should run.
 */

import toolbarDensityToSize, {
  meta as toolbarDensityToSizeMeta,
} from './toolbar-density-to-size.mjs';

export default [
  {
    name: 'toolbar-density-to-size',
    transform: toolbarDensityToSize,
    meta: toolbarDensityToSizeMeta,
  },
];
