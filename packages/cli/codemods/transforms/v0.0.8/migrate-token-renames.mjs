// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate v0.0.6 token names to v0.0.8 final names
 *
 * Handles all token renames from the token spec spreadsheet:
 * - Color palette: --color-{color}-{type} → --color-{type}-{color}
 * - Backgrounds: --color-wash/surface/card/popover/muted → --color-background-*
 * - Text: --color-text-link → --color-text-accent
 * - Media: --color-text-on-dark-media → --color-on-dark
 * - Effects: --color-hover-tint → --color-tint-hover
 * - Status: --color-secondary → --color-neutral
 * - Focus: --color-ring-focus* → --color-accent/error/success/warning
 * - Border: --color-border-strong → --color-border-emphasized
 * - Size: --size-sm/md/lg → --size-element-sm/md/lg
 * - Radius: --radius-0..4 → --radius-none/inner/element/container, --radius-rounded → --radius-full
 * - Shadow: --shadow-base/menu/hover/dialog → --shadow-low/med/high
 * - Shadow inset: --inset-shadow-border-* → --shadow-inset-*
 * - Font family: --font-body/code/heading → --font-family-body/code/heading
 * - Font size: --text-* → --font-size-*
 * - Type scale: --heading-*-size/weight/leading → --text-heading-*-size/weight/leading
 * - Line height: --leading-* → semantic typeScale leading tokens
 *   Also rewrites lineHeightVars → typeScaleVars (imports + member access)
 *
 * ## Line height migration strategy
 *
 * Raw --leading-* tokens are replaced with semantic typeScale leading tokens.
 * The correct mapping depends on the fontSize used alongside the lineHeight.
 * This codemod uses the closest-value match as a default. If the result doesn't
 * look right, manually pick the semantic leading that pairs with your fontSize:
 *
 * | fontSize token (px)            | Correct leading token          | Value  |
 * |-------------------------------|-------------------------------|--------|
 * | --font-size-base (14px)       | --text-body-leading           | 1.4286 |
 * | --font-size-base (14px)       | --text-label-leading          | 1.4286 |
 * | --font-size-sm (12px)         | --text-supporting-leading     | 1.6667 |
 * | --font-size-lg (17px)         | --text-large-leading          | 1.4118 |
 * | --font-size-xs (10px)         | --text-heading-6-leading      | 1.6    |
 * | --font-size-xl (20px)         | --text-heading-2-leading      | 1.4    |
 * | --font-size-2xl (24px)        | --text-heading-1-leading      | 1.3333 |
 */

export const meta = {
  title: 'Migrate token names to v0.0.8 naming convention',
  description:
    'Renames tokens from v0.0.6 intermediate names to final v0.0.8 names per the token spec.',
};

// =============================================================================
// Token string renames (CSS custom property names)
// =============================================================================

