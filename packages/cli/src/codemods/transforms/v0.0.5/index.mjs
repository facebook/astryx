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

import migrateShadowTokens, {
  meta as shadowTokensMeta,
} from './migrate-shadow-tokens.mjs';

import migrateTokenNames, {
  meta as tokenNamesMeta,
} from './migrate-token-names.mjs';

import migrateBadgeChildrenToLabel, {
  meta as badgeChildrenToLabelMeta,
} from './migrate-badge-children-to-label.mjs';

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
  {
    name: 'migrate-shadow-tokens',
    transform: migrateShadowTokens,
    meta: shadowTokensMeta,
  },
  {
    name: 'migrate-token-names',
    transform: migrateTokenNames,
    meta: tokenNamesMeta,
  },
  {
    name: 'migrate-badge-children-to-label',
    transform: migrateBadgeChildrenToLabel,
    meta: badgeChildrenToLabelMeta,
  },
];
