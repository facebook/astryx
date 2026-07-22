#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file local-registry.mjs
 * @input CLI: start | stop | status | publish | verify [--port --pkg --version --overlay --readme --postinstall]
 * @output A running Verdaccio on :4873 that serves PATCHED @astryxdesign/* locally
 *         and uplinks everything else to public npm; storage under .verdaccio/
 * @position internal/vibe-tests/fresh-install-test — the LOCAL-REGISTRY harness (W-infra)
 *
 * Why this exists (see FOOLPROOF-ROADMAP.md §W-infra): the fresh-install test has
 * the agent run `npm install @astryxdesign/core` in an empty sandbox. To A/B a
 * *foolproofing change* (e.g. a restructured README or an install-time banner) we
 * must make that install resolve to OUR modified package — not the published one.
 * A local Verdaccio does exactly that: it serves a locally-published, version-
 * bumped copy of @astryxdesign/core as `latest`, and PROXIES every other request
 * (next, react, intl-messageformat, even unmodified @astryxdesign/cli) to public
 * npm. Nothing about the prompts, isolation, or scoring changes — only the SUT.
 *
 * The "patch the real tarball" trick (publishPatched): we DON'T rebuild core from
 * source. We `npm pack` the real published tarball from public npm, overlay a few
 * files (e.g. a replacement README.md), deep-merge package.json tweaks, bump the
 * version above public `latest` so it wins the `latest` dist-tag, and re-publish
 * to Verdaccio. So the candidate differs from the baseline by exactly the overlay.
 *
 * Machine note: the default npm registry here is the Meta-internal mirror (401s
 * for @astryxdesign/*). So every PUBLIC fetch (verdaccio install via npx, base
 * `npm pack`, `npm view`) is pinned to https://registry.npmjs.org/ explicitly.
 *
 * Usage:
 *   node local-registry.mjs start                         # boot verdaccio (idempotent)
 *   node local-registry.mjs publish --readme ./MY_README  # patch core's README, publish
 *   node local-registry.mjs verify                        # prove patched-local + uplink
 *   node local-registry.mjs stop                          # kill verdaccio, keep storage
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {spawn, spawnSync, execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PUBLIC_REGISTRY = 'https://registry.npmjs.org/';
export const DEFAULT_PORT = 4873;
export const DEFAULT_URL = `http://localhost:${DEFAULT_PORT}`;

const VERDACCIO_DIR = path.join(__dirname, '.verdaccio');
const STORAGE_DIR = path.join(VERDACCIO_DIR, 'storage');
const CONFIG_PATH = path.join(VERDACCIO_DIR, 'config.yaml');
const PID_PATH = path.join(VERDACCIO_DIR, 'verdaccio.pid');
const LOG_PATH = path.join(VERDACCIO_DIR, 'verdaccio.log');
const HTPASSWD_PATH = path.join(VERDACCIO_DIR, 'htpasswd');

// Version scheme for patched builds: a prerelease that is > any real 0.x.y public
// release, so Verdaccio's dist-tag merge keeps OUR version as `latest` while the
// uplink's older versions still coexist. See nextPatchedVersion().
const PATCH_BASE = '0.99.0';
const PATCH_PRE = 'foolproof';
const PATCH_RE = new RegExp(`^${PATCH_BASE.replace(/\./g, '\\.')}-${PATCH_PRE}\\.(\\d+)$`);

const ensureDir = d => fs.mkdirSync(d, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));

// This machine reaches the internet only through an x2p HTTP proxy (see
// HTTPS_PROXY env). npm honors these env vars, but Verdaccio does NOT — its
// `request`-based uplink only reads `https_proxy`/`http_proxy` from its OWN
// config (verdaccio/build/lib/up-storage.js `_setupProxy`). So we lift the proxy
// out of the environment and bake it into the generated uplink config; without
// this, every proxied read returns 503 and `npm publish` hangs on retries.
const OUTBOUND_HTTPS_PROXY =
  process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || '';
const OUTBOUND_HTTP_PROXY = process.env.HTTP_PROXY || process.env.http_proxy || OUTBOUND_HTTPS_PROXY || '';
// Local registry traffic (localhost:4873) must never be sent through that proxy.
const NO_PROXY_LOCAL = 'localhost,127.0.0.1,::1';

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : def;
}

/** Deep-merge `src` into `dst` in place (plain objects recurse; arrays/scalars replace). */
function deepMerge(dst, src) {
  for (const [k, v] of Object.entries(src ?? {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) {
      deepMerge(dst[k], v);
    } else {
      dst[k] = v;
    }
  }
  return dst;
}

/** Recursively copy every file in `srcDir` over `dstDir` (overlay semantics). */
function copyOverlay(srcDir, dstDir) {
  for (const e of fs.readdirSync(srcDir, {withFileTypes: true})) {
    const s = path.join(srcDir, e.name);
    const d = path.join(dstDir, e.name);
    if (e.isDirectory()) {
      ensureDir(d);
      copyOverlay(s, d);
    } else if (e.isFile()) {
      ensureDir(path.dirname(d));
      fs.copyFileSync(s, d);
    }
  }
}

/**
 * Run npm with the registry pinned (top-level + @astryxdesign scope) so a PUBLIC
 * fetch never hits the internal mirror. `registry` also drives publish target.
 */
function runNpm(args, {cwd, registry = PUBLIC_REGISTRY, userconfig, extraEnv = {}, allowFail = false} = {}) {
  const env = {
    ...process.env,
    npm_config_registry: registry,
    'npm_config_@astryxdesign:registry': registry,
    npm_config_yes: 'true',
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    // Bypass the outbound proxy for localhost so calls to the local registry go
    // direct; public fetches (registry.npmjs.org) still traverse the proxy.
    no_proxy: NO_PROXY_LOCAL,
    NO_PROXY: NO_PROXY_LOCAL,
    ...extraEnv,
  };
  if (userconfig) env.npm_config_userconfig = userconfig;
  // input:'' gives stdin immediate EOF so npm can never block on an interactive prompt.
  const res = spawnSync('npm', args, {cwd, env, encoding: 'utf-8', input: '', maxBuffer: 64 * 1024 * 1024});
  if (res.status !== 0 && !allowFail) {
    throw new Error(`npm ${args.join(' ')} failed (exit ${res.status})\n${res.stdout || ''}\n${res.stderr || ''}`);
  }
  return res;
}

/** The verdaccio config: uplink to public npm, anonymous publish for @astryxdesign/*, proxy the rest. */
function verdaccioConfigYaml() {
  const proxyLines = [];
  if (OUTBOUND_HTTPS_PROXY) proxyLines.push(`    https_proxy: ${OUTBOUND_HTTPS_PROXY}`);
  if (OUTBOUND_HTTP_PROXY) proxyLines.push(`    http_proxy: ${OUTBOUND_HTTP_PROXY}`);
  const proxyBlock = proxyLines.length ? proxyLines.join('\n') + '\n' : '';
  return `# Auto-generated by local-registry.mjs — do not edit; regenerated on every start.
storage: ${JSON.stringify(STORAGE_DIR)}
auth:
  htpasswd:
    file: ${JSON.stringify(HTPASSWD_PATH)}
    # -1 disables self-service signup; anonymous access is governed by the ACLs below.
    max_users: -1
uplinks:
  npmjs:
    url: ${PUBLIC_REGISTRY}
${proxyBlock}    cache: true
    maxage: 30m
    timeout: 60s
    fail_timeout: 5m
packages:
  # Our SUT scope: allow anonymous publish AND proxy — so a *patched* core we
  # publish locally (higher version) wins \`latest\`, while UNMODIFIED packages in
  # the scope (e.g. @astryxdesign/cli) still resolve from public via the uplink.
  '@astryxdesign/*':
    access: $all
    publish: $all
    unpublish: $all
    proxy: npmjs
  '@*/*':
    access: $all
    publish: $all
    unpublish: $all
    proxy: npmjs
  '**':
    access: $all
    publish: $all
    unpublish: $all
    proxy: npmjs
security:
  api:
    legacy: true
log: {type: file, path: ${JSON.stringify(LOG_PATH)}, level: warn}
max_body_size: 100mb
`;
}

/** True if something is speaking HTTP on the registry URL (server is up). */
async function isUp(url) {
  for (const p of ['/-/ping', '/']) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      await fetch(url + p, {signal: ctrl.signal});
      clearTimeout(t);
      return true; // any HTTP response (even 404) means it's listening
    } catch {
      /* try next path / not up */
    }
  }
  return false;
}

