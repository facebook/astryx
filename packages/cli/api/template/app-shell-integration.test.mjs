// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end tests for the app shell.
 *
 * Page templates are content-only: they root at `Layout`/`Center` and the host
 * supplies the chrome. So the CLI emits them bare by default and wraps them in
 * an app shell only on request (`--with-shell` / `withShell: true`). Core
 * provides the default shell; an integration that declares `appShell` replaces
 * it.
 *
 * These stand up a temp consumer project and drive the public `template()` API
 * to verify: the default is bare, opting in wraps with the right shell, the
 * shell is never nested inside a template that already renders one, and the
 * on-disk templates are never touched.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {template} from './template.mjs';
import {validateIntegration} from '../integration/validate-integration.mjs';

let tmpDir;
let originalCwd;

const META_SHELL =
  `export default { component: 'MetaAppFrame', from: '@xds/meta', description: 'internal shell: nav, search, and chrome' };\n`;

/** Create a temp consumer project. */
function makeConsumer(configBody) {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-shell-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(dir, 'astryx.config.mjs'),
    configBody ?? `export default { integrations: ['@xds/meta'] };\n`,
  );
  return dir;
}

/** Install an integration package that (optionally) provides an app shell. */
function installPkg(
  consumerDir,
  name,
  {manifest, shell, ownTemplate} = {},
) {
  const pkgDir = path.join(consumerDir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name, version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    manifest ?? `export default { appShell: './shell.mjs' };\n`,
  );
  fs.writeFileSync(path.join(pkgDir, 'shell.mjs'), shell ?? META_SHELL);
  if (ownTemplate) {
    fs.mkdirSync(path.join(pkgDir, 'templates'), {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'templates', `${ownTemplate.id}.template.mjs`),
      `export default {type: '${ownTemplate.kind}', name: '${ownTemplate.id}', description: '${ownTemplate.id} template'};\n`,
    );
    fs.writeFileSync(
      path.join(pkgDir, 'templates', `${ownTemplate.id}.tsx`),
      ownTemplate.source,
    );
  }
  return pkgDir;
}

const installMeta = (dir, opts) => installPkg(dir, '@xds/meta', opts);

