// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end tests for the hosted package-set hook: the unchanged CLI,
 * driven in-process, with the caller's project as its working directory and
 * Core and integrations resolved from a separate package root.
 *
 * What is pinned here is what a person or agent reading the CLI sees:
 *
 *   - docs, search, and component reads find the set's Core and integrations,
 *     and every result still names the package it came from;
 *   - project files stay the project's: its config, the package it is
 *     authoring, and every file a command writes resolve from the working
 *     directory, and nothing is read from or written to the package root;
 *   - a project's pinned versions decide which root serves it, and the newest
 *     set never leaks into a project that pins another;
 *   - only the approved hosted integration list is visible with no project;
 *   - a host can answer an integration's discover source in-process.
 *
 * The planner's decision table is covered in package-set.test.mjs.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCli} from '../../test-utils/run-cli.mjs';
import {activatePlan, planPackageSet, runHostedCli} from './package-set.mjs';
import {activePackageSet, deactivatePackageSet} from './package-root.mjs';
import {
  discoverExternalPackages,
  findCoreDir,
  findProjectCoreDir,
} from '../fs/paths.mjs';
import {Project} from '../config/project.mjs';
import {resolvePackageDir} from '../integrations/integrations.mjs';
import {callSources} from '../../api/discover/_adapter.mjs';
import {runChecks} from '../../api/doctor/doctor.mjs';
import {integrationComponentConflicts} from '../../api/integration/authoring-checks.mjs';
import {
  REPO_CLI,
  REPO_CORE,
  fixtureArea,
  installFixturePackage,
  makeRoot,
  topicSource,
  writeJson,
} from './__fixtures__/package-set-fixtures.mjs';

const SLOW = 60_000;

/** @type {ReturnType<typeof fixtureArea>} */
let area;
/** @type {string} */
let newest;
/** @type {string} */
let isolated;

beforeEach(() => {
  area = fixtureArea('hosted-runtime-test');
  newest = makeRoot(path.join(area.base, 'newest'), {
    packages: {
      '@acme/ui': {version: '2.0.0', topic: 'acme-guide'},
      '@acme/extra': {version: '1.0.0', topic: 'extra-guide'},
    },
  });
  // A root's own config must never be read: it is not the caller's project.
  fs.writeFileSync(
    path.join(newest, 'astryx.config.mjs'),
    "throw new Error('the package root config was read');\n",
  );
  isolated = makeRoot(path.join(area.base, 'isolated'), {
    packages: {'@acme/ui': {version: '1.0.0', topic: 'acme-guide'}},
  });
});

afterEach(() => {
  deactivatePackageSet();
  area.cleanup();
});

/**
 * Plan for `cwd` and activate the result, failing loudly on a plan that
 * cannot run in-process.
 * @param {string} cwd
 * @param {object} [options]
 */
function activateFor(
  cwd,
  {roots = [newest, isolated], integrations, handlers} = {},
) {
  const plan = planPackageSet({cwd, roots, integrations});
  activatePlan(plan, {handlers});
  return plan;
}

/** @param {{stdout: string}} result */
function json(result) {
  return JSON.parse(result.stdout);
}

/**
 * The topics `astryx docs --json` lists that do not ship inside the CLI.
 * @param {string} cwd
 * @returns {Promise<Array<{topic: string, package: string, description: string}>>}
 */
async function contributedTopics(cwd) {
  const result = await runCli(['docs', '--json'], cwd);
  expect(result.status).toBe(0);
  return json(result).data.filter(
    (/** @type {{package: string}} */ t) => t.package !== '@astryxdesign/cli',
  );
}

