// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for the custom-variant type augmentations emitted by
 * `astryx theme build` (#3391 companion: #3371).
 *
 * When a theme declares a custom component prop value (e.g.
 * `button['variant:accentOutline']`), the build emits a `<name>.variants.d.ts`
 * with a module augmentation so the custom value type-checks. This suite pins
 * the two bugs that made that augmentation dead code:
 *
 *   1. The augmentation targeted a non-existent, `XDS`-prefixed interface
 *      (`XDSButtonVariantMap`) instead of core's real `ButtonVariantMap`, so it
 *      created a new unused interface and never widened the prop union.
 *   2. Props with no augmentation point (closed literal-union types such as
 *      Button `size` or Heading `type`/`level`) still got a `declare module`
 *      block against a `*Map` interface that doesn't exist.
 *   3. The generated `.variants.d.ts` was never referenced by the main
 *      `<name>.d.ts`, so even a correct augmentation never loaded.
 *
 * Building `astryx theme build` requires a compiled @astryxdesign/core, so this
 * suite builds core once in beforeAll (mirrors build-theme.prose.test.mjs).
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');

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

function writeTheme(dir, contents) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, 'variants-theme.mjs');
  fs.writeFileSync(file, contents);
  return file;
}

// Build core through the shared lock helper — this suite previously ran its
// own unguarded `if (!exists) pnpm -F core build`, and when Vitest scheduled
// it alongside the other build-theme suites on a fresh checkout, the
// concurrent builds collided on packages/core/dist (core's build starts by
// wiping dist), nondeterministically breaking whichever suite was mid-read.
beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-variants-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build custom-variant augmentations', () => {
  it('targets the real (un-prefixed) core interface for a custom variant', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'variant:accentOutline': { backgroundColor: 'transparent' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const variantsPath = path.join(tmpDir, 'variants-theme.variants.d.ts');
    expect(fs.existsSync(variantsPath)).toBe(true);
    const dts = fs.readFileSync(variantsPath, 'utf-8');

    // Targets core's actual augmentation point…
    expect(dts).toContain("declare module '@astryxdesign/core/Button'");
    expect(dts).toMatch(/interface ButtonVariantMap\b/);
    expect(dts).toContain("'accentOutline': true;");
    // …and NOT the old, non-existent XDS-prefixed interface.
    expect(dts).not.toMatch(/XDSButtonVariantMap/);
  });

  it('skips props with no augmentation point (Button size, Heading type)', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: {
            'variant:accentOutline': { backgroundColor: 'transparent' },
            'size:jumbo': { paddingBlock: '40px' },
          },
          heading: { 'type:hero': { fontSize: '80px' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const variantsPath = path.join(tmpDir, 'variants-theme.variants.d.ts');
    expect(fs.existsSync(variantsPath)).toBe(true);
    const dts = fs.readFileSync(variantsPath, 'utf-8');

    // The augmentable variant is emitted…
    expect(dts).toMatch(/interface ButtonVariantMap\b/);
    // …but closed literal-union props get no dead augmentation.
    expect(dts).not.toMatch(/ButtonSizeMap/);
    expect(dts).not.toMatch(/HeadingTypeMap/);
    expect(dts).not.toContain("declare module '@astryxdesign/core/Heading'");
  });

  it('does not emit a .variants.d.ts when every custom value is non-augmentable', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'size:jumbo': { paddingBlock: '40px' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);
    expect(
      fs.existsSync(path.join(tmpDir, 'variants-theme.variants.d.ts')),
    ).toBe(false);
  });

  it('references the variants file from the main .d.ts so the augmentation loads', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'variant:accentOutline': { backgroundColor: 'transparent' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const dts = fs.readFileSync(
      path.join(tmpDir, 'variants-theme.d.ts'),
      'utf-8',
    );
    // A triple-slash reference to the variants file, so importing the theme's
    // types also loads the module augmentation.
    expect(dts).toMatch(
      /\/\/\/\s*<reference path="\.\/variants-theme\.variants\.d\.ts"\s*\/>/,
    );
  });
});
