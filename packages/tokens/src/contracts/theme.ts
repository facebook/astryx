import type { ThemeContract } from '../types';

/**
 * Theme contract — defines what a @jedi/themes implementation must provide.
 * Themes map semantic tokens to CSS variables per mode.
 */
export interface JediThemeContract {
  readonly name: string;
  readonly modes: readonly ('light' | 'dark')[];
  getSemanticTokens(mode: 'light' | 'dark'): Record<string, string>;
}

export function createThemeContract(
  name: string,
  contracts: ThemeContract[],
): JediThemeContract {
  const modeMap = new Map(contracts.map((c) => [c.mode, c.semantic]));
  return {
    name,
    modes: contracts.map((c) => c.mode) as ('light' | 'dark')[],
    getSemanticTokens(mode: 'light' | 'dark') {
      const tokens = modeMap.get(mode);
      if (!tokens) {
        throw new Error(`Theme "${name}" has no semantic tokens for mode: ${mode}`);
      }
      return tokens;
    },
  };
}

export const defaultThemeContractName = 'jedi-default';
