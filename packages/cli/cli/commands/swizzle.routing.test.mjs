// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-routing tests for `astryx swizzle`.
 *
 * `rewriteImports` is unit-tested in swizzle.test.mjs. These tests exercise the
 * end-to-end command behavior by spawning the CLI bin against hermetic
 * fixtures: a fake @astryxdesign/core under node_modules plus, for the
 * integration cases, a configured integration package (astryx.config.mjs +
 * astryx.integration.mjs + a `components` dir) — all under node_modules so the
 * config/manifest loaders resolve normally.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');

/**
 * Build a fake @astryxdesign/core under <project>/node_modules with a single
 * swizzleable Button component (bare `Button.tsx`, no doc).
 */
function buildFakeCore(project) {
  const core = path.join(project, 'node_modules', '@astryxdesign', 'core');
  const buttonDir = path.join(core, 'src', 'Button');
  fs.mkdirSync(buttonDir, {recursive: true});
  fs.writeFileSync(
    path.join(core, 'package.json'),
    '{"name":"@astryxdesign/core","version":"0.0.13"}',
  );
  fs.writeFileSync(
    path.join(buttonDir, 'Button.tsx'),
    [
      `import {tokens} from '../theme/tokens.stylex';`,
      `import {helper} from './helper';`,
      `export const Button = () => null;`,
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(buttonDir, 'helper.ts'),
    `export const helper = 1;\n`,
  );
  return core;
}

/**
 * Build a configured integration package `@test/meta` under
 * <project>/node_modules with a same-stem component (source + doc) and an
 * escaping import, plus a colocated test file. Writes astryx.config.mjs at the
 * project root listing the integration.
 *
 * @param {string} project
 * @param {{issuesUrl?: string|null, componentName?: string, docExt?: string}} [opts]
 */
function buildIntegration(
  project,
  {issuesUrl, componentName = 'MetaAppShell', docExt = '.doc.mjs'} = {},
) {
  const intDir = path.join(project, 'node_modules', '@test', 'meta');
  const compRoot = path.join(intDir, 'components');
  const compDir = path.join(compRoot, componentName);
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(intDir, 'package.json'),
    JSON.stringify({name: '@test/meta', version: '1.2.3'}),
  );
  const manifest = {components: './components'};
  if (issuesUrl) manifest.issuesUrl = issuesUrl;
  fs.writeFileSync(
    path.join(intDir, 'astryx.integration.mjs'),
    `export default ${JSON.stringify(manifest)};\n`,
  );
  fs.writeFileSync(
    path.join(compDir, `${componentName}.tsx`),
    [
      `import x from '../utils/foo';`,
      `import {sib} from './sibling';`,
      `export function ${componentName}() { return x; }`,
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(compDir, 'sibling.ts'),
    `export const sib = 1;\n`,
  );
  fs.writeFileSync(
    path.join(compDir, `${componentName}${docExt}`),
    `export const docs = {name: '${componentName}', usage: {description: 'x'}};\n`,
  );
  fs.writeFileSync(
    path.join(compDir, `${componentName}.test.tsx`),
    `it('noop', () => {});\n`,
  );
  fs.writeFileSync(
    path.join(project, 'astryx.config.mjs'),
    `export default {integrations: ['@test/meta']};\n`,
  );
  return {intDir, compDir};
}

/**
 * Build an EXTERNAL Astryx package under <project>/node_modules — one that opts
 * into the ecosystem purely through its own package.json
 * (`"astryx": {"docs": "./src"}`), with NO integration manifest and no entry in
 * astryx.config.mjs. This is the case issue #2090 names.
 *
 * `subdir` nests the component below the docs root (`src/<subdir>/<Name>/`),
 * the shape a package with more than a flat component list actually ships.
 *
 * @param {string} project
 * @param {{name?: string, componentName?: string, docExt?: string, subdir?: string}} [opts]
 */
function buildExternalPackage(
  project,
  {
    name = '@ext/widgets',
    componentName = 'AppShell',
    docExt = '.doc.mjs',
    subdir = '',
  } = {},
) {
  const pkgDir = path.join(project, 'node_modules', ...name.split('/'));
  const compDir = path.join(
    pkgDir,
    'src',
    ...(subdir ? [subdir] : []),
    componentName,
  );
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name, version: '2.0.0', astryx: {docs: './src'}}),
  );
  fs.writeFileSync(
    path.join(compDir, `${componentName}.tsx`),
    [
      `import x from '../utils/foo';`,
      `import {sib} from './sibling';`,
      `export function ${componentName}() { return x; }`,
      '',
    ].join('\n'),
  );
  fs.writeFileSync(path.join(compDir, 'sibling.ts'), `export const sib = 1;\n`);
  fs.writeFileSync(
    path.join(compDir, `${componentName}${docExt}`),
    `export const docs = {name: '${componentName}', usage: {description: 'x'}};\n`,
  );
  fs.writeFileSync(
    path.join(compDir, `${componentName}.test.tsx`),
    `it('noop', () => {});\n`,
  );
  return {pkgDir, compDir};
}

