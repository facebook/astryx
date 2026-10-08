// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The human report of `astryx theme build` over several themes.
 *
 * A batch prints each theme's [ok] lines, then the install example once and
 * the font guidance once per unloaded family, instead of repeating both for
 * every theme. `--detail compact|brief` prints one line per theme. One theme
 * at the default detail, `--json`, and `--check` keep the reports they had.
 *
 * `astryx theme build` needs a compiled @astryxdesign/core, so this suite
 * builds core once via the shared ensureCoreBuilt() helper.
 */

import {describe, it, expect, beforeAll, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const GOLDEN = path.resolve(
  import.meta.dirname,
  '../../../test/__golden__/theme-build-batch.txt',
);

const NAMES = [
  'amber',
  'basil',
  'cedar',
  'dune',
  'ember',
  'fjord',
  'grove',
  'harbor',
  'iris',
  'juniper',
  'kelp',
  'lagoon',
  'meadow',
  'nimbus',
  'orchid',
];
const BODY_FONTS = [
  '"Space Grotesk", sans-serif',
  '"Space Grotesk", sans-serif',
  'Figtree, sans-serif',
  '"JetBrains Mono", monospace',
  'system-ui, sans-serif',
];
const FILES = NAMES.map(name => `themes/${name}.mjs`);

/** @type {string[]} */
const dirs = [];

/** A fresh project holding the fifteen theme sources. */
function project() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-batch-'));
  fs.mkdirSync(path.join(dir, 'themes'));
  NAMES.forEach((name, i) => {
    /** @type {Record<string, string>} */
    const tokens = {
      '--color-bg': `#${[13, 29, 47].map(n => ((i * n) % 256).toString(16).padStart(2, '0')).join('')}`,
      '--font-family-body': BODY_FONTS[i % BODY_FONTS.length],
    };
    if (i % 3 === 0)
      tokens['--font-family-code'] = '"JetBrains Mono", monospace';
    fs.writeFileSync(
      path.join(dir, 'themes', `${name}.mjs`),
      `export default ${JSON.stringify({name, tokens})};\n`,
    );
  });
  dirs.push(dir);
  return dir;
}

