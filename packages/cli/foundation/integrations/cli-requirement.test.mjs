// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {semverCompare} from '../env/semver.mjs';
import {
  DOCS_TREE_CLI,
  lowestAdmitted,
  docsTreeCliProblem,
  replacesCliProblem,
  withDocsTreeCli,
} from './cli-requirement.mjs';

describe('lowestAdmitted', () => {
  it.each([
    ['>=0.7.0', '0.7.0'],
    ['^0.6.0', '0.6.0'],
    ['~0.7.1', '0.7.1'],
    ['0.7.x', '0.7.0'],
    ['>=0.7.0 <0.8.0', '0.7.0'],
    ['^0.6.0 || >=0.7.0', '0.6.0'],
    ['0.8.0 - 0.9.0', '0.8.0'],
    ['*', null],
    ['<1.0.0', null],
    ['latest', null],
    ['workspace:*', null],
  ])('%s admits %s at the lowest', (range, lowest) => {
    expect(lowestAdmitted(range)).toBe(lowest);
  });
});

describe('docsTreeCliProblem', () => {
  it('asks for a CLI peer when there is none', () => {
    expect(docsTreeCliProblem({name: '@acme/kit'})).toContain(
      'declares no @astryxdesign/cli peer',
    );
  });

  it.each(['^0.6.0', '^0.6.0 || >=0.7.0', '*', '>=0.6.3'])(
    'refuses %s, which admits a CLI that cannot read a namespace doc',
    range => {
      expect(
        docsTreeCliProblem({peerDependencies: {'@astryxdesign/cli': range}}),
      ).toContain('admits a CLI older than');
    },
  );

  it.each(['>=0.7.0', '^0.7.2', '>=0.7.0 <2'])('accepts %s', range => {
    expect(
      docsTreeCliProblem({peerDependencies: {'@astryxdesign/cli': range}}),
    ).toBeNull();
  });

  it('declares the peer as optional, and keeps what the package says of it', () => {
    const declared = withDocsTreeCli({name: '@acme/kit'});
    expect(declared.peerDependencies).toEqual({'@astryxdesign/cli': `>=${DOCS_TREE_CLI}`});
    expect(declared.peerDependenciesMeta).toEqual({'@astryxdesign/cli': {optional: true}});
    expect(docsTreeCliProblem(declared)).toBeNull();
    const required = withDocsTreeCli({
      peerDependencies: {react: '^19.0.0', '@astryxdesign/cli': '^0.6.0'},
      peerDependenciesMeta: {'@astryxdesign/cli': {optional: false}},
    });
    expect(required.peerDependencies.react).toBe('^19.0.0');
    expect(required.peerDependenciesMeta['@astryxdesign/cli']).toEqual({optional: false});
  });
});

describe('replacesCliProblem', () => {
  it('asks a package that sets replaces for a CLI that activates replacement selection', () => {
    expect(replacesCliProblem({name: '@acme/kit'})).toContain('sets `replaces`');
    const problem = replacesCliProblem({peerDependencies: {'@astryxdesign/cli': '^0.6.0'}});
    expect(problem).toContain('admits a CLI older than');
    expect(problem).toContain('does not activate replacement selection');
    expect(replacesCliProblem({peerDependencies: {'@astryxdesign/cli': '>=0.7.0'}})).toBeNull();
  });
});

describe('DOCS_TREE_CLI', () => {
  it('is no later than the release the pending changesets make', () => {
    const {version} = JSON.parse(
      fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf-8'),
    );
    const dir = path.join(CLI_ROOT, '..', '..', '.changeset');
    /** @type {Record<string, number>} */
    const rank = {patch: 1, minor: 2, major: 3};
    let bump = 0;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') || file === 'README.md') continue;
      const head = fs.readFileSync(path.join(dir, file), 'utf-8').split('---')[1] ?? '';
      const m = /['"]@astryxdesign\/cli['"]\s*:\s*(patch|minor|major)/.exec(head);
      if (m) bump = Math.max(bump, rank[m[1]]);
    }
    const [major, minor, patch] = version.split('-')[0].split('.').map(Number);
    const next =
      bump === 3
        ? `${major + 1}.0.0`
        : bump === 2
          ? `${major}.${minor + 1}.0`
          : bump === 1
            ? `${major}.${minor}.${patch + 1}`
            : version;
    // The first release that reads namespace docs is this one or an earlier
    // one; a later constant would make every author wait for a CLI that does
    // not exist yet.
    expect(semverCompare(DOCS_TREE_CLI, next)).toBeLessThanOrEqual(0);
  });
});