function writeProjectPackageJson(project, extra = {}) {
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0', ...extra}),
  );
}

function runCli(args, cwd) {
  try {
    const out = execFileSync('node', [CLI_BIN, ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {...process.env, FORCE_COLOR: '0'},
    });
    return {code: 0, stdout: out, stderr: ''};
  } catch (e) {
    return {
      code: e.status ?? 1,
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
    };
  }
}

let tmpDir;
let project;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-swizzle-routing-'));
  project = path.join(tmpDir, 'project');
  fs.mkdirSync(project, {recursive: true});
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('swizzle — core feedback routing via config', () => {
  it('routes core feedback to config.issuesUrl when set', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {issuesUrl: 'https://github.com/acme/ds/issues'};\n`,
    );

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@astryxdesign/core');
    expect(env.data.feedback.issuesUrl).toBe('https://github.com/acme/ds/issues');
    // Escaping import rewritten to core; sibling import preserved.
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@astryxdesign/core/theme'`);
    expect(out).toContain(`from './helper'`);
  });

  it('falls back to the default issues URL when config has none', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.feedback.issuesUrl).toBe(
      'https://github.com/facebook/astryx/issues/new',
    );
  });
});

describe('swizzle — integration-owned components', () => {
  it('copies the component dir (excluding test/doc), rewrites escaping imports to the owner package, routes feedback to the integration issuesUrl', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {issuesUrl: 'https://example.com/meta/issues'});

    const result = runCli(['--json', 'swizzle', 'MetaAppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@test/meta');
    // Doc + test excluded from the copy.
    expect(env.data.files).toContain('MetaAppShell.tsx');
    expect(env.data.files).toContain('sibling.ts');
    expect(env.data.files).not.toContain('MetaAppShell.doc.mjs');
    expect(env.data.files.some(f => f.includes('.test.'))).toBe(false);
    // Feedback routed to the integration's issues URL.
    expect(env.data.feedback.issuesUrl).toBe('https://example.com/meta/issues');

    const outDir = path.join(project, 'components', 'astryx', 'MetaAppShell');
    expect(fs.existsSync(path.join(outDir, 'MetaAppShell.doc.mjs'))).toBe(false);
    const out = fs.readFileSync(path.join(outDir, 'MetaAppShell.tsx'), 'utf-8');
    expect(out).toContain(`from '@test/meta/utils'`);
    expect(out).toContain(`from './sibling'`);
  });

  it('omits the feedback note when the integration ships no issuesUrl', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {issuesUrl: null});

    const result = runCli(['--json', 'swizzle', 'MetaAppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@test/meta');
    expect(env.data.feedback).toBeUndefined();
  });
});

