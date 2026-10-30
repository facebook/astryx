// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeKnobsBundle.ts
 * @input Theme CSS generation, the knob reader and the animator
 * @output Re-exports them as one entry point
 * @position The esbuild entry `themeKnobs.interaction.browser.spec.ts`
 *   bundles into its page (global `ThemeKnobs`)
 */

export {defineTheme} from '../../theme/defineTheme';
export {generateThemeCSS} from '../../theme/generateThemeRules';
export {createMotionAnimator, END_HOLD_MS} from '../animator';
export {themeMotionKnobs} from '../themeKnobs';
export {registerSpringsTable, springs} from '../uikit/springs';
