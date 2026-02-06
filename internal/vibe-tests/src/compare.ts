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

function generateComparisonReport(
  xdsIteration: string,
  baselineIteration: string,
): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    COMPARISON REPORT');
  lines.push(
    `                XDS (${xdsIteration}) vs Baseline (${baselineIteration})`,
  );
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Get prompt IDs from both iterations
  const xdsPrompts = loadPromptIds(xdsIteration);
  const baselinePrompts = loadPromptIds(baselineIteration);
  const allPrompts = [...new Set([...xdsPrompts, ...baselinePrompts])];

  // Summary table
  lines.push('SUMMARY');
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
