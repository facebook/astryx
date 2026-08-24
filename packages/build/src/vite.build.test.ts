// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runs a REAL Vite production build of a fixture app and asserts on the
 * stylesheet it emits.
 *
 * The unit tests in vite.test.ts check the plugin's wiring, and they passed
 * while the build shipped a version that wrapped every StyleX rule — Astryx's
 * and the app's alike — in the library layer. That inverts the bug rather than
 * fixing it: product styles are supposed to outrank a theme, and wrapped in
 * `astryx-base` they lose to one. Only the built artifact shows it, so this
 * builds one.
 *
 * The fixture is the case the split exists for: it renders an Astryx component
 * AND authors its own StyleX in the same tree.
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
const FIXTURE = path.join(__dirname, '../__fixtures__/layer-split');
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

/** The class prefixes @astryxdesign/build/babel assigns per origin. */
const LIBRARY_CLASS = /\.astryx[a-z0-9]{5,}/g;
const PRODUCT_CLASS = /\.x[a-z0-9]{5,}/g;

let css: string;
let html: string;
let outDir: string;

beforeAll(async () => {
  outDir = mkdtempSync(path.join(tmpdir(), 'astryx-layer-split-'));
  await build({
    root: FIXTURE,
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
  const cssFile = readdirSync(assets).find(f => f.endsWith('.css'));
  if (!cssFile) throw new Error(`no stylesheet emitted into ${assets}`);
  css = readFileSync(path.join(assets, cssFile), 'utf-8');
  html = readFileSync(path.join(outDir, 'index.html'), 'utf-8');
}, 180_000);

afterAll(() => {
  if (outDir) rmSync(outDir, {recursive: true, force: true});
});

/** The slice of the stylesheet inside a given top-level layer block. */
function layerBlock(name: string): string {
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

describe('a production build separates Astryx and product styles by layer', () => {
  it('declares the layer order the split depends on', () => {
    expect(html).toContain('@layer reset, astryx-base, astryx-theme, product;');
  });

  it("puts Astryx's own rules in the library layer", () => {
    const library = layerBlock('astryx-base');
    expect(library.match(LIBRARY_CLASS)?.length ?? 0).toBeGreaterThan(50);
    // The fixture's Button pulls in real component CSS, so a token it styles
    // with is a fact about this block rather than about class-name shape.
    expect(library).toContain('--radius-element');
  });

  // The regression this file exists for. The wrapped-not-split version put the
  // app's own StyleX in astryx-base, below `astryx-theme`, so a theme could
  // silently restyle code the theme has no business reaching.
  it("puts the app's own rules in the product layer, not the library one", () => {
    const product = layerBlock('product');
    const library = layerBlock('astryx-base');

    expect(product).toContain('11px');
    expect(library).not.toContain('11px');

    expect(product.match(LIBRARY_CLASS)).toBeNull();
    expect(library.match(PRODUCT_CLASS)).toBeNull();
  });

  it('leaves no StyleX rule outside the two layers', () => {
    const outside = css
      .replace(layerBlock('astryx-base'), '')
      .replace(layerBlock('product'), '');
    expect(outside).not.toContain('@layer priority');
  });

  // StyleX runs its CSS through lightningcss before emitting it. Replacing that
  // output means running the same pass, or the build quietly loses the prefixes
  // the original had.
  it('keeps the vendor prefixing StyleX applies', () => {
    expect(css).toContain('-webkit-');
  });
});
