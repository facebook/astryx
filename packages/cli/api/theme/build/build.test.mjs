// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Direct API tests for `themeBuild()` — the programmatic surface behind
 * `astryx theme build` (`@astryxdesign/cli/api`).
 *
 * The CLI suites (cli/commands/build-theme.*.test.mjs) drive `registerTheme`
 * end-to-end; these assert the API contract you get calling `themeBuild()` in
 * code: the typed `theme.build` receipt (with files actually written to disk),
 * that it honors the `cwd` option, stays SILENT under the default noopLogger,
 * and returns `null` when there is nothing to build.
 *
 * `themeBuild` compiles via @astryxdesign/core's generator, so it needs a built
 * core — the `node` project's globalSetup (vitest.global-setup.node.mjs) builds
 * it once before workers fork.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  generateThemeRulesSplit as mockGenerateThemeRulesSplit,
  generateOnMediaCSS as mockGenerateOnMediaCSS,
} from '@astryxdesign/core/theme';
import {themeBuild} from './build.mjs';

// `themeBuild` captures core's generator once at module load. Wrap the two
// CSS-emitting exports in vi.fn (call-through by default) so the receipt tests
// exercise the REAL generator, while the "nothing to build" test can force an
// empty result for a single call — the only way to reach that branch, since
// core's prose element defaults otherwise always ship a non-empty CSS block.
vi.mock('@astryxdesign/core/theme', async importActual => {
  const actual = /** @type {Record<string, unknown>} */ (await importActual());
  return {
    ...actual,
    generateThemeRulesSplit: vi.fn(actual.generateThemeRulesSplit),
    generateOnMediaCSS: vi.fn(actual.generateOnMediaCSS),
  };
});

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-build-api-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  // Clear call history only — do NOT restore, which would drop the vi.fn
  // call-through implementations set up in the factory above.
  vi.clearAllMocks();
});

