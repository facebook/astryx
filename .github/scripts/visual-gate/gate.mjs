#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The visual gate CLI.
 *
 * @input  a built Storybook, a baseline directory
 * @output a verdict (JSON), a report (HTML), and — only ever through `accept`
 *         — a new baseline
 *
 * Commands:
 *   plan     what would be captured, and why
 *   capture  take the shots
 *   check    capture, compare against the baseline, write verdict + report
 *   accept   record that the after is the correct picture, for named shots
 *
 * Exit codes are the contract for automation: 0 clean, 1 crashed, 2 changed.
 * `changed` is separated from `crashed` precisely because a change is a
 * question ("is this what you meant?") and a crash is not.
 *
 * Usage:
 *   node .github/scripts/visual-gate/gate.mjs check \
 *     --storybook-dir apps/storybook/dist --baseline .visual-baseline --out .visual-run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

import {capture, scout} from './lib/capture.mjs';
import {analyzeTargeting, buildVerdict, compareCaptures} from './lib/compare.mjs';
import {buildPlan, readStoryIndex} from './lib/plan.mjs';
import {renderReport} from './lib/report.mjs';
import {accept, incomparable, readBaseline} from './lib/baseline.mjs';
import {loadConfig, loadThemeOverrides, loadThemingTargets} from './lib/sources.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const EXIT = {clean: 0, crashed: 1, changed: 2};

const argv = process.argv.slice(2);
const command = argv[0];
const flag = name => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? null : argv[index + 1];
};
const has = name => argv.includes(`--${name}`);

const config = loadConfig(REPO_ROOT);
const storybookDir = path.resolve(flag('storybook-dir') ?? 'apps/storybook/dist');
const baselineDir = path.resolve(flag('baseline') ?? '.visual-baseline');
let outDir = path.resolve(flag('out') ?? '.visual-run');
const tiers = (flag('tiers') ?? config.tiers.join(',')).split(',').filter(Boolean);
const sample = flag('sample') ? Number(flag('sample')) : null;
/** Restrict the plan to story ids containing any of these — for debugging a shot, never for a gate run. */
const only = (flag('only') ?? '').split(',').filter(Boolean);

/**
 * Which stories the scout needs to look at: every story of a component some
 * theme overrides. Scouting the whole index would cost more than it returns —
 * the surface tier photographs one story per component regardless.
 *
 * @param {ReturnType<typeof readStoryIndex>} stories
 * @param {Array<{key: string, component: string}>} targets
 * @param {Record<string, Record<string, string[]>>} themeOverrides
 * @returns {string[]}
 */
function storiesToScout(stories, targets, themeOverrides) {
  const overridden = new Set(Object.values(themeOverrides).flatMap(keys => Object.keys(keys)));
  const components = new Set(
    targets.filter(target => overridden.has(target.key)).map(target => target.component),
  );
  return stories.filter(story => components.has(story.component)).map(story => story.id);
}

/** @returns {Promise<import('./lib/plan.mjs').Shot[]>} */
async function plan() {
  const [targets, themeOverrides] = await Promise.all([
    loadThemingTargets(REPO_ROOT),
    loadThemeOverrides(REPO_ROOT),
  ]);
  const stories = readStoryIndex(storybookDir, Object.keys(config.excludeStories));

  let observations;
  if (!has('no-scout') && tiers.includes('theme-matrix')) {
    const cachePath = flag('observations');
    if (cachePath && fs.existsSync(cachePath)) {
      observations = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } else {
      const storyIds = storiesToScout(stories, targets, themeOverrides);
      process.stderr.write(`Scouting ${storyIds.length} stories for theming targets…\n`);
      observations = await scout({
        storyIds,
        storybookDir,
        theme: config.defaultTheme,
        viewport: config.viewport,
      });
      if (cachePath) fs.writeFileSync(cachePath, `${JSON.stringify(observations)}\n`);
    }
  }

  const shots = buildPlan({
    stories,
    targets,
    themeOverrides,
    observations,
    defaultTheme: config.defaultTheme,
    tiers,
  });
  // A sample is for trying the rig out, never for a gate run: it is taken
  // evenly across the plan so it spans components rather than the first few.
  const filtered = only.length
    ? shots.filter(shot => only.some(fragment => shot.storyId.includes(fragment)))
    : shots;
  if (!sample || sample >= filtered.length) return filtered;
  const step = filtered.length / sample;
  return Array.from({length: sample}, (_, index) => filtered[Math.floor(index * step)]);
}

