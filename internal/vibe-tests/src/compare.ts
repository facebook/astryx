#!/usr/bin/env tsx
/**
 * @file Comparison Report Generator
 * @description Generates side-by-side comparison of XDS vs baseline quality assessments
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests compare --xds <id> --baseline <id>
 */

import fs from 'fs';
import path from 'path';
import type {QualityAssessment} from './types.js';

const RESULTS_DIR = path.join(import.meta.dirname, '..', 'results');

interface ComparisonResult {
  promptId: string;
  xds: QualityAssessment | null;
  baseline: QualityAssessment | null;
}

interface AggregateData {
  iterationId: string;
  totalTests: number;
  successCount: number;
  successRate: number;
  tiers?: {
    gold: number;
    green: number;
    yellow: number;
    red: number;
  };
  totalDurationMs?: number;
  avgDurationMs?: number;
  tokenUsage?: {
    input: {total: number};
    output: {total: number};
    grandTotal: number;
  };
  quality?: {
    assessed: number;
    byScore: Record<string, number>;
    accessibility: {totalIssues: number; criticalIssues: number};
    designSystem: {totalIssues: number; criticalIssues: number};
    codeQuality: {totalIssues: number; criticalIssues: number};
  };
}

function loadAggregate(iterationId: string): AggregateData | null {
  const filePath = path.join(RESULTS_DIR, iterationId, 'aggregate.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadQualityAssessment(
  iterationId: string,
  promptId: string,
): QualityAssessment | null {
  const filePath = path.join(
    RESULTS_DIR,
    iterationId,
    'results',
    `${promptId}.quality.json`,
  );
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadPromptIds(iterationId: string): string[] {
  const manifestPath = path.join(RESULTS_DIR, iterationId, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return [];
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return manifest.prompts.map((p: {id: string}) => p.id);
}

function severityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'moderate':
      return '🟡';
    case 'minor':
      return '⚪';
    default:
      return '•';
  }
}

function scoreIcon(score: string): string {
  switch (score) {
    case 'good':
      return '✅';
    case 'needs-work':
      return '⚠️';
    case 'poor':
      return '❌';
    default:
      return '❓';
  }
}

function formatIssues(
  issues: Array<{severity: string; issue: string}>,
  indent: string = '      ',
): string {
  if (issues.length === 0) return `${indent}(no issues)`;
  return issues
    .map(i => `${indent}${severityIcon(i.severity)} ${i.issue}`)
    .join('\n');
}

function formatTime(ms: number): string {
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs.toFixed(0)}s`;
}

function generateComparisonReport(
  xdsIteration: string,
  baselineIteration: string,
): string {
  const lines: string[] = [];

  lines.push(
    '═══════════════════════════════════════════════════════════════════════════',
  );
  lines.push('                         VIBE TEST COMPARISON REPORT');
  lines.push(
    `                    XDS (${xdsIteration}) vs Baseline (${baselineIteration})`,
  );
  lines.push(
    '═══════════════════════════════════════════════════════════════════════════',
  );
  lines.push('');

  // Load aggregate data
  const xdsAgg = loadAggregate(xdsIteration);
  const baselineAgg = loadAggregate(baselineIteration);

  // ===== METRICS SUMMARY =====
  lines.push('📊 METRICS SUMMARY');
  lines.push(
    '───────────────────────────────────────────────────────────────────────────',
  );
  lines.push('');
  lines.push(
    '┌─────────────────────────┬─────────────────┬─────────────────┬──────────┐',
  );
  lines.push(
    '│ Metric                  │ XDS             │ Baseline        │ Winner   │',
  );
  lines.push(
    '├─────────────────────────┼─────────────────┼─────────────────┼──────────┤',
  );

  // Success Rate
  const xdsSuccess = xdsAgg
    ? `${xdsAgg.successRate.toFixed(0)}% (${xdsAgg.successCount}/${xdsAgg.totalTests})`
    : 'N/A';
  const baselineSuccess = baselineAgg
    ? `${baselineAgg.successRate.toFixed(0)}% (${baselineAgg.successCount}/${baselineAgg.totalTests})`
    : 'N/A';
  const successWinner =
    !xdsAgg || !baselineAgg
      ? '—'
      : xdsAgg.successRate > baselineAgg.successRate
        ? 'XDS'
        : baselineAgg.successRate > xdsAgg.successRate
          ? 'Baseline'
          : 'Tie';
  lines.push(
    `│ Success Rate            │ ${xdsSuccess.padEnd(15)} │ ${baselineSuccess.padEnd(15)} │ ${successWinner.padEnd(8)} │`,
  );

  // Total Time
  const xdsTime = xdsAgg?.totalDurationMs
    ? formatTime(xdsAgg.totalDurationMs)
    : 'N/A';
  const baselineTime = baselineAgg?.totalDurationMs
    ? formatTime(baselineAgg.totalDurationMs)
    : 'N/A';
  const timeWinner =
    !xdsAgg?.totalDurationMs || !baselineAgg?.totalDurationMs
      ? '—'
      : xdsAgg.totalDurationMs < baselineAgg.totalDurationMs
        ? 'XDS'
        : baselineAgg.totalDurationMs < xdsAgg.totalDurationMs
          ? 'Baseline'
          : 'Tie';
  lines.push(
    `│ Total Time              │ ${xdsTime.padEnd(15)} │ ${baselineTime.padEnd(15)} │ ${timeWinner.padEnd(8)} │`,
  );

  // Avg Time per Test
  const xdsAvg = xdsAgg?.avgDurationMs
    ? formatTime(xdsAgg.avgDurationMs)
    : 'N/A';
  const baselineAvg = baselineAgg?.avgDurationMs
    ? formatTime(baselineAgg.avgDurationMs)
    : 'N/A';
  lines.push(
    `│ Avg Time/Test           │ ${xdsAvg.padEnd(15)} │ ${baselineAvg.padEnd(15)} │ ${timeWinner.padEnd(8)} │`,
  );

  // Input Tokens
  const xdsInputVal = (xdsAgg?.tokenUsage?.input?.total as {total?: number})
    ?.total;
  const baselineInputVal = (
    baselineAgg?.tokenUsage?.input?.total as {total?: number}
  )?.total;
  const xdsInput = xdsInputVal ? xdsInputVal.toLocaleString() : 'N/A';
  const baselineInput = baselineInputVal
    ? baselineInputVal.toLocaleString()
    : 'N/A';
  const inputWinner =
    !xdsInputVal || !baselineInputVal
      ? '—'
      : xdsInputVal < baselineInputVal
        ? 'XDS'
        : baselineInputVal < xdsInputVal
          ? 'Baseline'
          : 'Tie';
  lines.push(
    `│ Input Tokens            │ ${xdsInput.padEnd(15)} │ ${baselineInput.padEnd(15)} │ ${inputWinner.padEnd(8)} │`,
  );

  // Output Tokens
  const xdsOutputVal = (xdsAgg?.tokenUsage?.output?.total as {total?: number})
    ?.total;
  const baselineOutputVal = (
    baselineAgg?.tokenUsage?.output?.total as {total?: number}
  )?.total;
  const xdsOutput = xdsOutputVal ? xdsOutputVal.toLocaleString() : 'N/A';
  const baselineOutput = baselineOutputVal
    ? baselineOutputVal.toLocaleString()
    : 'N/A';
  const outputWinner =
    !xdsOutputVal || !baselineOutputVal
      ? '—'
      : xdsOutputVal < baselineOutputVal
        ? 'XDS'
        : baselineOutputVal < xdsOutputVal
          ? 'Baseline'
          : 'Tie';
  lines.push(
    `│ Output Tokens           │ ${xdsOutput.padEnd(15)} │ ${baselineOutput.padEnd(15)} │ ${outputWinner.padEnd(8)} │`,
  );

  lines.push(
    '└─────────────────────────┴─────────────────┴─────────────────┴──────────┘',
  );
  lines.push('');

  // ===== QUALITY TIERS =====
  if (xdsAgg?.tiers || baselineAgg?.tiers) {
    lines.push('🏆 QUALITY TIERS');
    lines.push(
      '───────────────────────────────────────────────────────────────────────────',
    );
    lines.push('');
    lines.push(
      '┌─────────────────────────┬─────────────────┬─────────────────┐',
    );
    lines.push(
      '│ Tier                    │ XDS             │ Baseline        │',
    );
    lines.push(
      '├─────────────────────────┼─────────────────┼─────────────────┤',
    );

    const tiers = ['gold', 'green', 'yellow', 'red'] as const;
    const tierLabels = {
      gold: '🥇 Gold (pure DS)',
      green: '🟢 Green (acceptable)',
      yellow: '🟡 Yellow (anti-pattern)',
      red: '🔴 Red (critical)',
    };

    for (const tier of tiers) {
      const xdsVal = xdsAgg?.tiers?.[tier] ?? 0;
      const baselineVal = baselineAgg?.tiers?.[tier] ?? 0;
      const xdsPct = xdsAgg?.totalTests
        ? `${xdsVal} (${((xdsVal / xdsAgg.totalTests) * 100).toFixed(0)}%)`
        : 'N/A';
      const baselinePct = baselineAgg?.totalTests
        ? `${baselineVal} (${((baselineVal / baselineAgg.totalTests) * 100).toFixed(0)}%)`
        : 'N/A';
      lines.push(
        `│ ${tierLabels[tier].padEnd(23)} │ ${xdsPct.padEnd(15)} │ ${baselinePct.padEnd(15)} │`,
      );
    }

    lines.push(
      '└─────────────────────────┴─────────────────┴─────────────────┘',
    );
    lines.push('');
  }

  // ===== QUALITY ASSESSMENT SUMMARY =====
  if (xdsAgg?.quality || baselineAgg?.quality) {
    lines.push('🔬 QUALITY ASSESSMENT SUMMARY');
    lines.push(
      '───────────────────────────────────────────────────────────────────────────',
    );
    lines.push('');
    lines.push(
      '┌─────────────────────────┬─────────────────┬─────────────────┬──────────┐',
    );
    lines.push(
      '│ Category                │ XDS             │ Baseline        │ Winner   │',
    );
    lines.push(
      '├─────────────────────────┼─────────────────┼─────────────────┼──────────┤',
    );

    // Overall Good scores
    const xdsGood = xdsAgg?.quality?.byScore?.good ?? 0;
    const baselineGood = baselineAgg?.quality?.byScore?.good ?? 0;
    const goodWinner =
      xdsGood > baselineGood
        ? 'XDS'
        : baselineGood > xdsGood
          ? 'Baseline'
          : 'Tie';
    lines.push(
      `│ ✅ Overall Good         │ ${String(xdsGood).padEnd(15)} │ ${String(baselineGood).padEnd(15)} │ ${goodWinner.padEnd(8)} │`,
    );

    // Needs Work
    const xdsNeedsWork = xdsAgg?.quality?.byScore?.['needs-work'] ?? 0;
    const baselineNeedsWork =
      baselineAgg?.quality?.byScore?.['needs-work'] ?? 0;
    const needsWorkWinner =
      xdsNeedsWork < baselineNeedsWork
        ? 'XDS'
        : baselineNeedsWork < xdsNeedsWork
          ? 'Baseline'
          : 'Tie';
    lines.push(
      `│ ⚠️  Needs Work           │ ${String(xdsNeedsWork).padEnd(15)} │ ${String(baselineNeedsWork).padEnd(15)} │ ${needsWorkWinner.padEnd(8)} │`,
    );

    // Poor
    const xdsPoor = xdsAgg?.quality?.byScore?.poor ?? 0;
    const baselinePoor = baselineAgg?.quality?.byScore?.poor ?? 0;
    const poorWinner =
      xdsPoor < baselinePoor
        ? 'XDS'
        : baselinePoor < xdsPoor
          ? 'Baseline'
          : 'Tie';
    lines.push(
      `│ ❌ Poor                  │ ${String(xdsPoor).padEnd(15)} │ ${String(baselinePoor).padEnd(15)} │ ${poorWinner.padEnd(8)} │`,
    );

    lines.push(
      '├─────────────────────────┼─────────────────┼─────────────────┼──────────┤',
    );

    // A11y Issues
    const xdsA11y = xdsAgg?.quality?.accessibility;
    const baselineA11y = baselineAgg?.quality?.accessibility;
    const xdsA11yStr = xdsA11y
      ? `${xdsA11y.totalIssues} (${xdsA11y.criticalIssues} crit)`
      : 'N/A';
    const baselineA11yStr = baselineA11y
      ? `${baselineA11y.totalIssues} (${baselineA11y.criticalIssues} crit)`
      : 'N/A';
    const a11yWinner =
      !xdsA11y || !baselineA11y
        ? '—'
        : xdsA11y.criticalIssues < baselineA11y.criticalIssues
          ? 'XDS'
          : baselineA11y.criticalIssues < xdsA11y.criticalIssues
            ? 'Baseline'
            : xdsA11y.totalIssues < baselineA11y.totalIssues
              ? 'XDS'
              : baselineA11y.totalIssues < xdsA11y.totalIssues
                ? 'Baseline'
                : 'Tie';
    lines.push(
      `│ ♿ A11y Issues           │ ${xdsA11yStr.padEnd(15)} │ ${baselineA11yStr.padEnd(15)} │ ${a11yWinner.padEnd(8)} │`,
    );

    // Design System Issues
    const xdsDS = xdsAgg?.quality?.designSystem;
    const baselineDS = baselineAgg?.quality?.designSystem;
    const xdsDSStr = xdsDS
      ? `${xdsDS.totalIssues} (${xdsDS.criticalIssues} crit)`
      : 'N/A';
    const baselineDSStr = baselineDS
      ? `${baselineDS.totalIssues} (${baselineDS.criticalIssues} crit)`
      : 'N/A';
    const dsWinner =
      !xdsDS || !baselineDS
        ? '—'
        : xdsDS.totalIssues < baselineDS.totalIssues
          ? 'XDS'
          : baselineDS.totalIssues < xdsDS.totalIssues
            ? 'Baseline'
            : 'Tie';
    lines.push(
      `│ 🎨 Design System Issues │ ${xdsDSStr.padEnd(15)} │ ${baselineDSStr.padEnd(15)} │ ${dsWinner.padEnd(8)} │`,
    );

    // Code Quality Issues
    const xdsCQ = xdsAgg?.quality?.codeQuality;
    const baselineCQ = baselineAgg?.quality?.codeQuality;
    const xdsCQStr = xdsCQ
      ? `${xdsCQ.totalIssues} (${xdsCQ.criticalIssues} crit)`
      : 'N/A';
    const baselineCQStr = baselineCQ
      ? `${baselineCQ.totalIssues} (${baselineCQ.criticalIssues} crit)`
      : 'N/A';
    const cqWinner =
      !xdsCQ || !baselineCQ
        ? '—'
        : xdsCQ.totalIssues < baselineCQ.totalIssues
          ? 'XDS'
          : baselineCQ.totalIssues < xdsCQ.totalIssues
            ? 'Baseline'
            : 'Tie';
    lines.push(
      `│ 💻 Code Quality Issues  │ ${xdsCQStr.padEnd(15)} │ ${baselineCQStr.padEnd(15)} │ ${cqWinner.padEnd(8)} │`,
    );

    lines.push(
      '└─────────────────────────┴─────────────────┴─────────────────┴──────────┘',
    );
    lines.push('');
  }

  // Get prompt IDs from both iterations
  const xdsPrompts = loadPromptIds(xdsIteration);
  const baselinePrompts = loadPromptIds(baselineIteration);
  const allPrompts = [...new Set([...xdsPrompts, ...baselinePrompts])];

  // ===== PER-TEST QUALITY SCORES =====
  lines.push('📝 PER-TEST QUALITY SCORES');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(
    '│ Test    │ Category       │ XDS Overall │ Baseline Overall │ Winner │',
  );
  lines.push(
    '├─────────┼────────────────┼─────────────┼──────────────────┼────────┤',
  );

  const results: ComparisonResult[] = [];
  let xdsWins = 0;
  let baselineWins = 0;
  let ties = 0;

  for (const promptId of allPrompts) {
    const xds = loadQualityAssessment(xdsIteration, promptId);
    const baseline = loadQualityAssessment(baselineIteration, promptId);
    results.push({promptId, xds, baseline});

    const xdsScore = xds?.overallScore || 'N/A';
    const baselineScore = baseline?.overallScore || 'N/A';

    let winner = '—';
    if (xdsScore === 'good' && baselineScore !== 'good') {
      winner = 'XDS';
      xdsWins++;
    } else if (baselineScore === 'good' && xdsScore !== 'good') {
      winner = 'Baseline';
      baselineWins++;
    } else if (xdsScore === baselineScore) {
      winner = 'Tie';
      ties++;
    } else if (xdsScore === 'needs-work' && baselineScore === 'poor') {
      winner = 'XDS';
      xdsWins++;
    } else if (baselineScore === 'needs-work' && xdsScore === 'poor') {
      winner = 'Baseline';
      baselineWins++;
    } else {
      ties++;
    }

    // Get category from manifest
    const manifestPath = path.join(RESULTS_DIR, xdsIteration, 'manifest.json');
    let category = '';
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const prompt = manifest.prompts.find(
        (p: {id: string}) => p.id === promptId,
      );
      category = prompt?.category || '';
    }

    lines.push(
      `│ ${promptId.padEnd(7)} │ ${category.padEnd(14)} │ ${scoreIcon(xdsScore)} ${xdsScore.padEnd(9)} │ ${scoreIcon(baselineScore)} ${baselineScore.padEnd(14)} │ ${winner.padEnd(6)} │`,
    );
  }

  lines.push(
    '└─────────┴────────────────┴─────────────┴──────────────────┴────────┘',
  );
  lines.push('');
  lines.push(
    `Totals: XDS wins: ${xdsWins}, Baseline wins: ${baselineWins}, Ties: ${ties}`,
  );
  lines.push('');

  // Detailed breakdown
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    DETAILED BREAKDOWN');
  lines.push('═══════════════════════════════════════════════════════════════');

  for (const result of results) {
    lines.push('');
    lines.push(
      `┌─── ${result.promptId} ───────────────────────────────────────────────┐`,
    );
    lines.push('');

    // Accessibility comparison
    lines.push('  📋 ACCESSIBILITY');
    lines.push('  ────────────────');
    lines.push(
      `    XDS: ${scoreIcon(result.xds?.accessibility.score || 'N/A')} ${result.xds?.accessibility.score || 'N/A'}`,
    );
    if (result.xds?.accessibility.issues.length) {
      lines.push(formatIssues(result.xds.accessibility.issues));
    }
    lines.push('');
    lines.push(
      `    Baseline: ${scoreIcon(result.baseline?.accessibility.score || 'N/A')} ${result.baseline?.accessibility.score || 'N/A'}`,
    );
    if (result.baseline?.accessibility.issues.length) {
      lines.push(formatIssues(result.baseline.accessibility.issues));
    }
    lines.push('');

    // Design System comparison
    lines.push('  🎨 DESIGN SYSTEM ADHERENCE');
    lines.push('  ──────────────────────────');
    lines.push(
      `    XDS: ${scoreIcon(result.xds?.designSystemAdherence.score || 'N/A')} ${result.xds?.designSystemAdherence.score || 'N/A'}`,
    );
    if (result.xds?.designSystemAdherence.issues.length) {
      lines.push(formatIssues(result.xds.designSystemAdherence.issues));
    }
    lines.push('');
    lines.push(
      `    Baseline: ${scoreIcon(result.baseline?.designSystemAdherence.score || 'N/A')} ${result.baseline?.designSystemAdherence.score || 'N/A'}`,
    );
    if (result.baseline?.designSystemAdherence.issues.length) {
      lines.push(formatIssues(result.baseline.designSystemAdherence.issues));
    }
    lines.push('');

    // Code Quality comparison
    lines.push('  💻 CODE QUALITY');
    lines.push('  ───────────────');
    lines.push(
      `    XDS: ${scoreIcon(result.xds?.codeQuality.score || 'N/A')} ${result.xds?.codeQuality.score || 'N/A'}`,
    );
    if (result.xds?.codeQuality.issues.length) {
      lines.push(formatIssues(result.xds.codeQuality.issues));
    }
    lines.push('');
    lines.push(
      `    Baseline: ${scoreIcon(result.baseline?.codeQuality.score || 'N/A')} ${result.baseline?.codeQuality.score || 'N/A'}`,
    );
    if (result.baseline?.codeQuality.issues.length) {
      lines.push(formatIssues(result.baseline.codeQuality.issues));
    }
    lines.push('');
    lines.push(
      '└─────────────────────────────────────────────────────────────┘',
    );
  }

  return lines.join('\n');
}

function printUsage(): void {
  console.log(`
Comparison Report Generator

Usage:
  yarn workspace @xds/vibe-tests compare --xds <id> --baseline <id>

Options:
  --xds, -x       XDS iteration ID (required)
  --baseline, -b  Baseline iteration ID (required)
  --help, -h      Show this help message

Examples:
  yarn workspace @xds/vibe-tests compare --xds 887c6567 --baseline a3466fd9
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // Parse arguments
  let xdsIteration: string | null = null;
  let baselineIteration: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--xds' || args[i] === '-x') {
      xdsIteration = args[++i];
    } else if (args[i] === '--baseline' || args[i] === '-b') {
      baselineIteration = args[++i];
    }
  }

  if (!xdsIteration || !baselineIteration) {
    console.error('Error: Both --xds and --baseline are required');
    printUsage();
    process.exit(1);
  }

  const report = generateComparisonReport(xdsIteration, baselineIteration);
  console.log(report);
}

main().catch(console.error);
