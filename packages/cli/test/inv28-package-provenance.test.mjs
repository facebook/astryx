// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file spec cli-surface INV28: every result names the package each artifact
 * comes from. A result about one artifact carries `package` in its envelope,
 * directly after `type`. A result that lists artifacts gives each one its own
 * `package`. Text names the same package; verbatim source output (`--source`,
 * `--showcase`, a template's source) prints only the source.
 *
 * The CLI cases run the real binary over this repository's Core. The
 * integration cases call the API with a project whose one integration
 * contributes a component, and show that the integration's package reaches
 * every projection and search with nothing written for it by its author.
 *
 * @position packages/cli/test — INV28 enforcement
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCli} from '../test-utils/run-cli.mjs';

const CORE = '@astryxdesign/core';
const CLI = '@astryxdesign/cli';
const ACME = '@acme/widgets';

// The API reads integrations through Project.load(). Vitest cannot import an
// astryx.config.mjs from a temporary root, so the project is mocked the way
// component-ownership.test.mjs mocks it, with the integration's files on disk.
// The CLI cases run in a child process and are not affected.
const projectLoadMock = vi.fn();
vi.mock('../foundation/config/project.mjs', async importOriginal => ({
  ...(await importOriginal()),
  Project: {load: (/** @type {unknown[]} */ ...args) => projectLoadMock(...args)},
}));
const {component} = await import('../api/component/component.mjs');
const {search} = await import('../api/search/search.mjs');

// Each case scans the whole Core library; size the budget to the work.
vi.setConfig({testTimeout: 60_000, hookTimeout: 60_000});

/** @param {string[]} args */
async function json(args) {
  const {status, stdout} = await runCli(['--json', ...args]);
  expect(status, stdout).toBe(0);
  return JSON.parse(stdout);
}

/** @param {string[]} args */
async function text(args) {
  const {status, stdout} = await runCli(args);
  expect(status, stdout).toBe(0);
  return stdout;
}

/** @param {unknown} item @param {string} label */
function expectPackage(item, label) {
  expect(/** @type {any} */ (item)?.package, label).toEqual(expect.any(String));
}

describe('INV28: a result about one artifact names its package after `type`', () => {
  /** @type {Array<[string, string[], string]>} */
  const cases = [
    ['component.detail', ['component', 'Button'], CORE],
    ['component.detail.props', ['component', 'Button', '--props'], CORE],
    ['component.detail.source', ['component', 'Button', '--source'], CORE],
    ['component.detail.showcase', ['component', 'Button', '--showcase'], CORE],
    ['component.detail.blocks', ['component', 'Button', '--blocks'], CORE],
    ['docs.detail', ['docs', 'theme'], CLI],
    ['docs.index', ['docs', 'theme', '--index'], CLI],
    ['docs.detail.section', ['docs', 'theme', 'quick-start'], CLI],
    ['docs.node', ['docs', 'cli'], CLI],
    ['template.show', ['template', 'dashboard'], CORE],
    ['template.skeleton', ['template', 'dashboard', '--skeleton'], CORE],
    ['hook.detail', ['hook', 'useCollapsible'], CORE],
    ['hook.detail.params', ['hook', 'useCollapsible', '--params'], CORE],
    ['hook.list', ['hook', '--list'], CORE],
    ['swizzle.list', ['swizzle', '--list'], CORE],
  ];
  for (const [type, args, owner] of cases) {
    it(`${type} names ${owner}, directly after type`, async () => {
      const res = await json(args);
      expect(res.type).toBe(type);
      expect(res.package).toBe(owner);
      expect(Object.keys(res).slice(0, 4)).toEqual([
        'apiVersion',
        'type',
        'package',
        'data',
      ]);
    });
  }
});

