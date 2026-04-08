/**
 * @file syntaxTokens.ts
 * @input None (pure token definitions)
 * @output syntaxTokenDefaults, SyntaxTokenName
 * @position Domain token sub-module; re-exported from domainTokens/index.ts
 *
 * Code syntax highlighting tokens. Used by the CodeBlock component and any
 * consumer that renders highlighted source code.
 */

export const syntaxTokenDefaults = {
  // keyword → accent (primary emphasis, control flow)
  '--color-syntax-keyword': 'light-dark(#0064E0, #2694FE)',
  // string → green-text
  '--color-syntax-string': 'light-dark(#09441F, #A5F690)',
  // comment → text-secondary (de-emphasized)
  '--color-syntax-comment': 'light-dark(#4E606F, #AAAFB5)',
  // number → orange-text (warm tone for constants)
  '--color-syntax-number': 'light-dark(#6B2203, #FDB876)',
  // function → blue-text (structural landmarks)
  '--color-syntax-function': 'light-dark(#042F97, #AFD7FF)',
  // type → purple-text (type system, interfaces)
  '--color-syntax-type': 'light-dark(#3E0697, #B3B0FE)',
  // variable → text-primary (neutral body text)
  '--color-syntax-variable': 'light-dark(#0A1317, #DFE2E5)',
  // operator → text-secondary
  '--color-syntax-operator': 'light-dark(#4E606F, #AAAFB5)',
  // constant → orange-text (true/false/null, same family as numbers)
  '--color-syntax-constant': 'light-dark(#6B2203, #FDB876)',
  // tag → red-text (HTML/JSX tags)
  '--color-syntax-tag': 'light-dark(#7B0210, #FFB2B8)',
  // attribute → orange-text (HTML/JSX attributes)
  '--color-syntax-attribute': 'light-dark(#6B2203, #FDB876)',
  // property → cyan-text (object properties, distinct from functions)
  '--color-syntax-property': 'light-dark(#006064, #B2EBF2)',
  // punctuation → text-disabled (most de-emphasized)
  '--color-syntax-punctuation': 'light-dark(#A4B0BC, #6F747C)',
} as const;

export type SyntaxTokenName = keyof typeof syntaxTokenDefaults;
