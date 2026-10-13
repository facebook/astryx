// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the package-set planner: which package root serves
 * a caller's project, and why.
 *
 * The rule under test: the project's own versions are authoritative and are
 * never silently mixed with the newest hosted set. An installed CLI wins
 * outright, an installed set needs no root, a pinned-but-uninstalled set needs
 * a root carrying exactly those versions, and anything else is reported, not
 * run. Only a caller with no project (or no Astryx pins) gets the newest set.
 * Invocation-scoped package state and Core-derived registries also stay bound
 * to the root that serves each call.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  activatePlan,
  isMatchableRange,
  planPackageSet,
  runHostedCli,
} from './package-set.mjs';
import {findCoreDir} from '../fs/paths.mjs';
import {readLockedVersions} from './locked-versions.mjs';
import {buildRegistry} from '../xle/registry.mjs';
import {
  activatePackageSet,
  activePackageSet,
  deactivatePackageSet,
  resolveFromPackageSet,
  withPackageSet,
  withoutPackageSet,
} from './package-root.mjs';
import {
  REPO_CLI,
  REPO_CORE,
  fixtureArea,
  installFixturePackage,
  linkPackage,
  makeRoot,
  readVersion,
  writeJson,
} from './__fixtures__/package-set-fixtures.mjs';

const CORE_VERSION = readVersion(REPO_CORE);
const CLI_VERSION = readVersion(REPO_CLI);

/** @type {ReturnType<typeof fixtureArea>} */
let area;

beforeEach(() => {
  area = fixtureArea('package-set-test');
});

afterEach(() => {
  deactivatePackageSet();
  area.cleanup();
});

/** Two roots: the newest hosted set, and an isolated older set. */
function twoRoots() {
  const newest = makeRoot(path.join(area.base, 'newest'), {
    packages: {'@acme/ui': {version: '2.0.0', topic: 'acme-guide'}},
  });
  const isolated = makeRoot(path.join(area.base, 'isolated'), {
    packages: {'@acme/ui': {version: '1.0.0', topic: 'acme-guide'}},
  });
  return {newest, isolated};
}

/**
 * A package root with one unique, minimal Core component. Distinct real Core
 * directories make stale process-wide registry reuse observable.
 * @param {string} label
 * @param {string} componentName
 */
function minimalCoreRoot(label, componentName) {
  const root = makeRoot(path.join(area.base, label), {core: false, cli: false});
  const core = path.join(root, 'node_modules', '@astryxdesign', 'core');
  writeJson(path.join(core, 'package.json'), {
    name: '@astryxdesign/core',
    version: '1.0.0',
  });
  const componentDir = path.join(core, 'src', componentName);
  fs.mkdirSync(componentDir, {recursive: true});
  fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), '');
  fs.writeFileSync(
    path.join(componentDir, `${componentName}.doc.mjs`),
    `export const docs = ${JSON.stringify({
      name: componentName,
      description: componentName,
      props: [],
    })};\n`,
  );
  fs.writeFileSync(
    path.join(componentDir, 'index.ts'),
    `export {${componentName}} from './${componentName}.tsx';\n`,
  );
  return root;
}

/**
 * An npm lockfile for a project, resolving each name to a version.
 * @param {string} dir
 * @param {Record<string, string>} versions
 */
function writeNpmLock(dir, versions) {
  writeJson(path.join(dir, 'package-lock.json'), {
    name: 'app',
    lockfileVersion: 3,
    packages: Object.fromEntries([
      ['', {name: 'app'}],
      ...Object.entries(versions).map(([name, version]) => [
        `node_modules/${name}`,
        {version},
      ]),
    ]),
  });
}

