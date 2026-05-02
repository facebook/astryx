/**
 * @file padding.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX styles for numeric padding prop on layout components
 * @position Layout utility; used by XDSCard, XDSSection, and Layout sub-components
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {SpacingStep} from '../utils/types';

/**
 * Maps numeric SpacingStep values to SpacingToken keys used by the container system.
 */
export const spacingStepToToken: Record<SpacingStep, string> = {
  0: 'spacing0',
  0.5: 'spacing0_5',
  1: 'spacing1',
  1.5: 'spacing1_5',
  2: 'spacing2',
  3: 'spacing3',
  4: 'spacing4',
  5: 'spacing5',
  6: 'spacing6',
  8: 'spacing8',
  10: 'spacing10',
};

/**
 * Padding styles for all sides using spacing tokens.
 * Each key applies uniform padding to all four sides.
 */
export const paddingStyles = stylex.create({
  0: {
    paddingInlineStart: spacingVars['--spacing-0'],
    paddingInlineEnd: spacingVars['--spacing-0'],
    paddingBlockStart: spacingVars['--spacing-0'],
    paddingBlockEnd: spacingVars['--spacing-0'],
  },
  0.5: {
    paddingInlineStart: spacingVars['--spacing-0-5'],
    paddingInlineEnd: spacingVars['--spacing-0-5'],
    paddingBlockStart: spacingVars['--spacing-0-5'],
    paddingBlockEnd: spacingVars['--spacing-0-5'],
  },
  1: {
    paddingInlineStart: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-1'],
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  1.5: {
    paddingInlineStart: spacingVars['--spacing-1-5'],
    paddingInlineEnd: spacingVars['--spacing-1-5'],
    paddingBlockStart: spacingVars['--spacing-1-5'],
    paddingBlockEnd: spacingVars['--spacing-1-5'],
  },
  2: {
    paddingInlineStart: spacingVars['--spacing-2'],
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  3: {
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  4: {
    paddingInlineStart: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-4'],
    paddingBlockStart: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  5: {
    paddingInlineStart: spacingVars['--spacing-5'],
    paddingInlineEnd: spacingVars['--spacing-5'],
    paddingBlockStart: spacingVars['--spacing-5'],
    paddingBlockEnd: spacingVars['--spacing-5'],
  },
  6: {
    paddingInlineStart: spacingVars['--spacing-6'],
    paddingInlineEnd: spacingVars['--spacing-6'],
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-6'],
  },
  8: {
    paddingInlineStart: spacingVars['--spacing-8'],
    paddingInlineEnd: spacingVars['--spacing-8'],
    paddingBlockStart: spacingVars['--spacing-8'],
    paddingBlockEnd: spacingVars['--spacing-8'],
  },
  10: {
    paddingInlineStart: spacingVars['--spacing-10'],
    paddingInlineEnd: spacingVars['--spacing-10'],
    paddingBlockStart: spacingVars['--spacing-10'],
    paddingBlockEnd: spacingVars['--spacing-10'],
  },
});

/**
 * Container padding inline CSS variable styles for edge compensation.
 * Sets --container-padding-inline-start and --container-padding-inline-end so
 * edge-compensating children know the inline padding to compensate against.
 */
export const containerPaddingInlineVarStyles = stylex.create({
  0: {
    '--container-padding-inline-start': spacingVars['--spacing-0'],
    '--container-padding-inline-end': spacingVars['--spacing-0'],
  },
  0.5: {
    '--container-padding-inline-start': spacingVars['--spacing-0-5'],
    '--container-padding-inline-end': spacingVars['--spacing-0-5'],
  },
  1: {
    '--container-padding-inline-start': spacingVars['--spacing-1'],
    '--container-padding-inline-end': spacingVars['--spacing-1'],
  },
  1.5: {
    '--container-padding-inline-start': spacingVars['--spacing-1-5'],
    '--container-padding-inline-end': spacingVars['--spacing-1-5'],
  },
  2: {
    '--container-padding-inline-start': spacingVars['--spacing-2'],
    '--container-padding-inline-end': spacingVars['--spacing-2'],
  },
  3: {
    '--container-padding-inline-start': spacingVars['--spacing-3'],
    '--container-padding-inline-end': spacingVars['--spacing-3'],
  },
  4: {
    '--container-padding-inline-start': spacingVars['--spacing-4'],
    '--container-padding-inline-end': spacingVars['--spacing-4'],
  },
  5: {
    '--container-padding-inline-start': spacingVars['--spacing-5'],
    '--container-padding-inline-end': spacingVars['--spacing-5'],
  },
  6: {
    '--container-padding-inline-start': spacingVars['--spacing-6'],
    '--container-padding-inline-end': spacingVars['--spacing-6'],
  },
  8: {
    '--container-padding-inline-start': spacingVars['--spacing-8'],
    '--container-padding-inline-end': spacingVars['--spacing-8'],
  },
  10: {
    '--container-padding-inline-start': spacingVars['--spacing-10'],
    '--container-padding-inline-end': spacingVars['--spacing-10'],
  },
});

/**
 * Container padding block-start/block-end CSS variable styles for vertical bleed.
 * Sets --container-padding-block-start and --container-padding-block-end so bleed children (Table, Divider, Section)
 * know the block padding to compensate against when first/last child.
 */
export const containerPaddingBlockStartVarStyles = stylex.create({
  0: {'--container-padding-block-start': spacingVars['--spacing-0']},
  0.5: {'--container-padding-block-start': spacingVars['--spacing-0-5']},
  1: {'--container-padding-block-start': spacingVars['--spacing-1']},
  1.5: {'--container-padding-block-start': spacingVars['--spacing-1-5']},
  2: {'--container-padding-block-start': spacingVars['--spacing-2']},
  3: {'--container-padding-block-start': spacingVars['--spacing-3']},
  4: {'--container-padding-block-start': spacingVars['--spacing-4']},
  5: {'--container-padding-block-start': spacingVars['--spacing-5']},
  6: {'--container-padding-block-start': spacingVars['--spacing-6']},
  8: {'--container-padding-block-start': spacingVars['--spacing-8']},
  10: {'--container-padding-block-start': spacingVars['--spacing-10']},
});

export const containerPaddingBlockEndVarStyles = stylex.create({
  0: {'--container-padding-block-end': spacingVars['--spacing-0']},
  0.5: {'--container-padding-block-end': spacingVars['--spacing-0-5']},
  1: {'--container-padding-block-end': spacingVars['--spacing-1']},
  1.5: {'--container-padding-block-end': spacingVars['--spacing-1-5']},
  2: {'--container-padding-block-end': spacingVars['--spacing-2']},
  3: {'--container-padding-block-end': spacingVars['--spacing-3']},
  4: {'--container-padding-block-end': spacingVars['--spacing-4']},
  5: {'--container-padding-block-end': spacingVars['--spacing-5']},
  6: {'--container-padding-block-end': spacingVars['--spacing-6']},
  8: {'--container-padding-block-end': spacingVars['--spacing-8']},
  10: {'--container-padding-block-end': spacingVars['--spacing-10']},
});

/**
 * Layout outer X padding CSS variable styles.
 */
export const layoutPaddingOuterXVarStyles = stylex.create({
  0: {'--layout-padding-outer-x': spacingVars['--spacing-0']},
  0.5: {'--layout-padding-outer-x': spacingVars['--spacing-0-5']},
  1: {'--layout-padding-outer-x': spacingVars['--spacing-1']},
  1.5: {'--layout-padding-outer-x': spacingVars['--spacing-1-5']},
  2: {'--layout-padding-outer-x': spacingVars['--spacing-2']},
  3: {'--layout-padding-outer-x': spacingVars['--spacing-3']},
  4: {'--layout-padding-outer-x': spacingVars['--spacing-4']},
  5: {'--layout-padding-outer-x': spacingVars['--spacing-5']},
  6: {'--layout-padding-outer-x': spacingVars['--spacing-6']},
  8: {'--layout-padding-outer-x': spacingVars['--spacing-8']},
  10: {'--layout-padding-outer-x': spacingVars['--spacing-10']},
});

/**
 * Layout outer Y padding CSS variable styles.
 */
export const layoutPaddingOuterYVarStyles = stylex.create({
  0: {'--layout-padding-outer-y': spacingVars['--spacing-0']},
  0.5: {'--layout-padding-outer-y': spacingVars['--spacing-0-5']},
  1: {'--layout-padding-outer-y': spacingVars['--spacing-1']},
  1.5: {'--layout-padding-outer-y': spacingVars['--spacing-1-5']},
  2: {'--layout-padding-outer-y': spacingVars['--spacing-2']},
  3: {'--layout-padding-outer-y': spacingVars['--spacing-3']},
  4: {'--layout-padding-outer-y': spacingVars['--spacing-4']},
  5: {'--layout-padding-outer-y': spacingVars['--spacing-5']},
  6: {'--layout-padding-outer-y': spacingVars['--spacing-6']},
  8: {'--layout-padding-outer-y': spacingVars['--spacing-8']},
  10: {'--layout-padding-outer-y': spacingVars['--spacing-10']},
});

/**
 * Block-only padding override styles.
 * Use when a component needs to override block padding independently
 * of inline padding (e.g., Toolbar sets tight block padding while
 * inheriting inline padding from its container).
 */
export const paddingBlockStyles = stylex.create({
  0: {
    paddingBlockStart: spacingVars['--spacing-0'],
    paddingBlockEnd: spacingVars['--spacing-0'],
  },
  0.5: {
    paddingBlockStart: spacingVars['--spacing-0-5'],
    paddingBlockEnd: spacingVars['--spacing-0-5'],
  },
  1: {
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  1.5: {
    paddingBlockStart: spacingVars['--spacing-1-5'],
    paddingBlockEnd: spacingVars['--spacing-1-5'],
  },
  2: {
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  3: {
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  4: {
    paddingBlockStart: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  5: {
    paddingBlockStart: spacingVars['--spacing-5'],
    paddingBlockEnd: spacingVars['--spacing-5'],
  },
  6: {
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-6'],
  },
  8: {
    paddingBlockStart: spacingVars['--spacing-8'],
    paddingBlockEnd: spacingVars['--spacing-8'],
  },
  10: {
    paddingBlockStart: spacingVars['--spacing-10'],
    paddingBlockEnd: spacingVars['--spacing-10'],
  },
});

/**
 * Propagation styles for --xds-section-padding.
 * When a parent section sets explicit padding, this propagates the value
 * through the CSS custom property cascade so nested sections that use
 * useThemeDefault inherit the parent's padding instead of the theme default.
 */
export const sectionPaddingPropagationStyles = stylex.create({
  0: {'--xds-section-padding': spacingVars['--spacing-0']},
  0.5: {'--xds-section-padding': spacingVars['--spacing-0-5']},
  1: {'--xds-section-padding': spacingVars['--spacing-1']},
  1.5: {'--xds-section-padding': spacingVars['--spacing-1-5']},
  2: {'--xds-section-padding': spacingVars['--spacing-2']},
  3: {'--xds-section-padding': spacingVars['--spacing-3']},
  4: {'--xds-section-padding': spacingVars['--spacing-4']},
  5: {'--xds-section-padding': spacingVars['--spacing-5']},
  6: {'--xds-section-padding': spacingVars['--spacing-6']},
  8: {'--xds-section-padding': spacingVars['--spacing-8']},
  10: {'--xds-section-padding': spacingVars['--spacing-10']},
});
