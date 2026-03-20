/**
 * @file highlightStyles.ts
 * @input None
 * @output Injects ::highlight() CSS rules into the document head
 * @position Shared utility; consumed by XDSCodeBlock and XDSCodeEditor
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/tokens.stylex.ts (syntax color token names)
 */

const HIGHLIGHT_STYLES = `
::highlight(xds-keyword)     { color: var(--color-syntax-keyword); }
::highlight(xds-string)      { color: var(--color-syntax-string); }
::highlight(xds-comment)     { color: var(--color-syntax-comment); }
::highlight(xds-number)      { color: var(--color-syntax-number); }
::highlight(xds-function)    { color: var(--color-syntax-function); }
::highlight(xds-type)        { color: var(--color-syntax-type); }
::highlight(xds-tag)         { color: var(--color-syntax-tag); }
::highlight(xds-attribute)   { color: var(--color-syntax-attribute); }
::highlight(xds-property)    { color: var(--color-syntax-property); }
::highlight(xds-operator)    { color: var(--color-syntax-operator); }
::highlight(xds-constant)    { color: var(--color-syntax-constant); }
::highlight(xds-punctuation) { color: var(--color-syntax-punctuation); }
::highlight(xds-variable)    { color: var(--color-syntax-variable); }
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
