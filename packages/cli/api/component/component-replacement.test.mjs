// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Component replacement end to end (spec:AST-035 FR10–FR15): a consumer
 * project with real integration packages on disk, loaded through the real
 * Project, read through every component surface.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {component} from './component.mjs';
import {search} from '../search/search.mjs';
import {swizzleCopy} from '../swizzle/copy/copy.mjs';
import {integrationComponentConflicts} from '../integration/authoring-checks.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {COMPONENT_REPLACES_CLI} from '../../foundation/integrations/cli-requirement.mjs';

const SLOW = 60_000;
const FLOOR = {'@astryxdesign/cli': `>=${COMPONENT_REPLACES_CLI}`};

let tmpDir;

beforeEach(() => {
  // Under the repository so the project resolves the workspace's Core.
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-component-replacement-'),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * An integration package in the consumer's node_modules.
 * @param {string} name
 * @param {Array<{name: string, replaces?: string}>} components
 * @param {Record<string, string>} [peers]
 */
function writeIntegration(name, components, peers) {
  const pkgDir = path.join(tmpDir, 'node_modules', ...name.split('/'));
  const componentsDir = path.join(pkgDir, 'components');
  fs.mkdirSync(componentsDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name,
      version: '1.0.0',
      exports: {'./components/*': './components/*.tsx'},
      ...(peers ? {peerDependencies: peers} : {}),
    }),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    "export default {components: './components'};\n",
  );
  for (const {name: componentName, replaces} of components) {
    fs.writeFileSync(
      path.join(componentsDir, `${componentName}.doc.mjs`),
      `export default ${JSON.stringify({
        type: 'component',
        name: componentName,
        displayName: componentName,
        ...(replaces ? {replaces} : {}),
        keywords: ['acme'],
        usage: {description: `${componentName} for Acme apps.`},
        props: [],
      })};\n`,
    );
    fs.writeFileSync(
      path.join(componentsDir, `${componentName}.tsx`),
      `export function ${componentName}() { return null; }\n`,
    );
  }
}

/**
 * The consumer: its dependencies autolink every integration; `configured`
 * names the ones astryx.config lists, in order.
 * @param {string[]} dependencies
 * @param {string[]} [configured]
 */