describe('planPackageSet: no project', () => {
  it('serves the newest set and its approved integrations, with provenance', () => {
    const {newest, isolated} = twoRoots();
    const plan = planPackageSet({cwd: area.bare(), roots: [newest, isolated]});

    expect(plan.mode).toBe('hosted');
    expect(plan.reason).toBe('no-project');
    expect(plan.root).toBe(newest);
    expect(plan.projectDir).toBeNull();
    expect(plan.declarations).toEqual([
      '@astryxdesign/cli',
      '@astryxdesign/core',
      '@acme/ui',
    ]);
    expect(plan.packages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '@astryxdesign/core',
          version: CORE_VERSION,
          source: 'package-set',
        }),
        expect.objectContaining({
          name: '@acme/ui',
          version: '2.0.0',
          source: 'package-set',
        }),
      ]),
    );
    expect(plan.cli?.dir).toBe(
      path.join(newest, 'node_modules', '@astryxdesign', 'cli'),
    );
    expect(plan.cli?.runtime).toBe(
      path.join(
        newest,
        'node_modules',
        '@astryxdesign',
        'cli',
        'host',
        'index.mjs',
      ),
    );
    expect(plan.warnings).toEqual([]);
  });

  it('takes an explicit approved integration list and names what the set lacks', () => {
    const {newest} = twoRoots();
    const plan = planPackageSet({
      cwd: area.bare(),
      roots: [newest],
      integrations: ['@acme/ui', '@acme/absent'],
    });
    expect(plan.declarations).toEqual(['@acme/ui', '@acme/absent']);
    expect(plan.missing).toEqual(['@acme/absent']);
    // The CLI and Core serve the run even when the list names neither.
    expect(plan.packages.map(p => [p.name, p.version, p.source])).toEqual([
      ['@astryxdesign/cli', CLI_VERSION, 'package-set'],
      ['@astryxdesign/core', CORE_VERSION, 'package-set'],
      ['@acme/ui', '2.0.0', 'package-set'],
    ]);
    expect(plan.warnings).toEqual([
      'astryx: @acme/absent is unavailable and is left out of this run.',
    ]);
  });

  it('ignores integration names that are not bare package names', () => {
    const {newest} = twoRoots();
    const plan = planPackageSet({
      cwd: area.bare(),
      roots: [newest],
      integrations: ['@acme/ui', '../outside', '@acme/ui/extra', ''],
    });
    expect(plan.declarations).toEqual(['@acme/ui']);
    expect(plan.missing).toEqual([]);
  });

  it('treats a project with no Astryx dependency like no project', () => {
    const {newest} = twoRoots();
    const app = area.project('app', {dependencies: {react: '^19.0.0'}});
    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan.mode).toBe('hosted');
    expect(plan.reason).toBe('no-astryx-pins');
    expect(plan.projectDir).toBe(app);
  });
});

