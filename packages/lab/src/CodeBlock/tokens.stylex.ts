/**
 * @file tokens.stylex.ts
 * @input None
 * @output Exports syntax highlighting color tokens as StyleX variables
 * @position Token definitions; consumed by highlightStyles.ts and themes
 *
 * These tokens are domain-specific to code rendering. They're defined separately
 * from core tokens so they're tree-shakeable — importing XDSCodeBlock doesn't
 * pull core's token bundle, and not importing it means zero cost.
 *
 * Themes can override these via defineTheme({ tokens: { '--color-syntax-*': ... } })
 * because themes just write CSS custom properties — they don't need the defineVars
 * instance. The raw var names match what ::highlight() CSS references.
 */

import * as stylex from '@stylexjs/stylex';

export const syntaxColorDefaults = {
  '--color-syntax-keyword': 'light-dark(#a626a4, #c678dd)',
  '--color-syntax-string': 'light-dark(#50a14f, #98c379)',
  '--color-syntax-comment': 'light-dark(#a0a1a7, #5c6370)',
  '--color-syntax-number': 'light-dark(#986801, #d19a66)',
  '--color-syntax-function': 'light-dark(#4078f2, #61afef)',
  '--color-syntax-type': 'light-dark(#a626a4, #e5c07b)',
  '--color-syntax-variable': 'light-dark(#0A1317, #DFE2E5)',
  '--color-syntax-operator': 'light-dark(#4E606F, #AAAFB5)',
  '--color-syntax-constant': 'light-dark(#986801, #d19a66)',
  '--color-syntax-tag': 'light-dark(#e45649, #e06c75)',
  '--color-syntax-attribute': 'light-dark(#986801, #d19a66)',
  '--color-syntax-property': 'light-dark(#4078f2, #61afef)',
  '--color-syntax-punctuation': 'light-dark(#A4B0BC, #6F747C)',
} as const;

export const syntaxColorVars = stylex.defineVars(syntaxColorDefaults);
