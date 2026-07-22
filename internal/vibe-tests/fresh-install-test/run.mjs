#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run.mjs
 * @input CLI flags: --reps, --model, --concurrency, --registry, --source, --turn-timeout, --keep, --exp
 * @output /tmp sandboxes + results/manifest-<expId>.json (one entry per rep)
 * @position internal/vibe-tests/fresh-install-test — the FRESH-INSTALL runner
 *
 * The question (see PLAN.md): people run `npm install @astryxdesign/core` but
 * never run `astryx init`, so their agent never gets the cheat sheet. This test
 * reproduces that exact cold start with a REAL public-npm install and measures
 * how often a headless Sonnet agent discovers the CLI and runs `astryx init`
 * on its own.
 *
 * Design (mirrors cli-discovery-test/PLAN.md §14 isolation lessons):
 *   - Each rep is an EMPTY dir under os.tmpdir() → no ancestor CLAUDE.md/AGENTS.md
 *     from this repo, no design-system source to explore. The only way to learn
 *     the CLI is the shipped package itself.
 *   - The agent installs from the PUBLIC npm registry (the machine default is
 *     Meta-internal and 401s for @astryxdesign/*), routed via npm_config_registry.
 *   - Two turns in ONE session: turn 1 (install + scaffold), turn 2 (build a
 *     to-do app), via `cursor-agent --resume <session_id>`.
 *
 * Ground truth is FILE-BASED and scored separately by score.mjs — the only
 * thing that writes `<!-- ASTRYX:START -->` is `astryx init`, so its presence in
 * an agent-doc file is proof init ran. This runner just drives the agent and
 * records what happened.
 *
 * Usage:
 *   node run.mjs                      # 5 reps, Sonnet, from public npm
 *   node run.mjs --reps 10 --concurrency 3
 *   node run.mjs --model claude-4.5-sonnet --reps 5
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ensureRegistry, DEFAULT_URL as LOCAL_REGISTRY_URL, isPatched} from './local-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');
const PROMPTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf-8'));

const timestamp = () => new Date().toISOString();
const ensureDir = d => fs.mkdirSync(d, {recursive: true});

// ── Isolation guard — EVERY session must be fully sandboxed ────────────────────
// A run is only valid if its sandbox lives under the OS temp dir (never the repo)
// AND no ANCESTOR directory carries agent rules (CLAUDE.md / AGENTS.md /
// .cursorrules / .cursor). This is what stops the repo's always-applied ASTRYX
// CLAUDE.md from leaking into a headless agent. Fail LOUD, never silently run
// contaminated. (Rule files INSIDE the sandbox are fine — those are the app's own.)
const RULE_FILES = ['CLAUDE.md', 'AGENTS.md', '.cursorrules', '.cursor'];
function assertSandboxed(repDir) {
  const tmp = fs.realpathSync(os.tmpdir());
  const real = fs.realpathSync(repDir);
  if (!(real === tmp || real.startsWith(tmp + path.sep))) {
    throw new Error(`ISOLATION FAILURE: sandbox ${real} is not under the OS temp dir (${tmp}). Refusing to run — a session must never sit inside the repo.`);
  }
  for (let dir = path.dirname(real); dir.startsWith(tmp); dir = path.dirname(dir)) {
    for (const rf of RULE_FILES) {
      if (fs.existsSync(path.join(dir, rf))) {
        throw new Error(`ISOLATION FAILURE: ancestor ${path.join(dir, rf)} would leak agent rules into ${real}.`);
      }
    }
    if (dir === tmp) break;
  }
}

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

/**
 * Spawn a child, streaming stdout/stderr to a file, killed after timeoutMs.
 * detached so we can kill the whole process group (create-next-app / npm spawn
 * grandchildren that must die with it).
 */
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
        /* already gone */
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

/**
 * Parse cursor-agent --output-format stream-json (NDJSON) → session_id, final
 * result text, usage, and the GROUND-TRUTH tool trail: every shell command and
 * file read the agent ran. The trail is how we *see* discovery — which docs it
 * read (e.g. node_modules/@astryxdesign/core/README.md) and whether it actually
 * ran `astryx init`.
 */
function parseAgentStream(stdout) {
  const out = {sessionId: null, result: '', usage: null, isError: false, commands: [], reads: []};
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
      out.sessionId = obj.session_id ?? out.sessionId;
      out.result = obj.result ?? '';
      out.usage = obj.usage ?? null;
      out.isError = !!obj.is_error;
    }
    if (obj.type === 'tool_call' && obj.subtype === 'started' && obj.tool_call) {
      const tc = obj.tool_call;
      if (tc.shellToolCall?.args?.command != null) {
        out.commands.push(String(tc.shellToolCall.args.command));
      } else if (tc.readToolCall?.args) {
        const a = tc.readToolCall.args;
        out.reads.push(a.path ?? a.target ?? a.file ?? JSON.stringify(a));
      }
    }
  }
  return out;
}

