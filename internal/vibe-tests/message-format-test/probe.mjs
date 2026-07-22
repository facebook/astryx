// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lightweight postinstall MESSAGE-FORMAT probe.
 *
 * We believe a core `postinstall` next-step note helps discovery; we are blind
 * on WHAT FORMAT makes an agent actually run `npx astryxdesign init`. This probe
 * isolates the message as the only variable — no npm, no build, no sandbox app.
 *
 * For each (variant × model × rep): show a headless agent a realistic
 * `npm install @astryxdesign/core` log (with the candidate message injected, or
 * not for `control`) and ask for the exact shell commands it would run next to
 * reach a working to-do app. We then score whether it reaches for
 * `npx astryxdesign init` — and, crucially, whether it puts it FIRST (a weak
 * message gets noted-then-skipped; a strong one gets run before building).
 *
 * Single-turn, toolless intent probe → ~30–60s/rep, run many in parallel.
 *
 * Usage:
 *   node probe.mjs                                  # all variants, default models, n=4
 *   node probe.mjs --reps 6 --models gpt-5.5-high,gpt-5.2
 *   node probe.mjs --concurrency 8 --only v2-boxed,v3-agent,control
 */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VARIANTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants.json'), 'utf-8')).variants;
const ALL_MODELS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'fresh-install-test', 'models.json'), 'utf-8'),
).models;
const RESULTS_DIR = path.join(__dirname, 'results');

const timestamp = () => new Date().toISOString();
const ensureDir = d => fs.mkdirSync(d, {recursive: true});

// EVERY probe runs in an isolated EMPTY temp dir — never inside the repo (whose
// always-applied CLAUDE.md + existing ASTRYX cheat sheet would contaminate the
// agent). Mirrors the guard in fresh-install-test/run.mjs: fail LOUD unless the
// sandbox is under the OS temp dir AND no ancestor carries agent rules. With the
// sandbox under /var/folders (not a git repo), `git rev-parse --show-toplevel`
// can't escape into the real checkout.
const RULE_FILES = ['CLAUDE.md', 'AGENTS.md', '.cursorrules', '.cursor'];
function assertSandboxed(dir) {
  const tmp = fs.realpathSync(os.tmpdir());
  const real = fs.realpathSync(dir);
  if (!(real === tmp || real.startsWith(tmp + path.sep))) {
    throw new Error(`ISOLATION FAILURE: sandbox ${real} is not under the OS temp dir (${tmp}).`);
  }
  for (let d = path.dirname(real); d.startsWith(tmp); d = path.dirname(d)) {
    for (const rf of RULE_FILES) {
      if (fs.existsSync(path.join(d, rf))) {
        throw new Error(`ISOLATION FAILURE: ancestor ${path.join(d, rf)} would leak agent rules into ${real}.`);
      }
    }
    if (d === tmp) break;
  }
}

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

// ── install contexts (the second dimension) ───────────────────────────────────
// Same message FORMATS, two entry points → two PRs / two data points:
//   core → `npm install @astryxdesign/core`   (component lib; the fresh-install path)
//   cli  → `npm install -D @astryxdesign/cli`  (direct CLI install; repeat users / CI)
// Each variant message uses a {{CMD}} placeholder, filled with the context's init
// invocation, so ONE variants.json races both PRs. Override with --cmd.
const CONTEXTS = {
  core: {
    installCmd: 'npm install @astryxdesign/core',
    added: 'added 43 packages, and audited 289 packages in 5s',
    initCmd: 'npx astryxdesign init',
    framing:
      'set up a new Next.js app that uses the @astryxdesign/core design system, ' +
      'then build a simple to-do app with it',
  },
  cli: {
    installCmd: 'npm install -D @astryxdesign/cli',
    added: 'added 12 packages, and audited 214 packages in 3s',
    initCmd: 'npx astryx init', // cli is now local → the local bin resolves
    framing:
      'add the @astryxdesign design system to an existing Next.js app, ' +
      'then build a simple to-do app with it',
  },
};

