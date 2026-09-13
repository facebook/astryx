// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports Section component
 * @output Exports Section component and types
 * @position Entry point for @astryxdesign/core/Section module
 *
 * SYNC: When modified, update /packages/core/src/Section/Section.doc.mjs
 */

/**
 * Extensible variant map for Section.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Section' {
 *   interface SectionVariantMap {
 *     'elevated': true;
 *   }
 * }
 * ```
 */
export interface SectionVariantMap {
  section: true;
  transparent: true;
  muted: true;
}

export {Section} from './Section';
export type {SectionProps, SectionVariant} from './Section';
