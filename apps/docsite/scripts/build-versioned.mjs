#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-versioned.mjs
 *
 * ONE-DEPLOY dual-version build for the docsite.
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
const SRC_DIR = path.join(DOCSITE, 'src');
const ROUTE_STASH = path.join(DOCSITE, '.route-stash');
const CACHE_STASH = path.join(DOCSITE, '.use-cache-stash');

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

/**
 * Next 16 `'use cache'` (Cache Components / dynamicIO) is a COMPILE-TIME
 * directive: its mere presence in a module errors ("To use 'use cache', enable
 * cacheComponents") under the canary `output:'export'` build, which cannot
 * enable cacheComponents. A runtime DOCSITE_TARGET branch can't help — the
 * compiler scans the source regardless. So for the canary pass we physically
 * strip the directive, its `cacheLife()` calls, and the now-unused `cacheLife`
 * import from every source file, stashing originals to restore afterward. The
 * latest (server) build keeps them intact (cacheComponents is on there).
 * Auto-discovered so a `'use cache'` added on main can't silently break export.
 */
function findFilesWithUseCache(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      out.push(...findFilesWithUseCache(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      const body = fs.readFileSync(full, 'utf-8');
      if (/['"]use cache['"]/.test(body)) out.push(full);
    }
  }
  return out;
}

function stripUseCache(src) {
  return src
    .split('\n')
    .filter(line => {
      const t = line.trim();
      if (t === "'use cache';" || t === '"use cache";') return false;
      if (/^cacheLife\(/.test(t)) return false;
      if (/^import\s*\{\s*cacheLife\s*\}\s*from\s*['"]next\/cache['"];?$/.test(t))
        return false;
      return true;
    })
    .join('\n');
}

/**
 * A metadata route (sitemap.ts/robots.ts) that dropped its `'use cache'` must
 * still be emitted as a static file under output:'export'; Next requires an
 * explicit `export const dynamic = 'force-static'` for that. We inject it for
 * the canary pass only (after the imports) when the file is a metadata route
 * and doesn't already declare `dynamic`. The source stays main-identical (no
 * dynamic export), so the latest build is unaffected.
 */
function injectForceStaticIfMetadataRoute(rel, src) {
  const base = path.basename(rel);
  const isMetadataRoute = base === 'sitemap.ts' || base === 'robots.ts';
  if (!isMetadataRoute || /export const dynamic\b/.test(src)) return src;
  const lines = src.split('\n');
  // Insert after the last top-level import line.
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\b/.test(lines[i])) lastImport = i;
  }
  const inject = [
    '',
    "// Injected by build-versioned.mjs for the canary static export: a",
    "// metadata route must be force-static under output:'export'.",
    "export const dynamic = 'force-static';",
  ];
  lines.splice(lastImport + 1, 0, ...inject);
  return lines.join('\n');
}

const canaryPatchedFiles = [];
/**
 * Apply the canary-only source transforms, stashing each original for restore:
 *  1. strip `'use cache'`/cacheLife from every file that uses them (invalid
 *     under output:'export' — see stripUseCache), and
 *  2. inject `dynamic='force-static'` into metadata routes (sitemap.ts,
 *     robots.ts) so they emit as static files under export.
 * These are independent: a metadata route may need (2) without having (1)
 * (robots.ts has no `'use cache'`), so both file sets are unioned.
 */
function applyCanarySourceTransforms() {
  rmrf(CACHE_STASH);
  const targets = new Set(findFilesWithUseCache(SRC_DIR));
  // Add metadata routes that need force-static even without `'use cache'`.
  for (const name of ['sitemap.ts', 'robots.ts']) {
    const p = path.join(APP_DIR, name);
    if (fs.existsSync(p)) targets.add(p);
  }
  for (const file of targets) {
    const rel = path.relative(SRC_DIR, file);
    const stash = path.join(CACHE_STASH, rel);
    fs.mkdirSync(path.dirname(stash), {recursive: true});
    fs.copyFileSync(file, stash);
    let transformed = stripUseCache(fs.readFileSync(file, 'utf-8'));
    transformed = injectForceStaticIfMetadataRoute(rel, transformed);
    fs.writeFileSync(file, transformed);
    canaryPatchedFiles.push({file, rel});
  }
  if (canaryPatchedFiles.length) {
    console.log(
      `Applied canary source transforms (strip use-cache / inject force-static) to: ${canaryPatchedFiles
        .map(f => f.rel)
        .join(', ')}`,
    );
  }
}
function restoreCanarySourceTransforms() {
  for (const {file, rel} of canaryPatchedFiles) {
    const stash = path.join(CACHE_STASH, rel);
    if (fs.existsSync(stash)) fs.copyFileSync(stash, file);
  }
  rmrf(CACHE_STASH);
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
// Canary-only source transforms (invalid under output:'export' otherwise):
// strip `'use cache'` and inject force-static into metadata routes. Restored
// alongside the route handlers below.
applyCanarySourceTransforms();
try {
  // --webpack: Next 16 defaults to Turbopack, which hard-errors when it sees
  // the `webpack` config key (used for @astryxdesign/core ESM resolution + theme CSS
  // aliases in next.config.mjs). Matches the package.json `build`/`dev`
  // scripts, which also pin --webpack.
  run('pnpm generate && next build --webpack', {DOCSITE_TARGET: 'canary'});
} finally {
  restoreRouteHandlers();
  restoreCanarySourceTransforms();
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
run('pnpm generate && next build --webpack', {DOCSITE_TARGET: 'latest'});

console.log('\n✅ Dual-version build complete. One deployment serves:');
console.log('   /          → latest (server, v-pinned) + /mcp');
console.log('   /canary/*  → canary (static, main)');