describe('planPackageSet: project pins', () => {
  it('delegates to a CLI the project installed, naming its package-manager command', () => {
    const {newest} = twoRoots();
    const app = area.project('app', {
      devDependencies: {'@astryxdesign/cli': '0.6.0'},
    });
    fs.writeFileSync(
      path.join(app, 'pnpm-lock.yaml'),
      "lockfileVersion: '9.0'\n",
    );
    installFixturePackage(app, '@astryxdesign/cli', {
      version: '0.6.0',
      integration: false,
    });

    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan.mode).toBe('project-cli');
    expect(plan.command).toBe('pnpm exec astryx');
    expect(plan.cli?.dir).toBe(
      path.join(app, 'node_modules', '@astryxdesign', 'cli'),
    );
    expect(plan.packages).toEqual([
      expect.objectContaining({
        name: '@astryxdesign/cli',
        version: '0.6.0',
        source: 'project',
      }),
    ]);
    expect(plan.warnings).toEqual([
      'astryx: this project installs @astryxdesign/cli 0.6.0, which is authoritative here; running it (pnpm exec astryx).',
    ]);
    expect(() => activatePlan(plan)).toThrow(/no package set to activate/);
  });

  it('does not execute a project CLI a wrapper already attempted', () => {
    const {newest} = twoRoots();
    const app = area.project('already-handled', {
      devDependencies: {'@astryxdesign/cli': '*'},
    });
    installFixturePackage(app, '@astryxdesign/cli', {
      version: '0.6.0',
      integration: false,
    });

    const plan = planPackageSet({
      cwd: app,
      roots: [newest],
      projectCliAlreadyHandled: true,
    });
    expect(plan.mode).toBe('matched');
    expect(plan.root).toBe(newest);
    expect(plan.pins).toEqual([
      expect.objectContaining({
        name: '@astryxdesign/cli',
        wanted: '*',
        from: 'package.json',
        installedDir: null,
      }),
    ]);
    expect(
      plan.packages.filter(pkg => pkg.name === '@astryxdesign/cli'),
    ).toEqual([
      expect.objectContaining({
        version: CLI_VERSION,
        source: 'package-set',
      }),
    ]);
    expect(plan.warnings.join('\n')).not.toContain('authoritative here');
  });

  it('needs no root when the project installed everything it pins', () => {
    const {newest} = twoRoots();
    const app = area.project('app', {
      dependencies: {'@astryxdesign/core': CORE_VERSION, '@acme/ui': '^1.0.0'},
    });
    linkPackage(app, '@astryxdesign/core', REPO_CORE);
    installFixturePackage(app, '@acme/ui', {version: '1.0.0'});

    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan.mode).toBe('project');
    expect(plan.root).toBeNull();
    expect(plan.packages.map(p => [p.name, p.version, p.source])).toEqual([
      ['@astryxdesign/cli', CLI_VERSION, 'package-set'],
      ['@astryxdesign/core', CORE_VERSION, 'project'],
      ['@acme/ui', '1.0.0', 'project'],
    ]);
    expect(plan.warnings).toEqual([]);

    // A project-only plan has no hosted root, but keeps the verified project
    // packages in invocation scope so Core works through PnP and workspace roots.
    const deactivate = activatePlan(plan);
    expect(activePackageSet()).toMatchObject({mode: 'project', root: null});
    expect(findCoreDir(app)).toBe(
      path.join(app, 'node_modules', '@astryxdesign', 'core'),
    );
    expect(resolveFromPackageSet('@acme/ui')).toBeNull();
    deactivate();
    expect(activePackageSet()).toBeNull();
  });

  it('serves pinned-but-uninstalled packages from the root carrying the lockfile versions', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {
      dependencies: {
        '@astryxdesign/core': `^${CORE_VERSION}`,
        '@acme/ui': '^1.0.0',
      },
    });
    writeNpmLock(app, {
      '@astryxdesign/core': CORE_VERSION,
      '@acme/ui': '1.0.0',
    });

    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('matched');
    expect(plan.root).toBe(isolated);
    expect(plan.pins.map(p => [p.name, p.wanted, p.from])).toEqual([
      ['@astryxdesign/core', CORE_VERSION, 'lockfile'],
      ['@acme/ui', '1.0.0', 'lockfile'],
    ]);
    // The newest root was considered and rejected for its @acme/ui.
    expect(plan.roots[0]).toMatchObject({
      root: newest,
      conflicts: ['@acme/ui'],
    });
    expect(plan.declarations).toEqual(['@astryxdesign/core', '@acme/ui']);
    expect(plan.packages.map(p => [p.name, p.version, p.source])).toEqual([
      ['@astryxdesign/cli', CLI_VERSION, 'package-set'],
      ['@astryxdesign/core', CORE_VERSION, 'package-set'],
      ['@acme/ui', '1.0.0', 'package-set'],
    ]);
    expect(plan.warnings).toEqual([
      `astryx: this project declares packages it has not installed; using compatible versions for this run (@astryxdesign/core@${CORE_VERSION}, @acme/ui@1.0.0). Run npm install to use the project's own install.`,
    ]);
  });

  it('falls back to the declared range when no lockfile resolves a pin', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {dependencies: {'@acme/ui': '^2.0.0'}});
    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('matched');
    expect(plan.root).toBe(newest);
    expect(plan.pins).toEqual([
      expect.objectContaining({
        name: '@acme/ui',
        wanted: '^2.0.0',
        from: 'package.json',
        exact: false,
      }),
    ]);
  });

  it('never borrows from a root that disagrees with what the project installed', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {
      dependencies: {'@acme/ui': '^1.0.0', '@acme/charts': '1.0.0'},
    });
    // The project installed @acme/ui 1.0.0 but not @acme/charts. The newest
    // root has charts but carries @acme/ui 2.0.0, so it cannot serve charts.
    installFixturePackage(app, '@acme/ui', {version: '1.0.0'});
    installFixturePackage(newest, '@acme/charts', {version: '1.0.0'});
    installFixturePackage(isolated, '@acme/charts', {version: '1.0.0'});

    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('matched');
    expect(plan.root).toBe(isolated);
    expect(plan.declarations).toEqual(['@acme/charts']);
    // The root's Core comes with what it serves when the project pins none.
    expect(plan.packages.map(p => [p.name, p.version, p.source])).toEqual([
      ['@astryxdesign/cli', CLI_VERSION, 'package-set'],
      ['@acme/ui', '1.0.0', 'project'],
      ['@acme/charts', '1.0.0', 'package-set'],
      ['@astryxdesign/core', CORE_VERSION, 'package-set'],
    ]);
  });

  it('checks an installed npm alias by the package identity it resolves to', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('alias-app', {
      dependencies: {
        '@acme/legacy': 'npm:@acme/ui@1.0.0',
        '@acme/charts': '1.0.0',
      },
    });
    const aliasDir = installFixturePackage(app, '@acme/legacy', {
      version: '1.0.0',
    });
    const aliasPackage = JSON.parse(
      fs.readFileSync(path.join(aliasDir, 'package.json'), 'utf-8'),
    );
    writeJson(path.join(aliasDir, 'package.json'), {
      ...aliasPackage,
      name: '@acme/ui',
    });
    installFixturePackage(newest, '@acme/charts', {version: '1.0.0'});
    installFixturePackage(isolated, '@acme/charts', {version: '1.0.0'});

    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('matched');
    expect(plan.root).toBe(isolated);
    expect(plan.packages).toContainEqual(
      expect.objectContaining({
        name: '@acme/ui',
        version: '1.0.0',
        source: 'project',
        dir: aliasDir,
      }),
    );
    expect(plan.roots[0].conflicts).toContain('@acme/legacy');
  });

  it('reports an incompatible set instead of mixing, naming every pin and what is available', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {
      dependencies: {'@acme/ui': '^1.0.0', '@astryxdesign/theme-gone': '1.0.0'},
    });
    writeNpmLock(app, {
      '@acme/ui': '1.5.0',
      '@astryxdesign/theme-gone': '1.0.0',
    });

    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('incompatible');
    expect(plan.root).toBeNull();
    expect(plan.missing).toEqual(['@astryxdesign/theme-gone']);
    expect(plan.error).toBe(
      [
        "astryx: this project's Astryx package versions are unavailable:",
        '  @acme/ui: project pinned 1.5.0 (lockfile); available: 2.0.0 (set 1), 1.0.0 (set 2)',
        '  @astryxdesign/theme-gone: project pinned 1.0.0 (lockfile); no set carries it',
        "Install the project's dependencies (npm install) to use its own versions.",
      ].join('\n'),
    );
    expect(() => activatePlan(plan)).toThrow(/no package set to activate/);
  });
});

