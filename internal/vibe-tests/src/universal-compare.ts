#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Universal Compare — side-by-side comparison of two or three iterations
 *
 * Usage:
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456 --html ghi789
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456 --html ghi789 --xds-tailwind jkl012
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456 --json
 *   tsx src/universal-compare.ts --xds abc123 --baseline def456 --html ghi789 --markdown
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import type {
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
  TargetName,
} from './types.js';
import {writeJson, getResultsDir} from './utils.js';
import {getDimensionNames, getAverageScore} from './universal-eval.js';

const DIMENSION_LABELS: Partial<Record<UniversalDimension, string>> = {
  correctness: 'Correctness',
  accessibility: 'Accessibility',
  codeQuality: 'Code Quality',
  efficiency: 'Efficiency',
  maintainability: 'Maintainability',
  design: 'Design',
};

function loadOrGenerate(iterationId: string): UniversalAggregate {
  const universalPath = path.join(
    getResultsDir(),
    iterationId,
    'universal.json',
  );

  if (fs.existsSync(universalPath)) {
    return JSON.parse(fs.readFileSync(universalPath, 'utf-8'));
  }

  console.log(`⏳ Generating universal.json for ${iterationId}...`);
  const scriptPath = path.join(import.meta.dirname, 'universal-aggregate.ts');
  execSync(`npx tsx ${scriptPath} --iteration ${iterationId}`, {
    stdio: 'inherit',
    cwd: path.join(import.meta.dirname, '..'),
  });

  return JSON.parse(fs.readFileSync(universalPath, 'utf-8'));
}

type WinnerType = TargetName | 'tie';

function winner(
  xdsVal: number,
  baseVal: number,
  htmlVal?: number,
  xdsTailwindVal?: number,
): WinnerType {
  const entries: [TargetName, number][] = [
    ['xds', xdsVal],
    ['baseline', baseVal],
  ];
  if (htmlVal != null) {
    entries.push(['html', htmlVal]);
  }
  if (xdsTailwindVal != null) {
    entries.push(['xds-tailwind', xdsTailwindVal]);
  }

  const max = Math.max(...entries.map(([, v]) => v));
  const atMax = entries.filter(([, v]) => v === max);
  if (atMax.length > 1) {
    return 'tie';
  }
  return atMax[0][0];
}

function winnerIcon(w: WinnerType): string {
  switch (w) {
    case 'xds':
      return '🟢 XDS';
    case 'baseline':
      return '🔵 Base';
    case 'html':
      return '🟡 HTML';
    case 'xds-tailwind':
      return '🟣 XDS+TW';
    case 'tie':
      return '⚪ Tie';
  }
}

function parseArgs(): {
  xds: string;
  baseline: string;
  html?: string;
  xdsTailwind?: string;
  json: boolean;
  markdown: boolean;
} {
  const args = process.argv.slice(2);
  let xds = '';
  let baseline = '';
  let html: string | undefined;
  let xdsTailwind: string | undefined;
  let json = false;
  let markdown = false;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--xds' || args[i] === '-x') && args[i + 1]) {
      xds = args[++i];
    } else if ((args[i] === '--baseline' || args[i] === '-b') && args[i + 1]) {
      baseline = args[++i];
    } else if (args[i] === '--html' && args[i + 1]) {
      html = args[++i];
    } else if (args[i] === '--xds-tailwind' && args[i + 1]) {
      xdsTailwind = args[++i];
    } else if (args[i] === '--json') {
      json = true;
    } else if (args[i] === '--markdown' || args[i] === '--md') {
      markdown = true;
    }
  }

  if (!xds || !baseline) {
    console.error(
      'Usage: tsx src/universal-compare.ts --xds <id> --baseline <id> [--html <id>] [--xds-tailwind <id>] [--json] [--markdown]',
    );
    process.exit(1);
  }

  return {xds, baseline, html, xdsTailwind, json, markdown};
}

/**
 * Generate a GitHub-flavored markdown summary table.
 * Designed for pasting into GitHub issue bodies.
 */
