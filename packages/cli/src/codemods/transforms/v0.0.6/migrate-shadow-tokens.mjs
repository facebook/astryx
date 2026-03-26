/**
 * @file Codemod: Migrate elevation tokens to shadow semantic naming
 *
 * Outer shadows (semantic categories):
 *   --elevation-base   → --shadow-low
 *   --elevation-menu   → --shadow-low
 *   --elevation-hover  → --shadow-med
 *   --elevation-dialog → --shadow-high
 *
 * Also handles brief numeric naming (shadow-1/2/3/4):
 *   --shadow-1 → --shadow-low
 *   --shadow-2 → --shadow-low
 *   --shadow-3 → --shadow-med
 *   --shadow-4 → --shadow-high
 *
 * Inset shadows (semantic states):
 *   --elevation-input-hover         → --shadow-inset-hover
 *   --elevation-input-hover-success → --shadow-inset-success
 *   --elevation-input-hover-warning → --shadow-inset-warning
 *   --elevation-input-hover-error   → --shadow-inset-error
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
    'Renames --elevation-* to --shadow-low/menu/hover/dialog and --inset-shadow-border-*. Also migrates --shadow-1/2/3/4 from the brief numeric naming period.',
};

const TOKEN_MAP = {
  '--elevation-input-hover-success': '--shadow-inset-success',
  '--elevation-input-hover-warning': '--shadow-inset-warning',
  '--elevation-input-hover-error': '--shadow-inset-error',
  '--elevation-input-hover': '--shadow-inset-hover',
  '--elevation-base': '--shadow-low',
  '--elevation-menu': '--shadow-low',
  '--elevation-hover': '--shadow-med',
  '--elevation-dialog': '--shadow-high',
  '--shadow-1': '--shadow-low',
  '--shadow-2': '--shadow-low',
  '--shadow-3': '--shadow-med',
  '--shadow-4': '--shadow-high',
};

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

function replaceTokens(str) {
  return str.replace(OLD_TOKENS_PATTERN, (match) => TOKEN_MAP[match] || match);
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

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
    if (typeof path.node.value === 'string') replaceInStringNode(path);
  });

  root.find(j.TemplateLiteral).forEach((path) => {
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

  root.find(j.Identifier).forEach((path) => {
    if (Object.hasOwn(IDENTIFIER_MAP, path.node.name)) {
      path.node.name = IDENTIFIER_MAP[path.node.name];
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