// realistic npm install log with the (already CMD-filled) message injected
function installLog(message, ctx) {
  const body = message ? `${message}\n` : '';
  return (
    `$ ${ctx.installCmd}\n\n` +
    `${ctx.added}\n` +
    body +
    `\n103 packages are looking for funding\n` +
    `  run \`npm fund\` for details\n\n` +
    `found 0 vulnerabilities`
  );
}

function buildPrompt(message, ctx) {
  const filled = (message || '').replaceAll('{{CMD}}', ctx.initCmd);
  return (
    `You are an AI coding agent pair-programming with a developer.\n` +
    `Task: ${ctx.framing}.\n\n` +
    `You have already created the Next.js app. You just ran the install below.\n\n` +
    `----- terminal -----\n` +
    installLog(filled, ctx) +
    `\n--------------------\n\n` +
    `List the EXACT shell commands you will run next, in order, to get to a ` +
    `working to-do app. Output ONLY the commands, one per line, no prose, no ` +
    `explanations. Do not run anything yet.`
  );
}

// ── cursor-agent plumbing (reused shape from fresh-install-test/run.mjs) ───────
function runProc(cmd, args, {cwd, env, timeoutMs, logFile}) {
  return new Promise(resolve => {
    const started = Date.now();
    const child = spawn(cmd, args, {cwd, env, detached: true});
    let stdout = '';
    let stderr = '';
    const logStream = logFile ? fs.createWriteStream(logFile) : null;
    child.stdout.on('data', d => {
      stdout += d;
      logStream?.write(d);
    });
    child.stderr.on('data', d => {
      stderr += d;
      logStream?.write(d);
    });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        /* gone */
      }
    }, timeoutMs);
    const finish = (code, error) => {
      clearTimeout(timer);
      logStream?.end();
      resolve({code, error, timedOut, stdout, stderr, ms: Date.now() - started});
    };
    child.on('close', code => finish(code));
    child.on('error', err => finish(-1, String(err)));
  });
}

function parseAgentStream(stdout) {
  const out = {sessionId: null, result: '', isError: false, commands: []};
  for (const line of stdout.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    let obj;
    try {
      obj = JSON.parse(t);
    } catch {
      continue;
    }
    if (obj.type === 'system' && obj.session_id) out.sessionId = obj.session_id;
    if (obj.type === 'result') {
      out.result = obj.result ?? '';
      out.isError = !!obj.is_error;
    }
    if (obj.type === 'tool_call' && obj.subtype === 'started' && obj.tool_call) {
      const tc = obj.tool_call;
      if (tc.shellToolCall?.args?.command != null) {
        out.commands.push(String(tc.shellToolCall.args.command));
      }
    }
  }
  return out;
}

// ── scoring ───────────────────────────────────────────────────────────────────
const INIT_RE = /\b(?:npx\s+)?astryx(?:design)?\s+init\b/i;
// off-ramp = agent goes straight to running/building instead of init
const OFFRAMP_RE = /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:dev|build|start)\b|\bnext\s+(?:dev|build|start)\b|create-next-app/i;

function cmdLines(resultText) {
  return resultText
    .split('\n')
    .map(l => l.replace(/^\s*[-*\d.)]+\s*/, '').trim()) // strip list bullets/numbers
    .map(l => l.replace(/^`+|`+$/g, '').trim()) // strip backticks
    .filter(Boolean)
    .filter(l => !l.startsWith('#') && l !== '```' && !l.startsWith('```'));
}

