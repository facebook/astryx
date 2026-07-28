// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for issue #4109: theme-build component-override keys
 * must match the class names components actually render.
 *
 * `astryx theme build` emits a component override as a `.astryx-<key>` rule,
 * where `<key>` is the theme's `components` key passed through verbatim
 * (generateThemeRules re-adds the `astryx-` prefix). The CLI's KNOWN_COMPONENTS
 * registry is what the validator accepts and what its "Did you mean?" hints
 * point authors toward — so every registry key MUST correspond to a class a
 * component really renders, or the emitted rule is a dead selector that
 * silently does nothing.
 *
 * The registry had de-hyphenated keys for every multi-word component
 * (`textinput`, `dateinput`, `numberinput`, `timeinput`, `appshell`,
 * `aspectratio`, `checkboxinput`, `dropdownmenu`, `formlayout`, `mobilenav`,
 * `moremenu`, `radiolist`, `sidenav`, `tablist`, `topnav`), while the
 * components render the hyphenated class (`astryx-text-input`, etc.). Authors
 * following the registry shipped dead `.astryx-textinput` rules.
 *
 * Source of truth = the class the component renders, captured in each
 * component's `{Name}.doc.mjs` `theming.targets[].className` (itself guarded
 * against the real `themeProps()`/`stableClassName()` call sites by
 * packages/core/src/theme/themingTargets.test.ts).
 */

import {describe, it, expect, beforeAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_SRC = path.resolve(HERE, '../../../core/src');
const BUILD_THEME_SRC = path.resolve(HERE, '../../api/theme/build/build.mjs');

/**
 * Extract the KNOWN_COMPONENTS registry keys from the build-theme source.
 * Reading the source (rather than importing the un-exported constant) keeps
 * this test decoupled from the module's private surface.
 */
function knownComponentKeys() {
  const src = fs.readFileSync(BUILD_THEME_SRC, 'utf8');
  const start = src.indexOf('const KNOWN_COMPONENTS = {');
  expect(start).toBeGreaterThan(-1);
  const end = src.indexOf('};', start);
  const block = src.slice(start, end);
  const keys = new Set();
  const re = /^\s*'?([a-z][a-z0-9-]*)'?\s*:/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

/**
 * The set of real override keys: every `theming.targets[].className` across the
 * component docs, with the `astryx-` prefix stripped. This is the canonical
 * source of truth for what selectors the theme build should emit.
 */
function realOverrideKeys() {
  const keys = new Set();
  for (const dir of fs.readdirSync(CORE_SRC, {withFileTypes: true})) {
    if (!dir.isDirectory()) continue;
    const docFile = path.join(CORE_SRC, dir.name, `${dir.name}.doc.mjs`);
    if (!fs.existsSync(docFile)) continue;
    const text = fs.readFileSync(docFile, 'utf8');
    const themingIdx = text.indexOf('theming');
    if (themingIdx === -1) continue;
    const scoped = text.slice(themingIdx);
    const re = /className:\s*'astryx-([a-z0-9-]+)'/g;
    let m;
    while ((m = re.exec(scoped)) !== null) {
      keys.add(m[1]);
    }
  }
  return keys;
}

/**
 * The stable classes components ACTUALLY render: the literal first argument of
 * every `themeProps('<class>', …)` and `stableClassName('<class>')` call across
 * the core `.tsx` source (excluding tests). This is the truest source of truth
 * — the doc `theming.targets` are hand-authored metadata that can drift from
 * it, so both the registry and the targets are validated against these
 * literals. Every call site uses a plain string literal (no dynamic/
 * interpolated names), so this is fully static.
 */
function renderedClassLiterals() {
  const classes = new Set();
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) {
        const text = fs.readFileSync(full, 'utf8');
        for (const re of [
          /themeProps\(\s*'([^']+)'/g,
          /stableClassName\(\s*'([^']+)'/g,
        ]) {
          let m;
          while ((m = re.exec(text)) !== null) {
            classes.add(m[1]);
          }
        }
      }
    }
  };
  walk(CORE_SRC);
  return classes;
}

describe('theme-build KNOWN_COMPONENTS registry (#4109)', () => {
  // `layer` is a layout/anchor concept with no rendered `astryx-layer`
  // class or doc target; it predates and is unrelated to #4109.
  const allowedWithoutTarget = new Set(['layer']);

  it('every registry key is a class documented as a theming target', () => {
    const known = knownComponentKeys();
    const real = realOverrideKeys();

    const dead = [...known].filter(
      k => !real.has(k) && !allowedWithoutTarget.has(k),
    );
    expect(dead).toEqual([]);
  });

  it('every registry key is a class a component actually renders (themeProps literal)', () => {
    // Validate the registry against the TRUE source of truth — the literal
    // passed to themeProps()/stableClassName() in the component source — not
    // just the hand-authored doc targets. This catches a de-hyphenated key
    // even if the docs were (wrongly) kept in agreement with it.
    const known = knownComponentKeys();
    const rendered = renderedClassLiterals();

    const dead = [...known].filter(
      k => !rendered.has(k) && !allowedWithoutTarget.has(k),
    );
    expect(dead).toEqual([]);
  });

  it('every documented theming target is backed by a real themeProps literal', () => {
    // Guards the two "sources of truth" against drift: a component whose
    // themeProps() arg and doc target className disagree would be a latent bug
    // that the registry checks above could not catch (they'd validate against
    // whichever side happened to match). `theming.targets[].className` is
    // hand-authored; themeProps()/stableClassName() literals are what actually
    // renders — they must agree.
    const targets = realOverrideKeys();
    const rendered = renderedClassLiterals();

    const orphanTargets = [...targets].filter(k => !rendered.has(k));
    expect(orphanTargets).toEqual([]);
  });
});

describe('theme build emits a live TextInput selector (#4109)', () => {
  let tmpDir;
  beforeAll(() => {
    ensureCoreBuilt();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-4109-'));
  }, 200_000);

  it('emits .astryx-text-input (the rendered class), not the dead .astryx-textinput', async () => {
    const themeFile = path.join(tmpDir, 'theme.mjs');
    const outFile = path.join(tmpDir, 'theme.css');
    fs.writeFileSync(
      themeFile,
      `export default {\n` +
        `  name: 'input-4109',\n` +
        `  tokens: {},\n` +
        `  components: { 'text-input': { base: { borderRadius: '16px' } } },\n` +
        `};\n`,
    );

    await runCli(['theme', 'build', themeFile, '-o', outFile]);
    const css = fs.readFileSync(outFile, 'utf8');

    expect(css).toContain('.astryx-text-input');
    expect(css).not.toContain('.astryx-textinput');
  });
});
