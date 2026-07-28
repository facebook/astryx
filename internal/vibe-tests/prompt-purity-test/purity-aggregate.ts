// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file purity-aggregate.ts
 * @input --experiment <id> [--out <base>] (reads <sandbox>/<id>/purity-config.json)
 * @output Per-condition purity funnel with Wilson 95% CIs + comparison vs control; writes purity-summary.json
 * @position internal/vibe-tests/prompt-purity-test — scores the prompt-purity experiment
 *
 * Reconstructs each run's purity timeline from its captured snapshots (the objective
 * record of what the agent actually wrote, moment to moment), classifies veered/caught
 * via purity-eval.ts, and reports per-condition rates with Wilson 95% CIs so "reliably
 * catches its veers" is legible. Ground-truth CLI usage comes from the shim log.
 *
 * Usage: npx tsx purity-aggregate.ts --experiment <id> [--out <base>]
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  classifyTimeline,
  parseResultEvent,
  estimateCostUSD,
  emptyUsage,
  addUsage,
  type Classification,
  type TokenUsage,
} from './purity-eval.js';

const DOC_RETRIEVAL_CMDS = new Set([
  'component',
  'build',
  'search',
  'template',
  'docs',
  'swizzle',
]);

function sandboxBase(out?: string): string {
  return (
    out ||
    process.env.ASTRYX_PURITY_OUT ||
    path.join(os.tmpdir(), 'astryx-purity')
  );
}

/** Wilson score interval for a binomial proportion (95% by default). */
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

interface Rate {
  count: number;
  n: number;
  pct: number;
  lo: number;
  hi: number;
}
function rate<T>(items: T[], pick: (x: T) => boolean): Rate {
  const s = items.filter(pick).length;
  const {p, lo, hi} = wilson(s, items.length);
  return {count: s, n: items.length, pct: p, lo, hi};
}
const fmtRate = (r: Rate) =>
  `${(r.pct * 100).toFixed(0)}% [${(r.lo * 100).toFixed(0)}-${(r.hi * 100).toFixed(0)}] (${r.count}/${r.n})`;

interface RunResult {
  taskId: string;
  basePromptId: string;
  category: string;
  condition: string;
  status: string;
  model: string;
  completed: boolean;
  ranAstryxCli: boolean;
  ranDocRetrieval: boolean;
  cliCommands: string[];
  usage: TokenUsage | null;
  estCostUSD: number | null;
  apiDurationMs: number | null;
  cls: Classification;
}

function readSnapshots(runDir: string): string[] {
  const snapDir = path.join(runDir, 'snapshots');
  if (!fs.existsSync(snapDir)) {
    return [];
  }
  return fs
    .readdirSync(snapDir)
    .filter(f => f.endsWith('.tsx'))
    .sort() // NNNN-<ts> prefix sorts chronologically
    .map(f => fs.readFileSync(path.join(snapDir, f), 'utf-8'));
}

function readTranscriptText(runDir: string, cap = 200_000): string {
  const p = path.join(runDir, 'transcript.jsonl');
  if (!fs.existsSync(p)) {
    return '';
  }
  let text = '';
  for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
    if (!line.trim()) {
      continue;
    }
    try {
      const ev = JSON.parse(line) as {
        message?: {content?: unknown};
        text?: unknown;
      };
      const content = ev?.message?.content;
      if (Array.isArray(content)) {
        for (const block of content as Array<{type?: string; text?: string}>) {
          if (block?.type === 'text' && typeof block.text === 'string') {
            text += block.text + '\n';
          }
        }
      } else if (typeof ev?.text === 'string') {
        text += ev.text + '\n';
      }
    } catch {
      /* skip malformed line */
    }
    if (text.length > cap) {
      break;
    }
  }
  return text;
}

function subcommand(argv: string[]): string | null {
  return argv.find(a => !a.startsWith('-')) ?? null;
}

