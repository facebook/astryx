// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None
 * @output Exports shared utility types
 * @position Shared types used across multiple components
 */

/**
 * Size value type - accepts numbers (treated as pixels) or strings (e.g., '100%', '50vh').
 */
export type SizeValue = number | string;

/**
 * Resting elevation level for configurable surfaces.
 *
 * Maps to the shadow token scale:
 * - `none` = flat (`box-shadow: none`)
 * - `low`  = `--shadow-low`
 * - `med`  = `--shadow-med`
 * - `high` = `--shadow-high`
 *
 * Components narrow this union to the steps they actually need — e.g. Card
 * exposes all four, while ChatComposer exposes only `'none' | 'low'`.
 */
export type Elevation = 'none' | 'low' | 'med' | 'high';

/**
 * Numeric spacing step from the Astryx spacing scale.
 *
 * Maps to CSS spacing tokens:
 * - 0 = 0px (--spacing-0)
 * - 0.5 = 2px (--spacing-0-5)
 * - 1 = 4px (--spacing-1)
 * - 1.5 = 6px (--spacing-1-5)
 * - 2 = 8px (--spacing-2)
 * - 3 = 12px (--spacing-3)
 * - 4 = 16px (--spacing-4)
 * - 5 = 20px (--spacing-5)
 * - 6 = 24px (--spacing-6)
 * - 8 = 32px (--spacing-8)
 * - 10 = 40px (--spacing-10)
 */
export type SpacingStep = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
