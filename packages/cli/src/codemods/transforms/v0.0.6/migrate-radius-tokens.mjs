// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate semantic radius tokens to numeric scale
 *
 * Transforms:
 * - '--radius-inner' → '--radius-0'
 * - '--radius-content' → '--radius-1'
 * - '--radius-element' → '--radius-2'
 * - '--radius-container' → '--radius-3'
 * - '--radius-page' → '--radius-4'
 *
 * Handles:
 * - String literals (e.g. '--radius-container' or 'var(--radius-container)')
 * - Template literal quasis containing the old tokens
 * - Property access (e.g. radiusVars['--radius-container'])
 */

export const meta = {
  title: 'Migrate semantic radius tokens to numeric scale',
  description:
    'Renames --radius-inner/content/element/container/page to --radius-0/1/2/3/4.',
};

/** @type {Record<string, string>} */
const TOKEN_MAP = {
  '--radius-inner': '--radius-0',
  '--radius-content': '--radius-1',
  '--radius-element': '--radius-2',
  '--radius-container': '--radius-3',
  '--radius-page': '--radius-4',
};

// Build a regex that matches any old token name (as a whole token, not substring)
const OLD_TOKENS_PATTERN = new RegExp(
  Object.keys(TOKEN_MAP)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g',
);

function replaceTokens(/** @type {any} */ str) {
  return str.replace(OLD_TOKENS_PATTERN, (/** @type {any} */ match) => TOKEN_MAP[match] || match);
}

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Replace in string literals (StringLiteral or Literal with string value)
  const replaceInStringNode = (/** @type {any} */ path) => {
    if (typeof path.node.value !== 'string') return;
    const original = path.node.value;
    const replaced = replaceTokens(original);
    if (replaced !== original) {
      path.node.value = replaced;
      hasChanges = true;
    }
  };

  root.find(j.StringLiteral).forEach(replaceInStringNode);
  root.find(j.Literal).forEach((/** @type {any} */ path) => {
    if (typeof path.node.value === 'string') {
      replaceInStringNode(path);
    }
  });

  // Replace in template literal quasis
  root.find(j.TemplateLiteral).forEach((/** @type {any} */ path) => {
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
