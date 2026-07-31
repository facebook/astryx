// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for issues #4109 and #4110: theme-build
 * component-override keys must match the class names components actually
 * render — in BOTH directions.
 *
 * `astryx theme build` emits a component override as a `.astryx-<key>` rule,
 * where `<key>` is the theme's `components` key passed through verbatim
 * (generateThemeRules re-adds the `astryx-` prefix). The CLI's KNOWN_COMPONENTS
 * registry is what the validator accepts and what its "Did you mean?" hints
 * point authors toward — so every registry key MUST correspond to a class a
 * component really renders, or the emitted rule is a dead selector that
 * silently does nothing.
 *
 * #4109 (forward direction): the registry had de-hyphenated keys for every
 * multi-word component (`textinput`, `dateinput`, `numberinput`, `timeinput`,
 * `appshell`, `aspectratio`, `checkboxinput`, `dropdownmenu`, `formlayout`,
 * `mobilenav`, `moremenu`, `radiolist`, `sidenav`, `tablist`, `topnav`), while
 * the components render the hyphenated class (`astryx-text-input`, etc.).
 * Authors following the registry shipped dead `.astryx-textinput` rules.
 *
 * #4110 (reverse direction): the registry lagged core — it held ~53 keys while
 * the docs declared ~195 theming targets, so overrides of real, rendered
 * classes (`top-nav-heading`, `progressbar-track`, `field-status`, whole
 * components like `hovercard`, `toolbar`, `tree-list`, …) drew a false
 * "Unknown component" warning with did-you-mean steering AWAY from correct
 * keys, and stale visualProps drew false "Unknown prop" warnings. The repo's
 * own shipped themes (butter, stone) tripped both. The registry must cover
 * every documented target, with each key's visualProps mirroring the doc
 * target entry verbatim.
 *
 * Source of truth = the class the component renders, captured in
 * `theming.targets[].className` of the `*.doc.mjs` files (itself guarded
 * against the real `themeProps()`/`stableClassName()` call sites by
 * packages/core/src/theme/themingTargets.test.ts).
 */

import {describe, it, expect, beforeAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_SRC = path.resolve(HERE, '../../../core/src');
const BUILD_THEME_SRC = path.resolve(HERE, '../../api/theme/build/build.mjs');

/**
 * Extract the KNOWN_COMPONENTS registry from the build-theme source as a
 * `Map<key, visualProps[]>`. Reading the source (rather than importing the
 * un-exported constant) keeps this test decoupled from the module's private
 * surface. Registry entries are single-line `key: ['prop', …],` pairs, so a
 * line-anchored regex captures both the key and its props array.
 */
function knownComponentEntries() {
  const src = fs.readFileSync(BUILD_THEME_SRC, 'utf8');
  const start = src.indexOf('const KNOWN_COMPONENTS = {');
  expect(start).toBeGreaterThan(-1);
  const end = src.indexOf('};', start);
  const block = src.slice(start, end);
  const entries = new Map();
  const re = /^\s*'?([a-z][a-z0-9-]*)'?\s*:\s*\[([^\]]*)\]/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    const props = [...m[2].matchAll(/'([^']+)'/g)].map(p => p[1]);
    entries.set(m[1], props);
  }
  return entries;
}

/** The KNOWN_COMPONENTS registry keys (see knownComponentEntries). */
function knownComponentKeys() {
  return new Set(knownComponentEntries().keys());
}

/**
 * Every `*.doc.mjs` file under core src, recursively. Theming targets live in
 * the per-component doc AND in sub-component docs (`TopNav/TopNavHeading.doc.mjs`,
 * `Avatar/AvatarStatusDot.doc.mjs`, …), so a scan that only reads
 * `<Dir>/<Dir>.doc.mjs` misses most of the documented surface.
 */
function allDocFiles() {
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.doc.mjs')) {
        files.push(full);
      }
    }
  };
  walk(CORE_SRC);
  return files;
}

