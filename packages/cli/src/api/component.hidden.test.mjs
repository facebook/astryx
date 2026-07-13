// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Config-driven component hiding (`hiddenComponents`).
 *
 * These tests stand up a temp consumer project with a fake core package and
 * an installed integration that provides a same-named replacement component,
 * then exercise the public `component()` / `search()` APIs to verify that
 * hiding removes a provider from unscoped surfaces (list, bare-name
 * resolution, search) while explicit --package scoping still resolves it.
 *
 * Each test gets its OWN consumer dir: astryx.config.mjs is loaded via
 * dynamic import, so a reused path would serve a stale module from the ESM
 * cache.
 */

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {component} from './component.mjs';
import {search} from './search.mjs';
import {
  CORE_PACKAGE,
  isComponentHidden,
  parseHiddenComponents,
} from '../lib/component-discovery.mjs';

const tmpDirs = [];

afterEach(() => {
  while (tmpDirs.length > 0) {
    fs.rmSync(tmpDirs.pop(), {recursive: true, force: true});
  }
});

/** Create a consumer project dir with the given astryx.config.mjs body. */
function makeConsumer(configBody) {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-hidden-it-'));
  tmpDirs.push(dir);
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(dir, 'astryx.config.mjs'),
    `export default ${configBody};\n`,
  );
  return dir;
}

/** Write a bare-name component (source + doc) under a components root. */
function writeComponent(rootDir, name, {group, description}) {
  const compDir = path.join(rootDir, name);
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(compDir, `${name}.tsx`),
    `export function ${name}() { return null; }\n`,
  );
  fs.writeFileSync(
    path.join(compDir, `${name}.doc.mjs`),
    `export const docs = {
  name: '${name}',
  displayName: '${name}',
  ${group ? `group: '${group}',` : ''}
  keywords: ['${name.toLowerCase()}'],
  description: '${description}',
  props: [],
};
`,
  );
}

/** Install a fake @astryxdesign/core with src/-layout components. */
function installFakeCore(consumerDir, names) {
  const srcDir = path.join(
    consumerDir,
    'node_modules',
    '@astryxdesign',
    'core',
    'src',
  );
  fs.mkdirSync(srcDir, {recursive: true});
  fs.writeFileSync(
    path.join(path.dirname(srcDir), 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '0.0.0-test'}),
  );
  for (const name of names) {
    writeComponent(srcDir, name, {description: `Core ${name}.`});
  }
}

/** Install an @acme/widgets integration providing the given components. */
function installWidgets(consumerDir, names) {
  const pkgDir = path.join(consumerDir, 'node_modules', '@acme', 'widgets');
  const compDir = path.join(pkgDir, 'components');
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { components: './components' };\n`,
  );
  for (const name of names) {
    // Integration convention is same-stem doc + source in one dir root.
    fs.writeFileSync(
      path.join(compDir, `${name}.tsx`),
      `export function ${name}() { return null; }\n`,
    );
    fs.writeFileSync(
      path.join(compDir, `${name}.doc.mjs`),
      `export const docs = {
  name: '${name}',
  displayName: '${name}',
  group: 'Overlays',
  keywords: ['${name.toLowerCase()}'],
  description: 'Acme ${name}.',
  props: [],
};
`,
    );
  }
}

/** Consumer with core {Dialog, Button} + @acme/widgets {Dialog}. */
function makeCollisionProject(configBody) {
  const cwd = makeConsumer(configBody);
  installFakeCore(cwd, ['Dialog', 'Button']);
  installWidgets(cwd, ['Dialog']);
  return cwd;
}

describe('parseHiddenComponents / isComponentHidden', () => {
  it('treats a bare name as a core component', () => {
    const hidden = parseHiddenComponents(['Dialog']);
    expect(isComponentHidden(hidden, CORE_PACKAGE, 'Dialog')).toBe(true);
    expect(isComponentHidden(hidden, '@acme/widgets', 'Dialog')).toBe(false);
  });

  it('scopes package-qualified entries to that package', () => {
    const hidden = parseHiddenComponents(['@acme/widgets/Dialog']);
    expect(isComponentHidden(hidden, '@acme/widgets', 'Dialog')).toBe(true);
    expect(isComponentHidden(hidden, CORE_PACKAGE, 'Dialog')).toBe(false);
  });

  it('normalizes the XDS prefix and ignores malformed entries', () => {
    const hidden = parseHiddenComponents(['XDSDialog', '', '  ', null, 42]);
    expect(isComponentHidden(hidden, CORE_PACKAGE, 'Dialog')).toBe(true);
    expect(hidden.size).toBe(1);
  });
});

describe('component() with hiddenComponents', () => {
  it('baseline: same-named providers are ambiguous without hiding', async () => {
    const cwd = makeCollisionProject(`{ integrations: ['@acme/widgets'] }`);
    await expect(component('Dialog', {cwd})).rejects.toThrow(
      /provided by multiple packages/,
    );
  });

  it('hiding the core component makes the integration authoritative', async () => {
    const cwd = makeCollisionProject(
      `{ integrations: ['@acme/widgets'], hiddenComponents: ['Dialog'] }`,
    );
    const result = await component('Dialog', {cwd});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe('@acme/widgets');
  });

  it('hiding the integration component resolves to core', async () => {
    const cwd = makeCollisionProject(
      `{ integrations: ['@acme/widgets'], hiddenComponents: ['@acme/widgets/Dialog'] }`,
    );
    const result = await component('Dialog', {cwd});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe(CORE_PACKAGE);
  });

  it('removes hidden core components from --list but keeps the rest', async () => {
    const cwd = makeCollisionProject(
      `{ integrations: ['@acme/widgets'], hiddenComponents: ['Dialog'] }`,
    );
    const result = await component(undefined, {cwd, list: true});
    const groups = result.data;
    // Core Dialog (ungrouped → its own key) is gone; core Button stays.
    expect(groups['Dialog']).toBeUndefined();
    expect(groups['Button']).toEqual([
      {name: 'Button', package: CORE_PACKAGE},
    ]);
    // The integration's replacement is still listed under its own group.
    expect(groups['Overlays (@acme/widgets)']).toEqual([
      {name: 'Dialog', package: '@acme/widgets'},
    ]);
  });

  it('explicit --package still resolves a hidden component (escape hatch)', async () => {
    const cwd = makeCollisionProject(
      `{ integrations: ['@acme/widgets'], hiddenComponents: ['Dialog'] }`,
    );
    const result = await component('Dialog', {cwd, package: CORE_PACKAGE});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe(CORE_PACKAGE);
  });

  it('hiding the only provider reports the component as unknown', async () => {
    const cwd = makeConsumer(`{ hiddenComponents: ['Button'] }`);
    installFakeCore(cwd, ['Dialog', 'Button']);
    await expect(component('Button', {cwd})).rejects.toThrow(
      /No component|Unknown/,
    );
  });
});

describe('search() with hiddenComponents', () => {
  it('excludes hidden core components from candidates', {timeout: 30000}, async () => {
    const cwd = makeCollisionProject(
      `{ integrations: ['@acme/widgets'], hiddenComponents: ['Dialog'] }`,
    );
    const result = await search('dialog', {cwd, type: 'component'});
    const componentHits = result.data.results.filter(
      r => r.domain === 'component',
    );
    expect(componentHits.some(r => r.name === 'Dialog')).toBe(false);
  });
});
