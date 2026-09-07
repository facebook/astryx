// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global console, module, process, require */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {isComponentSpecRecordPath} = require('./knowledge-paths.cjs');

/**
 * Classifies changed paths without reading PR-controlled content.
 *
 * A spec-only PR may change only spec records. Templates, schemas, indexes,
 * architecture, guidance, audits, workflows, and code deliberately do not
 * qualify.
 */

const SPEC_RECORD_PATTERNS = [
  /^docs\/specs\/[^/]+\/(?:spec|plan)\.md$/,
  /^docs\/families\/(?!README\.md$)[^/]+\.md$/,
  /^docs\/design\/(?!README\.md$)(?!assets\/)[^/]+\.md$/,
  /^packages\/themes\/([^/]+)\/\1\.spec\.md$/,
];

const CHANGESET_PATTERN = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;

const SURFACES = Object.freeze({
  KNOWLEDGE: 'knowledge',
  DOCSITE: 'docsite',
  NODE_TOOLING: 'node-tooling',
  SHARED_OR_UNKNOWN: 'shared-or-unknown',
});

// Tooling admission is exact and dependency-reviewed. Do not widen this to all
// of scripts/: that directory also owns generated public artifacts, package
// builds, releases, and other shared infrastructure.
const NODE_TOOLING_PATHS = new Set([
  'scripts/score-ledger.mjs',
  'scripts/score-ledger.test.mjs',
]);

const THEME_DOC_CANDIDATE = /^docs\/themes\/(?!README\.md$)[^/]+\.md$/;
const THEME_PACKAGE_CANDIDATE =
  /^packages\/themes\/[^/]+\/(?:.*\/)?[^/]+\.spec\.md$/;

const KNOWLEDGE_RECORD_PATTERNS = [
  ...SPEC_RECORD_PATTERNS,
  THEME_DOC_CANDIDATE,
  THEME_PACKAGE_CANDIDATE,
  /^docs\/architecture\/(?!README\.md$)[^/]+\.md$/,
  /^docs\/design\/assets\//,
];

function isSpecRecordPath(filePath) {
  return (
    isComponentSpecRecordPath(filePath) ||
    SPEC_RECORD_PATTERNS.some(pattern => pattern.test(filePath))
  );
}

function isPackageReleasePath(filePath) {
  if (!filePath.startsWith('packages/') || isSpecRecordPath(filePath)) {
    return false;
  }
  if (
    /(?:^|\/)(?:test|tests|test-utils|__tests__|__fixtures__|__snapshots__)\//.test(
      filePath,
    ) ||
    /\.test\.[^/]+$/.test(filePath) ||
    /\.audit\.json$/.test(filePath)
  ) {
    return false;
  }
  return true;
}

function isKnowledgeRecordPath(filePath) {
  return (
    isSpecRecordPath(filePath) ||
    KNOWLEDGE_RECORD_PATTERNS.some(pattern => pattern.test(filePath))
  );
}

function isNodeToolingPath(filePath) {
  return NODE_TOOLING_PATHS.has(filePath);
}

function surfaceForPath(filePath) {
  if (isSpecRecordPath(filePath)) return SURFACES.KNOWLEDGE;
  if (filePath.startsWith('apps/docsite/')) return SURFACES.DOCSITE;
  if (isNodeToolingPath(filePath)) return SURFACES.NODE_TOOLING;
  return SURFACES.SHARED_OR_UNKNOWN;
}

function normalizeChange(change) {
  if (typeof change === 'string') {
    return {filename: change, previous_filename: null};
  }
  return {
    filename: change.filename,
    previous_filename: change.previous_filename ?? null,
  };
}

function classifyChanges(changes, {expectedCount} = {}) {
  const normalized = changes
    .map(normalizeChange)
    .filter(change => change.filename);
  if (normalized.length === 0) {
    const complete = expectedCount == null || expectedCount === 0;
    return {
      specOnly: false,
      toolingOnly: false,
      touchesKnowledgeRecords: !complete,
      touchesDesignAssets: false,
      specChangesetConflict: false,
      docsiteOnly: false,
      surfaces: complete ? [] : [SURFACES.SHARED_OR_UNKNOWN],
      complete,
      reason: complete ? 'no changed files' : 'changed-file list is incomplete',
    };
  }
  const complete = expectedCount == null || normalized.length === expectedCount;

  const allPaths = normalized.flatMap(change =>
    change.previous_filename
      ? [change.filename, change.previous_filename]
      : [change.filename],
  );
  const surfaces = [
    ...new Set(allPaths.map(surfaceForPath)),
    ...(!complete ? [SURFACES.SHARED_OR_UNKNOWN] : []),
  ].sort();
  const touchesKnowledgeRecords =
    !complete || allPaths.some(isKnowledgeRecordPath);
  const touchesDesignAssets = allPaths.some(filePath =>
    filePath.startsWith('docs/design/assets/'),
  );
  const hasSpecRecord = allPaths.some(isSpecRecordPath);
  const hasChangeset = allPaths.some(filePath =>
    CHANGESET_PATTERN.test(filePath),
  );
  const hasPackageReleaseChange = allPaths.some(isPackageReleasePath);
  const specChangesetConflict =
    complete && hasSpecRecord && hasChangeset && !hasPackageReleaseChange;
  const specOnly = complete && allPaths.every(isSpecRecordPath);
  const docsiteOnly =
    complete &&
    allPaths.every(filePath => filePath.startsWith('apps/docsite/'));
  const toolingOnly = complete && allPaths.every(isNodeToolingPath);
  return {
    specOnly,
    toolingOnly,
    touchesKnowledgeRecords,
    touchesDesignAssets,
    specChangesetConflict,
    docsiteOnly,
    surfaces,
    complete,
    reason: !complete
      ? 'changed-file list is incomplete'
      : specOnly
        ? 'only spec records changed'
        : docsiteOnly
          ? 'only docsite files changed'
          : toolingOnly
            ? 'only admitted Node tooling changed'
            : 'changes include another surface',
  };
}

function parseNameStatus(input) {
  return input
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const fields = line.split('\t');
      const status = fields[0];
      if (/^[RC]/.test(status) && fields.length >= 3) {
        return {
          filename: fields[2],
          previous_filename: fields[1],
        };
      }
      return {filename: fields[1] ?? fields[0]};
    });
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('node:fs');
  const result = classifyChanges(parseNameStatus(fs.readFileSync(0, 'utf8')));
  if (result.specChangesetConflict) {
    console.error(
      'Pure spec-record changes must not add a Changeset; they do not release packages.',
    );
    process.exitCode = 1;
  } else if (process.argv.includes('--github-output')) {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (!outputPath)
      throw new Error('GITHUB_OUTPUT is required with --github-output.');
    fs.appendFileSync(
      outputPath,
      `spec_only=${result.specOnly}\ndocsite_only=${result.docsiteOnly}\ntooling_only=${result.toolingOnly}\n`,
    );
  } else {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  }
}

module.exports = {
  NODE_TOOLING_PATHS,
  SURFACES,
  classifyChanges,
  isKnowledgeRecordPath,
  isNodeToolingPath,
  isSpecRecordPath,
  parseNameStatus,
};
