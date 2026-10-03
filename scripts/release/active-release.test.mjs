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
import {execFileSync} from 'node:child_process';
import {afterEach, describe, expect, it} from 'vitest';
import {
  buildMarker,
  buildPlan,
  validateReleaseDiff,
  validateReleaseState,
  validateReleaseSync,
  writeAuthority,
} from './active-release.mjs';

const CUT = '1'.repeat(40);
const HEAD = '2'.repeat(40);
const NEXT_HEAD = '3'.repeat(40);
const BRANCH = 'release/v0.6.5';
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
    JSON.stringify({name: '@astryxdesign/core', version: '0.6.5'}, null, 2),
  );
  fs.writeFileSync(path.join(root, '.changeset/README.md'), '# Changesets\n');
  if (withChangeset) {
    fs.writeFileSync(
      path.join(root, '.changeset/in-cut.md'),
      "---\n'@astryxdesign/core': patch\n---\n\n[fix] Included\n@person\n",
    );
  }
  const plan = buildPlan({root, version: '0.6.5', branch: BRANCH, cutSha: CUT});
  const marker = buildMarker(plan);
  if (withChangeset) fs.rmSync(path.join(root, '.changeset/in-cut.md'));
  return {root, plan, marker};
}

function validate(state, overrides = {}) {
  return validateReleaseState({
    ...state,
    mode: 'check',
    releaseBranch: BRANCH,
    releaseVersion: state.marker.version,
    releaseTag: `v${state.marker.version}`,
    expectedPlanDigest: state.marker.planDigest,
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

describe('one branch per release lifecycle', () => {
  const values = {
    version: '0.6.5',
    branch: BRANCH,
    'cut-sha': CUT,
  };

  it('allows an explicit plan revision only within the same active identity', () => {
    const {root} = fixture({withChangeset: true});
    writeAuthority(root, values, false);
    const original = JSON.parse(
      fs.readFileSync(path.join(root, '.release/active.json'), 'utf8'),
    );

    fs.writeFileSync(
      path.join(root, '.changeset/authorized-revision.md'),
      'authorized revision',
    );
    writeAuthority(root, values, true);
    const revised = JSON.parse(
      fs.readFileSync(path.join(root, '.release/active.json'), 'utf8'),
    );
    expect(revised.planDigest).not.toBe(original.planDigest);
    expect(() =>
      writeAuthority(
        root,
        {...values, version: '0.6.6', branch: 'release/v0.6.6'},
        true,
      ),
    ).toThrow('release refresh cannot change version');
    expect(() =>
      writeAuthority(root, {...values, 'cut-sha': HEAD}, true),
    ).toThrow('release refresh cannot change cutSha');
  });

  it('never revives or recreates a closed branch lifecycle', () => {
    const {root} = fixture();
    writeAuthority(root, values, false);
    const markerPath = path.join(root, '.release/active.json');
    const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
    fs.writeFileSync(
      markerPath,
      `${JSON.stringify({...marker, state: 'closed'})}\n`,
    );

    expect(() => writeAuthority(root, values, true)).toThrow(
      'marker state must be active',
    );
    expect(() => writeAuthority(root, values, false)).toThrow(
      'release branch cannot be reused',
    );
  });

  it('requires a new version when the immutable tag already exists', () => {
    const {root} = fixture();
    execFileSync('git', ['init', '-q'], {cwd: root});
    execFileSync('git', ['config', 'user.name', 'Release Test'], {cwd: root});
    execFileSync('git', ['config', 'user.email', 'release@example.com'], {
      cwd: root,
    });
    execFileSync('git', ['add', '.'], {cwd: root});
    execFileSync('git', ['commit', '-qm', 'fixture'], {cwd: root});
    execFileSync('git', ['tag', 'v0.6.5'], {cwd: root});

    expect(() => writeAuthority(root, values, false)).toThrow(
      'use a new release branch and version',
    );
  });
});

describe('active release branch authority', () => {
  it('accepts one marked active branch at its exact head', () => {
    expect(validate(fixture())).toEqual([]);
  });

  it('requires explicit version and plan authority for the final branch gate', () => {
    const state = fixture();
    expect(validate(state, {releaseVersion: undefined})).toContain(
      'release check requires release-version',
    );
    expect(validate(state, {expectedPlanDigest: undefined})).toContain(
      'release check requires plan-digest',
    );
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
    expect(validate(state, {releaseBranch: 'release/v0.6.4'})).toContain(
      'release-branch input does not match marker',
    );
  });

  it('rejects missing or ambiguous active branches', () => {
    const state = fixture();
    expect(validate(state, {activeBranches: []})[0]).toMatch(
      /exactly one active release branch/,
    );
    expect(
      validate(state, {activeBranches: [BRANCH, 'release/v0.6.4']})[0],
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
    expect(validate(state, {mode: 'publish', refName: 'v0.6.5'})).toEqual([]);
    expect(validate(state, {mode: 'publish', refName: BRANCH})).toContain(
      'stable publish must run from the version tag',
    );
    expect(validate(state, {mode: 'publish', refName: 'main'})).toContain(
      'stable publish must run from the version tag',
    );
  });

  it('does not let dispatch inputs override marker authority', () => {
    const state = fixture();
    expect(
      validate(state, {
        mode: 'publish',
        refName: 'v0.6.5',
        releaseVersion: '0.6.4',
      }),
    ).toContain('release-version input does not match marker');
    expect(
      validate(state, {
        mode: 'publish',
        refName: 'v0.6.5',
        releaseTag: 'v0.6.4',
      }),
    ).toEqual(
      expect.arrayContaining([
        'release-tag input does not match marker version',
        'checked-out tag does not match release-tag input',
      ]),
    );
    expect(
      validate(state, {
        mode: 'publish',
        refName: 'v0.6.5',
        expectedPlanDigest: 'f'.repeat(64),
      }),
    ).toContain('plan-digest input does not match marker');
  });

  it('rejects package versions that do not match the marked release', () => {
    const state = fixture();
    fs.writeFileSync(
      path.join(state.root, 'packages/core/package.json'),
      JSON.stringify({name: '@astryxdesign/core', version: '0.6.4'}, null, 2),
    );
    expect(validate(state, {mode: 'publish', refName: 'v0.6.5'})).toContain(
      'packages/core/package.json is 0.6.4, expected 0.6.5',
    );
  });

  it('keeps the fast bump lane generated-only', () => {
    expect(
      validateReleaseDiff([
        'D\t.changeset/in-cut.md',
        'M\tpackages/core/package.json',
        'M\tpackages/core/CHANGELOG.md',
        'A\tpackages/cli/assets/codemods/transforms/v0.6.5/index.mjs',
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
    expect(
      validateReleaseDiff([
        'R100\tpackages/core/CHANGELOG.md\tpackages/core/src/release.ts',
      ]),
    ).toContain(
      'release bump contains a non-generated path: packages/core/src/release.ts',
    );
    expect(
      validateReleaseDiff([
        'R100\tpackages/core/src/release.ts\tpackages/core/CHANGELOG.md',
      ]),
    ).toContain(
      'release bump contains a non-generated path: packages/core/src/release.ts',
    );
    expect(
      validateReleaseDiff([
        'R100\tpackages/core/CHANGELOG.md\tpackages/cli/CHANGELOG.md',
      ]),
    ).toEqual([]);
  });

  it('binds generated-only deletion to the frozen plan paths and hashes', () => {
    const digest = value => value.repeat(64).slice(0, 64);
    const plan = {
      changesets: [{path: '.changeset/frozen.md', sha256: digest('a')}],
    };
    expect(
      validateReleaseDiff(['D\t.changeset/frozen.md'], {
        plan,
        baseChangesets: new Map([['.changeset/frozen.md', digest('a')]]),
      }),
    ).toEqual([]);
    expect(
      validateReleaseDiff(['D\t.changeset/not-frozen.md'], {
        plan,
        baseChangesets: new Map([
          ['.changeset/frozen.md', digest('b')],
          ['.changeset/not-frozen.md', digest('c')],
        ]),
      }),
    ).toEqual(
      expect.arrayContaining([
        'release bump deletes an unplanned Changeset: .changeset/not-frozen.md',
        'frozen Changeset differs or is missing at branch base: .changeset/frozen.md',
        'release bump did not delete frozen Changeset: .changeset/frozen.md',
        'release branch contains an unplanned Changeset: .changeset/not-frozen.md',
      ]),
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

describe('post-release bookkeeping sync', () => {
  const digest = value => value.repeat(64).slice(0, 64);
  const plan = {
    changesets: [
      {path: '.changeset/frozen.md', sha256: digest('a')},
      {path: '.changeset/already-consumed.md', sha256: digest('b')},
    ],
  };

  function sync(overrides = {}) {
    return validateReleaseSync({
      entries: [
        'D\t.changeset/frozen.md',
        'M\tpackages/core/package.json',
        'M\tpackages/core/CHANGELOG.md',
      ],
      plan,
      baseChangesets: new Map([
        ['.changeset/frozen.md', digest('a')],
        ['.changeset/post-cut.md', digest('c')],
      ]),
      headChangesets: new Map([['.changeset/post-cut.md', digest('c')]]),
      releaseOutputs: new Map([
        ['packages/core/package.json', digest('d')],
        ['packages/core/CHANGELOG.md', digest('e')],
      ]),
      headOutputs: new Map([
        ['packages/core/package.json', digest('d')],
        ['packages/core/CHANGELOG.md', digest('e')],
      ]),
      ...overrides,
    });
  }

  it('accepts consumed-only deletion, exact outputs, and idempotent reruns', () => {
    expect(sync()).toEqual([]);
    expect(
      sync({
        entries: [],
        baseChangesets: new Map([['.changeset/post-cut.md', digest('c')]]),
      }),
    ).toEqual([]);
  });

  it('rejects changes to post-cut Changesets and non-bookkeeping paths', () => {
    expect(
      sync({
        entries: [
          'M\t.changeset/post-cut.md',
          'M\tpackages/core/src/Button/Button.tsx',
        ],
        headChangesets: new Map([['.changeset/post-cut.md', digest('f')]]),
      }),
    ).toEqual(
      expect.arrayContaining([
        'release sync may only delete frozen Changesets: .changeset/post-cut.md',
        'release sync contains a non-bookkeeping path: packages/core/src/Button/Button.tsx',
        'release sync changed post-cut Changeset: .changeset/post-cut.md',
      ]),
    );
  });

  it('rejects missing frozen deletions and release-output drift', () => {
    expect(
      sync({
        headChangesets: new Map([
          ['.changeset/frozen.md', digest('a')],
          ['.changeset/post-cut.md', digest('c')],
        ]),
        headOutputs: new Map([
          ['packages/core/package.json', digest('f')],
          ['packages/core/CHANGELOG.md', digest('e')],
        ]),
      }),
    ).toEqual(
      expect.arrayContaining([
        'release sync did not delete frozen Changeset: .changeset/frozen.md',
        'release sync output differs from published branch: packages/core/package.json',
      ]),
    );
  });
});
