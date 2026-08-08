// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y-baseline.js
 * @input An a11y report (the JSON written by accessibility-audit.js) and a
 *   checked-in baseline file (.github/a11y-baseline.json)
 * @output Pure diff logic for the accessibility CI gate: which violations are
 *   NEW (not in the baseline, fail the build), which baseline entries are
 *   RESOLVED (can be removed), plus baseline (re)generation and a readable
 *   failure summary.
 * @position Shared by accessibility-audit.js (--baseline / --fail-on-new /
 *   --update-baseline). Kept free of Playwright/axe so it can be unit-tested
 *   without a browser (see a11y-baseline.test.mjs).
 *
 * Key design: `Component::Story::rule-id`.
 *   - Component + story + axe rule id is stable across unrelated DOM churn:
 *     axe rule ids are versioned and stable, and story names only change when
 *     someone renames a story (an intentional act).
 *   - Node target selectors / HTML snippets are deliberately EXCLUDED from the
 *     key — they change whenever markup shifts for unrelated reasons, which
 *     would make baseline entries silently stop matching and re-fail the
 *     build on cosmetic refactors.
 *   - Tradeoff: if a story already violates a rule (baselined) and a change
 *     adds MORE nodes violating the same rule in the same story, the gate
 *     will not catch it. That is acceptable — the goal is to stop new rule
 *     regressions while keeping the gate churn-proof.
 */

const BASELINE_VERSION = 1;

/** Build the stable baseline key for one violation occurrence. */
function violationKey(component, story, ruleId) {
  return `${component}::${story}::${ruleId}`;
}

/**
 * Flatten an a11y report into one entry per (component, story, rule)
 * occurrence, deduped by key.
 *
 * Prefers the per-story `storyDetails` shape (raw axe violations per story);
 * falls back to the aggregated `violations` shape (which carries a `stories`
 * list per rule) for older reports.
 *
 * @param {object} report - report object with `.components`
 * @returns {Array<{key: string, component: string, story: string,
 *   ruleId: string, impact: string, help: string, helpUrl: string,
 *   nodes: number}>}
 */
function collectViolations(report) {
  const occurrences = [];
  const components = (report && report.components) || {};

  for (const [component, result] of Object.entries(components)) {
    const storyDetails = Array.isArray(result.storyDetails)
      ? result.storyDetails
      : [];

    if (storyDetails.length > 0) {
      for (const storyResult of storyDetails) {
        for (const violation of storyResult.violations || []) {
          occurrences.push({
            key: violationKey(component, storyResult.story, violation.id),
            component,
            story: storyResult.story,
            ruleId: violation.id,
            impact: violation.impact || 'unknown',
            help: violation.help || violation.description || '',
            helpUrl: violation.helpUrl || '',
            nodes: (violation.nodes || []).length,
          });
        }
      }
    } else {
      // Aggregated-only shape: one occurrence per (rule, story) pair.
      for (const violation of result.violations || []) {
        const stories =
          Array.isArray(violation.stories) && violation.stories.length > 0
            ? violation.stories
            : ['*'];
        for (const story of stories) {
          occurrences.push({
            key: violationKey(component, story, violation.id),
            component,
            story,
            ruleId: violation.id,
            impact: violation.impact || 'unknown',
            help: violation.help || violation.description || '',
            helpUrl: violation.helpUrl || '',
            nodes: violation.totalNodes || 0,
          });
        }
      }
    }
  }

  // Dedupe by key (a story name should be unique within a component, but be
  // defensive), merging node counts.
  const byKey = new Map();
  for (const occurrence of occurrences) {
    const existing = byKey.get(occurrence.key);
    if (existing) {
      existing.nodes += occurrence.nodes;
    } else {
      byKey.set(occurrence.key, {...occurrence});
    }
  }
  return Array.from(byKey.values());
}

/** Normalize baseline entries (objects or bare key strings) to a key Set. */
function baselineKeySet(baseline) {
  const entries = (baseline && baseline.entries) || [];
  return new Set(
    entries
      .map(entry => (typeof entry === 'string' ? entry : entry && entry.key))
      .filter(Boolean),
  );
}

/**
 * Build a baseline object from a report (for --update-baseline).
 *
 * The audit is often scoped with --components, so the report only covers a
 * subset of the library. Entries in `existing` that belong to components NOT
 * audited in this report are preserved; entries for audited components are
 * replaced wholesale by the report's current violations.
 *
 * @param {object} report
 * @param {{existing?: object|null, now?: Date}} [options]
 */
