// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Ensures `astryx theme build` preserves AST-012 adaptation semantics.
 * Runtime and static output share core's compiler; this suite guards the CLI
 * loading, diagnostics, serialization, and extension boundaries around it.
 */

import {afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

function writeTheme(dir, name, inputSource) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `import {defineTheme} from '@astryxdesign/core/theme';\n` +
      `export default defineTheme(${inputSource});\n`,
  );
  return file;
}

function writePlainTheme(dir, name, inputSource) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(file, `export default ${inputSource};\n`);
  return file;
}

async function build(project, themeFile) {
  return runCli(['theme', 'build', path.relative(project, themeFile)], project);
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-build-theme-adaptations-'),
  );
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build adaptations', () => {
  it('emits ordered closed conditions after root values', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'ordered',
      `{
        name: 'ordered',
        tokens: {'--spacing-4': '16px'},
        adaptations: {
          widthBreakpoints: {md: 800, lg: 1100},
          rules: [
            {
              when: {width: {from: 'md', below: 'lg'}, pointer: 'coarse'},
              value: {tokens: {'--spacing-4': '12px'}},
            },
            {
              when: {contrast: 'more', motion: 'reduce'},
              value: {tokens: {'--spacing-4': '20px'}},
            },
          ],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const css = fs.readFileSync(path.join(themesDir, 'ordered.css'), 'utf-8');
    expect(css).toContain(
      '@media (width >= 800px) and (width < 1100px) and (pointer: coarse)',
    );
    expect(css).toContain(
      '@media (prefers-contrast: more) and (prefers-reduced-motion: reduce)',
    );
    expect(css.indexOf('--spacing-4: 16px')).toBeLessThan(
      css.indexOf('--spacing-4: 12px'),
    );
    expect(css.indexOf('--spacing-4: 12px')).toBeLessThan(
      css.indexOf('--spacing-4: 20px'),
    );
  });

  it('resolves a plain object whose only input-only field is adaptations', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writePlainTheme(
      themesDir,
      'plain-adaptive',
      `{
        name: 'plain-adaptive',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {tokens: {'--color-accent': ['#111111', '#eeeeee']}},
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const css = fs.readFileSync(
      path.join(themesDir, 'plain-adaptive.css'),
      'utf-8',
    );
    expect(css).toContain('@media (pointer: coarse)');
    expect(css).toContain('light-dark(#111111, #eeeeee)');
    expect(css).not.toContain('#111111,#eeeeee');
  });

  it('emits the color-scheme guard for a tuple declared only in a rule', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'rule-tuple',
      `{
        name: 'rule-tuple',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {tokens: {'--color-accent': ['#0077B6', '#48CAE4']}},
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const css = fs.readFileSync(
      path.join(themesDir, 'rule-tuple.css'),
      'utf-8',
    );
    expect(css).toContain(':root { color-scheme: light dark; }');
    expect(css).toContain('html[data-theme="light"] { color-scheme: light; }');
    expect(css).toContain('html[data-theme="dark"] { color-scheme: dark; }');
  });

  it('keeps media-surface overrides after adaptation rules', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'surface-order',
      `{
        name: 'surface-order',
        tokens: {'--color-background-body': '#ffffff'},
        adaptations: {
          rules: [{
            when: {contrast: 'more'},
            value: {tokens: {'--color-background-body': '#eeeeee'}},
          }],
        },
        onDark: {tokens: {'--color-background-body': '#111111'}},
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const css = fs.readFileSync(
      path.join(themesDir, 'surface-order.css'),
      'utf-8',
    );
    expect(css.indexOf('#eeeeee')).toBeLessThan(css.lastIndexOf('#111111'));
    expect(css.lastIndexOf('[data-astryx-media="dark"]')).toBeGreaterThan(
      css.indexOf('@media (prefers-contrast: more)'),
    );
  });

  it('serializes normalized intent and axes, not resolved rule CSS', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'built-base',
      `{
        name: 'built-base',
        typography: {scale: {base: 14, ratio: 1.25}},
        adaptations: {
          widthBreakpoints: {sm: 700},
          rules: [{
            when: {width: {below: 'sm'}},
            value: {
              typography: {
                scale: {base: 16},
                body: {family: 'Revision Webfont'},
              },
              tokens: {'--color-accent': ['#111111', '#eeeeee']},
            },
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const jsPath = path.join(themesDir, 'built-base.js');
    const js = fs.readFileSync(jsPath, 'utf-8');
    expect(js).toContain('__adaptations');
    expect(js).toContain('__axes');
    expect(js).not.toContain('__adaptationRules');
    expect(js).not.toContain('@media');
    expect(
      Buffer.byteLength(js.slice(js.indexOf('__adaptations'))),
    ).toBeLessThan(1_500);

    const {builtBaseTheme} = await import(
      `${pathToFileURL(jsPath).href}?test=${Date.now()}`
    );
    const {defineTheme} = await import('@astryxdesign/core/theme');
    const child = defineTheme({
      name: 'built-child',
      extends: builtBaseTheme,
      adaptations: {widthBreakpoints: {sm: 720}},
    });
    expect(child.__adaptationRules?.[0].query).toBe('(width < 720px)');
    expect(child.__adaptationRules?.[0].tokens['--font-size-lg']).toBe(
      '1.25rem',
    );

    const rebuildDir = path.join(project, 'rebuild');
    fs.mkdirSync(rebuildDir, {recursive: true});
    const rebuiltInput = path.join(rebuildDir, 'rebuilt.mjs');
    fs.writeFileSync(
      rebuiltInput,
      `export {builtBaseTheme as default} from '../themes/built-base.js';\n`,
    );
    const rebuilt = await build(project, rebuiltInput);
    expect(rebuilt.code).toBe(0);
    const rebuiltCss = fs.readFileSync(
      path.join(rebuildDir, 'built-base.css'),
      'utf-8',
    );
    expect(rebuiltCss).toContain('@media (width < 700px)');
    expect(rebuiltCss).toContain('--font-size-lg: 1.25rem');
    expect(rebuiltCss).toContain('light-dark(#111111, #eeeeee)');
    expect(rebuiltCss).toContain(':root { color-scheme: light dark; }');
    expect(`${rebuilt.stdout}${rebuilt.stderr}`).toContain(
      'Font "Revision Webfont" is named by this theme but not loaded',
    );
  });

  it('retains the effective width map even when no rules emit CSS', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'points-only',
      `{
        name: 'points-only',
        tokens: {'--spacing-4': '18px'},
        adaptations: {widthBreakpoints: {xl: 1400}},
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);

    const css = fs.readFileSync(
      path.join(themesDir, 'points-only.css'),
      'utf-8',
    );
    const js = fs.readFileSync(path.join(themesDir, 'points-only.js'), 'utf-8');
    expect(css).not.toContain('@media');
    expect(js).toMatch(/"xl": 1400/);
    expect(js).toContain('__adaptations');
  });

  it('allows an existing built-in visual value inside a rule', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'builtin-variant',
      `{
        name: 'builtin-variant',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {
              components: {
                button: {'variant:secondary': {borderWidth: '3px'}},
                heading: {'level:1': {letterSpacing: '-0.01em'}},
              },
            },
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);
    const css = fs.readFileSync(
      path.join(themesDir, 'builtin-variant.css'),
      'utf-8',
    );
    expect(css).toContain('border-width: 3px');
    expect(css).toContain('letter-spacing: -0.01em');
  });

  it('warns rather than hard-failing unknown rule targets and axes', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'unknown-rule-axis',
      `{
        name: 'unknown-rule-axis',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {
              components: {table: {'density:compact': {borderWidth: '3px'}}},
            },
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      'Unknown prop "density" on component "table"',
    );
    expect(
      fs.readFileSync(path.join(themesDir, 'unknown-rule-axis.css'), 'utf-8'),
    ).toContain('border-width: 3px');
  });

  it('requires custom visual values on the root surface before rules use them', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const badFile = writeTheme(
      themesDir,
      'rule-only-variant',
      `{
        name: 'rule-only-variant',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {
              components: {button: {'variant:brandy': {borderWidth: '3px'}}},
            },
          }],
        },
      }`,
    );

    const bad = await build(project, badFile);
    expect(bad.code).not.toBe(0);
    expect(`${bad.stdout}${bad.stderr}`).toContain(
      'Declare custom visual-prop values on the root theme first',
    );
    expect(fs.existsSync(path.join(themesDir, 'rule-only-variant.css'))).toBe(
      false,
    );

    const goodFile = writeTheme(
      themesDir,
      'root-variant',
      `{
        name: 'root-variant',
        components: {button: {'variant:brandy': {borderWidth: '1px'}}},
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {
              components: {button: {'variant:brandy': {borderWidth: '3px'}}},
            },
          }],
        },
      }`,
    );

    const good = await build(project, goodFile);
    expect(good.code).toBe(0);
    expect(
      fs.readFileSync(
        path.join(themesDir, 'root-variant.variants.d.ts'),
        'utf-8',
      ),
    ).toContain('brandy');
  });

  it('validates private variables declared only in a rule', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'rule-private',
      `{
        name: 'rule-private',
        adaptations: {
          rules: [{
            when: {pointer: 'coarse'},
            value: {
              components: {button: {base: {'--_button-pad': '3px'}}},
            },
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(`${result.stdout}${result.stderr}`).toContain('private var');
  });

  it('rejects cycles across co-matching rules before writing output', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const a = '--astryx-theme-overlap-build-a';
    const b = '--astryx-theme-overlap-build-b';
    const themeFile = writePlainTheme(
      themesDir,
      'overlap-build',
      `{
        name: 'overlap-build',
        localTokens: {'${a}': '1px', '${b}': '2px'},
        adaptations: {
          rules: [
            {
              when: {pointer: 'coarse'},
              value: {localTokens: {'${a}': 'var(${b})'}},
            },
            {
              when: {contrast: 'more'},
              value: {localTokens: {'${b}': 'var(${a})'}},
            },
          ],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(
      /overlapping rules \[0, 1\].*cycle detected/i,
    );
    expect(fs.existsSync(path.join(themesDir, 'overlap-build.css'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(themesDir, 'overlap-build.js'))).toBe(false);
  });

  it('reports invalid serialized adaptation metadata as ERR_THEME_INVALID', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writePlainTheme(
      themesDir,
      'stale-built',
      `{
        name: 'stale-built',
        __built: true,
        tokens: {'--spacing-4': '16px'},
        __adaptations: {
          widthBreakpoints: {
            sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536,
          },
          rules: [{
            when: {pointer: 'sideways'},
            value: {tokens: {'--spacing-4': '12px'}},
          }],
        },
        __axes: {},
      }`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(project, themeFile), '--json'],
      project,
    );
    expect(result.code).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain('ERR_THEME_INVALID');
    expect(`${result.stdout}${result.stderr}`).toContain(
      "when.pointer must be 'coarse' or 'fine'",
    );
    expect(fs.existsSync(path.join(themesDir, 'stale-built.css'))).toBe(false);
  });

  it('rejects invalid metadata before writing any output', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writePlainTheme(
      themesDir,
      'invalid-range',
      `{
        name: 'invalid-range',
        adaptations: {
          rules: [{
            when: {width: {from: 'xl', below: 'md'}},
            value: {tokens: {'--spacing-4': '12px'}},
          }],
        },
      }`,
    );

    const result = await build(project, themeFile);
    expect(result.code).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      'must resolve to `from < below`',
    );
    expect(fs.existsSync(path.join(themesDir, 'invalid-range.css'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(themesDir, 'invalid-range.js'))).toBe(false);
  });
});
