import {
  createThemeContract,
  defaultThemeContractName,
  getAllCssVars,
  themeContracts,
  cssVarsToStyleBlock,
  type JediThemeContract,
} from '@jedi/tokens';

export interface JediTheme {
  readonly name: string;
  readonly contract: JediThemeContract;
  getCssVars(mode: 'light' | 'dark'): Record<string, string>;
  toStyleBlock(mode: 'light' | 'dark'): string;
  toStyleTag(mode: 'light' | 'dark', selector?: string): string;
}

export function createTheme(name: string = defaultThemeContractName): JediTheme {
  const contract = createThemeContract(name, themeContracts);
  return {
    name,
    contract,
    getCssVars(mode) {
      return getAllCssVars(mode);
    },
    toStyleBlock(mode) {
      return cssVarsToStyleBlock(getAllCssVars(mode));
    },
    toStyleTag(mode, selector = ':root') {
      return `${selector} {\n${cssVarsToStyleBlock(getAllCssVars(mode))}\n}`;
    },
  };
}

export const defaultTheme = createTheme();

export function applyTheme(
  mode: 'light' | 'dark',
  element: HTMLElement = document.documentElement,
): void {
  const vars = getAllCssVars(mode);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  element.setAttribute('data-jedi-theme', mode);
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

export { defaultThemeContractName };
