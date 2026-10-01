// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Release branch authority regression tests.
 *
 * @input  synthetic active markers, plans, package versions, and branch heads
 * @output proofs that only one exact marked release branch can gate or publish
 * @position focused safety suite for the release-branch CI contract
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
  buildMarker,
  buildPlan,
  validateReleaseDiff,
  validateReleaseState,
} from './active-release.mjs';

const CUT = '1'.repeat(40);
const HEAD = '2'.repeat(40);
const NEXT_HEAD = '3'.repeat(40);
const BRANCH = 'release/v0.6.4';
const roots = [];

function fixture({withChangeset = false} = {}) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-release-authority-'),
  );
  roots.push(root);
  fs.mkdirSync(path.join(root, '.changeset'), {recursive: true});
  fs.mkdirSync(path.join(root, 'packages/core'), {recursive: true});
  fs.writeFileSync(
    path.join(root, 'pnpm-workspace.yaml'),
    "packages:\n  - 'packages/*'\n",
  );
  fs.writeFileSync(
    path.join(root, 'packages/core/package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '0.6.4'}, null, 2),
  );
  fs.writeFileSync(path.join(root, '.changeset/README.md'), '# Changesets\n');
  if (withChangeset) {
    fs.writeFileSync(
      path.join(root, '.changeset/in-cut.md'),
      "---\n'@astryxdesign/core': patch\n---\n\n[fix] Included\n@person\n",
    );
  }
  const plan = buildPlan({root, version: '0.6.4', branch: BRANCH, cutSha: CUT});
  const marker = buildMarker(plan);
  if (withChangeset) fs.rmSync(path.join(root, '.changeset/in-cut.md'));
  return {root, plan, marker};
}

function validate(state, overrides = {}) {
  return validateReleaseState({
    ...state,
    mode: 'check',
    releaseBranch: BRANCH,
    refName: BRANCH,
    expectedHead: HEAD,
    checkoutSha: HEAD,
    remoteHead: HEAD,
    activeBranches: [BRANCH],
    ...overrides,
  });
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

describe('active release branch authority', () => {
  it('accepts one marked active branch at its exact head', () => {
    expect(validate(fixture())).toEqual([]);
  });

  it('ignores post-cut main package and Changeset activity', () => {
    const state = fixture();
    fs.mkdirSync(path.join(state.root, 'moving-main-snapshot/.changeset'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(state.root, 'moving-main-snapshot/package.json'),
      JSON.stringify({version: '9.9.9'}),
    );
    fs.writeFileSync(
      path.join(state.root, 'moving-main-snapshot/.changeset/later.md'),
      'later main input',
    );
    expect(validate(state)).toEqual([]);
  });

  it('rejects main and an unmarked or wrong release branch', () => {
    const state = fixture();
    expect(validate(state, {refName: 'main'})).toContain(
      'release validation must run from the marked release branch',
    );
    expect(validate(state, {releaseBranch: 'release/v0.6.5'})).toContain(
      'release-branch input does not match marker',
    );
  });

  it('rejects missing or ambiguous active branches', () => {
    const state = fixture();
    expect(validate(state, {activeBranches: []})[0]).toMatch(
      /exactly one active release branch/,
    );
    expect(
      validate(state, {activeBranches: [BRANCH, 'release/v0.6.5']})[0],
    ).toMatch(/exactly one active release branch/);
  });

  it('rejects stale expected heads', () => {
    const state = fixture();
    expect(validate(state, {checkoutSha: NEXT_HEAD})).toContain(
      'checked-out commit does not match expected head',
    );
    expect(validate(state, {remoteHead: NEXT_HEAD})).toContain(
      'release branch moved after the expected head was recorded',
    );
  });

  it('accepts an explicitly updated branch head only with a new receipt', () => {
    const state = fixture();
    expect(validate(state, {remoteHead: NEXT_HEAD})).not.toEqual([]);
    expect(
      validate(state, {
        expectedHead: NEXT_HEAD,
        checkoutSha: NEXT_HEAD,
        remoteHead: NEXT_HEAD,
      }),
    ).toEqual([]);
  });

  it('accepts publication only from the matching immutable tag', () => {
    const state = fixture();
    expect(validate(state, {mode: 'publish', refName: 'v0.6.4'})).toEqual([]);
    expect(validate(state, {mode: 'publish', refName: BRANCH})).toContain(
      'stable publish must run from the version tag',
    );
  });

  it('keeps the fast bump lane generated-only', () => {
    expect(
      validateReleaseDiff([
        'D\t.changeset/in-cut.md',
        'M\tpackages/core/package.json',
        'M\tpackages/core/CHANGELOG.md',
        'A\tpackages/cli/assets/codemods/transforms/v0.6.4/index.mjs',
        'M\tpnpm-lock.yaml',
      ]),
    ).toEqual([]);
    expect(
      validateReleaseDiff(['M\tpackages/core/src/Button/Button.tsx']),
    ).toContain(
      'release bump contains a non-generated path: packages/core/src/Button/Button.tsx',
    );
    expect(validateReleaseDiff(['A\t.changeset/post-cut.md'])).toContain(
      'release bump may only delete planned Changesets: .changeset/post-cut.md',
    );
  });

  it('binds the plan to the exact Changesets recorded at cut', () => {
    const state = fixture({withChangeset: true});
    expect(validate(state)).toEqual([]);
    fs.writeFileSync(path.join(state.root, '.changeset/later.md'), 'post-cut');
    expect(validate(state)).toContain(
      'versioned release must consume every branch Changeset',
    );
  });
});
