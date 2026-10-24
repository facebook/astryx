// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/**
 * One shared path contract for component-local knowledge records, platform
 * component records, package records, and the spec-shaped files that must be
 * records (INV27). It consumes the component-package registry so validation,
 * change classification, and the spec-owner gate cannot disagree about
 * supported package layouts.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  COMPONENT_PACKAGE_NAMES,
  componentPackage,
} = require('../../scripts/component-packages.cjs');

const IGNORED_COMPONENT_KNOWLEDGE_SEGMENTS = new Set([
  '__fixtures__',
  '__generated__',
  '__snapshots__',
  '__tests__',
  'build',
  'coverage',
  'dist',
  'fixtures',
  'generated',
  'node_modules',
  'test',
  'test-utils',
  'tests',
]);

function normalizePath(filePath) {
  return String(filePath).replaceAll('\\', '/').replace(/^\.\//, '');
}

function isIgnoredComponentKnowledgeSegment(segment) {
  return (
    segment.startsWith('.') || IGNORED_COMPONENT_KNOWLEDGE_SEGMENTS.has(segment)
  );
}

/**
 * Classify a canonical component-local knowledge candidate by path alone.
 * Directory-layout component records are direct children of a component root;
 * flat-package component records are direct children of src. Module records are
 * nested below either component boundary. Semantic kind, filename/id agreement,
 * and parent ownership are validated after parsing.
 */
function classifyComponentKnowledgePath(filePath) {
  const normalized = normalizePath(filePath);
  const match = /^packages\/([^/]+)\/src\/(.+\.spec\.md)$/.exec(normalized);
  if (!match) return null;

  const packageName = match[1];
  const packageConfig = componentPackage(packageName);
  if (!packageConfig) return null;

  const packageRelativePath = match[2];
  const packageSegments = packageRelativePath.split('/');
  if (packageSegments.some(isIgnoredComponentKnowledgeSegment)) return null;

  const fileName = packageSegments.at(-1);
  if (fileName.endsWith('.generated.spec.md')) return null;
  const publicName = fileName.slice(0, -'.spec.md'.length);
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(publicName)) return null;

  if (packageConfig.layout === 'flat') {
    const nested = packageSegments.length > 1;
    return {
      componentRoot: nested ? packageSegments[0] : publicName,
      fileName,
      kind: nested ? 'module' : 'component',
      layout: packageConfig.layout,
      packageName,
      publicName,
      relativePath: packageRelativePath,
    };
  }

  if (packageSegments.length < 2) return null;
  const componentRoot = packageSegments[0];
  const relativePath = packageSegments.slice(1).join('/');
  return {
    componentRoot,
    fileName,
    kind: relativePath.includes('/') ? 'module' : 'component',
    layout: packageConfig.layout,
    packageName,
    publicName,
    relativePath,
  };
}

/**
 * Platform implementation packages and the language their component records
 * name (`component:<language>/<PublicName>`). Each component root is a
 * directory of the package's component tree; its record is the direct child
 * `<PublicName>.spec.md`. Swift has one package, `packages/native/apple`,
 * whose `Astryx` target holds one folder per component.
 */
const PLATFORM_COMPONENT_ROOTS = Object.freeze([
  Object.freeze({
    language: 'swift',
    pattern: /^(packages\/native\/apple\/Sources\/Astryx)\/([^/]+)\/([^/]+)$/,
  }),
]);

/**
 * Classify a platform implementation's component record by path alone:
 * `<package component tree>/<Root>/<PublicName>.spec.md`. Its id, its
 * `platform_of` link, and the core record it names are validated after
 * parsing.
 */
function classifyPlatformComponentKnowledgePath(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized.endsWith('.spec.md')) return null;
  for (const {language, pattern} of PLATFORM_COMPONENT_ROOTS) {
    const match = pattern.exec(normalized);
    if (!match) continue;
    const [, componentTree, componentRoot, fileName] = match;
    if (isIgnoredComponentKnowledgeSegment(componentRoot)) return null;
    if (fileName.endsWith('.generated.spec.md')) return null;
    const publicName = fileName.slice(0, -'.spec.md'.length);
    if (!/^[A-Z][A-Za-z0-9]*$/.test(publicName)) return null;
    return {
      componentRoot,
      componentTree,
      fileName,
      kind: 'component',
      language,
      layout: 'platform',
      packageName: normalized.split('/')[1],
      publicName,
      relativePath: fileName,
    };
  }
  return null;
}

/**
 * Classify a package's cross-component record: a `<slug>.spec.md` anywhere
 * under `packages/<package>/specs/`. Its kind is `architecture` and its id is
 * `architecture:<package>-<directories>-<slug>`, joined with hyphens.
 */
function classifyPackageArchitecturePath(filePath) {
  const match =
    /^packages\/([a-z0-9][a-z0-9-]*)\/specs\/((?:[a-z0-9][a-z0-9-]*\/)*)([a-z0-9][a-z0-9-]*)\.spec\.md$/.exec(
      normalizePath(filePath),
    );
  if (!match) return null;
  const [, packageName, directories, slug] = match;
  const parts = [packageName, ...directories.split('/').filter(Boolean), slug];
  return {
    id: `architecture:${parts.join('-')}`,
    kind: 'architecture',
    packageName,
  };
}

/**
 * A spec-shaped file that must be a valid knowledge record (INV27): a tracked
 * Markdown file named `*.spec.md`, or any Markdown file under a directory
 * named `specs`. README.md indexes, plan.md implementation plans, and paths
 * discovery ignores (fixtures, tests, generated output, hidden directories)
 * are not candidates.
 */
function isKnowledgeRecordCandidatePath(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized.endsWith('.md')) return false;
  const segments = normalized.split('/');
  const fileName = segments.at(-1);
  if (fileName === 'README.md' || fileName === 'plan.md') return false;
  if (fileName.startsWith('.')) return false;
  if (fileName.endsWith('.generated.spec.md')) return false;
  const directories = segments.slice(0, -1);
  if (directories.some(isIgnoredComponentKnowledgeSegment)) return false;
  return fileName.endsWith('.spec.md') || directories.includes('specs');
}

function isComponentSpecRecordPath(filePath) {
  return (
    classifyComponentKnowledgePath(filePath) !== null ||
    classifyPlatformComponentKnowledgePath(filePath) !== null
  );
}

function isPackageArchitectureRecordPath(filePath) {
  return classifyPackageArchitecturePath(filePath) !== null;
}

module.exports = {
  COMPONENT_PACKAGE_NAMES,
  IGNORED_COMPONENT_KNOWLEDGE_SEGMENTS,
  PLATFORM_COMPONENT_ROOTS,
  classifyComponentKnowledgePath,
  classifyPackageArchitecturePath,
  classifyPlatformComponentKnowledgePath,
  isComponentSpecRecordPath,
  isIgnoredComponentKnowledgeSegment,
  isKnowledgeRecordCandidatePath,
  isPackageArchitectureRecordPath,
};