describe('docs discovery with no project', () => {
  it(
    'lists, reads, and searches the approved integrations, naming their package',
    async () => {
      const cwd = area.bare();
      expect(await contributedTopics(cwd)).toEqual([]);

      activateFor(cwd, {integrations: ['@acme/ui']});
      const topics = await contributedTopics(cwd);
      expect(topics).toEqual([
        expect.objectContaining({
          topic: 'acme-guide',
          package: '@acme/ui',
          description: '@acme/ui 2.0.0',
        }),
      ]);
      // @acme/extra is in the root but not approved: it stays invisible.
      expect(topics.some(t => t.package === '@acme/extra')).toBe(false);

      const detail = await runCli(
        ['docs', 'acme-guide', '--full', '--json'],
        cwd,
      );
      expect(json(detail)).toMatchObject({
        type: 'docs.detail',
        package: '@acme/ui',
      });

      const search = await runCli(['search', 'acme-guide', '--json'], cwd);
      expect(json(search).data.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            domain: 'doc',
            name: 'acme-guide',
            package: '@acme/ui',
          }),
        ]),
      );
    },
    SLOW,
  );

  it(
    'reads Core components from the set without touching the caller cwd',
    async () => {
      const cwd = area.bare();
      const before = await runCli(['component', 'Button', '--json'], cwd);
      expect(json(before).code).toBe('ERR_CORE_NOT_FOUND');

      activateFor(cwd);
      expect(findCoreDir(cwd)).toBe(
        path.join(newest, 'node_modules', '@astryxdesign', 'core'),
      );
      const after = await runCli(['component', 'Button', '--json'], cwd);
      expect(after.status).toBe(0);
      expect(json(after)).toMatchObject({
        type: 'component.detail',
        package: '@astryxdesign/core',
        data: {name: 'Button'},
      });
      expect(fs.readdirSync(cwd)).toEqual([]);
    },
    SLOW,
  );
  it(
    'runs successive hosted invocations against different package roots',
    async () => {
      const caller = area.bare();
      const original = {cwd: process.cwd(), argv: process.argv};
      for (const [root, version] of [
        [newest, '2.0.0'],
        [isolated, '1.0.0'],
      ]) {
        /** @type {string[]} */
        const stdout = [];
        /** @type {string[]} */
        const stderr = [];
        const result = await runHostedCli({
          cwd: caller,
          roots: [root],
          argv: ['docs', '--json'],
          integrations: ['@acme/ui'],
          stdout: {write: chunk => stdout.push(chunk)},
          stderr: {write: chunk => stderr.push(chunk)},
        });
        expect(result.status).toBe(0);
        expect(stderr).toEqual([]);
        const envelope = JSON.parse(stdout.join(''));
        expect(
          envelope.data.find(topic => topic.package === '@acme/ui'),
        ).toMatchObject({description: `@acme/ui ${version}`});
        expect(activePackageSet()).toBeNull();
        expect(process.cwd()).toBe(original.cwd);
        expect(process.argv).toBe(original.argv);
      }
    },
    SLOW,
  );
});

describe('docs discovery for a project', () => {
  it(
    'serves the version the lockfile pins, never the newest set',
    async () => {
      const app = area.project('app', {dependencies: {'@acme/ui': '^1.0.0'}});
      writeJson(path.join(app, 'package-lock.json'), {
        lockfileVersion: 3,
        packages: {
          '': {name: 'app'},
          'node_modules/@acme/ui': {version: '1.0.0'},
        },
      });

      const plan = activateFor(app);
      expect(plan.mode).toBe('matched');
      expect(plan.root).toBe(isolated);

      expect(await contributedTopics(app)).toEqual([
        expect.objectContaining({
          topic: 'acme-guide',
          package: '@acme/ui',
          description: '@acme/ui 1.0.0',
        }),
      ]);
    },
    SLOW,
  );

  it(
    'resolves only from the project when it installed everything it pins',
    async () => {
      const app = area.project('app', {dependencies: {'@acme/ui': '^1.0.0'}});
      const ownCopy = installFixturePackage(app, '@acme/ui', {
        version: '1.0.0',
        topic: 'acme-guide',
      });
      fs.writeFileSync(
        path.join(ownCopy, 'docs', 'acme-guide.doc.mjs'),
        topicSource('acme-guide', 'the project install'),
      );

      const plan = activateFor(app);
      expect(plan.mode).toBe('project');
      const topics = await contributedTopics(app);
      expect(topics).toEqual([
        expect.objectContaining({
          topic: 'acme-guide',
          description: 'the project install',
        }),
      ]);
      // Nothing from any root: neither the newest @acme/ui nor @acme/extra.
      expect(topics.some(t => t.package === '@acme/extra')).toBe(false);
    },
    SLOW,
  );
});

