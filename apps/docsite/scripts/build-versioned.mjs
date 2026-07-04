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
 *      switches on output:'export' + basePath:'/canary'). Route handlers
 *      (route.ts/route.tsx — /mcp, /rss.xml, /blog/txt/[slug], …) can't be
 *      statically exported, so ALL of them are temporarily stashed for this
 *      pass only (latest still ships them). Auto-discovered so a route added
 *      on main can't silently break the export.
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
const APP_DIR = path.join(DOCSITE, 'src', 'app');
const ROUTE_STASH = path.join(DOCSITE, '.route-stash');

function run(cmd, env) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, {cwd: DOCSITE, stdio: 'inherit', env: {...process.env, ...env}});
}

function rmrf(p) {
  fs.rmSync(p, {recursive: true, force: true});
}

/** Recursively find every App Router route handler (route.ts/route.tsx). */
function findRouteHandlers(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findRouteHandlers(full));
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      out.push(full);
    }
  }
  return out;
}

/**
 * Remove `dir` and any now-empty ancestors, stopping at (but never removing)
 * `stopAt`. Stashing a route.ts must not leave an empty route-segment directory
 * behind: an empty dynamic segment like `blog/txt/[slug]/` makes Next's static
 * export choke during route collection. The old MCP-only logic moved the whole
 * `mcp/` dir, so nothing was left; this restores that property generally.
 */
function pruneEmptyDirsUpward(dir, stopAt) {
  let cur = dir;
  while (
    cur.startsWith(stopAt + path.sep) &&
    fs.existsSync(cur) &&
    fs.readdirSync(cur).length === 0
  ) {
    fs.rmdirSync(cur);
    cur = path.dirname(cur);
  }
}

// ── 1. Canary static export ──────────────────────────────────────────────
console.log('=== [1/3] Building canary (static export → /canary) ===');
rmrf(OUT);
// Route handlers (route.ts/route.tsx — e.g. /mcp, /rss.xml, /blog/txt/[slug])
// are server-only and cannot be statically exported. Stash ALL of them for the
// canary pass, preserving their relative paths, and prune the empty route
// segment dirs left behind (an empty [slug] segment breaks export route
// collection). The latest (server) build below restores everything. Routes are
// auto-discovered so one added on main can't silently break the export.
rmrf(ROUTE_STASH);
const routeHandlers = findRouteHandlers(APP_DIR).map(src => ({
  src,
  rel: path.relative(APP_DIR, src),
}));
for (const {src, rel} of routeHandlers) {
  const dest = path.join(ROUTE_STASH, rel);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.renameSync(src, dest);
  pruneEmptyDirsUpward(path.dirname(src), APP_DIR);
}
if (routeHandlers.length) {
  console.log(
    `Stashed ${routeHandlers.length} route handler(s) for the export: ${routeHandlers
      .map(r => r.rel)
      .join(', ')}`,
  );
}
function restoreRouteHandlers() {
  for (const {src, rel} of routeHandlers) {
    const stashed = path.join(ROUTE_STASH, rel);
    if (fs.existsSync(stashed)) {
      fs.mkdirSync(path.dirname(src), {recursive: true});
      fs.renameSync(stashed, src);
    }
  }
  rmrf(ROUTE_STASH);
}
try {
  run('pnpm generate && next build', {DOCSITE_TARGET: 'canary'});
} finally {
  restoreRouteHandlers();
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
