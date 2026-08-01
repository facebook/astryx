// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression tests for `astryx theme build --icons-specifier`.
 *
 * The generated module imports the icon registry rather than inlining it,
 * because the registry holds React elements. `extractIconInfo` lifts that
 * specifier out of the TypeScript source, where an extensionless `./icons` is
 * resolved by the TypeScript resolver — but the artifact is ESM JavaScript,
 * which requires a fully specified path, so Node cannot load it. See #4620.
 *
 * Only the caller knows what its own build emits and under what name (the same
 * source compiled by tsup lands at `icons.mjs` in a package with no `"type"`
 * field and at `icons.js` in one with `"type": "module"`), so the specifier is
 * declared rather than inferred. Absent the flag, output is byte-for-byte what
 * it was before, which keeps the default no-`--out` flow — where the neighbour
 * is an uncompiled `icons.tsx` that only a bundler can resolve — working.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

/**
 * The emitted icon import, or null. Reads the statement rather than the whole
 * file: the `@generated` header quotes the source filename and a usage example,
 * so a substring search over the file matches comment text too.
 */
function iconImportLine(generated) {
  const match = generated.match(/^import .*$/m);
  return match ? match[0] : null;
}

/** A theme whose registry arrives via a relative import, plus that module. */
function writeThemeWithIcons(dir, name) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'icons.mjs'),
    'export const testIcons = {};\n',
  );
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `import {testIcons} from './icons';\n` +
      `export default {\n` +
      `  name: ${JSON.stringify(name)},\n` +
      `  icons: testIcons,\n` +
      `  tokens: {'--color-bg': '#fff'},\n` +
      `};\n`,
  );
  return file;
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-icons-specifier-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build --icons-specifier', () => {
  it('emits the declared specifier', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeThemeWithIcons(project, 'declared');

    const result = await runCli(
      [
        'theme',
        'build',
        path.relative(project, themeFile),
        '--icons-specifier',
        './icons.mjs',
      ],
      project,
    );
    expect(result.code).toBe(0);

    const generated = fs.readFileSync(
      path.join(project, 'declared.js'),
      'utf8',
    );
    expect(iconImportLine(generated)).toBe(
      'import { testIcons } from "./icons.mjs";',
    );
  });

  it('accepts a specifier the generator could never have inferred', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeThemeWithIcons(project, 'custom');

    const result = await runCli(
      [
        'theme',
        'build',
        path.relative(project, themeFile),
        '--icons-specifier',
        '../build/registry/icons.js',
      ],
      project,
    );
    expect(result.code).toBe(0);

    const generated = fs.readFileSync(path.join(project, 'custom.js'), 'utf8');
    expect(iconImportLine(generated)).toBe(
      'import { testIcons } from "../build/registry/icons.js";',
    );
  });

  it('encodes the declared specifier as a valid JavaScript string', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeThemeWithIcons(project, 'encoded');

    const result = await runCli(
      [
        'theme',
        'build',
        path.relative(project, themeFile),
        '--icons-specifier',
        "./icon's.mjs",
      ],
      project,
    );
    expect(result.code).toBe(0);

    const generated = fs.readFileSync(path.join(project, 'encoded.js'), 'utf8');
    expect(iconImportLine(generated)).toBe(
      'import { testIcons } from "./icon\'s.mjs";',
    );
  });

  it('combines with the current --check flow', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeThemeWithIcons(project, 'checked');
    const relativeTheme = path.relative(project, themeFile);

    const built = await runCli(
      [
        'theme',
        'build',
        relativeTheme,
        '--icons-specifier',
        './icons.mjs',
      ],
      project,
    );
    expect(built.code).toBe(0);

    const withoutSpecifier = await runCli(
      ['theme', 'build', relativeTheme, '--check'],
      project,
    );
    expect(withoutSpecifier.code).toBe(1);

    const withSpecifier = await runCli(
      [
        'theme',
        'build',
        relativeTheme,
        '--check',
        '--icons-specifier',
        './icons.mjs',
      ],
      project,
    );
    expect(withSpecifier.code).toBe(0);
  });

  it('leaves the scraped specifier untouched when the flag is absent', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeThemeWithIcons(project, 'untouched');

    const result = await runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );
    expect(result.code).toBe(0);

    // The pre-flag behaviour, preserved: no extension is invented. In this
    // layout the neighbour is a source file only a bundler can resolve, so
    // adding one would break a build that works today.
    const generated = fs.readFileSync(
      path.join(project, 'untouched.js'),
      'utf8',
    );
    expect(iconImportLine(generated)).toBe(
      "import { testIcons } from './icons';",
    );
  });

  it('is inert for a theme with no icons field', async () => {
    const project = path.join(tmpDir, 'project');
    fs.mkdirSync(project, {recursive: true});
    const themeFile = path.join(project, 'plain.mjs');
    fs.writeFileSync(
      themeFile,
      `export default {name: 'plain', tokens: {'--color-bg': '#fff'}};\n`,
    );

    const result = await runCli(
      [
        'theme',
        'build',
        path.relative(project, themeFile),
        '--icons-specifier',
        './icons.mjs',
      ],
      project,
    );
    expect(result.code).toBe(0);

    // No icons field means no import to rewrite, so the flag has nothing to act
    // on and must not introduce one.
    const generated = fs.readFileSync(path.join(project, 'plain.js'), 'utf8');
    expect(iconImportLine(generated)).toBeNull();
    expect(generated).not.toContain('icons:');
  });
});