function readInvocationLog(logPath: string): {
  commands: string[];
  subs: string[];
} {
  if (!fs.existsSync(logPath)) {
    return {commands: [], subs: []};
  }
  const entries = fs
    .readFileSync(logPath, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => {
      try {
        return JSON.parse(l) as {argv: string[]};
      } catch {
        return null;
      }
    })
    .filter((e): e is {argv: string[]} => e !== null);
  return {
    commands: entries.map(e => e.argv.join(' ')),
    subs: entries
      .map(e => subcommand(e.argv))
      .filter((s): s is string => s !== null),
  };
}

interface TaskRecord {
  taskId: string;
  basePromptId: string;
  category: string;
  condition: string;
  runDir: string;
  outputFile?: string;
  invocationLog: string;
}

function evaluateRun(task: TaskRecord): RunResult {
  const versions = readSnapshots(task.runDir);
  // Fallback: if no snapshots were captured but a final file exists, classify that.
  if (
    versions.length === 0 &&
    task.outputFile &&
    fs.existsSync(task.outputFile)
  ) {
    const finalContent = fs.readFileSync(task.outputFile, 'utf-8');
    if (finalContent.trim()) {
      versions.push(finalContent);
    }
  }
  const transcriptText = readTranscriptText(task.runDir);
  const cls = classifyTimeline(versions, {transcriptText});

  const {commands, subs} = readInvocationLog(task.invocationLog);

  let status = 'unknown';
  let model = 'unknown';
  let usage: TokenUsage | null = null;
  let estCostUSD: number | null = null;
  let apiDurationMs: number | null = null;
  const runJsonPath = path.join(task.runDir, 'run.json');
  if (fs.existsSync(runJsonPath)) {
    try {
      const rj = JSON.parse(fs.readFileSync(runJsonPath, 'utf-8'));
      status = rj.status ?? 'unknown';
      model = rj.model ?? 'unknown';
      usage = rj.usage ?? null;
      estCostUSD = rj.estCostUSD ?? null;
      apiDurationMs = rj.apiDurationMs ?? null;
    } catch {
      /* ignore */
    }
  }
  // Backfill from the transcript's result line for runs written before cost was
  // first-class (e.g. an in-flight/seed run), so token + $ data is available everywhere.
  if (!usage) {
    const res = parseResultEvent(path.join(task.runDir, 'transcript.jsonl'));
    if (res?.usage) {
      usage = res.usage;
      apiDurationMs = apiDurationMs ?? res.apiDurationMs;
    }
  }
  if (usage && estCostUSD == null) {
    estCostUSD = estimateCostUSD(
      usage,
      model === 'unknown' ? 'default' : model,
    );
  }

  return {
    taskId: task.taskId,
    basePromptId: task.basePromptId,
    category: task.category,
    condition: task.condition,
    status,
    model,
    completed: !cls.noOutput,
    ranAstryxCli: commands.length > 0,
    ranDocRetrieval: subs.some(s => DOC_RETRIEVAL_CMDS.has(s)),
    cliCommands: commands,
    usage,
    estCostUSD,
    apiDurationMs,
    cls,
  };
}

function conditionRuns(condDir: string): RunResult[] {
  const tasksDir = path.join(condDir, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    return [];
  }
  return fs
    .readdirSync(tasksDir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(tasksDir, f), 'utf-8')))
    .map(evaluateRun);
}

