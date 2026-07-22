// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for theme component-override selectors (#4109).
 *
 * `astryx theme build` derives component-override selectors verbatim from the
 * theme's `components` keys (`.astryx-<key>`), and validates those keys
 * against KNOWN_COMPONENTS. Before #4109 the table listed several multi-word
 * components un-hyphenated (`textinput`, `tablist`, `topnav`, ...) while the
 * components render hyphenated class tokens (`astryx-text-input`,
 * `astryx-tab-list`, `astryx-top-nav`, ...). The result was doubly wrong:
 *
 *   1. The broken key validated cleanly and emitted a dead rule that matched
 *      nothing in the DOM (silent failure).
 *   2. The CORRECT key tripped the "Unknown component" warning — which then
 *      suggested the broken spelling.
 *
 * This suite pins the fix from both ends:
 *   - end-to-end: a `text-input` override builds warning-free and emits
 *     `.astryx-text-input`; the legacy `textinput` key now warns loudly.
 *   - systematically: every KNOWN_COMPONENTS key must equal a stable class
 *     token that core actually renders, derived by scanning core's source for
 *     `themeProps(...)` / `buildClassName(...)` / `stableClassName(...)`
 *     literals — so the table can never drift from the DOM again.
 *
 * Building requires a compiled @astryxdesign/core, so this suite builds core
 * once in beforeAll (mirrors build-theme.variants.test.mjs).
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {KNOWN_COMPONENTS} from './build-theme.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');
const CORE_SRC = path.resolve(__dirname, '../../../core/src');

// spawnSync (not execFileSync) so stderr is captured on success too — the
// validator's warnings go through console.warn, which writes to stderr.
function runCli(args, cwd) {
  const result = spawnSync('node', [CLI_BIN, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {...process.env, FORCE_COLOR: '0'},
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function writeTheme(dir, contents) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, 'selectors-theme.mjs');
  fs.writeFileSync(file, contents);
  return file;
}

/**
 * Collect every stable class token core actually renders, by scanning
 * component source for the literal passed to themeProps() / buildClassName()
 * / stableClassName(). This is the same contract KNOWN_COMPONENTS keys must
 * satisfy: theme CSS targets `.astryx-<key>`, components render
 * `astryx-<token>` through exactly these three call sites
 * (packages/core/src/utils/themeProps.ts, packages/core/src/naming.ts).
 *
 * Test and doc files are excluded so a stray literal there can't mask a
 * table/DOM mismatch.
 */
function collectRenderedClassTokens(dir, tokens = new Set()) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectRenderedClassTokens(full, tokens);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.test\.(ts|tsx)$/.test(entry.name)) continue;
    const source = fs.readFileSync(full, 'utf-8');
    const re =
      /(?:themeProps|buildClassName|stableClassName)\(\s*'([a-z][a-z0-9-]*)'/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      tokens.add(match[1]);
    }
  }
  return tokens;
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-build-theme-selectors-'),
  );
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build component-override selectors (#4109)', () => {
  it('emits .astryx-text-input for the text-input key, warning-free', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'selectors-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          'text-input': { base: { borderRadius: '16px' } },
          'tab-list': { base: { gap: '4px' } },
          'top-nav': { base: { paddingInline: '24px' } },
          'date-input': { base: { borderRadius: '8px' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    // The keys match the rendered class names, so no typo warning fires.
    expect(result.stdout + result.stderr).not.toContain('Unknown component');

    const css = fs.readFileSync(path.join(tmpDir, 'selectors-theme.css'), 'utf-8');
    // The selector the component actually renders (#4109 repro)…
    expect(css).toContain('.astryx-text-input {');
    expect(css).toContain('border-radius: 16px;');
    expect(css).toContain('.astryx-tab-list {');
    expect(css).toContain('.astryx-top-nav {');
    expect(css).toContain('.astryx-date-input {');
    // …and never the dead un-hyphenated form.
    expect(css).not.toContain('.astryx-textinput');
    expect(css).not.toContain('.astryx-tablist');
    expect(css).not.toContain('.astryx-topnav');
    expect(css).not.toContain('.astryx-dateinput');
  });

  it('warns loudly on the legacy dead key and suggests the rendered name', () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'selectors-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          textinput: { base: { borderRadius: '16px' } },
        },
      };\n`,
    );

    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    // Warning, not error — the build still completes (existing validator
    // behavior for unknown components), but the mismatch is no longer silent.
    expect(result.code).toBe(0);
    expect(result.stdout + result.stderr).toContain(
      'Unknown component "textinput"',
    );
    expect(result.stdout + result.stderr).toContain('text-input');
  });

  it('every KNOWN_COMPONENTS key is a class token core actually renders', () => {
    expect(fs.existsSync(CORE_SRC)).toBe(true);
    const rendered = collectRenderedClassTokens(CORE_SRC);
    // Sanity: the scan found the single- and multi-word shapes it depends on.
    expect(rendered.has('button')).toBe(true);
    expect(rendered.has('text-input')).toBe(true);

    const deadKeys = Object.keys(KNOWN_COMPONENTS).filter(
      key => !rendered.has(key),
    );
    // A key here validates theme overrides whose emitted `.astryx-<key>`
    // selector matches no rendered element — the #4109 bug class.
    expect(deadKeys).toEqual([]);
  });
});
