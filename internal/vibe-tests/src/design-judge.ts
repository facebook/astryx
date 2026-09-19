#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Design Judge — vision LLM evaluation of visual fidelity
 *
 * Compares rendered screenshots against human-provided ideal reference
 * images using a vision LLM (Anthropic Claude). Scores across 5 visual
 * sub-signals on a 0-100 scale, producing a weighted overall Design score.
 *
 * Sub-signals:
 *   1. Layout Fidelity    (25%) — structural regions, grid, stacking
 *   2. Visual Hierarchy   (25%) — relative sizing, weight, eye flow
 *   3. Spacing & Alignment(20%) — consistency, grid alignment, proportions
 *   4. Component Fidelity (15%) — interactive affordances, borders, radii
 *   5. Color & Theming    (15%) — palette match, surface/accent usage
 *
 * Runs 3 judge passes per screenshot and takes the median for stability.
 *
 * Usage:
 *   tsx src/design-judge.ts --iteration <id> [--prompts <p1,p2>] [--passes 3]
 *
 * @input Screenshot PNGs from screenshot-previews.ts + ideal PNGs from ideals/
 * @output Design scores in results/<iteration>/design-scores.json
 * @position internal/vibe-tests/src/design-judge.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {getResultsDir, writeJson, readJson} from './utils.js';

// ============================================================
// Types
// ============================================================

export interface DesignSubScores {
  layout: number;
  hierarchy: number;
  spacing: number;
  components: number;
  color: number;
}

export interface DesignJudgment {
  scores: DesignSubScores;
  overall: number;
  notes: string;
}

export interface DesignResult {
  promptId: string;
  target: string;
  viewport: string;
  theme: string;
  /** Individual pass results (typically 3) */
  passes: DesignJudgment[];
  /** Median scores across passes */
  median: DesignJudgment;
  idealPath: string;
  screenshotPath: string;
}

export interface DesignScores {
  iterationId: string;
  timestamp: string;
  model: string;
  passCount: number;
  results: DesignResult[];
  /** Aggregated scores by prompt × target */
  summary: Record<
    string,
    Record<string, {overall: number; sub: DesignSubScores}>
  >;
}

// ============================================================
// Sub-signal weights (must sum to 1.0)
// ============================================================

const WEIGHTS: Record<keyof DesignSubScores, number> = {
  layout: 0.25,
  hierarchy: 0.25,
  spacing: 0.2,
  components: 0.15,
  color: 0.15,
};

// ============================================================
// Judge prompt
// ============================================================

function buildJudgePrompt(promptText: string): string {
  return `You are a design review judge. You will see two images:

IMAGE 1: The ideal reference design (the target)
IMAGE 2: A generated UI screenshot (the output)

The original UI prompt was: "${promptText}"

Score the generated output's visual fidelity to the ideal on these sub-signals (0-100 each):

1. LAYOUT FIDELITY (25%): Do major content regions match? Correct stacking, grid/flex structure, sidebar/main/header placement. Focus on structural agreement, not pixel precision.
2. VISUAL HIERARCHY (25%): Correct relative sizing of headings, body, labels? Eye drawn to right places? Proper weight differentiation?
3. SPACING & ALIGNMENT (20%): Consistent spacing? Aligned to grid? Proportional padding/margins compared to ideal?
4. COMPONENT FIDELITY (15%): Do buttons, inputs, toggles look correct? Right affordances, borders, radii? Interactive elements look clickable/tappable?
5. COLOR & THEMING (15%): Palette broadly matches? Correct surface/accent/text color usage? Appropriate contrast?

IGNORE: placeholder text differences, exact pixel match, content length, interactive states (hover/focus), browser chrome, scrollbars, favicon.
PENALIZE: layout mismatch, broken hierarchy, gross spacing violations, missing interactive affordances, wrong color scheme.

Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "layout": <0-100>,
  "hierarchy": <0-100>,
  "spacing": <0-100>,
  "components": <0-100>,
  "color": <0-100>,
  "overall": <weighted average using weights 25/25/20/15/15>,
  "notes": "brief explanation of major deviations (1-2 sentences)"
}`;
}

// ============================================================
// Anthropic Vision API
// ============================================================

