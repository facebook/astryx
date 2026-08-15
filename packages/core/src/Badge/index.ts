// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports Badge component and types from Badge.tsx
 * @output Exports Badge, BadgeProps, BadgeVariant
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Badge/Badge.doc.mjs
 */

/**
 * Extensible variant map for Badge.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Badge' {
 *   interface BadgeVariantMap {
 *     'premium': true;
 *   }
 * }
 * ```
 */
export interface BadgeVariantMap {
  neutral: true;
  info: true;
  success: true;
  warning: true;
  error: true;
  blue: true;
  cyan: true;
  green: true;
  orange: true;
  pink: true;
  purple: true;
  red: true;
  teal: true;
  yellow: true;
}

export {Badge} from './Badge';
export type {BadgeProps, BadgeVariant} from './Badge';
