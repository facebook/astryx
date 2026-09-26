#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Runtime accessibility scan of pre-built preview HTML via axe-core
 * @input Pre-built preview HTML files from build-previews.ts
 * @output axe-results.json sidecar per iteration (consumed by universal-eval.ts)
 * @position internal/vibe-tests/src/axe-previews.ts
 *
 * Loads each preview in headless Chromium (light + dark, requested through
 * both prefers-color-scheme and ?theme=), records which theme each scan
 * actually rendered in, runs axe-core against the live rendered DOM, and
 * writes per-prompt violations keyed by
 * promptId — the same sidecar pattern as build-errors.json. The next
 * universal-aggregate run picks the sidecar up automatically and folds the
 * violations into the accessibility dimension (issue #4145): this is what
 * lets the score see focus, ARIA wiring, and contrast — things the static
 * scan of consumer code structurally cannot.
 *
 * build-previews writes every listed iteration's previews under the first
 * iteration's previews/, so each iteration reads them from there (override
 * with --previews-from), keeps only its own target's renders, and gets its
 * own sidecar.
 *
 * Usage:
 *   tsx src/axe-previews.ts --iterations 8734233a,d4ff8c2c
 *   tsx src/axe-previews.ts --iterations 8734233a --prompts tc-4 --themes light
 *   tsx src/axe-previews.ts --iterations d4ff8c2c --previews-from 8734233a
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import type {chromium as PlaywrightChromium} from 'playwright';
import {
  getResultsDir,
  hashContent,
  writeJson,
  serveStatic,
  enumeratePreviews,
  type PreviewFile,
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
  /** Theme the scan requested */
  theme: string;
  /** Theme the page actually rendered in (see resolveEffectiveTheme) */
  effectiveTheme: string;
  violations: RawAxeViolation[];
  passes: number;
  incomplete: number;
  /** Ids of the rules that passed */
  passedRules: string[];
  /** Ids of the rules axe could not decide */
  incompleteRules: string[];
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
 * The theme a scan actually rendered in, from the computed color-scheme of
 * the page's theme root. A page that pins one scheme (a preview built with
 * `<Theme mode="light">`) ignores the requested one, so its "dark" scan is a
 * second light scan; a page that allows both schemes, or declares none,
 * follows the request.
 */
export function resolveEffectiveTheme(
  requested: string,
  colorScheme: string,
): string {
  const schemes = colorScheme
    .split(/\s+/)
    .filter(s => s === 'light' || s === 'dark');
  return schemes.length === 1 ? schemes[0] : requested;
}

/**
 * Merge per-theme axe runs into one per-prompt record: violations union by
 * rule id (max nodes, highest impact, attributed to the themes that actually
 * rendered), passes take the strictest count across themes, incomplete the
 * loosest, and the passed and incomplete rule ids union across themes.
 */
export function mergeAxeRuns(
  target: string,
  runs: RawAxeRun[],
): AxeResultForPrompt {
  if (runs.length === 0) {
    return {
      target,
      themesScanned: [],
      effectiveThemes: {},
      violations: [],
      passes: 0,
      incomplete: 0,
      passedRules: [],
      incompleteRules: [],
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
          themes: [run.effectiveTheme],
        });
      } else {
        existing.nodes = Math.max(existing.nodes, v.nodes);
        if (!existing.themes.includes(run.effectiveTheme)) {
          existing.themes.push(run.effectiveTheme);
        }
        if (IMPACT_RANK[impact] > IMPACT_RANK[existing.impact]) {
          existing.impact = impact;
        }
      }
    }
  }

  return {
    target,
    themesScanned: [...new Set(runs.map(r => r.effectiveTheme))],
    effectiveThemes: Object.fromEntries(
      runs.map(r => [r.theme, r.effectiveTheme]),
    ),
    violations: [...byId.values()],
    passes: Math.min(...runs.map(r => r.passes)),
    incomplete: Math.max(...runs.map(r => r.incomplete)),
    passedRules: [...new Set(runs.flatMap(r => r.passedRules))],
    incompleteRules: [...new Set(runs.flatMap(r => r.incompleteRules))],
  };
}

/**
 * Keep only the previews built from the iteration's own target — that's the
 * code universal-aggregate evaluates. Another target's render of the same
 * prompt is another iteration's code, so it never stands in for a missing
 * build.
 */
export function selectPreviewsForIteration(
  previews: PreviewFile[],
  iterTarget: string,
): PreviewFile[] {
  return previews.filter(p => p.target === iterTarget);
}

/** The iteration's configured target (from its manifest.json). */
function readIterationTarget(iterDir: string): string {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(iterDir, 'manifest.json'), 'utf-8'),
    );
    return manifest?.config?.target ?? 'astryx';
  } catch {
    // No iteration manifest — keep the default target
    return 'astryx';
  }
}

