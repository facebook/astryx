// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const cssPath = path.join(packageRoot, 'dist/astryx-vanilla.css');
const componentNames = [
  'Badge',
  'Button',
  'Card',
  'Divider',
  'Heading',
  'Layout',
  'Link',
  'Stack',
  'Text',
  'TextInput',
];

test('committed dist is generated from core token defaults and source files', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs', '--check'], {
    cwd: packageRoot,
    stdio: 'pipe',
  });
  const css = await readFile(cssPath, 'utf8');
  assert.match(css, /--color-accent: light-dark\(#0064E0, #2694FE\);/);
  assert.match(css, /--radius-element: 8px;/);
  assert.match(css, /--text-body-size: var\(--font-size-base\);/);
  assert.doesNotMatch(css, /@layer astryx-tokens/);
  assert.ok(css.indexOf('--color-accent') < css.indexOf('/* Badge */'));
});

test('component CSS is discovered and concatenated in stable order', async () => {
  const files = await readdir(path.join(packageRoot, 'src/components'));
  assert.deepEqual(
    files.toSorted(),
    componentNames.map(name => `${name}.css`),
  );

  const css = await readFile(cssPath, 'utf8');
  let previousIndex = -1;
  for (const name of componentNames) {
    const index = css.indexOf(`/* ${name} */`);
    assert.ok(index > previousIndex, `${name}.css is missing or out of order`);
    previousIndex = index;
  }
  assert.ok(css.includes('.ax-button--primary'));
  assert.ok(css.includes('.ax-stack--gap-2'));
  assert.ok(!css.includes('.astryx-button'));
});

test('markup follows the shared docs and variant contract', async () => {
  const files = await readdir(path.join(packageRoot, 'markup'));
  assert.deepEqual(
    files.toSorted(),
    componentNames.map(name => `${name}.html`),
  );

  for (const file of files) {
    const markup = await readFile(
      path.join(packageRoot, 'markup', file),
      'utf8',
    );
    assert.match(markup, /^<!-- docs: [^\n]+ -->/);
    assert.match(markup, /\n<!-- variant: [^\n]+ -->\n/);
  }
});

test('the build emits classic and ESM theme helpers', async () => {
  const [classic, esm] = await Promise.all([
    readFile(path.join(packageRoot, 'dist/astryx-vanilla.js'), 'utf8'),
    readFile(path.join(packageRoot, 'dist/astryx-vanilla.mjs'), 'utf8'),
  ]);
  assert.match(classic, /globalThis\.AstryxVanilla/);
  assert.doesNotMatch(classic, /\bexport\s+\{/);
  assert.match(esm, /export \{initThemeModeSwitchers, setMode, setTheme\};/);
  for (const source of [classic, esm]) {
    assert.match(source, /data-ax-theme-switch/);
    assert.match(source, /data-ax-mode-switch/);
  }
});