describe('swizzle — ambiguous ownership', () => {
  it('errors when a name is owned by core + an integration and no --package is given', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    // Integration also provides "Button" (collides with core).
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).not.toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.code).toBe('ERR_AMBIGUOUS_COMPONENT');
    const pkgs = (env.suggestions ?? []).map(s => s.name);
    expect(pkgs).toContain('@astryxdesign/core');
    expect(pkgs).toContain('@test/meta');
  });

  it('--package resolves an ambiguous name to the integration', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = runCli(
      ['--json', 'swizzle', 'Button', '--package', '@test/meta', '-f'],
      project,
    );
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@test/meta');
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@test/meta/utils'`);
  });

  it('--package resolves an ambiguous name to core', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = runCli(
      ['--json', 'swizzle', 'Button', '--package', '@astryxdesign/core', '-f'],
      project,
    );
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@astryxdesign/core');
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@astryxdesign/core/theme'`);
  });
});

describe('swizzle — external packages via package.json astryx.docs (#2090)', () => {
  it('swizzles a component owned by an external package with no integration manifest', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@ext/widgets');
    // Doc + test excluded from the copy, sibling source included.
    expect(env.data.files).toContain('AppShell.tsx');
    expect(env.data.files).toContain('sibling.ts');
    expect(env.data.files).not.toContain('AppShell.doc.mjs');
    expect(env.data.files.some(f => f.includes('.test.'))).toBe(false);
  });

  it('rewrites escaping imports to the external package, leaving intra-component imports relative', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'AppShell', 'AppShell.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@ext/widgets/utils'`);
    expect(out).toContain(`from './sibling'`);
    expect(out).not.toContain('@astryxdesign/core');
  });

  it('resolves an external-only component when @astryxdesign/core is absent', () => {
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@ext/widgets');
  });

  it('accepts a .doc.ts external component, matching the integration doc suffixes', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project, {docExt: '.doc.ts'});

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@ext/widgets');
    expect(env.data.files).not.toContain('AppShell.doc.ts');
  });

  it('--list includes external components alongside core', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', '--list'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.list');
    expect(env.data).toContain('Button');
    expect(env.data).toContain('AppShell');
  });

  it('errors when a name is owned by core + an external package and no --package is given', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project, {componentName: 'Button'});

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).not.toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.code).toBe('ERR_AMBIGUOUS_COMPONENT');
    const pkgs = (env.suggestions ?? []).map(s => s.name);
    expect(pkgs).toContain('@astryxdesign/core');
    expect(pkgs).toContain('@ext/widgets');
  });

  it('refuses a flat package whose doc sits at the docs root rather than copying its whole src tree', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    // Flat layout: docs root IS the component's directory, so there is no
    // isolated component dir to copy.
    const srcDir = path.join(project, 'node_modules', '@ext', 'flat', 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, '..', 'package.json'),
      JSON.stringify({name: '@ext/flat', astryx: {docs: './src'}}),
    );
    fs.writeFileSync(path.join(srcDir, 'Flat.doc.mjs'), `export const docs = {};\n`);
    fs.writeFileSync(path.join(srcDir, 'Flat.tsx'), `export const Flat = 1;\n`);
    fs.writeFileSync(path.join(srcDir, 'Other.tsx'), `export const Other = 1;\n`);

    const result = runCli(['--json', 'swizzle', 'Flat', '-f'], project);
    expect(result.code).not.toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.code).toBe('ERR_NO_SOURCE');
    expect(
      fs.existsSync(path.join(project, 'components', 'astryx', 'Flat')),
    ).toBe(false);
  });

  it("ejects under the package's canonical casing, not the casing the user typed", () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project); // provides 'AppShell'

    // External lookup is case-insensitive (findComponentInPackages lowercases
    // both sides), so this resolves — but the OWNER's casing must win, because
    // the ejected directory name is part of the output contract.
    const result = runCli(['--json', 'swizzle', 'appshell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@ext/widgets');
    expect(env.data.component).toBe('AppShell');
    expect(env.data.outputDir).toBe(path.join('components', 'astryx', 'AppShell'));
    // readdir reports the real on-disk name, so this holds on case-insensitive
    // filesystems too (where existsSync('appshell') would also be true).
    expect(fs.readdirSync(path.join(project, 'components', 'astryx'))).toEqual([
      'AppShell',
    ]);
  });

  it('--package resolves an ambiguous name to the external package', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project, {componentName: 'Button'});

    const result = runCli(
      ['--json', 'swizzle', 'Button', '--package', '@ext/widgets', '-f'],
      project,
    );
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@ext/widgets');
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@ext/widgets/utils'`);
  });
});

