#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * Package Boundary Check
 *
 * Keeps package-specific APIs out of the core package. Core should expose
 * primitive XDS building blocks; shell/common wrappers belong in their owning
 * package so consumers do not get parallel implementations.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.join(ROOT, 'packages/core/src');

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }

    checkFile(fullPath);
  }
}

function checkFile(filePath) {
  const relPath = path.relative(ROOT, filePath);
  const basename = path.basename(filePath);

  if (/^XDSCommon[A-Z]/.test(basename)) {
    violations.push({
      file: relPath,
      message: 'XDSCommon* files belong in the common package, not @astryxdesign/core.',
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
