/**
 * @file registerTokens.ts
 * @input Syntax color defaults from tokens.stylex.ts
 * @output Registers syntax tokens with core's defineTheme validation
 * @position Side-effect module; imported by CodeBlock/CodeEditor on first use
 *
 * This module does two things:
 * 1. Augments the XDSDomainTokens interface so TypeScript knows about
 *    --color-syntax-* tokens in defineTheme({ tokens: { ... } })
 * 2. Calls registerDomainTokens() to suppress "unknown token" warnings
 *
 * SYNC: When adding/removing syntax tokens, update:
 * - /packages/lab/src/CodeBlock/tokens.stylex.ts (defineVars defaults)
 * - /packages/lab/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

import {registerDomainTokens} from '@xds/core/theme';
import {syntaxColorDefaults} from './tokens.stylex';

// ---------------------------------------------------------------------------
// Type augmentation — gives defineTheme({ tokens }) autocomplete for syntax tokens
// ---------------------------------------------------------------------------

type SyntaxTokenName = keyof typeof syntaxColorDefaults;

declare module '@xds/core/theme' {
  interface XDSDomainTokens {
    syntax: SyntaxTokenName;
  }
}

// ---------------------------------------------------------------------------
// Runtime registration — prevents "unknown token" warnings in defineTheme
// ---------------------------------------------------------------------------

registerDomainTokens(syntaxColorDefaults);