describe('swizzle — canonical naming is scoped to external owners', () => {
  it('core keeps the argument-derived name (XDS prefix stripped, nothing else)', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);

    const result = runCli(['--json', 'swizzle', 'XDSButton', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@astryxdesign/core');
    expect(env.data.component).toBe('Button');
    expect(env.data.outputDir).toBe(path.join('components', 'astryx', 'Button'));
    expect(fs.readdirSync(path.join(project, 'components', 'astryx'))).toEqual([
      'Button',
    ]);
  });

  it('an integration keeps the argument-derived name', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {issuesUrl: 'https://example.com/meta/issues'});

    const result = runCli(['--json', 'swizzle', 'MetaAppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@test/meta');
    expect(env.data.component).toBe('MetaAppShell');
    expect(env.data.outputDir).toBe(
      path.join('components', 'astryx', 'MetaAppShell'),
    );
    expect(fs.readdirSync(path.join(project, 'components', 'astryx'))).toEqual([
      'MetaAppShell',
    ]);
  });
});

describe('swizzle — does not change what `discover` sees (#2090 guard)', () => {
  it('a .doc.ts integration component stays invisible to discover', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {componentName: 'TsDoc', docExt: '.doc.ts'});

    // discover `import()`s the doc it finds (loadDocs), and Node refuses to
    // strip types from a .ts under node_modules — so widening the shared
    // package-scanner globally would turn this clean empty list into
    // ERR_INVALID_DOC ("Stripping types is currently unsupported for files
    // under node_modules"). The wider suffix list is opt-in per call site for
    // exactly this reason; swizzle opts in, discover must not.
    const list = runCli(['--json', 'discover'], project);
    expect(list.code).toBe(0);
    const listEnv = JSON.parse(list.stdout);
    expect(listEnv.type).toBe('discover.list');
    expect(listEnv.data).toEqual([]);

    const named = runCli(['--json', 'discover', 'TsDoc'], project);
    expect(named.code).toBe(0);
    const namedEnv = JSON.parse(named.stdout);
    expect(namedEnv.type).toBe('discover.list');
    expect(namedEnv.data).toEqual([]);
    expect(namedEnv.error).toBeUndefined();
    expect(namedEnv.code).toBeUndefined();
  });

  it('a .doc.mjs integration component is still visible to discover', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {componentName: 'MjsDoc'});

    const named = runCli(['--json', 'discover', 'MjsDoc'], project);
    expect(named.code).toBe(0);
    const env = JSON.parse(named.stdout);
    expect(env.error).toBeUndefined();
    expect(env.data.name).toBe('MjsDoc');
  });

  it('an external astryx.docs package is not reachable by discover at all', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    // discover only scans CONFIGURED integrations; with none configured it
    // reports configured:false regardless of what swizzle can now reach.
    const list = runCli(['--json', 'discover'], project);
    expect(list.code).toBe(0);
    const env = JSON.parse(list.stdout);
    expect(env.type).toBe('discover.list');
    expect(env.data).toEqual([]);
    expect(env.meta.configured).toBe(false);
  });
});

/**
 * Build a fake @astryxdesign/core with a component that imports StyleX directly
 * (so the swizzle StyleX-build note should fire) and one that doesn't.
 */
