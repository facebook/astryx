#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compose the protected-main quality report and commit-status projection.
 * @input Suite reports from the protected-main quality workflow.
 * @output A self-contained report directory and status payload.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const STATUS_CONTEXT = 'protected-main-quality';
const CLEAN = new Set(['pass', 'clean']);
const MAX_DESCRIPTION = 140;

function arg(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function bool(value) {
  return String(value ?? '').toLowerCase() === 'true';
}

function readJSON(file) {
  if (!file) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readText(file) {
  if (!file) return '';
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function copyIfPresent(source, destination) {
  if (!fs.existsSync(source)) return false;
  fs.rmSync(destination, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.cpSync(source, destination, {recursive: true});
  return true;
}

function writeOutput(file, values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  if (file) fs.appendFileSync(file, `${lines.join('\n')}\n`);
  process.stdout.write(`${lines.join('\n')}\n`);
}

function html(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function markdownToHtml(markdown) {
  if (!markdown) return '<p>No summary was produced.</p>';
  const lines = markdown.trim().split(/\r?\n/);
  const out = [];
  let inTable = false;
  let inList = false;
  let inPre = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      out.push(inPre ? '</code></pre>' : '<pre><code>');
      inPre = !inPre;
      continue;
    }
    if (inPre) {
      out.push(`${html(line)}\n`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inTable) out.push('</tbody></table>');
      if (inList) out.push('</ul>');
      inTable = false;
      inList = false;
      out.push(`<h2>${html(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inTable) out.push('</tbody></table>');
      if (inList) out.push('</ul>');
      inTable = false;
      inList = false;
      out.push(`<h3>${html(line.slice(4))}</h3>`);
    } else if (line.startsWith('|') && line.endsWith('|')) {
      if (line.replace(/[|\-: ]/g, '') === '') continue;
      const cells = line
        .slice(1, -1)
        .split('|')
        .map(cell => html(cell.trim()));
      if (!inTable) {
        if (inList) out.push('</ul>');
        inList = false;
        out.push('<table><tbody>');
        inTable = true;
      }
      out.push(`<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`);
    } else if (line.startsWith('- ')) {
      if (inTable) out.push('</tbody></table>');
      inTable = false;
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${html(line.slice(2))}</li>`);
    } else if (line.trim() === '') {
      if (inTable) {
        out.push('</tbody></table>');
        inTable = false;
      }
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
    } else {
      if (inTable) out.push('</tbody></table>');
      if (inList) out.push('</ul>');
      inTable = false;
      inList = false;
      out.push(`<p>${html(line)}</p>`);
    }
  }
  if (inTable) out.push('</tbody></table>');
  if (inList) out.push('</ul>');
  if (inPre) out.push('</code></pre>');
  return out.join('\n');
}

function summarizeVisual(verdict) {
  if (!verdict)
    return {status: 'crashed', details: 'No visual verdict was produced.'};
  const counts = verdict.counts ?? {};
  const bits = [
    `${counts.total ?? 0} shot(s)`,
    `${counts.changed ?? 0} changed`,
    `${counts.added ?? 0} added`,
    `${counts.removed ?? 0} removed`,
    `${counts.failed ?? 0} failed`,
  ];
  return {status: verdict.status ?? 'crashed', details: bits.join(' · ')};
}

function a11yIntegrity(report) {
  const summary = report?.summary;
  if (!summary || summary.scanStatus !== 'complete') {
    return {ok: false, reason: 'scan did not complete'};
  }
  if (summary.indexStatus !== 'parsed') {
    return {ok: false, reason: 'Storybook index was not parsed'};
  }
  if (
    !Number.isSafeInteger(summary.expectedStories) ||
    summary.expectedStories <= 0
  ) {
    return {ok: false, reason: 'no eligible stories were found'};
  }
  for (const field of [
    'auditedStories',
    'failedStories',
    'resultStories',
    'uniqueResultStories',
  ]) {
    if (!Number.isSafeInteger(summary[field])) {
      return {ok: false, reason: `${field} is missing`};
    }
  }
  if (summary.failedStories !== 0) {
    return {ok: false, reason: `${summary.failedStories} story/stories failed`};
  }
  if (summary.auditedStories !== summary.expectedStories) {
    return {ok: false, reason: 'audited story count does not match expected'};
  }
  if (
    summary.resultStories !== summary.expectedStories ||
    summary.uniqueResultStories !== summary.expectedStories
  ) {
    return {ok: false, reason: 'per-story result integrity mismatch'};
  }
  const seen = new Set();
  let details = 0;
  for (const [componentName, component] of Object.entries(
    report.components || {},
  )) {
    const storyDetails = component.storyDetails;
    if (!Array.isArray(storyDetails)) {
      return {ok: false, reason: `${componentName} has no story details`};
    }
    if (component.storiesAudited !== storyDetails.length) {
      return {ok: false, reason: `${componentName} story count mismatch`};
    }
    for (const story of storyDetails) {
      if (!story?.id || !Array.isArray(story.violations)) {
        return {
          ok: false,
          reason: `${componentName} has malformed story result`,
        };
      }
      if (seen.has(story.id)) {
        return {ok: false, reason: `duplicate story result ${story.id}`};
      }
      seen.add(story.id);
      details++;
    }
  }
  if (
    details !== summary.resultStories ||
    seen.size !== summary.uniqueResultStories
  ) {
    return {ok: false, reason: 'reported story totals do not match details'};
  }
  return {ok: true, reason: 'complete'};
}

function summarizeA11y(report, fallbackStatus) {
  if (!report || report.error) {
    return {status: 'crashed', details: 'No usable a11y report was produced.'};
  }
  const integrity = a11yIntegrity(report);
  if (!integrity.ok) {
    return {
      status: 'crashed',
      details: `${integrity.reason}; ${report.summary?.auditedStories ?? 0}/${report.summary?.expectedStories ?? 0} story/stories audited`,
    };
  }
  const violations = report.summary?.totalViolations ?? 0;
  const components = report.summary?.componentsAudited ?? 0;
  return {
    status: fallbackStatus || (violations > 0 ? 'violations' : 'clean'),
    details: `${violations} violation(s) across ${components} component(s)`,
    violations,
  };
}

function summarizeRtl(report, fallbackStatus) {
  if (!report || report.error)
    return {status: 'crashed', details: 'No usable RTL report was produced.'};
  const auto = report.autoDiscovery ?? {};
  const positional = report.positionalMirror ?? {};
  const curated = report.curated?.results ?? [];
  const findings =
    (auto.results ?? []).filter(
      r => r.verdict === 'fail' || r.verdict === 'ERROR',
    ).length +
    (positional.results ?? []).filter(
      r => r.verdict === 'fail' || r.verdict === 'ERROR',
    ).length +
    curated.filter(r =>
      ['not-RTL', 'ERROR', 'MISSING-STORY'].includes(r.rollup),
    ).length;
  return {
    status: fallbackStatus || (findings > 0 ? 'findings' : 'clean'),
    details: `${findings} finding(s); ${auto.total ?? 0} D1 component(s), ${positional.total ?? 0} D5 story/stories`,
    findings,
  };
}

export function summarizeForcedColors(report, outcome = 'success') {
  if (!report)
    return {status: 'crashed', details: 'No Vitest report was produced.'};
  const failed = Number(report.numFailedTests ?? 0);
  const passed = Number(report.numPassedTests ?? 0);
  const total = passed + failed;
  const status =
    total === 0
      ? 'crashed'
      : outcome === 'success' && failed === 0
        ? 'clean'
        : failed > 0
          ? 'failed'
          : 'crashed';
  return {
    status,
    details: `${passed}/${total} matching test(s) passed`,
    failed,
    passed,
    total,
  };
}

export function aggregateVerdict(suites) {
  const statuses = Object.values(suites).map(suite => suite.status);
  if (statuses.some(status => status === 'crashed')) return 'crashed';
  return statuses.every(status => CLEAN.has(status)) ? 'clean' : 'debt';
}

export function buildCommitStatus(report, {publicationState = 'success'} = {}) {
  if (publicationState !== 'success') {
    return {
      state: 'failure',
      context: STATUS_CONTEXT,
      description: 'Protected-main quality report publication failed.',
      target_url: report.runUrl,
    };
  }

  const verdict = report.aggregate.verdict;
  const clean = verdict === 'clean';
  const state = report.shadowMode || clean ? 'success' : 'failure';
  const prefix = report.shadowMode ? 'Shadow' : 'Enforced';
  const parts = Object.entries(report.suites)
    .filter(([, suite]) => suite.status !== 'clean' && suite.status !== 'pass')
    .map(([name, suite]) => `${name}: ${suite.status}`);
  const tail = parts.length ? parts.join(' · ') : 'all suites clean';
  let description = `${prefix}: ${tail}`;
  if (description.length > MAX_DESCRIPTION) {
    description = `${description.slice(0, MAX_DESCRIPTION - 1)}…`;
  }
  return {
    state,
    context: STATUS_CONTEXT,
    description,
    target_url: report.reportUrl,
  };
}

function buildReport({
  sha,
  runId,
  runUrl,
  reportUrl,
  shadowMode,
  visualVerdict,
  a11yReport,
  a11yStatus,
  rtlReport,
  rtlStatus,
  forcedColorsReport,
  forcedColorsOutcome,
}) {
  const suites = {
    visual: summarizeVisual(visualVerdict),
    accessibility: summarizeA11y(a11yReport, a11yStatus),
    rtl: summarizeRtl(rtlReport, rtlStatus),
    forcedColors: summarizeForcedColors(
      forcedColorsReport,
      forcedColorsOutcome,
    ),
  };
  return {
    version: 1,
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    sha,
    runId,
    runUrl,
    reportUrl,
    shadowMode,
    rollout: {
      switch:
        'QUALITY_SHADOW_MODE in .github/workflows/protected-main-quality.yml',
      criteria:
        'After one clean run on the current main SHA, set QUALITY_SHADOW_MODE=false and add the protected-main-quality status context to the main branch required checks.',
      dependency:
        'Visual baseline ownership and pruning remain in #5608; this workflow only reads the existing baseline.',
    },
    suites,
    aggregate: {verdict: aggregateVerdict(suites)},
  };
}

function buildHtml(report, summaries) {
  const rows = Object.entries(report.suites)
    .map(
      ([name, suite]) =>
        `<tr><td>${html(name)}</td><td><strong>${html(suite.status)}</strong></td><td>${html(suite.details)}</td></tr>`,
    )
    .join('\n');
  const summarySections = Object.entries(summaries)
    .map(
      ([name, markdown]) =>
        `<section><h2>${html(name)}</h2>${markdownToHtml(markdown)}</section>`,
    )
    .join('\n');
  const visualLink = [
    '<p><a href="visual-report/">Open visual diff report</a></p>',
    '<p><a href="visual-capture/">Open complete visual capture artifact</a></p>',
  ].join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protected main quality</title>
<style>
body{font:16px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;margin:2rem;max-width:1100px;color:#1f2328}
table{border-collapse:collapse;width:100%;margin:1rem 0}td,th{border:1px solid #d0d7de;padding:.45rem;text-align:left;vertical-align:top}code,pre{background:#f6f8fa;border-radius:6px}pre{padding:1rem;overflow:auto}.badge{display:inline-block;padding:.2rem .5rem;border-radius:999px;background:#fff4ce}.clean{background:#dafbe1}.debt{background:#fff4ce}.crashed{background:#ffebe9}
</style>
</head>
<body>
<h1>Protected main quality <span class="badge ${html(report.aggregate.verdict)}">${html(report.aggregate.verdict)}</span></h1>
<p><strong>Mode:</strong> ${report.shadowMode ? 'shadow — non-blocking' : 'enforced'} · <strong>Main SHA:</strong> <code>${html(report.sha)}</code> · <a href="${html(report.runUrl)}">workflow run</a></p>
<table><thead><tr><th>Suite</th><th>Verdict</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table>
${visualLink}
<h2>Rollout</h2>
<p>${html(report.rollout.criteria)}</p>
<p>${html(report.rollout.dependency)}</p>
${summarySections}
</body>
</html>
`;
}

export function stageVisualResult({sourceDir, outDir, summaryFile}) {
  const source = path.resolve(sourceDir);
  const out = path.resolve(outDir);
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(path.join(out, 'capture'), {recursive: true});
  const copied = [
    copyIfPresent(
      path.join(source, 'verdict.json'),
      path.join(out, 'verdict.json'),
    ),
    copyIfPresent(
      path.join(source, 'verdict.json'),
      path.join(out, 'capture', 'verdict.json'),
    ),
    copyIfPresent(
      path.join(source, 'manifest.json'),
      path.join(out, 'capture', 'manifest.json'),
    ),
    copyIfPresent(
      path.join(source, 'shots'),
      path.join(out, 'capture', 'shots'),
    ),
    copyIfPresent(path.join(source, 'report'), path.join(out, 'report')),
  ];
  if (summaryFile) copyIfPresent(summaryFile, path.join(out, 'summary.md'));
  return copied.some(Boolean);
}

function compose() {
  const outDir = path.resolve(arg('out-dir', 'main-quality-report'));
  const report = buildReport({
    sha: arg('sha', ''),
    runId: arg('run-id', ''),
    runUrl: arg('run-url', ''),
    reportUrl: arg('report-url', ''),
    shadowMode: bool(arg('shadow-mode', 'true')),
    visualVerdict: readJSON(arg('visual-verdict')),
    a11yReport: readJSON(arg('a11y-report')),
    a11yStatus: arg('a11y-status'),
    rtlReport: readJSON(arg('rtl-report')),
    rtlStatus: arg('rtl-status'),
    forcedColorsReport: readJSON(arg('forced-colors-report')),
    forcedColorsOutcome: arg('forced-colors-outcome', 'success'),
  });
  fs.mkdirSync(outDir, {recursive: true});
  writeJSON(path.join(outDir, 'main-quality.json'), report);

  const summaries = {
    visual: readText(arg('visual-summary')),
    accessibility: readText(arg('a11y-summary')),
    rtl: readText(arg('rtl-summary')),
    'forced colors':
      readText(arg('forced-colors-summary')) ||
      readText(arg('forced-colors-log')),
  };
  fs.writeFileSync(
    path.join(outDir, 'index.html'),
    buildHtml(report, summaries),
  );
  const stepSummary = [
    `## Protected main quality: ${report.aggregate.verdict}`,
    '',
    `Exact main SHA: \`${report.sha}\``,
    `Report: ${report.reportUrl}`,
    '',
    '| suite | verdict | details |',
    '|---|---|---|',
    ...Object.entries(report.suites).map(
      ([name, suite]) => `| ${name} | ${suite.status} | ${suite.details} |`,
    ),
    '',
    `Mode: ${report.shadowMode ? 'shadow — suite debt does not fail the status' : 'enforced'}.`,
    `Rollout: ${report.rollout.criteria}`,
    `Dependency: ${report.rollout.dependency}`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'summary.md'), stepSummary);
  process.stdout.write(stepSummary);
}

function forcedColorsSummary() {
  const report = readJSON(arg('report'));
  const summary = summarizeForcedColors(report, arg('outcome', 'success'));
  const lines = [
    '## Forced-colors suite',
    '',
    `**Status:** ${summary.status}`,
    '',
    `Vitest: ${summary.details}.`,
    '',
  ];
  fs.writeFileSync(
    arg('summary-output', 'forced-colors-summary.md'),
    lines.join('\n'),
  );
  writeOutput(arg('github-output'), {
    status: summary.status,
    total_tests: summary.total ?? 0,
    failed_tests: summary.failed ?? 0,
  });
}

function statusCommand() {
  const report = readJSON(arg('report'));
  if (!report) throw new Error('--report must name a valid report JSON file');
  const status = buildCommitStatus(report, {
    publicationState: arg('publication-state', 'success'),
  });
  writeJSON(arg('output', 'commit-status.json'), status);
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
}

async function main() {
  const command = process.argv[2];
  if (command === 'compose') return compose();
  if (command === 'stage-visual') {
    stageVisualResult({
      sourceDir: arg('source', '.visual-run'),
      outDir: arg('out-dir', 'visual-result'),
      summaryFile: arg('summary'),
    });
    return;
  }
  if (command === 'forced-colors-summary') return forcedColorsSummary();
  if (command === 'status') return statusCommand();
  throw new Error(
    'usage: main-quality-report.mjs <compose|stage-visual|forced-colors-summary|status>',
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