function scoreResult(resultText) {
  const lines = cmdLines(resultText);
  const listed = INIT_RE.test(resultText);
  let initRank = 0; // 1-based index of first init command; 0 = absent
  let offrampRank = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!initRank && INIT_RE.test(lines[i])) initRank = i + 1;
    if (!offrampRank && OFFRAMP_RE.test(lines[i])) offrampRank = i + 1;
  }
  const initFirst = initRank === 1;
  // init "wins" if it appears and comes before the first off-ramp (or no off-ramp)
  const initBeforeBuild = initRank > 0 && (offrampRank === 0 || initRank <= offrampRank);
  return {listed, initFirst, initBeforeBuild, initRank, firstCmd: lines[0] || ''};
}

async function runOne({variant, model, ctx, sandboxDir, resultFile}) {
  ensureDir(sandboxDir);
  assertSandboxed(sandboxDir); // refuse to run unless fully isolated from the repo
  const prompt = buildPrompt(variant.message, ctx);
  // ask mode WITHOUT --force = pure text intent: the agent answers with the
  // command list and runs ZERO tools (verified: TOOLS_USED 0, ~30s). --force
  // would let it execute (scaffold/curl unpkg) — we don't want that here.
  // --workspace pins an isolated empty temp dir as a belt-and-suspenders.
  const args = [
    '-p', '--output-format', 'stream-json',
    '--mode', 'ask', // read-only Q&A — answer with the command list
    '--trust', // skip the workspace-trust prompt in headless
    '--workspace', sandboxDir,
    '--model', model,
    prompt,
  ];
  const r = await runProc('cursor-agent', args, {
    cwd: sandboxDir,
    env: process.env,
    timeoutMs: parseInt(arg('--turn-timeout', '300'), 10) * 1000,
    logFile: path.join(sandboxDir, 'probe.log'),
  });
  const parsed = parseAgentStream(r.stdout);
  const score = scoreResult(parsed.result);
  const rec = {
    variant: variant.id,
    context: ctx.id,
    model,
    result: parsed.result,
    agentCommands: parsed.commands, // should be empty in ask mode; a canary for leakage
    exit: r.code,
    timedOut: r.timedOut,
    ms: r.ms,
    ...score,
  };
  ensureDir(path.dirname(resultFile));
  fs.writeFileSync(resultFile, JSON.stringify(rec, null, 2));
  fs.writeFileSync(resultFile.replace(/\.json$/, '.stream.jsonl'), r.stdout || '');
  return rec;
}