function buildStyleXCore(project) {
  const core = path.join(project, 'node_modules', '@astryxdesign', 'core');
  // StyleX component.
  const styledDir = path.join(core, 'src', 'Styled');
  fs.mkdirSync(styledDir, {recursive: true});
  fs.writeFileSync(
    path.join(core, 'package.json'),
    '{"name":"@astryxdesign/core","version":"0.0.13"}',
  );
  fs.writeFileSync(
    path.join(styledDir, 'Styled.tsx'),
    [
      `import * as stylex from '@stylexjs/stylex';`,
      `const styles = stylex.create({base: {color: 'red'}});`,
      `export const Styled = () => null;`,
      '',
    ].join('\n'),
  );
  // Plain component (no StyleX).
  const plainDir = path.join(core, 'src', 'Plain');
  fs.mkdirSync(plainDir, {recursive: true});
  fs.writeFileSync(
    path.join(plainDir, 'Plain.tsx'),
    `export const Plain = () => null;\n`,
  );
  return core;
}

describe('swizzle — StyleX build setup note (#3373)', () => {
  it('reports usesStyleX and prints a setup note for StyleX components', () => {
    buildStyleXCore(project);
    writeProjectPackageJson(project);

    // JSON payload carries the machine-readable flag.
    const jsonResult = runCli(['--json', 'swizzle', 'Styled', '-f'], project);
    expect(jsonResult.code).toBe(0);
    const env = JSON.parse(jsonResult.stdout);
    expect(env.data.usesStyleX).toBe(true);

    // Human output surfaces the compiler requirement + Next.js caveat.
    const humanResult = runCli(['swizzle', 'Styled', '-f'], project);
    expect(humanResult.code).toBe(0);
    expect(humanResult.stdout).toMatch(/StyleX compiler/i);
    expect(humanResult.stdout).toMatch(/unstyled/i);
    expect(humanResult.stdout).toMatch(/next\/font/i);
    expect(humanResult.stdout).toMatch(/astryx docs styling/);
  });

  it('does not print the StyleX note for components without StyleX', () => {
    buildStyleXCore(project);
    writeProjectPackageJson(project);

    const jsonResult = runCli(['--json', 'swizzle', 'Plain', '-f'], project);
    expect(jsonResult.code).toBe(0);
    const env = JSON.parse(jsonResult.stdout);
    expect(env.data.usesStyleX).toBe(false);

    const humanResult = runCli(['swizzle', 'Plain', '-f'], project);
    expect(humanResult.code).toBe(0);
    expect(humanResult.stdout).not.toMatch(/StyleX compiler/i);
  });
});

describe('swizzle — a docs-only owner never blocks a swizzleable one', () => {
  /**
   * A package that ships reference docs at its docs ROOT can never be swizzled
   * from (there is no isolated component dir), so it must not turn a working
   * `swizzle Button` into ERR_AMBIGUOUS_COMPONENT and then offer itself as the
   * fix. Installing any such package used to break core swizzles outright.
   */
  function buildDocsOnlyPackage(
    project,
    {name = '@ext/refdocs', componentName = 'Button'} = {},
  ) {
    const pkgDir = path.join(project, 'node_modules', ...name.split('/'));
    const srcDir = path.join(pkgDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name, version: '1.0.0', astryx: {docs: './src'}}),
    );
    fs.writeFileSync(
      path.join(srcDir, `${componentName}.doc.mjs`),
      `export const docs = {name: '${componentName}'};\n`,
    );
    return {pkgDir};
  }

  it('resolves to core when the only other owner has no source', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildDocsOnlyPackage(project);

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@astryxdesign/core');
  });

  it('resolves to core when the other owner ships a doc but no same-stem .tsx', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    // src/Button/ exists but holds index.tsx, so there is no `Button.tsx` to copy.
    const compDir = path.join(
      project,
      'node_modules',
      '@ext',
      'kit',
      'src',
      'Button',
    );
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(project, 'node_modules', '@ext', 'kit', 'package.json'),
      JSON.stringify({name: '@ext/kit', astryx: {docs: './src'}}),
    );
    fs.writeFileSync(
      path.join(compDir, 'Button.doc.mjs'),
      `export const docs = {};\n`,
    );
    fs.writeFileSync(
      path.join(compDir, 'index.tsx'),
      `export const Button = () => null;\n`,
    );

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).data.package).toBe('@astryxdesign/core');
  });

  it('still reports ambiguity when BOTH owners are swizzleable', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project, {componentName: 'Button'});

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).not.toBe(0);
    expect(JSON.parse(result.stdout).code).toBe('ERR_AMBIGUOUS_COMPONENT');
  });

  it('an explicit --package on a source-less owner still reports ERR_NO_SOURCE', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildDocsOnlyPackage(project);

    const result = runCli(
      ['--json', 'swizzle', 'Button', '--package', '@ext/refdocs', '-f'],
      project,
    );
    expect(result.code).not.toBe(0);
    expect(JSON.parse(result.stdout).code).toBe('ERR_NO_SOURCE');
  });

  it('reports ERR_NO_SOURCE when the source-less owner is the only one', () => {
    writeProjectPackageJson(project);
    buildDocsOnlyPackage(project);

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).not.toBe(0);
    expect(JSON.parse(result.stdout).code).toBe('ERR_NO_SOURCE');
  });
});

