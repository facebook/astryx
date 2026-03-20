/**
 * @file registerTokens.ts
 * @input Syntax color defaults from tokens.stylex.ts
 * @output Type augmentation for defineTheme autocomplete
 * @position Type-only module; imported by CodeBlock/CodeEditor for side-effect types
 *
 * Augments the XDSDomainTokens interface so TypeScript provides autocomplete
 * for --color-syntax-* tokens in defineTheme({ tokens: { ... } }).
 *
 * This is types-only — no runtime code. Themes that reference syntax tokens
 * work regardless of whether this module is imported, because themes just
 * write CSS custom properties. This module only improves the DX.
 *
 * SYNC: When adding/removing syntax tokens, update:
 * - /packages/lab/src/CodeBlock/tokens.stylex.ts (defineVars defaults)
 * - /packages/lab/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

import type {syntaxColorDefaults} from './tokens.stylex';

type SyntaxTokenName = keyof typeof syntaxColorDefaults;

declare module '@xds/core/theme' {
  interface XDSDomainTokens {
    syntax: SyntaxTokenName;
  }
}
