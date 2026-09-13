// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-routing tests for `astryx swizzle`.
 *
 * `rewriteImports` is unit-tested in swizzle.test.mjs. These tests exercise the
 * end-to-end command behavior by running the CLI in-process against hermetic
 * fixtures: a fake @astryxdesign/core under node_modules plus, for the
 * integration cases, a configured integration package (astryx.config.mjs +
 * astryx.integration.mjs + a `components` dir) — all under node_modules so the
 * config/manifest loaders resolve normally.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

/**
 * Build a fake @astryxdesign/core under <project>/node_modules with a single
 * swizzleable Button component (bare `Button.tsx` plus its component doc).
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
    path.join(buttonDir, 'Button.doc.mjs'),
    `export const docs = {name: 'Button', usage: {description: 'Core button.'}, props: []};\n`,
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
 * @param {{issuesUrl?: string|null, componentName?: string, authoredName?: string, replaces?: string, packageName?: string, writeConfig?: boolean, withSource?: boolean}} [opts]
 */
function buildIntegration(
  project,
  {
    issuesUrl,
    componentName = 'MetaAppShell',
    authoredName = componentName,
    replaces,
    packageName = '@test/meta',
    writeConfig = true,
    withSource = true,
  } = {},
) {
  const intDir = path.join(project, 'node_modules', ...packageName.split('/'));
  const compRoot = path.join(intDir, 'components');
  const compDir = path.join(compRoot, componentName);
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(intDir, 'package.json'),
    JSON.stringify({name: packageName, version: '1.2.3'}),
  );
  const manifest = {components: './components'};
  if (issuesUrl) manifest.issuesUrl = issuesUrl;
  fs.writeFileSync(
    path.join(intDir, 'astryx.integration.mjs'),
    `export default ${JSON.stringify(manifest)};\n`,
  );
  if (withSource) {
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
      path.join(compDir, `${componentName}.test.tsx`),
      `it('noop', () => {});\n`,
    );
  }
  const replacement = replaces == null ? '' : `, replaces: ${JSON.stringify(replaces)}`;
  fs.writeFileSync(
    path.join(compDir, `${componentName}.doc.mjs`),
    `export const docs = {name: '${authoredName}', displayName: '${authoredName}'${replacement}, usage: {description: 'x'}, props: []};\n`,
  );
  if (writeConfig) {
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {integrations: [${JSON.stringify(packageName)}]};\n`,
    );
  }
  return {intDir, compDir};
}

function writeProjectPackageJson(project, extra = {}) {
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0', ...extra}),
  );
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
  it('routes core feedback to config.issuesUrl when set', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {issuesUrl: 'https://github.com/acme/ds/issues'};\n`,
    );

    const result = await runCli(['--json', 'swizzle', 'Button', '-f'], project);
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
    expect(out).toContain(`from '@astryxdesign/core/theme/tokens.stylex'`);
    expect(out).toContain(`from './helper'`);
  });

  it('falls back to the default issues URL when config has none', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);

    const result = await runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data.feedback.issuesUrl).toBe(
      'https://github.com/facebook/astryx/issues/new',
    );
  });
});

describe('swizzle — integration-owned components', () => {
  it('copies the component dir (excluding test/doc), rewrites escaping imports to the owner package, routes feedback to the integration issuesUrl', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {issuesUrl: 'https://example.com/meta/issues'});

    const result = await runCli(['--json', 'swizzle', 'MetaAppShell', '-f'], project);
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

  it('uses a declared replacement for unqualified swizzle selection', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {componentName: 'MetaButton', replaces: 'Button'});

    const result = await runCli(['--json', 'swizzle', 'Button', '-f'], project);

    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data).toMatchObject({component: 'MetaButton', package: '@test/meta'});
    expect(fs.existsSync(path.join(project, 'components', 'astryx', 'MetaButton', 'MetaButton.tsx'))).toBe(true);
  });

  it('lists the active replacement instead of the replaced Core component', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {componentName: 'MetaButton', replaces: 'Button'});

    const result = await runCli(['--json', 'swizzle'], project);

    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data).toContain('MetaButton');
    expect(env.data).not.toContain('Button');
  });

  it('rejects an unsafe authored replacement name before building the destination', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      componentName: 'SafeReplacement',
      authoredName: '../escape',
      replaces: 'Button',
    });

    const result = await runCli(['--json', 'swizzle', 'Button', '-f'], project);

    expect(result.code).not.toBe(0);
    expect(JSON.parse(result.stdout).code).toBe('ERR_PATH_TRAVERSAL');
    expect(fs.existsSync(path.join(project, 'components', 'escape'))).toBe(false);
  });

  it('does not advertise a docs-only active replacement as swizzlable', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      componentName: 'MetaButton',
      replaces: 'Button',
      withSource: false,
    });

    const listed = await runCli(['--json', 'swizzle'], project);
    expect(listed.code).toBe(0);
    const listEnvelope = JSON.parse(listed.stdout);
    expect(listEnvelope.data).not.toContain('MetaButton');
    expect(listEnvelope.data).not.toContain('Button');

    const copied = await runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(copied.code).not.toBe(0);
    expect(JSON.parse(copied.stdout).code).toBe('ERR_NO_SOURCE');
  });

  it('package scope prefers a native same-name component over a replacement alias', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      componentName: 'MetaButton',
      replaces: 'Button',
      packageName: '@test/meta',
      writeConfig: false,
    });
    buildIntegration(project, {
      componentName: 'Button',
      packageName: '@test/meta',
      writeConfig: false,
    });
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {integrations: ['@test/meta']};\n`,
    );

    const result = await runCli(
      ['--json', 'swizzle', 'Button', '--package', '@test/meta', '-f'],
      project,
    );

    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data).toMatchObject({component: 'Button', package: '@test/meta'});
    expect(
      fs.existsSync(
        path.join(project, 'components', 'astryx', 'Button', 'Button.tsx'),
      ),
    ).toBe(true);
  });

  it('lists losing replacements by their own names', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      componentName: 'MetaButton',
      replaces: 'Button',
      packageName: '@test/meta',
      writeConfig: false,
    });
    buildIntegration(project, {
      componentName: 'PartnerButton',
      replaces: 'Button',
      packageName: '@test/partner',
      writeConfig: false,
    });
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {integrations: ['@test/meta', '@test/partner']};\n`,
    );

    const result = await runCli(['--json', 'swizzle'], project);

    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.data).toContain('PartnerButton');
    expect(env.data).toContain('MetaButton');
    expect(env.data).not.toContain('Button');
  });

  it('surfaces project-wide replacement warnings outside JSON mode', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      componentName: 'MetaButton',
      replaces: 'Button',
      packageName: '@test/meta',
      writeConfig: false,
    });
    buildIntegration(project, {
      componentName: 'PartnerButton',
      replaces: 'Button',
      packageName: '@test/partner',
      writeConfig: false,
    });
    fs.writeFileSync(
      path.join(project, 'astryx.config.mjs'),
      `export default {integrations: ['@test/meta', '@test/partner']};\n`,
    );

    const result = await runCli(['swizzle'], project);

    expect(result.code).toBe(0);
    expect(result.stderr).toContain(
      'Warning: @test/partner has 1 integration issue(s). Run: astryx doctor',
    );
  });

  it('omits the feedback note when the integration ships no issuesUrl', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {issuesUrl: null});

    const result = await runCli(['--json', 'swizzle', 'MetaAppShell', '-f'], project);
    expect(result.code).toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.type).toBe('swizzle.copy');
    expect(env.data.package).toBe('@test/meta');
    expect(env.data.feedback).toBeUndefined();
  });
});