function buildBaseline(report, {existing = null, now = new Date()} = {}) {
  const audited = new Set(Object.keys((report && report.components) || {}));
  const preserved = ((existing && existing.entries) || [])
    .map(entry => (typeof entry === 'string' ? {key: entry} : entry))
    .filter(
      entry => entry && entry.key && !audited.has(entry.key.split('::')[0]),
    );
  const fresh = collectViolations(report).map(v => ({
    key: v.key,
    impact: v.impact,
    helpUrl: v.helpUrl,
  }));

  return {
    $comment:
      'Known axe violations tolerated by the pr-a11y CI gate. Entries are ' +
      'keyed Component::Story::rule-id. Regenerate with `pnpm a11y:baseline` ' +
      '(requires a built Storybook + Playwright chromium). Remove entries ' +
      'as violations are fixed.',
    version: BASELINE_VERSION,
    generatedAt: now.toISOString(),
    entries: [...preserved, ...fresh].sort((a, b) =>
      a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
    ),
  };
}

/**
 * Diff a report against a baseline.
 *
 * Anything in the report but missing from the baseline is NEW (a missing or
 * empty baseline means every violation is new). Baseline entries with no
 * matching violation are RESOLVED and can be deleted from the baseline —
 * but only for components that were actually audited in this run. The CI
 * audit is scoped to changed components, so baseline entries for components
 * outside this run are reported as `unchecked`, not resolved.
 *
 * @param {object} report
 * @param {object|null|undefined} baseline
 * @returns {{newViolations: Array<object>, resolved: string[],
 *   unchecked: string[], matched: number}}
 */
function diffAgainstBaseline(report, baseline) {
  const current = collectViolations(report);
  const known = baselineKeySet(baseline);
  const currentKeys = new Set(current.map(v => v.key));
  // Every audited component gets a report entry, even with zero violations.
  const auditedComponents = new Set(
    Object.keys((report && report.components) || {}),
  );

  const newViolations = current.filter(v => !known.has(v.key));
  const resolved = [];
  const unchecked = [];
  for (const key of Array.from(known).sort()) {
    if (currentKeys.has(key)) continue;
    const component = key.split('::')[0];
    if (auditedComponents.has(component)) {
      resolved.push(key);
    } else {
      unchecked.push(key);
    }
  }

  return {
    newViolations,
    resolved,
    unchecked,
    matched: current.length - newViolations.length,
  };
}

/**
 * Render a human-readable gate summary for CI logs.
 *
 * @param {{newViolations: Array<object>, resolved: string[],
 *   unchecked?: string[], matched: number}} diff
 * @param {{baselinePath?: string}} [options]
 * @returns {string}
 */
function formatDiffSummary(
  diff,
  {baselinePath = '.github/a11y-baseline.json'} = {},
) {
  const lines = [];
  lines.push('');
  lines.push('=== Accessibility baseline gate ===');
  const unchecked = diff.unchecked || [];
  lines.push(
    `${diff.newViolations.length} new, ${diff.matched} baselined, ` +
      `${diff.resolved.length} resolved` +
      (unchecked.length > 0
        ? `, ${unchecked.length} baselined for components outside this run`
        : ''),
  );

  if (diff.newViolations.length > 0) {
    lines.push('');
    lines.push('NEW violations (not in baseline — these fail the build):');
    for (const v of diff.newViolations) {
      lines.push(
        `  ✗ [${v.impact}] ${v.ruleId} — ${v.component} / ${v.story}` +
          (v.nodes ? ` (${v.nodes} node${v.nodes === 1 ? '' : 's'})` : ''),
      );
      if (v.help) lines.push(`      ${v.help}`);
      if (v.helpUrl) lines.push(`      ${v.helpUrl}`);
    }
    lines.push('');
    lines.push('To reproduce locally:');
    lines.push('  pnpm storybook:build && npx playwright install chromium');
    lines.push('  pnpm a11y:audit -- --components <Component>');
    lines.push('');
    lines.push('Fix the violation if at all possible. If it is a known,');
    lines.push('intentional exception, add it to the baseline:');
    lines.push('  pnpm a11y:baseline -- --components <Component>');
    lines.push(
      `  (or hand-add the key to ${baselinePath} with a reviewer's blessing)`,
    );
  }

  if (diff.resolved.length > 0) {
    lines.push('');
    lines.push(
      'Resolved — these baseline entries no longer occur and can be removed ' +
        `from ${baselinePath}:`,
    );
    for (const key of diff.resolved) {
      lines.push(`  ✓ ${key}`);
    }
  }

  if (diff.newViolations.length === 0) {
    lines.push('');
    lines.push('No new accessibility violations. Gate passed.');
  }

  return lines.join('\n');
}

module.exports = {
  BASELINE_VERSION,
  violationKey,
  collectViolations,
  baselineKeySet,
  buildBaseline,
  diffAgainstBaseline,
  formatDiffSummary,
};
