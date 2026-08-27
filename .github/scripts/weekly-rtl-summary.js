#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Summarizes a full-suite RTL audit report for the weekly RTL
 *   scan workflow. Reads the JSON report produced by rtl-audit.mjs, writes a
 *   markdown summary (used for both the GitHub step summary and the tracking
 *   issue body), and emits step outputs (status, total_findings,
 *   components_audited, stories_scanned) so the workflow can decide whether to
 *   open-or-update the tracking issue and whether to fail the job.
 * @input --report <file> --audit-outcome <success|failure> --summary-output <file>
 *   [--github-output <file>]
 * @output Markdown summary file + GitHub Actions step outputs
 *
 * Status semantics:
 *   clean    — report present with zero findings
 *   findings — report present, at least one D1/D5/curated finding
 *   crashed  — no usable report (the audit died before writing one)
 *
 * Unlike accessibility-audit.js, rtl-audit.mjs exits non-zero on ANY finding,
 * so status comes from the report's contents; --audit-outcome is only used to
 * flag the contradictory case (step failed, report clean).
 */

const fs = require('node:fs');

const args = process.argv.slice(2);
const getArg = name => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const reportFile = getArg('report') || 'rtl-weekly-report.json';
const auditOutcome = getArg('audit-outcome') || 'success';
const summaryFile = getArg('summary-output') || 'rtl-weekly-summary.md';
const githubOutputFile = getArg('github-output');

// GitHub issue bodies max out at 65536 characters — leave headroom for the run
// link and footer the workflow appends after this summary.
const MAX_SUMMARY_CHARS = 60000;
// A full sweep can flag a lot at once; cap per-table rows so one bad day cannot
// blow the issue body. The artifact always has the complete list.
const MAX_ROWS = 50;

const BAD_ROLLUPS = new Set(['not-RTL', 'ERROR', 'MISSING-STORY']);

