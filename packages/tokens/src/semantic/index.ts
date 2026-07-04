import { color, spacing, radius, font, elevation } from '../core';
import type { ThemeContract } from '../types';

export const semanticLight = {
  surface: {
    primary: color.white,
    secondary: color.gray[50],
    tertiary: color.gray[100],
    inverse: color.gray[900],
  },
  text: {
    primary: color.gray[900],
    secondary: color.gray[600],
    tertiary: color.gray[400],
    inverse: color.white,
    link: color.blue[600],
  },
  border: {
    subtle: color.gray[200],
    default: color.gray[300],
    strong: color.gray[400],
  },
  focus: {
    ring: color.blue[500],
  },
  interactive: {
    hover: color.gray[100],
  },
  status: {
    success: color.green[600],
    warning: color.amber[500],
    error: color.red[600],
  },
} as const;

export const semanticDark = {
  surface: {
    primary: color.gray[950],
    secondary: color.gray[900],
    tertiary: color.gray[800],
    inverse: color.gray[50],
  },
  text: {
    primary: color.gray[50],
    secondary: color.gray[400],
    tertiary: color.gray[500],
    inverse: color.gray[900],
    link: color.blue[400],
  },
  border: {
    subtle: color.gray[800],
    default: color.gray[700],
    strong: color.gray[600],
  },
  focus: {
    ring: color.blue[400],
  },
  interactive: {
    hover: color.gray[800],
  },
  status: {
    success: color.green[500],
    warning: color.amber[500],
    error: color.red[500],
  },
} as const;

export const semanticHighContrastLight = {
  surface: {
    primary: color.white,
    secondary: color.gray[100],
    tertiary: color.gray[200],
    inverse: color.black,
  },
  text: {
    primary: color.black,
    secondary: color.gray[700],
    tertiary: color.gray[600],
    inverse: color.white,
    link: color.blue[700],
  },
  border: {
    subtle: color.gray[400],
    default: color.gray[600],
    strong: color.gray[800],
  },
  focus: {
    ring: color.blue[700],
  },
  interactive: {
    hover: color.gray[200],
  },
  status: {
    success: color.green[600],
    warning: color.amber[500],
    error: color.red[600],
  },
} as const;

export const semanticHighContrastDark = {
  surface: {
    primary: color.black,
    secondary: color.gray[900],
    tertiary: color.gray[800],
    inverse: color.white,
  },
  text: {
    primary: color.white,
    secondary: color.gray[300],
    tertiary: color.gray[400],
    inverse: color.black,
    link: color.blue[400],
  },
  border: {
    subtle: color.gray[600],
    default: color.gray[500],
    strong: color.gray[300],
  },
  focus: {
    ring: color.blue[400],
  },
  interactive: {
    hover: color.gray[700],
  },
  status: {
    success: color.green[500],
    warning: color.amber[500],
    error: color.red[500],
  },
} as const;

export const semantic = {
  light: semanticLight,
  dark: semanticDark,
} as const;

export const component = {
  button: {
    paddingX: spacing[4],
    paddingY: spacing[2],
    radius: radius.md,
    fontSize: font.size[200],
    fontWeight: font.weight.medium,
  },
  input: {
    paddingX: spacing[3],
    paddingY: spacing[2],
    radius: radius.md,
    fontSize: font.size[200],
  },
  card: {
    padding: spacing[6],
    radius: radius.lg,
    shadow: elevation.shadow.md,
  },
} as const;

export const themeContracts: ThemeContract[] = [
  { mode: 'light', semantic: flattenSemantic(semanticLight) },
  { mode: 'dark', semantic: flattenSemantic(semanticDark) },
];

export const highContrastThemeContracts: ThemeContract[] = [
  { mode: 'light', semantic: flattenSemantic(semanticHighContrastLight) },
  { mode: 'dark', semantic: flattenSemantic(semanticHighContrastDark) },
];

export const highContrastThemeContractName = 'jedi-high-contrast';

function flattenSemantic(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[path] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenSemantic(value as Record<string, unknown>, path));
    }
  }
  return result;
}

export function getSemantic(mode: 'light' | 'dark') {
  return semantic[mode];
}

export function getComponent() {
  return component;
}