async function callVisionJudge(
  idealImagePath: string,
  screenshotPath: string,
  promptText: string,
  model: string,
): Promise<DesignJudgment> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required.\n' +
        'Set it in GitHub Actions secrets or export it locally.',
    );
  }

  const idealBase64 = fs.readFileSync(idealImagePath).toString('base64');
  const screenshotBase64 = fs.readFileSync(screenshotPath).toString('base64');

  const idealMediaType = idealImagePath.endsWith('.png')
    ? 'image/png'
    : 'image/jpeg';
  const screenshotMediaType = screenshotPath.endsWith('.png')
    ? 'image/png'
    : 'image/jpeg';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: idealMediaType,
                data: idealBase64,
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: screenshotMediaType,
                data: screenshotBase64,
              },
            },
            {
              type: 'text',
              text: buildJudgePrompt(promptText),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    content: Array<{type: string; text?: string}>;
  };
  const textBlock = data.content.find(b => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('No text response from Anthropic API');
  }

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = textBlock.text.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const parsed = JSON.parse(jsonStr) as {
    layout: number;
    hierarchy: number;
    spacing: number;
    components: number;
    color: number;
    overall: number;
    notes: string;
  };

  // Recompute overall to ensure correct weighting
  const overall = Math.round(
    parsed.layout * WEIGHTS.layout +
      parsed.hierarchy * WEIGHTS.hierarchy +
      parsed.spacing * WEIGHTS.spacing +
      parsed.components * WEIGHTS.components +
      parsed.color * WEIGHTS.color,
  );

  return {
    scores: {
      layout: clamp(parsed.layout),
      hierarchy: clamp(parsed.hierarchy),
      spacing: clamp(parsed.spacing),
      components: clamp(parsed.components),
      color: clamp(parsed.color),
    },
    overall: clamp(overall),
    notes: parsed.notes || '',
  };
}

// ============================================================
// Statistics
// ============================================================

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function medianJudgment(passes: DesignJudgment[]): DesignJudgment {
  const sub: DesignSubScores = {
    layout: median(passes.map(p => p.scores.layout)),
    hierarchy: median(passes.map(p => p.scores.hierarchy)),
    spacing: median(passes.map(p => p.scores.spacing)),
    components: median(passes.map(p => p.scores.components)),
    color: median(passes.map(p => p.scores.color)),
  };

  const overall = Math.round(
    sub.layout * WEIGHTS.layout +
      sub.hierarchy * WEIGHTS.hierarchy +
      sub.spacing * WEIGHTS.spacing +
      sub.components * WEIGHTS.components +
      sub.color * WEIGHTS.color,
  );

  // Pick the notes from the pass closest to the median overall
  const overallMedian = median(passes.map(p => p.overall));
  const closestPass = passes.reduce((best, p) =>
    Math.abs(p.overall - overallMedian) < Math.abs(best.overall - overallMedian)
      ? p
      : best,
  );

  return {scores: sub, overall: clamp(overall), notes: closestPass.notes};
}

// ============================================================
// Ideals discovery
// ============================================================

function getIdealsDir(): string {
  return path.join(import.meta.dirname, '..', 'ideals');
}

/**
 * Find ideal images for a prompt. Uses `__` (double underscore) as separator
 * between promptId and viewport/theme to support multi-segment prompt IDs
 * like `feature-card-1`. Looks for files matching:
 *   ideals/{promptId}__{viewport}__{theme}.png
 *   ideals/{promptId}__{viewport}.png
 *   ideals/{promptId}.png  (fallback — used for all viewport/theme combos)
 */
function findIdeal(
  promptId: string,
  viewport: string,
  theme: string,
): string | null {
  const idealsDir = getIdealsDir();

  // Specific match: cwm-1__desktop__light.png
  const specific = path.join(
    idealsDir,
    `${promptId}__${viewport}__${theme}.png`,
  );
  if (fs.existsSync(specific)) {
    return specific;
  }

  // Viewport match: cwm-1__desktop.png
  const viewportMatch = path.join(idealsDir, `${promptId}__${viewport}.png`);
  if (fs.existsSync(viewportMatch)) {
    return viewportMatch;
  }

  // Generic fallback: cwm-1.png
  const generic = path.join(idealsDir, `${promptId}.png`);
  if (fs.existsSync(generic)) {
    return generic;
  }

  return null;
}

