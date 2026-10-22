#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-token-docs.mjs
 * @description Generates the all-tokens guide (tree/all-tokens.doc.mjs,
 *   `astryx docs foundations/all-tokens`): one section per token category,
 *   plus a hand-written usage section, from the sources of truth:
 *   packages/core/src/theme/tokens.stylex.ts, plus the domain tokens in
 *   packages/core/src/theme/domainTokens/dataTokens.ts (data visualization) and
 *   packages/core/src/theme/syntax/tokens.ts (code syntax).
 *
 * Each token is written once, in its category's section, so every value has
 * one home. A Foundations page shows its table with a token reference
 * (`{type: 'token-ref', topic: 'foundations/all-tokens', section: 'Color Tokens'}`),
 * which reads that section here.
 *
 * Run: node scripts/generate-token-docs.mjs
 * CI:  `node scripts/generate-token-docs.mjs --check` fails on drift, and on a
 *      generated tokens guide (or its translation overlay) that no category
 *      writes any more.
 */

import {readFileSync, readdirSync, unlinkSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS_SRC = resolve(ROOT, 'packages/core/src/theme/tokens.stylex.ts');
const DATA_TOKENS_SRC = resolve(
  ROOT,
  'packages/core/src/theme/dataTokens.stylex.ts',
);
const SYNTAX_TOKENS_SRC = resolve(
  ROOT,
  'packages/core/src/theme/syntax/tokens.ts',
);
const TREE_DIR = resolve(ROOT, 'packages/cli/assets/docs/tree');

// ---------------------------------------------------------------------------
// 1. Parse token groups from source
// ---------------------------------------------------------------------------

/** Each source file's text, read once. */
const sources = new Map();

/** @param {string} file */
function sourceText(file) {
  if (!sources.has(file)) sources.set(file, readFileSync(file, 'utf-8'));
  return sources.get(file);
}

/**
 * Extract key-value pairs from a `const xxxDefaults = { ... } as const;` block.
 * Returns array of [tokenName, defaultValue].
 * @param {string} name
 * @param {string} [file] the source that exports it (default tokens.stylex.ts)
 */
function extractDefaults(name, file = TOKENS_SRC) {
  const src = sourceText(file);
  // Match: `[export] const <name> = {` ... `} as const;`
  const re = new RegExp(
    `(?:export\\s+)?const ${name}\\s*=\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}\\s*as const`,
    's',
  );
  const m = src.match(re);
  if (!m) return [];

  const body = m[1];
  const pairs = [];
  // Match quoted values from each defaults entry.
  const entryRe = /'(--[^']+)':\s*'([^']*)'/g;
  let em;
  while ((em = entryRe.exec(body)) !== null) {
    pairs.push([em[1], em[2]]);
  }
  return pairs;
}

/**
 * A `light-dark(<light>, <dark>)` value as its two halves. Splits at the
 * comma at nesting depth 0, so a half that holds its own commas, such as
 * `rgba(0, 0, 0, 0.1)`, stays whole. Anything else is the same in both modes.
 * @param {string} name
 * @param {string} value
 * @returns {[string, string, string]}
 */
function lightDarkRow(name, value) {
  const inner = value.match(/^light-dark\((.*)\)$/s)?.[1];
  let depth = 0;
  for (let i = 0; inner != null && i < inner.length; i++) {
    const c = inner[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      return [name, inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
  }
  return [name, value, value];
}

/**
 * Convert a camelCase key to a kebab-case file-safe slug.
 * @param {string} key
 * @returns {string}
 */
function keyToSlug(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Map of group name → { exportName, file?, title, description, headers } */
const groups = [
  {
    key: 'color',
    previewType: 'swatch',
    exportName: 'colorDefaults',
    title: 'Color Tokens',
    description:
      'Semantic colors for consistent theming. All colors use light-dark() for automatic mode switching.',
    headers: ['Token', 'Light', 'Dark'],
    formatRow: lightDarkRow,
  },
  {
    key: 'data',
    previewType: 'swatch',
    exportName: 'dataTokenDefaults',
    file: DATA_TOKENS_SRC,
    title: 'Data Visualization Tokens',
    description:
      'Colors for charts and graphs: one categorical accent per series, a neutral for labels and reference lines, and sequential ramps from 5 (darkest) to 1 (lightest) for ordered scales and heatmaps. Import dataVars from @astryxdesign/core/theme/dataTokens.stylex for CSS-capable code. Source compilation emits the complete 56-variable group when any member is retained and none for an unused graph. Prebuilt CSS consumers load @astryxdesign/core/astryx.css, which defines the complete group for the already-compiled dataVars entry.',
    headers: ['Token', 'Light', 'Dark'],
    formatRow: lightDarkRow,
  },
  {
    key: 'syntax',
    previewType: 'swatch',
    exportName: 'syntaxTokenDefaults',
    file: SYNTAX_TOKENS_SRC,
    title: 'Syntax Tokens',
    description:
      'Code highlighting colors used by CodeBlock. Each defaults to a palette token, so syntax colors follow the theme; defineTheme({syntax}) sets a syntax theme instead.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'spacing',
    previewType: 'spacing-bar',
    exportName: 'spacingDefaults',
    title: 'Spacing Tokens',
    description:
      'Spacing scale used for padding, gap, and margin. Component gap props map spacing steps to these tokens.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'size',
    previewType: 'size-bar',
    exportName: 'sizeDefaults',
    title: 'Size Tokens',
    description:
      'Control heights for consistent sizing across buttons, inputs, and selectors.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'border',
    previewType: 'border-line',
    exportName: 'borderDefaults',
    title: 'Border Tokens',
    description: 'Border width for card and input borders.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'focus',
    exportName: 'focusDefaults',
    title: 'Focus Tokens',
    description:
      'The keyboard focus ring, shared by every component that draws one. Override these to restyle focus across the system.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'radius',
    previewType: 'radius-box',
    exportName: 'radiusDefaults',
    title: 'Radius Tokens',
    description:
      "Numeric scale based on a 4dp base unit. Tokens scale with the theme's radius multiplier; --radius-none and --radius-full are fixed.",
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'shadow',
    previewType: 'shadow-box',
    exportName: 'shadowDefaults',
    title: 'Shadow Tokens',
    description:
      'Elevation shadows (low to med to high) and inset shadows for input state rings.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'duration',
    previewType: 'duration-bar',
    exportName: 'durationDefaults',
    title: 'Duration Tokens',
    description:
      'Motion duration primitives. Three bands: fast (micro-interactions), medium (entrance/exit), slow (continuous). Min/max variants derive from base × ratio.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'ease',
    previewType: 'easing-curve',
    exportName: 'easeDefaults',
    title: 'Easing Tokens',
    description: 'Easing curves for animations and transitions.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'typography',
    previewType: 'font-sample',
    exportName: 'typographyDefaults',
    title: 'Font Family Tokens',
    description: 'Font family stacks for body, code, and heading text.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'textSize',
    previewType: 'font-sample',
    exportName: 'textSizeDefaults',
    title: 'Font Size Tokens',
    description:
      'Geometric type scale: round(14 × 1.2^step). Base is 14px (--font-size-base).',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'fontWeight',
    previewType: 'font-sample',
    exportName: 'fontWeightDefaults',
    title: 'Font Weight Tokens',
    description: 'Font weight values for body, emphasis, and headings.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
  {
    key: 'typeScale',
    previewType: 'font-sample',
    exportName: 'typeScaleDefaults',
    title: 'Type Scale Tokens',
    description:
      'Semantic tokens for headings, body, labels, code, supporting text, and display text. References font size and weight tokens. Override via typography.scale in defineTheme.',
    headers: ['Token', 'Value'],
    formatRow: (name, value) => [name, value],
  },
];

// ---------------------------------------------------------------------------
// 2. Build one section per category
// ---------------------------------------------------------------------------

const totalTokens = groups.reduce(
  (sum, g) => sum + extractDefaults(g.exportName, g.file).length,
  0,
);

/** @type {object[]} */
const sections = [];
let categories = 0;
for (const group of groups) {
  const pairs = extractDefaults(group.exportName, group.file);
  if (pairs.length === 0) continue;
  categories++;
  const rows = pairs.map(([name, value]) => group.formatRow(name, value));
  /** @type {import('@astryxdesign/cli/authoring').ReferenceContentBlock[]} */
  const content = [
    {type: 'prose', text: group.description},
    {type: 'table', headers: group.headers, rows},
  ];
  const section = {title: group.title, content};
  if (group.previewType) section.previewType = group.previewType;
  sections.push(section);
}

// ---------------------------------------------------------------------------
// 3. The usage section (hand-written content, generated file)
// ---------------------------------------------------------------------------

sections.push({
  title: 'Usage in StyleX',
  content: [
    {
      type: 'code',
      lang: 'tsx',
      label: 'Using token imports',
      code: `import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, sizeVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
  },
  series: {
    color: dataVars['--color-data-categorical-blue'],
  },
  button: {
    height: sizeVars['--size-element-md'],
  },
});`,
    },
    {
      type: 'prose',
      text: 'Use `dataVars` for StyleX, DOM styles, and SVG presentation attributes. Canvas and other APIs that require concrete mode-resolved values use `resolveThemeToken()` or `useTheme().token()` instead. Raw CSS may use the stable custom-property names only when compiled dataVars output is guaranteed or the declaration carries an explicit fallback. See {@link namespace:style-components} for xstyle, className, and compound component patterns, and {@link generic:author-a-theme} for overriding tokens with defineTheme.',
    },
  ],
});

// ---------------------------------------------------------------------------
// 4. The all-tokens guide
// ---------------------------------------------------------------------------

const DOC_NAME = 'all-tokens';
const allTokensDoc = {
  type: 'generic',
  name: DOC_NAME,
  title: 'All tokens',
  placement: {parent: 'namespace:foundations', slot: 'guides', order: 100},
  category: 'foundations',
  description:
    'Every token in one table per category: color, data visualization, syntax, spacing, size, border, focus, radius, shadow, motion, and typography.',
  keywords: [
    'design tokens',
    'css variables',
    'custom properties',
    'token table',
    'all tokens',
  ],
  sections,
};

const docOutput = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs
// Total: ${totalTokens} tokens across ${categories} categories.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = ${JSON.stringify(allTokensDoc, null, 2)};
`;

// ---------------------------------------------------------------------------
// 5. Write output (or check for drift)
// ---------------------------------------------------------------------------

const isCheck = process.argv.includes('--check');

/** @type {Array<{path: string, output: string, label: string}>} */
const allFiles = [
  {
    path: resolve(TREE_DIR, `${DOC_NAME}.doc.mjs`),
    output: docOutput,
    label: `tree/${DOC_NAME}.doc.mjs (${totalTokens} tokens)`,
  },
];

// A generated tokens doc this script no longer writes (the tokens namespace
// and its per-category guides, which all-tokens replaced, or a renamed one),
// or a translation overlay whose doc is gone: a reader would still find it, so
// check mode fails on it and a write removes it.
const written = new Set(allFiles.map(f => f.path));
const treeFiles = readdirSync(TREE_DIR).filter(file =>
  /^(?:all-)?tokens(?:-[\w-]+)?\.doc(?:\.(?:dense|zh))?\.mjs$/.test(file),
);
const orphanGuides = treeFiles
  .filter(file => /\.doc\.mjs$/.test(file))
  .map(file => resolve(TREE_DIR, file))
  .filter(
    filePath =>
      !written.has(filePath) &&
      readFileSync(filePath, 'utf-8').includes('AUTO-GENERATED'),
  );
const orphans = [
  ...orphanGuides,
  ...treeFiles
    .filter(file => /\.doc\.(?:dense|zh)\.mjs$/.test(file))
    .map(file => resolve(TREE_DIR, file))
    .filter(filePath => {
      const base = filePath.replace(/\.doc\.(?:dense|zh)\.mjs$/, '.doc.mjs');
      return (
        orphanGuides.includes(base) ||
        !treeFiles.includes(base.slice(TREE_DIR.length + 1))
      );
    }),
];

if (isCheck) {
  let failed = false;
  for (const filePath of orphans) {
    console.error(
      `✗ ${filePath.slice(ROOT.length + 1)} is not written by any token category. Run: node scripts/generate-token-docs.mjs`,
    );
    failed = true;
  }
  for (const {path: filePath, output, label} of allFiles) {
    let existing = '';
    try {
      existing = readFileSync(filePath, 'utf-8');
    } catch {
      console.error(
        `✗ ${label} does not exist. Run: node scripts/generate-token-docs.mjs`,
      );
      failed = true;
      continue;
    }
    if (existing !== output) {
      console.error(
        `✗ ${label} is out of date. Run: node scripts/generate-token-docs.mjs`,
      );
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log(
    `✓ All token docs are up to date (${totalTokens} tokens, ${allFiles.length} files)`,
  );
} else {
  for (const {path: filePath, output} of allFiles) {
    writeFileSync(filePath, output);
  }
  for (const filePath of orphans) {
    unlinkSync(filePath);
    console.log(`  removed ${filePath.slice(ROOT.length + 1)}`);
  }
  console.log(
    `✓ Generated ${allFiles.length} token doc files (${totalTokens} tokens)`,
  );
  for (const {label} of allFiles) {
    console.log(`  ${label}`);
  }
}