describe('project files stay the project’s', () => {
  it(
    'reads the project config, resolves its integrations through the set, and never reads the root config',
    async () => {
      const app = area.project('app', {dependencies: {'@acme/ui': '1.0.0'}});
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/ui']};\n",
      );

      activateFor(app);
      const project = await Project.load(app, {fresh: true});
      expect(project.configPath).toBe(path.join(app, 'astryx.config.mjs'));
      expect(project.integrations).toEqual(['@acme/ui']);
      const [ui] = project.loadedIntegrations;
      expect(ui).toMatchObject({name: '@acme/ui', version: '1.0.0'});
      expect(ui.__autolinked).toBeUndefined();
      expect(ui.__packageDir).toBe(
        path.join(isolated, 'node_modules', '@acme', 'ui'),
      );
      expect(await project.issues()).toEqual([]);
    },
    SLOW,
  );

  it(
    'keeps an installed npm alias when the plan records its resolved directory',
    async () => {
      const app = area.project('alias-project', {
        dependencies: {'@acme/legacy': 'npm:@acme/ui@1.0.0'},
      });
      const aliasDir = installFixturePackage(app, '@acme/legacy', {
        version: '1.0.0',
        topic: 'alias-guide',
      });
      const aliasPackage = JSON.parse(
        fs.readFileSync(path.join(aliasDir, 'package.json'), 'utf-8'),
      );
      writeJson(path.join(aliasDir, 'package.json'), {
        ...aliasPackage,
        name: '@acme/ui',
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/legacy']};\n",
      );

      const plan = activateFor(app, {roots: [newest]});
      expect(plan.mode).toBe('project');
      expect(plan.packages).toContainEqual(
        expect.objectContaining({
          name: '@acme/ui',
          source: 'project',
          dir: aliasDir,
        }),
      );
      const project = await Project.load(app, {fresh: true});
      expect(project.loadedIntegrations).toEqual([
        expect.objectContaining({
          name: '@acme/ui',
          version: '1.0.0',
          __packageDir: aliasDir,
        }),
      ]);
    },
    SLOW,
  );

  it(
    'keeps the package being authored ahead of the set’s copy of it',
    async () => {
      const app = area.project('@acme/ui', {version: '3.0.0-dev'});
      fs.writeFileSync(
        path.join(app, 'astryx.integration.mjs'),
        "export default {docs: './docs'};\n",
      );
      fs.mkdirSync(path.join(app, 'docs'));
      fs.writeFileSync(
        path.join(app, 'docs', 'acme-guide.doc.mjs'),
        topicSource('acme-guide', 'the working copy'),
      );

      const plan = activateFor(app, {integrations: ['@acme/ui']});
      expect(plan).toMatchObject({mode: 'hosted', reason: 'no-astryx-pins'});
      expect(await contributedTopics(app)).toEqual([
        expect.objectContaining({
          topic: 'acme-guide',
          package: '@acme/ui',
          description: 'the working copy',
        }),
      ]);
    },
    SLOW,
  );

  it(
    'writes into the caller cwd and leaves the package root untouched',
    async () => {
      const cwd = area.bare();
      const rootBefore = fs.readdirSync(newest).sort();
      activateFor(cwd);

      const result = await runCli(['init', '--features', 'agents'], cwd);
      expect(result.status).toBe(0);
      expect(fs.existsSync(path.join(cwd, 'AGENTS.md'))).toBe(true);
      expect(fs.readdirSync(newest).sort()).toEqual(rootBefore);
    },
    SLOW,
  );

  it(
    'writes a swizzled Core component into the caller cwd',
    async () => {
      const cwd = area.bare();
      const rootBefore = fs.readdirSync(newest).sort();
      activateFor(cwd);

      const result = await runCli(['swizzle', 'Button', '--json'], cwd);
      expect(result.status).toBe(0);
      expect(
        fs.existsSync(
          path.join(cwd, 'components', 'astryx', 'Button', 'Button.tsx'),
        ),
      ).toBe(true);
      expect(fs.readdirSync(newest).sort()).toEqual(rootBefore);
    },
    SLOW,
  );

  it('keeps project health checks on the project’s own install', () => {
    const cwd = area.bare();
    activateFor(cwd);
    expect(findCoreDir(cwd)).not.toBeNull();
    expect(findProjectCoreDir(cwd)).toBeNull();
    expect(fs.realpathSync(/** @type {string} */ (findCoreDir(cwd)))).toBe(
      fs.realpathSync(REPO_CORE),
    );
  });

  it(
    'runs doctor against the project’s own install, as if no set were active',
    async () => {
      const app = area.project('app', {dependencies: {'@acme/ui': '1.0.0'}});
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/ui']};\n",
      );
      /** @param {Awaited<ReturnType<typeof runChecks>>} report */
      const byId = report =>
        Object.fromEntries(report.checks.map(check => [check.id, check]));
      const without = await runChecks({cwd: app});

      const plan = activateFor(app);
      expect(plan.mode).toBe('matched');
      const within = await runChecks({cwd: app});
      // The set still serves the run; doctor alone does not see it.
      expect(findCoreDir(app)).not.toBeNull();

      expect(byId(within)['configured-integrations'].status).toBe('fail');
      expect(within).toEqual(without);
      expect(JSON.stringify(within)).not.toMatch(/package.set/i);
    },
    SLOW,
  );

  it(
    'runs every doctor integration API and command against the project while a hosted set is active',
    async () => {
      const app = area.project('integration-author', {
        name: '@acme/widgets',
      });
      for (const dir of ['components', 'templates', 'docs']) {
        fs.mkdirSync(path.join(app, dir));
      }
      fs.writeFileSync(
        path.join(app, 'astryx.integration.mjs'),
        "export default {components: './components', templates: './templates', docs: './docs'};\n",
      );
      const kinds = ['validate', 'templates', 'components', 'docs'];
      const before = [];
      for (const kind of kinds) {
        const result = await runCli(
          ['--json', 'doctor', 'integration', kind],
          app,
        );
        before.push({status: result.status, body: json(result)});
      }
      const directBefore = await integrationComponentConflicts(undefined, {
        cwd: app,
      });
      expect(directBefore.data.issues).toContainEqual(
        expect.objectContaining({code: 'core_not_found', severity: 'error'}),
      );

      const plan = activateFor(app);
      expect(plan).toMatchObject({mode: 'hosted', reason: 'no-astryx-pins'});
      expect(findCoreDir(app)).not.toBeNull();

      const directWithin = await integrationComponentConflicts(undefined, {
        cwd: app,
      });
      expect(directWithin).toEqual(directBefore);
      for (const [index, kind] of kinds.entries()) {
        const result = await runCli(
          ['--json', 'doctor', 'integration', kind],
          app,
        );
        expect({status: result.status, body: json(result)}, kind).toEqual(
          before[index],
        );
      }
    },
    SLOW,
  );
});

