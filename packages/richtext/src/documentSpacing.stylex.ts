// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file documentSpacing.stylex.ts
 * @input Uses StyleX and Astryx spacing tokens
 * @output Exports documentSpacing: the space before and after each kind of
 *   document block
 * @position Read by editorTheme.ts. The values are core Markdown's default
 *   block spacing (spec:AST-061 FR3).
 *
 * Block margins read these variables instead of the spacing tokens, so their
 * atomic classes belong to this package: a stylesheet elsewhere that sets the
 * same token as a margin can never outrank the rules that remove the first
 * block's leading margin and the last block's trailing margin.
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

export const documentSpacing = stylex.defineVars({
  /** Before and after headings 1–3. */
  majorHeadingBefore: spacingVars['--spacing-6'],
  majorHeadingAfter: spacingVars['--spacing-3'],
  /** Before and after headings 4–6. */
  minorHeadingBefore: spacingVars['--spacing-4'],
  minorHeadingAfter: spacingVars['--spacing-2'],
  /** Around paragraphs and lists. */
  textBlock: spacingVars['--spacing-3'],
  /** Around fenced code, blockquotes, and tables. */
  wideBlock: spacingVars['--spacing-4'],
});
