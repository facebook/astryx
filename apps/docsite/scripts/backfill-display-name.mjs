#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file backfill-display-name.mjs
 *
 * One-time codemod that adds a `displayName` field to every doc file in
 * the monorepo (`.doc.mjs` under packages/cli/templates and packages/{core,lab}/src).
 *
 * Why: the docsite gallery + sidebar previously derived a human-readable
 * version of each component name at render time via a regex. Joey called
 * out (PR #2376) that hardcoded vanity names beat regex hacks, so we now
 * require an explicit `displayName` on every doc file. This script backfills
 * the field across all existing doc files so the convention can be enforced.
 *
 * Behavior:
 *   - Finds every `.doc.mjs` file under packages/cli/templates and
 *     packages/{core,lab}/src.
 *   - Reads the file, extracts the `name:` literal.
 *   - Skips files that already declare a `displayName:` field.
 *   - Skips files that have no `name:` field at all (unlikely but safe).
 *   - Otherwise inserts a `displayName:` line right after the `name:` line:
 *     - When `name` already contains a space (e.g. 'Blank Page'), use it
 *       verbatim.
 *     - When `name` starts with `use` followed by a capital (hook naming
 *       convention, e.g. `useMediaQuery`), keep the `use` prefix lowercased
 *       and space the rest: `use media query`.
 *     - Otherwise treat as PascalCase / camelCase and space-separate the
 *       words while preserving capitalization
 *       (`ChatMessageMetadata` -> `Chat Message Metadata`,
 *        `Button`         -> `XDS Button`).
 *
 * Run from the repo root:
 *   node apps/docsite/scripts/backfill-display-name.mjs
 *
 * The script is idempotent (re-runs are no-ops on files that already have
 * `displayName`). Reviewers should eyeball the resulting diff and tweak
 * any awkward output manually — the value is a starting point, not a
 * final design decision.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCSITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DOCSITE_ROOT, '..', '..');

const SCAN_ROOTS = [
  path.join(REPO_ROOT, 'packages', 'cli', 'templates'),
  path.join(REPO_ROOT, 'packages', 'core', 'src'),
  path.join(REPO_ROOT, 'packages', 'lab', 'src'),
];

/**
 * Recursively collect every .doc.mjs under a root.
 */
function findDocFiles(root, out = []) {
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and __tests__
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      findDocFiles(full, out);
    } else if (entry.name.endsWith('.doc.mjs')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Produce a human-readable display name from an identifier:
 *  - If the name already contains a space, return it verbatim.
 *  - If it's a hook (`useFoo` — starts with lowercase `use` followed by an
 *    uppercase letter), keep it as-is. Hooks read better as the actual
 *    identifier ("useMediaQuery") than spaced ("use Media Query"), matching
 *    React's own docs convention.
 *  - Otherwise treat as PascalCase / camelCase, insert spaces between
 *    word boundaries while preserving capitalization:
 *    `ChatMessageMetadata` -> `Chat Message Metadata`.
 *    `Button`           -> `XDS Button`.
 */
function deriveDisplayName(name) {
  if (!name) return name;
  if (name.includes(' ')) return name;
  if (/^use[A-Z]/.test(name)) return name;
  return name
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

// Match every `name:` line that is the first field of an object literal —
// the line directly precedes other fields with the same or deeper indent,
// and the next sibling line is NOT already a `displayName:`. We do not
// try to be a full JS parser; these files are small and conventionally
// formatted (always `name: 'Foo',` on its own line).
//
// We also DO need to handle subcomponent / hook entries that live inside
// `components: [...]` arrays in a parent .doc.mjs (e.g. AlertDialog has
// AlertDialog + useImperativeAlertDialog as nested entries). The
// generator's `requireDisplayName` validator reads `displayName` from
// each subcomponent at runtime, so each nested object needs the field too.
//
// Strategy: find every `name: '...'` line, check the next non-blank line,
// and if it's not already `displayName:` (and isn't a sibling that
// would tell us we're inside a `props:` / `params:` block where the
// `name` is a prop name, not a component name), insert `displayName`.
//
// To avoid false-positives on prop / param / anatomy entries (which all
// have `name:` fields too), we only add `displayName` when:
//   - The matched line's parent object is at indent 0, 2, or 4 spaces
//     (the conventional indentation for component/subcomponent entries).
//   - The line's `name` value matches a React component / hook identifier
//     pattern (PascalCase, camelCase starting with `use`, or already
//     contains a space). Prop names like 'isOpen', 'onAction', 'width'
//     are camelCase but rarely match the PascalCase test, so we err on
//     the side of also matching camelCase identifiers that start with a
//     capital letter.
const NAME_LINE_RE = /^([\t ]*)name:\s*['"]([^'"]+)['"],?\s*$/gm;
const DISPLAY_NAME_LINE_RE = /^\s*displayName:\s*['"][^'"]+['"],?\s*$/;

/**
 * Heuristic: does this look like a component / hook / template name (vs
 * a prop, param, anatomy, or keyword entry)?
 */
function looksLikeComponentName(name) {
  // Multi-word names (e.g. "Blank Page") are always component / template
  // display names.
  if (name.includes(' ')) return true;
  // PascalCase identifiers (`Button`, `AlertDialog`, `AlertDialog`).
  if (/^[A-Z][A-Za-z0-9]*$/.test(name)) return true;
  // Hook identifiers (`useFoo`, `useFoo`).
  if (/^use[A-Z][A-Za-z0-9]*$/.test(name)) return true;
  return false;
}

let updated = 0;
let unchanged = 0;
const issues = [];

for (const root of SCAN_ROOTS) {
  const files = findDocFiles(root);
  for (const file of files) {
    let contents = fs.readFileSync(file, 'utf-8');

    // Collect all match positions first so we can splice without
    // invalidating subsequent indices.
    const inserts = []; // [{after: number, text: string}]

    NAME_LINE_RE.lastIndex = 0;
    let match;
    while ((match = NAME_LINE_RE.exec(contents)) !== null) {
      const [whole, indent, name] = match;
      if (!looksLikeComponentName(name)) continue;

      // Check the next line: skip if it's already a `displayName:`.
      const afterIdx = match.index + whole.length;
      const nextNewline = contents.indexOf('\n', afterIdx + 1);
      const nextLine = contents.slice(
        afterIdx + 1,
        nextNewline === -1 ? contents.length : nextNewline,
      );
      if (DISPLAY_NAME_LINE_RE.test(nextLine)) continue;

      const displayName = deriveDisplayName(name);
      // Escape backslashes first, then single quotes, so a name like
      // `O\Brien` becomes `O\\Brien` (one source backslash → two-char
      // escape) and `it's` becomes `it\'s`. Doing this in the other
      // order would double-escape any backslash the second pass adds.
      const escapedDisplayName = displayName
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
      inserts.push({
        after: afterIdx,
        text: `\n${indent}displayName: '${escapedDisplayName}',`,
      });
    }

    if (inserts.length === 0) {
      unchanged++;
      continue;
    }

    // Splice in reverse order so earlier offsets stay valid.
    for (const ins of inserts.reverse()) {
      contents = contents.slice(0, ins.after) + ins.text + contents.slice(ins.after);
    }
    fs.writeFileSync(file, contents, 'utf-8');
    updated++;
  }
}

console.log(`\nBackfilled displayName in ${updated} doc file(s).`);
console.log(`  ${unchanged} files unchanged (already had displayName or no eligible name fields).`);
if (issues.length > 0) {
  console.log('\nFiles that need manual attention:');
  for (const issue of issues) {
    console.log(`  ${issue.file}: ${issue.reason}`);
  }
}
