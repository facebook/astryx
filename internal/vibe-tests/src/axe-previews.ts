#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runtime accessibility scan of pre-built preview HTML via axe-core
 * @input Pre-built preview HTML files from build-previews.ts
 * @output axe-results.json sidecar per iteration (consumed by universal-eval.ts)
 * @position internal/vibe-tests/src/axe-previews.ts
 *
 * Loads each preview in headless Chromium (light + dark), runs axe-core
 * against the live rendered DOM, and writes per-prompt violations keyed by
 * promptId — the same sidecar pattern as build-errors.json. The next
 * universal-aggregate run picks the sidecar up automatically and folds the
 * violations into the accessibility dimension (issue #4145): this is what
 * lets the score see focus, ARIA wiring, and contrast — things the static
 * scan of consumer code structurally cannot.
 *
 * Usage:
 *   tsx src/axe-previews.ts --iterations 8734233a,d4ff8c2c
 *   tsx src/axe-previews.ts --iterations 8734233a --prompts tc-4 --themes light
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import type {chromium as PlaywrightChromium} from 'playwright';
import {
  getResultsDir,
  writeJson,
  serveStatic,
  enumeratePreviews,
} from './utils.js';
import type {
  AxeResultForPrompt,
  AxeResults,
  AxeViolationRecord,
} from './types.js';

const VIEWPORT = {width: 1280, height: 800};
const DEFAULT_THEMES = ['light', 'dark'] as const;

/** One raw axe violation as reported for a single theme's scan. */
export interface RawAxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  /** Number of affected DOM nodes */
  nodes: number;
}

/** One theme's axe scan of one preview page. */
export interface RawAxeRun {
  theme: string;
  violations: RawAxeViolation[];
  passes: number;
  incomplete: number;
}

const IMPACT_RANK: Record<string, number> = {
  critical: 3,
  serious: 2,
  moderate: 1,
  minor: 0,
};

/** axe reports impact as nullable; unknown/missing maps to moderate. */
function normalizeImpact(
  impact: string | null | undefined,
): AxeViolationRecord['impact'] {
  return impact != null && impact in IMPACT_RANK
    ? (impact as AxeViolationRecord['impact'])
    : 'moderate';
}

/**
 * Merge per-theme axe runs into one per-prompt record: violations union by
 * rule id (max nodes, highest impact, themes attributed), passes take the
 * strictest count across themes, incomplete the loosest.
 */
export function mergeAxeRuns(
  target: string,
  runs: RawAxeRun[],
): AxeResultForPrompt {
  if (runs.length === 0) {
    return {
      target,
      themesScanned: [],
      violations: [],
      passes: 0,
      incomplete: 0,
    };
  }

  const byId = new Map<string, AxeViolationRecord>();
  for (const run of runs) {
    for (const v of run.violations) {
      const impact = normalizeImpact(v.impact);
      const existing = byId.get(v.id);
      if (!existing) {
        byId.set(v.id, {
          id: v.id,
          impact,
          help: v.help,
          nodes: v.nodes,
          themes: [run.theme],
        });
      } else {
        existing.nodes = Math.max(existing.nodes, v.nodes);
        if (!existing.themes.includes(run.theme)) {
          existing.themes.push(run.theme);
        }
        if (IMPACT_RANK[impact] > IMPACT_RANK[existing.impact]) {
          existing.impact = impact;
        }
      }
    }
  }

  return {
    target,
    themesScanned: runs.map(r => r.theme),
    violations: [...byId.values()],
    passes: Math.min(...runs.map(r => r.passes)),
    incomplete: Math.max(...runs.map(r => r.incomplete)),
  };
}

/**
 * Axe-scan every preview of one iteration and write the axe-results.json
 * sidecar. Returns the results, or null when the iteration has no previews.
 * When a prompt has previews for several targets, the iteration's configured
 * target wins — that's the code universal-aggregate evaluates.
 */
