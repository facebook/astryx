// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Tests for the icon-registry import emitted into the built theme module
 * (#4620, #4621).
 *
 * `extractIconInfo()` scrapes the specifier out of the TypeScript source and
 * `generateBuiltModule()` re-emits it into a plain-ESM `.js` artifact in the
 * output directory — a different file, in a different directory, in a
 * different language. The source is loaded through jiti (which resolves
 * extensionless './icons' happily); the artifact is loaded by Node ESM (which
 * does not). These tests pin the emit-time contract:
 *
 * - a compiled companion in the out dir → the specifier is rewritten to it,
 *   preferring `.mjs` (the `.js` twin is the CJS tsup build — a second,
 *   distinct registry instance — see #4620),
 * - no companion at all → the build fails loudly before writing anything
 *   (#4621), instead of shipping a module whose import cannot resolve,
 * - only the TypeScript source beside the output (in-place builds consumed
 *   through a bundler, e.g. the docsite layout) → kept as-written, warned,
 * - bare package specifiers → never touched.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {themeBuild} from './build.mjs';
import {logger} from '../../logger.mjs';

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-build-icons-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

/**
 * Write a theme source (plus a loadable icons source beside it) under
 * `<tmpDir>/src/`. The registry is a plain object — the emit path only
 * re-exports it, so no React is needed.
 */
function writeIconTheme({importPath = './icons', name = 'icotheme'} = {}) {
  const srcDir = path.join(tmpDir, 'src');
  fs.mkdirSync(srcDir, {recursive: true});
  fs.writeFileSync(
    path.join(srcDir, 'icons.ts'),
    `export const myIcons = { close: 'x' };\n`,
  );
  fs.writeFileSync(
    path.join(srcDir, `${name}.ts`),
    `import { myIcons } from '${importPath}';\n` +
      `export default { name: '${name}', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
  );
  return `src/${name}.ts`;
}

/** Pre-create a compiled companion module in `<tmpDir>/dist/`. */
function writeCompanion(fileName) {
  const distDir = path.join(tmpDir, 'dist');
  fs.mkdirSync(distDir, {recursive: true});
  fs.writeFileSync(
    path.join(distDir, fileName),
    `export const myIcons = { close: 'x' };\n`,
  );
}

function builtModule(name = 'icotheme') {
  return fs.readFileSync(path.join(tmpDir, 'dist', `${name}.js`), 'utf8');
}

describe('icon import emitted into the built module', () => {
  it('rewrites ./icons to ./icons.mjs when the compiled companion exists (#4620)', async () => {
    const file = writeIconTheme();
    writeCompanion('icons.mjs');

    const result = await themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    const js = builtModule();
    expect(js).toContain(`from './icons.mjs'`);
    expect(js).not.toMatch(/from '\.\/icons';/);
    // The registry re-export survives the rewrite.
    expect(js).toContain('export { myIcons }');
  });

  it('prefers .mjs over .js when both exist — .js is the CJS twin registry (#4620)', async () => {
    const file = writeIconTheme();
    writeCompanion('icons.mjs');
    writeCompanion('icons.js');

    await themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule()).toContain(`from './icons.mjs'`);
  });

  it('falls back to .js when it is the only compiled companion', async () => {
    const file = writeIconTheme();
    writeCompanion('icons.js');

    await themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule()).toContain(`from './icons.js'`);
  });

  it('fails loudly — before writing anything — when no module can satisfy the import (#4621)', async () => {
    const file = writeIconTheme();
    // No companion anywhere: dist/ does not even exist yet.

    await expect(
      themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_ICON_UNRESOLVED'});

    // Stage-then-commit: the failed build must not leave partial output.
    expect(fs.existsSync(path.join(tmpDir, 'dist'))).toBe(false);
  });

  it('names the specifier and the out dir in the failure', async () => {
    const file = writeIconTheme();

    await expect(
      themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir}),
    ).rejects.toThrow(/'\.\/icons'.*dist/s);
  });

  it('keeps the specifier and warns when only the TS source sits beside the output (in-place build)', async () => {
    const file = writeIconTheme();
    const warnSpy = vi.spyOn(logger, 'warn');

    // Output lands in src/ itself — beside icons.ts. Bundler consumers
    // resolve './icons' onto the source; Node consumers cannot.
    const result = await themeBuild(file, {out: 'src/theme.css'}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    const js = fs.readFileSync(path.join(tmpDir, 'src', 'icotheme.js'), 'utf8');
    expect(js).toContain(`from './icons'`);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`'./icons'`),
    );
    // The warning also reaches programmatic callers through the receipt —
    // the shared logger is silent for them.
    expect(result?.data.warnings).toEqual([
      expect.stringContaining(`'./icons'`),
    ]);
  });

  it('keeps an already fully-specified relative import that resolves', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, 'icons-real.mjs'),
      `export const myIcons = { close: 'x' };\n`,
    );
    fs.writeFileSync(
      path.join(srcDir, 'spec.mjs'),
      `import { myIcons } from './icons-real.mjs';\n` +
        `export default { name: 'spec', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
    );
    writeCompanion('icons-real.mjs');

    await themeBuild('src/spec.mjs', {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule('spec')).toContain(`from './icons-real.mjs'`);
  });

  it('leaves bare package specifiers untouched', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    const pkgDir = path.join(tmpDir, 'node_modules', 'ico-pkg');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: 'ico-pkg', version: '1.0.0', main: 'index.js'}),
    );
    fs.writeFileSync(
      path.join(pkgDir, 'index.js'),
      `exports.myIcons = { close: 'x' };\n`,
    );
    fs.writeFileSync(
      path.join(srcDir, 'barespec.ts'),
      `import { myIcons } from 'ico-pkg';\n` +
        `export default { name: 'barespec', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
    );
    const warnSpy = vi.spyOn(logger, 'warn');

    await themeBuild('src/barespec.ts', {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule('barespec')).toContain(`from 'ico-pkg'`);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('rewrites a parent-relative specifier onto its compiled companion', async () => {
    const sharedDir = path.join(tmpDir, 'shared');
    fs.mkdirSync(sharedDir, {recursive: true});
    // Loadable source for jiti…
    fs.writeFileSync(
      path.join(sharedDir, 'icons.ts'),
      `export const myIcons = { close: 'x' };\n`,
    );
    // …and the compiled companion where the OUTPUT will resolve it:
    // dist/../shared/icons.mjs.
    fs.writeFileSync(
      path.join(sharedDir, 'icons.mjs'),
      `export const myIcons = { close: 'x' };\n`,
    );
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, 'parented.ts'),
      `import { myIcons } from '../shared/icons';\n` +
        `export default { name: 'parented', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
    );

    await themeBuild('src/parented.ts', {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule('parented')).toContain(`from '../shared/icons.mjs'`);
  });

  it('rewrites a nested ./subdir specifier onto its compiled companion', async () => {
    const srcDir = path.join(tmpDir, 'src', 'nested');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, 'icons.ts'),
      `export const myIcons = { close: 'x' };\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'nester.ts'),
      `import { myIcons } from './nested/icons';\n` +
        `export default { name: 'nester', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
    );
    const distNested = path.join(tmpDir, 'dist', 'nested');
    fs.mkdirSync(distNested, {recursive: true});
    fs.writeFileSync(
      path.join(distNested, 'icons.mjs'),
      `export const myIcons = { close: 'x' };\n`,
    );

    await themeBuild('src/nester.ts', {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule('nester')).toContain(`from './nested/icons.mjs'`);
  });

  it('falls back to .cjs when it is the only compiled companion', async () => {
    const file = writeIconTheme();
    writeCompanion('icons.cjs');

    await themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(builtModule()).toContain(`from './icons.cjs'`);
  });

  it('a directory named like the specifier is not a module — the build fails (no ESM directory imports)', async () => {
    const file = writeIconTheme();
    fs.mkdirSync(path.join(tmpDir, 'dist', 'icons'), {recursive: true});

    await expect(
      themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_ICON_UNRESOLVED'});
  });

  it('a fully-specified relative import that resolves nothing also fails the build', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, 'icons-real.mjs'),
      `export const myIcons = { close: 'x' };\n`,
    );
    fs.writeFileSync(
      path.join(srcDir, 'spec-missing.mjs'),
      `import { myIcons } from './icons-real.mjs';\n` +
        `export default { name: 'specmissing', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
    );
    // No dist/icons-real.mjs — the explicit spelling resolves nothing there.

    await expect(
      themeBuild('src/spec-missing.mjs', {out: 'dist/theme.css'}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_ICON_UNRESOLVED'});
  });

  it('the default out path (beside the source) takes the in-place warn path', async () => {
    const file = writeIconTheme();
    const warnSpy = vi.spyOn(logger, 'warn');

    // No `out`: outputs land next to the source file, where only icons.ts
    // exists — the default invocation for a theme scaffolded from a template.
    const result = await themeBuild(file, {}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    const js = fs.readFileSync(path.join(tmpDir, 'src', 'icotheme.js'), 'utf8');
    expect(js).toContain(`from './icons'`);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(result?.data.warnings).toHaveLength(1);
  });

  it('a compiled companion beats the TS-sibling warn path (ladder order)', async () => {
    const file = writeIconTheme();
    // In-place build where BOTH the TS source and a compiled .cjs sit in the
    // out dir — the compiled module must win, silently.
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'icons.cjs'),
      `exports.myIcons = { close: 'x' };\n`,
    );
    const warnSpy = vi.spyOn(logger, 'warn');

    const result = await themeBuild(file, {out: 'src/theme.css'}, {cwd: tmpDir});

    const js = fs.readFileSync(path.join(tmpDir, 'src', 'icotheme.js'), 'utf8');
    expect(js).toContain(`from './icons.cjs'`);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(result?.data.warnings).toEqual([]);
  });

  it('requires an exact-case companion — a case-insensitive FS match is not a real module', async () => {
    const file = writeIconTheme();
    // Wrong case on disk. macOS statSync happily matches `icons.mjs` onto
    // ICONS.mjs; the emitted specifier would then fail on the case-sensitive
    // systems the artifact actually ships to (Linux servers, CI). Only the
    // exact on-disk name may satisfy the import — on every platform this
    // build must fail, not emit a mac-only module.
    writeCompanion('ICONS.mjs');

    await expect(
      themeBuild(file, {out: 'dist/theme.css'}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_THEME_ICON_UNRESOLVED'});
  });

  it('builds a theme without icons exactly as before (control)', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, {recursive: true});
    fs.writeFileSync(
      path.join(srcDir, 'plain.mjs'),
      `export default { name: 'plain', tokens: { '--color-bg': '#fff' } };\n`,
    );

    const result = await themeBuild('src/plain.mjs', {out: 'dist/theme.css'}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    // No import statements — the word "import" does appear in the usage
    // comment the module header carries.
    expect(builtModule('plain')).not.toMatch(/^import /m);
  });
});
