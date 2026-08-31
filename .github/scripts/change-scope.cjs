// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global console, module, process, require */

/**
 * Classifies changed paths without reading PR-controlled content.
 *
 * A spec-only PR may change only spec records. Templates, schemas, indexes,
 * architecture, audits, workflows, and code deliberately do not qualify.
 */

const SPEC_RECORD_PATTERNS = [
  /^docs\/specs\/[^/]+\/(?:spec|plan)\.md$/,
  /^docs\/families\/(?!README\.md$)[^/]+\.md$/,
  /^docs\/design\/(?!README\.md$)(?!assets\/)[^/]+\.md$/,
  /^packages\/(?:core|lab)\/src\/[^/]+\/[^/]+\.spec\.md$/,
];

const CHANGESET_PATTERN = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;

const KNOWLEDGE_RECORD_PATTERNS = [
  ...SPEC_RECORD_PATTERNS,
  /^docs\/architecture\/(?!README\.md$)[^/]+\.md$/,
  /^docs\/design\/assets\//,
];

function isSpecRecordPath(filePath) {
  return SPEC_RECORD_PATTERNS.some(pattern => pattern.test(filePath));
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
  return KNOWLEDGE_RECORD_PATTERNS.some(pattern => pattern.test(filePath));
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
      touchesKnowledgeRecords: !complete,
      touchesDesignAssets: false,
      specChangesetConflict: false,
      docsiteOnly: false,
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
  const docsiteOnly = allPaths.every(filePath =>
    filePath.startsWith('apps/docsite/'),
  );
  return {
    specOnly,
    touchesKnowledgeRecords,
    touchesDesignAssets,
    specChangesetConflict,
    docsiteOnly,
    complete,
    reason: !complete
      ? 'changed-file list is incomplete'
      : specOnly
        ? 'only spec records changed'
        : docsiteOnly
          ? 'only docsite files changed'
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
      `spec_only=${result.specOnly}\ndocsite_only=${result.docsiteOnly}\n`,
    );
  } else {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  }
}

module.exports = {
  classifyChanges,
  isKnowledgeRecordPath,
  isSpecRecordPath,
  parseNameStatus,
};
