/**
 * @file Codemod verification script
 *
 * Verifies that codemods in a PR can reproduce the callsite changes.
 * This enforces the process: "never hand-edit callsites for breaking changes,
 * always use the codemod."
 *
 * Algorithm:
 * 1. Detect which codemod version(s) were added/modified in this PR
 * 2. Find consumer directories that were also changed (apps/, e2e/)
 * 3. For each consumer dir: revert to base, run codemods, diff against PR
 * 4. Report mismatches
 *
 * Exit 0 if codemods reproduce changes (or no consumer files changed).
 * Exit 1 if there are mismatches — callsites were hand-edited.
 */

import {execSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {getTransformsBetween} from '../../packages/cli/src/codemods/registry.mjs';
import {runCodemods} from '../../packages/cli/src/codemods/runner.mjs';

// Consumer directories whose changes should be reproducible by codemods
const CONSUMER_DIRS = ['apps/storybook', 'apps/sandbox', 'e2e'];

function run(cmd) {
  return execSync(cmd, {encoding: 'utf-8'}).trim();
}

function getChangedFiles() {
  const base = run('git merge-base HEAD origin/main');
  return {
    base,
    files: run(`git diff --name-only ${base} HEAD`).split('\n').filter(Boolean),
  };
}

function getCodemodVersions(changedFiles) {
  const versionPattern = /^packages\/cli\/src\/codemods\/transforms\/v([\d.]+)\//;
  const versions = new Set();
  for (const file of changedFiles) {
    const match = file.match(versionPattern);
    if (match) versions.add(match[1]);
  }
  return [...versions].sort();
}

function getChangedConsumerFiles(changedFiles) {
  return changedFiles.filter((f) =>
    CONSUMER_DIRS.some(
      (dir) =>
        f.startsWith(dir + '/') &&
        /\.(tsx?|jsx?)$/.test(f),
    ),
  );
}

async function main() {
  console.log('🔍 Codemod Verification\n');

  const {base, files: changedFiles} = getChangedFiles();
  const codemodVersions = getCodemodVersions(changedFiles);
  const consumerFiles = getChangedConsumerFiles(changedFiles);

  console.log(`Codemod versions modified: ${codemodVersions.join(', ') || 'none'}`);
  console.log(`Consumer files changed: ${consumerFiles.length}`);

  if (codemodVersions.length === 0) {
    console.log('\n✅ No codemod changes — nothing to verify.');
    process.exit(0);
  }

  if (consumerFiles.length === 0) {
    console.log('\n✅ No consumer file changes — codemod-only PR.');
    console.log(
      '⚠️  Note: If this codemod has breaking changes, consumer files should also be updated via the codemod.',
    );
    process.exit(0);
  }

  console.log(`\nConsumer files to verify:\n${consumerFiles.map((f) => `  ${f}`).join('\n')}\n`);

  // Save the PR version of each consumer file
  const prVersions = {};
  for (const file of consumerFiles) {
    prVersions[file] = fs.readFileSync(file, 'utf-8');
  }

  // Revert consumer files to base branch state
  let revertedFiles = [];
  for (const file of consumerFiles) {
    try {
      const baseContent = run(`git show ${base}:${file}`);
      fs.writeFileSync(file, baseContent);
      revertedFiles.push(file);
    } catch {
      console.log(`  ⏭  ${file} — new in this PR, skipping`);
    }
  }
  console.log(`Reverted ${revertedFiles.length} files to base (${base.slice(0, 8)})\n`);

  if (revertedFiles.length === 0) {
    console.log('✅ All consumer files are new — nothing to verify.');
    for (const file of consumerFiles) {
      fs.writeFileSync(file, prVersions[file]);
    }
    process.exit(0);
  }

  // Determine the version range for codemods
  // Only run the new versions added in this PR — the base branch already
  // has earlier codemod changes applied to consumer files.
  const earliestVersion = codemodVersions[0];
  const latestVersion = codemodVersions[codemodVersions.length - 1];

  // Find the version just before the earliest modified one
  const {versions: allVersions} = await import('../../packages/cli/src/codemods/registry.mjs');
  const earliestIdx = allVersions.indexOf(earliestVersion);
  const fromVersion = earliestIdx > 0 ? allVersions[earliestIdx - 1] : '0.0.0';

  // Run codemods on each affected consumer directory
  const affectedDirs = [
    ...new Set(
      revertedFiles.map((f) => CONSUMER_DIRS.find((dir) => f.startsWith(dir + '/'))).filter(Boolean),
    ),
  ];

  for (const dir of affectedDirs) {
    console.log(`Running codemods (${fromVersion} → ${latestVersion}) on ${dir}/...`);
    const manifests = await getTransformsBetween(fromVersion, latestVersion);
    if (manifests.length === 0) {
      console.log('  No applicable codemods found.');
      continue;
    }

    // Suppress clack output during verification
    const origLog = console.log;
    const origErr = console.error;
    await runCodemods(manifests, {
      apply: true,
      path: dir,
      codemod: undefined,
    });
  }

  // Format codemod output with prettier to normalize style differences
  // (jscodeshift's toSource() may change quotes, spacing, etc.)
  console.log('Formatting codemod output with prettier...');
  try {
    run(`npx prettier --write ${revertedFiles.map((f) => `"${f}"`).join(' ')}`);
  } catch (e) {
    console.log('  ⚠️  Prettier formatting failed, comparing raw output');
  }

  // Also format the expected (PR) versions for a fair comparison
  const formattedExpected = {};
  for (const file of revertedFiles) {
    const tmpFile = file + '.expected.tmp';
    fs.writeFileSync(tmpFile, prVersions[file]);
    try {
      run(`npx prettier --write "${tmpFile}"`);
      formattedExpected[file] = fs.readFileSync(tmpFile, 'utf-8');
    } catch {
      formattedExpected[file] = prVersions[file];
    }
    fs.unlinkSync(tmpFile);
  }

  // Compare formatted codemod output against formatted PR versions
  let mismatches = 0;
  let matches = 0;
  const mismatchDetails = [];

  for (const file of revertedFiles) {
    const expected = formattedExpected[file] || prVersions[file];
    let actual;
    try {
      actual = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }

    if (actual === expected) {
      matches++;
      console.log(`  ✅ ${file}`);
    } else {
      mismatches++;
      const actualLines = actual.split('\n');
      const expectedLines = expected.split('\n');
      let diffCount = 0;
      const maxLen = Math.max(actualLines.length, expectedLines.length);
      for (let i = 0; i < maxLen; i++) {
        if (actualLines[i] !== expectedLines[i]) diffCount++;
      }
      mismatchDetails.push({file, diffLines: diffCount});
      console.log(`  ❌ ${file} (${diffCount} lines differ)`);
    }
  }

  // Restore PR versions
  for (const file of consumerFiles) {
    if (prVersions[file]) {
      fs.writeFileSync(file, prVersions[file]);
    }
  }

  // Report
  console.log(`\n${'='.repeat(60)}`);
  console.log('Codemod Verification Results');
  console.log('='.repeat(60));
  console.log(`  Files verified: ${matches + mismatches}`);
  console.log(`  ✅ Reproducible: ${matches}`);
  console.log(`  ❌ Mismatches:   ${mismatches}`);

  if (mismatches > 0) {
    console.log('\nMismatched files (codemod output ≠ committed changes):');
    for (const {file, diffLines} of mismatchDetails) {
      console.log(`  ❌ ${file} (${diffLines} line${diffLines === 1 ? '' : 's'} differ)`);
    }
    console.log('\n⚠️  The codemod did not reproduce the committed consumer changes.');
    console.log('This means either:');
    console.log('  1. Callsites were hand-edited instead of using the codemod');
    console.log('  2. The codemod is incomplete (add missing transforms)');
    console.log('  3. Changes are intentionally beyond codemod scope (add allow-manual-edit label)');
    process.exit(1);
  }

  console.log('\n✅ All consumer changes are reproducible by codemods.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Codemod verification failed:', err);
  process.exit(1);
});