// simple concurrency pool
async function pool(tasks, concurrency) {
  const results = [];
  let i = 0;
  const workers = Array.from({length: Math.min(concurrency, tasks.length)}, async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return results;
}

function pct(n, d) {
  return d === 0 ? '  –  ' : `${Math.round((100 * n) / d)}%`.padStart(5);
}

async function main() {
  const reps = parseInt(arg('--reps', '4'), 10);
  const concurrency = parseInt(arg('--concurrency', '8'), 10);
  const modelSlugs = arg('--models', 'gpt-5.5-high,gpt-5.2,claude-opus-4-8-high')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const only = arg('--only', '');
  const variants = only
    ? VARIANTS.filter(v => only.split(',').map(s => s.trim()).includes(v.id))
    : VARIANTS;
  const contextId = arg('--context', 'core');
  if (!CONTEXTS[contextId]) {
    console.error(`Unknown --context "${contextId}". Use: ${Object.keys(CONTEXTS).join(', ')}`);
    process.exit(1);
  }
  const ctx = {id: contextId, ...CONTEXTS[contextId]};
  const cmdOverride = arg('--cmd', '');
  if (cmdOverride) ctx.initCmd = cmdOverride; // override the suggested init invocation
  const expId = arg('--exp', `${contextId}-${crypto.randomBytes(3).toString('hex')}`);
  const expDir = path.join(RESULTS_DIR, expId); // repo-side: records + summaries only
  const sandboxRoot = path.join(os.tmpdir(), 'astryx-msg-probe', expId); // isolated run dirs
  ensureDir(expDir);
  ensureDir(sandboxRoot);

  const modelLabel = slug => ALL_MODELS.find(m => m.slug === slug)?.label || slug;

  console.log(`\n🧪 Message-format probe — ${expId}`);
  console.log(`   context:   ${contextId}  (${ctx.installCmd}  →  ${ctx.initCmd})`);
  console.log(`   variants:  ${variants.map(v => v.id).join(', ')}`);
  console.log(`   models:    ${modelSlugs.map(modelLabel).join(', ')}`);
  console.log(`   reps:      ${reps} (concurrency ${concurrency})`);
  console.log(`   metric:    init-first / init-before-build / init-listed\n`);

  const tasks = [];
  for (const variant of variants) {
    for (const model of modelSlugs) {
      for (let rep = 1; rep <= reps; rep++) {
        const sandboxDir = path.join(sandboxRoot, variant.id, `${modelLabel(model)}-rep${rep}`);
        const resultFile = path.join(expDir, variant.id, `${modelLabel(model)}-rep${rep}.json`);
        tasks.push(() =>
          runOne({variant, model, ctx, sandboxDir, resultFile}).then(rec => {
            const tag = rec.timedOut
              ? '⏱ TIMEOUT (invalid)'
              : rec.exit !== 0 || !rec.result?.trim()
                ? '⚠ empty/error (invalid)'
                : rec.initFirst
                  ? '① init-first'
                  : rec.initBeforeBuild
                    ? '✓ init-before-build'
                    : rec.listed
                      ? '~ init-listed-late'
                      : '✗ no-init';
            console.log(`  ${variant.id.padEnd(11)} ${modelLabel(model).padEnd(9)} rep${rep}  ${tag}  · first: ${JSON.stringify(rec.firstCmd).slice(0, 42)}`);
            return rec;
          }),
        );
      }
    }
  }

  const all = await pool(tasks, concurrency);
  fs.writeFileSync(path.join(expDir, 'all.json'), JSON.stringify(all, null, 2));

  // ── aggregate table: per variant (rows) × metric ────────────────────────────
  console.log(`\n📊 Results — ${expId}  (n=${reps} × ${modelSlugs.length} models = ${reps * modelSlugs.length}/variant)\n`);
  const header = `  ${'variant'.padEnd(12)} ${'init-first'.padStart(10)} ${'before-build'.padStart(12)} ${'listed'.padStart(8)}  valid   winner-signal`;
  console.log(header);
  console.log('  ' + '─'.repeat(header.length));
  const isValid = r => !r.timedOut && r.exit === 0 && !!r.result?.trim();
  const summary = [];
  for (const variant of variants) {
    const rows = all.filter(r => r.variant === variant.id);
    const valid = rows.filter(isValid); // timeouts/errors excluded — never a false zero
    const n = valid.length;
    const invalid = rows.length - n;
    const first = valid.filter(r => r.initFirst).length;
    const before = valid.filter(r => r.initBeforeBuild).length;
    const listed = valid.filter(r => r.listed).length;
    summary.push({id: variant.id, label: variant.label, n, invalid, first, before, listed});
    console.log(
      `  ${variant.id.padEnd(12)} ${pct(first, n).padStart(10)} ${pct(before, n).padStart(12)} ${pct(listed, n).padStart(8)}  ${String(n).padStart(2)}${invalid ? `(-${invalid})` : '   '}  ${variant.label}`,
    );
  }
  // rank by init-first, then init-before-build
  const ranked = [...summary].sort((a, b) => b.first - a.first || b.before - a.before);
  console.log(`\n  🏆 best init-first: ${ranked[0].id} (${pct(ranked[0].first, ranked[0].n).trim()})  ·  worst: ${ranked[ranked.length - 1].id}`);
  console.log(`\n  raw: ${path.relative(process.cwd(), path.join(expDir, 'all.json'))}\n`);

  fs.writeFileSync(
    path.join(expDir, 'summary.json'),
    JSON.stringify({expId, createdAt: timestamp(), reps, models: modelSlugs, summary, ranked}, null, 2),
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
