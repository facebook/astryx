#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-token-docs.mjs
 * @description Generates the tokens namespace (tree/tokens.doc.mjs), one child
 *   guide per token category (tree/tokens-<key>.doc.mjs), the thin overview
 *   (tokens.doc.mjs), and a hand-written usage section, from the sources of
 *   truth: packages/core/src/theme/tokens.stylex.ts, plus the domain tokens in
 *   packages/core/src/theme/domainTokens/dataTokens.ts (data visualization) and
 *   packages/core/src/theme/syntax/tokens.ts (code syntax).
 *
 * Run: node scripts/generate-token-docs.mjs
 * CI:  `node scripts/generate-token-docs.mjs --check` fails on drift.
 */

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
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
const TOKENS_DOC = resolve(ROOT, 'packages/cli/assets/docs/token-tables.doc.mjs');
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
      'Colors for charts and graphs: one categorical accent per series, a neutral for labels and reference lines, and sequential ramps from 5 (darkest) to 1 (lightest) for ordered scales and heatmaps. Import their public StyleX variables from @astryxdesign/core/theme/dataTokens.stylex.',
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
// 2. Build per-category child docs and collect sections for overview
// ---------------------------------------------------------------------------

const totalTokens = groups.reduce(
  (sum, g) => sum + extractDefaults(g.exportName, g.file).length,
  0,
);

/** @type {Array<{slug: string, output: string, path: string, tokenCount: number}>} */
const childFiles = [];

let order = 10;
for (const group of groups) {
  const pairs = extractDefaults(group.exportName, group.file);
  if (pairs.length === 0) continue;

  const rows = pairs.map(([name, value]) => group.formatRow(name, value));
  const slug = `tokens-${keyToSlug(group.key)}`;

  /** @type {import('@astryxdesign/cli/authoring').ReferenceContentBlock[]} */
  const content = [
    {type: 'prose', text: group.description},
    {type: 'table', headers: group.headers, rows},
  ];

  const section = {title: group.title, content};
  if (group.previewType) section.previewType = group.previewType;

  const childDoc = {
    type: 'generic',
    name: slug,
    title: group.title,
    placement: {parent: 'namespace:tokens', slot: 'guides', order},
    category: 'foundations',
    description: group.description,
    keywords: ['design tokens', 'css variables', group.key],
    sections: [section],
  };

  const childOutput = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = ${JSON.stringify(childDoc, null, 2)};
`;

  childFiles.push({
    slug,
    output: childOutput,
    path: resolve(TREE_DIR, `${slug}.doc.mjs`),
    tokenCount: pairs.length,
  });

  order += 10;
}

// ---------------------------------------------------------------------------
// 3. Build the namespace doc
// ---------------------------------------------------------------------------

const namespaceDoc = {
  type: 'namespace',
  name: 'tokens',
  title: 'All Tokens',
  summary:
    'Complete reference for color, data visualization, syntax, spacing, size, border, focus, radius, shadow, motion, and typography tokens.',
  keywords: ['design tokens', 'css variables', 'custom properties'],
  slots: {
    guides: {title: 'Token Categories', accepts: {kinds: ['generic']}},
  },
};

const namespaceOutput = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Run: node scripts/generate-token-docs.mjs
// Total: ${totalTokens} tokens across ${groups.length} categories.

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = ${JSON.stringify(namespaceDoc, null, 2)};
`;

const namespacePath = resolve(TREE_DIR, 'tokens.doc.mjs');

// ---------------------------------------------------------------------------
// 4. Build a usage child (hand-written content, generated file)
// ---------------------------------------------------------------------------

const usageSlug = 'tokens-usage';
const usageDoc = {
  type: 'generic',
  name: usageSlug,
  title: 'Usage in StyleX',
  placement: {parent: 'namespace:tokens', slot: 'guides', order},
  category: 'foundations',
  description:
    'How to import and use token variables in StyleX styles.',
  keywords: ['StyleX', 'import', 'colorVars', 'spacingVars', 'sizeVars'],
  sections: [
    {
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
          text: 'See {@link namespace:styling} for how to apply tokens via xstyle, className, and compound component patterns. See {@link generic:author-a-theme} for overriding tokens with defineTheme.',
        },
      ],
    },
  ],
};

const usageOutput = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = ${JSON.stringify(usageDoc, null, 2)};
`;

const usagePath = resolve(TREE_DIR, `${usageSlug}.doc.mjs`);

// ---------------------------------------------------------------------------
// 5. Build the flat token-tables reference (for token-ref resolution)
// ---------------------------------------------------------------------------

// token-ref blocks in other docs (color, spacing, etc.) resolve topics
// from the flat doc catalog. The tree children are not in that catalog.
// Keep a flat doc with all sections so token-ref inlining keeps working.
const flatSections = [];
for (const group of groups) {
  const pairs = extractDefaults(group.exportName, group.file);
  if (pairs.length === 0) continue;
  const rows = pairs.map(([name, value]) => group.formatRow(name, value));
  const content = [
    {type: 'prose', text: group.description},
    {type: 'table', headers: group.headers, rows},
  ];
  const sec = {title: group.title, content};
  if (group.previewType) sec.previewType = group.previewType;
  flatSections.push(sec);
}

const flatOutput = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts,
//   dataTokens.stylex.ts, and syntax/tokens.ts
// Run: node scripts/generate-token-docs.mjs
// Total: ${totalTokens} tokens across ${groups.length} categories.
//
// This flat doc exists for token-ref resolution only; the user-facing
// navigation lives in tree/tokens.doc.mjs (namespace) and its children.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = ${JSON.stringify(
  {
    name: 'token-tables',
    title: 'Token Tables',
    category: 'foundations',
    description:
      'Internal token reference used by token-ref blocks in other docs.',
    keywords: ['design tokens', 'css variables', 'custom properties'],
    sections: flatSections,
  },
  null,
  2,
)};
`;

const flatPath = TOKENS_DOC;

// ---------------------------------------------------------------------------
// 6. Write output (or check for drift)
// ---------------------------------------------------------------------------

const isCheck = process.argv.includes('--check');

/** @type {Array<{path: string, output: string, label: string}>} */
const allFiles = [
  {path: flatPath, output: flatOutput, label: 'tokens.doc.mjs (token-ref source)'},
  {path: namespacePath, output: namespaceOutput, label: 'tree/tokens.doc.mjs (namespace)'},
  ...childFiles.map(f => ({
    path: f.path,
    output: f.output,
    label: `tree/${f.slug}.doc.mjs (${f.tokenCount} tokens)`,
  })),
  {path: usagePath, output: usageOutput, label: `tree/${usageSlug}.doc.mjs (usage)`},
];

if (isCheck) {
  let failed = false;
  for (const {path: filePath, output, label} of allFiles) {
    let existing = '';
    try {
      existing = readFileSync(filePath, 'utf-8');
    } catch {
      console.error(`✗ ${label} does not exist. Run: node scripts/generate-token-docs.mjs`);
      failed = true;
      continue;
    }
    if (existing !== output) {
      console.error(`✗ ${label} is out of date. Run: node scripts/generate-token-docs.mjs`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log(`✓ All token docs are up to date (${totalTokens} tokens, ${allFiles.length} files)`);
} else {
  for (const {path: filePath, output, label} of allFiles) {
    writeFileSync(filePath, output);
  }
  console.log(
    `✓ Generated ${allFiles.length} token doc files (${totalTokens} tokens)`,
  );
  for (const {label} of allFiles) {
    console.log(`  ${label}`);
  }
}
