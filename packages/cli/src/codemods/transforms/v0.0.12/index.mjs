/**
 * @file v0.0.12 transform manifest
 *
 * Lists all codemods for the v0.0.12 release in the order they should run.
 */

import addIsIconOnly, {
  meta as addIsIconOnlyMeta,
} from './add-is-icon-only.mjs';

export default [
  {
    name: 'add-is-icon-only',
    transform: addIsIconOnly,
    meta: addIsIconOnlyMeta,
  },
];
