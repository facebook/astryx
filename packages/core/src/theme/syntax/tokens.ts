/**
 * @file syntaxTokens.ts
 * @input None (pure token definitions)
 * @output syntaxTokenDefaults, SyntaxTokenName
 * @position Domain token sub-module; re-exported from domainTokens/index.ts
 *
 * Code syntax highlighting tokens. Used by the CodeBlock component and any
 * consumer that renders highlighted source code.
 *
 * 14-token architecture validated against 11 community code themes.
 * All themes map cleanly to these 14 slots.
 *
 * @see https://github.com/facebookexperimental/xds/issues/1148
 */

export const syntaxTokenDefaults = {
  // keyword → accent (primary emphasis, control flow: if, return, const)
  '--color-syntax-keyword': 'light-dark(#0064E0, #2694FE)',
  // string → green-text (string literals)
  '--color-syntax-string': 'light-dark(#09441F, #A5F690)',
  // comment → subdued (passive annotations, deliberately muted)
  '--color-syntax-comment': 'light-dark(#4E606F, #6B7D8D)',
  // number → orange-text (warm tone for numeric literals)
  '--color-syntax-number': 'light-dark(#6B2203, #FDB876)',
  // function → blue-text (structural landmarks: function/method names)
  '--color-syntax-function': 'light-dark(#042F97, #AFD7FF)',
  // type → purple-text (type system: interfaces, classes, generics)
  '--color-syntax-type': 'light-dark(#3E0697, #B3B0FE)',
  // variable → text-primary (neutral identifiers, close to body text)
  '--color-syntax-variable': 'light-dark(#0A1317, #DFE2E5)',
  // operator → teal (active syntax: =, +, =>, &&, !==) — separated from comment
  '--color-syntax-operator': 'light-dark(#006D75, #56C8D8)',
  // constant → orange-text (true/false/null, same family as numbers)
  '--color-syntax-constant': 'light-dark(#6B2203, #FDB876)',
  // tag → red-text (HTML/JSX tags: <div>, <Button>)
  '--color-syntax-tag': 'light-dark(#7B0210, #FFB2B8)',
  // attribute → warm amber (HTML/JSX attributes) — separated from number
  '--color-syntax-attribute': 'light-dark(#7A4F1A, #E8C580)',
  // property → cyan-text (object properties, distinct from functions)
  '--color-syntax-property': 'light-dark(#006064, #B2EBF2)',
  // punctuation → muted (brackets, semicolons) — contrast fixed for light mode
  '--color-syntax-punctuation': 'light-dark(#65737E, #6F747C)',
  // background → code block surface color
  '--color-syntax-background': 'light-dark(#FFFFFF, #1A1A1A)',
} as const;

export type SyntaxTokenName = keyof typeof syntaxTokenDefaults;
