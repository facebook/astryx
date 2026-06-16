// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSBanner component and types from XDSBanner.tsx
 * @output Exports XDSBanner, XDSBannerProps, XDSBannerStatus, XDSBannerContainer
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Banner/Banner.doc.mjs
 */

export {XDSBanner} from './XDSBanner';
export type {
  XDSBannerProps,
  XDSBannerStatus,
  XDSBannerStatusMap,
  XDSBannerContainer,
  XDSBannerContainerMap,
} from './XDSBanner';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSBanner as Banner,
} from '.';
export type {
  XDSBannerContainer as BannerContainer,
  XDSBannerContainerMap as BannerContainerMap,
  XDSBannerProps as BannerProps,
  XDSBannerStatus as BannerStatus,
  XDSBannerStatusMap as BannerStatusMap,
} from '.';
// <compat-aliases:end>
