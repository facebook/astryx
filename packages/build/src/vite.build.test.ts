// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.build.test.ts
 * @description End-to-end check that a *production* Vite build emits Astryx
 *   library atoms and product atoms into separate CSS layers. The dev server
 *   splits them via a middleware; builds must reach the same result, or the
 *   installed theme (in `astryx-theme`) loses to library base styles.
 */

import {describe, it, expect, afterAll} from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import postcss from 'postcss';
import {astryxStylex} from './vite';

/** Collect the CSS text of a named top-level layer. */
function layerContent(css: string, layer: string): string {
  const parts: string[] = [];
  postcss.parse(css).each(node => {
    if (
      node.type === 'atrule' &&
      node.name === 'layer' &&
      node.params === layer
    ) {
      parts.push(node.toString());
    }
  });
  return parts.join('\n');
}

/** Names of the top-level layers, in source order. */
function topLevelLayers(css: string): string[] {
  const names: string[] = [];
  postcss.parse(css).each(node => {
    if (node.type === 'atrule' && node.name === 'layer' && node.nodes != null) {
      names.push(node.params);
    }
  });
  return names;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, {recursive: true, force: true});
});

/**
 * Build a fixture app with one library file and one product file, and return
 * the emitted CSS. The fixture lives under packages/build so that Node
 * resolves @stylexjs/* from the workspace root.
 */
async function buildFixture(): Promise<string> {
  const root = mkdtempSync(path.join(__dirname, '.vite-build-'));
  tmpRoots.push(root);

  // `packages/core/` matches the default library patterns of both the babel
  // prefixer and the layer splitter.
  mkdirSync(path.join(root, 'packages/core'), {recursive: true});
  mkdirSync(path.join(root, 'src'), {recursive: true});

  writeFileSync(
    path.join(root, 'packages/core/lib.ts'),
    `import * as stylex from '@stylexjs/stylex';
export const libStyles = stylex.create({
  base: {backgroundColor: 'var(--color-warning)'},
});
`,
  );

  // StyleX appends its output to an existing CSS asset, so the fixture needs
  // one for the build to emit any CSS at all.
  writeFileSync(
    path.join(root, 'src/styles.css'),
    `@layer reset {\n  body {\n    margin: 0;\n  }\n}\n`,
  );

  writeFileSync(
    path.join(root, 'src/main.ts'),
    `import './styles.css';
import * as stylex from '@stylexjs/stylex';
import {libStyles} from '../packages/core/lib';
const productStyles = stylex.create({
  base: {color: 'rebeccapurple'},
});
document.body.className = stylex.props(libStyles.base, productStyles.base).className ?? '';
`,
  );

  writeFileSync(
    path.join(root, 'index.html'),
    `<!doctype html><html><body><script type="module" src="/src/main.ts"></script></body></html>`,
  );

  // StyleX appends its CSS to the file on disk, so the build must write.
  const outDir = path.join(root, 'dist');
  await build({
    root,
    logLevel: 'silent',
    configFile: false,
    plugins: [
      ...astryxStylex({rootDir: root, libraryPattern: 'packages/core/'}),
    ],
    build: {outDir, cssCodeSplit: false},
  });

  const assets = path.join(outDir, 'assets');
  return readdirSync(assets)
    .filter(file => file.endsWith('.css'))
    .map(file => readFileSync(path.join(assets, file), 'utf8'))
    .join('\n');
}

describe('astryxStylex production build', () => {
  it('emits library atoms in the library layer and product atoms in the product layer', async () => {
    const css = await buildFixture();

    // Sanity: the prefix routing itself works.
    expect(css, 'library atom should be prefixed').toMatch(/\.astryx[0-9a-z]+/);
    expect(css, 'product atom should exist').toMatch(/[^a-z]\.x[0-9a-z]+/);

    // No stylex priority layer may sit at the top level: anything outside the
    // named layers outranks the theme.
    expect(topLevelLayers(css)).toEqual(['reset', 'astryx-base', 'product']);

    expect(layerContent(css, 'astryx-base')).toContain('var(--color-warning)');
    expect(layerContent(css, 'astryx-base')).not.toContain('rebeccapurple');
    expect(layerContent(css, 'product')).toContain('#639');
    expect(layerContent(css, 'product')).not.toMatch(/\.astryx[0-9a-z]+/);
  }, 120_000);
});
