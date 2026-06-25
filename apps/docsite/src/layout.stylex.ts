// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Shared content max-widths, defined as StyleX compile-time consts so the same
 * values can be used inside `stylex.create` and as component props.
 *
 * - contentMaxWidth: wide content cap for showcase/landing/index sections
 * - proseMaxWidth: reading-width cap for docs, blog, and prose content
 */
export const layout = stylex.defineConsts({
  contentMaxWidth: '1200px',
  proseMaxWidth: '800px',
});