async function runCapture(shots) {
  fs.rmSync(outDir, {recursive: true, force: true});
  fs.mkdirSync(outDir, {recursive: true});
  let last = 0;
  const {manifest, failures} = await capture({
    plan: shots,
    storybookDir,
    outDir,
    viewport: config.viewport,
    settleMs: config.settleMs,
    fastGlobals: !has('no-fast-globals'),
    onProgress: ({done, total}) => {
      if (done === total || done - last >= 50) {
        last = done;
        process.stderr.write(`  captured ${done}/${total}\n`);
      }
    },
  });
  manifest.context = {
    sha: process.env.GITHUB_SHA ?? null,
    ref: process.env.GITHUB_REF ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
  };
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return {manifest, failures};
}

/** Copy the three image sets the report links to, next to the report itself. */
function stageReportImages({reportDir, keys, currentDir, baselinePath}) {
  for (const [name, source] of [
    ['before', baselinePath],
    ['after', path.join(currentDir, 'shots')],
  ]) {
    fs.mkdirSync(path.join(reportDir, name), {recursive: true});
    for (const key of keys) {
      const from = path.join(source, `${key}.png`);
      if (fs.existsSync(from)) fs.copyFileSync(from, path.join(reportDir, name, `${key}.png`));
    }
  }
}

async function check() {
  const shots = await plan();
  process.stderr.write(`Visual gate: ${shots.length} shots (${tiers.join(', ')})\n`);
  const {manifest, failures} = await runCapture(shots);

  const {manifest: baselineManifest, exists} = readBaseline(baselineDir);
  const blocker = exists ? incomparable(baselineManifest, manifest) : null;
  if (blocker) {
    process.stderr.write(`::error::Baseline is not comparable — ${blocker}\n`);
    return EXIT.crashed;
  }

  const reportDir = path.join(outDir, 'report');
  const comparison = await compareCaptures({
    baselineDir: path.join(baselineDir, 'shots'),
    currentDir: path.join(outDir, 'shots'),
    baselineManifest,
    currentManifest: manifest,
    diffDir: path.join(reportDir, 'diff'),
    threshold: config.threshold,
    maxDiffPixels: config.maxDiffPixels,
  });

  const [targets, themeOverrides] = await Promise.all([
    loadThemingTargets(REPO_ROOT),
    loadThemeOverrides(REPO_ROOT),
  ]);
  const targeting = analyzeTargeting({
    observedTargets: manifest.observedTargets,
    targets,
    themeOverrides,
  });

  const verdict = buildVerdict({
    comparison,
    currentManifest: manifest,
    baselineManifest,
    targeting,
    failures,
    context: {...manifest.context, tiers, baselineExists: exists},
  });

  stageReportImages({
    reportDir,
    keys: comparison.changes.map(change => change.key),
    currentDir: outDir,
    baselinePath: path.join(baselineDir, 'shots'),
  });
  fs.writeFileSync(path.join(reportDir, 'index.html'), renderReport(verdict));
  const verdictJson = `${JSON.stringify(verdict, null, 2)}\n`;
  fs.writeFileSync(path.join(outDir, 'verdict.json'), verdictJson);
  // Also inside the report, so the published report directory is self-contained
  // and the verdict has a stable URL next to the pictures it describes.
  fs.writeFileSync(path.join(reportDir, 'verdict.json'), verdictJson);

  const summary = summarize(verdict, exists);
  process.stdout.write(summary);
  if (flag('summary-output')) fs.writeFileSync(flag('summary-output'), summary);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      [
        `status=${verdict.status}`,
        `changed=${verdict.counts.changed}`,
        `added=${verdict.counts.added}`,
        `failed=${verdict.counts.failed}`,
        `total=${verdict.counts.total}`,
      ].join('\n') + '\n',
    );
  }

  if (verdict.status === 'failed') return EXIT.crashed;
  return verdict.status === 'changed' ? EXIT.changed : EXIT.clean;
}

