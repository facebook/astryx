/**
 * @file domainTokens/index.ts
 * @input None (re-exports sub-modules)
 * @output domainTokenDefaults, DomainTokenName
 * @position Token aggregator; consumed by defineTheme for validation + autocomplete
 *
 * Merges all domain token defaults into a single map for defineTheme.
 * Actual token definitions live in their own directories (syntax/, dataviz/).
 */

export {syntaxTokenDefaults} from '../syntax/tokens';
export type {SyntaxTokenName} from '../syntax/tokens';

export {dataTokenDefaults} from './dataTokens';
export type {DataTokenName} from './dataTokens';

import {syntaxTokenDefaults} from '../syntax/tokens';
import {dataTokenDefaults} from './dataTokens';
import type {SyntaxTokenName} from '../syntax/tokens';
import type {DataTokenName} from './dataTokens';

/** All domain token defaults merged — used by defineTheme for validation */
export const domainTokenDefaults: Record<string, string> = {
  ...syntaxTokenDefaults,
  ...dataTokenDefaults,
};

/** Union of all domain token names */
export type DomainTokenName = SyntaxTokenName | DataTokenName;