/**
 * List all prompt IDs that have ideals available.
 */
export function listAvailableIdeals(): string[] {
  const idealsDir = getIdealsDir();
  if (!fs.existsSync(idealsDir)) {
    return [];
  }

  const files = fs.readdirSync(idealsDir).filter(f => f.endsWith('.png'));
  const promptIds = new Set<string>();

  for (const file of files) {
    // Extract prompt ID using `__` separator.
    // "cwm-1__desktop__light.png" → "cwm-1"
    // "feature-card-1__desktop.png" → "feature-card-1"
    // "cwm-1.png" → "cwm-1" (no viewport/theme suffix)
    const base = file.replace('.png', '');
    const promptId = base.split('__')[0];
    if (promptId) {
      promptIds.add(promptId);
    }
  }

  return Array.from(promptIds);
}

// ============================================================
// Prompt text lookup
// ============================================================

function loadPromptText(promptId: string): string {
  // Try loading from the test set
  const testSetPath = path.join(
    import.meta.dirname,
    '..',
    'test-sets',
    'default.json',
  );
  if (fs.existsSync(testSetPath)) {
    const testSet = readJson<{prompts: Array<{id: string; prompt: string}>}>(
      testSetPath,
    );
    const match = testSet.prompts.find(p => p.id === promptId);
    if (match) {
      return match.prompt;
    }
  }

  return `UI component identified as ${promptId}`;
}

// ============================================================
// CLI
// ============================================================

function parseArgs(): {
  iteration: string;
  prompts?: string[];
  passes: number;
  model: string;
  dryRun: boolean;
  viewport: string;
  theme: string;
} {
  const args = process.argv.slice(2);
  let iteration = '';
  let prompts: string[] | undefined;
  let passes = 3;
  let model = 'claude-sonnet-4-20250514';
  let dryRun = false;
  let viewport = 'desktop';
  let theme = 'light';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      iteration = args[++i];
    } else if (args[i] === '--prompts' && args[i + 1]) {
      prompts = args[++i].split(',');
    } else if (args[i] === '--passes' && args[i + 1]) {
      passes = parseInt(args[++i], 10);
    } else if (args[i] === '--model' && args[i + 1]) {
      model = args[++i];
    } else if (args[i] === '--viewport' && args[i + 1]) {
      viewport = args[++i];
    } else if (args[i] === '--theme' && args[i + 1]) {
      theme = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (!iteration) {
    console.error(
      'Usage: tsx src/design-judge.ts --iteration <id> [--prompts <p1,p2>] [--passes 3] [--model <model>] [--viewport desktop] [--theme light] [--dry-run]',
    );
    process.exit(1);
  }

  return {iteration, prompts, passes, model, dryRun, viewport, theme};
}

