// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file analyze-pr.test.mjs
 * Pins the shallow-clone recovery contract of analyze-pr.js. The pr-analysis
 * job runs analyze-pr.js with a `--depth=50` fetch; once a PR has been open
 * long enough for base to advance past that window, the three-dot diff
 * (base...head) fails with "no merge base" and — without this fix — the whole
 * job dies. The script must recover by deepening the clone and retrying the
 * three-dot diff, and it must record which diff mode it used so consumers
 * know whether the component list is exact or approximate.
 *
 * We build a synthetic repo: a branch point, 60 churn commits on main, and a
 * feature branch off the branch point that touches exactly one component.
 * A shallow single-branch clone of the feature (depth 5) has no merge base
 * with origin/main, reproducing the CI failure; running analyze-pr.js against
 * it must exit 0 and report exactly the component the branch touched.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPTS_DIR, 'analyze-pr.js');

/** Run a git command in a repo dir; return trimmed stdout. */
function git(dir, args) {
  return execFileSync('git', args, {cwd: dir, encoding: 'utf8'}).trim();
}

/** Run a git command that is allowed to fail; return {status, stdout, stderr}. */
function gitTry(dir, args) {
  try {
    const stdout = execFileSync('git', args, {cwd: dir, encoding: 'utf8'});
    return {status: 0, stdout, stderr: ''};
  } catch (e) {
    return {status: e.status, stdout: e.stdout || '', stderr: e.stderr || ''};
  }
}

/**
 * Build the synthetic repo and return the shallow clone dir:
 *   upstream/: branch point, 60 churn commits on main, feature off the point
 *             touching only packages/core/src/Card/.
 *   clone/   : --depth=5 --single-branch of feature (no merge base with main).
 */
function buildFixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-analyze-'));
  const upstream = path.join(base, 'upstream');
  const clone = path.join(base, 'clone');

  fs.mkdirSync(path.join(upstream, 'packages/core/src/Card'), {recursive: true});
  fs.mkdirSync(path.join(upstream, 'packages/core/src/Button'), {recursive: true});
  fs.mkdirSync(path.join(upstream, 'packages/core/src/Line'), {recursive: true});

  git(upstream, ['init', '-q', '-b', 'main']);
  git(upstream, ['config', 'user.email', 'test@test.co']);
  git(upstream, ['config', 'user.name', 'Test']);
  fs.writeFileSync(path.join(upstream, 'package.json'), '{}');
  fs.writeFileSync(path.join(upstream, 'packages/core/src/Card/index.ts'), 'export {}\n');
  fs.writeFileSync(path.join(upstream, 'packages/core/src/Button/index.ts'), 'export {}\n');
  fs.writeFileSync(path.join(upstream, 'packages/core/src/Line/index.ts'), 'export {}\n');
  git(upstream, ['add', '-A']);
  git(upstream, ['commit', '-qm', 'branch point']);
  const branchPoint = git(upstream, ['rev-parse', 'HEAD']);

  // 60 churn commits on main so the branch point is beyond any small depth.
  for (let i = 1; i <= 60; i++) {
    fs.appendFileSync(path.join(upstream, 'packages/core/src/Button/index.ts'), `b${i}\n`);
    fs.appendFileSync(path.join(upstream, 'packages/core/src/Line/index.ts'), `l${i}\n`);
    git(upstream, ['add', '-A']);
    git(upstream, ['commit', '-qm', `churn ${i}`]);
  }

  // Feature branch off the branch point, touching only Card.
  git(upstream, ['branch', 'feature', branchPoint]);
  git(upstream, ['checkout', '-q', 'feature']);
  fs.appendFileSync(path.join(upstream, 'packages/core/src/Card/index.ts'), 'export const Card = {}\n');
  git(upstream, ['add', '-A']);
  git(upstream, ['commit', '-qm', 'touch Card only']);

  // Shallow single-branch clone of the feature branch.
  git(null, [
    'clone', '-q', '--depth=5', '--single-branch', '--branch=feature',
    `file://${upstream}`, clone,
  ]);

  return {base, clone, branchPoint};
}

describe('analyze-pr shallow-clone recovery', () => {
  it('recovers the three-dot diff by deepening and reports the exact component', () => {
    const {base, clone} = buildFixture();
    try {
      // Precondition: the clone really has no merge base (the CI failure).
      const mb = gitTry(clone, ['merge-base', 'HEAD', 'origin/main']);
      expect(mb.status).not.toBe(0);

      const stdout = execFileSync(
        process.execPath,
        [SCRIPT, '--base', 'origin/main', '--head', 'HEAD', '--output', 'analysis.json'],
        {cwd: clone, encoding: 'utf8'},
      );
      const analysis = JSON.parse(
        fs.readFileSync(path.join(clone, 'analysis.json'), 'utf8'),
      );

      // Reaching the assertions proves exit 0 (execFileSync throws otherwise).
      expect(stdout).toContain('diff mode: three-dot');
      expect(analysis.diffMode).toBe('three-dot');
      expect(analysis.modifiedComponents).toEqual(['Card']);
      expect(analysis.changedPackages).toEqual(['@astryxdesign/core']);
    } finally {
      fs.rmSync(base, {recursive: true, force: true});
    }
  });
});
