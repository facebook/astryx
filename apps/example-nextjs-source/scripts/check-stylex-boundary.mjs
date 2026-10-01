#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {readFileSync, readdirSync, realpathSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const require = createRequire(import.meta.url);
const manifest = require('../package.json');
const options = require('../postcss.config.js').plugins[
  '@stylexjs/postcss-plugin'
];

assert(
  JSON.stringify(options.include) ===
    JSON.stringify(['src/app/**/*.{js,jsx,ts,tsx}']),
  'PostCSS include must be the explicit product source directory',
);
assert(
  options.exclude.includes('**/node_modules/**') &&
    options.exclude.includes('../../packages/**/*'),
  'PostCSS must exclude node_modules and repository Astryx packages',
);

const sourceFiles = walk(path.join(appRoot, 'src')).filter(file =>
  /\.[cm]?[jt]sx?$/.test(file),
);
const productRoot = realpathSync(path.join(appRoot, 'src/app'));
const stylexFiles = sourceFiles.filter(file =>
  readFileSync(file, 'utf8').includes('@stylexjs/stylex'),
);
for (const file of stylexFiles) {
  assert(
    isWithin(realpathSync(file), productRoot),
    `product StyleX source is outside the PostCSS include: ${relative(file)}`,
  );
}
assert(stylexFiles.length > 0, 'no product StyleX source was found');

for (const packageName of [
  '@astryxdesign/core',
  '@astryxdesign/theme-neutral',
]) {
  const version = manifest.dependencies[packageName];
  assert(
    /^\d+\.\d+\.\d+$/.test(version),
    `${packageName} must use an exact published version`,
  );
  const packageRoot = realpathSync(
    path.dirname(path.dirname(require.resolve(packageName))),
  );
  assert(
    isWithin(packageRoot, realpathSync(path.join(appRoot, 'node_modules'))),
    `${packageName} resolves outside this app's node_modules`,
  );
}

const nextConfig = readFileSync(path.join(appRoot, 'next.config.mjs'), 'utf8');
assert(
  !/(withAstryx|transpilePackages|webpack\s*[:(])/u.test(nextConfig),
  'next.config must not compile, transpile, or alias Astryx source',
);

const cssFiles = walk(path.join(appRoot, '.next/static/chunks')).filter(file =>
  file.endsWith('.css'),
);
assert(cssFiles.length > 0, 'no production CSS assets were found');
const css = cssFiles.map(file => readFileSync(file, 'utf8')).join('\n');
const cssBytes = cssFiles.reduce((sum, file) => sum + statSync(file).size, 0);
assert(
  cssBytes <= 240_000,
  `production CSS is ${cssBytes} bytes; Astryx may have been compiled twice`,
);

const compactCss = css.replace(/\s+/g, '');
assert(
  compactCss.includes('@layerreset,astryx-base,astryx-theme,product;'),
  'canonical layer order statement is missing',
);
const product = extractLayerBodies(css, name => name.startsWith('product.'));
const base = extractLayerBodies(css, name => name === 'astryx-base');
assert(product.length > 0, 'no product StyleX layers were emitted');
assert(
  !/\.x[a-z0-9]{5,}/.test(product),
  'x-prefixed Astryx class found inside a product layer',
);
assert(
  /\.p[a-z0-9]{5,}/.test(product),
  'product layer does not contain p-prefixed classes',
);

const ruleBodies = source =>
  [...source.matchAll(/\.[a-z][a-z0-9]{4,}[^{}]*\{([^{}]*)\}/g)].map(
    match => match[1],
  );
const baseBodies = new Set(ruleBodies(base));
const productBodies = ruleBodies(product);
const duplicates = productBodies.filter(body => baseBodies.has(body));
const duplicateBudget = Math.max(20, Math.floor(baseBodies.size * 0.05));
assert(
  duplicates.length <= duplicateBudget,
  `${duplicates.length} product rules duplicate Astryx rules (budget ${duplicateBudget})`,
);

const sentinelCount = (
  css.match(/@property\s+--x---_avatar-group-overlap/g) ?? []
).length;
assert(
  sentinelCount === 1,
  `precompiled Astryx CSS appeared ${sentinelCount} times`,
);

console.log(
  `StyleX boundary passed: ${stylexFiles.length} product files, ${productBodies.length} product rules, ${duplicates.length} duplicate bodies, ${cssBytes} CSS bytes`,
);

function walk(root) {
  const files = [];
  for (const entry of readdirSync(root, {withFileTypes: true})) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

function extractLayerBodies(source, accepts) {
  const bodies = [];
  const matcher = /@layer\s+([a-z0-9.-]+)\s*\{/gi;
  let match;
  while ((match = matcher.exec(source)) != null) {
    if (!accepts(match[1])) continue;
    const open = matcher.lastIndex - 1;
    let depth = 1;
    let cursor = open + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === '{') depth += 1;
      else if (source[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    assert(depth === 0, `unterminated @layer ${match[1]}`);
    bodies.push(source.slice(open + 1, cursor - 1));
    matcher.lastIndex = cursor;
  }
  return bodies.join('\n');
}

function isWithin(target, root) {
  const relativePath = path.relative(root, target);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

function relative(file) {
  return path.relative(appRoot, file);
}

function assert(value, message) {
  if (!value) {
    console.error(`STYLEX BOUNDARY FAIL: ${message}`);
    process.exit(1);
  }
}
