/**
 * @file domainTokens/index.ts
 * @input None (re-exports sub-modules)
 * @output domainTokenDefaults, DomainTokenName, and all sub-module exports
 * @position Token definitions; consumed by defineTheme for validation + autocomplete
 *
 * Domain tokens are color tokens owned by specific feature areas (code
 * highlighting, data visualization, etc.) that don't belong in the core
 * color palette but still need to be theme-overridable.
 *
 * These are in a SEPARATE file from tokens.stylex.ts so they're
 * tree-shakeable — importing core components doesn't pull these in.
 * Only defineTheme and domain components reference this file.
 *
 * Sub-modules:
 * - syntaxTokens.ts — code syntax highlighting (used by CodeBlock)
 * - dataTokens.ts   — data visualization palette (charts, graphs)
 *
 * SYNC: When adding a new domain, update:
 * - Add a new sub-module file here (e.g. mapTokens.ts)
 * - Re-export it below and merge into domainTokenDefaults
 * - Update DomainTokenName union
 * - /packages/core/src/theme/defineTheme.ts (XDSTokenName union picks this up automatically)
 * - /packages/core/src/theme/index.ts (re-export the new type if needed)
 */

export {syntaxTokenDefaults} from './syntaxTokens';
export type {SyntaxTokenName} from './syntaxTokens';

export {dataTokenDefaults} from './dataTokens';
export type {DataTokenName} from './dataTokens';

import {syntaxTokenDefaults} from './syntaxTokens';
import {dataTokenDefaults} from './dataTokens';
import type {SyntaxTokenName} from './syntaxTokens';
import type {DataTokenName} from './dataTokens';

/** All domain token defaults merged — used by defineTheme for validation */
export const domainTokenDefaults: Record<string, string> = {
  ...syntaxTokenDefaults,
  ...dataTokenDefaults,
};

/** Union of all domain token names */
export type DomainTokenName = SyntaxTokenName | DataTokenName;
