// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run-purity.ts
 * @input --experiment <id> [--out <base>] [--concurrency N] [--model <id>] [--timeout ms] [--conditions ...] [--dry-run]
 * @output Per task: <runDir>/transcript.jsonl, <runDir>/snapshots/NNNN-*.tsx, <runDir>/run.json
 * @position internal/vibe-tests/prompt-purity-test — the runner
 *
 * Runs each task's context-free agent via the `cursor-agent` CLI (headless) on Opus 4.8
 * 1M Max Fast, capturing the FULL trajectory so purity-aggregate.ts can tell whether the
 * agent veered off Astryx and whether it caught itself.
 *
 * Why cursor-agent (not the SDK): it ships with Cursor, uses your existing login (no npm
 * dependency, no registry/API-key setup), and `--print --output-format stream-json`
 * streams every message + tool call. Confirm auth with `cursor-agent status`.
 *
 * ISOLATION (never interferes with parallel Cursor work):
 *  - Each agent runs with cwd + --workspace = the sandbox project (under $TMPDIR); it
 *    can't touch your main checkout. Repo packages are only symlinked (read-only).
 *  - fs.watch watches only the sandbox project dir.
 *  - Bounded concurrency (--concurrency, default 3), per-run timeout, killed on stop.
 *
 * Usage:
 *   npx tsx run-purity.ts --experiment <id>
 *   npx tsx run-purity.ts --experiment <id> --concurrency 4 --model claude-opus-4-8-max-fast
 *   npx tsx run-purity.ts --experiment <id> --dry-run     # exercise the pipeline, no model calls
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {
  parseResultFromText,
  estimateCostUSD,
  type TokenUsage,
  type AgentResult,
} from './purity-eval.js';

const DEFAULT_MODEL = 'claude-opus-4-8-max-fast'; // Opus 4.8 1M Max Fast
const DEFAULT_AGENT = 'cursor-agent';
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

const ensureDir = (d: string) => fs.mkdirSync(d, {recursive: true});
const writeJson = (p: string, o: unknown) =>
  fs.writeFileSync(p, JSON.stringify(o, null, 2));

function sandboxBase(out?: string): string {
  return (
    out ||
    process.env.ASTRYX_PURITY_OUT ||
    path.join(os.tmpdir(), 'astryx-purity')
  );
}

interface TaskFile {
  taskId: string;
  basePromptId: string;
  category: string;
  condition: string;
  projectDir: string;
  outputFile: string;
  runDir: string;
  taskPrompt: string;
}

interface RunJson {
  taskId: string;
  condition: string;
  basePromptId: string;
  category: string;
  model: string;
  status: string;
  error: string | null;
  subtype: string | null;
  isError: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  apiDurationMs: number | null;
  usage: TokenUsage | null;
  estCostUSD: number | null;
  snapshotCount: number;
  outputExists: boolean;
}

// ── Live snapshotting of the output file (the purity timeline) ────────

function startSnapshotter(targetFile: string, snapDir: string) {
  ensureDir(snapDir);
  let seq = 0;
  let last: string | null = null;
  let debounce: NodeJS.Timeout | null = null;

  const capture = () => {
    try {
      if (!fs.existsSync(targetFile)) {
        return;
      }
      const content = fs.readFileSync(targetFile, 'utf-8');
      if (content === last) {
        return;
      }
      last = content;
      const name = `${String(seq++).padStart(4, '0')}-${Date.now()}.tsx`;
      fs.writeFileSync(path.join(snapDir, name), content);
    } catch {
      /* transient read during write — the poll will catch the settled version */
    }
  };

  const dir = path.dirname(targetFile);
  ensureDir(dir);
  const base = path.basename(targetFile);
  let watcher: fs.FSWatcher | null = null;
  try {
    watcher = fs.watch(dir, (_event, filename) => {
      if (filename && filename.toString() !== base) {
        return;
      }
      if (debounce) {
        clearTimeout(debounce);
      }
      debounce = setTimeout(capture, 80);
    });
  } catch {
    /* fs.watch unsupported on some FS — the poll below is the fallback */
  }
  const poll = setInterval(capture, 500);

  return {
    stop: () => {
      if (debounce) {
        clearTimeout(debounce);
      }
      clearInterval(poll);
      try {
        watcher?.close();
      } catch {
        /* ignore */
      }
      capture(); // guaranteed final snapshot
    },
  };
}

// ── Bounded concurrency pool ─────────────────────────────────────────

