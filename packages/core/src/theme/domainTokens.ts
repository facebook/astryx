/**
 * @file domainTokens.ts
 * @input None (pure token definitions)
 * @output Exports domain token defaults and types for syntax, dataviz, etc.
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
 * SYNC: When adding a new domain, update:
 * - This file (add defaults + type)
 * - /packages/core/src/theme/defineTheme.ts (add to XDSTokenName union)
 * - /packages/core/src/theme/index.ts (re-export)
 */

// =============================================================================
// Syntax Highlighting
// =============================================================================

export const syntaxTokenDefaults = {
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

export type SyntaxTokenName = keyof typeof syntaxTokenDefaults;

// =============================================================================
// Data Visualization (planned)
// =============================================================================

// export const datavizTokenDefaults = {
//   '--color-dataviz-primary': 'light-dark(#0064E0, #2694FE)',
//   '--color-dataviz-secondary': 'light-dark(#50a14f, #98c379)',
//   // ...
// } as const;
//
// export type DatavizTokenName = keyof typeof datavizTokenDefaults;

// =============================================================================
// Aggregate
// =============================================================================

/** All domain token defaults merged — used by defineTheme for validation */
export const domainTokenDefaults: Record<string, string> = {
  ...syntaxTokenDefaults,
  // ...datavizTokenDefaults,  // uncomment when added
};

/** Union of all domain token names */
export type DomainTokenName = SyntaxTokenName; // | DatavizTokenName