describe('runHostedCli', () => {
  it('prints the incompatible report and runs nothing', async () => {
    const {newest} = twoRoots();
    const app = area.project('app', {dependencies: {'@acme/ui': '9.0.0'}});
    /** @type {string[]} */
    const err = [];
    const {plan, status} = await runHostedCli({
      cwd: app,
      roots: [newest],
      argv: ['docs'],
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(plan.mode).toBe('incompatible');
    expect(status).toBe(1);
    expect(err.join('')).toContain(
      '@acme/ui: project pinned 9.0.0 (package.json)',
    );
    expect(activePackageSet()).toBeNull();
  });

  it('delegates to the project CLI with the same JSON arguments and caller cwd, without extra stderr', async () => {
    const {newest} = twoRoots();
    const app = area.project('app', {
      devDependencies: {'@astryxdesign/cli': '0.6.0'},
    });
    const cliDir = installFixturePackage(app, '@astryxdesign/cli', {
      version: '0.6.0',
      integration: false,
    });
    writeNpmLock(app, {'@astryxdesign/cli': '0.6.0'});
    const record = path.join(area.base, 'delegated.json');
    writeJson(path.join(cliDir, 'package.json'), {
      name: '@astryxdesign/cli',
      version: '0.6.0',
      bin: {astryx: './bin.mjs'},
    });
    fs.writeFileSync(
      path.join(cliDir, 'bin.mjs'),
      `import {writeFileSync} from 'node:fs';\n` +
        `writeFileSync(${JSON.stringify(record)}, JSON.stringify({argv: process.argv.slice(2), cwd: process.cwd()}));\n` +
        `process.exit(3);\n`,
    );

    /** @type {string[]} */
    const err = [];
    const {plan, status} = await runHostedCli({
      cwd: app,
      roots: [newest],
      argv: ['docs', '--json'],
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(plan.mode).toBe('project-cli');
    expect(status).toBe(3);
    expect(err).toEqual([]);
    expect(JSON.parse(fs.readFileSync(record, 'utf-8'))).toEqual({
      argv: ['docs', '--json'],
      cwd: fs.realpathSync(app),
    });
  });

  it('refuses a set served by another CLI copy', async () => {
    const other = makeRoot(path.join(area.base, 'other'), {cli: false});
    installFixturePackage(other, '@astryxdesign/cli', {
      version: '0.5.0',
      integration: false,
    });
    /** @type {string[]} */
    const err = [];
    const {status} = await runHostedCli({
      cwd: area.bare(),
      roots: [other],
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(status).toBe(1);
    expect(err.join('')).toMatch(
      /this command uses @astryxdesign\/cli 0\.5\.0, but the selected packages require another CLI/,
    );
    expect(activePackageSet()).toBeNull();
  });

  it('rejects roots that are not package roots', async () => {
    expect(() => planPackageSet({cwd: area.bare(), roots: []})).toThrow(
      /non-empty/,
    );
    expect(() =>
      planPackageSet({cwd: area.bare(), roots: ['relative']}),
    ).toThrow(/absolute/);
    expect(() =>
      planPackageSet({cwd: area.bare(), roots: [area.bare()]}),
    ).toThrow(/no node_modules/);
  });
});

describe('activatePackageSet', () => {
  it('refuses a malformed set', () => {
    const {newest} = twoRoots();
    expect(() => activatePackageSet({mode: 'other', root: newest})).toThrow(
      /mode/,
    );
    expect(() =>
      activatePackageSet({mode: 'hosted', root: 'relative'}),
    ).toThrow(/absolute/);
    expect(() => activatePackageSet({mode: 'hosted', root: null})).toThrow(
      /needs a root/,
    );
    expect(activePackageSet()).toBeNull();
  });

  it('resolves only bare names inside the root, and restores the previous set', async () => {
    const {newest, isolated} = twoRoots();
    activatePackageSet({
      mode: 'hosted',
      root: newest,
      declarations: ['@acme/ui', '../outside', '@acme/../../x'],
    });
    await withPackageSet(
      {mode: 'matched', root: isolated, declarations: ['@acme/ui']},
      () => {
        expect(resolveFromPackageSet('@acme/ui')).toBe(
          path.join(isolated, 'node_modules', '@acme', 'ui'),
        );
      },
    );
    expect(activePackageSet()?.root).toBe(newest);
    expect(activePackageSet()?.declarations).toEqual(['@acme/ui']);
    expect(resolveFromPackageSet('../outside')).toBeNull();
    expect(resolveFromPackageSet('@acme/../../x')).toBeNull();
    expect(resolveFromPackageSet('@acme/missing')).toBeNull();

    writeJson(
      path.join(newest, 'node_modules', '@acme', 'ui', 'package.json'),
      {
        name: '@acme/not-ui',
        version: '2.0.0',
      },
    );
    expect(resolveFromPackageSet('@acme/ui')).toBeNull();
  });

  it('isolates overlapping package sets and a nested doctor suspension', async () => {
    const {newest, isolated} = twoRoots();
    /** @type {() => void} */
    let firstReady = () => {};
    /** @type {() => void} */
    let releaseFirst = () => {};
    const ready = new Promise(resolve => {
      firstReady = resolve;
    });
    const hold = new Promise(resolve => {
      releaseFirst = resolve;
    });

    const first = withPackageSet(
      {mode: 'hosted', root: newest, declarations: ['@acme/ui']},
      async () => {
        expect(activePackageSet()?.root).toBe(newest);
        firstReady();
        await hold;
        expect(activePackageSet()?.root).toBe(newest);
      },
    );
    await ready;

    await withPackageSet(
      {mode: 'matched', root: isolated, declarations: ['@acme/ui']},
      async () => {
        expect(activePackageSet()?.root).toBe(isolated);
        await withoutPackageSet(async () => {
          await Promise.resolve();
          expect(activePackageSet()).toBeNull();
        });
        expect(activePackageSet()?.root).toBe(isolated);
      },
    );

    releaseFirst();
    await first;
    expect(activePackageSet()).toBeNull();
  });

  it('keeps Core-derived registries with the package root that built them', async () => {
    const alpha = minimalCoreRoot('alpha-core', 'Alpha');
    const beta = minimalCoreRoot('beta-core', 'Beta');
    const cwd = area.bare();
    /** @param {string} root */
    const read = root =>
      withPackageSet({mode: 'hosted', root}, () => buildRegistry({cwd}));

    const alphaRegistry = await read(alpha);
    const betaRegistry = await read(beta);

    expect(alphaRegistry.componentNames).toContain('Alpha');
    expect(alphaRegistry.componentNames).not.toContain('Beta');
    expect(betaRegistry.componentNames).toContain('Beta');
    expect(betaRegistry.componentNames).not.toContain('Alpha');
  });
});

describe('planPackageSet: what a root can stand in for', () => {
  it('accepts version ranges and nothing that names bytes only the project has', () => {
    for (const spec of [
      '*',
      'x',
      '1.0.0',
      '^1.2',
      '~1.2.3',
      '>=1.0.0 <2.0.0',
      '1.x',
      '1.0.0 - 2.0.0',
      '^1.0.0 || ^2.0.0',
      '1.0.0-rc.1',
    ]) {
      expect(isMatchableRange(spec), spec).toBe(true);
    }
    for (const spec of [
      '',
      'file:../ui',
      'link:../ui',
      'workspace:*',
      'workspace:^1.0.0',
      'npm:@acme/other@^1.0.0',
      'github:acme/ui#v1',
      'https://example.com/ui.tgz',
      'latest',
      'next',
    ]) {
      expect(isMatchableRange(spec), spec).toBe(false);
    }
  });

  it.each([
    ['1.2.3-rc.1', '1.2.3'],
    ['1.3.0-rc.1', '^1.2.0'],
    ['banana', '^1.2.0'],
  ])('refuses root version %s for project range %s', (version, range) => {
    const root = makeRoot(path.join(area.base, `strict-${version}`), {
      packages: {'@acme/ui': {version}},
    });
    const app = area.project(`app-${version}`, {
      dependencies: {'@acme/ui': range},
    });
    const plan = planPackageSet({cwd: app, roots: [root]});
    expect(plan.mode).toBe('incompatible');
    expect(plan.roots[0].conflicts).toContain('@acme/ui');
  });

  it('serves a version inside a hyphen range', () => {
    const root = makeRoot(path.join(area.base, 'hyphen'), {
      packages: {'@acme/ui': {version: '1.5.0'}},
    });
    const app = area.project('hyphen-app', {
      dependencies: {'@acme/ui': '1.0.0 - 2.0.0'},
    });
    expect(planPackageSet({cwd: app, roots: [root]}).mode).toBe('matched');
  });

  it('never serves a local, git, workspace, alias, or tag pin from a root', () => {
    const {newest, isolated} = twoRoots();
    for (const spec of [
      'file:../ui',
      'link:../ui',
      'github:acme/ui#v1',
      'workspace:^2.0.0',
      'npm:@acme/ui@^2.0.0',
      'latest',
    ]) {
      const app = area.project(`app-${spec.replace(/[^a-z0-9]/gi, '')}`, {
        dependencies: {'@acme/ui': spec},
      });
      const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
      expect(plan.mode, spec).toBe('incompatible');
      expect(plan.error, spec).toContain(
        `@acme/ui: project pinned ${spec} (package.json); only the project's own install can provide it`,
      );
    }
  });

  it('ignores a lockfile pin outside the declared range', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {dependencies: {'@acme/ui': '^2.0.0'}});
    writeNpmLock(app, {'@acme/ui': '1.0.0'});
    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.pins).toEqual([
      expect.objectContaining({wanted: '^2.0.0', from: 'package.json'}),
    ]);
    expect(plan.root).toBe(newest);
  });

  it('ignores a lockfile above the project that is not its workspace', () => {
    const {newest, isolated} = twoRoots();
    const app = area.project('app', {
      dependencies: {'@acme/ui': '^1.0.0 || ^2.0.0'},
    });
    const above = path.dirname(app);
    writeNpmLock(above, {'@acme/ui': '1.0.0'});
    expect(readLockedVersions(app, {'@acme/ui': '^1.0.0'}).versions.size).toBe(
      0,
    );
    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.pins[0]).toMatchObject({from: 'package.json'});
    expect(plan.root).toBe(newest);

    // Declared as a workspace member, the same lockfile pins it.
    writeJson(path.join(above, 'package.json'), {
      name: 'ws',
      workspaces: ['*'],
    });
    const member = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(member.pins[0]).toMatchObject({wanted: '1.0.0', from: 'lockfile'});
    expect(member.root).toBe(isolated);
  });

  it('keeps a verified workspace Core in project invocation scope', () => {
    const {newest} = twoRoots();
    // The planner verifies the package identity even beyond the base CLI's
    // legacy five-directory walk, then scopes that exact package for the run.
    const mono = path.join(area.base, 'w', 'x', 'mono');
    fs.mkdirSync(path.join(mono, 'packages'), {recursive: true});
    fs.symlinkSync(REPO_CORE, path.join(mono, 'packages', 'core'), 'dir');
    const app = path.join(mono, 'apps', 'a', 'b', 'c', 'd', 'e', 'f', 'web');
    writeJson(path.join(app, 'package.json'), {
      name: 'web',
      dependencies: {'@astryxdesign/core': '*'},
    });
    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan.mode).toBe('project');
    expect(plan.packages).toContainEqual(
      expect.objectContaining({
        name: '@astryxdesign/core',
        source: 'project',
        dir: path.join(mono, 'packages', 'core'),
      }),
    );
    const deactivate = activatePlan(plan);
    expect(findCoreDir(app)).toBe(path.join(mono, 'packages', 'core'));
    deactivate();
  });

  it('does not mistake an unrelated packages/core for Astryx Core', () => {
    const {newest} = twoRoots();
    const mono = path.join(area.base, 'other-mono');
    fs.mkdirSync(path.join(mono, 'packages', 'core'), {recursive: true});
    writeJson(path.join(mono, 'packages', 'core', 'package.json'), {
      name: '@acme/core',
      version: '1.0.0',
    });
    const app = path.join(mono, 'apps', 'web');
    writeJson(path.join(app, 'package.json'), {
      name: 'web',
      dependencies: {'@astryxdesign/core': '*'},
    });

    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan.mode).toBe('matched');
    expect(plan.packages).toContainEqual(
      expect.objectContaining({
        name: '@astryxdesign/core',
        source: 'package-set',
        dir: path.join(newest, 'node_modules', '@astryxdesign', 'core'),
      }),
    );
    expect(plan.packages.some(pkg => pkg.name === '@acme/core')).toBe(false);
    activatePlan(plan);
    expect(findCoreDir(app)).toBe(
      path.join(newest, 'node_modules', '@astryxdesign', 'core'),
    );
  });

  it('keeps hosted mode when an otherwise unrelated monorepo has packages/core', () => {
    const {newest} = twoRoots();
    const mono = path.join(area.base, 'other-unpinned-mono');
    fs.mkdirSync(path.join(mono, 'packages', 'core'), {recursive: true});
    writeJson(path.join(mono, 'packages', 'core', 'package.json'), {
      name: '@acme/core',
      version: '1.0.0',
    });
    const app = path.join(mono, 'apps', 'web');
    writeJson(path.join(app, 'package.json'), {name: 'web'});

    const plan = planPackageSet({cwd: app, roots: [newest]});
    expect(plan).toMatchObject({mode: 'hosted', reason: 'no-astryx-pins'});
    expect(plan.packages).toContainEqual(
      expect.objectContaining({
        name: '@astryxdesign/core',
        source: 'package-set',
      }),
    );
    expect(plan.packages.some(pkg => pkg.name === '@acme/core')).toBe(false);
  });

  it('skips a root that carries the pinned versions but no CLI', () => {
    const newest = makeRoot(path.join(area.base, 'newest'), {
      packages: {'@acme/ui': {version: '2.0.0'}},
    });
    const cliless = makeRoot(path.join(area.base, 'cliless'), {
      cli: false,
      packages: {'@acme/ui': {version: '1.0.0'}},
    });
    const app = area.project('app', {dependencies: {'@acme/ui': '1.0.0'}});
    const plan = planPackageSet({cwd: app, roots: [newest, cliless]});
    expect(plan.mode).toBe('incompatible');
    expect(plan.roots[1]).toMatchObject({conflicts: [], cli: false});
    expect(plan.error).toContain(
      '@astryxdesign/cli: set 2 carries these versions but no CLI',
    );
  });

  it('names what each root carries when no one root carries the whole set', () => {
    const {newest, isolated} = twoRoots();
    installFixturePackage(newest, '@acme/extra', {version: '1.0.0'});
    const app = area.project('app', {
      dependencies: {'@acme/ui': '1.0.0', '@acme/extra': '1.0.0'},
    });
    writeNpmLock(app, {});
    const plan = planPackageSet({cwd: app, roots: [newest, isolated]});
    expect(plan.mode).toBe('incompatible');
    expect(plan.error).toBe(
      [
        "astryx: this project's Astryx package versions are unavailable:",
        '  @acme/ui: project pinned 1.0.0 (package.json); available: 2.0.0 (set 1), 1.0.0 (set 2)',
        '  @acme/extra: project pinned 1.0.0 (package.json); available: 1.0.0 (set 1), none (set 2)',
        "Install the project's dependencies (npm install) to use its own versions.",
      ].join('\n'),
    );
  });
});

