#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Repo check: tracked shell scripts must carry the executable bit.
 *
 * Shell scripts are invoked directly (`./scripts/foo.sh`) by workflows and
 * developers, so a dropped executable bit fails at run time with
 * "Permission denied" — and for scheduled workflows, nobody is watching.
 * A bulk file rewrite once dropped the bit on scripts/prune-branches.sh
 * (1a04b9d92) and the daily prune cron then failed silently for weeks.
 *
 * Only *.sh files are checked: JS/TS scripts in this repo are always run
 * through an explicit interpreter (`node x.mjs`, `npx tsx x.ts`), where the
 * bit is irrelevant.
 *
 * Fix: chmod +x <file> (or `git update-index --chmod=+x <file>` on systems
 * without file modes) and commit the mode change.
 *
 * Usage: node scripts/check-executable-bits.mjs
 */
import {execFileSync} from 'node:child_process';

// `git ls-files -s` reports the tracked index mode (100644/100755), which is
// what CI checkouts receive — independent of the local filesystem.
const lines = execFileSync('git', ['ls-files', '-s', '--', '*.sh'], {
  encoding: 'utf-8',
})
  .split('\n')
  .filter(Boolean);

const errors = [];
let checked = 0;

for (const line of lines) {
  // Format: "<mode> <object> <stage>\t<path>"
  const [meta, file] = line.split('\t');
  const mode = meta.split(' ')[0];
  checked++;

  if (mode !== '100755') {
    errors.push({file, mode});
  }
}

if (errors.length > 0) {
  console.error('❌ Shell scripts missing the executable bit:\n');
  for (const {file, mode} of errors) {
    console.error(`  ${file} (mode ${mode})`);
  }
  console.error(
    `\n${errors.length} error(s). Fix: chmod +x the file(s) and commit the mode change.`,
  );
  process.exit(1);
}

console.log(`✅ ${checked} tracked shell script(s) checked — all executable.`);
