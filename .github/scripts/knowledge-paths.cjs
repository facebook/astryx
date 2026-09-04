// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

/**
 * One shared path contract for component-local knowledge records. It consumes the
 * component-package registry; validation, change classification, and the spec-owner
 * gate all consume this helper so ignored paths cannot become records on only one
 * surface.
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
 * Direct children are component-record candidates; module records must be
 * nested at least one directory beneath the component root. Semantic kind,
 * filename/id agreement, and parent ownership are validated after parsing.
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
    const componentRoot = nested ? packageSegments[0] : publicName;
    return {
      componentRoot,
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
  const nested = relativePath.includes('/');
  return {
    componentRoot,
    fileName,
    kind: nested ? 'module' : 'component',
    layout: packageConfig.layout,
    packageName,
    publicName,
    relativePath,
  };
}

function isComponentSpecRecordPath(filePath) {
  return classifyComponentKnowledgePath(filePath) !== null;
}

module.exports = {
  COMPONENT_PACKAGE_NAMES,
  IGNORED_COMPONENT_KNOWLEDGE_SEGMENTS,
  classifyComponentKnowledgePath,
  isComponentSpecRecordPath,
  isIgnoredComponentKnowledgeSegment,
};
