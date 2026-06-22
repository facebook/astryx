// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Custom changesets changelog module for XDS.
 *
 * Implements the { getReleaseLine, getDependencyReleaseLine } contract that
 * @changesets/apply-release-plan expects. Wired via `.changeset/config.json`:
 *
 *   "changelog": "./changelog.cjs"
 *
 * Responsibilities:
 *   - Render each changeset as a categorized, contributor-attributed bullet
 *     (parsing the XDS body convention via scripts/changeset-entry-format).
 *   - Suppress the noisy "Updated dependencies" lines that the default
 *     generator emits for every internal bump. Under our `fixed` lockstep
 *     every package bumps together on every release, so those lines are pure
 *     noise in per-package changelogs. The post-version formatter
 *     (scripts/format-changelogs.mjs) produces the polished output.
 */

const {
  parseEntry,
  renderReleaseLine,
} = require('../scripts/changeset-entry-format.cjs');

/**
 * @param {{summary: string}} changeset
 */
async function getReleaseLine(changeset /*, type, changelogOpts */) {
  const parsed = parseEntry(changeset.summary);
  return renderReleaseLine(parsed);
}

/**
 * Internal dependency bumps. Returns empty so lockstep dependency churn does
 * not pollute changelogs. (All publishable packages are in `fixed`, so they
 * always co-bump; listing "Updated dependencies" on each is meaningless.)
 */
async function getDependencyReleaseLine() {
  return '';
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
  // changesets unwraps `.default` under ESM-interop; expose it both ways.
  default: {getReleaseLine, getDependencyReleaseLine},
};