describe('swizzle — nested external components rewrite to real subpaths', () => {
  it('never writes an <owner>/.. specifier, and reports what it could not resolve', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);

    const pkgDir = path.join(project, 'node_modules', '@ext', 'widgets');
    const compDir = path.join(pkgDir, 'src', 'components', 'AppShell');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: '@ext/widgets',
        version: '2.0.0',
        astryx: {docs: './src'},
      }),
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.tsx'),
      [
        `import one from '../shared/one';`,
        `import two from '../../theme/two';`,
        `import out from '../../../outside';`,
        `import sib from './sibling';`,
        `export function AppShell() { return one + two + out + sib; }`,
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.doc.mjs'),
      `export const docs = {};\n`,
    );

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'AppShell', 'AppShell.tsx'),
      'utf-8',
    );
    expect(out).not.toContain('@ext/widgets/..');
    // Subpaths are named from the package's docs root, so they match what the
    // package actually exports.
    expect(out).toContain(`from '@ext/widgets/components'`);
    expect(out).toContain(`from '@ext/widgets/theme'`);
    // An import escaping the package cannot be named — left as written, and
    // surfaced rather than mangled into a fake specifier.
    expect(out).toContain(`from '../../../outside'`);
    expect(out).toContain(`from './sibling'`);

    const env = JSON.parse(result.stdout);
    expect(env.data.unresolvedImports).toEqual(['../../../outside']);
  });

  it('omits unresolvedImports when every import resolved', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).data.unresolvedImports).toBeUndefined();
  });

  it('warns in human output when an import could not be rewritten', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    const compDir = path.join(
      project,
      'node_modules',
      '@ext',
      'widgets',
      'src',
      'AppShell',
    );
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(project, 'node_modules', '@ext', 'widgets', 'package.json'),
      JSON.stringify({name: '@ext/widgets', astryx: {docs: './src'}}),
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.tsx'),
      `import out from '../../outside';\nexport const AppShell = () => null;\n`,
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.doc.mjs'),
      `export const docs = {};\n`,
    );

    const human = runCli(['swizzle', 'AppShell', '-f'], project);
    expect(human.code).toBe(0);
    expect(human.stdout).toMatch(/could not be rewritten/i);
    expect(human.stdout).toContain('../../outside');
  });
});

describe('swizzle — core keeps its exact import rewriting', () => {
  it('rewrites a deep core subpath to the top-level area, as before', () => {
    const core = buildFakeCore(project);
    writeProjectPackageJson(project);
    fs.writeFileSync(
      path.join(core, 'src', 'Button', 'Button.tsx'),
      [
        `import {tokens} from '../theme/tokens.stylex';`,
        `import {deep} from '../utils/nested/deep';`,
        `import {bare} from '../hooks';`,
        `import {helper} from './helper';`,
        '',
      ].join('\n'),
    );

    const result = runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@astryxdesign/core/theme'`);
    expect(out).toContain(`from '@astryxdesign/core/utils'`);
    expect(out).toContain(`from '@astryxdesign/core/hooks'`);
    expect(out).toContain(`from './helper'`);
  });
});

