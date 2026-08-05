// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from StatusDot component
 * @output Exports StatusDot component and related types
 * @position Entry point for StatusDot; re-exported by /packages/core/src/index.ts
 */

/**
 * Extensible variant map for StatusDot.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/StatusDot' {
 *   interface StatusDotVariantMap {
 *     'critical': true;
 *   }
 * }
 * ```
 *
 * Custom variants render no background fill, no ink colour, and no built-in
 * shape glyph — the theme must supply the fill, and it should also supply a
 * non-colour mark so the status is not distinguishable by colour alone (a
 * WCAG 1.4.1 failure). Supply the mark by registering a dot-scaled icon
 * under the scoped registry key `statusdot:<variant>` (e.g.
 * `defineTheme({icons: {'statusdot:critical': <CriticalGlyph />}})`); it
 * renders centred in the dot's 8px field, painted from `currentColor`.
 */
export interface StatusDotVariantMap {
  success: true;
  warning: true;
  error: true;
  accent: true;
  neutral: true;
}

export {StatusDot} from './StatusDot';
export type {StatusDotProps, StatusDotVariant} from './StatusDot';