/**
 * Axe-scan every preview of one iteration and write the axe-results.json
 * sidecar into the iteration's directory. Returns the results, or null when
 * the iteration has no previews for its target.
 */
export async function scanIteration(opts: {
  resultsDir: string;
  iterationId: string;
  /**
   * Iteration whose previews/ holds the built HTML — build-previews writes
   * every iteration's previews under the first one. Defaults to iterationId.
   */
  previewsFrom?: string;
  prompts?: string[];
  themes?: readonly string[];
}): Promise<AxeResults | null> {
  const {resultsDir, iterationId, prompts} = opts;
  const themes = opts.themes ?? DEFAULT_THEMES;
  const iterDir = path.join(resultsDir, iterationId);
  const previewsRoot = path.join(resultsDir, opts.previewsFrom ?? iterationId);
  const iterTarget = readIterationTarget(iterDir);

  const previews = selectPreviewsForIteration(
    enumeratePreviews(previewsRoot, prompts),
    iterTarget,
  );
  if (previews.length === 0) {
    console.error(
      `  ⚠ No ${iterTarget} preview HTML files found for ${iterationId}`,
    );
    return null;
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

  const server = await serveStatic(previewsRoot);
  const browser = await chromium.launch();
  const results: AxeResults = {};

  try {
    for (const preview of previews) {
      const relPath = path
        .relative(previewsRoot, preview.path)
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
          // Astryx previews take their mode from ?theme (default light)
          const url = `${server.url}/${relPath}?theme=${theme}`;
          try {
            await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
          } catch {
            // Fallback: wait for load instead of networkidle
            await page.goto(url, {waitUntil: 'load', timeout: 15000});
          }
          // Wait for fonts and rendering
          await page.waitForTimeout(1000);

          // A preview that pins its scheme (e.g. built before ?theme was
          // honoured) never renders the requested theme
          const colorScheme = await page.evaluate(() => {
            const root =
              document.querySelector('[data-astryx-theme]') ??
              document.documentElement;
            return getComputedStyle(root).colorScheme;
          });

          const axe = await new AxeBuilder({page}).analyze();
          runs.push({
            theme,
            effectiveTheme: resolveEffectiveTheme(theme, colorScheme),
            violations: axe.violations.map(v => ({
              id: v.id,
              impact: v.impact ?? null,
              help: v.help,
              nodes: v.nodes.length,
            })),
            passes: axe.passes.length,
            incomplete: axe.incomplete.length,
            passedRules: axe.passes.map(p => p.id),
            incompleteRules: axe.incomplete.map(i => i.id),
          });
        } finally {
          await page.close();
          await context.close();
        }
      }

      results[preview.promptId] = mergeAxeRuns(preview.target, runs);
      // Stamp the scanned code so a later edit makes this entry stale
      const codePath = path.join(iterDir, 'results', `${preview.promptId}.tsx`);
      if (fs.existsSync(codePath)) {
        results[preview.promptId].sourceHash = hashContent(
          fs.readFileSync(codePath, 'utf-8'),
        );
      }
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
  passes: Array<{id: string}>;
  incomplete: Array<{id: string}>;
}

function parseArgs(): {
  iterations: string[];
  previewsFrom: string;
  prompts?: string[];
  themes?: string[];
} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];
  let previewsFrom = '';
  let prompts: string[] | undefined;
  let themes: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    } else if (args[i] === '--previews-from' && args[i + 1]) {
      previewsFrom = args[++i];
    } else if (args[i] === '--prompts' && args[i + 1]) {
      prompts = args[++i].split(',');
    } else if (args[i] === '--themes' && args[i + 1]) {
      themes = args[++i].split(',');
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/axe-previews.ts --iterations <id1,id2,...> [--previews-from <id>] [--prompts <p1,p2,...>] [--themes light,dark]',
    );
    process.exit(1);
  }

  // Same default as build-previews' output directory
  return {
    iterations,
    previewsFrom: previewsFrom || iterations[0],
    prompts,
    themes,
  };
}

async function main() {
  const {iterations, previewsFrom, prompts, themes} = parseArgs();
  const resultsDir = getResultsDir();
  const targets = new Map(
    iterations.map(id => [id, readIterationTarget(path.join(resultsDir, id))]),
  );

  let scanned = 0;
  let violationRules = 0;

  for (const iterationId of iterations) {
    // Iterations with the same target overwrite each other's
    // <promptId>/<target>.html, so no scan can tell whose render it sees
    const target = targets.get(iterationId);
    const sharing = iterations.filter(
      id => id !== iterationId && targets.get(id) === target,
    );
    if (sharing.length > 0) {
      console.error(
        `\n  ⚠ Skipping ${iterationId}: its ${target} previews collide with ${sharing.join(', ')}`,
      );
      continue;
    }

    console.log(`\n♿ Axe-scanning previews for ${iterationId}...\n`);
    const results = await scanIteration({
      resultsDir,
      iterationId,
      previewsFrom,
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