describe('runHostedCli: outcomes that run nothing', () => {
  it('answers --json with the error envelope on stdout', async () => {
    const {newest} = twoRoots();
    const app = area.project('app', {dependencies: {'@acme/ui': '9.0.0'}});
    /** @type {string[]} */
    const out = [];
    /** @type {string[]} */
    const err = [];
    const {status} = await runHostedCli({
      cwd: app,
      roots: [newest],
      argv: ['docs', '--json'],
      stdout: {write: chunk => out.push(chunk)},
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(status).toBe(1);
    const envelope = JSON.parse(out.join(''));
    expect(envelope).toMatchObject({
      apiVersion: 1,
      code: 'ERR_VERSIONS_UNAVAILABLE',
    });
    expect(envelope.error).toContain('@acme/ui: project pinned 9.0.0');
    expect(err).toEqual([]);
  });

  it('refuses a set with no CLI, in text and in JSON', async () => {
    const cliless = makeRoot(path.join(area.base, 'cliless'), {cli: false});
    /** @type {string[]} */
    const err = [];
    const text = await runHostedCli({
      cwd: area.bare(),
      roots: [cliless],
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(text.status).toBe(1);
    expect(err.join('')).toContain(
      'the selected packages carry no @astryxdesign/cli',
    );

    /** @type {string[]} */
    const out = [];
    const json = await runHostedCli({
      cwd: area.bare(),
      roots: [cliless],
      argv: ['component', '--list', '--json'],
      stdout: {write: chunk => out.push(chunk)},
      stderr: {write: () => {}},
    });
    expect(json.status).toBe(1);
    expect(JSON.parse(out.join('')).code).toBe('ERR_VERSIONS_UNAVAILABLE');
    expect(activePackageSet()).toBeNull();
  });

  it('reports a missing project CLI entry in text and JSON', async () => {
    const {newest} = twoRoots();
    const app = area.project('app', {
      devDependencies: {'@astryxdesign/cli': '0.6.0'},
    });
    const cliDir = installFixturePackage(app, '@astryxdesign/cli', {
      version: '0.6.0',
      integration: false,
    });
    writeJson(path.join(cliDir, 'package.json'), {
      name: '@astryxdesign/cli',
      version: '0.6.0',
      bin: {astryx: './missing.mjs'},
    });
    /** @type {string[]} */
    const err = [];
    const {status} = await runHostedCli({
      cwd: app,
      roots: [newest],
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(status).toBe(1);
    expect(err.join('')).toContain(
      "the project's @astryxdesign/cli has no entry at",
    );

    /** @type {string[]} */
    const out = [];
    const jsonResult = await runHostedCli({
      cwd: app,
      roots: [newest],
      argv: ['--json'],
      stdout: {write: chunk => out.push(chunk)},
      stderr: {write: () => {}},
    });
    expect(jsonResult.status).toBe(1);
    expect(JSON.parse(out.join(''))).toMatchObject({
      code: 'ERR_VERSIONS_UNAVAILABLE',
      error: expect.stringContaining(
        "the project's @astryxdesign/cli has no entry at",
      ),
    });
  });

  it("forwards the project CLI's stdout and stderr to the host's streams", async () => {
    const {newest} = twoRoots();
    const app = area.project('app', {
      devDependencies: {'@astryxdesign/cli': '0.6.0'},
    });
    const cliDir = installFixturePackage(app, '@astryxdesign/cli', {
      version: '0.6.0',
      integration: false,
    });
    writeJson(path.join(cliDir, 'package.json'), {
      name: '@astryxdesign/cli',
      version: '0.6.0',
      bin: {astryx: './bin.mjs'},
    });
    fs.writeFileSync(
      path.join(cliDir, 'bin.mjs'),
      "process.stdout.write('project stdout\\n');\nprocess.stderr.write('from the project cli\\n');\n",
    );
    /** @type {string[]} */
    const out = [];
    /** @type {string[]} */
    const err = [];
    const {status} = await runHostedCli({
      cwd: app,
      roots: [newest],
      stdout: {write: chunk => out.push(chunk)},
      stderr: {write: chunk => err.push(chunk)},
    });
    expect(status).toBe(0);
    expect(out).toEqual(['project stdout\n']);
    expect(err.at(-1)).toBe('from the project cli\n');
  });
});
