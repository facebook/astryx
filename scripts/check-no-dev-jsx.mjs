#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Build-output check: verify the compiled dist contains no development JSX.
 *
 * React's production build does not export `jsxDEV` — `react/jsx-dev-runtime`
 * resolves it to `undefined`. A dist compiled with the development JSX
 * transform therefore throws `TypeError: jsxDEV is not a function` the moment
 * a consumer server-renders (or client-renders in production) any component.
 *
 * @babel/preset-react 8 defaults `development` to `api.env(env => env ===
 * 'development')`, and Babel's env name falls back to "development" whenever
 * NODE_ENV/BABEL_ENV is unset — so an ambient env var is all that stands
 * between a release build and a broken package. The configs pin
 * `development: false`; this guard makes sure nothing silently unpins it.
 *
 * Usage: node ../../scripts/check-no-dev-jsx.mjs   (run from a package root,
 * after the package's dist has been built)
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

const PATTERNS = [
  {pattern: 'react/jsx-dev-runtime', label: 'imports react/jsx-dev-runtime'},
  {pattern: 'jsxDEV', label: 'calls jsxDEV'},
];

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(`❌ No dist directory at ${DIST_DIR} — build before checking.`);
  process.exit(1);
}

const files = walk(DIST_DIR);
const offenders = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const hits = PATTERNS.filter(({pattern}) => content.includes(pattern));
  if (hits.length > 0) {
    offenders.push({
      file: path.relative(DIST_DIR, file),
      issues: hits.map(({label}) => label),
    });
  }
}

if (offenders.length > 0) {
  console.error('❌ Development JSX found in build output:\n');
  for (const {file, issues} of offenders.slice(0, 20)) {
    console.error(`  dist/${file}: ${issues.join(', ')}`);
  }
  if (offenders.length > 20) {
    console.error(`  …and ${offenders.length - 20} more file(s).`);
  }
  console.error(
    `\n${offenders.length} file(s) compiled with the development JSX transform. ` +
      'React\'s production build does not export jsxDEV, so this dist crashes ' +
      'every consumer that renders it in production.\n' +
      'Fix: keep `development: false` in the package\'s @babel/preset-react ' +
      'options (preset-react 8 otherwise derives it from NODE_ENV).',
  );
  process.exit(1);
}

console.log(
  `✅ ${files.length} dist file(s) checked — no development JSX in build output.`,
);