async function pool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from(
    {length: Math.min(Math.max(1, limit), items.length || 1)},
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) {
          break;
        }
        results[i] = await worker(items[i], i);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

// ── One run (spawn cursor-agent headless) ────────────────────────────

function runOne(
  cfg: {model: string; agent: string; timeoutMs: number},
  task: TaskFile,
): Promise<RunJson> {
  return new Promise(resolve => {
    ensureDir(task.runDir);
    const transcriptPath = path.join(task.runDir, 'transcript.jsonl');
    const snapDir = path.join(task.runDir, 'snapshots');
    const snap = startSnapshotter(task.outputFile, snapDir);
    const startedAt = new Date().toISOString();
    const t0 = Date.now();

    let done = false;
    let transcriptBuf = '';
    const finalize = (status: string, error: string | null) => {
      if (done) {
        return;
      }
      done = true;
      snap.stop();
      const snapshotCount = fs.existsSync(snapDir)
        ? fs.readdirSync(snapDir).filter(f => f.endsWith('.tsx')).length
        : 0;
      const outputExists =
        fs.existsSync(task.outputFile) &&
        fs.readFileSync(task.outputFile, 'utf-8').trim().length > 0;
      // Parse the CLI's terminal `result` line for exact token usage + api duration,
      // so cost data is first-class in run.json (durable even if transcripts are pruned).
      const result: AgentResult | null = parseResultFromText(transcriptBuf);
      const usage: TokenUsage | null = result?.usage ?? null;
      const estCostUSD = usage ? estimateCostUSD(usage, cfg.model) : null;
      const runJson: RunJson = {
        taskId: task.taskId,
        condition: task.condition,
        basePromptId: task.basePromptId,
        category: task.category,
        model: cfg.model,
        status,
        error,
        subtype: result?.subtype ?? null,
        isError: result?.isError ?? status !== 'finished',
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - t0,
        apiDurationMs: result?.apiDurationMs ?? null,
        usage,
        estCostUSD,
        snapshotCount,
        outputExists,
      };
      writeJson(path.join(task.runDir, 'run.json'), runJson);
      const tok = usage
        ? ` tok(out=${usage.outputTokens} cacheR=${usage.cacheReadTokens})`
        : '';
      console.log(
        `  [${status.padEnd(13)}] ${task.condition}/${task.taskId}  snapshots=${snapshotCount} output=${outputExists}${tok}${error ? `  (${error.slice(0, 80)})` : ''}`,
      );
      resolve(runJson);
    };

    const args = [
      '--print',
      '--output-format',
      'stream-json',
      '--model',
      cfg.model,
      '--force', // allow write/shell non-interactively
      '--trust', // trust the sandbox workspace (headless)
      '--workspace',
      task.projectDir,
      task.taskPrompt,
    ];

    let child;
    try {
      child = spawn(cfg.agent, args, {cwd: task.projectDir, env: process.env});
    } catch (e) {
      finalize('startup_error', e instanceof Error ? e.message : String(e));
      return;
    }

    const out = fs.createWriteStream(transcriptPath);
    child.stdout.on('data', d => {
      const s = d.toString();
      if (transcriptBuf.length < 8_000_000) {
        transcriptBuf += s;
      } // keep in memory to parse the result line
      out.write(s); // persist full transcript to disk
    });
    let stderr = '';
    child.stderr.on('data', d => {
      if (stderr.length < 4000) {
        stderr += d.toString();
      }
    });

    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          /* ignore */
        }
      }, 5000);
    }, cfg.timeoutMs);

    child.on('error', (e: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      finalize(
        e.code === 'ENOENT' ? 'startup_error' : 'exception',
        e.message || String(e),
      );
    });
    child.on('close', code => {
      clearTimeout(timer);
      out.end();
      const status = killed ? 'timeout' : code === 0 ? 'finished' : 'error';
      finalize(
        status,
        status === 'finished'
          ? null
          : stderr.trim().slice(-300) || `exit ${code}`,
      );
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };
  const getInt = (flag: string, def: number) => {
    const v = get(flag);
    return v ? parseInt(v, 10) : def;
  };
  const conditions = get('--conditions');
  return {
    experiment: get('--experiment'),
    out: get('--out'),
    concurrency: getInt('--concurrency', 3),
    model: get('--model') ?? DEFAULT_MODEL,
    agent: get('--agent') ?? DEFAULT_AGENT,
    timeoutMs: getInt('--timeout', DEFAULT_TIMEOUT_MS),
    conditions: conditions
      ? conditions.split(',').map(s => s.trim())
      : undefined,
    dryRun: argv.includes('--dry-run'),
  };
}

