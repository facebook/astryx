// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discovery-aggregate.ts
 * @input --experiment <id> (in-repo config) | --iso <id> (isolated /tmp config)
 * @output Per-condition discovery funnel + results/discovery-summary-<id>.json
 * @position internal/vibe-tests/cli-discovery-test — scores the cold-start experiment
 *
 * Funnel is defined by GROUND TRUTH — the .astryx-invocations.log the bin shim
 * writes — not by self-report. Self-report (the discovery block in the result
 * JSON) is a secondary cross-check, and also surfaces a channel the shim can't
 * see: core's built-in `docs.mjs` (reached via the package README), which is a
 * discovery path that ships in `@astryxdesign/core` today (PLAN.md §14/§15).
 *
 * Rates carry a Wilson 95% CI so "works consistently" is legible.
 *
 * Usage:
 *   npx tsx cli-discovery-test/discovery-aggregate.ts --experiment <id>
 *   npx tsx cli-discovery-test/discovery-aggregate.ts --iso <id>
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const EXP_DIR = import.meta.dirname;
const VIBE_DIR = path.resolve(EXP_DIR, '..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');

const DOC_RETRIEVAL_CMDS = new Set([
  'component',
  'build',
  'search',
  'template',
  'docs',
  'swizzle',
]);

interface LogEntry {
  ts: string;
  argv: string[];
}

interface TaskDesc {
  taskId: string;
  basePromptId: string;
  category: string;
  projectDir: string;
  invocationLog: string;
}

interface RunResult {
  taskId: string;
  category: string;
  invokedAstryx: boolean;
  ranInit: boolean;
  ranDocRetrieval: boolean;
  usedCoreDocsMjs: boolean; // self-reported README → docs.mjs channel (shim can't see it)
  howDiscovered: string | null;
  commands: string[];
  completed: boolean;
}

function wilson(
  successes: number,
  n: number,
  z = 1.96,
): {p: number; lo: number; hi: number} {
  if (n === 0) {
    return {p: 0, lo: 0, hi: 0};
  }
  const phat = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = phat + z2 / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n);
  return {
    p: phat,
    lo: Math.max(0, (center - margin) / denom),
    hi: Math.min(1, (center + margin) / denom),
  };
}

function readJsonl(file: string): LogEntry[] {
  if (!fs.existsSync(file)) {
    return [];
  }
  return fs
    .readFileSync(file, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l) as LogEntry);
}

function subcommand(argv: string[]): string | null {
  return argv.find(a => !a.startsWith('-')) ?? null;
}

function evaluateRun(task: TaskDesc): RunResult {
  const log = readJsonl(task.invocationLog);
  const subs = log
    .map(e => subcommand(e.argv))
    .filter((s): s is string => s !== null);

  let selfReport: {howDiscovered?: string; cliCommandsRun?: string[]} | null =
    null;
  let docsRead: string[] = [];
  const metaPath = path.join(task.projectDir, `${task.basePromptId}.json`);
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      selfReport = meta.discovery ?? null;
      docsRead = Array.isArray(meta.docsRead) ? meta.docsRead : [];
    } catch {
      /* malformed metadata */
    }
  }

  const reportedCmds = selfReport?.cliCommandsRun ?? [];
  const usedCoreDocsMjs =
    reportedCmds.some(c => c.includes('docs.mjs')) ||
    docsRead.some(d => String(d).toLowerCase().includes('readme'));

  return {
    taskId: task.taskId,
    category: task.category,
    invokedAstryx: log.length > 0,
    ranInit: subs.includes('init'),
    ranDocRetrieval: subs.some(s => DOC_RETRIEVAL_CMDS.has(s)),
    usedCoreDocsMjs,
    howDiscovered: selfReport?.howDiscovered ?? null,
    commands: log.map(e => e.argv.join(' ')),
    completed: fs.existsSync(
      path.join(task.projectDir, `${task.basePromptId}.tsx`),
    ),
  };
}

function rate(runs: RunResult[], pick: (r: RunResult) => boolean) {
  const s = runs.filter(pick).length;
  return {count: s, n: runs.length, ...wilson(s, runs.length)};
}

const fmt = (r: {
  p: number;
  lo: number;
  hi: number;
  count: number;
  n: number;
}) =>
  `${(r.p * 100).toFixed(0)}% [${(r.lo * 100).toFixed(0)}-${(r.hi * 100).toFixed(0)}] (${r.count}/${r.n})`;

