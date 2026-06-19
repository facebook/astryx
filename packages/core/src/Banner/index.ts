// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Banner component and types from Banner.tsx
 * @output Exports Banner, BannerProps, BannerStatus, BannerContainer
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Banner/Banner.doc.mjs
 */

export {Banner} from './Banner';
export type {
  BannerProps,
  BannerStatus,
  BannerStatusMap,
  BannerContainer,
  BannerContainerMap,
} from './Banner';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Banner as XDSBanner,
} from '.';
export type {
  BannerContainer as XDSBannerContainer,
  BannerContainerMap as XDSBannerContainerMap,
  BannerProps as XDSBannerProps,
  BannerStatus as XDSBannerStatus,
  BannerStatusMap as XDSBannerStatusMap,
} from '.';
// <compat-aliases:end>
