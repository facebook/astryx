// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hermetic tests for the validate-integration API.
 *
 * Each test stands up a temp integration package and exercises the public
 * validate API directly. Temp dirs live UNDER the repo root (process.cwd())
 * so node_modules-style paths are within Vite's allowed fs roots; we never
 * load configs from /tmp.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  validateLocalIntegration,
  validateInstalledIntegration,
  summarizeIssues,
} from './validate-integration.mjs';

let tmpDir;

// Absolute file:// URL to the codemod helper so codemod modules in the temp
// package can import createCodemod without node_modules wiring.
const codemodModuleUrl = pathToFileURL(
  path.resolve(process.cwd(), 'packages/cli/src/codemod.mjs'),
).href;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-validate-it-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * Create an integration package directory with a package.json + manifest.
 * @param {string} dir
 * @param {{name?: string, version?: string, manifest: string, manifestExt?: string}} opts
 */
function writePackage(dir, {name = '@acme/widgets', version = '1.0.0', manifest, manifestExt = 'mjs'}) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name, version}),
  );
  fs.writeFileSync(path.join(dir, `astryx.integration.${manifestExt}`), manifest);
}

/** Find issues by code. */
function byCode(issues, code) {
  return issues.filter(i => i.code === code);
}

describe('validate-integration API', () => {
  it('reports no errors for a valid integration with a codemod', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { codemods: './codemods' };\n`,
    });
    const cmDir = path.join(pkgDir, 'codemods', '0.2.0');
    fs.mkdirSync(cmDir, {recursive: true});
    fs.writeFileSync(
      path.join(cmDir, 'drop-foo.mjs'),
      `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
        `export default createCodemod({ title: 'Drop foo', transform: (file) => file.source });\n`,
    );

    const result = await validateLocalIntegration(pkgDir);
    expect(result.found).toBe(true);
    expect(result.name).toBe('@acme/widgets');
    expect(result.version).toBe('1.0.0');
    const {errors} = summarizeIssues(result.issues);
    expect(errors).toBe(0);
  });

  it('flags an unknown manifest key as invalid_manifest error', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { components: './c', bogus: true };\n`,
    });
    const result = await validateLocalIntegration(pkgDir);
    const manifestIssues = byCode(result.issues, 'invalid_manifest');
    expect(manifestIssues).toHaveLength(1);
    expect(manifestIssues[0].severity).toBe('error');
  });

  it('flags a declared-but-missing root as missing_root error', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { templates: './nope' };\n`,
    });
    const result = await validateLocalIntegration(pkgDir);
    const rootIssues = byCode(result.issues, 'missing_root');
    expect(rootIssues).toHaveLength(1);
    expect(rootIssues[0].severity).toBe('error');
    expect(summarizeIssues(result.issues).errors).toBeGreaterThan(0);
  });

  it('flags multiple manifests as multiple_manifests error', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {manifest: `export default {};\n`});
    fs.writeFileSync(path.join(pkgDir, 'astryx.integration.js'), 'export default {};\n');
    const result = await validateLocalIntegration(pkgDir);
    expect(byCode(result.issues, 'multiple_manifests')).toHaveLength(1);
  });

  it('returns found:false (guidance) when no manifest is present', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: 'plain'}),
    );
    const result = await validateLocalIntegration(pkgDir);
    expect(result.found).toBe(false);
    expect(result.issues).toEqual([]);
  });

  it('flags a broken codemod as invalid_codemod error', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { codemods: './codemods' };\n`,
    });
    const cmDir = path.join(pkgDir, 'codemods', '0.2.0');
    fs.mkdirSync(cmDir, {recursive: true});
    // Missing default export → discovery throws → invalid_codemod.
    fs.writeFileSync(path.join(cmDir, 'broken.mjs'), `export const nope = 1;\n`);

    const result = await validateLocalIntegration(pkgDir);
    expect(byCode(result.issues, 'invalid_codemod')).toHaveLength(1);
  });

  it('flags a broken template as invalid_template error', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { templates: './templates' };\n`,
    });
    const tplDir = path.join(pkgDir, 'templates');
    fs.mkdirSync(tplDir, {recursive: true});
    // Doc with no same-stem source file.
    fs.writeFileSync(
      path.join(tplDir, 'dash.doc.mjs'),
      `export default { type: 'page', name: 'Dash' };\n`,
    );

    const result = await validateLocalIntegration(pkgDir);
    expect(byCode(result.issues, 'invalid_template')).toHaveLength(1);
  });

  it('validates an installed package resolved from node_modules', async () => {
    const consumer = path.join(tmpDir, 'consumer');
    fs.mkdirSync(consumer, {recursive: true});
    fs.writeFileSync(
      path.join(consumer, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    const pkgDir = path.join(consumer, 'node_modules', '@acme', 'widgets');
    writePackage(pkgDir, {
      name: '@acme/widgets',
      version: '2.0.0',
      manifest: `export default { templates: './gone' };\n`,
    });

    const result = await validateInstalledIntegration('@acme/widgets', consumer);
    expect(result.found).toBe(true);
    expect(result.name).toBe('@acme/widgets');
    expect(result.version).toBe('2.0.0');
    expect(byCode(result.issues, 'missing_root')).toHaveLength(1);
  });

  it('flags a non-installed package as package_not_found error', async () => {
    const consumer = path.join(tmpDir, 'consumer');
    fs.mkdirSync(consumer, {recursive: true});
    fs.writeFileSync(
      path.join(consumer, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    const result = await validateInstalledIntegration('@acme/nope', consumer);
    expect(byCode(result.issues, 'package_not_found')).toHaveLength(1);
  });

  it('reports no errors for a valid component (doc + same-stem source)', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { components: './components' };\n`,
    });
    const cDir = path.join(pkgDir, 'components');
    fs.mkdirSync(cDir, {recursive: true});
    fs.writeFileSync(
      path.join(cDir, 'Widget.doc.mjs'),
      `export default { name: 'Widget' };\n`,
    );
    fs.writeFileSync(
      path.join(cDir, 'Widget.tsx'),
      `export function Widget() { return null; }\n`,
    );

    const result = await validateLocalIntegration(pkgDir);
    expect(byCode(result.issues, 'invalid_component')).toHaveLength(0);
    expect(summarizeIssues(result.issues).errors).toBe(0);
  });

  it('flags a component doc missing its same-stem source as invalid_component', async () => {
    const pkgDir = path.join(tmpDir, 'pkg');
    writePackage(pkgDir, {
      manifest: `export default { components: './components' };\n`,
    });
    const cDir = path.join(pkgDir, 'components');
    fs.mkdirSync(cDir, {recursive: true});
    // Doc with no sibling Widget.tsx.
    fs.writeFileSync(
      path.join(cDir, 'Widget.doc.mjs'),
      `export default { name: 'Widget' };\n`,
    );

    const result = await validateLocalIntegration(pkgDir);
    expect(byCode(result.issues, 'invalid_component')).toHaveLength(1);
  });
});
