// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared visual-gate formatting for PR enrichment.
 * Used by generate-pr-comment.js and test-pr-enrichment.js.
 */

/**
 * Build the visual-regression section of the PR comment.
 *
 * The section has to survive four states, and the awkward one is `skipped`:
 * a check that quietly vanishes on the PRs most likely to break something
 * visually is worse than no check, so a skip states its reason and points at
 * the daily gate.
 *
 * @param {object|null} verdict - the gate's verdict.json, or null when the job did not run
 * @param {string} [reportUrl] - published report for this PR, if there is one
 * @returns {string} markdown
 */
function buildVisualSection(verdict, reportUrl) {
  if (!verdict) return '';

  const link = reportUrl
    ? ` <a href="${reportUrl}" target="_blank" rel="noopener noreferrer">View the report</a>`
    : '';

  if (verdict.status === 'skipped') {
    return `### Visual Regression\n\n**Status:** Skipped — ${verdict.reason}\n\n`;
  }
  if (verdict.status === 'failed') {
    return `### Visual Regression\n\n**Status:** ${verdict.counts.failed} shot(s) could not be captured.${link}\n\n`;
  }
  if (!verdict.changes || verdict.changes.length === 0) {
    const added = verdict.counts?.added
      ? ` ${verdict.counts.added} new shot(s) had no baseline to compare against.`
      : '';
    return `### Visual Regression\n\n**Status:** No visual change across ${verdict.counts.total} shot(s).${added}\n\n`;
  }

  const rows = verdict.changes
    .slice(0, 20)
    .map(
      change =>
        `| ${change.component || change.title} | ${change.name} | ${change.theme} | ${change.mode} | ${change.diffPixels.toLocaleString()} |`,
    )
    .join('\n');
  const more =
    verdict.changes.length > 20
      ? `\n\n_and ${verdict.changes.length - 20} more._`
      : '';

  return `### Visual Regression

**${verdict.changes.length} of ${verdict.counts.total} shot(s) changed.**${link}

A change here is a question, not a failure: check whether the *after* is the
picture you intended. If it is, say so in the PR — the release gate's baseline
is updated deliberately, and this check never rewrites it.

| component | story | theme | mode | pixels |
|---|---|---|---|---|
${rows}${more}

`;
}

module.exports = {buildVisualSection};