function loadTasks(
  configDirs: Record<string, string>,
  conditions: string[],
): TaskFile[] {
  const perCond: TaskFile[][] = [];
  for (const cond of conditions) {
    const condDir = configDirs[cond];
    if (!condDir) {
      throw new Error(`Condition "${cond}" not found in config.conditionDirs`);
    }
    const tasksDir = path.join(condDir, 'tasks');
    const arr: TaskFile[] = [];
    if (fs.existsSync(tasksDir)) {
      for (const f of fs
        .readdirSync(tasksDir)
        .filter(f => f.endsWith('.json'))) {
        arr.push(
          JSON.parse(
            fs.readFileSync(path.join(tasksDir, f), 'utf-8'),
          ) as TaskFile,
        );
      }
    }
    perCond.push(arr);
  }
  // Interleave round-robin across conditions so partial progress stays balanced and no
  // single condition monopolizes an early rate-limit window.
  const tasks: TaskFile[] = [];
  const max = Math.max(0, ...perCond.map(a => a.length));
  for (let i = 0; i < max; i++) {
    for (const arr of perCond) {
      if (i < arr.length) {
        tasks.push(arr[i]);
      }
    }
  }
  return tasks;
}

/** Confirm cursor-agent is present and logged in (non-fatal warning otherwise). */
function checkAgent(agent: string): boolean {
  const r = spawnSync(agent, ['status'], {encoding: 'utf-8'});
  if (r.error) {
    console.error(
      `Could not run "${agent}" (${r.error.message}). Install the Cursor CLI or pass --agent <path>.`,
    );
    return false;
  }
  const text = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (!/logged in|Logged in/i.test(text) && !process.env.CURSOR_API_KEY) {
    console.warn(
      `[warn] "${agent} status" does not report a login. Run "${agent} login" or set CURSOR_API_KEY.`,
    );
  } else {
    console.log(`  Auth: ${text.trim().split('\n')[0] ?? 'ok'}`);
  }
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.experiment) {
    console.error(
      'Usage: run-purity.ts --experiment <id> [--out <base>] [--concurrency N] [--model <id>] [--dry-run]',
    );
    process.exit(1);
  }
  const expDir = path.join(sandboxBase(args.out), args.experiment);
  const configPath = path.join(expDir, 'purity-config.json');
  if (!fs.existsSync(configPath)) {
    console.error(`No config at ${configPath}. Run setup-purity.mjs first.`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const conditions = args.conditions ?? config.conditions;
  const tasks = loadTasks(config.conditionDirs, conditions);

  console.log(`\nPrompt Purity — run  (experiment ${args.experiment})`);
  console.log(`  Conditions:  ${conditions.join(', ')}`);
  console.log(`  Tasks:       ${tasks.length}`);
  console.log(`  Model:       ${args.model}`);
  console.log(
    `  Concurrency: ${args.concurrency}${args.dryRun ? '   (DRY RUN — no model calls)' : ''}\n`,
  );

  if (args.dryRun) {
    for (const task of tasks) {
      ensureDir(task.runDir);
      writeJson(path.join(task.runDir, 'run.json'), {
        taskId: task.taskId,
        condition: task.condition,
        basePromptId: task.basePromptId,
        category: task.category,
        status: 'dry-run',
        snapshotCount: 0,
        outputExists: false,
      });
      console.log(`  [dry-run     ] ${task.condition}/${task.taskId}`);
    }
    console.log(`\nDry run complete. ${tasks.length} run dirs prepared.\n`);
    return;
  }

  if (!checkAgent(args.agent)) {
    process.exit(1);
  }

  const t0 = Date.now();
  const results = await pool(tasks, args.concurrency, task =>
    runOne(
      {model: args.model, agent: args.agent, timeoutMs: args.timeoutMs},
      task,
    ),
  );

  const byStatus: Record<string, number> = {};
  for (const r of results) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  }
  console.log(
    `\nDone in ${((Date.now() - t0) / 1000).toFixed(0)}s. Status: ${Object.entries(
      byStatus,
    )
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')}`,
  );
  console.log(
    `\nNext: npx tsx ${path.relative(process.cwd(), path.join(import.meta.dirname, 'purity-aggregate.ts'))} --experiment ${args.experiment}${args.out ? ` --out ${args.out}` : ''}\n`,
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