function loadConditionTasks(iso: boolean, id: string): Map<string, TaskDesc[]> {
  const configPath = path.join(
    RESULTS_DIR,
    iso ? `discovery-iso-config-${id}.json` : `discovery-config-${id}.json`,
  );
  if (!fs.existsSync(configPath)) {
    console.error(`No config at ${configPath}.`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const map = new Map<string, TaskDesc[]>();

  if (iso) {
    for (const t of config.tasks as Array<{
      condition: string;
      taskId: string;
      basePromptId: string;
      dir: string;
    }>) {
      const arr = map.get(t.condition) ?? [];
      arr.push({
        taskId: t.taskId,
        basePromptId: t.basePromptId,
        category: '',
        projectDir: t.dir,
        invocationLog: path.join(t.dir, '.astryx-invocations.log'),
      });
      map.set(t.condition, arr);
    }
  } else {
    for (const [conditionId, iterationId] of Object.entries(
      config.conditions as Record<string, string>,
    )) {
      const tasksDir = path.join(RESULTS_DIR, iterationId, 'tasks');
      if (!fs.existsSync(tasksDir)) {
        continue;
      }
      const arr = fs
        .readdirSync(tasksDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const t = JSON.parse(
            fs.readFileSync(path.join(tasksDir, f), 'utf-8'),
          );
          return {
            taskId: t.promptId,
            basePromptId: t.basePromptId,
            category: t.category ?? '',
            projectDir: t.projectDir,
            invocationLog: t.invocationLog,
          };
        });
      map.set(conditionId, arr);
    }
  }
  return map;
}

function main() {
  const argv = process.argv.slice(2);
  const isoIdx = argv.indexOf('--iso');
  const iso = isoIdx !== -1;
  const id = iso ? argv[isoIdx + 1] : argv[argv.indexOf('--experiment') + 1];
  if (!id) {
    console.error(
      'Usage: discovery-aggregate.ts (--experiment <id> | --iso <id>)',
    );
    process.exit(1);
  }

  const conditionTasks = loadConditionTasks(iso, id);
  const summary: Record<string, unknown> = {
    experimentId: id,
    isolated: iso,
    generatedAt: new Date().toISOString(),
    conditions: {},
  };

  console.log(
    `\n🔎 CLI Discovery — ${iso ? 'ISOLATED ' : ''}experiment ${id}\n`,
  );
  console.log(`Funnel (ground truth: astryx shim log), Wilson 95% CI:\n`);
  console.log(
    `${'condition'.padEnd(15)} ${'invoked astryx'.padEnd(20)} ${'ran init'.padEnd(18)} ${'doc retrieval'.padEnd(20)} ${'core docs.mjs*'.padEnd(18)} completed`,
  );
  console.log('─'.repeat(100));

  for (const [conditionId, tasks] of conditionTasks) {
    const runs = tasks.map(evaluateRun);
    const invoked = rate(runs, r => r.invokedAstryx);
    const init = rate(runs, r => r.ranInit);
    const docs = rate(runs, r => r.ranDocRetrieval);
    const docsMjs = rate(runs, r => r.usedCoreDocsMjs);
    const completed = rate(runs, r => r.completed);

    console.log(
      `${conditionId.padEnd(15)} ${fmt(invoked).padEnd(20)} ${fmt(init).padEnd(18)} ${fmt(docs).padEnd(20)} ${fmt(docsMjs).padEnd(18)} ${completed.count}/${completed.n}`,
    );

    const howDist: Record<string, number> = {};
    for (const r of runs) {
      howDist[r.howDiscovered ?? 'none'] =
        (howDist[r.howDiscovered ?? 'none'] ?? 0) + 1;
    }

    (summary.conditions as Record<string, unknown>)[conditionId] = {
      n: runs.length,
      invokedAstryx: invoked,
      ranInit: init,
      docRetrieval: docs,
      usedCoreDocsMjs: docsMjs,
      completed,
      howDiscovered: howDist,
      runs,
    };
  }

  console.log(
    `\n* core docs.mjs = self-reported use of @astryxdesign/core's built-in docs (README channel); the astryx shim can't observe it.`,
  );
  const outPath = path.join(RESULTS_DIR, `discovery-summary-${id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`📄 Summary: ${outPath}`);
  console.log(
    `\nBar: a channel "works consistently" when invoked-astryx lower bound clears the control's upper bound (PLAN.md §8).\n`,
  );
}

main();
