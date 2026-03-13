/**
 * @file v0.0.3 transform manifest
 *
 * Lists all codemods for the v0.0.3 release in the order they should run.
 */

import migrateBackgroundToVariant, {
  meta as backgroundMeta,
} from './migrate-background-to-variant.mjs';
import removeColorNavbarToken, {
  meta as navbarMeta,
} from './remove-color-navbar-token.mjs';

export default [
  {
    name: 'migrate-background-to-variant',
    transform: migrateBackgroundToVariant,
    meta: backgroundMeta,
  },
  {
    name: 'remove-color-navbar-token',
    transform: removeColorNavbarToken,
    meta: navbarMeta,
  },
];
