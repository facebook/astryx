/**
 * @file v0.0.5 transform manifest
 */

import migrateCollapseToCollapsible, {
  meta as collapseMeta,
} from './migrate-collapse-to-collapsible.mjs';

export default [
  {
    name: 'migrate-collapse-to-collapsible',
    transform: migrateCollapseToCollapsible,
    meta: collapseMeta,
  },
];
