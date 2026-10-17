// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file An integration component is one component at every surface under the
 * name its doc documents. `Slides.doc.mjs` with `name: 'AcmeCarousel'` beside a
 * `Slides.tsx` that exports `AcmeCarousel`: the list, `component <Name>`,
 * search and Doctor's package checks all know it by that name, and the file
 * name still opens the doc as before.
 *
 * Fixtures live under a repo-local temp dir, not /tmp, because Vite refuses to
 * dynamically import a module from outside the project root.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {component} from './component.mjs';
import {search} from '../search/search.mjs';
import {validateIntegration} from '../integration/validate-integration.mjs';
import {integrationComponentConflicts} from '../integration/authoring-checks.mjs';
import {swizzleCopy} from '../swizzle/copy/copy.mjs';
import {gapReport} from '../gap-report/gap-report.mjs';
import {COMPONENT_REPLACES_CLI} from '../../foundation/integrations/cli-requirement.mjs';

const SLOW = 30_000;

/** @type {string} */
let tmpDir;
/** @type {string} */
let pkgDir;

/**
 * @param {string} file path under the package's src/, without extension
 * @param {string} name
 * @param {string} source
 * @param {string} description
 * @param {object} [extra] more doc fields
 */
function writeComponent(file, name, source, description, extra = {}) {
  const target = path.join(pkgDir, 'src', file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(`${target}.tsx`, source);
  fs.writeFileSync(
    `${target}.doc.mjs`,
    `export default ${JSON.stringify(
      {
        type: 'component',
        name,
        displayName: name,
        import: `@acme/widgets/${file}`,
        usage: {description},
        props: [],
        ...extra,
      },
      null,
      2,
    )};\n`,
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-export-name-test-'),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    "export default {integrations: ['@acme/widgets']};\n",
  );
  pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name: '@acme/widgets',
      version: '1.0.0',
      exports: {
        './gallery/Slides': './src/gallery/Slides.tsx',
        './gallery/Overlays': './src/gallery/Overlays.tsx',
        './AcmeBadge': './src/AcmeBadge.tsx',
      },
    }),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    "export default {components: './src', issuesUrl: 'https://example.com/acme/issues'};\n",
  );
  writeComponent(
    'gallery/Slides',
    'AcmeCarousel',
    'export function AcmeCarousel() { return null; }\nexport function useSlides() { return []; }\n',
    'Cycles through a row of slides.',
  );
  writeComponent(
    'AcmeBadge',
    'AcmeBadge',
    'export function AcmeBadge() { return null; }\n',
    'A small status label.',
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {any} list @returns {string[]} the integration's listed names */
function listedNames(list) {
  return Object.values(list.data.components)
    .flat()
    .filter(entry => entry.package === '@acme/widgets')
    .map(entry => entry.name)
    .sort();
}

describe('a component doc that names another export of its file', () => {
  it(
    "leaves a name a legacy docs package documents to that package's doc",
    async () => {
      const legacy = path.join(tmpDir, 'node_modules', '@legacy', 'docs');
      fs.mkdirSync(path.join(legacy, 'docs'), {recursive: true});
      fs.writeFileSync(
        path.join(legacy, 'package.json'),
        JSON.stringify({name: '@legacy/docs', astryx: {docs: './docs'}}),
      );
      fs.writeFileSync(
        path.join(legacy, 'docs', 'AcmeCarousel.doc.mjs'),
        "export default {type: 'component', name: 'AcmeCarousel', usage: {description: 'Legacy.'}, props: []};\n",
      );
      const cwd = tmpDir;
      expect((await component('AcmeCarousel', {cwd})).data.package).toBe(
        '@legacy/docs',
      );
      const scoped = {cwd, package: '@acme/widgets'};
      expect((await component('AcmeCarousel', scoped)).data.package).toBe(
        '@acme/widgets',
      );
    },
    SLOW,
  );

  it(
    'is listed, opened and found by the export name',
    async () => {
      expect(
        listedNames(await component(undefined, {cwd: tmpDir, list: true})),
      ).toEqual(['AcmeBadge', 'AcmeCarousel']);

      const detail = await component('AcmeCarousel', {cwd: tmpDir});
      expect(detail.type).toBe('component.detail');
      expect(detail.data).toMatchObject({
        name: 'AcmeCarousel',
        package: '@acme/widgets',
        import: '@acme/widgets/gallery/Slides',
        sourceAvailable: true,
      });

      const hits = (
        await search('AcmeCarousel', {cwd: tmpDir, type: 'component'})
      ).data.results;
      expect(hits[0]).toMatchObject({
        name: 'AcmeCarousel',
        package: '@acme/widgets',
        import: '@acme/widgets/gallery/Slides',
      });

      // The file name opens the same doc, as it did before, routes a gap
      // report to the package, and search finds the component by it, a word
      // of it included.
      expect((await component('Slides', {cwd: tmpDir})).data.name).toBe(
        'AcmeCarousel',
      );
      const report = {cwd: tmpDir, category: 'other', reason: 'Needs a size.'};
      expect((await gapReport('Slides', report)).data.package).toBe(
        '@acme/widgets',
      );
      for (const query of ['Slides', 'slide']) {
        const byFileName = (
          await search(query, {cwd: tmpDir, type: 'component'})
        ).data.results;
        expect(byFileName[0]?.name).toBe('AcmeCarousel');
      }
    },
    SLOW,
  );

  it(
    "leaves a Core name to Core unless --package names it, and passes Doctor's package checks",
    async () => {
      // Overlays.tsx exports Dialog, a Core name, and nothing named Overlays.
      writeComponent(
        'gallery/Overlays',
        'Dialog',
        'export function AcmeOverlays() { return null; }\nexport function Dialog() { return null; }\n',
        'Overlays.',
      );

      const validation = await validateIntegration(undefined, {cwd: pkgDir});
      expect(validation.data.issues).toEqual([]);

      const conflicts = await integrationComponentConflicts(undefined, {
        cwd: pkgDir,
      });
      expect(conflicts.data.conflicts.map(conflict => conflict.name)).toEqual([
        'Dialog',
      ]);

      // Lookups by the bare name still answer with Core's Dialog, as before.
      const cwd = tmpDir;
      const core = '@astryxdesign/core';
      expect((await component('Dialog', {cwd})).data.package).toBe(core);
      expect((await component('Dialog', {cwd, props: true})).package).toBe(
        core,
      );
      expect((await swizzleCopy('Dialog', {cwd})).package).toBe(core);
      const report = {cwd, category: 'other', reason: 'Needs a size.'};
      expect((await gapReport('Dialog', report)).data.package).toBe(core);
      // The list and --package reach the integration's Dialog.
      const scoped = {cwd, package: '@acme/widgets'};
      expect((await component('Dialog', scoped)).data.import).toBe(
        '@acme/widgets/gallery/Overlays',
      );
      expect(
        listedNames(await component(undefined, {cwd, list: true})),
      ).toContain('Dialog');
      // Search shows both; the package's hit names its package and follows
      // Core's.
      const hits = (await search('Dialog', {cwd, type: 'component'})).data
        .results;
      const ours = hits.findIndex(hit => hit.package === '@acme/widgets');
      expect(hits[0]).toMatchObject({name: 'Dialog', package: core});
      expect(hits[ours]).toMatchObject({
        name: 'Dialog',
        command: 'astryx component Dialog --package @acme/widgets',
      });
    },
    SLOW,
  );

  it(
    'leaves a Core name with no folder of its own unknown to swizzle, as before',
    async () => {
      // Core documents DialogHeader inside Dialog's doc, with no folder.
      writeComponent(
        'gallery/Header',
        'DialogHeader',
        'export function DialogHeader() { return null; }\n',
        'A header.',
      );
      const cwd = tmpDir;
      expect((await component('DialogHeader', {cwd})).data.package).toBe(
        '@astryxdesign/core',
      );
      await expect(swizzleCopy('DialogHeader', {cwd})).rejects.toMatchObject({
        code: 'ERR_UNKNOWN_COMPONENT',
      });
      const scoped = {cwd, package: '@acme/widgets'};
      expect((await swizzleCopy('DialogHeader', scoped)).package).toBe(
        '@acme/widgets',
      );
    },
    SLOW,
  );

  it(
    "leaves a name to another package's file-named doc even when that doc is invalid",
    async () => {
      writeComponent(
        'gallery/Strip',
        'AcmeTab',
        'export function AcmeTab() { return null; }\n',
        'A strip of tabs.',
      );
      const beta = path.join(tmpDir, 'node_modules', '@beta', 'kit');
      fs.mkdirSync(path.join(beta, 'src'), {recursive: true});
      for (const [file, text] of Object.entries({
        'package.json': '{"name": "@beta/kit", "version": "1.0.0"}',
        'astryx.integration.mjs': "export default {components: './src'};",
        'src/AcmeTab.tsx': 'export function AcmeTab() { return null; }',
        // props must be an array: the loader rejects this doc.
        'src/AcmeTab.doc.mjs':
          "export default {type: 'component', name: 'AcmeTab', props: 'x'};",
      })) {
        fs.writeFileSync(path.join(beta, file), `${text}\n`);
      }
      fs.writeFileSync(
        path.join(tmpDir, 'astryx.config.mjs'),
        "export default {integrations: ['@acme/widgets', '@beta/kit']};\n",
      );

      const cwd = tmpDir;
      expect((await component('AcmeTab', {cwd, source: true})).package).toBe(
        '@beta/kit',
      );
      await expect(component('AcmeTab', {cwd})).rejects.toMatchObject({
        code: 'ERR_INVALID_DOC',
      });
      const report = {cwd, category: 'other', reason: 'Needs a size.'};
      expect((await gapReport('AcmeTab', report)).data.package).toBe(
        '@astryxdesign/core',
      );
      const hit = (
        await search('AcmeTab', {cwd, type: 'component'})
      ).data.results.find(result => result.package === '@acme/widgets');
      expect(hit?.command).toBe(
        'astryx component AcmeTab --package @acme/widgets',
      );
    },
    SLOW,
  );

  it(
    'leaves a file name Core also has to Core in search, as in detail',
    async () => {
      // Badge.doc.mjs documents AcmeStatusBadge; its file name is Core's.
      writeComponent(
        'status/Badge',
        'AcmeStatusBadge',
        'export function AcmeStatusBadge() { return null; }\n',
        'Shows a status.',
      );
      const cwd = tmpDir;
      const [first] = (await search('Badge', {cwd, type: 'component'})).data
        .results;
      expect(first).toMatchObject({
        name: 'Badge',
        package: '@astryxdesign/core',
      });
      expect((await component('Badge', {cwd})).data.package).toBe(
        '@astryxdesign/core',
      );
      const [own] = (await search('AcmeStatusBadge', {cwd, type: 'component'}))
        .data.results;
      expect(own).toMatchObject({
        name: 'AcmeStatusBadge',
        command: 'astryx component AcmeStatusBadge',
      });
    },
    SLOW,
  );

  it(
    'copies a replacement recorded under its export into its file name folder, as before',
    async () => {
      const manifest = path.join(pkgDir, 'package.json');
      fs.writeFileSync(
        manifest,
        JSON.stringify({
          ...JSON.parse(fs.readFileSync(manifest, 'utf-8')),
          peerDependencies: {
            '@astryxdesign/cli': `>=${COMPONENT_REPLACES_CLI}`,
          },
        }),
      );
      writeComponent(
        'gallery/Slides',
        'AcmeCarousel',
        'export function AcmeCarousel() { return null; }\n',
        'Cycles through a row of slides.',
        {replaces: 'Carousel'},
      );

      const copied = await swizzleCopy('Carousel', {cwd: tmpDir});
      expect(copied.data).toMatchObject({
        package: '@acme/widgets',
        outputDir: path.join('components', 'astryx', 'Slides'),
      });
    },
    SLOW,
  );
});