/** @param {string} text @param {string | RegExp} pattern */
function count(text, pattern) {
  return text.split(pattern).length - 1;
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

describe('theme build report for several themes', () => {
  it('prints the install example once and each unloaded font once', async () => {
    const dir = project();
    const batch = await runCli(['theme', 'build', ...FILES], dir);
    expect(batch.status).toBe(0);
    const out = batch.stdout;

    // Every theme still reports its own outputs.
    for (const name of NAMES) {
      expect(out).toContain(`Building theme from themes/${name}.mjs...`);
      expect(out).toContain(`[ok] themes/${name}.css\n`);
      expect(out).toContain(
        `  import { ${name}Theme } from './themes/${name}'; import './themes/${name}.css';`,
      );
    }
    expect(count(out, 'Install in your app')).toBe(1);
    expect(count(out, 'Or with a <link> tag:')).toBe(1);
    expect(count(out, "import { Theme } from '@astryxdesign/core';")).toBe(2);
    expect(count(out, '[note]')).toBe(1);
    expect(count(out, 'note: Font')).toBe(0);
    expect(count(out, 'fonts.googleapis.com/css2')).toBe(1);
    expect(out).toContain(
      '  "Space Grotesk" (amber, basil, fjord, grove, kelp, lagoon)\n' +
        '  "JetBrains Mono" (amber, dune, grove, iris, juniper, meadow, nimbus)\n' +
        '  "Figtree" (cedar, harbor, meadow)\n',
    );
    expect(out).toContain(
      'family=Space+Grotesk&family=JetBrains+Mono&family=Figtree&display=swap',
    );
    expect(out.trimEnd().endsWith('[ok] Built 15 themes.')).toBe(true);

    // The sizes follow Core's CSS, so the golden keeps the shape only.
    await expect(
      out.replace(/\d+(\.\d+)? KB/g, '<size> KB'),
    ).toMatchFileSnapshot(GOLDEN);

    // One invocation per theme prints the full standalone report each time.
    let separate = 0;
    for (const file of FILES) {
      const one = await runCli(['theme', 'build', file], dir);
      expect(one.status).toBe(0);
      expect(one.stdout).toContain('Install in your app');
      separate += Buffer.byteLength(one.stdout);
    }
    expect(Buffer.byteLength(out)).toBeLessThan(separate * 0.3);
  }, 300_000);

  it.each(['compact', 'brief'])(
    '--detail %s prints one line per theme and no install or font blocks',
    async detail => {
      const dir = project();
      const r = await runCli(
        ['--detail', detail, 'theme', 'build', ...FILES],
        dir,
      );
      expect(r.status).toBe(0);
      const lines = r.stdout.split('\n').filter(Boolean);
      expect(lines).toHaveLength(NAMES.length + 1);
      NAMES.forEach((name, i) => {
        expect(lines[i]).toMatch(
          new RegExp(
            `^\\[ok\\] themes/${name}\\.css \\(\\d+(\\.\\d+)? KB, \\d+ token overrides, \\d+ component overrides\\)$`,
          ),
        );
      });
      expect(lines.at(-1)).toBe('[ok] Built 15 themes.');
      expect(r.stdout).not.toContain('Install in your app');
      expect(r.stdout).not.toContain('fonts.googleapis.com');
      expect(fs.existsSync(path.join(dir, 'themes', 'orchid.css'))).toBe(true);
    },
    120_000,
  );

  it('prints one line for one theme at --detail brief', async () => {
    const dir = project();
    const r = await runCli(
      ['--detail', 'brief', 'theme', 'build', 'themes/amber.mjs'],
      dir,
    );
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(
      /^\[ok\] themes\/amber\.css \(\d+(\.\d+)? KB, 3 token overrides, 0 component overrides\)\n$/,
    );
  }, 120_000);

  it('keeps the standalone report for one theme at the default detail', async () => {
    const dir = project();
    const r = await runCli(['theme', 'build', 'themes/amber.mjs'], dir);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('Building theme from themes/amber.mjs...');
    expect(r.stdout).toContain("import { amberTheme } from './themes/amber';");
    expect(r.stdout).toContain('Or with a <link> tag:');
    expect(r.stdout).toContain('note: Font "Space Grotesk"');
    expect(r.stdout).toContain(
      '[note] Theme "amber" names fonts it does not load: "Space Grotesk", "JetBrains Mono"',
    );
    expect(r.stdout).not.toContain('Each built theme imports the same way');
  }, 120_000);

  it('keeps the guidance for themes already written when a batch fails', async () => {
    const dir = project();
    fs.writeFileSync(
      path.join(dir, 'themes', 'broken.mjs'),
      'export default {\n',
    );
    const r = await runCli(
      [
        'theme',
        'build',
        'themes/amber.mjs',
        'themes/basil.mjs',
        'themes/broken.mjs',
      ],
      dir,
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('themes/broken.mjs: ');
    expect(count(r.stdout, 'Install in your app')).toBe(1);
    expect(r.stdout).toContain(
      "  import { basilTheme } from './themes/basil'; import './themes/basil.css';",
    );
    expect(r.stdout).toContain('  "Space Grotesk" (amber, basil)\n');
    expect(r.stdout).not.toContain('Built 3 themes');
  }, 120_000);

  it('names the file on each warning in a compact report', async () => {
    const dir = project();
    fs.writeFileSync(
      path.join(dir, 'themes', 'warny.mjs'),
      `export default ${JSON.stringify({
        name: 'warny',
        tokens: {'--color-bg': '#123456'},
        components: {notAComponent: {base: {color: 'red'}}},
      })};\n`,
    );
    const compact = await runCli(
      [
        '--detail',
        'compact',
        'theme',
        'build',
        'themes/amber.mjs',
        'themes/warny.mjs',
      ],
      dir,
    );
    expect(compact.status).toBe(0);
    expect(compact.stderr).toMatch(
      /\[warn\] themes\/warny\.mjs: Unknown component "notAComponent"/,
    );

    const full = await runCli(['theme', 'build', 'themes/warny.mjs'], dir);
    expect(full.stderr).toContain('  [warn] Unknown component "notAComponent"');
  }, 120_000);

  it('keeps --json and --check the same at every detail level', async () => {
    const dir = project();
    const full = await runCli(['--json', 'theme', 'build', ...FILES], dir);
    const compact = await runCli(
      ['--json', '--detail', 'compact', 'theme', 'build', ...FILES],
      dir,
    );
    expect(compact.status).toBe(0);
    expect(JSON.parse(compact.stdout)).toEqual(JSON.parse(full.stdout));
    expect(
      JSON.parse(full.stdout).data.results[0].receipt.data.notices,
    ).toEqual([
      'Font "Space Grotesk" is named by this theme but not loaded; add a <link> or @font-face in your app (recipe: astryx docs typography)',
      'Font "JetBrains Mono" is named by this theme but not loaded; add a <link> or @font-face in your app (recipe: astryx docs typography)',
    ]);

    const check = await runCli(['theme', 'build', '--check', ...FILES], dir);
    const briefCheck = await runCli(
      ['--detail', 'brief', 'theme', 'build', '--check', ...FILES],
      dir,
    );
    expect(check.status).toBe(0);
    expect(briefCheck.stdout).toBe(check.stdout);
  }, 180_000);
});
