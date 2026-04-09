/**
 * @file highlightStyles.ts
 * @input Syntax token defaults from domainTokens
 * @output Injects ::highlight() CSS rules + fallback token values into the document head
 * @position Shared utility; consumed by XDSCodeBlock and XDSCodeEditor
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/domainTokens/syntaxTokens.ts (syntax color token names/defaults)
 */

import {syntaxTokenDefaults} from '../theme';

/**
 * Build the fallback CSS custom properties from the syntax token defaults.
 * These provide colors when no theme explicitly sets --color-syntax-* tokens.
 * Themes override these via higher-specificity [data-xds-theme] selectors.
 */
const FALLBACK_TOKENS = `:root {\n${Object.entries(syntaxTokenDefaults)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join('\n')}\n}`;

/**
 * Scoped ::highlight() rules — constrained to .xds-codeblock and .xds-codeeditor
 * so the browser only checks highlight ranges within code components, not the
 * entire document tree. See: Fabio's perf feedback on bare ::highlight() selectors.
 */
const HIGHLIGHT_STYLES = `
${FALLBACK_TOKENS}

.xds-codeblock ::highlight(xds-keyword),
.xds-codeeditor ::highlight(xds-keyword)     { color: var(--color-syntax-keyword); }
.xds-codeblock ::highlight(xds-string),
.xds-codeeditor ::highlight(xds-string)      { color: var(--color-syntax-string); }
.xds-codeblock ::highlight(xds-comment),
.xds-codeeditor ::highlight(xds-comment)     { color: var(--color-syntax-comment); }
.xds-codeblock ::highlight(xds-number),
.xds-codeeditor ::highlight(xds-number)      { color: var(--color-syntax-number); }
.xds-codeblock ::highlight(xds-function),
.xds-codeeditor ::highlight(xds-function)    { color: var(--color-syntax-function); }
.xds-codeblock ::highlight(xds-type),
.xds-codeeditor ::highlight(xds-type)        { color: var(--color-syntax-type); }
.xds-codeblock ::highlight(xds-tag),
.xds-codeeditor ::highlight(xds-tag)         { color: var(--color-syntax-tag); }
.xds-codeblock ::highlight(xds-attribute),
.xds-codeeditor ::highlight(xds-attribute)   { color: var(--color-syntax-attribute); }
.xds-codeblock ::highlight(xds-property),
.xds-codeeditor ::highlight(xds-property)    { color: var(--color-syntax-property); }
.xds-codeblock ::highlight(xds-operator),
.xds-codeeditor ::highlight(xds-operator)    { color: var(--color-syntax-operator); }
.xds-codeblock ::highlight(xds-constant),
.xds-codeeditor ::highlight(xds-constant)    { color: var(--color-syntax-constant); }
.xds-codeblock ::highlight(xds-punctuation),
.xds-codeeditor ::highlight(xds-punctuation) { color: var(--color-syntax-punctuation); }
.xds-codeblock ::highlight(xds-variable),
.xds-codeeditor ::highlight(xds-variable)    { color: var(--color-syntax-variable); }

/* Span-based fallback classes — used when highlightMode='spans' or
   when the CSS Custom Highlight API is not available. */
.xds-token-keyword     { color: var(--color-syntax-keyword); }
.xds-token-string      { color: var(--color-syntax-string); }
.xds-token-comment     { color: var(--color-syntax-comment); }
.xds-token-number      { color: var(--color-syntax-number); }
.xds-token-function    { color: var(--color-syntax-function); }
.xds-token-type        { color: var(--color-syntax-type); }
.xds-token-tag         { color: var(--color-syntax-tag); }
.xds-token-attribute   { color: var(--color-syntax-attribute); }
.xds-token-property    { color: var(--color-syntax-property); }
.xds-token-operator    { color: var(--color-syntax-operator); }
.xds-token-constant    { color: var(--color-syntax-constant); }
.xds-token-punctuation { color: var(--color-syntax-punctuation); }
.xds-token-variable    { color: var(--color-syntax-variable); }
`;

let inserted = false;

/**
 * Injects the ::highlight() CSS rules into the document <head>.
 * Safe to call multiple times — only injects once.
 */
export function ensureHighlightStyles(): void {
  if (inserted) return;
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.setAttribute('data-xds-highlight-styles', '');
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
  inserted = true;
}

/**
 * Token types that map to highlight names.
 * Used to create CSS.highlights entries with `xds-` prefix.
 */
export const TOKEN_TYPES = [
  'keyword',
  'string',
  'comment',
  'number',
  'function',
  'type',
  'tag',
  'attribute',
  'property',
  'operator',
  'constant',
  'punctuation',
  'variable',
] as const;