describe('themeBuild() — receipt', () => {
  it('compiles a minimal theme and returns a theme.build receipt with files on disk', async () => {
    const themeFile = path.join(tmpDir, 'apitheme.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'apitheme', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    // Resolve `file` against the cwd option (not process.cwd()).
    const result = await themeBuild('apitheme.mjs', {}, {cwd: tmpDir});

    expect(result).not.toBeNull();
    expect(result?.type).toBe('theme.build');
    expect(result?.data.name).toBe('apitheme');
    expect(result?.data.sizeKB).toBeGreaterThan(0);

    // Output paths are cwd-relative and derive from the theme name…
    expect(result?.data.outputs.css).toBe('apitheme.css');
    expect(result?.data.outputs.js).toBe('apitheme.js');
    expect(result?.data.outputs.dts).toBe('apitheme.d.ts');
    // …and every declared output actually exists on disk.
    for (const rel of [
      result?.data.outputs.css,
      result?.data.outputs.js,
      result?.data.outputs.dts,
    ]) {
      expect(
        fs.existsSync(path.join(tmpDir, /** @type {string} */ (rel))),
      ).toBe(true);
    }
  });

  it('is silent by default (noopLogger) — no console output for a scripted caller', async () => {
    const themeFile = path.join(tmpDir, 'quiet.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'quiet', tokens: { '--color-bg': '#fff' } };\n`,
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    try {
      const result = await themeBuild('quiet.mjs', {}, {cwd: tmpDir});
      expect(result?.type).toBe('theme.build');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
      expect(outSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errSpy.mockRestore();
      outSpy.mockRestore();
    }
  });
});

describe('themeBuild() — nothing to build', () => {
  it('returns null and writes nothing when the generator yields no CSS', async () => {
    const themeFile = path.join(tmpDir, 'empty.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'empty', tokens: {} };\n`,
    );

    // Force the generator to emit nothing for this one build (prose defaults
    // otherwise always ship, so this branch is unreachable with real output).
    mockGenerateThemeRulesSplit.mockReturnValueOnce({component: [], prose: []});
    mockGenerateOnMediaCSS.mockReturnValueOnce('');

    const result = await themeBuild('empty.mjs', {}, {cwd: tmpDir});

    expect(result).toBeNull();
    // Nothing written — the tmp dir still holds only the source fixture.
    expect(fs.readdirSync(tmpDir)).toEqual(['empty.mjs']);
  });
});

describe('themeBuild() — check mode', () => {
  it('reports upToDate with no stale files and writes nothing when outputs match the source', async () => {
    const themeFile = path.join(tmpDir, 'chk.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'chk', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    // Build once for real to produce the committed outputs.
    await themeBuild('chk.mjs', {}, {cwd: tmpDir});
    const before = fs.readFileSync(path.join(tmpDir, 'chk.css'), 'utf8');

    const result = await themeBuild('chk.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build.check');
    expect(result?.data.upToDate).toBe(true);
    expect(result?.data.stale).toEqual([]);
    expect(result?.data.checked).toContain('chk.css');
    // Check mode must not rewrite the file.
    expect(fs.readFileSync(path.join(tmpDir, 'chk.css'), 'utf8')).toBe(before);
  });

  it('flags a stale output when the committed CSS content drifts from the source', async () => {
    const themeFile = path.join(tmpDir, 'drift.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'drift', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('drift.mjs', {}, {cwd: tmpDir});

    // Tamper with the committed CSS (real content change, not just the header).
    const cssPath = path.join(tmpDir, 'drift.css');
    fs.writeFileSync(
      cssPath,
      fs.readFileSync(cssPath, 'utf8') + '\n.injected{}\n',
    );

    const result = await themeBuild('drift.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(false);
    expect(
      result?.data.stale.some(
        s => s.path === 'drift.css' && s.reason === 'outdated',
      ),
    ).toBe(true);
  });

  it('flags a missing output', async () => {
    const themeFile = path.join(tmpDir, 'gone.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'gone', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('gone.mjs', {}, {cwd: tmpDir});
    fs.rmSync(path.join(tmpDir, 'gone.css'));

    const result = await themeBuild('gone.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(false);
    expect(
      result?.data.stale.some(
        s => s.path === 'gone.css' && s.reason === 'missing',
      ),
    ).toBe(true);
  });

  it('ignores volatile @generated header lines (a differing timestamp is NOT stale)', async () => {
    const themeFile = path.join(tmpDir, 'stamp.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'stamp', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('stamp.mjs', {}, {cwd: tmpDir});

    // Rewrite ONLY the Generated: timestamp line in the committed CSS.
    const cssPath = path.join(tmpDir, 'stamp.css');
    const tampered = fs
      .readFileSync(cssPath, 'utf8')
      .replace(/Generated: .*/, 'Generated: 1999-01-01T00:00:00.000Z');
    fs.writeFileSync(cssPath, tampered);

    const result = await themeBuild('stamp.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(true);
    expect(result?.data.stale).toEqual([]);
  });
});

describe('themeBuild() — component override validation', () => {
  it('accepts documented state keys without an "Unknown prop" warning', async () => {
    // The state-key syntax the Theming Infrastructure wiki documents —
    // `radio: {checked}`, `calendar-day: {today, selected}` — is declared in
    // each component's doc under `theming.targets[].states`, not
    // `visualProps`. `loadKnownComponents()` read only `visualProps`, so every
    // one of these warned "Unknown prop": documented syntax that looked broken.
    const themeFile = path.join(tmpDir, 'states.mjs');
    fs.writeFileSync(
      themeFile,
      `export default {
        name: 'states',
        tokens: {'--color-bg': '#0a0a0a'},
        components: {
          radio: {
            checked: {borderColor: 'var(--color-accent)'},
            'checked+disabled': {opacity: '0.5'},
          },
          'calendar-day': {
            today: {fontWeight: '700'},
            selected: {backgroundColor: 'var(--color-accent)'},
          },
        },
      };\n`,
    );

    const result = await themeBuild('states.mjs', {}, {cwd: tmpDir});

    expect(result?.data.warnings).toEqual([]);
  });

  it('accepts the heading type rules a type scale generates', async () => {
    // `typography.scale` makes defineTheme emit `heading: {'type:display-1' …}`
    // (Heading renders a `type:` class alongside `level:`), so any theme with a
    // type scale carried override keys the validator called unknown — including
    // the shipped neutralTheme.
    const themeFile = path.join(tmpDir, 'typescale.mjs');
    fs.writeFileSync(
      themeFile,
      `export default {
        name: 'typescale',
        tokens: {'--color-bg': '#0a0a0a'},
        components: {
          heading: {'type:display-1': {letterSpacing: '0.01em'}},
        },
      };\n`,
    );

    const result = await themeBuild('typescale.mjs', {}, {cwd: tmpDir});

    expect(result?.data.warnings).toEqual([]);
  });

  it('still warns on a key that is neither a visual prop nor a state', async () => {
    // Widening the known set to states must not turn the guard off.
    const themeFile = path.join(tmpDir, 'bogus.mjs');
    fs.writeFileSync(
      themeFile,
      `export default {
        name: 'bogus',
        tokens: {'--color-bg': '#0a0a0a'},
        components: {radio: {notAState: {opacity: '0.5'}}},
      };\n`,
    );

    const result = await themeBuild('bogus.mjs', {}, {cwd: tmpDir});

    expect(result?.data.warnings).toEqual([
      expect.stringContaining('Unknown prop "notAState" on component "radio"'),
    ]);
  });
});

describe('themeBuild() — the shipped theme template', () => {
  // `assets/theme.template.ts` is what `astryx theme template` puts in a
  // consumer's project. It is the one theme file we hand out, so it has to
  // compile as shipped — and cleanly: a template that greets its first reader
  // with warnings teaches them to ignore warnings. The claims its comments make
  // are checked separately by scripts/check-theme-template.test.mjs.
  it('compiles as shipped, with no warnings', async () => {
    const src = path.resolve(
      import.meta.dirname,
      '../../../assets/theme.template.ts',
    );
    fs.copyFileSync(src, path.join(tmpDir, 'theme.template.ts'));

    const result = await themeBuild('theme.template.ts', {}, {cwd: tmpDir});

    expect(result?.data.warnings).toEqual([]);
    // It DOES name Inter and Geist Mono without loading them, to teach "SHIP
    // THE FONTS YOU NAME" — advisories about a correct file, which is why they
    // are notices. Asserted here so moving them out of `warnings` cannot
    // quietly become dropping them.
    expect(result?.data.notices).toHaveLength(2);
    expect(fs.existsSync(path.join(tmpDir, 'my-theme.css'))).toBe(true);
    // The template teaches custom variants; the augmentation it promises the
    // reader has to actually be generated.
    expect(fs.existsSync(path.join(tmpDir, 'my-theme.variants.d.ts'))).toBe(
      true,
    );
  });
});

describe('themeBuild() — extends', () => {
  // These fixtures `import {defineTheme} from '@astryxdesign/core/theme'` the
  // way a real theme file does, so they have to sit somewhere that specifier
  // resolves — an OS temp dir has no node_modules above it.
  let extDir;
  beforeEach(() => {
    extDir = fs.mkdtempSync(
      path.join(path.resolve(import.meta.dirname, '../../..'), '.tmp-extends-'),
    );
  });
  afterEach(() => {
    fs.rmSync(extDir, {recursive: true, force: true});
  });

  /**
   * Every `prop: value` a generated stylesheet actually applies. Header
   * comments and scope wrappers are ignored — two themes never share those.
   */
  function declarations(css) {
    return new Set(
      css
        .split('\n')
        .map(l => l.trim())
        .filter(l => /^[-a-z][^{}]*:.+;$/.test(l)),
    );
  }
  /** Every component rule a stylesheet opens, e.g. `.astryx-switch {`. */
  function selectors(css) {
    return new Set(
      css
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.endsWith('{') && l.startsWith('.')),
    );
  }

  /** A base theme with geometry, elevation and a component override. */
  const BASE_SOURCE = `export const brandTheme = {
    name: 'ext-base',
    tokens: {
      '--radius-element': '6px',
      '--shadow-low': '0 1px 3px rgb(0 0 0 / 0.1)',
      '--color-border-emphasized': '#D4D4D4',
    },
    components: {
      switch: {base: {backgroundColor: 'var(--color-border-emphasized)'}},
    },
  };\n`;

  /**
   * The child names its base with a plain relative specifier, exactly as a
   * generated palette does. `theme build` writes `ext-base.js` next to
   * `ext-base.mjs`, so `./ext-base` is ambiguous — and the artifact, which
   * exports `extBaseTheme` rather than `brandTheme`, is the wrong answer.
   */
  const CHILD_SOURCE = `import {defineTheme} from '@astryxdesign/core/theme';
  import {brandTheme} from './ext-base';
  export const paletteTheme = defineTheme({
    name: 'ext-child',
    extends: brandTheme,
    tokens: {'--color-accent': 'hsl(220 88% 72%)'},
  });\n`;

  it('emits every declaration its base emits (the child stylesheet is self-contained)', async () => {
    fs.writeFileSync(path.join(extDir, 'ext-base.mjs'), BASE_SOURCE);
    fs.writeFileSync(path.join(extDir, 'ext-child.mjs'), CHILD_SOURCE);

    // Build the base FIRST, as any real project does — that write is what
    // used to poison the child's build.
    await themeBuild('ext-base.mjs', {}, {cwd: extDir});
    await themeBuild('ext-child.mjs', {}, {cwd: extDir});

    const baseCss = fs.readFileSync(path.join(extDir, 'ext-base.css'), 'utf8');
    const childCss = fs.readFileSync(
      path.join(extDir, 'ext-child.css'),
      'utf8',
    );

    const childDecls = declarations(childCss);
    expect([...declarations(baseCss)].filter(d => !childDecls.has(d))).toEqual(
      [],
    );

    const childSelectors = selectors(childCss);
    expect([...selectors(baseCss)].filter(s => !childSelectors.has(s))).toEqual(
      [],
    );

    // …and the child's own override still wins.
    expect(childCss).toContain('--color-accent: hsl(220 88% 72%);');
  });

  it('resolves the base from its source, not from the generated sibling artifact', async () => {
    fs.writeFileSync(path.join(extDir, 'ext-base.mjs'), BASE_SOURCE);
    fs.writeFileSync(path.join(extDir, 'ext-child.mjs'), CHILD_SOURCE);

    await themeBuild('ext-base.mjs', {}, {cwd: extDir});
    const result = await themeBuild('ext-child.mjs', {}, {cwd: extDir});

    expect(result?.data.componentCount).toBe(1);
    expect(result?.data.tokenCount).toBe(4);
  });

  it('inherits component overrides when the base IS a built theme module', async () => {
    fs.writeFileSync(path.join(extDir, 'ext-base.mjs'), BASE_SOURCE);
    await themeBuild('ext-base.mjs', {}, {cwd: extDir});

    // Extending a package's pre-built theme module (e.g. the `./built`
    // subpath the shipped themes expose) must not silently drop its
    // component overrides.
    fs.writeFileSync(
      path.join(extDir, 'ext-built-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';
      import {extBaseTheme} from './ext-base.js';
      export const builtChildTheme = defineTheme({
        name: 'ext-built-child',
        extends: extBaseTheme,
      });\n`,
    );

    await themeBuild('ext-built-child.mjs', {}, {cwd: extDir});
    const css = fs.readFileSync(
      path.join(extDir, 'ext-built-child.css'),
      'utf8',
    );

    expect(css).toContain('.astryx-switch {');
    expect(css).toContain('--radius-element: 6px;');
  });

  it('resolves extends on a plain object theme file (no defineTheme call)', async () => {
    fs.writeFileSync(path.join(extDir, 'ext-base.mjs'), BASE_SOURCE);
    fs.writeFileSync(
      path.join(extDir, 'ext-plain.mjs'),
      `import {brandTheme} from './ext-base.mjs';
      export default {
        name: 'ext-plain',
        extends: brandTheme,
        tokens: {'--color-accent': '#ff0000'},
      };\n`,
    );

    await themeBuild('ext-base.mjs', {}, {cwd: extDir});
    await themeBuild('ext-plain.mjs', {}, {cwd: extDir});

    const css = fs.readFileSync(path.join(extDir, 'ext-plain.css'), 'utf8');
    expect(css).toContain('--radius-element: 6px;');
    expect(css).toContain('.astryx-switch {');
  });

  it('fails loudly when the base import resolved to nothing', async () => {
    fs.writeFileSync(
      path.join(extDir, 'ext-broken.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';
      import {notAThing} from './ext-missing.mjs';
      export const brokenTheme = defineTheme({
        name: 'ext-broken',
        extends: notAThing,
        tokens: {'--color-accent': '#ff0000'},
      });\n`,
    );
    fs.writeFileSync(
      path.join(extDir, 'ext-missing.mjs'),
      `export const somethingElse = 1;\n`,
    );

    await expect(
      themeBuild('ext-broken.mjs', {}, {cwd: extDir}),
    ).rejects.toThrow(/extends/);
  });
});