describe('swizzle — ambiguous ownership', () => {
  it('errors when a name is owned by core + an integration and no --package is given', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    // Integration also provides "Button" (collides with core).
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = await runCli(['--json', 'swizzle', 'Button', '-f'], project);
    expect(result.code).not.toBe(0);
    const env = JSON.parse(result.stdout);
    expect(env.code).toBe('ERR_AMBIGUOUS_COMPONENT');
    const pkgs = (env.suggestions ?? []).map(s => s.name);
    expect(pkgs).toContain('@astryxdesign/core');
    expect(pkgs).toContain('@test/meta');
  });

  it('--package resolves an ambiguous name to the integration', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = await runCli(
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

  it('--package resolves an ambiguous name to core', async () => {
    buildFakeCore(project);
    writeProjectPackageJson(project);
    buildIntegration(project, {
      issuesUrl: 'https://example.com/meta/issues',
      componentName: 'Button',
    });

    const result = await runCli(
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
    expect(out).toContain(`from '@astryxdesign/core/theme/tokens.stylex'`);
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
  fs.writeFileSync(
    path.join(styledDir, 'Styled.doc.mjs'),
    `export const docs = {name: 'Styled', usage: {description: 'Styled.'}, props: []};\n`,
  );
  // Plain component (no StyleX).
  const plainDir = path.join(core, 'src', 'Plain');
  fs.mkdirSync(plainDir, {recursive: true});
  fs.writeFileSync(
    path.join(plainDir, 'Plain.tsx'),
    `export const Plain = () => null;\n`,
  );
  fs.writeFileSync(
    path.join(plainDir, 'Plain.doc.mjs'),
    `export const docs = {name: 'Plain', usage: {description: 'Plain.'}, props: []};\n`,
  );
  return core;
}

describe('swizzle — StyleX build setup note (#3373)', () => {
  it('reports usesStyleX and prints a setup note for StyleX components', async () => {
    buildStyleXCore(project);
    writeProjectPackageJson(project);

    // JSON payload carries the machine-readable flag.
    const jsonResult = await runCli(['--json', 'swizzle', 'Styled', '-f'], project);
    expect(jsonResult.code).toBe(0);
    const env = JSON.parse(jsonResult.stdout);
    expect(env.data.usesStyleX).toBe(true);

    // Human output surfaces the compiler requirement + Next.js caveat.
    const humanResult = await runCli(['swizzle', 'Styled', '-f'], project);
    expect(humanResult.code).toBe(0);
    expect(humanResult.stdout).toMatch(/StyleX compiler/i);
    expect(humanResult.stdout).toMatch(/unstyled/i);
    expect(humanResult.stdout).toMatch(/next\/font/i);
    expect(humanResult.stdout).toMatch(/astryx docs styling/);
  });

  it('does not print the StyleX note for components without StyleX', async () => {
    buildStyleXCore(project);
    writeProjectPackageJson(project);

    const jsonResult = await runCli(['--json', 'swizzle', 'Plain', '-f'], project);
    expect(jsonResult.code).toBe(0);
    const env = JSON.parse(jsonResult.stdout);
    expect(env.data.usesStyleX).toBe(false);

    const humanResult = await runCli(['swizzle', 'Plain', '-f'], project);
    expect(humanResult.code).toBe(0);
    expect(humanResult.stdout).not.toMatch(/StyleX compiler/i);
  });
});