/** @type {Record<string, string>} */
const TOKEN_MAP = {
  // Color — Core Semantic
  '--color-secondary': '--color-neutral',
  '--color-info-muted': '--color-background-purple', // removed token, closest purple match
  '--color-info': '--color-icon-purple', // removed token, exact value match (#5B08D8)
  '--color-ring-focus-success': '--color-success',
  '--color-ring-focus-warning': '--color-warning',
  '--color-ring-focus-error': '--color-error',
  '--color-ring-focus': '--color-accent',
  '--color-border-strong': '--color-border-emphasized',

  // Color — Text
  '--color-text-link': '--color-text-accent',
  '--color-text-on-dark-media': '--color-on-dark',

  // Color — Icon
  '--color-icon-on-dark-media': '--color-on-dark',

  // Color — Background
  '--color-wash': '--color-background-body',
  '--color-surface': '--color-background-surface',
  '--color-card': '--color-background-card',
  '--color-popover': '--color-background-popover',
  '--color-muted': '--color-background-muted',

  // Color — Effects
  '--color-hover-tint': '--color-tint-hover',

  // Color — Palette (all 10 colors × 4 types)
  '--color-blue-background': '--color-background-blue',
  '--color-blue-border': '--color-border-blue',
  '--color-blue-icon': '--color-icon-blue',
  '--color-blue-text': '--color-text-blue',
  '--color-cyan-background': '--color-background-cyan',
  '--color-cyan-border': '--color-border-cyan',
  '--color-cyan-icon': '--color-icon-cyan',
  '--color-cyan-text': '--color-text-cyan',
  '--color-gray-background': '--color-background-gray',
  '--color-gray-border': '--color-border-gray',
  '--color-gray-icon': '--color-icon-gray',
  '--color-gray-text': '--color-text-gray',
  '--color-green-background': '--color-background-green',
  '--color-green-border': '--color-border-green',
  '--color-green-icon': '--color-icon-green',
  '--color-green-text': '--color-text-green',
  '--color-orange-background': '--color-background-orange',
  '--color-orange-border': '--color-border-orange',
  '--color-orange-icon': '--color-icon-orange',
  '--color-orange-text': '--color-text-orange',
  '--color-pink-background': '--color-background-pink',
  '--color-pink-border': '--color-border-pink',
  '--color-pink-icon': '--color-icon-pink',
  '--color-pink-text': '--color-text-pink',
  '--color-purple-background': '--color-background-purple',
  '--color-purple-border': '--color-border-purple',
  '--color-purple-icon': '--color-icon-purple',
  '--color-purple-text': '--color-text-purple',
  '--color-red-background': '--color-background-red',
  '--color-red-border': '--color-border-red',
  '--color-red-icon': '--color-icon-red',
  '--color-red-text': '--color-text-red',
  '--color-teal-background': '--color-background-teal',
  '--color-teal-border': '--color-border-teal',
  '--color-teal-icon': '--color-icon-teal',
  '--color-teal-text': '--color-text-teal',
  '--color-yellow-background': '--color-background-yellow',
  '--color-yellow-border': '--color-border-yellow',
  '--color-yellow-icon': '--color-icon-yellow',
  '--color-yellow-text': '--color-text-yellow',

  // Size
  '--size-sm': '--size-element-sm',
  '--size-md': '--size-element-md',
  '--size-lg': '--size-element-lg',

  // Radius
  '--radius-0': '--radius-none',
  '--radius-1': '--radius-inner',
  '--radius-2': '--radius-element',
  '--radius-3': '--radius-container',
  '--radius-4': '--radius-container',
  '--radius-rounded': '--radius-full',

  // Shadow
  '--shadow-base': '--shadow-low',
  '--shadow-menu': '--shadow-low',
  '--shadow-hover': '--shadow-med',
  '--shadow-dialog': '--shadow-high',
  '--inset-shadow-border-hover': '--shadow-inset-hover',
  '--inset-shadow-border-accent': '--shadow-inset-selected',
  '--inset-shadow-border-positive': '--shadow-inset-success',
  '--inset-shadow-border-warning': '--shadow-inset-warning',
  '--inset-shadow-border-negative': '--shadow-inset-error',

  // Font family
  '--font-body': '--font-family-body',
  '--font-code': '--font-family-code',
  '--font-heading': '--font-family-heading',

  // Font size
  '--text-4xs': '--font-size-4xs',
  '--text-3xs': '--font-size-3xs',
  '--text-2xs': '--font-size-2xs',
  '--text-xsm': '--font-size-xs',
  '--text-sm': '--font-size-sm',
  '--text-base': '--font-size-base',
  '--text-lg': '--font-size-lg',
  '--text-xl': '--font-size-xl',
  '--text-2xl': '--font-size-2xl',
  '--text-3xl': '--font-size-3xl',
  '--text-4xl': '--font-size-4xl',
  '--text-5xl': '--font-size-5xl',

  // Line height — closest semantic match by value (see header for manual override guide)
  '--leading-base': '--text-body-leading', // 1.4286 → 1.4286 (exact)
  '--leading-snug': '--text-label-leading', // 1.375 → 1.4286 (closest)
  '--leading-normal': '--text-large-leading', // 1.5 → 1.4118 (closest)
  '--leading-tight': '--text-heading-1-leading', // 1.25 → 1.3333 (closest)
  '--leading-relaxed': '--text-supporting-leading', // 1.625 → 1.6667 (closest)

  // Type scale
  '--heading-1-size': '--text-heading-1-size',
  '--heading-1-weight': '--text-heading-1-weight',
  '--heading-1-leading': '--text-heading-1-leading',
  '--heading-2-size': '--text-heading-2-size',
  '--heading-2-weight': '--text-heading-2-weight',
  '--heading-2-leading': '--text-heading-2-leading',
  '--heading-3-size': '--text-heading-3-size',
  '--heading-3-weight': '--text-heading-3-weight',
  '--heading-3-leading': '--text-heading-3-leading',
  '--heading-4-size': '--text-heading-4-size',
  '--heading-4-weight': '--text-heading-4-weight',
  '--heading-4-leading': '--text-heading-4-leading',
  '--heading-5-size': '--text-heading-5-size',
  '--heading-5-weight': '--text-heading-5-weight',
  '--heading-5-leading': '--text-heading-5-leading',
  '--heading-6-size': '--text-heading-6-size',
  '--heading-6-weight': '--text-heading-6-weight',
  '--heading-6-leading': '--text-heading-6-leading',
};