async function runRep({repDir, model, env, turnTimeoutMs}) {
  ensureDir(repDir);
  assertSandboxed(repDir); // refuse to run unless fully isolated from the repo
  const rec = {repDir, createdAt: timestamp(), turns: []};

  // ── Turn 1 ──────────────────────────────────────────────────────────────
  const t1args = [
    '-p', '--output-format', 'stream-json',
    '--force', '--trust', '--sandbox', 'disabled',
    '--workspace', repDir, // pin the workspace to the sandbox — never the repo
    '--model', model,
    PROMPTS.turns[0],
  ];
  const t1 = await runProc('cursor-agent', t1args, {
    cwd: repDir,
    env,
    timeoutMs: turnTimeoutMs,
    logFile: path.join(repDir, 'turn1.log'),
  });
  const p1 = parseAgentStream(t1.stdout);
  fs.writeFileSync(path.join(repDir, 'turn1.stream.jsonl'), t1.stdout || '');
  rec.turns.push({turn: 1, prompt: PROMPTS.turns[0], sessionId: p1.sessionId, result: p1.result, usage: p1.usage, exit: t1.code, timedOut: t1.timedOut, ms: t1.ms, isError: p1.isError, commands: p1.commands, reads: p1.reads});
  rec.sessionId = p1.sessionId;

  // ── Turn 2 (same session) ────────────────────────────────────────────────
  const t2args = ['-p', '--output-format', 'stream-json', '--force', '--trust', '--sandbox', 'disabled', '--workspace', repDir, '--model', model];
  if (p1.sessionId) {
    t2args.push('--resume', p1.sessionId);
  }
  t2args.push(PROMPTS.turns[1]);
  const t2 = await runProc('cursor-agent', t2args, {
    cwd: repDir,
    env,
    timeoutMs: turnTimeoutMs,
    logFile: path.join(repDir, 'turn2.log'),
  });
  const p2 = parseAgentStream(t2.stdout);
  fs.writeFileSync(path.join(repDir, 'turn2.stream.jsonl'), t2.stdout || '');
  rec.turns.push({turn: 2, prompt: PROMPTS.turns[1], sessionId: p2.sessionId, result: p2.result, usage: p2.usage, exit: t2.code, timedOut: t2.timedOut, ms: t2.ms, isError: p2.isError, resumedFrom: p1.sessionId ?? null, commands: p2.commands, reads: p2.reads});

  rec.finishedAt = timestamp();
  fs.writeFileSync(path.join(repDir, 'rep.json'), JSON.stringify(rec, null, 2));
  return rec;
}