describe('the root serves only what the plan admits', () => {
  it(
    'loads no config entry the approved list leaves out',
    async () => {
      const app = area.project('app', {dependencies: {react: '^19.0.0'}});
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/extra', '@acme/ui']};\n",
      );
      const plan = activateFor(app, {integrations: ['@acme/ui']});
      expect(plan).toMatchObject({mode: 'hosted', reason: 'no-astryx-pins'});

      const project = await Project.load(app, {fresh: true});
      // The left-out entry reads as not installed, exactly as without a set.
      expect(
        project.loadedIntegrations.map(integration => [
          integration.name,
          integration.version,
          integration.__loadError ? 'not installed' : integration.__packageDir,
        ]),
      ).toEqual([
        ['@acme/extra', undefined, 'not installed'],
        ['@acme/ui', '2.0.0', path.join(newest, 'node_modules', '@acme', 'ui')],
      ]);
    },
    SLOW,
  );

  it(
    'serves a pinned config entry only at the pinned version',
    async () => {
      const app = area.project('app', {dependencies: {'@acme/ui': '1.0.0'}});
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/ui', '@acme/extra']};\n",
      );
      const plan = activateFor(app);
      expect(plan.root).toBe(isolated);
      const project = await Project.load(app, {fresh: true});
      // @acme/extra is undeclared, so the matched root does not serve it.
      expect(
        project.loadedIntegrations.map(integration => [
          integration.name,
          integration.version,
          integration.__loadError ? 'not installed' : integration.__packageDir,
        ]),
      ).toEqual([
        [
          '@acme/ui',
          '1.0.0',
          path.join(isolated, 'node_modules', '@acme', 'ui'),
        ],
        ['@acme/extra', undefined, 'not installed'],
      ]);
    },
    SLOW,
  );

  it(
    'does not load a configured package the project did not declare or the plan approve',
    async () => {
      const app = area.project('configured-undeclared', {
        dependencies: {react: '^19.0.0'},
      });
      installFixturePackage(app, '@acme/stray', {
        version: '9.9.9',
        topic: 'stray-guide',
      });
      const legacyDir = path.join(app, 'node_modules', 'legacy-ui');
      fs.mkdirSync(path.join(legacyDir, 'docs'), {recursive: true});
      writeJson(path.join(legacyDir, 'package.json'), {
        name: 'legacy-ui',
        version: '3.0.0',
        astryx: {docs: './docs'},
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/stray']};\n",
      );
      const plan = activateFor(app, {
        roots: [newest],
        integrations: ['@acme/ui'],
      });
      expect(plan.packages.some(pkg => pkg.name === '@acme/stray')).toBe(false);
      expect(discoverExternalPackages(app).map(pkg => pkg.name)).not.toContain(
        'legacy-ui',
      );
      expect(resolvePackageDir('@acme/stray', app)).toBe(
        path.join(app, 'node_modules', '@acme', 'stray'),
      );

      const project = await Project.load(app, {fresh: true});
      expect(project.loadedIntegrations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: '@acme/stray',
            __loadError: expect.stringContaining(
              "not declared in this project's package.json",
            ),
          }),
        ]),
      );
      expect((await project.docs()).names()).not.toContain('stray-guide');
    },
    SLOW,
  );

  it(
    'uses an installed configured package in a project-only plan even when it is not declared directly',
    async () => {
      const app = area.project('configured-transitive', {
        dependencies: {'@acme/ui': '1.0.0'},
      });
      installFixturePackage(app, '@acme/ui', {version: '1.0.0'});
      installFixturePackage(app, '@acme/transitive', {
        version: '3.0.0',
        topic: 'transitive-guide',
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/transitive']};\n",
      );

      const plan = activateFor(app, {roots: [newest]});
      expect(plan.mode).toBe('project');
      expect(plan.packages.some(pkg => pkg.name === '@acme/transitive')).toBe(
        false,
      );

      const project = await Project.load(app, {fresh: true});
      expect(project.loadedIntegrations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: '@acme/transitive',
            version: '3.0.0',
            __packageDir: path.join(app, 'node_modules', '@acme', 'transitive'),
          }),
        ]),
      );
      expect((await project.docs()).names()).toContain('transitive-guide');
    },
    SLOW,
  );

  it(
    'keeps missing-package and missing-manifest diagnoses for declared config entries',
    async () => {
      const app = area.project('configured-broken', {
        dependencies: {
          '@acme/missing': '1.0.0',
          '@acme/no-manifest': '1.0.0',
        },
      });
      const noManifest = path.join(app, 'node_modules', '@acme', 'no-manifest');
      fs.mkdirSync(noManifest, {recursive: true});
      writeJson(path.join(noManifest, 'package.json'), {
        name: '@acme/no-manifest',
        version: '1.0.0',
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/missing', '@acme/no-manifest']};\n",
      );
      activateFor(app, {roots: [newest], integrations: ['@acme/ui']});

      const project = await Project.load(app, {fresh: true});
      const errors = Object.fromEntries(
        project.loadedIntegrations.map(integration => [
          integration.name,
          integration.__loadError,
        ]),
      );
      expect(errors['@acme/missing']).toMatch(/Install it first/);
      expect(errors['@acme/no-manifest']).toMatch(
        /no conventional root manifest/,
      );
    },
    SLOW,
  );

  it('keeps every installed legacy package in a project-only plan', () => {
    const app = area.project('legacy-project', {
      dependencies: {'legacy-ui': '3.0.0'},
    });
    for (const [name, declared] of [
      ['legacy-ui', true],
      ['transitive-legacy', false],
    ]) {
      const dir = path.join(app, 'node_modules', name);
      fs.mkdirSync(path.join(dir, 'docs'), {recursive: true});
      writeJson(path.join(dir, 'package.json'), {
        name,
        version: declared ? '3.0.0' : '9.0.0',
        astryx: {docs: './docs'},
      });
    }

    const plan = activateFor(app, {roots: [newest]});
    expect(plan.mode).toBe('project');
    expect(
      plan.packages
        .filter(pkg => ['legacy-ui', 'transitive-legacy'].includes(pkg.name))
        .map(pkg => [pkg.name, pkg.version, pkg.source]),
    ).toEqual([
      ['legacy-ui', '3.0.0', 'project'],
      ['transitive-legacy', '9.0.0', 'project'],
    ]);
    expect(discoverExternalPackages(app).map(pkg => pkg.name)).toEqual([
      'legacy-ui',
      'transitive-legacy',
    ]);
  });

  it(
    'resolves a configured approved package from the root, not an undeclared stray',
    async () => {
      const app = area.project('configured-stray', {
        dependencies: {react: '^19.0.0'},
      });
      installFixturePackage(app, '@acme/ui', {
        version: '0.1.0',
        topic: 'acme-guide',
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/ui']};\n",
      );
      activateFor(app, {roots: [newest], integrations: ['@acme/ui']});

      const project = await Project.load(app, {fresh: true});
      expect(project.loadedIntegrations).toHaveLength(1);
      expect(project.loadedIntegrations[0]).toMatchObject({
        name: '@acme/ui',
        version: '2.0.0',
        __packageDir: path.join(newest, 'node_modules', '@acme', 'ui'),
      });
    },
    SLOW,
  );

  it(
    'resolves approved packages from the root, never from strays in the caller’s node_modules',
    async () => {
      const app = area.project('app', {dependencies: {react: '^19.0.0'}});
      // Copies the project holds without declaring them.
      installFixturePackage(app, '@acme/ui', {
        version: '0.1.0',
        topic: 'acme-guide',
      });
      installFixturePackage(app, '@acme/absent', {
        version: '9.9.9',
        topic: 'absent-guide',
      });
      const plan = activateFor(app, {
        roots: [newest],
        integrations: ['@acme/ui', '@acme/absent'],
      });
      expect(plan.missing).toEqual(['@acme/absent']);

      const project = await Project.load(app, {fresh: true});
      expect(
        project.loadedIntegrations.map(integration => [
          integration.name,
          integration.version,
          integration.__packageDir,
        ]),
      ).toEqual([
        ['@acme/ui', '2.0.0', path.join(newest, 'node_modules', '@acme', 'ui')],
      ]);
      expect(await contributedTopics(app)).toEqual([
        expect.objectContaining({
          topic: 'acme-guide',
          description: '@acme/ui 2.0.0',
        }),
      ]);
    },
    SLOW,
  );
});

