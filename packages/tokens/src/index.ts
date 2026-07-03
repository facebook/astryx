export { core, resolveCoreValue } from './core';
export type { CoreTokens } from './core';
export {
  semantic,
  semanticLight,
  semanticDark,
  component,
  themeContracts,
  getSemantic,
  getComponent,
} from './semantic';
export {
  createThemeContract,
  defaultThemeContractName,
} from './contracts/theme';
export type { JediThemeContract } from './contracts/theme';
export {
  CSS_VAR_PREFIX,
  tokenToCssVar,
  flattenTokens,
  tokensToCssVars,
  cssVarsToStyleBlock,
  validateTokenName,
  validateTokenDefinition,
} from './types';
export type { TokenTier, TokenValue, TokenDefinition, ThemeContract } from './types';

import { core } from './core';
import { component, getSemantic, semantic } from './semantic';
import {
  flattenTokens,
  tokensToCssVars,
  tokenToCssVar,
} from './types';

export function getCoreCssVars(): Record<string, string> {
  const flat = flattenTokens(core as unknown as Record<string, string | number>);
  return tokensToCssVars(flat);
}

export function getSemanticCssVars(mode: 'light' | 'dark'): Record<string, string> {
  const flat = flattenTokens(
    getSemantic(mode) as unknown as Record<string, string | number>,
    'semantic',
  );
  return tokensToCssVars(flat);
}

export function getComponentCssVars(): Record<string, string> {
  const flat = flattenTokens(
    component as unknown as Record<string, string | number>,
    'component',
  );
  return tokensToCssVars(flat);
}

export function getAllCssVars(mode: 'light' | 'dark'): Record<string, string> {
  return {
    ...getCoreCssVars(),
    ...getSemanticCssVars(mode),
    ...getComponentCssVars(),
  };
}

export function resolveToken(path: string, mode: 'light' | 'dark' = 'light'): string | undefined {
  const coreFlat = flattenTokens(core as unknown as Record<string, string | number>);
  if (path in coreFlat) return String(coreFlat[path]);

  const semanticFlat = flattenTokens(
    getSemantic(mode) as unknown as Record<string, string | number>,
    'semantic',
  );
  if (path in semanticFlat) return String(semanticFlat[path]);

  const componentFlat = flattenTokens(
    component as unknown as Record<string, string | number>,
    'component',
  );
  if (path in componentFlat) return String(componentFlat[path]);

  return undefined;
}