/** @param {object} verdict @param {boolean} baselineExists */
function summarize(verdict, baselineExists) {
  const lines = [`## Visual gate: ${verdict.status}`, ''];
  if (!baselineExists) {
    lines.push('No baseline existed — this run establishes one. Nothing was compared.', '');
  }
  lines.push(
    `| shots | changed | added | removed | failed |`,
    `|---|---|---|---|---|`,
    `| ${verdict.counts.total} | ${verdict.counts.changed} | ${verdict.counts.added} | ${verdict.counts.removed} | ${verdict.counts.failed} |`,
    '',
  );
  if (verdict.changes.length > 0) {
    lines.push('### Changed', '', '| shot | theme | mode | diff px | why it is in the plan |', '|---|---|---|---|---|');
    for (const change of verdict.changes.slice(0, 40)) {
      lines.push(
        `| \`${change.key}\` | ${change.theme} | ${change.mode} | ${change.diffPixels} | ${(change.reasons ?? []).join(', ')} |`,
      );
    }
    if (verdict.changes.length > 40) lines.push(`| … | | | | ${verdict.changes.length - 40} more |`);
    lines.push('');
  }
  const unexercised = verdict.targeting?.unexercisedOverrides ?? [];
  if (unexercised.length > 0) {
    lines.push(
      `### Theme overrides that bound to nothing (${unexercised.length})`,
      '',
      ...unexercised
        .slice(0, 25)
        .map(finding => `- \`${finding.theme}\` → \`${finding.key}${finding.selector ? `.${finding.selector}` : ''}\``),
      '',
    );
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  switch (command) {
    case 'plan': {
      const shots = await plan();
      if (has('json')) {
        process.stdout.write(`${JSON.stringify(shots, null, 2)}\n`);
        return EXIT.clean;
      }
      const byReason = {};
      for (const shot of shots) {
        for (const reason of shot.reasons) {
          const bucket = reason.split(':').slice(0, 2).join(':');
          byReason[bucket] = (byReason[bucket] ?? 0) + 1;
        }
      }
      process.stdout.write(`${shots.length} shots\n`);
      for (const [reason, count] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
        process.stdout.write(`  ${String(count).padStart(5)}  ${reason}\n`);
      }
      return EXIT.clean;
    }
    case 'capture': {
      const shots = await plan();
      const {failures} = await runCapture(shots);
      process.stdout.write(`Captured ${shots.length - failures.length}/${shots.length} into ${outDir}\n`);
      return failures.length > 0 ? EXIT.crashed : EXIT.clean;
    }
    case 'check':
      return check();
    case 'flaky': {
      // A gate that cries wolf gets ignored, so the exclusion list is
      // evidence, not guesswork: capture the same build twice and name every
      // shot that could not reproduce itself.
      const shots = await plan();
      const passes = Number(flag('passes') ?? 2);
      /** @type {Map<string, Set<string>>} */
      const seen = new Map();
      const passRoot = outDir;
      for (let pass = 0; pass < passes; pass += 1) {
        process.stderr.write(`Pass ${pass + 1}/${passes}\n`);
        // Each pass keeps its own directory: when a shot turns out to be
        // unstable, the evidence of how it differed has to survive the run.
        outDir = path.join(passRoot, `pass-${pass + 1}`);
        const {manifest} = await runCapture(shots);
        for (const [key, shot] of Object.entries(manifest.shots)) {
          if (!seen.has(key)) seen.set(key, new Set());
          seen.get(key).add(shot.sha256);
        }
      }
      outDir = passRoot;
      const unstable = [...seen.entries()]
        .filter(([, hashes]) => hashes.size > 1)
        .map(([key]) => key);
      const stories = [...new Set(unstable.map(key => key.split('__')[0]))].sort();
      process.stdout.write(
        `${unstable.length} unstable shot(s) across ${passes} passes, in ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'}\n`,
      );
      for (const story of stories) process.stdout.write(`  ${story}\n`);
      if (unstable.length > 0) {
        process.stdout.write(
          `\nEach pass is kept under ${passRoot} — diff them to see what moved, then add these to excludeStories in visual-gate.config.json with the reason each one cannot reproduce.\n`,
        );
      }
      return unstable.length > 0 ? EXIT.changed : EXIT.clean;
    }
    case 'accept': {
      const manifestPath = path.join(outDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error(`No capture at ${outDir} — run check or capture first.`);
      }
      const currentManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const verdictPath = path.join(outDir, 'verdict.json');
      const verdict = fs.existsSync(verdictPath)
        ? JSON.parse(fs.readFileSync(verdictPath, 'utf8'))
        : null;
      const requested = flag('keys');
      const keys =
        !requested || requested === 'all'
          ? Object.keys(currentManifest.shots)
          : requested.split(',').filter(Boolean);
      const result = accept({
        baselineDir,
        captureDir: outDir,
        currentManifest,
        keys,
        reason: flag('reason') ?? '',
        actor: flag('actor') ?? process.env.GITHUB_ACTOR ?? process.env.USER ?? 'unknown',
        runId: process.env.GITHUB_RUN_ID ?? null,
        prune: has('prune') ? (verdict?.removed ?? []) : [],
      });
      process.stdout.write(
        `Promoted ${result.promoted.length} shot(s), pruned ${result.pruned.length}, into ${baselineDir}\n`,
      );
      return EXIT.clean;
    }
    default:
      process.stderr.write(
        'Usage: gate.mjs <flaky|plan|capture|check|accept> [--storybook-dir dir] [--baseline dir] [--out dir] [--tiers a,b] [--sample n]\n',
      );
      return EXIT.crashed;
  }
}

main().then(
  code => process.exit(code),
  error => {
    process.stderr.write(`::error::${error?.stack ?? error}\n`);
    process.exit(EXIT.crashed);
  },
);