function mean(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

const fmtNum = (n: number) => Math.round(n).toLocaleString('en-US');

interface CostBlock {
  n: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  estCostUSD: number;
}

function costOf(runs: RunResult[]): CostBlock {
  let usage = emptyUsage();
  let estCostUSD = 0;
  let n = 0;
  for (const r of runs) {
    if (!r.usage) {
      continue;
    }
    usage = addUsage(usage, r.usage);
    estCostUSD += r.estCostUSD ?? 0;
    n++;
  }
  return {
    n,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
    avgInputTokens: n ? Math.round(usage.inputTokens / n) : 0,
    avgOutputTokens: n ? Math.round(usage.outputTokens / n) : 0,
    estCostUSD,
  };
}

function costByPrompt(runs: RunResult[]): Record<string, CostBlock> {
  const groups: Record<string, RunResult[]> = {};
  for (const r of runs) {
    (groups[r.basePromptId] ??= []).push(r);
  }
  const out: Record<string, CostBlock> = {};
  for (const [pid, rs] of Object.entries(groups)) {
    out[pid] = costOf(rs);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const expId = get('--experiment');
  if (!expId) {
    console.error(
      'Usage: purity-aggregate.ts --experiment <id> [--out <base>]',
    );
    process.exit(1);
  }
  const expDir = path.join(sandboxBase(get('--out')), expId);
  const configPath = path.join(expDir, 'purity-config.json');
  if (!fs.existsSync(configPath)) {
    console.error(
      `No config at ${configPath}. Run setup-purity.mjs (and run-purity.ts) first.`,
    );
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const control: string = config.control ?? 'A-control';

  type CondReport = {
    n: number;
    completed: Rate;
    neverVeered: Rate;
    caughtGivenVeered: Rate;
    veeredUncaught: Rate;
    ranDocRetrieval: Rate;
    finalPurityMean: number;
    cost: CostBlock & {byPrompt: Record<string, CostBlock>};
    runs: unknown[];
  };
  const perCondition: Record<string, CondReport> = {};
  const summary: Record<string, unknown> = {
    experimentId: expId,
    generatedAt: new Date().toISOString(),
    control,
    conditions: perCondition,
  };

  console.log(`\nPrompt Purity — experiment ${expId}`);
  console.log(
    `Funnel over runs that produced output. Rates carry a Wilson 95% CI.\n`,
  );
  console.log(
    `${'condition'.padEnd(14)} ${'completed'.padEnd(16)} ${'neverVeered'.padEnd(20)} ${'caught|veered'.padEnd(20)} ${'veeredUncaught'.padEnd(20)} ${'ranCLI'.padEnd(16)} purity`,
  );
  console.log('-'.repeat(126));

  for (const cond of config.conditions as string[]) {
    const condDir = config.conditionDirs[cond];
    const runs = conditionRuns(condDir);
    const done = runs.filter(r => r.completed);
    const veered = done.filter(r => r.cls.everVeered);

    const completed = rate(runs, r => r.completed);
    const neverVeered = rate(done, r => r.cls.neverVeered);
    const caughtGivenVeered = rate(veered, r => r.cls.caught);
    const veeredUncaught = rate(done, r => r.cls.veeredUncaught);
    const ranCli = rate(done, r => r.ranDocRetrieval);
    const purityMean = mean(done.map(r => r.cls.finalPurity));

    console.log(
      `${cond.padEnd(14)} ${fmtRate(completed).padEnd(16)} ${fmtRate(neverVeered).padEnd(20)} ${fmtRate(caughtGivenVeered).padEnd(20)} ${fmtRate(veeredUncaught).padEnd(20)} ${fmtRate(ranCli).padEnd(16)} ${purityMean.toFixed(0)}`,
    );

    perCondition[cond] = {
      n: runs.length,
      completed,
      neverVeered,
      caughtGivenVeered,
      veeredUncaught,
      ranDocRetrieval: ranCli,
      finalPurityMean: purityMean,
      cost: {...costOf(runs), byPrompt: costByPrompt(runs)},
      runs: runs.map(r => ({
        taskId: r.taskId,
        basePromptId: r.basePromptId,
        category: r.category,
        status: r.status,
        completed: r.completed,
        everVeered: r.cls.everVeered,
        caught: r.cls.caught,
        veeredUncaught: r.cls.veeredUncaught,
        neverVeered: r.cls.neverVeered,
        finalPurity: r.cls.finalPurity,
        peakHardCount: r.cls.peakHardCount,
        finalHardCount: r.cls.finalHardCount,
        removedHardCount: r.cls.removedHardCount,
        finalMarkers: r.cls.finalMarkers,
        ranDocRetrieval: r.ranDocRetrieval,
        cliCommands: r.cliCommands,
        caughtInReasoning: r.cls.caughtInReasoning,
        usage: r.usage,
        estCostUSD: r.estCostUSD,
        apiDurationMs: r.apiDurationMs,
      })),
    };
  }

  // ── Comparison vs control ──────────────────────────────────────────
  const base = perCondition[control];
  if (base) {
    console.log(
      `\nvs control (${control}) — lower veeredUncaught + higher purity is better:\n`,
    );
    for (const cond of config.conditions as string[]) {
      if (cond === control) {
        continue;
      }
      const c = perCondition[cond];
      const vuDelta = (c.veeredUncaught.pct - base.veeredUncaught.pct) * 100;
      const purDelta = c.finalPurityMean - base.finalPurityMean;
      const decisive = c.veeredUncaught.hi < base.veeredUncaught.lo;
      console.log(
        `  ${cond.padEnd(14)} veeredUncaught ${vuDelta >= 0 ? '+' : ''}${vuDelta.toFixed(0)}pp   purity ${purDelta >= 0 ? '+' : ''}${purDelta.toFixed(0)}   ${decisive ? 'DECISIVE (CI clears control)' : '(CIs overlap — need more reps)'}`,
      );
    }
  }

  // ── Cost (exact tokens; $ is an estimate) ──────────────────────────
  const totals = emptyUsage();
  let totalCost = 0;
  let totalRuns = 0;
  console.log(
    `\nCost — exact token counts; $ is an ESTIMATE (per-model table, cache-read priced low):\n`,
  );
  console.log(
    `${'condition'.padEnd(14)} ${'runs'.padEnd(5)} ${'input'.padEnd(12)} ${'output'.padEnd(12)} ${'cacheRead'.padEnd(14)} ${'cacheWrite'.padEnd(13)} ${'avgOut'.padEnd(8)} est$`,
  );
  console.log('-'.repeat(100));
  for (const cond of config.conditions as string[]) {
    const c = perCondition[cond].cost as CostBlock;
    console.log(
      `${cond.padEnd(14)} ${String(c.n).padEnd(5)} ${fmtNum(c.inputTokens).padEnd(12)} ${fmtNum(c.outputTokens).padEnd(12)} ${fmtNum(c.cacheReadTokens).padEnd(14)} ${fmtNum(c.cacheWriteTokens).padEnd(13)} ${fmtNum(c.avgOutputTokens).padEnd(8)} $${c.estCostUSD.toFixed(2)}`,
    );
    totals.inputTokens += c.inputTokens;
    totals.outputTokens += c.outputTokens;
    totals.cacheReadTokens += c.cacheReadTokens;
    totals.cacheWriteTokens += c.cacheWriteTokens;
    totalCost += c.estCostUSD;
    totalRuns += c.n;
  }
  console.log('-'.repeat(100));
  console.log(
    `${'TOTAL'.padEnd(14)} ${String(totalRuns).padEnd(5)} ${fmtNum(totals.inputTokens).padEnd(12)} ${fmtNum(totals.outputTokens).padEnd(12)} ${fmtNum(totals.cacheReadTokens).padEnd(14)} ${fmtNum(totals.cacheWriteTokens).padEnd(13)} ${''.padEnd(8)} $${totalCost.toFixed(2)}`,
  );
  console.log(
    `\n($ is an estimate — on a Cursor plan real billing may be request-based; token counts above are exact.)`,
  );

  summary.cost = {
    total: {
      runs: totalRuns,
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
      cacheReadTokens: totals.cacheReadTokens,
      cacheWriteTokens: totals.cacheWriteTokens,
      estCostUSD: totalCost,
    },
    note: 'Token counts are exact (cursor-agent stream-json result events). estCostUSD is an estimate from the per-model PRICING table in purity-eval.ts; re-scale for graphs.',
  };

  const outPath = path.join(expDir, 'purity-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nSummary: ${outPath}`);
  console.log(
    `Read: a variant wins when its veeredUncaught CI clears control's and purity is higher, across K>=5 reps.\n`,
  );
}

main();
