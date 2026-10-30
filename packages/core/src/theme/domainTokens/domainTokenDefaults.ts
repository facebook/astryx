// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file domainTokens/domainTokenDefaults.ts
 * @input syntaxTokenDefaults, dataTokenDefaults
 * @output domainTokenDefaults
 * @position Merges the domain token defaults for defineTheme. Kept out of the
 *   domainTokens barrel: Core declares its barrels side-effectful
 *   (spec:AST-080 FR4), so a barrel holds only re-exports and a bundle that
 *   never uses these tables can drop them.
 */

import {syntaxTokenDefaults} from '../syntax/tokens';
import {dataTokenDefaults} from './dataTokens';

/** All domain token defaults merged — used by defineTheme for validation */
export const domainTokenDefaults: Record<string, string> = {
  ...syntaxTokenDefaults,
  ...dataTokenDefaults,
};
