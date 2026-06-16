#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file generate-compat-aliases.mjs
 * @description Codegen for the XDS-prefix migration compatibility layer
 *   (P2380608025). Appends unprefixed alias re-exports alongside the
 *   existing XDS* exports in component barrel files (index.ts).
 *
 *   Idempotent: strips the old generated block, re-generates from scratch.
 *   Skips aliases whose bare name already exists in the barrel.
 *
 *   Usage:
 *     node scripts/generate-compat-aliases.mjs           # write in place
 *     node scripts/generate-compat-aliases.mjs --check   # exit 1 if stale
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../packages/core/src');
const MARKER_START = '// <compat-aliases:start> — generated, do not edit by hand';
const MARKER_END = '// <compat-aliases:end>';

/** Strip block + line comments from TS source. */
function stripComments(txt) {
  return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
}

/**
 * Parse all export statements from a barrel file into structured entries.
 * Returns [{name, alias?, source, isType}] where `name` is the imported
 * identifier, `alias` is the exported name (if renamed), and `source` is
 * the module specifier string.
 */
function parseExportEntries(txt) {
  const clean = stripComments(txt);
  const entries = [];
  // Matches: export [type] { ... } from '...'
  // Also inline: export { X, type Y } from '...'
  const re = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(clean))) {
    const blockIsType = Boolean(m[1]);
    const specifiers = m[2];
    const source = m[3];
    for (let part of specifiers.split(',')) {
      part = part.trim();
      if (!part) continue;
      let isType = blockIsType;
      if (part.startsWith('type ')) {
        isType = true;
        part = part.slice(5).trim();
      }
      let name, alias;
      if (part.includes(' as ')) {
        [name, alias] = part.split(/\s+as\s+/);
      } else {
        name = part;
        alias = part;
      }
      entries.push({name: name.trim(), alias: alias.trim(), source, isType});
    }
  }
  return entries;
}

/** Compute the bare (unprefixed) name for an XDS* or useXDS* identifier. */
function bareName(id) {
  if (id.startsWith('useXDS')) return 'use' + id.slice(6);
  if (id.startsWith('XDS')) return id.slice(3);
  return null;
}

/**
 * Pre-pass: collect bare (non-XDS) names already exported by ANY barrel.
 * The root barrel uses `export *`, so a generated bare alias that duplicates
 * an existing bare export elsewhere causes TS2308 ambiguity. We skip those.
 */
function collectExistingBareNames() {
  const bare = new Set();
  for (const entry of fs.readdirSync(SRC, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const idx = path.join(SRC, entry.name, 'index.ts');
    if (!fs.existsSync(idx)) continue;
    let raw = fs.readFileSync(idx, 'utf8');
    // Only look at the human-authored part (strip any generated block) so we
    // don't treat previously-generated aliases as "existing".
    if (raw.includes(MARKER_START)) raw = raw.slice(0, raw.indexOf(MARKER_START));
    for (const e of parseExportEntries(raw)) {
      if (!e.alias.startsWith('XDS') && !e.alias.startsWith('useXDS')) {
        bare.add(e.alias);
      }
    }
  }
  return bare;
}

const EXISTING_BARE = collectExistingBareNames();

function generateBlock(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Strip any previous generated block to make this idempotent.
  const base = raw.includes(MARKER_START)
    ? raw.slice(0, raw.indexOf(MARKER_START)).replace(/\n+$/, '\n')
    : raw.replace(/\n+$/, '\n');

  const entries = parseExportEntries(base);
  // Collect all currently-exported names (the alias/exported-as side)
  const existingNames = new Set(entries.map(e => e.alias));

  // Build alias specifiers. Every alias re-exports from the barrel itself
  // ('.') rather than the original source module: by the time this block runs,
  // the prefixed name is already exported by this barrel, and re-exporting from
  // '.' avoids the renamed-re-export problem (e.g. `X as XDSFoo from './src'`
  // where './src' has no member named `XDSFoo`).
  const valueSpecs = [];
  const typeSpecs = [];

  for (const entry of entries) {
    const exported = entry.alias;
    const bare = bareName(exported);
    if (!bare) continue;
    if (existingNames.has(bare)) continue; // skip if bare already exported in THIS barrel
    if (EXISTING_BARE.has(bare)) continue; // skip if bare already exported by ANY barrel (root export * ambiguity)
    const spec = `${exported} as ${bare}`;
    (entry.isType ? typeSpecs : valueSpecs).push(spec);
  }

  // De-dup (a barrel may export the same prefixed name more than once).
  const uniqValue = [...new Set(valueSpecs)].sort();
  const uniqType = [...new Set(typeSpecs)].sort();
  if (uniqValue.length === 0 && uniqType.length === 0) return {base, block: null};

  const lines = [
    '',
    MARKER_START,
    '// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).',
    '// Prefixed names above remain canonical + module-augmentation targets.',
    '// These bare re-exports reference the SAME values/types.',
    '// Regenerate: node scripts/generate-compat-aliases.mjs',
  ];
  if (uniqValue.length) {
    lines.push('export {');
    for (const v of uniqValue) lines.push(`  ${v},`);
    lines.push("} from '.';");
  }
  if (uniqType.length) {
    lines.push('export type {');
    for (const t of uniqType) lines.push(`  ${t},`);
    lines.push("} from '.';");
  }
  lines.push(MARKER_END);
  return {base, block: lines.join('\n') + '\n'};
}

// Main
const check = process.argv.includes('--check');
let updated = 0;
let stale = 0;

for (const entry of fs.readdirSync(SRC, {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const idx = path.join(SRC, entry.name, 'index.ts');
  if (!fs.existsSync(idx)) continue;

  const {base, block} = generateBlock(idx);
  const desired = block ? base + '\n' + block : base;

  const current = fs.readFileSync(idx, 'utf8');
  if (desired !== current) {
    if (check) {
      stale++;
      console.error(`  stale: ${entry.name}/index.ts`);
    } else {
      fs.writeFileSync(idx, desired);
      updated++;
    }
  }
}

if (check) {
  if (stale) {
    console.error(`\n${stale} barrel(s) have stale compat aliases.`);
    console.error('Run: node scripts/generate-compat-aliases.mjs');
    process.exit(1);
  }
  console.log('✓ Compat aliases up to date');
} else {
  console.log(`✓ Compat aliases: ${updated} barrel(s) updated`);
}
