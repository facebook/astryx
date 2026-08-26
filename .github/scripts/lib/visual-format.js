// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared visual-gate formatting for PR enrichment.
 * Used by generate-pr-comment.js and test-pr-enrichment.js.
 */

const {inline, num, safeUrl} = require('./report-text');

/**
 * Build the visual-regression section of the PR comment.
 *
 * The section has to survive four states, and the awkward one is `skipped`:
 * a check that quietly vanishes on the PRs most likely to break something
 * visually is worse than no check, so a skip states its reason and points at
 * the daily gate.
 *
 * @param {object|null} verdict - the gate's verdict.json, or null when the job did not run
 * @param {string} [reportUrl] - immutable published report for this run
 * @param {string} [imageUrl] - immutable raw-image base for inline evidence
 * @returns {string} markdown
 */
function buildVisualSection(verdict, reportUrl, imageUrl) {
  if (!verdict) return '';

  // Verdict fields are report data: render them as literal inline text (and
  // counts as numbers), never as markup — see report-text.js.
  const safeReportUrl = reportUrl ? safeUrl(reportUrl) : null;
  const link = safeReportUrl
    ? ` <a href="${safeReportUrl}" target="_blank" rel="noopener noreferrer">View the report</a>`
    : '';

  if (verdict.status === 'skipped') {
    return `### Visual Regression\n\n**Status:** Skipped — ${inline(verdict.reason)}\n\n`;
  }
  if (verdict.status === 'failed') {
    return `### Visual Regression\n\n**Status:** ${num(verdict.counts?.failed)} shot(s) could not be captured.${link}\n\n`;
  }
  if (!verdict.changes || verdict.changes.length === 0) {
    const compared = num(verdict.counts?.total) - num(verdict.counts?.added);
    // A PR-scoped run shoots every story of the touched component in every
    // theme that styles it, which is deeper than the daily gate's baseline
    // reaches — so some shots legitimately have nothing to compare against.
    // Saying "added" there reads as a problem; saying it plainly does not.
    const unbaselined = num(verdict.counts?.added)
      ? ` ${num(verdict.counts?.added)} shot(s) have no baseline yet and were not compared.`
      : '';
    return `### Visual Regression\n\n**Status:** No visual change across ${compared} compared shot(s).${unbaselined}\n\n`;
  }

  const rows = verdict.changes
    .slice(0, 20)
    .map(
      change =>
        `| ${inline(change.component || change.title)} | ${inline(change.name)} | ${inline(change.theme)} | ${inline(change.mode)} | ${num(change.diffPixels).toLocaleString()} |`,
    )
    .join('\n');

  // Put the evidence where the decision is made. A link to an artifact ZIP is
  // not a visual review: it makes the reviewer download, unzip, and match file
  // names before they can answer whether the after is correct. The static
  // report is published beside the PR preview, and its first three deltas
  // render directly in the comment; the full report carries the rest + wipe UI.
  const reportBase = safeReportUrl
    ? `${safeReportUrl.replace(/\/+$/, '')}/`
    : null;
  // GitHub comments fetch raw branch images directly. The repository's Pages
  // deployment can be delayed or errored independently of the gh-pages push;
  // coupling inline evidence to that deployment produced six broken images in
  // the first live demo even though every PNG existed in the branch.
  const imageBase = safeUrl(imageUrl)
    ? `${safeUrl(imageUrl).replace(/\/+$/, '')}/`
    : reportBase;
  const evidence = imageBase
    ? verdict.changes
        .slice(0, 3)
        .map(change => {
          const key = encodeURIComponent(String(change.key ?? ''));
          if (!key) return '';
          const label = `${inline(change.component || change.title)} — ${inline(change.name)} — ${inline(change.theme)} ${inline(change.mode)}`;
          return `
<details open>
<summary>${label}</summary>
<table>
<tr><th>Before</th><th>After</th><th>Diff</th></tr>
<tr>
<td><img src="${imageBase}before/${key}.png" width="300" alt="Before visual regression frame"></td>
<td><img src="${imageBase}after/${key}.png" width="300" alt="After visual regression frame"></td>
<td><img src="${imageBase}diff/${key}.png" width="300" alt="Pixel difference frame"></td>
</tr>
</table>
</details>`;
        })
        .filter(Boolean)
        .join('\n')
    : '';
  const more =
    verdict.changes.length > 20
      ? `\n\n_and ${verdict.changes.length - 20} more._`
      : '';

  return `### Visual Regression

**${verdict.changes.length} of ${num(verdict.counts?.total)} shot(s) changed.**${link}

A change here is a question, not a failure: check whether the *after* is the
picture you intended. If it is, say so in the PR — the release gate's baseline
is updated deliberately, and this check never rewrites it.

| component | story | theme | mode | pixels |
|---|---|---|---|---|
${rows}${more}

${evidence}

`;
}

module.exports = {buildVisualSection};
