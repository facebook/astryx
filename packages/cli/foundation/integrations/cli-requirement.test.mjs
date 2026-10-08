// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import {describe, expect, it} from 'vitest';
import {semverCompare} from '../env/semver.mjs';
import * as requirement from './cli-requirement.mjs';
import {
  COMPONENT_REPLACES_CLI,
  NAMESPACE_DOCS_CLI,
  REPLACES_CLI,
  SECTION_IDS_CLI,
  cliRangeProblem,
  componentReplacesCliProblem,
  THEMES_CLI,
  lowestAdmitted,
  docsTreeCliProblem,
  keywordsCliProblem,
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
      'A stable CLI before 0.6.4 does not read the docs tree',
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

  it.each(['>=0.6.4', '^0.6.4', '>=0.7.0', '^0.7.2', '>=0.7.0 <2'])(
    'accepts %s',
    range => {
      expect(
        docsTreeCliProblem({peerDependencies: {'@astryxdesign/cli': range}}),
      ).toBeNull();
    },
  );

  it('declares the peer as optional, and keeps what the package says of it', () => {
    const declared = withDocsTreeCli({name: '@acme/kit'});
    expect(declared.peerDependencies).toEqual({
      '@astryxdesign/cli': '>=0.6.4',
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
    // Unlike the docs tree, `replaces` still needs 0.7.0.
    expect(
      replacesCliProblem({peerDependencies: {'@astryxdesign/cli': '>=0.6.4'}}),
    ).toContain('admits a stable CLI before 0.7.0');
  });
});

describe('componentReplacesCliProblem', () => {
  // The floor is also the opt-in (spec:AST-035 FR10): a component's `replaces`
  // applies only for a package whose CLI range starts at it. Earlier stable
  // CLIs accept the field and keep the component under its own name.
  it('asks a package whose component sets replaces for the release that applies it', () => {
    expect(componentReplacesCliProblem({name: '@acme/kit'})).toContain(
      'has a component that sets `replaces`',
    );
    expect(componentReplacesCliProblem({name: '@acme/kit'})).toContain(
      'keeps the component under its own name',
    );
    for (const range of ['>=0.6.4', '^0.6.0', '>=0.6.5', '*']) {
      expect(
        componentReplacesCliProblem({
          peerDependencies: {'@astryxdesign/cli': range},
        }),
      ).toContain(`admits a stable CLI before ${COMPONENT_REPLACES_CLI}`);
    }
    for (const range of [
      `>=${COMPONENT_REPLACES_CLI}`,
      `^${COMPONENT_REPLACES_CLI}`,
      '>=0.7.0',
    ]) {
      expect(
        componentReplacesCliProblem({
          peerDependencies: {'@astryxdesign/cli': range},
        }),
      ).toBeNull();
    }
  });

  it('is the range every shipped doc tells an author to declare', () => {
    // The floor is tied to the next patch slot. If the slot moves, these docs
    // move with the constant and its row in the floor table below.
    for (const file of [
      '../../assets/docs/tree/replace-a-core-component.doc.mjs',
      '../../authoring/doctypes/component/component.doc.mjs',
      '../../authoring/doctypes/component/type.ts',
    ]) {
      const text = fs.readFileSync(new URL(file, import.meta.url), 'utf-8');
      const named = [
        ...text.matchAll(/"@astryxdesign\/cli\\?":\s*\\?">=(\d+\.\d+\.\d+)/g),
      ].map(match => match[1]);
      expect(named.length, file).toBeGreaterThan(0);
      expect(new Set(named), file).toEqual(new Set([COMPONENT_REPLACES_CLI]));
    }
    const troubleshooting = fs.readFileSync(
      new URL(
        '../../assets/docs/tree/troubleshooting.doc.mjs',
        import.meta.url,
      ),
      'utf-8',
    );
    const row = troubleshooting
      .split('],')
      .find(part => part.includes('`component_replaces_needs_cli`'));
    expect(row).toContain(`@astryxdesign/cli=>=${COMPONENT_REPLACES_CLI}'`);
    // Every version that row names is the floor.
    expect(new Set(row?.match(/\d+\.\d+\.\d+/g))).toEqual(
      new Set([COMPONENT_REPLACES_CLI]),
    );
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

  it('keeps 0.7.0 for replaces and keywords', () => {
    const pkg = {peerDependencies: {'@astryxdesign/cli': '>=0.6.4'}};
    expect(docsTreeCliProblem(pkg)).toBeNull();
    expect(replacesCliProblem(pkg)).toContain(
      'admits a stable CLI before 0.7.0',
    );
    expect(keywordsCliProblem(pkg)).toContain(
      'admits a stable CLI before 0.7.0',
    );
    expect(
      keywordsCliProblem({peerDependencies: {'@astryxdesign/cli': '>=0.7.0'}}),
    ).toBeNull();
  });

  it('names a released CLI for a feature that already shipped', () => {
    const {version} = JSON.parse(
      fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
    );
    for (const floor of [NAMESPACE_DOCS_CLI, THEMES_CLI, SECTION_IDS_CLI]) {
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
  it('fails loudly when a caller names no floor', () => {
    expect(() =>
      // @ts-expect-error: the floor is required
      cliRangeProblem({name: '@acme/kit'}, 'ships x', 'drops x'),
    ).toThrow(TypeError);
  });

  it('fails loudly when the floor is not a version', () => {
    expect(() =>
      cliRangeProblem({name: '@acme/kit'}, '0.6.4', 'ships x', 'drops x'),
    ).toThrow(TypeError);
  });
});

describe('every feature check names its CLI floor', () => {
  // The first stable CLI release that reads each feature. A new check, or a
  // check whose floor changes, fails here until this table says so on
  // purpose, so a floor never moves as a side effect of another change.
  const FLOORS = {
    componentReplacesCliProblem: COMPONENT_REPLACES_CLI,
    docsTreeCliProblem: '0.6.4',
    replacesCliProblem: REPLACES_CLI,
    keywordsCliProblem: REPLACES_CLI,
    sectionIdsCliProblem: '0.6.4',
    themesCliProblem: '0.6.4',
  };

  it('asks each feature for the CLI release this table names', () => {
    const named = Object.fromEntries(
      Object.entries(requirement)
        .filter(
          ([name, value]) =>
            typeof value === 'function' &&
            /CliProblem$/.test(name) &&
            name !== 'cliRangeProblem',
        )
        .map(([name, check]) => [
          name,
          /A stable CLI before (\d+\.\d+\.\d+)/.exec(
            check({name: '@acme/kit'}) ?? '',
          )?.[1] ?? null,
        ]),
    );
    expect(named).toEqual({
      ...FLOORS,
      // Tied to the next patch slot: the first stable release that ships
      // component replacement.
      componentReplacesCliProblem: '0.6.7',
      replacesCliProblem: '0.7.0',
      keywordsCliProblem: '0.7.0',
    });
  });
});
