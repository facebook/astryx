// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end probes for the ASTRYX_NO_PROJECT_CODE gate.
 *
 * Unit tests on importUserModule prove the loader refuses; these prove the
 * COMMANDS do. Every fixture module plants a global the moment it executes,
 * the real CLI runs against the fixture through the in-process harness, and
 * the global must still be unset afterwards — so a loader that slips past the
 * gate fails the suite instead of merely producing different output.
 *
 * Each command here once had a loader that bypassed the gate: `doctor`
 * re-imported the config for its own diagnostics, `component` imported
 * checkout doc modules through loadDocs, and `theme build` handed the theme
 * source straight to jiti.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const PROBES = [
  '__astryxDoctorProbe',
  '__astryxDocProbe',
  '__astryxManifestProbe',
  '__astryxTopicProbe',
  '__astryxThemeProbe',
  '__astryxThemeFamilyProbe',
  '__astryxBlockProbe',
];

let tmpDir;

beforeAll(() => {
  // `theme build` needs a compiled @astryxdesign/core.
  ensureCoreBuilt();
}, 200_000);

beforeEach(() => {
  // Repo-local temp dir: Vite blocks dynamic import from /tmp.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-no-project-code-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', dependencies: {'@acme/widgets': '*'}}),
  );
  process.env.ASTRYX_NO_PROJECT_CODE = '1';
});