async function main() {
  const {iteration, prompts, passes, model, dryRun, viewport, theme} =
    parseArgs();
  const resultsDir = getResultsDir();
  const iterDir = path.join(resultsDir, iteration);
  const screenshotsDir = path.join(iterDir, 'screenshots');

  // Load screenshot manifest
  const manifestPath = path.join(screenshotsDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(
      `No screenshot manifest found at ${manifestPath}.\n` +
        'Run screenshot-previews.ts first.',
    );
    process.exit(1);
  }

  const manifest =
    readJson<
      Record<string, Record<string, Record<string, Record<string, string>>>>
    >(manifestPath);

  // Discover which prompts have ideals
  const availableIdeals = listAvailableIdeals();
  if (availableIdeals.length === 0) {
    console.error(
      'No ideal reference images found.\n' +
        `Place PNG files in: ${getIdealsDir()}/\n` +
        'Naming: {promptId}-{viewport}-{theme}.png or {promptId}.png',
    );
    process.exit(1);
  }

  console.log(`\n🎨 Design Judge — ${model}`);
  console.log(`   Iteration: ${iteration}`);
  console.log(`   Passes per screenshot: ${passes}`);
  console.log(`   Viewport: ${viewport}, Theme: ${theme}`);
  console.log(`   Available ideals: ${availableIdeals.join(', ')}`);

  // Filter to prompts that have both screenshots and ideals
  const promptsToEvaluate = Object.keys(manifest).filter(promptId => {
    if (prompts && !prompts.includes(promptId)) {
      return false;
    }
    if (!availableIdeals.includes(promptId)) {
      return false;
    }
    return true;
  });

  if (promptsToEvaluate.length === 0) {
    console.error(
      '\nNo prompts have both screenshots and ideal references.\n' +
        `Screenshots exist for: ${Object.keys(manifest).join(', ')}\n` +
        `Ideals exist for: ${availableIdeals.join(', ')}`,
    );
    process.exit(1);
  }

  console.log(`   Prompts to evaluate: ${promptsToEvaluate.join(', ')}\n`);

  const results: DesignResult[] = [];
  const targets = ['astryx', 'baseline', 'html'];

  for (const promptId of promptsToEvaluate) {
    const promptText = loadPromptText(promptId);

    for (const target of targets) {
      const screenshotFilename =
        manifest[promptId]?.[target]?.[viewport]?.[theme];
      if (!screenshotFilename) {
        console.log(
          `  ⏭ No screenshot: ${promptId}/${target}/${viewport}/${theme}`,
        );
        continue;
      }

      const screenshotPath = path.join(screenshotsDir, screenshotFilename);
      if (!fs.existsSync(screenshotPath)) {
        console.log(`  ⏭ Screenshot file missing: ${screenshotFilename}`);
        continue;
      }

      const idealPath = findIdeal(promptId, viewport, theme);
      if (!idealPath) {
        console.log(`  ⏭ No ideal for: ${promptId}/${viewport}/${theme}`);
        continue;
      }

      console.log(`  🔍 ${promptId} / ${target} / ${viewport}-${theme}`);

      if (dryRun) {
        console.log(`     [dry-run] Would call ${model} with ${passes} passes`);
        console.log(`     Ideal: ${path.basename(idealPath)}`);
        console.log(`     Screenshot: ${screenshotFilename}`);
        continue;
      }

      // Run multiple passes for stability
      const judgments: DesignJudgment[] = [];
      for (let pass = 1; pass <= passes; pass++) {
        try {
          const judgment = await callVisionJudge(
            idealPath,
            screenshotPath,
            promptText,
            model,
          );
          judgments.push(judgment);
          console.log(
            `     Pass ${pass}/${passes}: ${judgment.overall} ` +
              `(L:${judgment.scores.layout} H:${judgment.scores.hierarchy} ` +
              `S:${judgment.scores.spacing} C:${judgment.scores.components} ` +
              `Co:${judgment.scores.color})`,
          );
        } catch (err) {
          console.error(
            `     Pass ${pass}/${passes} failed: ${err instanceof Error ? err.message : err}`,
          );
        }

        // Rate limiting: 500ms between calls
        if (pass < passes) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (judgments.length === 0) {
        console.error(`     ✗ All passes failed for ${promptId}/${target}`);
        continue;
      }

      const med = medianJudgment(judgments);
      console.log(`     ✓ Median: ${med.overall} — ${med.notes}`);

      results.push({
        promptId,
        target,
        viewport,
        theme,
        passes: judgments,
        median: med,
        idealPath: path.relative(iterDir, idealPath),
        screenshotPath: screenshotFilename,
      });
    }
  }

  if (dryRun) {
    console.log('\n🏁 Dry run complete. No API calls made.');
    return;
  }

  // Build summary: prompt → target → scores
  const summary: DesignScores['summary'] = {};
  for (const result of results) {
    if (!summary[result.promptId]) {
      summary[result.promptId] = {};
    }
    summary[result.promptId][result.target] = {
      overall: result.median.overall,
      sub: result.median.scores,
    };
  }

  const output: DesignScores = {
    iterationId: iteration,
    timestamp: new Date().toISOString(),
    model,
    passCount: passes,
    results,
    summary,
  };

  const outputPath = path.join(iterDir, 'design-scores.json');
  writeJson(outputPath, output);
  console.log(`\n✅ Design scores written to ${outputPath}`);

  // Print summary table
  console.log('\n📊 Summary:\n');
  const promptIds = Object.keys(summary);
  const header = ['Prompt', ...targets.map(t => `${t} (overall)`)].join('\t');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const pid of promptIds) {
    const row = [
      pid,
      ...targets.map(t =>
        summary[pid]?.[t] ? String(summary[pid][t].overall) : '—',
      ),
    ];
    console.log(row.join('\t'));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