function readPid() {
  try {
    const n = parseInt(fs.readFileSync(PID_PATH, 'utf-8').trim(), 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Start Verdaccio (idempotent): if the port already answers HTTP, reuse it.
 * Verdaccio is fetched from PUBLIC npm via npx (pinned registry) so the internal
 * mirror never 401s it. Spawned detached with its own process group so stop() can
 * kill the whole group without touching unrelated node/cursor-agent processes.
 *
 * @returns {Promise<{url:string, port:number, pid:number|null, alreadyRunning:boolean}>}
 */
export async function startRegistry({port = DEFAULT_PORT, waitMs = 120000} = {}) {
  const url = `http://localhost:${port}`;
  ensureDir(VERDACCIO_DIR);
  ensureDir(STORAGE_DIR);
  if (!fs.existsSync(HTPASSWD_PATH)) fs.writeFileSync(HTPASSWD_PATH, '');
  fs.writeFileSync(CONFIG_PATH, verdaccioConfigYaml());

  if (await isUp(url)) {
    return {url, port, pid: readPid(), alreadyRunning: true};
  }

  const out = fs.openSync(LOG_PATH, 'a');
  const child = spawn('npx', ['--yes', 'verdaccio@6', '--config', CONFIG_PATH, '--listen', String(port)], {
    detached: true,
    stdio: ['ignore', out, out],
    env: {...process.env, npm_config_registry: PUBLIC_REGISTRY, npm_config_yes: 'true'},
  });
  child.unref();
  if (child.pid) fs.writeFileSync(PID_PATH, String(child.pid));

  const start = Date.now();
  while (Date.now() - start < waitMs) {
    if (await isUp(url)) return {url, port, pid: child.pid ?? null, alreadyRunning: false};
    await sleep(500);
  }
  throw new Error(`Verdaccio did not become ready within ${waitMs}ms. See log: ${LOG_PATH}`);
}

/** Alias — start-if-needed. Used by run.mjs so `--source local` just works. */
export const ensureRegistry = startRegistry;

/** Stop the Verdaccio we started (kills only our recorded process group). */
export async function stopRegistry() {
  const pid = readPid();
  if (!pid) return {stopped: false, reason: 'no pid file (nothing we started)'};
  const kill = sig => {
    try {
      process.kill(-pid, sig);
    } catch {
      /* group gone */
    }
    try {
      process.kill(pid, sig);
    } catch {
      /* proc gone */
    }
  };
  kill('SIGTERM');
  for (let i = 0; i < 20 && (await isUp(DEFAULT_URL)); i++) await sleep(200);
  if (await isUp(`http://localhost:${DEFAULT_PORT}`)) kill('SIGKILL');
  fs.rmSync(PID_PATH, {force: true});
  return {stopped: true, pid};
}

/** Next unused patched version (e.g. 0.99.0-foolproof.3), scanning what's published locally. */
async function nextPatchedVersion(pkgName, registryUrl) {
  const res = runNpm(['view', pkgName, 'versions', '--json'], {registry: registryUrl, allowFail: true});
  let n = 0;
  if (res.status === 0 && res.stdout.trim()) {
    try {
      let arr = JSON.parse(res.stdout);
      if (typeof arr === 'string') arr = [arr];
      for (const v of arr) {
        const m = PATCH_RE.exec(v);
        if (m) n = Math.max(n, Number(m[1]));
      }
    } catch {
      /* ignore parse issues */
    }
  }
  return `${PATCH_BASE}-${PATCH_PRE}.${n + 1}`;
}

/**
 * Publish a PATCHED copy of a real package to the local registry, WITHOUT
 * rebuilding it from source:
 *   1. resolve public `latest` and `npm pack` that exact tarball from public npm
 *   2. extract it, overlay files from `overlayDir` (e.g. a replacement README.md)
 *   3. deep-merge `pkgJsonMerge` into package.json (e.g. add a postinstall)
 *   4. bump version above public latest so it wins the `latest` dist-tag
 *   5. `npm publish` to the local registry with a throwaway auth token
 *
 * @param {string} pkgName e.g. '@astryxdesign/core'
 * @param {{version?:string, overlayDir?:string, pkgJsonMerge?:object, registryUrl?:string, publicRegistry?:string}} opts
 * @returns {Promise<{name:string, version:string, baseVersion:string, registry:string}>}
 */
export async function publishPatched(
  pkgName = '@astryxdesign/core',
  {version, baseVersion, overlayDir, pkgJsonMerge = {}, registryUrl = DEFAULT_URL, publicRegistry = PUBLIC_REGISTRY} = {},
) {
  const port = Number(new URL(registryUrl).port || DEFAULT_PORT);
  await ensureRegistry({port});

  // Base tarball to pack: an explicit historical version (to serve an OLD release
  // as the rig's `latest`, e.g. --base-version 0.1.6) or public `latest` default.
  const resolvedBase = baseVersion || runNpm(['view', pkgName, 'version'], {registry: publicRegistry}).stdout.trim();
  if (!resolvedBase) throw new Error(`Could not resolve base version for ${pkgName}`);
  const finalVersion = version || (await nextPatchedVersion(pkgName, registryUrl));

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-local-registry-pack-'));
  try {
    // 1. fetch the REAL published tarball from public npm
    runNpm(['pack', `${pkgName}@${resolvedBase}`, '--pack-destination', work], {cwd: work, registry: publicRegistry});
    const tgz = fs.readdirSync(work).find(f => f.endsWith('.tgz'));
    if (!tgz) throw new Error('npm pack produced no tarball');

    // 2. extract → <work>/package
    execFileSync('tar', ['xzf', path.join(work, tgz), '-C', work]);
    const pkgDir = path.join(work, 'package');

    // 3. overlay files (README replacement, added assets, etc.)
    if (overlayDir) {
      if (!fs.existsSync(overlayDir)) throw new Error(`overlayDir not found: ${overlayDir}`);
      copyOverlay(overlayDir, pkgDir);
    }

    // 4. merge package.json, bump version, drop workspace-only build lifecycle
    //    scripts (prepack: "pnpm build" would fail — there's no source here).
    const pjPath = path.join(pkgDir, 'package.json');
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf-8'));
    deepMerge(pj, pkgJsonMerge);
    pj.version = finalVersion;
    if (pj.scripts) {
      for (const s of ['prepack', 'prepare', 'prepublish', 'prepublishOnly']) delete pj.scripts[s];
    }
    fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2) + '\n');

    // 5. anonymous publish: npm needs *an* auth token client-side; verdaccio's
    //    $all ACL accepts the (bogus) token as anonymous.
    const npmrc = path.join(work, '.npmrc');
    const authHost = registryUrl.replace(/^https?:/, '').replace(/\/?$/, '/'); // //localhost:4873/
    fs.writeFileSync(npmrc, `${authHost}:_authToken=fake\nregistry=${registryUrl}\n`);

    runNpm(['publish', '--tag', 'latest', '--access', 'public', '--ignore-scripts', '--registry', registryUrl], {
      cwd: pkgDir,
      registry: registryUrl,
      userconfig: npmrc,
    });

    return {name: pkgName, version: finalVersion, baseVersion: resolvedBase, registry: registryUrl};
  } finally {
    fs.rmSync(work, {recursive: true, force: true});
  }
}

/** Read a registry's `latest` dist-tag for a package (null if none / unreachable). */
export async function latestTag(pkgName, registryUrl = DEFAULT_URL) {
  try {
    const res = await fetch(`${registryUrl.replace(/\/$/, '')}/${pkgName.replace('/', '%2F')}`);
    if (!res.ok) return null;
    const meta = await res.json();
    return meta['dist-tags']?.latest ?? null;
  } catch {
    return null;
  }
}

/** True if the local registry is currently serving a patched (foolproof) core. */
export async function isPatched(pkgName = '@astryxdesign/core', registryUrl = DEFAULT_URL) {
  const latest = await latestTag(pkgName, registryUrl);
  return !!latest && PATCH_RE.test(latest);
}

const SENTINEL = 'ASTRYX_LOCAL_REGISTRY_SENTINEL';

/**
 * Self-contained proof the registry does its job:
 *   (a) publish a README-patched core carrying a SENTINEL, then confirm a fresh
 *       `npm pack @astryxdesign/core` (→ latest) from the local registry returns
 *       OUR version with the sentinel present;
 *   (b) confirm an UNMODIFIED public package (`next`) resolves via the uplink;
 *   (c) confirm an UNMODIFIED scoped internal package (`@astryxdesign/cli`, which
 *       the real experiment installs) resolves via the uplink too.
 * Prints a PASS/FAIL table. @returns {Promise<{pass:boolean, checks:Array}>}
 */
export async function verify({port = DEFAULT_PORT} = {}) {
  const url = `http://localhost:${port}`;
  await ensureRegistry({port});
  const checks = [];

  // (a) publish a sentinel-bearing patched core, then read it back.
  const overlay = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-local-registry-overlay-'));
  fs.writeFileSync(
    path.join(overlay, 'README.md'),
    `# @astryxdesign/core — LOCAL TEST PATCH\n\n${SENTINEL}\n\nThis README was injected by local-registry.mjs to prove the local Verdaccio\nserves a patched @astryxdesign/core instead of the public one.\n`,
  );

  let published;
  try {
    published = await publishPatched('@astryxdesign/core', {overlayDir: overlay, registryUrl: url});
  } finally {
    fs.rmSync(overlay, {recursive: true, force: true});
  }

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-local-registry-verify-'));
  try {
    runNpm(['pack', '@astryxdesign/core', '--pack-destination', work], {cwd: work, registry: url});
    const tgz = fs.readdirSync(work).find(f => f.endsWith('.tgz'));
    execFileSync('tar', ['xzf', path.join(work, tgz), '-C', work]);
    const readme = fs.readFileSync(path.join(work, 'package', 'README.md'), 'utf-8');
    const pj = JSON.parse(fs.readFileSync(path.join(work, 'package', 'package.json'), 'utf-8'));
    const sentinelOk = readme.includes(SENTINEL);
    const versionOk = pj.version === published.version;
    checks.push({
      name: 'patched @astryxdesign/core served locally (sentinel present)',
      pass: sentinelOk && versionOk,
      detail: `resolved ${pj.name}@${pj.version} (expected ${published.version}); sentinel ${sentinelOk ? 'found' : 'MISSING'}`,
    });
  } catch (e) {
    checks.push({name: 'patched @astryxdesign/core served locally (sentinel present)', pass: false, detail: String(e)});
  } finally {
    fs.rmSync(work, {recursive: true, force: true});
  }

  // (b) uplink: an unmodified public package resolves.
  try {
    const v = runNpm(['view', 'next', 'version'], {registry: url}).stdout.trim();
    checks.push({name: 'unmodified public package resolves via uplink (next)', pass: /^\d+\.\d+\.\d+/.test(v), detail: `next@${v}`});
  } catch (e) {
    checks.push({name: 'unmodified public package resolves via uplink (next)', pass: false, detail: String(e)});
  }

  // (c) uplink: an unmodified scoped internal package the real run installs.
  try {
    const v = runNpm(['view', '@astryxdesign/cli', 'version'], {registry: url}).stdout.trim();
    checks.push({
      name: 'unmodified @astryxdesign/cli resolves via uplink',
      pass: /^\d+\.\d+\.\d+/.test(v),
      detail: `@astryxdesign/cli@${v}`,
    });
  } catch (e) {
    checks.push({name: 'unmodified @astryxdesign/cli resolves via uplink', pass: false, detail: String(e)});
  }

  const pass = checks.every(c => c.pass);
  console.log(`\n🔎 Local-registry verification — ${url}\n`);
  for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name}\n        ${c.detail}`);
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'} — ${checks.filter(c => c.pass).length}/${checks.length} checks green\n`);
  return {pass, checks, published};
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;

