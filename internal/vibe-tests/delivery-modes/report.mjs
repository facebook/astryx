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
      const scoredRuns = runs.filter(run => !run.infrastructureFailure);
      const passed = scoredRuns.filter(
        run => run.evaluation?.render?.passed,
      ).length;
      const wall = metric(scoredRuns.map(run => run.runner?.durationMs));
      const tokens = metric(
        scoredRuns.map(run => {
          const input = run.runner?.usage?.inputTokens;
          const output = run.runner?.usage?.outputTokens;
          return input == null && output == null
            ? null
            : (input ?? 0) + (output ?? 0);
        }),
      );
      const cli = metric(scoredRuns.map(run => run.runner?.cliLookups));
      const adoption = metric(
        scoredRuns.map(run => run.evaluation?.render?.adoptionShare),
      );
      const hardCoded = metric(
        scoredRuns.map(run => run.evaluation?.source?.hardCodedStyleCount),
      );
      const themeDefinitions = metric(
        scoredRuns.map(run => run.evaluation?.source?.themeDefinitionCount),
      );
      const axe = metric(
        scoredRuns.map(run => run.evaluation?.accessibility?.violationCount),
      );
      const prompt = metric(
        scoredRuns.map(run => run.evaluation?.judge?.promptFulfillment),
      );
      const visual = metric(
        scoredRuns.map(run => run.evaluation?.judge?.visualQuality),
      );
      const typeErrors = metric(
        scoredRuns.map(run => run.evaluation?.typecheck?.errorCount),
      );
      const bestBeforeTimeoutPrompt = metric(
        scoredRuns.map(
          run => run.evaluation?.bestBeforeTimeout?.promptFulfillment,
        ),
      );
      const bestBeforeTimeoutVisual = metric(
        scoredRuns.map(run => run.evaluation?.bestBeforeTimeout?.visualQuality),
      );
      return {
        config,
        agent,
        attempts: runs.length,
        runs: scoredRuns.length,
        infrastructureFailures: runs.length - scoredRuns.length,
        judgeUnavailable: scoredRuns.filter(
          run => run.evaluation?.judge?.judgeUnavailable,
        ).length,
        passed,
        passRate: scoredRuns.length === 0 ? null : passed / scoredRuns.length,
        timeouts: scoredRuns.filter(run => run.runner?.timedOut).length,
        contextFailures: scoredRuns.filter(
          run => run.runner?.transcriptAudit?.passed === false,
        ).length,
        transcriptFlaggedRuns: scoredRuns.filter(
          run =>
            (run.runner?.transcriptAudit?.adjustedFindings?.length ?? 0) > 0,
        ).length,
        buildFailures: scoredRuns.filter(
          run => run.evaluation?.build?.passed === false,
        ).length,
        medianWallTimeMs: wall.value,
        medianTokens: tokens.value,
        medianCliLookups: cli.value,
        medianAdoptionShare: adoption.value,
        medianHardCodedStyles: hardCoded.value,
        medianThemeDefinitions: themeDefinitions.value,
        medianAxeViolations: axe.value,
        medianPromptFulfillment: prompt.value,
        medianVisualQuality: visual.value,
        medianTypeErrors: typeErrors.value,
        medianBestBeforeTimeoutPrompt: bestBeforeTimeoutPrompt.value,
        medianBestBeforeTimeoutVisual: bestBeforeTimeoutVisual.value,
        samples: {
          wall: wall.count,
          tokens: tokens.count,
          cli: cli.count,
          adoption: adoption.count,
          hardCoded: hardCoded.count,
          themeDefinitions: themeDefinitions.count,
          axe: axe.count,
          prompt: prompt.count,
          visual: visual.count,
          typeErrors: typeErrors.count,
          bestBeforeTimeoutPrompt: bestBeforeTimeoutPrompt.count,
          bestBeforeTimeoutVisual: bestBeforeTimeoutVisual.count,
        },
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
    'The same prompt battery and evaluator were used for every configuration. A build failure, runtime page error, or blank render contributes adoption, prompt-fulfillment, and visual-quality scores of 0 and remains in every scored median and pass-rate denominator. Infrastructure failures are classified separately, unscored, and retryable.',
    '',
    'TypeScript errors are reported for `react-build` as a non-gating quality metric; only `vite build` gates its render. Hard-coded values exclude comments and token/theme definitions, which have their own column. A timed-out run keeps primary scores at 0 and separately reports the last complete on-disk state as best-before-timeout. The visual judge receives an anonymized default-state screenshot plus up to four declared same-page states, each captured from a fresh load at the same viewport. Undeclared runs remain default-only, and the report preserves per-state visible evidence.',
    '',
    'Runner and launcher details come from the local profile and are identical across delivery configs. Strict transcript-audit findings fail a cell; adjusted findings remain visible without changing its score. Any judge crash, invalid result, or failed audit is retried once; exhausted attempts leave judge scores null and are reported. Runner and judge processes use the profile launcher, while project preparation and evaluation run host-side inside a mode-0700 private root.',
    '',
    '**Adoption is coarse.** Ancestor credit can include hand-rolled controls placed inside Astryx content slots. Use render, blind-judge, axe, hard-coded-style, theme-definition, and efficiency metrics as the primary comparison.',
    '',
    '| Config | Runner | Attempts | Scored | Infra | Judge unavailable | Pass | Timeouts | Strict audit | Adjusted audit | Wall | Tokens | CLI | Adoption (coarse) | Hard-coded | Theme defs | axe | Type errors | Prompt | Visual | Best-before timeout P/V |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ];
  for (const row of summary) {
    lines.push(
      `| ${row.config} | ${row.agent} | ${row.attempts} | ${row.runs} | ${row.infrastructureFailures} | ${row.judgeUnavailable} | ${percent(row.passRate)} | ${row.timeouts} | ${row.contextFailures} | ${row.transcriptFlaggedRuns} | ${metricText(seconds(row.medianWallTimeMs), row.samples.wall)} | ${metricText(formatNumber(row.medianTokens), row.samples.tokens)} | ${metricText(formatNumber(row.medianCliLookups), row.samples.cli)} | ${metricText(percent(row.medianAdoptionShare), row.samples.adoption)} | ${metricText(formatNumber(row.medianHardCodedStyles), row.samples.hardCoded)} | ${metricText(formatNumber(row.medianThemeDefinitions), row.samples.themeDefinitions)} | ${metricText(formatNumber(row.medianAxeViolations), row.samples.axe)} | ${metricText(formatNumber(row.medianTypeErrors), row.samples.typeErrors)} | ${metricText(formatNumber(row.medianPromptFulfillment), row.samples.prompt)} | ${metricText(formatNumber(row.medianVisualQuality), row.samples.visual)} | ${formatBestBefore(row)} |`,
    );
  }
  lines.push('', '## Transcript audit flags', '');
  const flaggedResults = results.filter(
    result =>
      result.runner?.transcriptAudit?.passed === false ||
      (result.runner?.transcriptAudit?.adjustedFindings?.length ?? 0) > 0,
  );
  if (flaggedResults.length === 0) {
    lines.push('None.', '');
  } else {
    for (const result of flaggedResults) {
      const audit = result.runner.transcriptAudit;
      lines.push(`- **${result.id}** — ${audit.classification}`);
      for (const finding of audit.findings) {
        lines.push(`  - ${finding.class}: ${finding.label}`);
      }
    }
    lines.push('');
  }
  lines.push('## Infrastructure failures', '');
  const infrastructureFailures = results.filter(
    result => result.infrastructureFailure,
  );
  if (infrastructureFailures.length === 0) {
    lines.push('None.', '');
  } else {
    for (const result of infrastructureFailures) {
      lines.push(
        `- **${result.id}** — ${result.infrastructureFailure.phase}: ${firstLine(result.infrastructureFailure.message)} (unscored; retryable)`,
      );
    }
    lines.push('');
  }
  lines.push('## Judge retries and failures', '');
  const retriedJudgments = results.filter(
    result =>
      (result.evaluation?.judge?.attempts?.length ?? 0) > 1 ||
      result.evaluation?.judge?.judgeUnavailable,
  );
  if (retriedJudgments.length === 0) {
    lines.push('None.', '');
  } else {
    for (const result of retriedJudgments) {
      const judgment = result.evaluation.judge;
      lines.push(
        `- **${result.id}** — ${judgment.judgeUnavailable ? 'unavailable' : 'recovered'} after ${judgment.attempts.length} attempts`,
      );
      for (const attempt of judgment.attempts) {
        lines.push(
          `  - attempt ${attempt.attempt}: ${attempt.error ? `${attempt.failureKind ?? 'failure'} — ${firstLine(attempt.error)}` : 'accepted'}`,
        );
      }
    }
    lines.push('');
  }
  lines.push('## Screenshots and per-state evidence', '');
  for (const promptId of [...new Set(results.map(result => result.promptId))]) {
    lines.push(`### ${promptId}`, '');
    for (const result of results.filter(run => run.promptId === promptId)) {
      const screenshots = screenshotsForResult(result);
      if (screenshots.length === 0) {
        lines.push(`- ${result.config} / ${result.agent}: no screenshot`);
        continue;
      }
      lines.push(`- **${result.config} / ${result.agent}**`);
      for (const screenshot of screenshots) {
        const evidence = stateEvidenceFor(result, screenshot.name);
        const image = screenshot.path
          ? `[screenshot](${path.relative(path.dirname(path.join(result.outputDir, 'report.md')), screenshot.path)})`
          : 'no screenshot';
        const captureFailure =
          screenshot.capture?.passed === false
            ? ` — capture failed${screenshot.capture.error ? `: ${screenshot.capture.error}` : ''}`
            : '';
        lines.push(
          `  - ${screenshot.name}: ${image}${captureFailure}${evidence ? ` — ${evidence.visibleEvidence}${evidence.concerns?.length ? `; concerns: ${evidence.concerns.join('; ')}` : ''}` : ''}`,
        );
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
<td>${escapeHtml(row.config)}</td><td>${escapeHtml(row.agent)}</td><td>${row.attempts}</td><td>${row.runs}</td><td>${row.infrastructureFailures}</td><td>${row.judgeUnavailable}</td><td>${percent(row.passRate)}</td>
<td>${row.timeouts}</td><td>${row.contextFailures}</td><td>${row.transcriptFlaggedRuns}</td><td>${metricText(seconds(row.medianWallTimeMs), row.samples.wall)}</td>
<td>${metricText(formatNumber(row.medianTokens), row.samples.tokens)}</td><td>${metricText(formatNumber(row.medianCliLookups), row.samples.cli)}</td>
<td>${metricText(percent(row.medianAdoptionShare), row.samples.adoption)}</td><td>${metricText(formatNumber(row.medianHardCodedStyles), row.samples.hardCoded)}</td>
<td>${metricText(formatNumber(row.medianThemeDefinitions), row.samples.themeDefinitions)}</td><td>${metricText(formatNumber(row.medianAxeViolations), row.samples.axe)}</td><td>${metricText(formatNumber(row.medianTypeErrors), row.samples.typeErrors)}</td>
<td>${metricText(formatNumber(row.medianPromptFulfillment), row.samples.prompt)}</td><td>${metricText(formatNumber(row.medianVisualQuality), row.samples.visual)}</td><td>${formatBestBefore(row)}</td>
</tr>`,
    )
    .join('\n');
  const grids = [];
  for (const promptId of promptIds) {
    const cards = [];
    for (const result of results.filter(run => run.promptId === promptId)) {
      const stateImages = screenshotsForResult(result)
        .map(screenshot => {
          const image =
            screenshot.path && fs.existsSync(screenshot.path)
              ? `<img loading="lazy" src="data:image/png;base64,${fs.readFileSync(screenshot.path).toString('base64')}" alt="${escapeHtml(promptId)} ${escapeHtml(result.config)} ${escapeHtml(result.agent)} ${escapeHtml(screenshot.name)}" />`
              : '<div class="missing">No screenshot</div>';
          const evidence = stateEvidenceFor(result, screenshot.name);
          const concerns = evidence?.concerns?.length
            ? `<p><strong>Concerns:</strong> ${escapeHtml(evidence.concerns.join('; '))}</p>`
            : '';
          const captureFailure =
            screenshot.capture?.passed === false
              ? `<p><strong>Capture failed:</strong> ${escapeHtml(screenshot.capture.error ?? 'state was blank or emitted runtime errors')}</p>`
              : '';
          return `<section class="state"><h4>${escapeHtml(screenshot.name)}</h4>${image}${captureFailure}${evidence ? `<p>${escapeHtml(evidence.visibleEvidence)}</p>${concerns}` : ''}</section>`;
        })
        .join('');
      const images = stateImages || '<div class="missing">No screenshot</div>';
      cards.push(`<article><h3>${escapeHtml(result.config)} · ${escapeHtml(result.agent)}</h3><div class="states">${images}</div><dl>
<dt>Status</dt><dd>${result.infrastructureFailure ? 'infrastructure failure' : result.evaluation?.render?.passed ? 'render pass' : 'render fail'}</dd>
<dt>Declared states</dt><dd>${Math.max(0, (result.evaluation?.render?.states?.length ?? 1) - 1)}</dd>
<dt>Adoption (coarse)</dt><dd>${percent(result.evaluation?.render?.adoptionShare)}</dd>
<dt>axe</dt><dd>${formatNumber(result.evaluation?.accessibility?.violationCount)}</dd>
<dt>Type errors</dt><dd>${formatNumber(result.evaluation?.typecheck?.errorCount)}</dd>
<dt>Hard-coded / theme defs</dt><dd>${formatNumber(result.evaluation?.source?.hardCodedStyleCount)} / ${formatNumber(result.evaluation?.source?.themeDefinitionCount)}</dd>
<dt>Prompt / visual</dt><dd>${formatNumber(result.evaluation?.judge?.promptFulfillment)} / ${formatNumber(result.evaluation?.judge?.visualQuality)}</dd>
<dt>Best before timeout</dt><dd>${formatNumber(result.evaluation?.bestBeforeTimeout?.promptFulfillment)} / ${formatNumber(result.evaluation?.bestBeforeTimeout?.visualQuality)}</dd>
</dl></article>`);
    }
    grids.push(
      `<section><h2>${escapeHtml(promptId)}</h2><div class="grid">${cards.join('\n')}</div></section>`,
    );
  }

  const flaggedResults = results.filter(
    result =>
      result.runner?.transcriptAudit?.passed === false ||
      (result.runner?.transcriptAudit?.adjustedFindings?.length ?? 0) > 0,
  );
  const transcriptAuditHtml =
    flaggedResults.length === 0
      ? '<p>None.</p>'
      : `<ul>${flaggedResults
          .map(result => {
            const audit = result.runner.transcriptAudit;
            const findings = audit.findings
              .map(
                finding =>
                  `<li>${escapeHtml(finding.class)}: ${escapeHtml(finding.label)}</li>`,
              )
              .join('');
            return `<li><strong>${escapeHtml(result.id)}</strong> — ${escapeHtml(audit.classification)}<ul>${findings}</ul></li>`;
          })
          .join('')}</ul>`;
  const infrastructureHtml = results.some(
    result => result.infrastructureFailure,
  )
    ? `<ul>${results
        .filter(result => result.infrastructureFailure)
        .map(
          result =>
            `<li><strong>${escapeHtml(result.id)}</strong> — ${escapeHtml(result.infrastructureFailure.phase)}: ${escapeHtml(firstLine(result.infrastructureFailure.message))} (unscored; retryable)</li>`,
        )
        .join('')}</ul>`
    : '<p>None.</p>';
  const judgeRetryHtml = results.some(
    result =>
      (result.evaluation?.judge?.attempts?.length ?? 0) > 1 ||
      result.evaluation?.judge?.judgeUnavailable,
  )
    ? `<ul>${results
        .filter(
          result =>
            (result.evaluation?.judge?.attempts?.length ?? 0) > 1 ||
            result.evaluation?.judge?.judgeUnavailable,
        )
        .map(result => {
          const judgment = result.evaluation.judge;
          return `<li><strong>${escapeHtml(result.id)}</strong> — ${judgment.judgeUnavailable ? 'unavailable' : 'recovered'} after ${judgment.attempts.length} attempts<ul>${judgment.attempts
            .map(
              attempt =>
                `<li>attempt ${attempt.attempt}: ${escapeHtml(attempt.error ? `${attempt.failureKind ?? 'failure'} — ${firstLine(attempt.error)}` : 'accepted')}</li>`,
            )
            .join('')}</ul></li>`;
        })
        .join('')}</ul>`
    : '<p>None.</p>';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Delivery-mode vibe test — ${escapeHtml(iterationId)}</title>
<style>
:root{color-scheme:light dark;font-family:Inter,system-ui,sans-serif}body{max-width:1800px;margin:auto;padding:24px;background:#f4f6f8;color:#18202a}h1,h2{letter-spacing:-.02em}p{max-width:90ch}table{border-collapse:collapse;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px #0002}th,td{padding:10px;border-bottom:1px solid #d9dee5;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}th:first-child,th:nth-child(2),td:first-child,td:nth-child(2){text-align:left}.table-wrap{overflow:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}article{background:white;border:1px solid #d9dee5;border-radius:12px;padding:12px;box-shadow:0 1px 4px #0001}article h3{margin:0 0 10px}.states{display:grid;gap:12px}.state{border-top:1px solid #d9dee5;padding-top:10px}.state:first-child{border-top:0;padding-top:0}.state h4{margin:0 0 8px}.state p{font-size:.875rem;margin:6px 0}img{width:100%;max-height:420px;object-fit:contain;object-position:top;background:#eef1f4;border-radius:8px}.missing{height:180px;display:grid;place-items:center;background:#eef1f4;border-radius:8px}dl{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:0}dt{font-weight:600}dd{margin:0;text-align:right}@media(prefers-color-scheme:dark){body{background:#111820;color:#e8edf2}table,article{background:#1b2530;border-color:#34404d}th,td,.state{border-color:#34404d}.missing,img{background:#10161d}}
</style></head><body>
<h1>Delivery-mode vibe test</h1>
<p>Iteration <code>${escapeHtml(iterationId)}</code>. Every config uses the same evaluator. Failed builds, runtime errors, and blank renders contribute 0 to adoption, prompt, and visual metrics and stay in every scored denominator. Infrastructure failures are unscored and retryable. Parenthetical <code>n</code> is the sample count for each median.</p>
<p>TypeScript diagnostics are non-gating. Comments are excluded from hard-coded scanning, and token/theme definitions are reported separately. Timed-out runs keep zero primary scores and expose their last complete screenshot under best-before-timeout. The blind judge sees an anonymized default-state screenshot plus up to four declared same-page states, each captured from a fresh load at the same viewport. Undeclared runs remain default-only, and each state retains visible evidence in this report. Runner and launcher details come from the local profile and remain identical across delivery configs. Strict audit findings fail a cell; adjusted findings are reported without changing its score. Any judge crash, invalid result, or failed audit is retried once; exhausted attempts leave scores null. Runner and judge processes use the profile launcher, while project preparation and evaluation run host-side inside a mode-0700 private root.</p>
<p><strong>Adoption is coarse.</strong> Ancestor credit can include hand-rolled controls inside Astryx content slots. Render, blind-judge, axe, hard-coded-style, theme-definition, and efficiency metrics lead the comparison.</p>
<div class="table-wrap"><table><thead><tr><th>Config</th><th>Runner</th><th>Attempts</th><th>Scored</th><th>Infra</th><th>Judge unavailable</th><th>Pass</th><th>Timeouts</th><th>Strict audit</th><th>Adjusted audit</th><th>Wall</th><th>Tokens</th><th>CLI</th><th>Adoption (coarse)</th><th>Hard-coded</th><th>Theme defs</th><th>axe</th><th>Type errors</th><th>Prompt</th><th>Visual</th><th>Best-before P/V</th></tr></thead><tbody>${rows}</tbody></table></div>
<section><h2>Transcript audit flags</h2>${transcriptAuditHtml}</section>
<section><h2>Infrastructure failures</h2>${infrastructureHtml}</section>
<section><h2>Judge retries and failures</h2>${judgeRetryHtml}</section>
${grids.join('\n')}
</body></html>\n`;
}

function screenshotsForResult(result) {
  const screenshots = Array.isArray(result.screenshots)
    ? result.screenshots.filter(
        screenshot =>
          screenshot &&
          typeof screenshot.name === 'string' &&
          typeof screenshot.path === 'string',
      )
    : result.screenshotPath && fs.existsSync(result.screenshotPath)
      ? [{name: 'default', path: result.screenshotPath}]
      : [];
  const captures = result.evaluation?.render?.states;
  if (!Array.isArray(captures)) {
    return screenshots;
  }
  return captures.map(capture => ({
    name: capture.name,
    path:
      screenshots.find(screenshot => screenshot.name === capture.name)?.path ??
      null,
    capture,
  }));
}

function stateEvidenceFor(result, stateName) {
  return result.evaluation?.judge?.stateEvidence?.find(
    evidence => evidence.state === stateName,
  );
}

function metric(values) {
  const numbers = values
    .filter(value => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (numbers.length === 0) {
    return {value: null, count: 0};
  }
  const middle = Math.floor(numbers.length / 2);
  return {
    value:
      numbers.length % 2 === 0
        ? (numbers[middle - 1] + numbers[middle]) / 2
        : numbers[middle],
    count: numbers.length,
  };
}

function firstLine(value) {
  return String(value).split('\n')[0];
}

function formatBestBefore(row) {
  const count = Math.max(
    row.samples.bestBeforeTimeoutPrompt,
    row.samples.bestBeforeTimeoutVisual,
  );
  if (count === 0) {
    return '—';
  }
  return `${formatNumber(row.medianBestBeforeTimeoutPrompt)} / ${formatNumber(row.medianBestBeforeTimeoutVisual)} (n=${count})`;
}

function metricText(value, count) {
  return `${value} (n=${count})`;
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
