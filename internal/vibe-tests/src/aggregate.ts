#!/usr/bin/env node
/**
 * @file Aggregate results from interactive vibe test runs
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests aggregate --iteration abc123
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  TestResult,
  Evaluation,
  ResultTier,
  EscapeHatch,
  GapSuggestion,
  EscapeHatchType,
} from './types.js';
import {readJsonl, readJson, writeJson, getResultsDir} from './utils.js';

/** Escape hatch types that indicate anti-patterns (break theming/system) */
const ANTI_PATTERN_HATCHES: EscapeHatchType[] = [
  'hardcoded_color',
  'hardcoded_spacing',
  'inline_style', // Should use StyleX instead
];

/** Escape hatch types that indicate gaps in the component system */
const GAP_HATCHES: EscapeHatchType[] = [
  'supplemental_css',
  'custom_animation',
  'layout_workaround',
];

interface TierCounts {
  gold: number;
  green: number;
  yellow: number;
  red: number;
}

interface AggregateResult {
  iterationId: string;
  totalTests: number;
  successCount: number;
  successRate: number;
  // Tiered results
  tiers: TierCounts;
  tierRate: Record<ResultTier, number>;
  byCategory: Record<
    string,
    {success: number; total: number; rate: number; tiers: TierCounts}
  >;
  byPersona: Record<string, {success: number; total: number; rate: number}>;
  criticalIssues: Record<string, number>;
  acceptableEscapeHatches: Record<string, number>;
  antiPatterns: Record<string, number>;
  // Gap analysis
  gaps: GapSuggestion[];
  // Timing and token metrics
  totalDurationMs: number;
  avgDurationMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

/** Normalize escape hatch to object format (handles string or object) */
function normalizeEscapeHatch(h: string | EscapeHatch): EscapeHatch {
  if (typeof h === 'string') {
    // String escape hatches are treated as acceptable with undefined type
    return {
      type: 'supplemental_css', // Default type for string descriptions
      severity: 'acceptable',
      codeSnippet: h,
    };
  }
  return h;
}

/** Calculate the tier for a single result */
function calculateTier(evaluation: Evaluation): ResultTier {
  const normalizedHatches = evaluation.escapeHatches.map(normalizeEscapeHatch);

  const criticalHatches = normalizedHatches.filter(
    h => h.severity === 'critical',
  );
  const antiPatternHatches = normalizedHatches.filter(h =>
    ANTI_PATTERN_HATCHES.includes(h.type),
  );

  // Red: Critical failures
  if (criticalHatches.length > 0) {
    return 'red';
  }

  // Yellow: Anti-patterns that break theming/system
  if (antiPatternHatches.length > 0) {
    return 'yellow';
  }

  // Gold: Pure XDS, no escape hatches
  if (normalizedHatches.length === 0) {
    return 'gold';
  }

  // Green: Success with acceptable escape hatches only
  return 'green';
}

/** Analyze escape hatches to generate gap suggestions */
function analyzeGaps(results: TestResult[]): GapSuggestion[] {
  const gapMap = new Map<
    string,
    {count: number; examples: string[]; hatches: EscapeHatch[]}
  >();

  for (const result of results) {
    for (const rawHatch of result.evaluation.escapeHatches) {
      const hatch = normalizeEscapeHatch(rawHatch);
      // Group by gap description or type
      const key = hatch.gap || hatch.type;
      if (!gapMap.has(key)) {
        gapMap.set(key, {count: 0, examples: [], hatches: []});
      }
      const entry = gapMap.get(key)!;
      entry.count++;
      entry.hatches.push(hatch);
      if (entry.examples.length < 3) {
        entry.examples.push(hatch.codeSnippet);
      }
    }
  }

  const suggestions: GapSuggestion[] = [];

  for (const [key, data] of gapMap) {
    // Generate suggestions based on escape hatch type
    const hatchType = data.hatches[0].type;

    if (hatchType === 'supplemental_css' || hatchType === 'layout_workaround') {
      suggestions.push({
        type: 'new_prop',
        suggestion: `Add prop or variant to cover: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: data.count >= 3 ? 'moderate' : 'trivial',
      });
    } else if (hatchType === 'hardcoded_color') {
      suggestions.push({
        type: 'new_variant',
        component: 'theme/tokens',
        suggestion: `Add semantic color token for: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'trivial',
      });
    } else if (
      hatchType === 'hardcoded_spacing' ||
      hatchType === 'hardcoded_size'
    ) {
      suggestions.push({
        type: 'new_prop',
        suggestion: `Add spacing/size prop to cover: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'trivial',
      });
    } else if (hatchType === 'custom_animation') {
      suggestions.push({
        type: 'new_component',
        suggestion: `Add animation utility or component for: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'moderate',
      });
    } else if (hatchType === 'wrapper_div' && data.count >= 3) {
      suggestions.push({
        type: 'new_component',
        suggestion: `Consider layout component to reduce wrapper divs: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'significant',
      });
    }
  }

  // Sort by frequency (highest first)
  return suggestions.sort((a, b) => b.frequency - a.frequency);
}

function aggregate(iterationId: string): AggregateResult {
  const resultsDir = path.join(getResultsDir(), iterationId);
  const runsPath = path.join(resultsDir, 'runs.jsonl');

  if (!fs.existsSync(runsPath)) {
    throw new Error(`No results found at ${runsPath}`);
  }

  const results = readJsonl<TestResult>(runsPath);

  if (results.length === 0) {
    throw new Error('No results to aggregate');
  }

  const byCategory: Record<
    string,
    {success: number; total: number; tiers: TierCounts}
  > = {};
  const byPersona: Record<string, {success: number; total: number}> = {};
  const criticalIssues: Record<string, number> = {};
  const acceptableEscapeHatches: Record<string, number> = {};
  const antiPatterns: Record<string, number> = {};
  const tiers: TierCounts = {gold: 0, green: 0, yellow: 0, red: 0};

  let successCount = 0;
  let totalDurationMs = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const result of results) {
    // Calculate tier for this result
    const tier = calculateTier(result.evaluation);
    tiers[tier]++;

    // Overall success (gold, green, yellow all count as success)
    if (tier !== 'red') {
      successCount++;
    }

    // Timing and tokens
    totalDurationMs += result.durationMs || 0;
    totalInputTokens += result.inputTokens || 0;
    totalOutputTokens += result.outputTokens || 0;

    // By category
    if (!byCategory[result.promptCategory]) {
      byCategory[result.promptCategory] = {
        success: 0,
        total: 0,
        tiers: {gold: 0, green: 0, yellow: 0, red: 0},
      };
    }
    byCategory[result.promptCategory].total++;
    byCategory[result.promptCategory].tiers[tier]++;
    if (tier !== 'red') {
      byCategory[result.promptCategory].success++;
    }

    // By persona
    if (!byPersona[result.persona]) {
      byPersona[result.persona] = {success: 0, total: 0};
    }
    byPersona[result.persona].total++;
    if (tier !== 'red') {
      byPersona[result.persona].success++;
    }

    // Escape hatches
    for (const rawHatch of result.evaluation.escapeHatches) {
      const hatch = normalizeEscapeHatch(rawHatch);
      if (hatch.severity === 'critical') {
        criticalIssues[hatch.type] = (criticalIssues[hatch.type] || 0) + 1;
      } else if (ANTI_PATTERN_HATCHES.includes(hatch.type)) {
        antiPatterns[hatch.type] = (antiPatterns[hatch.type] || 0) + 1;
      } else {
        acceptableEscapeHatches[hatch.type] =
          (acceptableEscapeHatches[hatch.type] || 0) + 1;
      }
    }
  }

  // Calculate rates
  const byCategoryWithRates: Record<
    string,
    {success: number; total: number; rate: number; tiers: TierCounts}
  > = {};
  for (const [cat, stats] of Object.entries(byCategory)) {
    byCategoryWithRates[cat] = {
      ...stats,
      rate: Math.round((stats.success / stats.total) * 100),
    };
  }

  const byPersonaWithRates: Record<
    string,
    {success: number; total: number; rate: number}
  > = {};
  for (const [persona, stats] of Object.entries(byPersona)) {
    byPersonaWithRates[persona] = {
      ...stats,
      rate: Math.round((stats.success / stats.total) * 100),
    };
  }

  // Calculate tier rates
  const tierRate: Record<ResultTier, number> = {
    gold: Math.round((tiers.gold / results.length) * 100),
    green: Math.round((tiers.green / results.length) * 100),
    yellow: Math.round((tiers.yellow / results.length) * 100),
    red: Math.round((tiers.red / results.length) * 100),
  };

  // Analyze gaps and generate suggestions
  const gaps = analyzeGaps(results);

  return {
    iterationId,
    totalTests: results.length,
    successCount,
    successRate: Math.round((successCount / results.length) * 100),
    tiers,
    tierRate,
    byCategory: byCategoryWithRates,
    byPersona: byPersonaWithRates,
    criticalIssues,
    acceptableEscapeHatches,
    antiPatterns,
    gaps,
    totalDurationMs,
    avgDurationMs: Math.round(totalDurationMs / results.length),
    totalInputTokens,
    totalOutputTokens,
  };
}

function printReport(agg: AggregateResult): void {
  console.log(`\n📊 Vibe Test Results - Iteration ${agg.iterationId}`);
  console.log(`${'='.repeat(50)}`);
  console.log(
    `\nOverall: ${agg.successRate}% success (${agg.successCount}/${agg.totalTests})`,
  );

  // Tiered breakdown
  console.log(`\n🏆 Quality Tiers:`);
  console.log(
    `  🥇 Gold (pure XDS):     ${agg.tiers.gold} (${agg.tierRate.gold}%)`,
  );
  console.log(
    `  🟢 Green (acceptable):  ${agg.tiers.green} (${agg.tierRate.green}%)`,
  );
  console.log(
    `  🟡 Yellow (anti-pattern): ${agg.tiers.yellow} (${agg.tierRate.yellow}%)`,
  );
  console.log(
    `  🔴 Red (critical):      ${agg.tiers.red} (${agg.tierRate.red}%)`,
  );

  // Timing and token stats
  if (agg.totalDurationMs > 0 || agg.totalInputTokens > 0) {
    console.log(`\n⏱️  Performance:`);
    if (agg.totalDurationMs > 0) {
      const totalSecs = (agg.totalDurationMs / 1000).toFixed(1);
      const avgSecs = (agg.avgDurationMs / 1000).toFixed(1);
      console.log(`  Total time: ${totalSecs}s (avg ${avgSecs}s per test)`);
    }
    if (agg.totalInputTokens > 0 || agg.totalOutputTokens > 0) {
      const totalTokens = agg.totalInputTokens + agg.totalOutputTokens;
      console.log(
        `  Tokens: ${totalTokens.toLocaleString()} total (${agg.totalInputTokens.toLocaleString()} in / ${agg.totalOutputTokens.toLocaleString()} out)`,
      );
    }
  }

  console.log(`\nBy Category:`);
  for (const [cat, stats] of Object.entries(agg.byCategory)) {
    const tierBar = `🥇${stats.tiers.gold} 🟢${stats.tiers.green} 🟡${stats.tiers.yellow} 🔴${stats.tiers.red}`;
    console.log(
      `  ${cat.padEnd(25)} ${stats.rate}% (${stats.success}/${stats.total}) [${tierBar}]`,
    );
  }

  if (Object.keys(agg.criticalIssues).length > 0) {
    console.log(`\n❌ Critical Issues (break functionality):`);
    for (const [type, count] of Object.entries(agg.criticalIssues)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  if (Object.keys(agg.antiPatterns).length > 0) {
    console.log(`\n⚠️  Anti-Patterns (break theming):`);
    for (const [type, count] of Object.entries(agg.antiPatterns)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  if (Object.keys(agg.acceptableEscapeHatches).length > 0) {
    console.log(`\n✓ Acceptable Escape Hatches:`);
    for (const [type, count] of Object.entries(agg.acceptableEscapeHatches)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  if (agg.gaps.length > 0) {
    console.log(`\n💡 Gap Suggestions (component/API improvements):`);
    for (const gap of agg.gaps.slice(0, 5)) {
      const typeIcon =
        gap.type === 'new_component'
          ? '📦'
          : gap.type === 'new_prop'
            ? '🔧'
            : gap.type === 'new_variant'
              ? '🎨'
              : '📝';
      console.log(
        `  ${typeIcon} [${gap.effort}] ${gap.suggestion} (seen ${gap.frequency}x)`,
      );
    }
  }

  if (Object.keys(agg.byPersona).length > 1) {
    console.log(`\nBy Persona:`);
    for (const [persona, stats] of Object.entries(agg.byPersona)) {
      console.log(
        `  ${persona.padEnd(15)} ${stats.rate}% (${stats.success}/${stats.total})`,
      );
    }
  }

  console.log(`\n`);
}

function generateHtmlReport(
  iterationId: string,
  agg: AggregateResult,
  results: TestResult[],
): string {
  const escapeHtml = (str: string | undefined) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const categoryRows = Object.entries(agg.byCategory)
    .map(
      ([cat, stats]) => `
      <tr>
        <td>${escapeHtml(cat)}</td>
        <td>
          <div class="tier-bar">
            <span class="tier gold" style="width: ${(stats.tiers.gold / stats.total) * 100}%"></span>
            <span class="tier green" style="width: ${(stats.tiers.green / stats.total) * 100}%"></span>
            <span class="tier yellow" style="width: ${(stats.tiers.yellow / stats.total) * 100}%"></span>
            <span class="tier red" style="width: ${(stats.tiers.red / stats.total) * 100}%"></span>
          </div>
        </td>
        <td>${stats.rate}%</td>
        <td>${stats.success}/${stats.total}</td>
        <td class="tier-counts">
          <span class="tier-label gold">${stats.tiers.gold}</span>
          <span class="tier-label green">${stats.tiers.green}</span>
          <span class="tier-label yellow">${stats.tiers.yellow}</span>
          <span class="tier-label red">${stats.tiers.red}</span>
        </td>
      </tr>
    `,
    )
    .join('');

  const criticalRows = Object.entries(agg.criticalIssues)
    .map(
      ([type, count]) =>
        `<li><strong>${escapeHtml(type)}</strong>: ${count}</li>`,
    )
    .join('');

  const antiPatternRows = Object.entries(agg.antiPatterns)
    .map(
      ([type, count]) =>
        `<li><strong>${escapeHtml(type)}</strong>: ${count}</li>`,
    )
    .join('');

  const acceptableRows = Object.entries(agg.acceptableEscapeHatches)
    .map(([type, count]) => `<li>${escapeHtml(type)}: ${count}</li>`)
    .join('');

  const gapRows = agg.gaps
    .map(gap => {
      const typeLabel =
        gap.type === 'new_component'
          ? 'New Component'
          : gap.type === 'new_prop'
            ? 'New Prop'
            : gap.type === 'new_variant'
              ? 'New Variant'
              : 'Documentation';
      return `
      <tr>
        <td><span class="badge gap-type">${typeLabel}</span></td>
        <td>${escapeHtml(gap.suggestion)}</td>
        <td>${gap.frequency}x</td>
        <td><span class="badge effort-${gap.effort}">${gap.effort}</span></td>
      </tr>
    `;
    })
    .join('');

  const testRows = results
    .map(r => {
      const tier = calculateTier(r.evaluation);
      const tierClass = `tier-${tier}`;
      const tierIcon =
        tier === 'gold'
          ? '🥇'
          : tier === 'green'
            ? '🟢'
            : tier === 'yellow'
              ? '🟡'
              : '🔴';
      const escapeHatchBadges = r.evaluation.escapeHatches
        .map(rawH => {
          const h = normalizeEscapeHatch(rawH);
          const isAntiPattern = ANTI_PATTERN_HATCHES.includes(h.type);
          const badgeClass =
            h.severity === 'critical'
              ? 'critical'
              : isAntiPattern
                ? 'anti-pattern'
                : 'acceptable';
          return `<span class="badge ${badgeClass}">${escapeHtml(h.type)}</span>`;
        })
        .join(' ');
      const durationStr = r.durationMs
        ? `${(r.durationMs / 1000).toFixed(1)}s`
        : '-';
      const tokensStr =
        r.inputTokens || r.outputTokens
          ? `${(r.inputTokens || 0).toLocaleString()} / ${(r.outputTokens || 0).toLocaleString()}`
          : '-';

      return `
      <tr class="${tierClass}">
        <td><span class="tier-icon">${tierIcon}</span></td>
        <td>${escapeHtml(r.promptCategory)}</td>
        <td class="prompt-cell">${escapeHtml(r.prompt)}</td>
        <td>${escapeHatchBadges || '-'}</td>
        <td>${durationStr}</td>
        <td>${tokensStr}</td>
        <td>
          <button class="toggle-code" onclick="toggleCode('${r.id}')">View Code</button>
          <pre class="code-block" id="code-${r.id}" style="display:none"><code>${escapeHtml(r.response)}</code></pre>
        </td>
      </tr>
    `;
    })
    .join('');

  const totalSecs = agg.totalDurationMs
    ? (agg.totalDurationMs / 1000).toFixed(1)
    : '-';
  const avgSecs = agg.avgDurationMs
    ? (agg.avgDurationMs / 1000).toFixed(1)
    : '-';
  const totalTokens = agg.totalInputTokens + agg.totalOutputTokens;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibe Test Results - ${escapeHtml(iterationId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1, h2, h3 { color: #333; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-box {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .stat-value { font-size: 1.8em; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 0.85em; }
    .tier-stats { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .tier-stat { text-align: center; padding: 12px 16px; border-radius: 6px; }
    .tier-stat.gold { background: #fef3c7; }
    .tier-stat.green { background: #dcfce7; }
    .tier-stat.yellow { background: #fef9c3; }
    .tier-stat.red { background: #fee2e2; }
    .tier-stat .value { font-size: 1.5em; font-weight: bold; }
    .tier-stat .label { font-size: 0.8em; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .tier-bar {
      display: flex;
      width: 100px;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .tier-bar .tier { height: 100%; }
    .tier-bar .tier.gold { background: #f59e0b; }
    .tier-bar .tier.green { background: #22c55e; }
    .tier-bar .tier.yellow { background: #eab308; }
    .tier-bar .tier.red { background: #ef4444; }
    .tier-counts { white-space: nowrap; }
    .tier-label { display: inline-block; width: 20px; text-align: center; font-size: 0.8em; padding: 2px 4px; border-radius: 4px; margin: 0 1px; }
    .tier-label.gold { background: #fef3c7; }
    .tier-label.green { background: #dcfce7; }
    .tier-label.yellow { background: #fef9c3; }
    .tier-label.red { background: #fee2e2; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      margin: 2px;
    }
    .badge.critical { background: #fee2e2; color: #dc2626; }
    .badge.anti-pattern { background: #fef9c3; color: #ca8a04; }
    .badge.acceptable { background: #e0f2fe; color: #0369a1; }
    .badge.gap-type { background: #e0e7ff; color: #4338ca; }
    .badge.effort-trivial { background: #dcfce7; color: #16a34a; }
    .badge.effort-moderate { background: #fef3c7; color: #d97706; }
    .badge.effort-significant { background: #fee2e2; color: #dc2626; }
    tr.tier-gold { background: #fffbeb; }
    tr.tier-green { background: #f0fdf4; }
    tr.tier-yellow { background: #fefce8; }
    tr.tier-red { background: #fef2f2; }
    .tier-icon { font-size: 1.2em; }
    .prompt-cell { max-width: 300px; }
    .toggle-code {
      background: #e5e7eb;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .toggle-code:hover { background: #d1d5db; }
    .code-block {
      margin-top: 8px;
      padding: 12px;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 6px;
      overflow-x: auto;
      max-height: 400px;
      font-size: 0.85em;
    }
    .issues-list { list-style: none; padding: 0; }
    .issues-list li { padding: 4px 0; }
    .issues-list.critical li { color: #dc2626; }
    .issues-list.anti-pattern li { color: #ca8a04; }
    .timestamp { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Vibe Test Results</h1>
  <p class="timestamp">Iteration: ${escapeHtml(iterationId)} | Generated: ${new Date().toISOString()}</p>

  <div class="card">
    <h2>Quality Tiers</h2>
    <div class="tier-stats">
      <div class="tier-stat gold">
        <div class="value">${agg.tiers.gold}</div>
        <div class="label">🥇 Gold (${agg.tierRate.gold}%)</div>
      </div>
      <div class="tier-stat green">
        <div class="value">${agg.tiers.green}</div>
        <div class="label">🟢 Green (${agg.tierRate.green}%)</div>
      </div>
      <div class="tier-stat yellow">
        <div class="value">${agg.tiers.yellow}</div>
        <div class="label">🟡 Yellow (${agg.tierRate.yellow}%)</div>
      </div>
      <div class="tier-stat red">
        <div class="value">${agg.tiers.red}</div>
        <div class="label">🔴 Red (${agg.tierRate.red}%)</div>
      </div>
    </div>
    <p style="text-align: center; color: #666; margin-top: 12px; font-size: 0.85em;">
      Gold = Pure XDS | Green = Acceptable escape hatches | Yellow = Anti-patterns (break theming) | Red = Critical failures
    </p>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value" style="color: ${agg.successRate >= 80 ? '#22c55e' : agg.successRate >= 50 ? '#eab308' : '#ef4444'}">${agg.successRate}%</div>
      <div class="stat-label">Success Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${agg.totalTests}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${totalSecs}s</div>
      <div class="stat-label">Total Time</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${totalTokens.toLocaleString()}</div>
      <div class="stat-label">Total Tokens</div>
    </div>
  </div>

  <div class="card">
    <h2>Results by Category</h2>
    <table>
      <thead>
        <tr><th>Category</th><th>Tiers</th><th>Rate</th><th>Count</th><th>Breakdown</th></tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>

  ${
    criticalRows
      ? `
  <div class="card">
    <h2>❌ Critical Issues (break functionality)</h2>
    <ul class="issues-list critical">${criticalRows}</ul>
  </div>
  `
      : ''
  }

  ${
    antiPatternRows
      ? `
  <div class="card">
    <h2>⚠️ Anti-Patterns (break theming)</h2>
    <p style="color: #666; font-size: 0.9em;">These patterns use hardcoded values instead of CSS variables, breaking theme support.</p>
    <ul class="issues-list anti-pattern">${antiPatternRows}</ul>
  </div>
  `
      : ''
  }

  ${
    acceptableRows
      ? `
  <div class="card">
    <h2>✓ Acceptable Escape Hatches</h2>
    <ul class="issues-list">${acceptableRows}</ul>
  </div>
  `
      : ''
  }

  ${
    gapRows
      ? `
  <div class="card">
    <h2>💡 Gap Suggestions</h2>
    <p style="color: #666; font-size: 0.9em;">Component or API improvements to reduce escape hatches.</p>
    <table>
      <thead>
        <tr><th>Type</th><th>Suggestion</th><th>Frequency</th><th>Effort</th></tr>
      </thead>
      <tbody>${gapRows}</tbody>
    </table>
  </div>
  `
      : ''
  }

  <div class="card">
    <h2>Individual Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Tier</th>
          <th>Category</th>
          <th>Prompt</th>
          <th>Escape Hatches</th>
          <th>Duration</th>
          <th>Tokens</th>
          <th>Response</th>
        </tr>
      </thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>

  <script>
    function toggleCode(id) {
      const el = document.getElementById('code-' + id);
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  </script>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const iterationIndex = args.indexOf('--iteration');
  const jsonMode = args.includes('--json');
  const ciMode = args.includes('--ci');

  if (iterationIndex === -1 || !args[iterationIndex + 1]) {
    console.error(
      'Usage: aggregate --iteration <iteration-id> [--json] [--ci]',
    );
    process.exit(1);
  }

  const iterationId = args[iterationIndex + 1];
  const resultsDir = path.join(getResultsDir(), iterationId);

  try {
    // Read results for HTML report
    const runsPath = path.join(resultsDir, 'runs.jsonl');
    const results = readJsonl<TestResult>(runsPath);

    const agg = aggregate(iterationId);

    // JSON mode: output only JSON to stdout
    if (jsonMode) {
      console.log(JSON.stringify(agg, null, 2));
      return;
    }

    // CI mode: output GitHub Actions format
    if (ciMode) {
      // Write to GITHUB_OUTPUT if available
      const githubOutput = process.env.GITHUB_OUTPUT;
      const lines = [
        `iteration_id=${agg.iterationId}`,
        `success_rate=${agg.successRate}`,
        `total_tests=${agg.totalTests}`,
        `gold=${agg.tiers.gold}`,
        `green=${agg.tiers.green}`,
        `yellow=${agg.tiers.yellow}`,
        `red=${agg.tiers.red}`,
      ];

      if (githubOutput) {
        fs.appendFileSync(githubOutput, lines.join('\n') + '\n');
      }

      // Also print to stdout for logging
      console.log('::group::Vibe Test Results');
      printReport(agg);
      console.log('::endgroup::');

      // Set job summary if available
      const summaryPath = process.env.GITHUB_STEP_SUMMARY;
      if (summaryPath) {
        const summary = `## Vibe Test Results

| Metric | Value |
|--------|-------|
| Success Rate | ${agg.successRate}% |
| Total Tests | ${agg.totalTests} |
| 🥇 Gold | ${agg.tiers.gold} (${agg.tierRate.gold}%) |
| 🟢 Green | ${agg.tiers.green} (${agg.tierRate.green}%) |
| 🟡 Yellow | ${agg.tiers.yellow} (${agg.tierRate.yellow}%) |
| 🔴 Red | ${agg.tiers.red} (${agg.tierRate.red}%) |
`;
        fs.appendFileSync(summaryPath, summary);
      }
    } else {
      printReport(agg);
    }

    // Save aggregated results
    writeJson(path.join(resultsDir, 'aggregate.json'), agg);
    console.log(`Saved: ${path.join(resultsDir, 'aggregate.json')}`);

    // Generate HTML report
    const htmlReport = generateHtmlReport(iterationId, agg, results);
    const htmlPath = path.join(resultsDir, 'report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`HTML Report: ${htmlPath}`);

    if (!ciMode) {
      console.log(`\nOpen in browser: file://${htmlPath}`);
    }

    // Exit with error if there are critical failures (for CI)
    if (ciMode && agg.tiers.red > 0) {
      console.log(`::error::${agg.tiers.red} critical failures detected`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main().catch(console.error);
