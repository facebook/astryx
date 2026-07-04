import {
  createThemeContract,
  defaultThemeContractName,
  getAllCssVars,
  getCssVarsForContracts,
  themeContracts,
  highContrastThemeContracts,
  highContrastThemeContractName,
  cssVarsToStyleBlock,
  type JediThemeContract,
  type ThemeContract,
} from '@jedi/tokens';

export interface JediTheme {
  readonly name: string;
  readonly contract: JediThemeContract;
  getCssVars(mode: 'light' | 'dark'): Record<string, string>;
  toStyleBlock(mode: 'light' | 'dark'): string;
  toStyleTag(mode: 'light' | 'dark', selector?: string): string;
}

export function createTheme(
  name: string = defaultThemeContractName,
  contracts: ThemeContract[] = themeContracts,
): JediTheme {
  const contract = createThemeContract(name, contracts);
  const resolveVars = (mode: 'light' | 'dark') =>
    contracts === themeContracts ? getAllCssVars(mode) : getCssVarsForContracts(contracts, mode);

  return {
    name,
    contract,
    getCssVars: resolveVars,
    toStyleBlock(mode) {
      return cssVarsToStyleBlock(resolveVars(mode));
    },
    toStyleTag(mode, selector = ':root') {
      return `${selector} {\n${cssVarsToStyleBlock(resolveVars(mode))}\n}`;
    },
  };
}

export const defaultTheme = createTheme();
export const highContrastTheme = createTheme(highContrastThemeContractName, highContrastThemeContracts);

export function applyTheme(
  mode: 'light' | 'dark',
  element: HTMLElement = document.documentElement,
  theme: JediTheme = defaultTheme,
): void {
  const vars = theme.getCssVars(mode);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  element.setAttribute('data-jedi-theme', mode);
  element.setAttribute('data-jedi-theme-name', theme.name);
}

export function getThemeMode(element: HTMLElement = document.documentElement): 'light' | 'dark' {
  const mode = element.getAttribute('data-jedi-theme');
  return mode === 'dark' ? 'dark' : 'light';
}

export function toggleTheme(element: HTMLElement = document.documentElement): 'light' | 'dark' {
  const next = getThemeMode(element) === 'light' ? 'dark' : 'light';
  applyTheme(next, element);
  return next;
}

export { defaultThemeContractName, highContrastThemeContractName };
