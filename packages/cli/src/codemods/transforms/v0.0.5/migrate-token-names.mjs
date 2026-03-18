/**
 * @file Codemod: Migrate renamed design tokens from v0.0.5 naming audit
 *
 * Renames all tokens updated in the naming audit:
 *
 * Color — semantic clarity:
 * - '--color-accent-deemphasized' → '--color-accent-muted'
 * - '--color-accent-text' → '--color-text-link'
 * - '--color-deemphasized' → '--color-muted'
 * - '--color-positive' → '--color-success'
 * - '--color-positive-deemphasized' → '--color-success-muted'
 * - '--color-negative' → '--color-error'
 * - '--color-negative-deemphasized' → '--color-error-muted'
 * - '--color-educational' → '--color-info'
 * - '--color-educational-deemphasized' → '--color-info-muted'
 * - '--color-warning-deemphasized' → '--color-warning-muted'
 *
 * Color — noun-first grammar:
 * - '--color-hover-overlay' → '--color-overlay-hover'
 * - '--color-pressed-overlay' → '--color-overlay-pressed'
 * - '--color-disabled-overlay' → '--color-overlay-disabled'
 * - '--color-focus-outline' → '--color-ring-focus'
 * - '--color-focus-outline-error' → '--color-ring-focus-error'
 * - '--color-focus-outline-success' → '--color-ring-focus-success'
 * - '--color-focus-outline-warning' → '--color-ring-focus-warning'
 *
 * Color — border/divider:
 * - '--color-divider' → '--color-border'
 * - '--color-divider-high-contrast' → '--color-border-strong'
 * - '--color-divider-emphasized' → '--color-border-emphasized'
 *
 * Color — effects:
 * - '--color-glimmer' → '--color-skeleton'
 * - '--color-glimmer-high-contrast' → '--color-skeleton-strong'
 * - '--color-shadow-elevation' → '--color-shadow'
 *
 * Color — media:
 * - '--color-text-on-media' → '--color-text-on-dark-media'
 * - '--color-icon-on-media' → '--color-icon-on-dark-media'
 *
 * Color — removals (replaced by existing tokens):
 * - '--color-text-placeholder' → '--color-text-secondary'
 * - '--color-icon-tertiary' → '--color-icon-secondary'
 *
 * Note: --color-accent is NOT renamed (kept as-is to avoid ambiguity
 * with --color-text-primary and --color-icon-primary).
 *
 * Handles:
 * - String literals (e.g. '--color-accent' or 'var(--color-accent)')
 * - Template literal quasis containing old tokens
 * - Property access (e.g. colorVars['--color-accent'])
 */

export const meta = {
  title: 'Migrate renamed design tokens',
  description:
    'Renames color tokens from the v0.0.5 naming audit (positive→success, negative→error, divider→border, etc.).',
};

// Ordered longest-first to prevent partial matches
// (e.g. --color-educational-deemphasized must match before --color-educational)
const TOKEN_MAP = {
  '--color-educational-deemphasized': '--color-info-muted',
  '--color-glimmer-high-contrast': '--color-skeleton-strong',
  '--color-divider-high-contrast': '--color-border-strong',
  '--color-focus-outline-success': '--color-ring-focus-success',
  '--color-focus-outline-warning': '--color-ring-focus-warning',
  '--color-negative-deemphasized': '--color-error-muted',
  '--color-positive-deemphasized': '--color-success-muted',
  '--color-warning-deemphasized': '--color-warning-muted',
  '--color-accent-deemphasized': '--color-accent-muted',
  '--color-focus-outline-error': '--color-ring-focus-error',
  '--color-divider-emphasized': '--color-border-emphasized',
  '--color-disabled-overlay': '--color-overlay-disabled',
  '--color-shadow-elevation': '--color-shadow',
  '--color-text-placeholder': '--color-text-secondary',
  '--color-pressed-overlay': '--color-overlay-pressed',
  '--color-focus-outline': '--color-ring-focus',
  '--color-hover-overlay': '--color-overlay-hover',
  '--color-icon-on-media': '--color-icon-on-dark-media',
  '--color-icon-tertiary': '--color-icon-secondary',
  '--color-text-on-media': '--color-text-on-dark-media',
  '--color-deemphasized': '--color-muted',
  '--color-accent-text': '--color-text-link',
  '--color-educational': '--color-info',
  '--color-negative': '--color-error',
  '--color-positive': '--color-success',
  '--color-divider': '--color-border',
  '--color-glimmer': '--color-skeleton',
};

// Build a regex that matches any old token name, longest first.
// Uses negative lookahead for word-like chars to avoid partial matches
// (e.g. --color-accent must not match inside --color-accent-deemphasized).
const OLD_TOKENS_PATTERN = new RegExp(
  Object.keys(TOKEN_MAP)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|') + '(?![a-zA-Z0-9_-])',
  'g',
);

function replaceTokens(str) {
  return str.replace(OLD_TOKENS_PATTERN, (match) => TOKEN_MAP[match] || match);
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Replace in string literals (StringLiteral or Literal with string value)
  const replaceInStringNode = (path) => {
    if (typeof path.node.value !== 'string') return;
    const original = path.node.value;
    const replaced = replaceTokens(original);
    if (replaced !== original) {
      path.node.value = replaced;
      hasChanges = true;
    }
  };

  root.find(j.StringLiteral).forEach(replaceInStringNode);
  root.find(j.Literal).forEach((path) => {
    if (typeof path.node.value === 'string') {
      replaceInStringNode(path);
    }
  });

  // Replace in template literal quasis
  root.find(j.TemplateLiteral).forEach((path) => {
    for (const quasi of path.node.quasis) {
      const original = quasi.value.raw;
      const replaced = replaceTokens(original);
      if (replaced !== original) {
        quasi.value.raw = replaced;
        quasi.value.cooked = replaceTokens(quasi.value.cooked);
        hasChanges = true;
      }
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
