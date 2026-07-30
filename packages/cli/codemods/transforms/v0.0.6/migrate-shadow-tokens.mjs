// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate elevation tokens to shadow semantic naming
 *
 * Outer shadows (semantic categories):
 *   --elevation-base   → --shadow-base
 *   --elevation-menu   → --shadow-menu
 *   --elevation-hover  → --shadow-hover
 *   --elevation-dialog → --shadow-dialog
 *
 * Also handles brief numeric naming (shadow-1/2/3/4):
 *   --shadow-1 → --shadow-base
 *   --shadow-2 → --shadow-menu
 *   --shadow-3 → --shadow-hover
 *   --shadow-4 → --shadow-dialog
 *
 * Inset shadows (semantic states):
 *   --elevation-input-hover         → --inset-shadow-border-hover
 *   --elevation-input-hover-success → --inset-shadow-border-positive
 *   --elevation-input-hover-warning → --inset-shadow-border-warning
 *   --elevation-input-hover-error   → --inset-shadow-border-negative
 *
 * JS identifier renames:
 *   elevationDefaults → shadowDefaults
 *   elevationVars     → shadowVars
 *   elevationRaw      → shadowRaw
 *   ElevationVarName  → ShadowVarName
 */

export const meta = {
  title: 'Migrate elevation tokens to shadow semantic naming',
  description:
    'Renames --elevation-* to --shadow-base/menu/hover/dialog and --inset-shadow-border-*. Also migrates --shadow-1/2/3/4 from the brief numeric naming period.',
};

/** @type {Record<string, string>} */
const TOKEN_MAP = {
  '--elevation-input-hover-success': '--inset-shadow-border-positive',
  '--elevation-input-hover-warning': '--inset-shadow-border-warning',
  '--elevation-input-hover-error': '--inset-shadow-border-negative',
  '--elevation-input-hover': '--inset-shadow-border-hover',
  '--elevation-base': '--shadow-base',
  '--elevation-menu': '--shadow-menu',
  '--elevation-hover': '--shadow-hover',
  '--elevation-dialog': '--shadow-dialog',
  '--shadow-1': '--shadow-base',
  '--shadow-2': '--shadow-menu',
  '--shadow-3': '--shadow-hover',
  '--shadow-4': '--shadow-dialog',
};

/** @type {Record<string, string>} */
const IDENTIFIER_MAP = {
  elevationDefaults: 'shadowDefaults',
  elevationVars: 'shadowVars',
  elevationRaw: 'shadowRaw',
  ElevationVarName: 'ShadowVarName',
};

const OLD_TOKENS_PATTERN = new RegExp(
  Object.keys(TOKEN_MAP)
    .sort((a, b) => b.length - a.length)
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
    if (typeof path.node.value === 'string') replaceInStringNode(path);
  });

  root.find(j.TemplateLiteral).forEach((/** @type {any} */ path) => {
    for (const quasi of path.node.quasis) {
      const originalRaw = quasi.value.raw;
      const replacedRaw = replaceTokens(originalRaw);
      if (replacedRaw !== originalRaw) {
        quasi.value.raw = replacedRaw;
        quasi.value.cooked = replaceTokens(quasi.value.cooked);
        hasChanges = true;
      }
    }
  });

  root.find(j.Identifier).forEach((/** @type {any} */ path) => {
    if (Object.hasOwn(IDENTIFIER_MAP, path.node.name)) {
      path.node.name = IDENTIFIER_MAP[path.node.name];
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
