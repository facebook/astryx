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
