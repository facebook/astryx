// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Breadcrumbs component barrel export
 */

export {XDSBreadcrumbs} from './XDSBreadcrumbs';
export type {
  XDSBreadcrumbsProps,
  XDSBreadcrumbsVariant,
  XDSBreadcrumbsVariantMap,
} from './XDSBreadcrumbs';
export {XDSBreadcrumbItem} from './XDSBreadcrumbItem';
export type {XDSBreadcrumbItemProps} from './XDSBreadcrumbItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSBreadcrumbItem as BreadcrumbItem,
  XDSBreadcrumbs as Breadcrumbs,
} from '.';
export type {
  XDSBreadcrumbItemProps as BreadcrumbItemProps,
  XDSBreadcrumbsProps as BreadcrumbsProps,
  XDSBreadcrumbsVariant as BreadcrumbsVariant,
  XDSBreadcrumbsVariantMap as BreadcrumbsVariantMap,
} from '.';
// <compat-aliases:end>