function writeConsumer(dependencies, configured) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      version: '1.0.0',
      dependencies: Object.fromEntries(dependencies.map(dep => [dep, '1.0.0'])),
    }),
  );
  if (configured) {
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default {integrations: ${JSON.stringify(configured)}};\n`,
    );
  }
}

/** Every entry of a component.list payload, flattened. */
function listEntries(result) {
  return Object.values(result.data.components).flat();
}

describe('a package that declares the CLI floor', () => {
  beforeEach(() => {
    writeIntegration(
      '@acme/nav',
      [{name: 'AcmeSideNav', replaces: 'SideNav'}],
      FLOOR,
    );
    writeConsumer(['@acme/nav']);
  });

  it(
    'answers to the Core name in component detail, naming its own package',
    async () => {
      const detail = await component('SideNav', {cwd: tmpDir});
      expect(detail.type).toBe('component.detail');
      expect(detail.package).toBe('@acme/nav');
      expect(detail.data).toMatchObject({
        name: 'AcmeSideNav',
        package: '@acme/nav',
      });

      const own = await component('AcmeSideNav', {cwd: tmpDir});
      expect(own.data).toEqual(detail.data);

      const props = await component('SideNav', {cwd: tmpDir, props: true});
      expect(props.package).toBe('@acme/nav');
    },
    SLOW,
  );

  it(
    'keeps the Core original behind an explicit Core selection',
    async () => {
      const core = await component('SideNav', {
        cwd: tmpDir,
        package: '@astryxdesign/core',
      });
      expect(core.package).toBe('@astryxdesign/core');
      expect(core.data.name).toBe('SideNav');

      const qualified = await component('@astryxdesign/core/SideNav', {
        cwd: tmpDir,
      });
      expect(qualified.package).toBe('@astryxdesign/core');

      const batch = await component(['SideNav', '@astryxdesign/core/SideNav'], {
        cwd: tmpDir,
      });
      expect(batch.data.results.map(result => result.result.package)).toEqual([
        '@acme/nav',
        '@astryxdesign/core',
      ]);
    },
    SLOW,
  );

  it(
    'takes the Core slot at every list detail level, once',
    async () => {
      for (const detail of /** @type {const} */ ([
        'brief',
        'compact',
        'full',
      ])) {
        const entries = listEntries(
          await component(undefined, {cwd: tmpDir, list: true, detail}),
        );
        const named = entries.filter(
          entry =>
            /SideNav$/.test(entry.name) && !/SideNav[A-Z]/.test(entry.name),
        );
        expect(named, detail).toHaveLength(1);
        expect(named[0], detail).toMatchObject({
          name: 'AcmeSideNav',
          package: '@acme/nav',
        });
      }
      const navigation = await component(undefined, {
        cwd: tmpDir,
        category: 'Navigation',
      });
      expect(navigation.data.components.Navigation).toContainEqual(
        expect.objectContaining({name: 'AcmeSideNav', package: '@acme/nav'}),
      );
      expect(
        navigation.data.components.Navigation.map(entry => entry.name),
      ).not.toContain('SideNav');
    },
    SLOW,
  );

  it(
    'is the component search returns for the Core name',
    async () => {
      const found = await search('SideNav', {cwd: tmpDir, type: 'component'});
      const results = found.data.results ?? Object.values(found.data).flat();
      const components = results.filter(
        result => result.domain === 'component',
      );
      expect(components[0]).toMatchObject({
        name: 'AcmeSideNav',
        package: '@acme/nav',
        score: 100,
      });
      expect(
        components.some(
          result =>
            result.name === 'SideNav' &&
            result.package === '@astryxdesign/core',
        ),
      ).toBe(false);
    },
    SLOW,
  );

  it(
    'is what an unqualified swizzle copies; Core stays one selection away',
    async () => {
      const copied = await swizzleCopy('SideNav', {
        cwd: tmpDir,
        output: './out',
      });
      expect(copied.package).toBe('@acme/nav');
      expect(copied.data).toMatchObject({
        component: 'AcmeSideNav',
        package: '@acme/nav',
      });
      expect(
        fs.existsSync(
          path.join(tmpDir, 'out', 'AcmeSideNav', 'AcmeSideNav.tsx'),
        ),
      ).toBe(true);

      const core = await swizzleCopy('SideNav', {
        cwd: tmpDir,
        output: './core',
        package: '@astryxdesign/core',
      });
      expect(core.data.package).toBe('@astryxdesign/core');
      expect(fs.existsSync(path.join(tmpDir, 'core', 'SideNav'))).toBe(true);
    },
    SLOW,
  );

  it(
    'routes issues and reports no findings for a valid replacement',
    async () => {
      const project = await Project.load(tmpDir);
      expect(
        (await project.componentReplacements()).forTarget('SideNav')?.package,
      ).toBe('@acme/nav');
      expect(
        (await project.issues()).filter(issue => /component/.test(issue.code)),
      ).toEqual([]);
      const checked = await integrationComponentConflicts('@acme/nav', {
        cwd: tmpDir,
      });
      expect(checked.data.issues).toEqual([]);
      expect(checked.data.conflicts).toEqual([]);
    },
    SLOW,
  );
});

describe('a package published without the CLI floor', () => {
  beforeEach(() => {
    writeIntegration('@acme/old', [
      {name: 'OldTopNav', replaces: 'TopNav'},
      {name: 'Missing', replaces: 'NoSuchComponent'},
    ]);
    writeConsumer(['@acme/old']);
  });

  it(
    'keeps the component under its own name and Core selected',
    async () => {
      const topNav = await component('TopNav', {cwd: tmpDir});
      expect(topNav.package).toBe('@astryxdesign/core');
      expect(topNav.data.name).toBe('TopNav');

      const own = await component('OldTopNav', {cwd: tmpDir});
      expect(own.package).toBe('@acme/old');

      const entries = listEntries(
        await component(undefined, {cwd: tmpDir, list: true}),
      );
      expect(entries).toContainEqual({
        name: 'TopNav',
        package: '@astryxdesign/core',
      });
      expect(entries).toContainEqual(
        expect.objectContaining({name: 'OldTopNav', package: '@acme/old'}),
      );

      const found = await search('TopNav', {cwd: tmpDir, type: 'component'});
      const results = found.data.results ?? Object.values(found.data).flat();
      expect(results[0]).toMatchObject({
        name: 'TopNav',
        package: '@astryxdesign/core',
      });
    },
    SLOW,
  );

  it(
    'reports every finding to its author as a warning, and nothing to the app',
    async () => {
      const checked = await integrationComponentConflicts('@acme/old', {
        cwd: tmpDir,
      });
      expect(
        checked.data.issues
          .map(issue => `${issue.severity}:${issue.code}`)
          .sort(),
      ).toEqual(
        [
          'warning:inactive_component_replacement',
          'warning:inactive_component_replacement',
          'warning:missing_component_replacement_target',
        ].sort(),
      );
      // Project issues feed project Doctor and the everyday-command nudge: an
      // app that loads a package without the floor sees nothing new.
      const project = await Project.load(tmpDir);
      expect(
        (await project.issues()).filter(issue =>
          /replacement/.test(issue.code),
        ),
      ).toEqual([]);
    },
    SLOW,
  );
});

describe('an opted-in package with an invalid declaration', () => {
  it(
    'is an error and never replaces Core',
    async () => {
      writeIntegration(
        '@acme/bad',
        [
          {name: 'BadThing', replaces: 'NoSuchComponent'},
          {name: 'Button', replaces: 'Card'},
        ],
        FLOOR,
      );
      writeConsumer(['@acme/bad']);
      const checked = await integrationComponentConflicts('@acme/bad', {
        cwd: tmpDir,
      });
      expect(
        checked.data.issues
          .map(issue => `${issue.severity}:${issue.code}`)
          .sort(),
      ).toEqual(
        [
          'error:invalid_component_replacement',
          'error:missing_component_replacement_target',
        ].sort(),
      );
      const card = await component('Card', {cwd: tmpDir});
      expect(card.package).toBe('@astryxdesign/core');
    },
    SLOW,
  );
});

describe('several packages replacing one Core component', () => {
  it(
    'lets the later configured package win, and Doctor warns',
    async () => {
      writeIntegration(
        '@acme/first',
        [{name: 'FirstNav', replaces: 'SideNav'}],
        FLOOR,
      );
      writeIntegration(
        '@acme/second',
        [{name: 'SecondNav', replaces: 'SideNav'}],
        FLOOR,
      );
      writeConsumer(
        ['@acme/first', '@acme/second'],
        ['@acme/first', '@acme/second'],
      );
      const detail = await component('SideNav', {cwd: tmpDir});
      expect(detail.package).toBe('@acme/second');
      const project = await Project.load(tmpDir);
      const issues = (await project.issues()).filter(
        issue => issue.code === 'ambiguous_component_replacement',
      );
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        package: '@acme/second',
        severity: 'warning',
      });
    },
    SLOW,
  );

  it(
    'lets an explicitly configured package beat an autolinked one',
    async () => {
      writeIntegration(
        '@acme/explicit',
        [{name: 'ExplicitNav', replaces: 'SideNav'}],
        FLOOR,
      );
      writeIntegration(
        '@acme/auto',
        [{name: 'AutoNav', replaces: 'SideNav'}],
        FLOOR,
      );
      writeConsumer(['@acme/explicit', '@acme/auto'], ['@acme/explicit']);
      const detail = await component('SideNav', {cwd: tmpDir});
      expect(detail.package).toBe('@acme/explicit');
    },
    SLOW,
  );
});