function toMarkdown(opts: {
  comparison: UniversalComparison;
  xdsId: string;
  baselineId: string;
  htmlId?: string;
  xdsTailwindId?: string;
  byPrompt: UniversalComparison['byPrompt'];
}): string {
  const {comparison, xdsId, baselineId, htmlId, xdsTailwindId, byPrompt} = opts;
  const {
    xds,
    baseline,
    html: htmlData,
    xdsTailwind: twData,
    winners,
  } = comparison;
  const dimensions = getDimensionNames();
  const lines: string[] = [];

  lines.push(
    '| Target | Iteration | Overall | Correctness | Accessibility | Code Quality | Efficiency | Maintainability |',
  );
  lines.push(
    '|--------|-----------|---------|-------------|---------------|--------------|------------|-----------------|',
  );

  const dimOrder: UniversalDimension[] = [
    'correctness',
    'accessibility',
    'codeQuality',
    'efficiency',
    'maintainability',
  ];

  const xdsRow = dimOrder.map(d => xds.averages[d]).join(' | ');
  lines.push(`| **XDS** | \`${xdsId}\` | ${xds.overall} | ${xdsRow} |`);

  const baseRow = dimOrder.map(d => baseline.averages[d]).join(' | ');
  lines.push(
    `| **Baseline** | \`${baselineId}\` | ${baseline.overall} | ${baseRow} |`,
  );

  if (htmlData) {
    const htmlRow = dimOrder.map(d => htmlData.averages[d]).join(' | ');
    lines.push(
      `| **HTML** | \`${htmlId}\` | ${htmlData.overall} | ${htmlRow} |`,
    );
  }

  if (twData) {
    const twRow = dimOrder.map(d => twData.averages[d]).join(' | ');
    lines.push(
      `| **XDS+TW** | \`${xdsTailwindId}\` | ${twData.overall} | ${twRow} |`,
    );
  }

  lines.push('');

  // Per-prompt winners
  const promptEntries = Object.entries(byPrompt);
  if (promptEntries.length > 0) {
    let xWins = 0;
    let bWins = 0;
    let hWins = 0;
    let twWins = 0;
    let ties = 0;
    for (const [, data] of promptEntries) {
      if (data.winner === 'xds') {
        xWins++;
      } else if (data.winner === 'baseline') {
        bWins++;
      } else if (data.winner === 'html') {
        hWins++;
      } else if (data.winner === 'xds-tailwind') {
        twWins++;
      } else {
        ties++;
      }
    }
    const parts = [`XDS ${xWins}`, `Baseline ${bWins}`];
    if (htmlData) {
      parts.push(`HTML ${hWins}`);
    }
    if (twData) {
      parts.push(`XDS+TW ${twWins}`);
    }
    parts.push(`Tie ${ties}`);
    lines.push(
      `**Per-prompt wins:** ${parts.join(' · ')} (${promptEntries.length} prompts)`,
    );
    lines.push('');
  }

  // Dark mode
  const dmParts = [
    `XDS ${xds.darkModeRate}%`,
    `Baseline ${baseline.darkModeRate}%`,
  ];
  if (htmlData) {
    dmParts.push(`HTML ${htmlData.darkModeRate}%`);
  }
  if (twData) {
    dmParts.push(`XDS+TW ${twData.darkModeRate}%`);
  }
  lines.push(`**Dark mode:** ${dmParts.join(' · ')}`);

  // Dimension winners
  lines.push('');
  lines.push('**Dimension winners:**');
  for (const d of dimensions) {
    const w = winners[d];
    const iconMap: Record<string, string> = {
      xds: '🟢',
      baseline: '🔵',
      html: '🟡',
      'xds-tailwind': '🟣',
      tie: '⚪',
    };
    const icon = iconMap[w] ?? '⚪';
    const label = DIMENSION_LABELS[d] || d;
    lines.push(`- ${label}: ${icon} ${w === 'tie' ? 'Tie' : w.toUpperCase()}`);
  }

  return lines.join('\n');
}

