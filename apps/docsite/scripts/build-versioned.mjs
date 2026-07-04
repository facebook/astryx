#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-versioned.mjs
 *
 * ONE-DEPLOY dual-version build for the docsite (PR #3513).
 *
 * Produces a single Vercel deployment that serves BOTH content lines:
 *   /          → latest (full Next server build; keeps the dynamic /mcp route)
 *   /canary/*  → canary (static export, basePath=/canary), nested under the
 *                latest build's public/ so Vercel's CDN serves it on the same
 *                deployment.
 *
 * Order matters:
 *   1. Build canary as a STATIC EXPORT (DOCSITE_TARGET=canary → next.config
 *      switches on output:'export' + basePath:'/canary'). Route handlers can't
 *      be statically exported, so the dynamic MCP route is temporarily removed
 *      for this pass only (latest still ships it).
 *   2. Copy the export (out/) into public/canary/.
 *   3. Build latest (server). Next copies public/canary/** into the served
 *      static assets, so /canary/* resolves on the same deployment.
 *
 * Local dev never needs this — `next dev` serves a single target (default
 * canary) and the switcher degrades gracefully. This script is for the Vercel
 * build only; wire it via vercel.json buildCommand.
 */

import {execSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const DOCSITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(DOCSITE, 'out');
const PUBLIC_CANARY = path.join(DOCSITE, 'public', 'canary');
const MCP_DIR = path.join(DOCSITE, 'src', 'app', 'mcp');
const MCP_STASH = path.join(DOCSITE, '.mcp-stash');

function run(cmd, env) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, {cwd: DOCSITE, stdio: 'inherit', env: {...process.env, ...env}});
}

function rmrf(p) {
  fs.rmSync(p, {recursive: true, force: true});
}

// ── 1. Canary static export ──────────────────────────────────────────────
console.log('=== [1/3] Building canary (static export → /canary) ===');
rmrf(OUT);
// The MCP route handler is dynamic and cannot be statically exported. Stash it
// for the canary pass; the latest (server) build below restores and ships it.
const hasMcp = fs.existsSync(MCP_DIR);
if (hasMcp) {
  rmrf(MCP_STASH);
  fs.renameSync(MCP_DIR, MCP_STASH);
}
try {
  run('pnpm generate && next build', {DOCSITE_TARGET: 'canary'});
} finally {
  if (hasMcp && fs.existsSync(MCP_STASH)) {
    rmrf(MCP_DIR);
    fs.renameSync(MCP_STASH, MCP_DIR);
  }
}
if (!fs.existsSync(OUT)) {
  throw new Error('Canary export did not produce out/. Aborting.');
}

// ── 2. Nest the export under public/canary/ ───────────────────────────────
console.log('\n=== [2/3] Nesting canary export → public/canary/ ===');
rmrf(PUBLIC_CANARY);
fs.mkdirSync(path.dirname(PUBLIC_CANARY), {recursive: true});
fs.cpSync(OUT, PUBLIC_CANARY, {recursive: true});
console.log(`Copied out/ → public/canary/ (${fs.readdirSync(PUBLIC_CANARY).length} entries)`);

// ── 3. Latest server build (serves / and /canary/* + /mcp) ────────────────
console.log('\n=== [3/3] Building latest (server, serves / + /canary) ===');
run('pnpm generate && next build', {DOCSITE_TARGET: 'latest'});

console.log('\n✅ Dual-version build complete. One deployment serves:');
console.log('   /          → latest (server, v-pinned) + /mcp');
console.log('   /canary/*  → canary (static, main)');