export async function scanIteration(opts: {
  resultsDir: string;
  iterationId: string;
  prompts?: string[];
  themes?: readonly string[];
}): Promise<AxeResults | null> {
  const {resultsDir, iterationId, prompts} = opts;
  const themes = opts.themes ?? DEFAULT_THEMES;
  const iterDir = path.join(resultsDir, iterationId);

  const previews = enumeratePreviews(iterDir, prompts);
  if (previews.length === 0) {
    console.error(`  ⚠ No preview HTML files found for ${iterationId}`);
    return null;
  }

  let iterTarget = 'astryx';
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(iterDir, 'manifest.json'), 'utf-8'),
    );
    iterTarget = manifest?.config?.target ?? 'astryx';
  } catch {
    // No iteration manifest — keep the default target
  }

  const byPrompt = new Map<string, (typeof previews)[number]>();
  for (const p of previews) {
    const existing = byPrompt.get(p.promptId);
    if (
      !existing ||
      (p.target === iterTarget && existing.target !== iterTarget)
    ) {
      byPrompt.set(p.promptId, p);
    }
  }

  let chromium: typeof PlaywrightChromium;
  try {
    ({chromium} = await import('playwright'));
  } catch {
    throw new Error(
      'Playwright is not installed. Run:\n' +
        '  npx playwright install chromium --with-deps\n',
    );
  }
  const axeMod = (await import('@axe-core/playwright')) as {
    default?: unknown;
    AxeBuilder?: unknown;
  };
  const AxeBuilder = (axeMod.default ?? axeMod.AxeBuilder) as new (opts: {
    page: unknown;
  }) => {analyze: () => Promise<RawAxeAnalysis>};

  const server = await serveStatic(iterDir);
  const browser = await chromium.launch();
  const results: AxeResults = {};

  try {
    for (const preview of byPrompt.values()) {
      const relPath = path
        .relative(iterDir, preview.path)
        .split(path.sep)
        .join('/');
      const runs: RawAxeRun[] = [];

      for (const theme of themes) {
        // AxeBuilder requires pages created from an explicit context
        const context = await browser.newContext({
          viewport: VIEWPORT,
          colorScheme: theme as 'light' | 'dark',
        });
        const page = await context.newPage();
        try {
          const url = `${server.url}/${relPath}`;
          try {
            await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
          } catch {
            // Fallback: wait for load instead of networkidle
            await page.goto(url, {waitUntil: 'load', timeout: 15000});
          }
          // Wait for fonts and rendering
          await page.waitForTimeout(1000);

          const axe = await new AxeBuilder({page}).analyze();
          runs.push({
            theme,
            violations: axe.violations.map(v => ({
              id: v.id,
              impact: v.impact ?? null,
              help: v.help,
              nodes: v.nodes.length,
            })),
            passes: axe.passes.length,
            incomplete: axe.incomplete.length,
          });
        } finally {
          await page.close();
          await context.close();
        }
      }

      results[preview.promptId] = mergeAxeRuns(preview.target, runs);
      const count = results[preview.promptId].violations.length;
      console.log(
        `  ${count === 0 ? '✓' : '✗'} ${preview.promptId} (${preview.target}): ${count} violation rule(s)`,
      );
    }

    writeJson(path.join(iterDir, 'axe-results.json'), results);
  } finally {
    await browser.close();
    await server.close();
  }

  return results;
}

/** The subset of axe's analyze() output this script reads. */
interface RawAxeAnalysis {
  violations: Array<{
    id: string;
    impact?: string | null;
    help: string;
    nodes: unknown[];
  }>;
  passes: unknown[];
  incomplete: unknown[];
}

function parseArgs(): {
  iterations: string[];
  prompts?: string[];
  themes?: string[];
} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];
  let prompts: string[] | undefined;
  let themes: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    } else if (args[i] === '--prompts' && args[i + 1]) {
      prompts = args[++i].split(',');
    } else if (args[i] === '--themes' && args[i + 1]) {
      themes = args[++i].split(',');
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/axe-previews.ts --iterations <id1,id2,...> [--prompts <p1,p2,...>] [--themes light,dark]',
    );
    process.exit(1);
  }

  return {iterations, prompts, themes};
}

async function main() {
  const {iterations, prompts, themes} = parseArgs();
  const resultsDir = getResultsDir();

  let scanned = 0;
  let violationRules = 0;

  for (const iterationId of iterations) {
    console.log(`\n♿ Axe-scanning previews for ${iterationId}...\n`);
    const results = await scanIteration({
      resultsDir,
      iterationId,
      prompts,
      themes,
    });
    if (results) {
      scanned += Object.keys(results).length;
      violationRules += Object.values(results).reduce(
        (sum, r) => sum + r.violations.length,
        0,
      );
    }
  }

  console.log(
    `\n✅ Scanned ${scanned} preview(s); ${violationRules} violation rule(s) found`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