/**
 * The set of real override keys: every `theming.targets[].className` across
 * ALL component docs (including sub-component docs), with the `astryx-` prefix
 * stripped. This is the canonical source of truth for what selectors the theme
 * build should emit.
 */
function realOverrideKeys() {
  const keys = new Set();
  for (const docFile of allDocFiles()) {
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
 * The documented theming targets as `Map<key, visualProps[]>` — every
 * `theming.targets[]` entry across ALL `*.doc.mjs` files, keyed by className
 * with the `astryx-` prefix stripped, with the entry's `visualProps` VERBATIM
 * (`[]` when omitted). Imports the doc modules' `docs` export — exactly what
 * the CLI itself resolves (loadKnownValues) — rather than regex-scanning, so
 * the arrays compared against the registry are the real values.
 */
let _docTargetsPromise;
function docThemingTargets() {
  _docTargetsPromise ??= (async () => {
    const targets = new Map();
    for (const docFile of allDocFiles()) {
      const mod = await import(pathToFileURL(docFile).href);
      for (const target of mod.docs?.theming?.targets ?? []) {
        if (!target.className) continue;
        const key = target.className.replace(/^astryx-/, '');
        targets.set(key, target.visualProps ?? []);
      }
    }
    return targets;
  })();
  return _docTargetsPromise;
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

  it('every documented theming target has a registry entry (#4110, reverse direction)', async () => {
    // The forward checks above stop the registry from inventing keys; this
    // stops it from LAGGING core. A documented, rendered target missing from
    // the registry makes the validator emit a false "Unknown component"
    // warning (with did-you-mean steering away from the correct key) and
    // skips prop validation for it — the drift class of #4110.
    const known = knownComponentKeys();
    const targets = await docThemingTargets();

    const missing = [...targets.keys()].filter(k => !known.has(k)).sort();
    expect(missing).toEqual([]);
  });

  it('registry visualProps mirror the doc target visualProps verbatim (#4110)', async () => {
    // The registry's per-key prop list is what "Unknown prop" warnings are
    // judged against. A list that drifts from the doc target's visualProps
    // turns legitimate overrides into false warnings (e.g. the stale
    // `selector: ['type', 'size', 'color']` flagged the shipped themes'
    // `status:*` overrides). Compare VERBATIM — same names, same order — so
    // any drift on either side surfaces here.
    const known = knownComponentEntries();
    const targets = await docThemingTargets();

    const mismatched = [...targets.entries()]
      .filter(([key, visualProps]) => {
        if (!known.has(key)) return false; // covered by the reverse check
        return JSON.stringify(known.get(key)) !== JSON.stringify(visualProps);
      })
      .map(([key, visualProps]) => ({
        key,
        registry: known.get(key),
        doc: visualProps,
      }));
    expect(mismatched).toEqual([]);
  });
});

describe('shipped themes validate clean against the registry (#4110)', () => {
  // The repo's own themes are real-world fixtures for the registry: they
  // override documented, rendered targets (`top-nav-heading`,
  // `progressbar-track`, `field-status`, …) and prop values the docs declare
  // (`status:*` on inputs, bare `selected` state on `top-nav-item`). A
  // registry that covers the documented surface must build them without a
  // single "Unknown component" / "Unknown prop" warning.
  let tmpDir;
  let themeBuild;
  beforeAll(async () => {
    ensureCoreBuilt();
    // Import AFTER core is guaranteed built: build.mjs captures core's
    // generator in a top-level await at first import.
    ({themeBuild} = await import('../../api/theme/build/build.mjs'));
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-4110-'));
  }, 200_000);

  it.each([
    ['butter', '../../../themes/butter/src/butterTheme.ts'],
    ['stone', '../../../themes/stone/src/stoneTheme.ts'],
  ])('the %s theme builds with zero validation warnings', async (name, rel) => {
    const themeFile = path.resolve(HERE, rel);
    const result = await themeBuild(
      themeFile,
      {out: path.join(tmpDir, `${name}.css`)},
      {cwd: tmpDir},
    );

    expect(result?.type).toBe('theme.build');
    expect(result?.data.warnings).toEqual([]);
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