async function main() {
  const {
    xds: xdsId,
    baseline: baselineId,
    html: htmlId,
    xdsTailwind: xdsTailwindId,
    json,
    markdown,
  } = parseArgs();

  const xds = loadOrGenerate(xdsId);
  const baseline = loadOrGenerate(baselineId);
  const htmlData = htmlId ? loadOrGenerate(htmlId) : undefined;
  const twData = xdsTailwindId ? loadOrGenerate(xdsTailwindId) : undefined;

  const dimensions = getDimensionNames();
  const isThreeWay = !!htmlData;
  const isFourWay = !!twData;

  // Build comparison
  const winnersInit = {};
  const winners = winnersInit as Record<UniversalDimension, WinnerType>;
  for (const d of dimensions) {
    winners[d] = winner(
      xds.averages[d],
      baseline.averages[d],
      htmlData?.averages[d],
      twData?.averages[d],
    );
  }

  // Per-prompt comparison
  const allPromptIds = new Set([
    ...Object.keys(xds.byPrompt),
    ...Object.keys(baseline.byPrompt),
    ...(htmlData ? Object.keys(htmlData.byPrompt) : []),
    ...(twData ? Object.keys(twData.byPrompt) : []),
  ]);

  const byPrompt: UniversalComparison['byPrompt'] = {};
  for (const promptId of allPromptIds) {
    const xdsScore = xds.byPrompt[promptId];
    const baselineScore = baseline.byPrompt[promptId];
    const htmlScore = htmlData?.byPrompt[promptId];
    const twScore = twData?.byPrompt[promptId];
    if (xdsScore && baselineScore) {
      byPrompt[promptId] = {
        xds: xdsScore,
        baseline: baselineScore,
        ...(htmlScore ? {html: htmlScore} : {}),
        ...(twScore ? {xdsTailwind: twScore} : {}),
        winner: winner(
          getAverageScore(xdsScore),
          getAverageScore(baselineScore),
          htmlScore ? getAverageScore(htmlScore) : undefined,
          twScore ? getAverageScore(twScore) : undefined,
        ),
      };
    }
  }

  const comparison: UniversalComparison = {
    xds,
    baseline,
    ...(htmlData ? {html: htmlData} : {}),
    ...(twData ? {xdsTailwind: twData} : {}),
    winners,
    byPrompt,
  };

  // Save — include all IDs in filename for uniqueness
  const idParts = [xdsId, baselineId];
  if (htmlId) {
    idParts.push(htmlId);
  }
  if (xdsTailwindId) {
    idParts.push(xdsTailwindId);
  }
  const outputFilename = `comparison-${idParts.join('-')}.json`;
  const outputPath = path.join(getResultsDir(), outputFilename);
  writeJson(outputPath, comparison);

  if (json) {
    console.log(JSON.stringify(comparison, null, 2));
    return;
  }

  if (markdown) {
    console.log(
      toMarkdown({
        comparison,
        xdsId,
        baselineId,
        htmlId,
        xdsTailwindId,
        byPrompt,
      }),
    );
    return;
  }

  // --- Print report ---
  const targetNames = ['XDS', 'Baseline'];
  if (isThreeWay) {
    targetNames.push('HTML');
  }
  if (isFourWay) {
    targetNames.push('XDS+TW');
  }

  const title = `📊 Universal Comparison: ${targetNames.join(' vs ')}`;
  console.log(`\n${title}`);
  console.log('═'.repeat(title.length + 2));

  // Build a generic table for any number of targets
  type TargetEntry = {label: string; data: typeof xds};
  const targets: TargetEntry[] = [
    {label: 'XDS', data: xds},
    {label: 'Baseline', data: baseline},
  ];
  if (isThreeWay && htmlData != null) {
    targets.push({label: 'HTML', data: htmlData});
  }
  if (isFourWay && twData != null) {
    targets.push({label: 'XDS+TW', data: twData});
  }

  // Use markdown-style table for CLI (simpler than box-drawing for N targets)
  const header = ['Dimension', ...targets.map(t => t.label), 'Winner'];
  const rows: string[][] = [];
  for (const d of dimensions) {
    const row = [
      DIMENSION_LABELS[d] || d,
      ...targets.map(t => String(t.data.averages[d])),
      winnerIcon(winners[d]),
    ];
    rows.push(row);
  }
  // Overall row
  const overallWinner = winner(
    xds.overall,
    baseline.overall,
    htmlData?.overall,
    twData?.overall,
  );
  rows.push([
    'Overall',
    ...targets.map(t => String(t.data.overall)),
    winnerIcon(overallWinner),
  ]);

  // Compute column widths and print
  const allRows = [header, ...rows];
  const colWidths = header.map((_, ci) =>
    Math.max(...allRows.map(r => r[ci].length)),
  );
  const sep = colWidths.map(w => '─'.repeat(w + 2)).join('┼');
  console.log('┌' + sep.replaceAll('┼', '┬') + '┐');
  console.log(
    '│' + header.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join('│') + '│',
  );
  console.log('├' + sep + '┤');
  for (let ri = 0; ri < rows.length; ri++) {
    if (ri === rows.length - 1) {
      console.log('├' + sep + '┤');
    }
    console.log(
      '│' +
        rows[ri].map((c, i) => ` ${c.padEnd(colWidths[i])} `).join('│') +
        '│',
    );
  }
  console.log('└' + sep.replaceAll('┼', '┴') + '┘');

  // Dark mode
  const dmParts = targets.map(t => `${t.label} ${t.data.darkModeRate}%`);
  console.log(`\n🌙 Dark Mode: ${dmParts.join(' | ')}`);

  // Efficiency metrics comparison
  const targetEffMetrics = targets.map(t => ({
    label: t.label,
    metrics: Object.values(t.data.byPrompt)
      .map(s => s.efficiency.metrics)
      .filter(<T>(m: T | undefined): m is T => m != null),
  }));
  if (targetEffMetrics.every(t => t.metrics.length > 0)) {
    const avgDpe = targetEffMetrics.map(
      t =>
        t.metrics.reduce((s, m) => s + m.decisionsPerElement, 0) /
        t.metrics.length,
    );
    const avgLines = targetEffMetrics.map(
      t => t.metrics.reduce((s, m) => s + m.codeLines, 0) / t.metrics.length,
    );
    console.log(`\n⚡ Efficiency Metrics:`);
    // For decisions/element, lower is better (reverse args for winner)
    const dpeParts = targetEffMetrics.map(
      (t, i) => `${t.label} ${avgDpe[i].toFixed(1)}`,
    );
    console.log(`   Decisions/element: ${dpeParts.join(' | ')}`);
    const linesParts = targetEffMetrics.map(
      (t, i) => `${t.label} ${Math.round(avgLines[i])}`,
    );
    console.log(`   Avg code lines:   ${linesParts.join(' | ')}`);
  }

  // Maintainability metrics comparison
  const targetMaintMetrics = targets.map(t => ({
    label: t.label,
    metrics: Object.values(t.data.byPrompt)
      .map(s => s.maintainability.metrics)
      .filter(<T>(m: T | undefined): m is T => m != null),
  }));
  if (targetMaintMetrics.every(t => t.metrics.length > 0)) {
    const avgSem = targetMaintMetrics.map(
      t =>
        t.metrics.reduce((s, m) => s + m.semanticRatio, 0) / t.metrics.length,
    );
    const totalMagic = targetMaintMetrics.map(t =>
      t.metrics.reduce((s, m) => s + m.magicValueCount, 0),
    );
    console.log(`\n🔧 Maintainability Metrics:`);
    const semParts = targetMaintMetrics.map(
      (t, i) => `${t.label} ${(avgSem[i] * 100).toFixed(0)}%`,
    );
    console.log(`   Semantic ratio:   ${semParts.join(' | ')}`);
    const magicParts = targetMaintMetrics.map(
      (t, i) => `${t.label} ${totalMagic[i]}`,
    );
    console.log(`   Magic values:     ${magicParts.join(' | ')}`);
  }

  // Cost comparison
  if (xds.cost && baseline.cost) {
    console.log(`\n💰 Cost:`);
    const costTargets = targets.filter(t => t.data.cost);
    const hasDuration = costTargets.some(
      t => (t.data.cost?.avgDurationMs ?? 0) > 0,
    );
    if (hasDuration) {
      const durParts = costTargets.map(
        t =>
          `${t.label} ${((t.data.cost?.avgDurationMs ?? 0) / 1000).toFixed(1)}s`,
      );
      console.log(`   Avg duration:     ${durParts.join(' | ')}`);
    }
    const linesParts = costTargets.map(
      t => `${t.label} ${t.data.cost?.avgOutputLines ?? 0}`,
    );
    console.log(`   Avg output lines: ${linesParts.join(' | ')}`);
    const docsParts = costTargets.map(
      t => `${t.label} ${t.data.cost?.avgDocsRead ?? 0}`,
    );
    console.log(`   Avg docs read:    ${docsParts.join(' | ')}`);
    const tokenParts = costTargets.map(t => {
      const total =
        (t.data.cost?.estimatedInputTokens ?? 0) +
        (t.data.cost?.estimatedOutputTokens ?? 0);
      return `${t.label} ~${total}`;
    });
    console.log(`   Est. tokens:      ${tokenParts.join(' | ')}`);
  }

  // Per-prompt wins
  const promptEntries = Object.entries(byPrompt);
  if (promptEntries.length > 0) {
    const winCounts: Record<string, number> = {};
    for (const t of targets) {
      winCounts[t.label] = 0;
    }
    winCounts['Tie'] = 0;
    for (const [, data] of promptEntries) {
      if (data.winner === 'xds') {
        winCounts['XDS']++;
      } else if (data.winner === 'baseline') {
        winCounts['Baseline']++;
      } else if (data.winner === 'html') {
        winCounts['HTML']++;
      } else if (data.winner === 'xds-tailwind') {
        winCounts['XDS+TW']++;
      } else {
        winCounts['Tie']++;
      }
    }
    const parts = targets.map(t => `${t.label} wins ${winCounts[t.label]}`);
    parts.push(`Ties ${winCounts['Tie']}`);
    console.log(
      `\n📝 Per-Prompt: ${parts.join(' | ')} (${promptEntries.length} prompts)`,
    );
  }

  console.log(`\nSaved: ${outputPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