function readReport(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function failuresOf(section) {
  return (section?.results || []).filter(
    r => r.verdict === 'fail' || r.verdict === 'ERROR',
  );
}

function curatedFailuresOf(report) {
  return (report?.curated?.results || []).filter(r =>
    BAD_ROLLUPS.has(r.rollup),
  );
}

function countFindings(report) {
  return (
    failuresOf(report?.autoDiscovery).length +
    failuresOf(report?.positionalMirror).length +
    curatedFailuresOf(report).length
  );
}

function computeStatus(report) {
  if (!report || report.error) return 'crashed';
  if (!report.autoDiscovery && !report.positionalMirror) return 'crashed';
  return countFindings(report) > 0 ? 'findings' : 'clean';
}

function truncateRows(rows) {
  if (rows.length <= MAX_ROWS) return rows;
  return [
    ...rows.slice(0, MAX_ROWS),
    `| _…${rows.length - MAX_ROWS} more — see the \`rtl-weekly-report\` artifact_ | | | |`,
  ];
}

function buildSummary(report, status) {
  const lines = ['## Weekly full-suite RTL audit', ''];

  if (status === 'crashed') {
    lines.push(
      '**Status:** the audit did not produce a usable report — the audit ' +
        'script crashed or the Storybook build was missing. See the workflow ' +
        'run logs for details.',
    );
    if (report?.error) lines.push('', `Reported error: \`${report.error}\``);
    return lines.join('\n') + '\n';
  }

  const auto = report.autoDiscovery || {};
  const pm = report.positionalMirror || {};
  const curated = report.curated?.results || [];

  lines.push(
    `**Scope:** full component library, unfiltered — ${auto.total ?? 0} component(s) for D1, ` +
      `${pm.total ?? 0} core stories for D5 (${report.generatedAt || 'unknown'}).`,
    '',
    "PR CI (`ci.yml`'s `pr-rtl` job) only audits the components a PR touches. " +
      'Tokens, shared hooks, and icon primitives can regress RTL in components ' +
      'no PR modified, which is what this sweep covers.',
    '',
  );

  if (auditOutcome !== 'success' && status === 'clean') {
    lines.push(
      '**Note:** the audit step exited non-zero but the report records no ' +
        'findings. That combination is unexpected — check the run logs.',
      '',
    );
  }

  lines.push(
    `**D1 icon-mirror:** ${auto.pass ?? 0} pass · ${auto.fail ?? 0} not-RTL · ${auto.na ?? 0} N-A.`,
    `**D5 positional-mirror:** ${pm.pass ?? 0} pass · ${pm.fail ?? 0} FAIL · ${pm.na ?? 0} N-A (tolerance ${pm.tolerancePx ?? '?'}px).`,
    '',
  );

  const autoFails = failuresOf(auto);
  if (autoFails.length) {
    lines.push('### D1 — directional icons that do not mirror', '');
    lines.push(
      '| Component | Verdict | Detail |',
      '|-----------|---------|--------|',
    );
    lines.push(
      ...truncateRows(
        autoFails.map(
          c =>
            `| ${c.component} | ${c.verdict} | ${(c.notes || []).join('; ')} |`,
        ),
      ),
    );
    lines.push('');
  }

  const pmFails = failuresOf(pm);
  if (pmFails.length) {
    lines.push('### D5 — positioned elements on the wrong side in RTL', '');
    lines.push(
      '| Story | Element | LTR relCenterX | RTL relCenterX | Δ (px) |',
      '|-------|---------|----------------|----------------|--------|',
    );
    const rows = [];
    for (const c of pmFails) {
      for (const f of c.fails || []) {
        rows.push(
          `| ${c.storyId} | \`${f.cls || f.tag}\` | ${f.ltrRelCenterX} | ${f.rtlRelCenterX} (exp ~${f.expectedRtlCenterX}) | ${f.delta} |`,
        );
      }
      if (!(c.fails || []).length) {
        rows.push(
          `| ${c.storyId} | (error) | — | — | ${(c.notes || []).join('; ')} |`,
        );
      }
    }
    lines.push(...truncateRows(rows), '');
  }

  const curatedFails = curatedFailuresOf(report);
  if (curatedFails.length) {
    lines.push(
      '### Curated precision (D2 order / D3 behavior / D4 overlay)',
      '',
    );
    lines.push(
      '| Component | Rollup | Dimensions |',
      '|-----------|--------|------------|',
    );
    lines.push(
      ...truncateRows(
        curatedFails.map(c => {
          const dims =
            Object.entries(c.dims || {})
              .map(([k, v]) => `${k}:${v}`)
              .join(', ') || '—';
          return `| ${c.component} | ${c.rollup} | ${dims} |`;
        }),
      ),
    );
    lines.push('');
  }

  if (status === 'clean') {
    lines.push(
      `_No findings. ${curated.length} curated target(s) checked._`,
      '',
      'RTL-ready across the full library for every dimension the audit covers.',
      '',
    );
  }

  let summary = lines.join('\n');
  if (summary.length > MAX_SUMMARY_CHARS) {
    summary =
      summary.slice(0, MAX_SUMMARY_CHARS) +
      '\n\n_…summary truncated — download the `rtl-weekly-report` artifact for the full report._\n';
  }
  return summary;
}

function writeOutputs(status, report) {
  const outputs = [
    `status=${status}`,
    `total_findings=${report ? countFindings(report) : 0}`,
    `components_audited=${report?.autoDiscovery?.total ?? 0}`,
    `stories_scanned=${report?.positionalMirror?.total ?? 0}`,
  ];
  if (githubOutputFile)
    fs.appendFileSync(githubOutputFile, outputs.join('\n') + '\n');
  console.log(outputs.join('\n'));
}

const report = readReport(reportFile);
const status = computeStatus(report);
const summary = buildSummary(report, status);

fs.writeFileSync(summaryFile, summary);
writeOutputs(status, report);
console.log(`Summary written to ${summaryFile} (status: ${status})`);
