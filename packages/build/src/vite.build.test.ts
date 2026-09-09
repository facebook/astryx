// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runs REAL Vite production builds of fixture apps and asserts on the
 * stylesheets they emit.
 *
 * The unit tests in vite.test.ts check the plugin's wiring, and they passed
 * while the build shipped a version that wrapped every StyleX rule — Astryx's
 * and the app's alike — in the library layer. That inverts the bug rather than
 * fixing it: product styles are supposed to outrank a theme, and wrapped in
 * `astryx-base` they lose to one. Only the built artifact shows it, so this
 * builds one.
 *
 * Two shapes, because StyleX emits through two different paths:
 *
 *   `layer-split`        the app imports a stylesheet, so the bundle has a CSS
 *                        asset and StyleX appends to it in `generateBundle`
 *   `layer-split-nocss`  the app imports none, so StyleX writes its own file in
 *                        `writeBundle`, outside Rollup's graph
 *
 * The second is the one that was missing, and it hid two defects: the split did
 * not run there at all, and the file StyleX writes is not linked by any page.
 *
 * What none of this can prove is which declaration actually paints — that is a
 * cascade fact, and it lives in .github/scripts/theme-layer-cascade.js.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {astryxStylex} from './vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const FIXTURES = path.resolve(__dirname, '../__fixtures__');
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

/** The class prefixes @astryxdesign/build/babel assigns per origin. */
const LIBRARY_CLASS = /\.astryx[a-z0-9]{5,}/g;
const PRODUCT_CLASS = /\.x[a-z0-9]{5,}/g;

type Built = {css: string; cssName: string; html: string; outDir: string};

async function buildFixture(name: string): Promise<Built> {
  const root = path.join(FIXTURES, name);
  const outDir = mkdtempSync(path.join(tmpdir(), `astryx-${name}-`));
  await build({
    root,
    logLevel: 'error',
    build: {outDir, emptyOutDir: true},
    resolve: {alias: {'@astryxdesign/core': CORE_SRC}},
    plugins: [
      react(),
      ...astryxStylex({
        stylexOptions: {
          dev: false,
          unstable_moduleResolution: {type: 'commonJS', rootDir: REPO_ROOT},
          aliases: {
            '@astryxdesign/core/*': [path.join(CORE_SRC, '*')],
            '@astryxdesign/core': [CORE_SRC],
          },
        },
        libraryPattern: 'packages/core/',
      }),
    ],
  });

  const assets = path.join(outDir, 'assets');
  const cssName = readdirSync(assets).find(f => f.endsWith('.css'));
  if (!cssName) throw new Error(`no stylesheet emitted into ${assets}`);
  return {
    css: readFileSync(path.join(assets, cssName), 'utf-8'),
    cssName,
    html: readFileSync(path.join(outDir, 'index.html'), 'utf-8'),
    outDir,
  };
}

/** The slice of a stylesheet inside a given top-level layer block. */
function layerBlock(css: string, name: string): string {
  const start = css.indexOf(`@layer ${name} {`);
  expect(
    start,
    `@layer ${name} is not in the emitted stylesheet`,
  ).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`@layer ${name} is unterminated`);
}

/** Both shapes must satisfy the same contract, so both run the same checks. */
function itSplitsCorrectly(get: () => Built) {
  it('declares the layer order the split depends on', () => {
    expect(get().html).toContain(
      '@layer reset, astryx-base, astryx-theme, product;',
    );
  });

  it("puts Astryx's own rules in the library layer", () => {
    const library = layerBlock(get().css, 'astryx-base');
    expect(library.match(LIBRARY_CLASS)?.length ?? 0).toBeGreaterThan(50);
    // The fixture's Button pulls in real component CSS, so a token it styles
    // with is a fact about this block rather than about class-name shape.
    expect(library).toContain('--radius-element');
  });

  // The regression this file exists for. The wrapped-not-split version put the
  // app's own StyleX in astryx-base, below `astryx-theme`, so a theme could
  // silently restyle code the theme has no business reaching.
  it("puts the app's own rules in the product layer, not the library one", () => {
    const {css} = get();
    const product = layerBlock(css, 'product');
    const library = layerBlock(css, 'astryx-base');

    expect(product).toContain('11px');
    expect(library).not.toContain('11px');

    expect(product.match(LIBRARY_CLASS)).toBeNull();
    expect(library.match(PRODUCT_CLASS)).toBeNull();
  });

  it('leaves no StyleX rule outside the two layers', () => {
    const {css} = get();
    const outside = css
      .replace(layerBlock(css, 'astryx-base'), '')
      .replace(layerBlock(css, 'product'), '');
    expect(outside).not.toContain('@layer priority');
  });

  // StyleX runs its CSS through lightningcss before emitting it. Replacing that
  // output means running the same pass, or the build quietly loses the prefixes
  // the original had.
  it('keeps the vendor prefixing StyleX applies', () => {
    expect(get().css).toContain('-webkit-');
  });

  it('links the stylesheet from the page', () => {
    const {html, cssName} = get();
    expect(html).toContain(cssName);
    expect(html.split(cssName).length - 1, 'linked more than once').toBe(1);
  });
}

describe('a production build separates Astryx and product styles by layer', () => {
  describe('when the app imports a stylesheet of its own', () => {
    let built: Built;
    beforeAll(async () => {
      built = await buildFixture('layer-split');
    }, 180_000);
    afterAll(
      () => built && rmSync(built.outDir, {recursive: true, force: true}),
    );

    itSplitsCorrectly(() => built);
  });

  // StyleX has no bundle asset to append to here, so it writes its own file in
  // `writeBundle` — outside Rollup's graph, which is why Vite emits no `<link>`
  // for it. Every assertion below failed before this case was handled: the
  // stylesheet was unsplit AND the page loaded no styles at all.
  describe('when the app imports no stylesheet at all', () => {
    let built: Built;
    beforeAll(async () => {
      built = await buildFixture('layer-split-nocss');
    }, 180_000);
    afterAll(
      () => built && rmSync(built.outDir, {recursive: true, force: true}),
    );

    itSplitsCorrectly(() => built);
  });
});