/** Collect ShellOutcome callbacks. */
function collector() {
  const calls = [];
  return {calls, onShell: o => calls.push(o)};
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = makeConsumer();
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('app shell: opt-in', () => {
  it('emits a content-only page by default, even with a shell installed', async () => {
    installMeta(tmpDir);
    const res = await template('blank', {show: true, cwd: tmpDir});
    expect(res.type).toBe('template.show');
    expect(res.data.source).not.toContain('MetaAppFrame');
    expect(res.data.transformedBy).toBeUndefined();
  });

  it('wraps in the integration shell with --with-shell', async () => {
    installMeta(tmpDir);
    const res = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    expect(res.data.source).toContain('<MetaAppFrame>');
    expect(res.data.source).toMatch(
      /import\s*\{\s*MetaAppFrame\s*\}\s*from\s*['"]@xds\/meta['"]/,
    );
    expect(res.data.transformedBy).toEqual(['@xds/meta']);
  });

  it("falls back to core's AppShell when no integration provides one", async () => {
    const dir = makeConsumer(`export default { integrations: [] };\n`);
    const res = await template('blank', {show: true, cwd: dir, withShell: true});
    expect(res.data.source).toContain('<AppShell>');
    expect(res.data.source).toMatch(
      /import\s*\{\s*AppShell\s*\}\s*from\s*['"]@astryxdesign\/core\/AppShell['"]/,
    );
    expect(res.data.transformedBy).toEqual(['@astryxdesign/core']);
    fs.rmSync(dir, {recursive: true, force: true});
  });

  it('scaffolds the wrapped source to disk', async () => {
    installMeta(tmpDir);
    const res = await template('blank', {
      targetPath: './dest',
      cwd: tmpDir,
      withShell: true,
    });
    expect(res.type).toBe('template.copy');
    expect(res.data.transformedBy).toEqual(['@xds/meta']);
    const written = fs.readFileSync(path.join(tmpDir, 'dest', 'page.tsx'), 'utf-8');
    expect(written).toContain('<MetaAppFrame>');
  });

  it('scaffolds the bare template by default', async () => {
    installMeta(tmpDir);
    await template('blank', {targetPath: './dest', cwd: tmpDir});
    const written = fs.readFileSync(path.join(tmpDir, 'dest', 'page.tsx'), 'utf-8');
    expect(written).not.toContain('MetaAppFrame');
  });

  it('never edits the template on disk (pure output-layer)', async () => {
    installMeta(tmpDir);
    const wrapped = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    expect(wrapped.data.source).toContain('<MetaAppFrame>');

    const clean = makeConsumer(`export default { integrations: [] };\n`);
    const after = await template('blank', {show: true, cwd: clean});
    expect(after.data.source).not.toContain('MetaAppFrame');
    fs.rmSync(clean, {recursive: true, force: true});
  });
});

describe('app shell: telling the user which shell', () => {
  it('reports the integration shell as replacing the default', async () => {
    installMeta(tmpDir);
    const {calls, onShell} = collector();
    await template('blank', {show: true, cwd: tmpDir, withShell: true, onShell});
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      status: 'wrapped',
      component: 'MetaAppFrame',
      package: '@xds/meta',
      isDefault: false,
    });
    expect(calls[0].description).toContain('internal shell');
  });

  it("reports core's shell as the default", async () => {
    const dir = makeConsumer(`export default { integrations: [] };\n`);
    const {calls, onShell} = collector();
    await template('blank', {show: true, cwd: dir, withShell: true, onShell});
    expect(calls[0]).toMatchObject({
      status: 'wrapped',
      component: 'AppShell',
      package: '@astryxdesign/core',
      isDefault: true,
    });
    fs.rmSync(dir, {recursive: true, force: true});
  });

  it('advertises the shell on a bare page so it is discoverable', async () => {
    installMeta(tmpDir);
    const {calls, onShell} = collector();
    await template('blank', {show: true, cwd: tmpDir, onShell});
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      status: 'available',
      component: 'MetaAppFrame',
      package: '@xds/meta',
    });
  });

  it('carries props and importKind through to the emitted shell', async () => {
    installMeta(tmpDir, {
      shell: `export default { component: 'Frame', from: '@xds/meta', importKind: 'default', props: { surface: 'internal', options: { region: 'us' } } };\n`,
    });
    const res = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    expect(res.data.source).toMatch(/<Frame\b/);
    expect(res.data.source).toMatch(/surface='internal'/);
    expect(res.data.source).toMatch(/options=\{\{/);
    expect(res.data.source).toMatch(/import Frame from '@xds\/meta'/);
  });
});

describe('app shell: exactly one slot', () => {
  it('keeps the first integration that claims the shell and reports the clash', async () => {
    installMeta(tmpDir);
    installPkg(tmpDir, '@acme/brand', {
      shell: `export default { component: 'BrandShell', from: '@acme/brand' };\n`,
    });
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default { integrations: ['@xds/meta', '@acme/brand'] };\n`,
    );

    const res = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    // First in config order wins; the second never appears.
    expect(res.data.source).toContain('<MetaAppFrame>');
    expect(res.data.source).not.toContain('BrandShell');
    expect(res.data.transformedBy).toEqual(['@xds/meta']);

    const {Project} = await import('../../foundation/config/project.mjs');
    const project = await Project.load(tmpDir);
    expect((await project.appShell()).package).toBe('@xds/meta');
    const codes = (await project.issues()).map(i => i.code);
    expect(codes).toContain('app_shell_conflict');
  });
});

describe('app shell: never nested', () => {
  it('leaves a template that already renders AppShell alone', async () => {
    installMeta(tmpDir);
    const {calls, onShell} = collector();
    const res = await template('shell-top-nav', {
      show: true,
      cwd: tmpDir,
      withShell: true,
      onShell,
    });
    expect(res.data.source).not.toContain('MetaAppFrame');
    expect(res.data.transformedBy ?? []).toEqual([]);
    expect(calls[0].status).toBe('already-shell');
  });

  it('still wraps a content-only page that merely carries a Shell- category', async () => {
    // `blank` is categorized `Shell - Blank` but roots at Layout, so it is
    // ordinary page content and must be wrappable.
    installMeta(tmpDir);
    const res = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    expect(res.data.source).toContain('<MetaAppFrame>');
    expect(res.data.transformedBy).toEqual(['@xds/meta']);
  });

  it('is idempotent — wrapping an already-wrapped source changes nothing', async () => {
    installMeta(tmpDir);
    const once = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    const twice = await template('blank', {
      show: true,
      cwd: tmpDir,
      withShell: true,
    });
    expect(twice.data.source).toBe(once.data.source);
  });

  it("does not wrap the shell owner's own templates", async () => {
    installMeta(tmpDir, {
      manifest: `export default { templates: './templates', appShell: './shell.mjs' };\n`,
      ownTemplate: {
        id: 'metahome',
        kind: 'page',
        source: `export default function MetaHome() { return <div>mine</div>; }\n`,
      },
    });
    const {calls, onShell} = collector();
    const own = await template('metahome', {
      show: true,
      cwd: tmpDir,
      withShell: true,
      onShell,
    });
    expect(own.data.source).not.toContain('MetaAppFrame');
    expect(calls[0].status).toBe('not-applicable');

    const core = await template('blank', {show: true, cwd: tmpDir, withShell: true});
    expect(core.data.source).toContain('<MetaAppFrame>');
  });

  it('does not wrap block templates', async () => {
    installPkg(tmpDir, '@acme/blocks', {
      manifest: `export default { templates: './templates' };\n`,
      ownTemplate: {
        id: 'promo',
        kind: 'block',
        source: `export default function Promo() { return <div>promo</div>; }\n`,
      },
    });
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default { integrations: ['@xds/meta', '@acme/blocks'] };\n`,
    );
    installMeta(tmpDir);

    const {calls, onShell} = collector();
    const res = await template('promo', {
      show: true,
      cwd: tmpDir,
      withShell: true,
      onShell,
    });
    expect(res.data.source).not.toContain('MetaAppFrame');
    expect(calls[0]).toMatchObject({status: 'not-applicable'});
    expect(calls[0].reason).toContain('preview container');
  });

});