function printHelp() {
  console.log(`local-registry.mjs — local Verdaccio for the fresh-install test (W-infra)

Commands:
  start                 Boot Verdaccio (idempotent). Uplinks to public npm.
  stop                  Stop the Verdaccio we started (storage under .verdaccio/ is kept).
  status                Report whether it's up and core's local 'latest' dist-tag.
  publish               Publish a PATCHED @astryxdesign/core to the local registry.
  verify                Prove: patched-core-local (sentinel) + public uplink. Exit 0 on PASS.

Options:
  --port <n>            Registry port (default ${DEFAULT_PORT}).
  --pkg <name>          Package to patch (default @astryxdesign/core).
  --version <v>         Explicit patched version (default ${PATCH_BASE}-${PATCH_PRE}.<n+1>).
  --base-version <v>    Pack THIS published version instead of public latest — serves
                        a historical release (e.g. 0.1.6) as the rig's 'latest'.
  --overlay <dir>       Directory of files copied over the package (e.g. README.md).
  --readme <file>       Shorthand: use <file> as the package's README.md.
  --postinstall <cmd>   Add a scripts.postinstall to the patched package.json.

Examples:
  node local-registry.mjs start
  node local-registry.mjs publish --readme ../fresh-install-test/candidate-README.md
  node local-registry.mjs verify
  node local-registry.mjs stop
`);
}

