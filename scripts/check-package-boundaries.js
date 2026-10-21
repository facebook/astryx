#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Package Boundary Check
 *
 * Keeps package-specific APIs out of the core package. Core should expose
 * primitive XDS building blocks; shell/common wrappers belong in their owning
 * package so consumers do not get parallel implementations.
 *
 * Also keeps core and the experimental native package apart (AST-082 FR14,
 * FR16): core never imports @astryxdesign/native, and native's source never
 * imports core. Native reads core's documentation as data at build time.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.join(ROOT, 'packages/core/src');
const NATIVE_SRC = path.join(ROOT, 'packages/native/src');
const IMPORT_SPECIFIER = /\b(?:from|import|require)\s*\(?\s*['"]([^'"]+)['"]/g;

const violations = [];

function walk(dir, check = checkFile) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, check);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }

    check(fullPath);
  }
}

function importsOf(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return [...content.matchAll(IMPORT_SPECIFIER)].map(match => match[1]);
}

function checkNativeBoundary(filePath, forbidden, message) {
  const relPath = path.relative(ROOT, filePath);
  for (const specifier of importsOf(filePath)) {
    const resolved = specifier.startsWith('.')
      ? path.relative(ROOT, path.resolve(path.dirname(filePath), specifier))
      : specifier;
    if (
      forbidden.some(
        prefix => resolved === prefix || resolved.startsWith(`${prefix}/`),
      )
    ) {
      violations.push({
        file: relPath,
        message: `${message} (imports "${specifier}")`,
      });
    }
  }
}

function checkFile(filePath) {
  const relPath = path.relative(ROOT, filePath);
  const basename = path.basename(filePath);

  if (/^XDSCommon[A-Z]/.test(basename)) {
    violations.push({
      file: relPath,
      message:
        'XDSCommon* files belong in the common package, not @astryxdesign/core.',
    });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (
      /^\s*export\s+(?:declare\s+)?(?:class|const|function|interface|type)\s+XDSCommon[A-Z]/.test(
        line,
      )
    ) {
      violations.push({
        file: `${relPath}:${index + 1}`,
        message:
          'Exported XDSCommon* APIs belong in the common package, not @astryxdesign/core.',
      });
    }
  });
}

walk(CORE_SRC);
walk(CORE_SRC, filePath =>
  checkNativeBoundary(
    filePath,
    ['@astryxdesign/native', 'packages/native'],
    '@astryxdesign/core must never import @astryxdesign/native.',
  ),
);
if (fs.existsSync(NATIVE_SRC)) {
  walk(NATIVE_SRC, filePath =>
    checkNativeBoundary(
      filePath,
      ['@astryxdesign/core', 'packages/core'],
      '@astryxdesign/native source must not import core; read core documentation at build time instead.',
    ),
  );
}

if (violations.length === 0) {
  console.log('Package boundaries are clean.');
  process.exit(0);
}

console.log(`Found ${violations.length} package boundary violation(s):\n`);
for (const violation of violations) {
  console.log(`  ${violation.file}: ${violation.message}`);
}
console.log(
  '\nMove common shell integrations to their owning package or update the existing wrapper there.',
);
process.exit(1);