async function main() {
  const reps = parseInt(arg('--reps', '5'), 10);
  const model = arg('--model', 'claude-sonnet-5-high');
  const concurrency = parseInt(arg('--concurrency', '3'), 10);
  const registryFlagPassed = process.argv.includes('--registry');
  const registry = arg('--registry', 'https://registry.npmjs.org/');
  const source = arg('--source', 'public'); // public (real npm) | local (verdaccio, see local-registry.mjs)
  const turnTimeoutMs = parseInt(arg('--turn-timeout', '900'), 10) * 1000;
  const expId = arg('--exp', crypto.randomBytes(4).toString('hex'));
  const dryRun = process.argv.includes('--dry-run'); // set up + route, but launch no agents

  // Resolve the registry the AGENT installs from. Everything else (prompts,
  // isolation, scoring) is identical across sources — only the SUT varies.
  //   public → public npm (default), or an explicit --registry override
  //   local  → a local Verdaccio serving a *patched* @astryxdesign/core as latest
  //            and uplinking everything else to public npm (W-infra). Publish the
  //            candidate first with:  node local-registry.mjs publish --readme <f>
  let effectiveRegistry = registry;
  if (source === 'local') {
    const localUrl = registryFlagPassed ? registry : LOCAL_REGISTRY_URL;
    const port = Number(new URL(localUrl).port || 4873);
    const reg = await ensureRegistry({port});
    effectiveRegistry = reg.url;
    console.log(`   Local registry ${reg.alreadyRunning ? 'already running' : 'started'} at ${reg.url}`);
    if (await isPatched('@astryxdesign/core', effectiveRegistry)) {
      console.log(`   Serving a patched @astryxdesign/core (candidate build).`);
    } else {
      console.log(`   ⚠️  No patched @astryxdesign/core published — the agent would get the`);
      console.log(`      PUBLIC build via uplink. Publish a candidate first:`);
      console.log(`        node local-registry.mjs publish --readme <file>`);
    }
  } else if (source !== 'public') {
    console.error(`--source ${source} not recognized. Use 'public' (real npm) or 'local' (verdaccio). See PLAN.md §Testing-fixes.`);
    process.exit(1);
  }

  ensureDir(RESULTS_DIR);
  const tmpRoot = path.join(os.tmpdir(), 'astryx-fresh-install', expId);
  ensureDir(tmpRoot);

  // Route installs to the effective registry (public npm by default; the local
  // Verdaccio when --source local). Machine default is the internal 401 mirror,
  // and no scoped @astryxdesign override exists in ~/.npmrc, so the top-level
  // registry env is enough; set the scoped key too for belt-and-suspenders.
  const env = {
    ...process.env,
    npm_config_registry: effectiveRegistry,
    'npm_config_@astryxdesign:registry': effectiveRegistry,
    npm_config_yes: 'true', // auto-confirm `npx create-next-app` package fetch
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    NEXT_TELEMETRY_DISABLED: '1',
    ADBLOCK: '1',
    DISABLE_OPENCOLLECTIVE: '1',
    CI: '', // keep create-next-app in its normal (non-CI) mode
    // --source local only: every agent install targets localhost:4873 (Verdaccio
    // proxies public deps itself), so keep localhost off the machine's outbound
    // proxy. No-op for --source public, which stays byte-for-byte unchanged.
    ...(source === 'local' ? {no_proxy: 'localhost,127.0.0.1,::1', NO_PROXY: 'localhost,127.0.0.1,::1'} : {}),
  };

  console.log(`\n🧪 Fresh-install discovery — experiment ${expId}`);
  console.log(`   Model:       ${model}`);
  console.log(`   Reps:        ${reps} (concurrency ${concurrency})`);
  console.log(`   Source:      ${source}`);
  console.log(`   Registry:    ${effectiveRegistry}`);
  console.log(`   Sandboxes:   ${tmpRoot}`);
  console.log(`   Turn 1:      "${PROMPTS.turns[0]}"`);
  console.log(`   Turn 2:      "${PROMPTS.turns[1]}"`);
  console.log(`   Turn budget: ${turnTimeoutMs / 1000}s each\n`);

  const repDirs = Array.from({length: reps}, (_, k) => path.join(tmpRoot, `rep-${k + 1}`));
  const records = new Array(reps);
  let next = 0;
  let done = 0;

  async function worker() {
    while (next < reps) {
      const k = next++;
      const repDir = repDirs[k];
      process.stdout.write(`  ▶ rep-${k + 1} starting…\n`);
      try {
        const rec = await runRep({repDir, model, env, turnTimeoutMs});
        records[k] = rec;
        const t1 = rec.turns[0];
        const t2 = rec.turns[1];
        done++;
        process.stdout.write(
          `  ✓ rep-${k + 1} done (${done}/${reps}) · t1 ${(t1.ms / 1000).toFixed(0)}s${t1.timedOut ? ' TIMEOUT' : ''} · t2 ${(t2.ms / 1000).toFixed(0)}s${t2.timedOut ? ' TIMEOUT' : ''} · session ${rec.sessionId ? 'ok' : 'MISSING'}\n`,
        );
      } catch (err) {
        records[k] = {repDir, error: String(err)};
        process.stdout.write(`  ✗ rep-${k + 1} error: ${err}\n`);
      }
      writeManifest();
    }
  }

  const manifestPath = path.join(RESULTS_DIR, `manifest-${expId}.json`);
  function writeManifest() {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {experimentId: expId, createdAt: timestamp(), model, reps, registry: effectiveRegistry, source, tmpRoot, prompts: PROMPTS.turns, repDirs, records: records.filter(Boolean)},
        null,
        2,
      ),
    );
  }

  writeManifest();
  if (dryRun) {
    console.log('\n   DRY RUN — no agents launched. The agent would install with:');
    console.log(`     npm_config_registry               = ${env.npm_config_registry}`);
    console.log(`     npm_config_@astryxdesign:registry = ${env['npm_config_@astryxdesign:registry']}`);
    console.log(`   Manifest: ${manifestPath}\n`);
    try {
      fs.rmSync(tmpRoot, {recursive: true, force: true}); // drop the empty sandbox root
    } catch {
      /* ignore */
    }
    return;
  }
  await Promise.all(Array.from({length: Math.min(concurrency, reps)}, worker));
  writeManifest();

  console.log(`\n✅ All ${reps} reps complete.`);
  console.log(`   Manifest: ${manifestPath}`);
  console.log(`   Score it: node ${path.relative(process.cwd(), path.join(__dirname, 'score.mjs'))} --exp ${expId}\n`);
}

main();