// =============================================================================
// JS identifier renames (import names, variable references)
// =============================================================================

/** @type {Record<string, string>} */
const IDENTIFIER_MAP = {
  lineHeightVars: 'typeScaleVars',
  lineHeightDefaults: 'typeScaleDefaults',
  lineHeightRaw: 'typeScaleDefaults',
};

// =============================================================================
// Helpers
// =============================================================================

const OLD_TOKENS_PATTERN = new RegExp(
  Object.keys(TOKEN_MAP)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|') + '(?![a-zA-Z0-9_-])',
  'g',
);

function replaceTokens(/** @type {any} */ str) {
  return str.replace(OLD_TOKENS_PATTERN, (/** @type {any} */ match) => TOKEN_MAP[match] || match);
}

// =============================================================================
// Transformer
// =============================================================================

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // --- Pass 1: Rename token strings in string literals ---
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

  // --- Pass 2: Rename token strings in template literals ---
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

  // --- Pass 3: Rename JS identifiers (lineHeightVars → typeScaleVars, etc.) ---
  // Uses Object.hasOwn to avoid prototype pollution (toString, hasOwnProperty, etc.)
  //
  // Special handling for imports: if the target name already exists as an import
  // specifier in the same declaration, remove the old specifier instead of renaming
  // it (avoids duplicate identifier declarations).
  root.find(j.ImportSpecifier).forEach((/** @type {any} */ importPath) => {
    const oldName = importPath.node.imported.name;
    if (!Object.hasOwn(IDENTIFIER_MAP, oldName)) return;

    const newName = IDENTIFIER_MAP[oldName];
    const declaration = importPath.parent.node;
    const siblings = declaration.specifiers || [];
    const targetExists = siblings.some(
      (/** @type {any} */ s) =>
        s !== importPath.node &&
        s.type === 'ImportSpecifier' &&
        s.imported.name === newName,
    );

    if (targetExists) {
      // Target already imported — remove this specifier entirely
      const idx = siblings.indexOf(importPath.node);
      if (idx !== -1) {
        siblings.splice(idx, 1);
        hasChanges = true;
      }
    } else {
      // Safe to rename
      importPath.node.imported.name = newName;
      if (importPath.node.local.name === oldName) {
        importPath.node.local.name = newName;
      }
      hasChanges = true;
    }
  });

  // Rename remaining non-import identifier references
  root.find(j.Identifier).forEach((/** @type {any} */ path) => {
    if (!Object.hasOwn(IDENTIFIER_MAP, path.node.name)) return;
    // Skip import specifiers (already handled above)
    if (path.parent.node.type === 'ImportSpecifier') return;
    path.node.name = IDENTIFIER_MAP[path.node.name];
    hasChanges = true;
  });

  return hasChanges ? root.toSource() : undefined;
}