describe('the host seam has one supported boundary', () => {
  it('exports only the host entry and stays absent from the environment and CLI', async () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(REPO_CLI, 'package.json'), 'utf-8'),
    );
    const targets = JSON.stringify(pkg.exports);
    expect(pkg.exports['./host']).toEqual({
      types: './host/index.d.ts',
      import: './host/index.mjs',
    });
    expect(targets).not.toMatch(/foundation\/runtime|package-set|package-root/);
    expect(Object.keys(pkg.exports)).not.toContain('./*');

    const host = await import('@astryxdesign/cli/host');
    expect(Object.keys(host)).toEqual(['runHostedCli']);
    expect(host.runHostedCli).toBe(runHostedCli);

    for (const file of [
      'package-root.mjs',
      'package-set.mjs',
      'locked-versions.mjs',
    ]) {
      const source = fs.readFileSync(
        path.join(REPO_CLI, 'foundation', 'runtime', file),
        'utf-8',
      );
      expect(source, file).not.toMatch(/process\.env/);
    }

    const help = await runCli(['help'], area.bare());
    expect(help.stdout + help.stderr).not.toMatch(/package.set/i);
  });
});

describe('host-supplied integration handlers', () => {
  it(
    'answers an integration’s discover source in-process, keeping its provenance',
    async () => {
      installFixturePackage(newest, '@acme/catalog', {
        version: '1.0.0',
        manifestExtra:
          "export async function discover() { throw new Error('needs an external catalog binary'); }\n",
      });
      const cwd = area.bare();
      const cacheDir = path.join(area.base, 'discover-cache');

      // Without a handler the manifest's own source runs and fails.
      activateFor(cwd, {roots: [newest], integrations: ['@acme/catalog']});
      const unhandled = await callSources(
        await Project.load(cwd, {fresh: true}),
        {},
        {cacheDir},
      );
      expect(unhandled.sources).toEqual([
        expect.objectContaining({
          from: '@acme/catalog',
          status: 'failed',
          error: expect.stringContaining('needs an external catalog binary'),
        }),
      ]);

      deactivatePackageSet();
      activateFor(cwd, {
        roots: [newest],
        integrations: ['@acme/catalog'],
        handlers: {
          '@acme/catalog': {
            discover: async () => ({
              schemaVersion: 1,
              source: {
                name: 'Host catalog',
                generatedAt: '2026-01-01T00:00:00.000Z',
                complete: true,
              },
              packages: [
                {
                  package: '@acme/charts',
                  integration: '@acme/charts',
                  aliases: [],
                  latest: '1.0.0',
                  versions: [
                    {
                      version: '1.0.0',
                      publishedAt: null,
                      prerelease: false,
                      status: 'ok',
                    },
                  ],
                  contributions: [{kind: 'component', name: 'LineChart'}],
                },
              ],
            }),
          },
        },
      });
      const project = await Project.load(cwd, {fresh: true});
      const [catalog] = project.loadedIntegrations;
      expect(catalog).toMatchObject({
        name: '@acme/catalog',
        __discoverFromHost: true,
      });

      const handled = await callSources(project, {}, {cacheDir});
      expect(handled.sources).toEqual([
        expect.objectContaining({
          from: '@acme/catalog',
          name: 'Host catalog',
          status: 'fresh',
        }),
      ]);
      expect(handled.packages).toEqual([
        expect.objectContaining({
          package: '@acme/charts',
          source: 'Host catalog',
        }),
      ]);
    },
    SLOW,
  );

  it(
    'keeps a project-installed integration’s discover source when another pin uses the package set',
    async () => {
      const app = area.project('project-catalog', {
        dependencies: {'@acme/catalog': '1.0.0', '@acme/ui': '1.0.0'},
      });
      installFixturePackage(app, '@acme/catalog', {
        version: '1.0.0',
        manifestExtra: `export async function discover() {
  return ${JSON.stringify({
    schemaVersion: 1,
    source: {
      name: 'Project catalog',
      generatedAt: '2026-01-01T00:00:00.000Z',
      complete: true,
    },
    packages: [],
  })};
}\n`,
      });
      fs.writeFileSync(
        path.join(app, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/catalog']};\n",
      );
      let hostCalled = false;
      const plan = activateFor(app, {
        handlers: {
          '@acme/catalog': {
            discover: async () => {
              hostCalled = true;
              throw new Error('the host must not replace a project package');
            },
          },
        },
      });
      expect(plan.mode).toBe('matched');
      expect(plan.packages).toContainEqual(
        expect.objectContaining({
          name: '@acme/catalog',
          source: 'project',
        }),
      );

      const project = await Project.load(app, {fresh: true});
      const catalog = project.loadedIntegrations.find(
        integration => integration.name === '@acme/catalog',
      );
      expect(catalog).toBeDefined();
      expect(catalog?.__discoverFromHost).toBeUndefined();
      const result = await callSources(
        project,
        {},
        {
          cacheDir: path.join(area.base, 'discover-cache-project-package'),
        },
      );
      expect(hostCalled).toBe(false);
      expect(result.sources).toEqual([
        expect.objectContaining({
          from: '@acme/catalog',
          name: 'Project catalog',
          status: 'fresh',
        }),
      ]);
    },
    SLOW,
  );

  it(
    'supplies one source for an admitted integration with no package export',
    async () => {
      const cwd = area.bare();
      const cacheDir = path.join(area.base, 'discover-cache-no-export');
      activateFor(cwd, {
        roots: [newest],
        integrations: ['@acme/ui'],
        handlers: {
          '@acme/ui': {
            discover: async () => ({
              schemaVersion: 1,
              source: {
                name: 'Host-only catalog',
                generatedAt: '2026-01-01T00:00:00.000Z',
                complete: true,
              },
              packages: [],
            }),
          },
        },
      });

      const project = await Project.load(cwd, {fresh: true});
      expect(project.loadedIntegrations[0]).toMatchObject({
        name: '@acme/ui',
        __discoverFromHost: true,
      });
      const result = await callSources(project, {}, {cacheDir});
      expect(result.sources).toEqual([
        expect.objectContaining({
          from: '@acme/ui',
          name: 'Host-only catalog',
          status: 'fresh',
        }),
      ]);
    },
    SLOW,
  );

  it(
    'ignores a host source keyed to a package outside the plan',
    async () => {
      const cwd = area.bare();
      let called = false;
      activateFor(cwd, {
        roots: [newest],
        integrations: ['@acme/ui'],
        handlers: {
          '@acme/extra': {
            discover: async () => {
              called = true;
              throw new Error('an undeclared source must not run');
            },
          },
        },
      });

      const project = await Project.load(cwd, {fresh: true});
      expect(project.loadedIntegrations.map(item => item.name)).toEqual([
        '@acme/ui',
      ]);
      const result = await callSources(
        project,
        {},
        {
          cacheDir: path.join(area.base, 'discover-cache-undeclared'),
        },
      );
      expect(called).toBe(false);
      expect(result.sources).toEqual([]);
    },
    SLOW,
  );

  it(
    'reports a malformed handler like a malformed export, without hiding the integration',
    async () => {
      const cwd = area.bare();
      activateFor(cwd, {
        roots: [newest],
        integrations: ['@acme/ui'],
        handlers: {
          '@acme/ui': {discover: /** @type {any} */ ('not a function')},
        },
      });
      const project = await Project.load(cwd, {fresh: true});
      const [ui] = project.loadedIntegrations;
      expect(ui.name).toBe('@acme/ui');
      expect(ui.docs).toBe(
        path.join(newest, 'node_modules', '@acme', 'ui', 'docs'),
      );
      expect(ui.__discover).toBeUndefined();
      expect(ui.__discoverError).toMatch(/Host handler for @acme\/ui/);
    },
    SLOW,
  );
});
