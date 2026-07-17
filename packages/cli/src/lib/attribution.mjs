// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attribution — record HOW a project discovered/acquired the CLI.
 * @input `--via <source>` tag on `astryx init` + environment signals
 * @output an attribution record (append to `.astryx/attribution.jsonl`) and a
 *         one-line comment embedded in the generated agent docs
 * @position packages/cli/src/lib — answers "how did they get the CLI?" in the
 *           wild, so we can learn which discovery channel actually works.
 *
 * Design: local-first, no telemetry / no network. Each discovery channel
 * advertises a uniquely tagged entry command (`astryx init --via=<channel>`);
 * this module captures that tag plus best-effort invoker + install-method
 * detection. Because the tag is also embedded in AGENTS.md/CLAUDE.md, any repo
 * that ran init reveals its channel on inspection — no phone-home required.
 *
 * SYNC: keep VIA_SOURCES in sync with the discovery-channel taxonomy in
 * internal/vibe-tests/cli-discovery-test/conditions.json.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** Known discovery channels. `manual` = typed it themselves; `unknown` = untagged. */
export const VIA_SOURCES = [
  'readme',
  'types',
  'nudge',
  'agents',
  'postinstall',
  'create',
  'docs',
  'manual',
  'unknown',
];

/**
 * Normalize a `--via` value to a known source (or 'other' if unrecognized,
 * 'unknown' if absent). Keeps the attribution vocabulary bounded.
 * @param {string} [via]
 * @returns {string}
 */
export function normalizeVia(via) {
  if (!via) return 'unknown';
  const v = String(via).trim().toLowerCase();
  return VIA_SOURCES.includes(v) ? v : 'other';
}

/**
 * Best-effort: is an AI agent, a human, or CI driving this run?
 * Agents/scripts rarely have a TTY; common coding agents set env markers.
 * @returns {'agent' | 'agent?' | 'ci' | 'human'}
 */
export function detectInvoker() {
  const env = process.env;
  if (
    env.CURSOR_AGENT ||
    env.CURSOR_TRACE_ID ||
    env.CLAUDECODE ||
    env.CLAUDE_CODE ||
    env.AIDER ||
    env.REPL_ID ||
    env.AGENT === '1'
  ) {
    return 'agent';
  }
  if (env.CI) return 'ci';
  // No interactive TTY is most often a scripted or agent invocation.
  if (!process.stdout.isTTY) return 'agent?';
  return 'human';
}

/**
 * Best-effort acquisition method for @astryxdesign/cli.
 * `npx` = ephemeral (not installed); `devDependency`/`dependency` = installed;
 * `local-bin`/`unknown` = couldn't tell.
 * @param {string} [targetDir]
 * @returns {'npx' | 'devDependency' | 'dependency' | 'local-bin' | 'unknown'}
 */
export function detectInstallMethod(targetDir = process.cwd()) {
  const binPath = process.argv[1] || '';
  // npx/yarn dlx/pnpm dlx run the bin from a throwaway cache dir.
  if (/[\\/]_npx[\\/]/.test(binPath) || /dlx/.test(binPath)) return 'npx';

  try {
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.devDependencies && pkg.devDependencies['@astryxdesign/cli']) return 'devDependency';
      if (pkg.dependencies && pkg.dependencies['@astryxdesign/cli']) return 'dependency';
    }
  } catch {
    // Best-effort: unreadable package.json.
  }

  if (/[\\/]node_modules[\\/]/.test(binPath)) return 'local-bin';
  return 'unknown';
}

/**
 * Build the attribution record.
 * @param {object} opts
 * @param {string} [opts.via]
 * @param {string} [opts.targetDir]
 * @param {string|null} [opts.cliVersion]
 * @param {string|null} [opts.coreVersion]
 * @returns {{via:string, invoker:string, installMethod:string, cliVersion:(string|null), coreVersion:(string|null), node:string, ts:string}}
 */
export function buildAttribution({via, targetDir = process.cwd(), cliVersion = null, coreVersion = null} = {}) {
  return {
    via: normalizeVia(via ?? process.env.ASTRYX_VIA),
    invoker: detectInvoker(),
    installMethod: detectInstallMethod(targetDir),
    cliVersion,
    coreVersion,
    node: process.versions.node,
    ts: new Date().toISOString(),
  };
}

/**
 * Append an attribution record to <targetDir>/.astryx/attribution.jsonl.
 * JSONL keeps a history across re-runs (each init is a data point).
 * @returns {string} the file path written
 */
export function recordAttribution(targetDir, record) {
  const dir = path.join(targetDir, '.astryx');
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, 'attribution.jsonl');
  fs.appendFileSync(file, JSON.stringify(record) + '\n');
  return file;
}

/**
 * Record an attribution ping AT MOST ONCE per CLI version for this project, so
 * ANY astryx command — not just `init` — reveals how/when the project began
 * using the CLI. Deduped by cliVersion so repeated commands don't spam the log.
 * This is what makes attribution foolproof: even agents that skip `init` and
 * just run `component`/`build` leave a first-seen record.
 *
 * @param {string} targetDir
 * @param {ReturnType<typeof buildAttribution>} record
 * @returns {string|null} file path if written, null if skipped (already seen)
 */
export function recordFirstSeen(targetDir, record) {
  try {
    const file = path.join(targetDir, '.astryx', 'attribution.jsonl');
    if (fs.existsSync(file)) {
      const seen = fs.readFileSync(file, 'utf-8');
      // Already have a record for this CLI version → don't spam the log.
      if (record.cliVersion && seen.includes(`"cliVersion":${JSON.stringify(record.cliVersion)}`)) {
        return null;
      }
    }
    return recordAttribution(targetDir, record);
  } catch {
    return null; // never let attribution break the CLI
  }
}

/**
 * A single HTML comment embedded in agent docs so any repo reveals its channel
 * on inspection (the most foolproof, telemetry-free attribution).
 * @returns {string}
 */
export function attributionComment(record) {
  return `<!-- ASTRYX:src via=${record.via} invoker=${record.invoker} install=${record.installMethod} v=${record.cliVersion ?? '?'} ts=${record.ts} -->`;
}