describe('INV28: a result that lists artifacts names each one', () => {
  it('search: every result, whatever its domain', async () => {
    const res = await json(['search', 'button']);
    expect(res.package).toBeUndefined();
    expect(res.data.results.length).toBeGreaterThan(0);
    for (const r of res.data.results) expectPackage(r, `${r.domain} ${r.name}`);
    const button = res.data.results.find(
      (/** @type {any} */ r) => r.domain === 'component' && r.name === 'Button',
    );
    expect(button?.package).toBe(CORE);
  });

  it('build.kit: the start, its alternatives, pages, blocks, and components', async () => {
    const res = await json(['build', 'user settings']);
    expect(res.package).toBeUndefined();
    const {start, pages, blocks, domain} = res.data;
    expect(start.package).toBe(CORE);
    for (const item of [...start.alternatives, ...pages, ...blocks, ...domain]) {
      expectPackage(item, item.name);
    }
  });

  it('component.detail.blocks: each block', async () => {
    const {data} = await json(['component', 'Button', '--blocks']);
    for (const block of [data.showcase, ...data.examples, ...data.related]) {
      expectPackage(block, block.name);
    }
  });

  it('docs.index and docs.detail: each section', async () => {
    const index = await json(['docs', 'theme', '--index']);
    for (const s of index.data.sections) expect(s.package, s.id).toBe(CLI);
    const detail = await json(['docs', 'theme']);
    for (const s of detail.data.sections) expect(s.package, s.id).toBe(CLI);
  });

  it('docs.node: each child', async () => {
    const {data} = await json(['docs', 'cli']);
    const children = data.slots.flatMap((/** @type {any} */ s) => s.children);
    expect(children.length).toBeGreaterThan(0);
    for (const child of children) expectPackage(child, child.route);
  });

  it('upgrade.list: each codemod', async () => {
    const {data} = await json(['upgrade', '--list']);
    expect(data.length).toBeGreaterThan(0);
    for (const codemod of data) expect(codemod.package, codemod.name).toBe(CORE);
  });

  it('component.list: each entry, at every detail level', async () => {
    for (const args of [
      ['component', '--list'],
      ['component', '--list', '--detail', 'compact'],
      ['component', '--list', '--detail', 'full'],
    ]) {
      const {data} = await json(args);
      for (const [group, entries] of Object.entries(data.components)) {
        for (const entry of /** @type {any[]} */ (entries)) {
          expectPackage(entry, `${args.join(' ')}: ${group}/${entry.name}`);
        }
      }
    }
  });

  it('template.list and theme.list: each entry', async () => {
    const templates = await json(['template', '--list']);
    for (const t of templates.data) expectPackage(t, t.id);
    const themes = await json(['theme', 'list']);
    for (const t of themes.data) expectPackage(t, t.slug);
  });
});

describe('INV28: text names the same package', () => {
  it('a read of one artifact names its package', async () => {
    expect(await text(['component', 'Button'])).toContain(`package: ${CORE}`);
    expect(await text(['component', 'Button', '--props'])).toContain(`package: ${CORE}`);
    expect(await text(['docs', 'theme', '--index'])).toContain(`package: ${CLI}`);
    expect(await text(['docs', 'theme', 'quick-start'])).toContain(`package: ${CLI}`);
    expect(await text(['template', 'dashboard', '--skeleton'])).toContain(`package: ${CORE}`);
    expect(await text(['hook', 'useCollapsible'])).toContain(`package: ${CORE}`);
  });

  it('verbatim source output prints only the source', async () => {
    const source = await text(['component', 'Button', '--source']);
    expect(source).not.toContain('package:');
    expect(source.trimStart().startsWith('// Copyright')).toBe(true);
  });

  it('build names the package of each template, block, and component', async () => {
    expect(await text(['build', 'user settings'])).toMatch(/package:\s+@astryxdesign\/core/);
  });
});

describe('INV28: an integration names its own package, with nothing written for it', () => {
  /** @type {string} */
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-inv28-'));
    const realCore = path.resolve(import.meta.dirname, '..', '..', 'core');
    fs.mkdirSync(path.join(tmp, 'packages'), {recursive: true});
    fs.symlinkSync(realCore, path.join(tmp, 'packages', 'core'));
    const intDir = path.join(tmp, 'node_modules', '@acme', 'widgets');
    const compDir = path.join(intDir, 'components');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(intDir, 'package.json'),
      JSON.stringify({name: ACME, version: '1.0.0'}),
    );
    fs.writeFileSync(
      path.join(compDir, 'SuperButton.doc.mjs'),
      "export default {\n  type: 'component',\n  name: 'SuperButton',\n  keywords: ['superbutton'],\n" +
        "  usage: {description: 'A button from the widgets integration.'},\n" +
        "  props: [{name: 'power', type: \"'low' | 'high'\", description: 'Power level.'}],\n};\n",
    );
    fs.writeFileSync(
      path.join(compDir, 'SuperButton.tsx'),
      'export function SuperButton() { return null; }\n',
    );
    projectLoadMock.mockReset();
    projectLoadMock.mockResolvedValue({
      integrations: [ACME],
      loadedIntegrations: [
        {
          name: ACME,
          version: '1.0.0',
          components: compDir,
          templates: undefined,
          codemods: undefined,
          __packageDir: intDir,
        },
      ],
    });
  });

  afterEach(() => {
    fs.rmSync(tmp, {recursive: true, force: true});
  });

  it('component detail, props, and source name the integration', async () => {
    const detail = /** @type {any} */ (await component('SuperButton', {cwd: tmp}));
    expect(detail.type).toBe('component.detail');
    expect(detail.package).toBe(ACME);
    expect(detail.data.package).toBe(ACME);
    const props = /** @type {any} */ (await component('SuperButton', {cwd: tmp, props: true}));
    expect(props.package).toBe(ACME);
    const source = /** @type {any} */ (await component('SuperButton', {cwd: tmp, source: true}));
    expect(source.package).toBe(ACME);
  });

  it('a Core component in the same project still names Core', async () => {
    const props = /** @type {any} */ (await component('Button', {cwd: tmp, props: true}));
    expect(props.package).toBe(CORE);
  });

  it('search names the integration on its component', async () => {
    const res = await search('superbutton', {cwd: tmp});
    const hit = res.data.results.find(r => r.name === 'SuperButton');
    expect(hit?.package).toBe(ACME);
  });
});