afterEach(() => {
  delete process.env.ASTRYX_NO_PROJECT_CODE;
  for (const probe of PROBES) delete globalThis[probe];
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** A config that would execute on import and name an integration. */
function writeHostileConfig() {
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `globalThis.__astryxDoctorProbe = true;\nexport default {integrations: ['@acme/widgets']};\n`,
  );
}

/**
 * An installed integration whose manifest, component doc, and docs topic all
 * plant probes. It is both configured (via writeHostileConfig) and declared as
 * a dependency, so autolink would find it even with no config.
 */
function writeHostileIntegration() {
  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(path.join(pkgDir, 'components'), {recursive: true});
  fs.mkdirSync(path.join(pkgDir, 'docs'), {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `globalThis.__astryxManifestProbe = true;\nexport default {components: './components', docs: './docs'};\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'components', 'Widget.doc.mjs'),
    `globalThis.__astryxDocProbe = true;\nexport default {type: 'component', name: 'Widget', props: []};\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'components', 'Widget.tsx'),
    `export function Widget() { return null; }\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'docs', 'hostile-topic.doc.mjs'),
    `globalThis.__astryxTopicProbe = true;\nexport default {type: 'topic', name: 'hostile-topic', title: 'Hostile', description: 'x', sections: []};\n`,
  );
}

/** A repo-layout checkout whose Button doc plants a probe. */
function writeHostileCoreDoc() {
  const buttonDir = path.join(tmpDir, 'packages', 'core', 'src', 'Button');
  fs.mkdirSync(buttonDir, {recursive: true});
  fs.writeFileSync(
    path.join(buttonDir, 'Button.doc.mjs'),
    `globalThis.__astryxDocProbe = true;\nexport const docs = {name: 'Button', keywords: ['click'], usage: {description: 'x'}};\n`,
  );
  // The source file is what makes discovery list the component, which is what
  // sends search and fuzzy matching to the doc.
  fs.writeFileSync(
    path.join(buttonDir, 'Button.tsx'),
    `export function Button() { return null; }\n`,
  );
}

/** A theme source that plants a probe and would build cleanly otherwise. */
function writeHostileTheme(name, probe) {
  fs.writeFileSync(
    path.join(tmpDir, `${name}.mjs`),
    `globalThis.${probe} = true;\nexport default {name: '${name}', tokens: {'--color-bg': '#ffffff'}};\n`,
  );
}

describe('ASTRYX_NO_PROJECT_CODE end-to-end', () => {
  it('astryx doctor reports the config without executing it or its integrations', async () => {
    writeHostileConfig();
    writeHostileIntegration();

    const {status, stdout, stderr} = await runCli(['doctor'], tmpDir);

    expect(globalThis.__astryxDoctorProbe).toBeUndefined();
    expect(globalThis.__astryxManifestProbe).toBeUndefined();
    expect(`${stdout}\n${stderr}`).toContain('ASTRYX_NO_PROJECT_CODE');
    expect(status).toBe(0);
  });

  it('astryx doctor --json carries the gate in the config check', async () => {
    writeHostileConfig();

    const {stdout} = await runCli(['--json', 'doctor'], tmpDir);

    expect(globalThis.__astryxDoctorProbe).toBeUndefined();
    const envelope = JSON.parse(stdout);
    const config = envelope.data.checks.find(
      (/** @type {{id: string}} */ c) => c.id === 'config',
    );
    expect(config.status).toBe('info');
    expect(config.message).toContain('ASTRYX_NO_PROJECT_CODE');
  });

  it('astryx component does not execute a checkout doc module', async () => {
    // A repo-layout checkout: findCoreDir resolves packages/core from cwd, and
    // the doc-view path would import Button.doc.mjs from it.
    writeHostileCoreDoc();

    const {status, stdout, stderr} = await runCli(['component', 'Button'], tmpDir);

    expect(globalThis.__astryxDocProbe).toBeUndefined();
    expect(status).toBe(1);
    expect(`${stdout}\n${stderr}`).toContain('ASTRYX_NO_PROJECT_CODE');
  });

  it('astryx component falls back to fuzzy search without executing checkout docs', async () => {
    // A near-miss name takes the keyword-scan path, which reads every core
    // component doc it can find — from the checkout, in a repo layout.
    writeHostileCoreDoc();

    await runCli(['component', 'Buton'], tmpDir);

    expect(globalThis.__astryxDocProbe).toBeUndefined();
  });

  it('astryx search does not execute checkout docs while ranking', async () => {
    writeHostileCoreDoc();

    await runCli(['search', 'button'], tmpDir);
    await runCli(['search', 'button', '--type', 'component'], tmpDir);

    expect(globalThis.__astryxDocProbe).toBeUndefined();
  });

  it('astryx component does not load an integration manifest or its component doc', async () => {
    writeHostileConfig();
    writeHostileIntegration();

    await runCli(['component', 'Widget'], tmpDir);
    await runCli(['component', '--list'], tmpDir);

    expect(globalThis.__astryxManifestProbe).toBeUndefined();
    expect(globalThis.__astryxDocProbe).toBeUndefined();
  });

  it('astryx docs lists built-in topics only, never running an integration topic', async () => {
    writeHostileConfig();
    writeHostileIntegration();

    const {status, stdout} = await runCli(['--json', 'docs'], tmpDir);

    expect(globalThis.__astryxManifestProbe).toBeUndefined();
    expect(globalThis.__astryxTopicProbe).toBeUndefined();
    expect(status).toBe(0);
    const topics = JSON.parse(stdout).data.map(
      (/** @type {{topic: string}} */ t) => t.topic,
    );
    expect(topics).toContain('tokens');
    expect(topics).not.toContain('hostile-topic');

    // Built-in topics are shipped code and keep loading under the gate.
    const detail = await runCli(['docs', 'tokens'], tmpDir);
    expect(detail.status).toBe(0);
  });

  it('astryx template --list does not execute an external block spec', async () => {
    const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'blocks');
    fs.mkdirSync(path.join(pkgDir, 'blocks'), {recursive: true});
    fs.mkdirSync(path.join(pkgDir, 'docs'), {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: '@acme/blocks',
        version: '1.0.0',
        astryx: {docs: './docs', blocks: './blocks'},
      }),
    );
    fs.writeFileSync(
      path.join(pkgDir, 'blocks', 'hostile.doc.mjs'),
      `globalThis.__astryxBlockProbe = true;\nexport const doc = {name: 'Hostile'};\n`,
    );
    fs.writeFileSync(
      path.join(pkgDir, 'blocks', 'hostile.tsx'),
      `export default function Hostile() { return null; }\n`,
    );

    const {status, stdout} = await runCli(['--json', 'template', '--list'], tmpDir);

    expect(globalThis.__astryxBlockProbe).toBeUndefined();
    expect(status).toBe(0);
    expect(stdout).not.toContain('hostile');
  });

  it('astryx theme build refuses the theme source before any loader runs', async () => {
    writeHostileTheme('hostile-theme', '__astryxThemeProbe');

    const {status, stdout, stderr} = await runCli(
      ['theme', 'build', 'hostile-theme.mjs'],
      tmpDir,
    );

    expect(globalThis.__astryxThemeProbe).toBeUndefined();
    expect(status).toBe(1);
    expect(`${stdout}\n${stderr}`).toContain('ASTRYX_NO_PROJECT_CODE');
    for (const output of ['hostile-theme.css', 'hostile-theme.js', 'hostile-theme.d.ts']) {
      expect(fs.existsSync(path.join(tmpDir, output))).toBe(false);
    }
  });

  it('astryx theme build --json reports ERR_THEME_LOAD for a refused source', async () => {
    writeHostileTheme('hostile-theme', '__astryxThemeProbe');

    const {status, stdout} = await runCli(
      ['--json', 'theme', 'build', 'hostile-theme.mjs'],
      tmpDir,
    );

    expect(globalThis.__astryxThemeProbe).toBeUndefined();
    expect(status).toBe(1);
    const envelope = JSON.parse(stdout);
    expect(envelope.code).toBe('ERR_THEME_LOAD');
    expect(envelope.error).toContain('ASTRYX_NO_PROJECT_CODE');
  });

  it('astryx theme build --family refuses every member and intermediary', async () => {
    // A realistic family: hostile-b extends hostile-a through an unselected
    // barrel, so the plan holds two selected members plus an intermediary the
    // family loader would preload. All three plant probes.
    writeHostileTheme('hostile-a', '__astryxThemeProbe');
    fs.writeFileSync(
      path.join(tmpDir, 'hostile-barrel.mjs'),
      `globalThis.__astryxThemeFamilyProbe = true;\nexport {default as a} from './hostile-a.mjs';\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'hostile-b.mjs'),
      `import {a} from './hostile-barrel.mjs';\nglobalThis.__astryxThemeFamilyProbe = true;\nexport default {name: 'hostile-b', extends: a, tokens: {'--color-bg': '#000000'}};\n`,
    );

    const {status, stdout, stderr} = await runCli(
      ['theme', 'build', '--family', 'hostile-b.mjs', 'hostile-a.mjs', '--family-key', 'hostile-family'],
      tmpDir,
    );

    expect(globalThis.__astryxThemeProbe).toBeUndefined();
    expect(globalThis.__astryxThemeFamilyProbe).toBeUndefined();
    expect(status).toBe(1);
    expect(`${stdout}\n${stderr}`).toContain('ASTRYX_NO_PROJECT_CODE');
    expect(fs.existsSync(path.join(tmpDir, 'hostile-family.css'))).toBe(false);
  });

  it('astryx theme build still runs when the variable is unset', async () => {
    delete process.env.ASTRYX_NO_PROJECT_CODE;
    writeHostileTheme('plain-theme', '__astryxThemeProbe');

    const {status} = await runCli(['theme', 'build', 'plain-theme.mjs'], tmpDir);

    // Control: the same fixture executes and builds without the gate, so the
    // probes above measure the gate and not a broken fixture.
    expect(globalThis.__astryxThemeProbe).toBe(true);
    expect(status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'plain-theme.css'))).toBe(true);
  }, 60_000);
});
