#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Moves component records to knowledge schema v5.
 * @input Every tracked `*.spec.md` whose frontmatter has `kind: component`.
 * @output Records rewritten in place: `schema_version: 5`, and
 *   `platform_of: null` after `id` when the record has no `platform_of`.
 * @position Schema v5 adds `platform_of` to component records. The rewrite is
 *   deterministic and idempotent, so a branch can drop its migration commit,
 *   rebase, and rerun this to migrate records that landed in the meantime.
 *
 * Usage: node scripts/migrate-knowledge-v5.mjs [--check]
 *   --check  exit 1, listing the records, if any still needs migrating.
 */

/* global console, process */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The v5 form of one record's text, or null when the record is not a
 * component record or is already on schema 5.
 */
export function migrateComponentRecord(content) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) return null;
  const frontmatter = match[1];
  if (!/^kind: component$/m.test(frontmatter)) return null;
  const version = /^schema_version: (\d+)$/m.exec(frontmatter);
  if (!version || Number(version[1]) >= 5) return null;
  let next = frontmatter.replace(/^schema_version: \d+$/m, 'schema_version: 5');
  if (!/^platform_of:/m.test(next)) {
    next = next.replace(/^(id: .*)$/m, '$1\nplatform_of: null');
  }
  return `---\n${next}\n---\n${content.slice(match[0].length)}`;
}

/**
 * Every `*.spec.md` git knows or would add: tracked, and untracked but not
 * ignored, as `check:knowledge` discovers records, so a new record it flags is
 * migrated before it is staged.
 */
export function specRecordFiles(root) {
  return execFileSync(
    'git',
    [
      '-C',
      root,
      'ls-files',
      '-z',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      '*.spec.md',
    ],
    {encoding: 'utf8'},
  )
    .split('\0')
    .filter(Boolean);
}

function main() {
  const check = process.argv.includes('--check');
  const pending = [];
  for (const filePath of new Set(specRecordFiles(ROOT))) {
    const absolute = path.join(ROOT, filePath);
    // A tracked record moved or deleted but not yet staged is not there to
    // migrate; check:knowledge skips it the same way.
    if (!fs.existsSync(absolute)) continue;
    const migrated = migrateComponentRecord(fs.readFileSync(absolute, 'utf8'));
    if (migrated == null) continue;
    pending.push(filePath);
    if (!check) fs.writeFileSync(absolute, migrated);
  }
  if (check && pending.length > 0) {
    console.error(
      `${pending.length} component record(s) need schema v5; run node scripts/migrate-knowledge-v5.mjs:\n${pending.map(file => `- ${file}`).join('\n')}`,
    );
    process.exit(1);
  }
  console.log(
    check
      ? 'Every component record is on schema v5.'
      : `Migrated ${pending.length} component record(s) to schema v5.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
