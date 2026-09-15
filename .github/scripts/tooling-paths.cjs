// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

/**
 * @file Trusted registry of paths admitted to the `node-tooling` surface.
 * @input A repository-relative changed path.
 * @output Whether that path belongs to an admitted tooling group.
 * @position One admission list read by both trusted classifiers, so the
 *   specialized CI lane and the component-audit fail-closed gate cannot
 *   disagree about the same change.
 */

/**
 * Admission is per group and exact: list every file a tooling group owns,
 * including its libraries and its own documentation. A group qualifies only
 * when no package runtime, component, story, theme/build output, or browser
 * behavior changes with it, no repository module imports it, and no
 * pull-request check other than the Node project, repository guardrails, and
 * ESLint can observe it. See `spec:AST-030` FR2 and FR6.
 *
 * Never widen an entry to a directory or extension. `scripts/`,
 * `internal/scripts/`, and `.github/workflows/` also hold package builds,
 * generated public artifacts, releases, and pull-request CI policy itself. An
 * unlisted path stays `shared-or-unknown` and keeps running broad CI.
 */
const NODE_TOOLING_GROUPS = Object.freeze({
  // Contributor score ledger. Consumed only by its own tests and the Sandbox
  // projection contract test.
  'score-ledger': Object.freeze([
    'scripts/score-ledger.mjs',
    'scripts/score-ledger.test.mjs',
  ]),
  // Crowdin screenshot upload. The uploader and its strategy library have no
  // importer in the repository; their only consumer is the upload workflow,
  // which runs on `push` to main and manual dispatch, never on a pull request,
  // and gates no required check. The catalog it reads stays owned by
  // `check:i18n-catalog`, which the tooling lane still runs.
  'crowdin-screenshots': Object.freeze([
    '.github/workflows/crowdin-upload.yml',
    'internal/scripts/README.md',
    'internal/scripts/lib/crowdin-strategies.mjs',
    'internal/scripts/upload-crowdin-screenshots.mjs',
  ]),
});

const NODE_TOOLING_PATHS = new Set(Object.values(NODE_TOOLING_GROUPS).flat());

function isNodeToolingPath(filePath) {
  return NODE_TOOLING_PATHS.has(filePath);
}

module.exports = {
  NODE_TOOLING_GROUPS,
  NODE_TOOLING_PATHS,
  isNodeToolingPath,
};