describe('swizzle — --list covers every owner it can swizzle from', () => {
  it('includes configured integration components alongside core and externals', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project);
    buildExternalPackage(project);

    const result = runCli(['--json', 'swizzle', '--list'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data).toContain('Button');
    expect(env.data).toContain('AppShell');
    // Swizzleable today, but invisible to --list until now.
    expect(env.data).toContain('MetaAppShell');
  });

  it('offers integration components as not-found suggestions too', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project);

    const result = runCli(['--json', 'swizzle', 'Nope'], project);
    expect(result.code).not.toBe(0);
    const names = (JSON.parse(result.stdout).suggestions ?? []).map(
      s => s.name,
    );
    expect(names).toContain('MetaAppShell');
  });
});

describe('swizzle — a symlinked package is a real package (pnpm)', () => {
  it('swizzles from an external package installed as a symlink', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);

    // pnpm's layout: node_modules/@ext/widgets is a link into .pnpm/.
    const store = path.join(
      project,
      'node_modules',
      '.pnpm',
      '@ext+widgets@2.0.0',
      'node_modules',
      '@ext',
      'widgets',
    );
    const compDir = path.join(store, 'src', 'AppShell');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(store, 'package.json'),
      JSON.stringify({
        name: '@ext/widgets',
        version: '2.0.0',
        astryx: {docs: './src'},
      }),
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.tsx'),
      `import x from '../utils/foo';\nexport function AppShell() { return x; }\n`,
    );
    fs.writeFileSync(
      path.join(compDir, 'AppShell.doc.mjs'),
      `export const docs = {};\n`,
    );

    const scopeDir = path.join(project, 'node_modules', '@ext');
    fs.mkdirSync(scopeDir, {recursive: true});
    fs.symlinkSync(store, path.join(scopeDir, 'widgets'), 'dir');

    const list = runCli(['--json', 'swizzle', '--list'], project);
    expect(JSON.parse(list.stdout).data).toContain('AppShell');

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.package).toBe('@ext/widgets');
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'AppShell', 'AppShell.tsx'),
      'utf-8',
    );
    expect(out).toContain(`from '@ext/widgets/utils'`);
  });
});

describe('swizzle — duplicate component names inside one package', () => {
  it('picks the shallowest match deterministically, not readdir order', () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    const pkgDir = path.join(project, 'node_modules', '@ext', 'widgets');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: '@ext/widgets', astryx: {docs: './src'}}),
    );
    // 'AAA' sorts BEFORE 'AppShell', so a depth-first walk descends into the
    // deep copy first and returns it. Only a shallowest-first search picks the
    // one at the docs root — the test would pass by luck otherwise.
    for (const [rel, marker] of [
      [path.join('AAA', 'nested', 'AppShell'), 'DEEP'],
      [path.join('AppShell'), 'SHALLOW'],
    ]) {
      const d = path.join(pkgDir, 'src', rel);
      fs.mkdirSync(d, {recursive: true});
      fs.writeFileSync(
        path.join(d, 'AppShell.tsx'),
        `export const marker = '${marker}';\n`,
      );
      fs.writeFileSync(
        path.join(d, 'AppShell.doc.mjs'),
        `export const docs = {};\n`,
      );
    }

    const result = runCli(['--json', 'swizzle', 'AppShell', '-f'], project);
    expect(result.code).toBe(0);
    const out = fs.readFileSync(
      path.join(project, 'components', 'astryx', 'AppShell', 'AppShell.tsx'),
      'utf-8',
    );
    expect(out).toContain('SHALLOW');
    // And the name is listed once, not once per copy.
    const list = JSON.parse(
      runCli(['--json', 'swizzle', '--list'], project).stdout,
    );
    expect(list.data.filter(n => n === 'AppShell')).toHaveLength(1);
  });
});
