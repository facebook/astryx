export type TokenTier = 'core' | 'semantic' | 'component';

export type TokenValue = string | number;

export interface TokenDefinition {
  name: string;
  value: TokenValue | Record<string, TokenValue>;
  tier: TokenTier;
  description?: string;
  references?: string;
}

export interface ThemeContract {
  mode: 'light' | 'dark';
  semantic: Record<string, string>;
}

export const CSS_VAR_PREFIX = 'jedi';

export function tokenToCssVar(name: string): string {
  return `--${CSS_VAR_PREFIX}-${name.replace(/\./g, '-')}`;
}

export function flattenTokens(
  tokens: Record<string, TokenValue>,
  prefix = '',
): Record<string, TokenValue> {
  const result: Record<string, TokenValue> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value as Record<string, TokenValue>, path));
    } else {
      result[path] = value as TokenValue;
    }
  }
  return result;
}

export function tokensToCssVars(
  flat: Record<string, TokenValue>,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(flat)) {
    vars[tokenToCssVar(name)] = String(value);
  }
  return vars;
}

export function cssVarsToStyleBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}

export function validateTokenName(name: string): boolean {
  return /^[a-z][a-z0-9]*(\.[a-z0-9]+)*$/.test(name);
}

export function validateTokenDefinition(token: TokenDefinition): string[] {
  const errors: string[] = [];
  if (!validateTokenName(token.name)) {
    errors.push(`Invalid token name: ${token.name}`);
  }
  if (!['core', 'semantic', 'component'].includes(token.tier)) {
    errors.push(`Invalid tier: ${token.tier}`);
  }
  return errors;
}
