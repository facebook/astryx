#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @file generate-token-docs.mjs
 * @description Generates packages/cli/docs/tokens.doc.mjs from the source of
 *   truth: packages/core/src/theme/tokens.stylex.ts
 *
 * Run: node scripts/generate-token-docs.mjs
 * CI:  Add to lint or build to catch drift.
 *
 * Reads the *Defaults export objects from tokens.stylex.ts, groups them by
 * category, and writes a ReferenceDoc-shaped .doc.mjs file.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS_SRC = resolve(
  ROOT,
  'packages/core/src/theme/tokens.stylex.ts',
);
const TOKENS_DOC = resolve(ROOT, 'packages/cli/docs/tokens.doc.mjs');

// ---------------------------------------------------------------------------
// 1. Parse token groups from source
// ---------------------------------------------------------------------------

const src = readFileSync(TOKENS_SRC, 'utf-8');

/**
 * Extract key-value pairs from a `const xxxDefaults = { ... } as const;` block.
 * Returns array of [tokenName, defaultValue].
 */
function extractDefaults(name) {
  // Match: `export const <name> = {` ... `} as const;`
  const re = new RegExp(
    `export const ${name}\\s*=\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}\\s*as const`,
    's',
  );
  const m = src.match(re);
  if (!m) return [];

  const body = m[1];
  const pairs = [];
  // Match lines like: '--token-name': 'value',  or  '--token-name': '...',
  // Also handles multi-line values (e.g. shadow tokens with commas inside)
  const lineRe = /^\s*'(--[^']+)':\s*'([^']*(?:'[^']*'[^']*)*)',?\s*$/;
  // Simpler: match  '--key': 'value'  or  '--key': "value"  on each entry
  const entryRe = /'(--[^']+)':\s*'([^']*)'/g;
  let em;
  while ((em = entryRe.exec(body)) !== null) {
    pairs.push([em[1], em[2]]);
  }
  return pairs;
}

/** Map of group name → { exportName, title, description, headers } */
const groups = [
  {
    key: 'color',
    previewType: 'swatch',
    exportName: 'colorDefaults',
    title: 'Color Tokens',
    description:
      'Semantic colors for consistent theming. All colors use light-dark() for automatic mode switching.',
    headers: ['Token', 'Light', 'Dark'],
    formatRow(name, value) {
      const ldMatch = value.match(
        /^light-dark\(([^,]+),\s*([^)]+)\)$/,
      );
      if (ldMatch) return [name, ldMatch[1].trim(), ldMatch[2].trim()];
      return [name, value, value];
    },
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
// 2. Build sections
// ---------------------------------------------------------------------------

const sections = [];

for (const group of groups) {
  const pairs = extractDefaults(group.exportName);
  if (pairs.length === 0) continue;

  const rows = pairs.map(([name, value]) => group.formatRow(name, value));

  /** @type {import('../../core/src/docs-types').ContentBlock[]} */
  const content = [
    {type: 'prose', text: group.description},
    {type: 'table', headers: group.headers, rows},
  ];

  const section = {title: group.title, content};
  if (group.previewType) section.previewType = group.previewType;
  sections.push(section);
}

// Add a usage section at the end (hand-written, not generated)
sections.push({
  title: 'Usage in StyleX',
  content: [
    {
      type: 'code',
      lang: 'tsx',
      label: 'Using token imports',
      code: `import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, sizeVars, radiusVars} from '@xds/core';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
  },
  button: {
    height: sizeVars['--size-element-md'],
  },
});`,
    },
    {
      type: 'prose',
      text: "See `npx astryx docs styling` for how to apply tokens via xstyle, className, and compound component patterns. See `npx astryx docs theme` for overriding tokens with defineTheme.",
    },
  ],
});

// ---------------------------------------------------------------------------
// 3. Write output (or check for drift)
// ---------------------------------------------------------------------------

const isCheck = process.argv.includes('--check');

// Count total tokens for the header comment
const totalTokens = groups.reduce(
  (sum, g) => sum + extractDefaults(g.exportName).length,
  0,
);

const output = `\
// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts
// Run: node scripts/generate-token-docs.mjs
// Total: ${totalTokens} tokens across ${groups.length} categories.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = ${JSON.stringify(
  {
    name: 'tokens',
    title: 'All Tokens',
    category: 'foundations',
    description:
      'Complete reference for spacing, color, radius, typography, shadow, motion, and size tokens.',
    sections,
  },
  null,
  2,
)};
`;

if (isCheck) {
  // CI mode: compare generated output to existing file
  let existing = '';
  try {
    existing = readFileSync(TOKENS_DOC, 'utf-8');
  } catch {
    console.error('✗ tokens.doc.mjs does not exist. Run: node scripts/generate-token-docs.mjs');
    process.exit(1);
  }
  if (existing !== output) {
    console.error('✗ tokens.doc.mjs is out of date. Run: node scripts/generate-token-docs.mjs');
    process.exit(1);
  }
  console.log(`✓ tokens.doc.mjs is up to date (${totalTokens} tokens)`);
} else {
  writeFileSync(TOKENS_DOC, output);
  const lineCount = output.split('\n').length;
  console.log(
    `✓ Generated ${TOKENS_DOC} (${totalTokens} tokens, ${lineCount} lines)`,
  );
}
