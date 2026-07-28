// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {getTransformsBetween} from '../../packages/cli/codemods/registry.mjs';
import {runCodemods} from '../../packages/cli/codemods/runner.mjs';

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
  const {versions: allVersions} = await import('../../packages/cli/codemods/registry.mjs');
  const earliestIdx = allVersions.indexOf(earliestVersion);
  const fromVersion = earliestIdx > 0 ? allVersions[earliestIdx - 1] : '0.0.0';

  // Save the base versions to detect which files the codemod actually modified
  const baseVersions = {};
  for (const file of revertedFiles) {
    baseVersions[file] = fs.readFileSync(file, 'utf-8');
  }

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

    // Suppress codemod log output during verification
    const origLog = console.log;
    const origErr = console.error;
    await runCodemods(manifests, {
      apply: true,
      path: dir,
      codemod: undefined,
    });
  }

  // Filter to only files the codemod actually modified.
  // Files unchanged by the codemod have unrelated edits in this PR — skip them.
  const codemodModifiedFiles = revertedFiles.filter((file) => {
    try {
      return fs.readFileSync(file, 'utf-8') !== baseVersions[file];
    } catch {
      return false;
    }
  });
  const skippedFiles = revertedFiles.filter((f) => !codemodModifiedFiles.includes(f));

  if (codemodModifiedFiles.length === 0) {
    console.log('\n✅ Codemod made no changes to consumer files — nothing to verify.');
    for (const file of consumerFiles) {
      fs.writeFileSync(file, prVersions[file]);
    }
    process.exit(0);
  }

  if (skippedFiles.length > 0) {
    console.log(`\nSkipping ${skippedFiles.length} file(s) not modified by codemod:`);
    for (const file of skippedFiles) {
      console.log(`  ⏭  ${file}`);
    }
  }

  // Format codemod output with prettier to normalize style differences
  // (jscodeshift's toSource() may change quotes, spacing, etc.)
  console.log('\nFormatting codemod output with prettier...');
  try {
    run(`npx prettier --write ${codemodModifiedFiles.map((f) => `"${f}"`).join(' ')}`);
  } catch (e) {
    console.log('  ⚠️  Prettier formatting failed, comparing raw output');
  }

  // Also format the expected (PR) versions for a fair comparison
  const formattedExpected = {};
  for (const file of codemodModifiedFiles) {
    // Use the original file extension so prettier can infer the parser
    const ext = path.extname(file);
    const tmpFile = file.replace(ext, `.expected${ext}`);
    fs.writeFileSync(tmpFile, prVersions[file]);
    try {
      run(`npx prettier --write "${tmpFile}"`);
      formattedExpected[file] = fs.readFileSync(tmpFile, 'utf-8');
    } catch {
      formattedExpected[file] = prVersions[file];
    }
    fs.unlinkSync(tmpFile);
  }

  // Compare codemod changes against PR versions.
  // Instead of requiring exact file match, we verify that every line the
  // codemod REMOVED from base is also absent in the PR, and every line it
  // ADDED is present in the PR. This allows the PR to contain additional
  // changes from stacked commits that are beyond the codemod's scope.
  let mismatches = 0;
  let matches = 0;
  const mismatchDetails = [];

  for (const file of codemodModifiedFiles) {
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
      // Check if the codemod's changes are a subset of the PR's changes.
      // The codemod transforms base → actual. The PR transforms base → expected.
      // We verify that lines removed by codemod are also removed in PR,
      // and lines added by codemod are present in PR.
      const baseLines = (baseVersions[file] || '').split('\n');
      const codemodLines = actual.split('\n');
      const prLines = expected.split('\n');

      // Find lines removed by codemod (in base but not in codemod output)
      const codemodRemovedFromBase = baseLines.filter((l) => !codemodLines.includes(l));
      // Find lines added by codemod (in codemod output but not in base)
      const codemodAddedToBase = codemodLines.filter((l) => !baseLines.includes(l));

      // Check: removed lines should also be absent from PR
      const missingRemovals = codemodRemovedFromBase.filter(
        (l) => l.trim() && prLines.includes(l),
      );
      // Check: added lines should be present in PR
      const missingAdditions = codemodAddedToBase.filter(
        (l) => l.trim() && !prLines.includes(l),
      );

      if (missingRemovals.length === 0 && missingAdditions.length === 0) {
        matches++;
        console.log(`  ✅ ${file} (superset — PR includes codemod changes + additional edits)`);
      } else {
        mismatches++;
        const issues = [];
        if (missingRemovals.length > 0) {
          issues.push(`${missingRemovals.length} line(s) codemod removed still present in PR`);
        }
        if (missingAdditions.length > 0) {
          issues.push(`${missingAdditions.length} line(s) codemod added missing from PR`);
        }
        mismatchDetails.push({file, diffLines: missingRemovals.length + missingAdditions.length, issues: issues.join('; ')});
        console.log(`  ❌ ${file} (${issues.join('; ')})`);
      }
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
    console.log('\nMismatched files (codemod changes not fully reflected in PR):');
    for (const {file, diffLines, issues} of mismatchDetails) {
      console.log(`  ❌ ${file} (${issues || diffLines + ' lines differ'})`);
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