async function cli() {
  const cmd = process.argv[2];
  const port = Number(arg('--port', String(DEFAULT_PORT)));
  const url = `http://localhost:${port}`;

  switch (cmd) {
    case 'start': {
      const r = await startRegistry({port});
      console.log(`Verdaccio ${r.alreadyRunning ? 'already running' : 'started'} at ${r.url} (pid ${r.pid ?? '?'})`);
      console.log(`  storage: ${STORAGE_DIR}`);
      console.log(`  log:     ${LOG_PATH}`);
      break;
    }
    case 'stop': {
      const r = await stopRegistry();
      console.log(r.stopped ? `Stopped Verdaccio (pid ${r.pid}).` : `Nothing to stop: ${r.reason}`);
      break;
    }
    case 'status': {
      const up = await isUp(url);
      console.log(`Verdaccio at ${url}: ${up ? 'UP' : 'down'}`);
      if (up) {
        const latest = await latestTag('@astryxdesign/core', url);
        console.log(`  @astryxdesign/core latest: ${latest ?? '(none)'}  ${latest && PATCH_RE.test(latest) ? '(patched)' : ''}`);
      }
      break;
    }
    case 'publish': {
      const pkg = arg('--pkg', '@astryxdesign/core');
      const version = arg('--version');
      const baseVersion = arg('--base-version');
      let overlayDir = arg('--overlay');
      const readme = arg('--readme');
      const postinstall = arg('--postinstall');
      let tmpOverlay;
      if (readme) {
        tmpOverlay = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-local-registry-cli-overlay-'));
        fs.copyFileSync(path.resolve(readme), path.join(tmpOverlay, 'README.md'));
        overlayDir = tmpOverlay;
      }
      const pkgJsonMerge = postinstall ? {scripts: {postinstall}} : {};
      try {
        const r = await publishPatched(pkg, {version, baseVersion, overlayDir, pkgJsonMerge, registryUrl: url});
        console.log(`Published ${r.name}@${r.version} to ${r.registry} (base ${r.baseVersion}, dist-tag latest).`);
      } finally {
        if (tmpOverlay) fs.rmSync(tmpOverlay, {recursive: true, force: true});
      }
      break;
    }
    case 'verify': {
      const r = await verify({port});
      process.exit(r.pass ? 0 : 1);
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      printHelp();
      process.exit(1);
  }
}

if (isMain) {
  cli().catch(err => {
    console.error(err instanceof Error ? err.stack || err.message : String(err));
    process.exit(1);
  });
}
