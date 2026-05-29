// Copyright (c) Meta Platforms, Inc. and affiliates.

import {COMPONENT_VAR_TO_OVERRIDE, COMPONENT_VAR_NAMES} from './constants';

export function parseLightDark(
  value: string,
): {light: string; dark: string} | null {
  const match = value.match(/^light-dark\(([^,]+),\s*([^)]+)\)$/);
  if (match) {
    return {light: match[1].trim(), dark: match[2].trim()};
  }
  return null;
}

export function parseColorWithAlpha(
  value: string,
): {hex: string; alpha: number} | null {
  const hex8Match = value.match(/^#([0-9A-Fa-f]{8})$/);
  if (hex8Match) {
    const hex = '#' + hex8Match[1].slice(0, 6);
    const alpha = parseInt(hex8Match[1].slice(6, 8), 16) / 255;
    return {hex, alpha: Math.round(alpha * 100) / 100};
  }
  const hex6Match = value.match(/^#([0-9A-Fa-f]{6})$/);
  if (hex6Match) {
    return {hex: value, alpha: 1};
  }
  const hex3Match = value.match(/^#([0-9A-Fa-f]{3})$/);
  if (hex3Match) {
    const r = hex3Match[1][0];
    const g = hex3Match[1][1];
    const b = hex3Match[1][2];
    return {hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 1};
  }
  const rgbaMatch = value.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
    const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    return {hex: `#${r}${g}${b}`, alpha};
  }
  return null;
}

export function colorWithAlphaToString(hex: string, alpha: number): string {
  if (alpha >= 1) {
    return hex.toUpperCase();
  }
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`.toUpperCase();
}

export function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\bbackground /gi, '')
    .replace(/\b\w/g, c => c.toUpperCase());
}

type ComponentStyleMap = Record<string, Record<string, Record<string, string>>>;

export function buildComponentOverrides(
  componentTokens: Record<string, string>,
): ComponentStyleMap {
  const components: ComponentStyleMap = {};
  for (const [varName, value] of Object.entries(componentTokens)) {
    const mappings = COMPONENT_VAR_TO_OVERRIDE[varName];
    if (!mappings) {
      continue;
    }
    for (const {component, cssProperty} of mappings) {
      components[component] ??= {};
      components[component].base ??= {};
      components[component].base[cssProperty] = value;
    }
  }
  return components;
}

export interface CustomOverrideEntry {
  component: string;
  property: string;
  value: string;
}

export function generateThemeCode(
  themeName: string,
  tokens: Record<string, string>,
  allDefaults: Record<string, string>,
  typeScaleBase: number,
  typeScaleRatio: number,
  customOverrides: CustomOverrideEntry[] = [],
): string {
  const changedTokens: Record<string, string> = {};
  const changedComponentTokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (allDefaults[key] !== value) {
      if (COMPONENT_VAR_NAMES.has(key)) {
        changedComponentTokens[key] = value;
      } else {
        changedTokens[key] = value;
      }
    }
  }

  const components = buildComponentOverrides(changedComponentTokens);
  for (const override of customOverrides) {
    components[override.component] ??= {};
    components[override.component].base ??= {};
    components[override.component].base[override.property] = override.value;
  }

  const lines: string[] = [
    "import {defineTheme} from '@xds/core/theme';",
    '',
    `export const ${themeName}Theme = defineTheme({`,
    `  name: '${themeName}',`,
  ];

  if (typeScaleBase !== 14 || typeScaleRatio !== 1.2) {
    lines.push('  typography: {');
    lines.push(
      `    scale: {base: ${typeScaleBase}, ratio: ${typeScaleRatio}},`,
    );
    lines.push('  },');
  }

  if (Object.keys(changedTokens).length > 0) {
    lines.push('  tokens: {');
    for (const [key, value] of Object.entries(changedTokens)) {
      lines.push(`    '${key}': '${value}',`);
    }
    lines.push('  },');
  }

  if (Object.keys(components).length > 0) {
    lines.push('  components: {');
    for (const [comp, rules] of Object.entries(components)) {
      lines.push(`    '${comp}': {`);
      for (const [selector, props] of Object.entries(rules)) {
        lines.push(`      '${selector}': {`);
        for (const [prop, val] of Object.entries(props)) {
          const escapedProp = prop.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          const escapedVal = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          lines.push(`        '${escapedProp}': '${escapedVal}',`);
        }
        lines.push('      },');
      }
      lines.push('    },');
    }
    lines.push('  },');
  }

  lines.push('});');
  return lines.join('\n');
}
