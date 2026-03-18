/**
 * @file v0.0.5 transform manifest
 */

import migrateCollapseToCollapsible, {
  meta as collapseMeta,
} from './migrate-collapse-to-collapsible.mjs';

import migrateRadiusTokens, {
  meta as radiusTokensMeta,
} from './migrate-radius-tokens.mjs';

import migrateSkeletonRadius, {
  meta as skeletonRadiusMeta,
} from './migrate-skeleton-radius.mjs';

export default [
  {
    name: 'migrate-collapse-to-collapsible',
    transform: migrateCollapseToCollapsible,
    meta: collapseMeta,
  },
  {
    name: 'migrate-radius-tokens',
    transform: migrateRadiusTokens,
    meta: radiusTokensMeta,
  },
  {
    name: 'migrate-skeleton-radius',
    transform: migrateSkeletonRadius,
    meta: skeletonRadiusMeta,
  },
];
