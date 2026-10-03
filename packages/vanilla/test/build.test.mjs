// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {
  ASTRYX_VANILLA_CDN_PLACEHOLDER,
  ASTRYX_VANILLA_CDN_REF,
  astryxVanillaCdnBase,
} from '../../cli/api/template/html/html.mjs';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const cssPath = path.join(packageRoot, 'dist/astryx-vanilla.css');
const componentsDir = path.join(packageRoot, 'src/components');
const markupDir = path.join(packageRoot, 'markup');
const templatesDir = path.join(packageRoot, 'templates');
const pinnedDemoDir = path.join(packageRoot, 'demo/pinned');

async function listStems(directory, extension) {
  const entries = await readdir(directory, {withFileTypes: true});
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith(extension))
    .map(entry => path.basename(entry.name, extension))
    .sort((a, b) => a.localeCompare(b));
}

function toKebabCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function authoredStyleSources(html) {
  const uncommented = html.replace(/<!--[\s\S]*?-->/g, '');
  return [
    ...[...uncommented.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
      match => match[1],
    ),
    ...[...uncommented.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(
      match => match[1] ?? match[2],
    ),
  ].map(style => style.replace(/\/\*[\s\S]*?\*\//g, ''));
}

const forbiddenTemplateLiterals = [
  [
    'raw hex color',
    /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi,
  ],
  ['raw rgb color', /\brgba?\s*\(/gi],
  ['raw pixel length', /[+-]?(?:\d*\.)?\d+px\b/gi],
];

test('template CSS and inline styles use tokens instead of raw literals', async () => {
  const templateNames = (await readdir(templatesDir))
    .filter(name => name.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b));
  const violations = [];

  for (const name of templateNames) {
    const html = await readFile(path.join(templatesDir, name), 'utf8');
    const styles = authoredStyleSources(html).join('\n');
    for (const [kind, pattern] of forbiddenTemplateLiterals) {
      for (const match of styles.matchAll(pattern)) {
        violations.push(`${name}: ${kind} ${JSON.stringify(match[0])}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

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

test('component CSS and markup inventories match and build in stable order', async () => {
  const [componentNames, markupNames, css] = await Promise.all([
    listStems(componentsDir, '.css'),
    listStems(markupDir, '.html'),
    readFile(cssPath, 'utf8'),
  ]);

  assert.deepEqual(
    componentNames,
    markupNames,
    'every component stylesheet must have same-named markup and vice versa',
  );

  let previousIndex = -1;
  for (const name of componentNames) {
    const index = css.indexOf(`/* ${name} */`);
    assert.ok(index > previousIndex, `${name}.css is missing or out of order`);
    previousIndex = index;

    const blockClass = `.ax-${toKebabCase(name)}`;
    assert.ok(
      css.includes(blockClass),
      `${name}.css must emit its ${blockClass} block class`,
    );
  }

  assert.ok(css.includes('.ax-button--primary'));
  assert.ok(css.includes('.ax-stack--gap-2'));
  assert.ok(!css.includes('.astryx-button'));
});

test('markup follows the shared docs and variant contract', async () => {
  const componentNames = await listStems(markupDir, '.html');

  for (const name of componentNames) {
    const markup = await readFile(path.join(markupDir, `${name}.html`), 'utf8');
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

test('pseudo-elements stay outside :where() and :is() in source and dist', async () => {
  const componentFiles = (await readdir(componentsDir))
    .filter(file => file.endsWith('.css'))
    .map(file => path.join(componentsDir, file));

  for (const file of [...componentFiles, cssPath]) {
    const css = await readFile(file, 'utf8');
    assert.doesNotMatch(
      css,
      /:(?:where|is)\([^)]*::/,
      `${path.relative(packageRoot, file)} contains a pseudo-element inside :where() or :is()`,
    );
  }
});

test('the committed pinned demo matches the canonical sources and CDN ref', async () => {
  execFileSync(process.execPath, ['scripts/render-demo.mjs', '--check'], {
    cwd: packageRoot,
    stdio: 'pipe',
  });

  const cdnBase = astryxVanillaCdnBase(ASTRYX_VANILLA_CDN_REF);
  const names = ['dashboard', 'detail-page', 'form-two-column', 'table-filter'];
  const index = await readFile(path.join(pinnedDemoDir, 'index.html'), 'utf8');
  assert.doesNotMatch(index, new RegExp(ASTRYX_VANILLA_CDN_PLACEHOLDER));
  assert.match(index, new RegExp(cdnBase, 'g'));

  for (const name of names) {
    assert.match(index, new RegExp(`href="\\./${name}\\.html"`));
    const template = await readFile(
      path.join(pinnedDemoDir, `${name}.html`),
      'utf8',
    );
    assert.doesNotMatch(template, new RegExp(ASTRYX_VANILLA_CDN_PLACEHOLDER));
    assert.match(template, new RegExp(cdnBase, 'g'));
  }
});
