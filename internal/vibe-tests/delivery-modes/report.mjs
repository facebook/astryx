// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';

const fsp = fs.promises;

export async function buildReports({outputDir, iterationId, results}) {
  const summary = summarize(results);
  const jsonPath = path.join(outputDir, 'report.json');
  const markdownPath = path.join(outputDir, 'report.md');
  const htmlPath = path.join(outputDir, 'report.html');
  await fsp.writeFile(
    jsonPath,
    `${JSON.stringify({iterationId, summary, results}, null, 2)}\n`,
  );
  await fsp.writeFile(
    markdownPath,
    markdownReport(iterationId, summary, results),
  );
  await fsp.writeFile(
    htmlPath,
    await htmlReport(iterationId, summary, results),
  );
  return {summary, jsonPath, markdownPath, htmlPath};
}

export function summarize(results) {
  const groups = new Map();
  for (const result of results) {
    const key = `${result.config}::${result.agent}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(result);
  }

  return [...groups.entries()]
    .map(([key, runs]) => {
      const [config, agent] = key.split('::');
      const passed = runs.filter(run => run.evaluation?.render?.passed).length;
      return {
        config,
        agent,
        runs: runs.length,
        passed,
        passRate: runs.length === 0 ? 0 : passed / runs.length,
        medianWallTimeMs: median(runs.map(run => run.runner?.durationMs)),
        medianTokens: median(
          runs.map(run => {
            const input = run.runner?.usage?.inputTokens;
            const output = run.runner?.usage?.outputTokens;
            return input == null && output == null
              ? null
              : (input ?? 0) + (output ?? 0);
          }),
        ),
        medianCliLookups: median(runs.map(run => run.runner?.cliLookups)),
        medianAdoptionShare: median(
          runs.map(run => run.evaluation?.render?.adoptionShare),
        ),
        medianHardCodedStyles: median(
          runs.map(run => run.evaluation?.source?.hardCodedStyleCount),
        ),
        medianAxeViolations: median(
          runs.map(run => run.evaluation?.accessibility?.violationCount),
        ),
        medianPromptFulfillment: median(
          runs.map(run => run.evaluation?.judge?.promptFulfillment),
        ),
        medianVisualQuality: median(
          runs.map(run => run.evaluation?.judge?.visualQuality),
        ),
      };
    })
    .sort((a, b) =>
      `${a.config}:${a.agent}`.localeCompare(`${b.config}:${b.agent}`),
    );
}

function markdownReport(iterationId, summary, results) {
  const lines = [
    `# Delivery-mode vibe test — ${iterationId}`,
    '',
    'The same prompt battery and evaluator were used for every configuration. The visual judge received only an anonymized screenshot and task prompt.',
    '',
    '| Config | Agent | Runs | Pass rate | Wall time | Tokens | CLI lookups | DS adoption | Hard-coded styles | axe | Prompt | Visual |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];
  for (const row of summary) {
    lines.push(
      `| ${row.config} | ${row.agent} | ${row.runs} | ${percent(row.passRate)} | ${seconds(row.medianWallTimeMs)} | ${formatNumber(row.medianTokens)} | ${formatNumber(row.medianCliLookups)} | ${percent(row.medianAdoptionShare)} | ${formatNumber(row.medianHardCodedStyles)} | ${formatNumber(row.medianAxeViolations)} | ${formatNumber(row.medianPromptFulfillment)} | ${formatNumber(row.medianVisualQuality)} |`,
    );
  }
  lines.push('', '## Screenshots', '');
  for (const promptId of [...new Set(results.map(result => result.promptId))]) {
    lines.push(`### ${promptId}`, '');
    for (const result of results.filter(run => run.promptId === promptId)) {
      if (result.screenshotPath && fs.existsSync(result.screenshotPath)) {
        lines.push(
          `- ${result.config} / ${result.agent}: [screenshot](${path.relative(path.dirname(path.join(result.outputDir, 'report.md')), result.screenshotPath)})`,
        );
      } else {
        lines.push(`- ${result.config} / ${result.agent}: no screenshot`);
      }
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

async function htmlReport(iterationId, summary, results) {
  const promptIds = [...new Set(results.map(result => result.promptId))];
  const rows = summary
    .map(
      row => `<tr>
<td>${escapeHtml(row.config)}</td><td>${escapeHtml(row.agent)}</td><td>${row.runs}</td>
<td>${percent(row.passRate)}</td><td>${seconds(row.medianWallTimeMs)}</td><td>${formatNumber(row.medianTokens)}</td>
<td>${formatNumber(row.medianCliLookups)}</td><td>${percent(row.medianAdoptionShare)}</td><td>${formatNumber(row.medianHardCodedStyles)}</td>
<td>${formatNumber(row.medianAxeViolations)}</td><td>${formatNumber(row.medianPromptFulfillment)}</td><td>${formatNumber(row.medianVisualQuality)}</td>
</tr>`,
    )
    .join('\n');
  const grids = [];
  for (const promptId of promptIds) {
    const cards = [];
    for (const result of results.filter(run => run.promptId === promptId)) {
      let image = '<div class="missing">No screenshot</div>';
      if (result.screenshotPath && fs.existsSync(result.screenshotPath)) {
        const bytes = await fsp.readFile(result.screenshotPath);
        image = `<img loading="lazy" src="data:image/png;base64,${bytes.toString('base64')}" alt="${escapeHtml(promptId)} ${escapeHtml(result.config)} ${escapeHtml(result.agent)}" />`;
      }
      cards.push(`<article><h3>${escapeHtml(result.config)} · ${escapeHtml(result.agent)}</h3>${image}<dl>
<dt>Render</dt><dd>${result.evaluation?.render?.passed ? 'pass' : 'fail'}</dd>
<dt>Adoption</dt><dd>${percent(result.evaluation?.render?.adoptionShare)}</dd>
<dt>axe</dt><dd>${formatNumber(result.evaluation?.accessibility?.violationCount)}</dd>
<dt>Prompt / visual</dt><dd>${formatNumber(result.evaluation?.judge?.promptFulfillment)} / ${formatNumber(result.evaluation?.judge?.visualQuality)}</dd>
</dl></article>`);
    }
    grids.push(
      `<section><h2>${escapeHtml(promptId)}</h2><div class="grid">${cards.join('\n')}</div></section>`,
    );
  }

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Delivery-mode vibe test — ${escapeHtml(iterationId)}</title>
<style>
:root{color-scheme:light dark;font-family:Inter,system-ui,sans-serif}body{max-width:1600px;margin:auto;padding:24px;background:#f4f6f8;color:#18202a}h1,h2{letter-spacing:-.02em}p{max-width:80ch}table{border-collapse:collapse;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px #0002}th,td{padding:10px;border-bottom:1px solid #d9dee5;text-align:right;font-variant-numeric:tabular-nums}th:first-child,th:nth-child(2),td:first-child,td:nth-child(2){text-align:left}.table-wrap{overflow:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}article{background:white;border:1px solid #d9dee5;border-radius:12px;padding:12px;box-shadow:0 1px 4px #0001}article h3{margin:0 0 10px}img{width:100%;max-height:420px;object-fit:contain;object-position:top;background:#eef1f4;border-radius:8px}.missing{height:180px;display:grid;place-items:center;background:#eef1f4;border-radius:8px}dl{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:0}dt{font-weight:600}dd{margin:0;text-align:right}@media(prefers-color-scheme:dark){body{background:#111820;color:#e8edf2}table,article{background:#1b2530;border-color:#34404d}th,td{border-color:#34404d}.missing,img{background:#10161d}}
</style></head><body>
<h1>Delivery-mode vibe test</h1><p>Iteration <code>${escapeHtml(iterationId)}</code>. Every configuration used the same prompt battery and evaluator. The visual judge received only an anonymized screenshot and the original task.</p>
<div class="table-wrap"><table><thead><tr><th>Config</th><th>Agent</th><th>Runs</th><th>Pass</th><th>Wall</th><th>Tokens</th><th>CLI</th><th>Adoption</th><th>Hard-coded</th><th>axe</th><th>Prompt</th><th>Visual</th></tr></thead><tbody>${rows}</tbody></table></div>
${grids.join('\n')}
</body></html>\n`;
}

function median(values) {
  const numbers = values
    .filter(value => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (numbers.length === 0) {
    return null;
  }
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0
    ? (numbers[middle - 1] + numbers[middle]) / 2
    : numbers[middle];
}

function percent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
}
function seconds(value) {
  return Number.isFinite(value) ? `${(value / 1000).toFixed(1)}s` : '—';
}
function formatNumber(value) {
  return Number.isFinite(value)
    ? Math.round(value).toLocaleString('en-US')
    : '—';
}
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
