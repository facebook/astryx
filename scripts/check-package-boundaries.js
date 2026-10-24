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
 * FR16): core never imports @astryxdesign/native, and no file anywhere in
 * packages/native/ imports core outside the portable entry. Until core ships
 * that entry, NATIVE_CORE_EXCEPTIONS names each build-time read of core that
 * is allowed; any other import of core, or any other file that reads core's
 * package as data, fails.
 */

const fs = require('node:fs');
const path = require('node:path');

const IMPORT_SPECIFIER = /\b(?:from|import|require)\s*\(?\s*['"]([^'"]+)['"]/g;
const CORE_SOURCE = /\.(ts|tsx)$/;
const NATIVE_SOURCE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
// Installed dependencies, build output, and Swift build state hold no native
// source of their own.
const NATIVE_SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.build',
  '.swiftpm',
]);
// A path built to core's installed package, such as
// path.join(..., 'node_modules', '@astryxdesign', 'core').
const CORE_PACKAGE_PATH =
  /['"]@astryxdesign['"]\s*,\s*['"]core['"]|['"`][^'"`]*node_modules\/@astryxdesign\/core\b/;

/**
 * The interim exceptions to AST-082 FR16: build-time reads of core that
 * native makes before core's portable entry exists. Each one ends when the
 * portable entry ships. Adding one is a reviewed change to this list.
 */
const NATIVE_CORE_EXCEPTIONS = Object.freeze({
  // The Swift theme generator resolves a theme's tokens through core's theme
  // entries, at build time only (native theme generator spec, G2).
  imports: Object.freeze([
    Object.freeze({
      directory: 'packages/native/scripts',
      specifiers: Object.freeze([
        '@astryxdesign/core/theme',
        '@astryxdesign/core/theme/tokens',
      ]),
    }),
  ]),
  // The contract generator and its tests read core's component documentation
  // and icon registry as data, through this one loader.
  dataReaders: Object.freeze(['packages/native/scripts/core-docs.mjs']),
});

function walk(dir, extensions, skipped, visit) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipped.has(entry.name)) walk(fullPath, extensions, skipped, visit);
      continue;
    }
    if (extensions.test(entry.name)) visit(fullPath);
  }
}

function importsOf(content) {
  return [...content.matchAll(IMPORT_SPECIFIER)].map(match => match[1]);
}

function matchesPackage(resolved, prefixes) {
  return prefixes.some(
    prefix => resolved === prefix || resolved.startsWith(`${prefix}/`),
  );
}

function resolveSpecifier(root, filePath, specifier) {
  return specifier.startsWith('.')
    ? path
        .relative(root, path.resolve(path.dirname(filePath), specifier))
        .split(path.sep)
        .join('/')
    : specifier;
}

function isAllowedNativeImport(relPath, specifier) {
  return NATIVE_CORE_EXCEPTIONS.imports.some(
    exception =>
      relPath.startsWith(`${exception.directory}/`) &&
      exception.specifiers.includes(specifier),
  );
}

function checkCoreFile(root, filePath, violations) {
  const relPath = path.relative(root, filePath);
  const basename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  if (/^XDSCommon[A-Z]/.test(basename)) {
    violations.push({
      file: relPath,
      message:
        'XDSCommon* files belong in the common package, not @astryxdesign/core.',
    });
  }

  content.split('\n').forEach((line, index) => {
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

  for (const specifier of importsOf(content)) {
    const resolved = resolveSpecifier(root, filePath, specifier);
    if (matchesPackage(resolved, ['@astryxdesign/native', 'packages/native'])) {
      violations.push({
        file: relPath,
        message: `@astryxdesign/core must never import @astryxdesign/native. (imports "${specifier}")`,
      });
    }
  }
}

function checkNativeFile(root, filePath, violations) {
  const relPath = path.relative(root, filePath).split(path.sep).join('/');
  const content = fs.readFileSync(filePath, 'utf8');

  for (const specifier of importsOf(content)) {
    const resolved = resolveSpecifier(root, filePath, specifier);
    if (
      matchesPackage(resolved, ['@astryxdesign/core', 'packages/core']) &&
      !isAllowedNativeImport(relPath, specifier)
    ) {
      violations.push({
        file: relPath,
        message: `@astryxdesign/native must not import core outside the portable entry or a listed build-time exception. (imports "${specifier}")`,
      });
    }
  }

  if (
    CORE_PACKAGE_PATH.test(content) &&
    !NATIVE_CORE_EXCEPTIONS.dataReaders.includes(relPath)
  ) {
    violations.push({
      file: relPath,
      message:
        "@astryxdesign/native reads core's package as data only through a listed loader (scripts/core-docs.mjs).",
    });
  }
}

/** Every package-boundary violation under `root`, a repository checkout. */
function findViolations(root) {
  const violations = [];
  const coreSrc = path.join(root, 'packages/core/src');
  const nativeRoot = path.join(root, 'packages/native');

  if (fs.existsSync(coreSrc)) {
    walk(coreSrc, CORE_SOURCE, new Set(), filePath =>
      checkCoreFile(root, filePath, violations),
    );
  }
  if (fs.existsSync(nativeRoot)) {
    walk(nativeRoot, NATIVE_SOURCE, NATIVE_SKIPPED_DIRECTORIES, filePath =>
      checkNativeFile(root, filePath, violations),
    );
  }
  return violations;
}

module.exports = {findViolations, NATIVE_CORE_EXCEPTIONS};

if (require.main === module) {
  const violations = findViolations(path.resolve(__dirname, '..'));
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
}
