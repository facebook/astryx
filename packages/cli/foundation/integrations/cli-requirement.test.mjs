// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import {describe, expect, it} from 'vitest';
import {semverCompare} from '../env/semver.mjs';
import {
  DOCS_TREE_CLI,
  SECTION_IDS_CLI,
  cliRangeProblem,
  THEMES_CLI,
  lowestAdmitted,
  docsTreeCliProblem,
  replacesCliProblem,
  sectionIdsCliProblem,
  themesCliProblem,
  withCliPeer,
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
    // Stable releases: a canary built from main before its release reports
    // the older version and reads every feature.
    expect(docsTreeCliProblem({name: '@acme/kit'})).toContain(
      'A stable CLI before 0.7.0 does not read the docs tree',
    );
  });

  it.each(['^0.6.0', '^0.6.0 || >=0.7.0', '*', '>=0.6.3'])(
    'refuses %s, which admits a CLI that cannot read a namespace doc',
    range => {
      expect(
        docsTreeCliProblem({peerDependencies: {'@astryxdesign/cli': range}}),
      ).toContain('admits a stable CLI before');
    },
  );

  it.each(['>=0.7.0', '^0.7.2', '>=0.7.0 <2'])('accepts %s', range => {
    expect(
      docsTreeCliProblem({peerDependencies: {'@astryxdesign/cli': range}}),
    ).toBeNull();
  });

  it('declares the peer as optional, and keeps what the package says of it', () => {
    const declared = withDocsTreeCli({name: '@acme/kit'});
    expect(declared.peerDependencies).toEqual({
      '@astryxdesign/cli': `>=${DOCS_TREE_CLI}`,
    });
    expect(declared.peerDependenciesMeta).toEqual({
      '@astryxdesign/cli': {optional: true},
    });
    expect(docsTreeCliProblem(declared)).toBeNull();
    const required = withDocsTreeCli({
      peerDependencies: {react: '^19.0.0', '@astryxdesign/cli': '^0.6.0'},
      peerDependenciesMeta: {'@astryxdesign/cli': {optional: false}},
    });
    expect(required.peerDependencies.react).toBe('^19.0.0');
    expect(required.peerDependenciesMeta['@astryxdesign/cli']).toEqual({
      optional: false,
    });
  });
});

describe('replacesCliProblem', () => {
  it('asks a package that sets replaces for a CLI that reads the field', () => {
    expect(replacesCliProblem({name: '@acme/kit'})).toContain(
      'sets `replaces`',
    );
    expect(
      replacesCliProblem({peerDependencies: {'@astryxdesign/cli': '^0.6.0'}}),
    ).toContain('admits a stable CLI before');
    expect(
      replacesCliProblem({peerDependencies: {'@astryxdesign/cli': '>=0.7.0'}}),
    ).toBeNull();
  });
});

describe('themesCliProblem and sectionIdsCliProblem', () => {
  // Published 0.6.4 reads typed theme descriptors and section ids. Published
  // 0.6.3 rejects both and hides the package's doc topics.
  it.each([
    ['a theme', themesCliProblem, 'ships a theme'],
    ['a section id', sectionIdsCliProblem, 'sets `id`'],
  ])('asks for a CLI from 0.6.4 for %s', (_name, problem, feature) => {
    expect(problem({name: '@acme/kit'})).toContain(feature);
    expect(problem({name: '@acme/kit'})).toContain('A stable CLI before 0.6.4');
    for (const range of ['>=0.6.4', '^0.6.4', '>=0.6.5', '>=0.7.0']) {
      expect(
        problem({peerDependencies: {'@astryxdesign/cli': range}}),
      ).toBeNull();
    }
    for (const range of ['^0.6.0', '>=0.6.3', '*']) {
      expect(
        problem({peerDependencies: {'@astryxdesign/cli': range}}),
      ).toContain('admits a stable CLI before 0.6.4');
    }
  });

  it('keeps 0.7.0 for the docs tree and for replaces', () => {
    const pkg = {peerDependencies: {'@astryxdesign/cli': '>=0.6.4'}};
    expect(docsTreeCliProblem(pkg)).toContain(
      'admits a stable CLI before 0.7.0',
    );
    expect(replacesCliProblem(pkg)).toContain(
      'admits a stable CLI before 0.7.0',
    );
  });

  it('names a released CLI for a feature that already shipped', () => {
    const {version} = JSON.parse(
      fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
    );
    for (const floor of [THEMES_CLI, SECTION_IDS_CLI]) {
      expect(semverCompare(floor, version.split('-')[0])).toBeLessThanOrEqual(
        0,
      );
    }
  });

  it('declares the floor a theme needs as an optional peer', () => {
    const declared = withCliPeer({name: '@acme/kit'}, THEMES_CLI);
    expect(declared.peerDependencies).toEqual({
      '@astryxdesign/cli': '>=0.6.4',
    });
    expect(declared.peerDependenciesMeta).toEqual({
      '@astryxdesign/cli': {optional: true},
    });
    expect(themesCliProblem(declared)).toBeNull();
  });
});

describe('cliRangeProblem', () => {
  it('uses the docs-tree floor when a caller names none', () => {
    expect(
      cliRangeProblem({name: '@acme/kit'}, 'ships x', 'drops x'),
    ).toContain('A stable CLI before 0.7.0');
  });

  it('fails loudly when the floor is not a version', () => {
    expect(() =>
      cliRangeProblem({name: '@acme/kit'}, '0.6.4', 'ships x', 'drops x'),
    ).toThrow(TypeError);
  });
});