describe('app shell: hostile load boundary', () => {
  /** The command still worked and emitted a usable, unwrapped template. */
  const expectDegraded = res => {
    expect(res.type).toBe('template.show');
    expect(res.data.source).not.toContain('MetaAppFrame');
    expect(res.data.source.length).toBeGreaterThan(0);
  };

  const HOSTILE = {
    'a syntax error': `export default { component: {{{ };\n`,
    'a throw at import time': `throw new Error('boom');\nexport default { component: 'MetaAppFrame', from: '@xds/meta' };\n`,
    'a Promise default export': `export default Promise.resolve({component: 'MetaAppFrame', from: '@xds/meta'});\n`,
    'a getter that throws': `export default { get component() { throw new Error('boom'); }, from: '@xds/meta' };\n`,
    'an array default export': `export default [{component: 'MetaAppFrame', from: '@xds/meta'}];\n`,
    'a null default export': `export default null;\n`,
    'no default export': `export const component = 'MetaAppFrame';\n`,
    'a missing from': `export default { component: 'MetaAppFrame' };\n`,
    'an injected component name': `export default { component: 'MetaAppFrame onLoad={boom()}', from: '@xds/meta' };\n`,
    'a circular props object': `const c = {}; c.self = c;\nexport default { component: 'MetaAppFrame', from: '@xds/meta', props: {c} };\n`,
    'the engine-internal wrap shape': `export default { wrap: { component: 'MetaAppFrame', from: '@xds/meta' } };\n`,
  };

  for (const [what, shell] of Object.entries(HOSTILE)) {
    it(`degrades safely on ${what}`, async () => {
      installMeta(tmpDir, {shell});
      expectDegraded(
        await template('blank', {show: true, cwd: tmpDir, withShell: true}),
      );
    }, 30000);
  }

  it('falls back to no shell rather than crashing, twice in a row', async () => {
    installMeta(tmpDir, {shell: `export default null;\n`});
    expectDegraded(await template('blank', {show: true, cwd: tmpDir, withShell: true}));
    expectDegraded(await template('blank', {show: true, cwd: tmpDir, withShell: true}));
  });

  it('reports an invalid shell via validate-integration', async () => {
    installMeta(tmpDir, {shell: `export default { component: 'X' };\n`});
    const report = await validateIntegration('@xds/meta', {cwd: tmpDir});
    expect(report.data.issues.map(i => i.code)).toContain('invalid_app_shell');
  });

  it('reports a missing shell module via validate-integration', async () => {
    const pkgDir = path.join(tmpDir, 'node_modules', '@xds', 'meta');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: '@xds/meta', version: '1.0.0'}),
    );
    fs.writeFileSync(
      path.join(pkgDir, 'astryx.integration.mjs'),
      `export default { appShell: './missing.mjs' };\n`,
    );
    const report = await validateIntegration('@xds/meta', {cwd: tmpDir});
    expect(report.data.issues.map(i => i.code)).toContain('missing_app_shell');
  });
});
