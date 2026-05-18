// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Tab ancestor selectors.
 * Used by both XDSTab and XDSTabMenu to scope hover background styles
 * and ensure they don't leak from parent containers.
 */
export const tabScope = stylex.defineMarker();
