#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Build-output check: verify every relative specifier in the compiled dist
 * is fully specified (carries an explicit file extension).
 *
 * These runtime files are consumed as ESM, where relative specifiers need an
 * explicit extension — strict-ESM consumers (Node itself, Rspack, webpack's
 * `fullySpecified`) refuse to resolve './XDSButton' where './XDSButton.js' is
 * required. Different packages use different compilers to produce those
 * specifiers; this guard makes sure nothing slips into the artifact again
 * (#4569: dynamic `import()` specifiers did exactly that).
 *
 * Like check-no-dev-jsx.mjs this is a textual scan, not a parse. Comment
 * lines are skipped: dist keeps some JSDoc comments whose usage examples
 * legitimately mention extensionless specifiers. Only runtime files are
 * scanned — the .d.ts surface resolves through TypeScript, not Node.
 *
 * Usage: node <repo-root>/scripts/check-fully-specified.mjs   (run from a
 * package root, after the package's dist has been built; the relative depth
 * differs per package — ../../ from packages/*, ../../../ from
 * packages/themes/*)
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// A relative specifier is fine once it ends in an explicit extension.
const FULLY_SPECIFIED = /\.(?:js|mjs|cjs|json|css)$/;

// The syntactic homes of a specifier in emitted ESM:
//   import/export ... from './x'
//   import './x'       (side-effect import)
//   import('./x')      (dynamic import)
//   import(`./x`)      (no-substitution template — a static specifier in
//                       disguise; templates with `${` stay computed and exempt)
const SPECIFIER_PATTERNS = [
  /\bfrom\s*["'](\.\.?\/[^"']*)["']/g,
  /\bimport\s+["'](\.\.?\/[^"']*)["']/g,
  /\bimport\(\s*["'](\.\.?\/[^"']*)["']\s*\)/g,
  /\bimport\(\s*`(\.\.?\/[^`$]*)`\s*\)/g,
];

const COMMENT_LINE = /^\s*(?:\*|\/\/|\/\*)/;

/** Return the extensionless relative specifiers found in one file's source. */
export function scanSource(source) {
  const offenders = [];
  for (const line of source.split('\n')) {
    if (COMMENT_LINE.test(line)) continue;
    for (const pattern of SPECIFIER_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        const specifier = match[1];
        if (!FULLY_SPECIFIED.test(specifier)) {
          offenders.push(specifier);
        }
      }
    }
  }
  return offenders;
}

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

/**
 * Scan every runtime file under `distDir`; return
 * {checked, offenders: [{file, specifiers}]}.
 */
export function findOffenders(distDir) {
  const files = walk(distDir);
  const offenders = [];
  for (const file of files) {
    const specifiers = scanSource(fs.readFileSync(file, 'utf-8'));
    if (specifiers.length > 0) {
      offenders.push({file: path.relative(distDir, file), specifiers});
    }
  }
  return {checked: files.length, offenders};
}

/**
 * Return remediation guidance for the package whose dist is being checked.
 *
 * The package name is consulted before the Babel plugin file: a maintained
 * theme generates its icon import through `astryx theme build`, so the theme
 * branch stays correct even if such a package later picks up the plugin for
 * some other part of its build.
 */
export function failureGuidance(packageDir) {
  let packageName = '';
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
    packageName = typeof packageJson.name === 'string' ? packageJson.name : '';
  } catch {
    // A package manifest is useful context, not a requirement for the scan.
  }

  if (packageName.startsWith('@astryxdesign/theme-')) {
    return (
      "Fix: check the package's `astryx theme build --icons-specifier` " +
      'value and any other build step that emitted the reported file.'
    );
  }

  if (fs.existsSync(path.join(packageDir, 'babel-plugin-add-extensions.cjs'))) {
    return (
      "Fix: make sure the package's babel-plugin-add-extensions.cjs " +
      'rewrites the syntax form that produced them.'
    );
  }

  return (
    'Fix: update the build step that emitted the reported file so its ' +
    'relative specifiers include explicit extensions.'
  );
}

function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.error(
      `❌ No dist directory at ${distDir} — build before checking.`,
    );
    process.exit(1);
  }

  const {checked, offenders} = findOffenders(distDir);

  if (offenders.length > 0) {
    console.error('❌ Extensionless relative specifiers in build output:\n');
    for (const {file, specifiers} of offenders.slice(0, 20)) {
      console.error(`  dist/${file}: ${specifiers.join(', ')}`);
    }
    if (offenders.length > 20) {
      console.error(`  …and ${offenders.length - 20} more file(s).`);
    }
    console.error(
      `\n${offenders.length} file(s) ship specifiers without a file ` +
        'extension. ESM loaders and strict-ESM bundlers cannot resolve ' +
        `them (see #4569).\n${failureGuidance(process.cwd())}`,
    );
    process.exit(1);
  }

  console.log(
    `✅ ${checked} dist file(s) checked — every relative specifier is fully specified.`,
  );
}

// Run as a script, but stay importable for unit tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
