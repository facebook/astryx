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

/**
 * Extensible status map for Banner.
 *
 * Theme packages can add custom statuses via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Banner' {
 *   interface BannerStatusMap {
 *     'neutral': true;
 *   }
 * }
 * ```
 */
/**
 * Extensible container map for Banner.
 *
 * Theme packages can add custom container types via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Banner' {
 *   interface BannerContainerMap {
 *     'floating': true;
 *   }
 * }
 * ```
 */
export interface BannerContainerMap {
  card: true;
  section: true;
}

export interface BannerStatusMap {
  info: true;
  warning: true;
  error: true;
  success: true;
}

export {Banner} from './Banner';
export type {BannerProps, BannerStatus, BannerContainer} from './Banner';
