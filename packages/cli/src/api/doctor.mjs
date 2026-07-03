// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Health-check engine for `astryx doctor`.
 *
 * Runs a series of diagnostic checks against the user's project and
 * environment, returning a structured report. Each check is a small,
 * self-contained function that returns a {@link DoctorCheck} record, so
 * adding a new diagnostic is just appending a function to {@link SYNC_CHECKS}.
 *
 * The engine is intentionally side-effect-free: it only *reads* the
 * filesystem, environment, and package metadata. It never installs, writes,
 * or mutates anything. That makes it safe to run in CI as a gate (exit 1 on
 * any FAIL) and safe for AI agents to invoke with `--json`.
 *
 * Status semantics:
 *   - 'pass' — everything is healthy.
 *   - 'warn' — non-fatal; the setup works but could be improved.
 *   - 'fail' — something is broken and should be fixed (drives exit 1).
 *   - 'info' — purely informational; never affects exit code.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

import {MIN_NODE_VERSION, isNodeVersionSupported} from '../lib/node-version.mjs';
import {CLI_ROOT, findCoreDir} from '../utils/paths.mjs';
import {detectPackageManager} from '../utils/package-manager.mjs';
import {findConfigPath, Project} from '../lib/project.mjs';
import {semverCompare} from '../utils/semver.mjs';

const _require = createRequire(import.meta.url);

/**
 * @typedef {'pass'|'warn'|'fail'|'info'} DoctorStatus
 *
 * @typedef {object} DoctorCheck
 * @property {string} id - Stable machine-readable id (e.g. 'node-version').
 * @property {string} label - Human-readable check name.
 * @property {DoctorStatus} status
 * @property {string} message - One-line result summary.
 * @property {string} [fix] - Actionable remediation, present when not 'pass'.
 *
 * @typedef {object} DoctorReport
 * @property {DoctorCheck[]} checks
 * @property {{pass: number, warn: number, fail: number, info: number}} summary
 *
 * @typedef {object} DoctorContext
 * @property {string} cwd - Directory to diagnose.
 * @property {string} nodeVersion - Running Node version.
 * @property {string|null} coreDir - Resolved @astryxdesign/core directory, or null.
 * @property {string|null} configPath - Resolved astryx.config.mjs path, or null.
 * @property {string|null} configTheme - theme value read from config, or null.
 */

/* ── helpers ──────────────────────────────────────────────────────────── */

/**
 * Safely read + parse a package.json. Returns null on any failure.
 * @param {string} pkgPath
 * @returns {Record<string, any>|null}
 */
function readPkg(pkgPath) {
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Read the version of an installed package from a resolved directory.
 * @param {string|null} dir
 * @returns {string|null}
 */
function pkgVersion(dir) {
  if (!dir) return null;
  const pkg = readPkg(path.join(dir, 'package.json'));
  return pkg?.version ?? null;
}

/**
 * Walk up from `startDir` to locate the nearest node_modules directory.
 * @param {string} startDir
 * @returns {string|null}
 */
function findNodeModules(startDir) {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'node_modules');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Find every installed @astryxdesign/theme-* package under node_modules.
 * @param {string} cwd
 * @returns {Array<{name: string, version: string|null}>}
 */
function findThemePackages(cwd) {
  const nm = findNodeModules(cwd);
  const found = [];
  if (!nm) return found;
  const scopeDir = path.join(nm, '@astryxdesign');
  if (!fs.existsSync(scopeDir)) return found;
  let entries;
  try {
    entries = fs.readdirSync(scopeDir, {withFileTypes: true});
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith('theme-')) continue;
    const name = `@astryxdesign/${entry.name}`;
    found.push({name, version: pkgVersion(path.join(scopeDir, entry.name))});
  }
  return found;
}

/**
 * Detect whether a theme appears to be wired up via the ASTRYX_THEME env var or
 * an `xds.theme` field in the nearest package.json. Config-based wiring is
 * handled by the caller (ctx.configTheme). This only inspects static signals.
 * @param {string} cwd
 * @returns {{wired: boolean, source: string|null}}
 */
function detectThemeWiring(cwd) {
  if (process.env.ASTRYX_THEME) return {wired: true, source: 'ASTRYX_THEME env var'};
  const nm = findNodeModules(cwd);
  const projectDir = nm ? path.dirname(nm) : cwd;
  const pkg = readPkg(path.join(projectDir, 'package.json'));
  if (pkg?.astryx?.theme) return {wired: true, source: 'package.json astryx.theme'};
  return {wired: false, source: null};
}

/* ── individual checks ────────────────────────────────────────────────── */

/**
 * Check 1 — running Node version meets the CLI's minimum.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkNodeVersion(ctx) {
  const supported = isNodeVersionSupported(ctx.nodeVersion);
  return {
    id: 'node-version',
    label: 'Node.js version',
    status: supported ? 'pass' : 'fail',
    message: supported
      ? `Node v${ctx.nodeVersion} meets the minimum (>=${MIN_NODE_VERSION}).`
      : `Node v${ctx.nodeVersion} is below the required minimum (>=${MIN_NODE_VERSION}).`,
    ...(supported
      ? {}
      : {fix: `Upgrade Node.js to >=${MIN_NODE_VERSION} and re-run.`}),
  };
}

/**
 * Check 2 — @astryxdesign/core is installed and resolvable from the project.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkCoreInstalled(ctx) {
  const found = Boolean(ctx.coreDir);
  const version = pkgVersion(ctx.coreDir);
  return {
    id: 'core-installed',
    label: '@astryxdesign/core installed',
    status: found ? 'pass' : 'fail',
    message: found
      ? `@astryxdesign/core resolved${version ? ` (v${version})` : ''}.`
      : '@astryxdesign/core could not be resolved from this project.',
    ...(found
      ? {}
      : {fix: 'Install the design system: `npm install @astryxdesign/core` (or yarn/pnpm/bun).'}),
  };
}

/**
 * Check 3 — installed @astryxdesign/core is in step with @astryxdesign/cli (major/minor drift).
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkVersionAlignment(ctx) {
  const coreVersion = pkgVersion(ctx.coreDir);
  const cliPkg = readPkg(path.join(CLI_ROOT, 'package.json'));
  const cliVersion = cliPkg?.version ?? null;

  if (!coreVersion || !cliVersion) {
    return {
      id: 'version-alignment',
      label: '@astryxdesign/core <-> @astryxdesign/cli alignment',
      status: 'info',
      message: 'Skipped — could not read both @astryxdesign/core and @astryxdesign/cli versions.',
    };
  }

  const [coreMajor, coreMinor] = coreVersion.split('.').map(Number);
  const [cliMajor, cliMinor] = cliVersion.split('.').map(Number);
  const drift = coreMajor !== cliMajor || coreMinor !== cliMinor;

  return {
    id: 'version-alignment',
    label: '@astryxdesign/core <-> @astryxdesign/cli alignment',
    status: drift ? 'warn' : 'pass',
    message: drift
      ? `@astryxdesign/core v${coreVersion} drifts from @astryxdesign/cli v${cliVersion} (major/minor mismatch).`
      : `@astryxdesign/core v${coreVersion} is in step with @astryxdesign/cli v${cliVersion}.`,
    ...(drift
      ? {
          fix:
            semverCompare(cliVersion, coreVersion) > 0
              ? `Update @astryxdesign/core to ${cliMajor}.${cliMinor}.x to match the CLI.`
              : `Update @astryxdesign/cli to ${coreMajor}.${coreMinor}.x to match @astryxdesign/core.`,
        }
      : {}),
  };
}

/**
 * Check 4 — at least one @astryxdesign/theme-* is installed and a theme is wired.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkThemes(ctx) {
  const themes = findThemePackages(ctx.cwd);
  const wiring = detectThemeWiring(ctx.cwd);
  const hasConfigTheme = Boolean(ctx.configTheme);
  const wired = wiring.wired || hasConfigTheme;

  if (themes.length === 0) {
    return {
      id: 'themes',
      label: 'Theme packages',
      status: 'warn',
      message: 'No @astryxdesign/theme-* packages are installed.',
      fix: 'Install a theme, e.g. `npm install @astryxdesign/theme-neutral`, then import its CSS or set astryx.theme.',
    };
  }

  const names = themes.map(t => t.name).join(', ');
  if (!wired) {
    return {
      id: 'themes',
      label: 'Theme packages',
      status: 'warn',
      message: `Theme package(s) installed (${names}) but no theme appears wired.`,
      fix: 'Wire a theme via the `astryx.theme` field in package.json, the ASTRYX_THEME env var, or your astryx.config.mjs.',
    };
  }

  const source = hasConfigTheme ? 'astryx.config.mjs theme' : wiring.source;
  return {
    id: 'themes',
    label: 'Theme packages',
    status: 'pass',
    message: `Theme package(s) installed (${names}); wired via ${source}.`,
  };
}

/**
 * Check 5 — astryx.config.mjs (if present) loads and has a valid shape.
 * @param {DoctorContext} ctx
 * @returns {Promise<DoctorCheck>}
 */
export async function checkConfig(ctx) {
  if (!ctx.configPath) {
    return {
      id: 'config',
      label: 'astryx.config.mjs',
      status: 'info',
      message: 'No astryx.config.mjs found — using defaults.',
    };
  }

  // Project.load swallows nothing — it surfaces a genuine load failure — but
  // the config check wants to report a bad default export precisely, so we
  // re-import directly to surface a genuine load failure as a FAIL.
  try {
    const {pathToFileURL} = await import('node:url');
    const mod = await import(pathToFileURL(ctx.configPath).href);
    const config = mod.default;
    if (config !== undefined && (typeof config !== 'object' || config === null)) {
      return {
        id: 'config',
        label: 'astryx.config.mjs',
        status: 'fail',
        message: `astryx.config.mjs default export is not an object (got ${typeof config}).`,
        fix: 'Export a default object from astryx.config.mjs, e.g. `export default { integrations: [] };`.',
      };
    }
    return {
      id: 'config',
      label: 'astryx.config.mjs',
      status: 'pass',
      message: `astryx.config.mjs loaded cleanly (${path.relative(ctx.cwd, ctx.configPath) || ctx.configPath}).`,
    };
  } catch (err) {
    return {
      id: 'config',
      label: 'astryx.config.mjs',
      status: 'fail',
      message: `astryx.config.mjs failed to load: ${err.message}`,
      fix: 'Fix the syntax/runtime error in astryx.config.mjs so it imports cleanly.',
    };
  }
}

/**
 * Check 6 — agent docs exist and contain the Astryx section markers.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkAgentDocs(ctx) {
  const candidates = [
    'AGENTS.md',
    'CLAUDE.md',
    path.join('.claude', 'CLAUDE.md'),
    '.cursorrules',
  ];
  const present = candidates.filter(rel => fs.existsSync(path.join(ctx.cwd, rel)));

  if (present.length === 0) {
    return {
      id: 'agent-docs',
      label: 'AI agent docs',
      status: 'info',
      message: 'No agent docs (CLAUDE.md / AGENTS.md / .cursorrules) found.',
      fix: 'Generate agent docs with `astryx init --features agents`.',
    };
  }

  const withMarkers = present.filter(rel => {
    try {
      const content = fs.readFileSync(path.join(ctx.cwd, rel), 'utf-8');
      return (
        (content.includes('<!-- ASTRYX:START -->') || content.includes('<!-- XDS:START -->')) &&
        (content.includes('<!-- ASTRYX:END -->') || content.includes('<!-- XDS:END -->'))
      );
    } catch {
      return false;
    }
  });

  if (withMarkers.length === 0) {
    return {
      id: 'agent-docs',
      label: 'AI agent docs',
      status: 'warn',
      message: `Agent docs present (${present.join(', ')}) but no Astryx section markers found.`,
      fix: 'Add the Astryx section to your agent docs with `astryx init --features agents`.',
    };
  }

  return {
    id: 'agent-docs',
    label: 'AI agent docs',
    status: 'pass',
    message: `Astryx agent docs section present in ${withMarkers.join(', ')}.`,
  };
}

/**
 * Check 7 — @astryxdesign/core peer dependencies are satisfied by installed packages.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkPeerDeps(ctx) {
  if (!ctx.coreDir) {
    return {
      id: 'peer-deps',
      label: '@astryxdesign/core peer dependencies',
      status: 'info',
      message: 'Skipped — @astryxdesign/core is not installed.',
    };
  }

  const corePkg = readPkg(path.join(ctx.coreDir, 'package.json'));
  const peers = corePkg?.peerDependencies ?? {};
  const peerNames = Object.keys(peers);

  if (peerNames.length === 0) {
    return {
      id: 'peer-deps',
      label: '@astryxdesign/core peer dependencies',
      status: 'info',
      message: '@astryxdesign/core declares no peer dependencies.',
    };
  }

  const missing = [];
  for (const name of peerNames) {
    let present = false;
    try {
      _require.resolve(`${name}/package.json`, {paths: [ctx.cwd]});
      present = true;
    } catch {
      // Some packages don't expose package.json — try resolving the entry.
      try {
        _require.resolve(name, {paths: [ctx.cwd]});
        present = true;
      } catch {
        // Still unresolved — leave present at its initial false.
      }
    }
    if (!present) missing.push(`${name}@${peers[name]}`);
  }

  if (missing.length > 0) {
    return {
      id: 'peer-deps',
      label: '@astryxdesign/core peer dependencies',
      status: 'warn',
      message: `Missing peer dependencies: ${missing.join(', ')}.`,
      fix: `Install the required peers, e.g. \`npm install ${missing.map(m => m.split('@')[0]).join(' ')}\`.`,
    };
  }

  return {
    id: 'peer-deps',
    label: '@astryxdesign/core peer dependencies',
    status: 'pass',
    message: `All peer dependencies satisfied (${peerNames.join(', ')}).`,
  };
}

/**
 * Check 8 — report the detected package manager (informational).
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkPackageManager(ctx) {
  const pm = detectPackageManager(ctx.cwd);
  const detected = pm !== 'npx';
  return {
    id: 'package-manager',
    label: 'Package manager',
    status: 'info',
    message: detected
      ? `Detected package manager: ${pm}.`
      : 'No lockfile detected — defaulting to npm/npx.',
  };
}

/**
 * Ordered list of synchronous check functions. Append here to add a check.
 * (checkConfig is async and is awaited separately by {@link runChecks}.)
 * @type {Array<(ctx: DoctorContext) => DoctorCheck>}
 */
export const SYNC_CHECKS = [
  checkNodeVersion,
  checkCoreInstalled,
  checkVersionAlignment,
  checkThemes,
  checkAgentDocs,
  checkPeerDeps,
  checkPackageManager,
];

/**
 * Run all diagnostic checks and return a structured report.
 *
 * @param {object} [options]
 * @param {string} [options.cwd] - Directory to diagnose (default: process.cwd()).
 * @returns {Promise<DoctorReport>}
 */
export async function runChecks(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const coreDir = findCoreDir(cwd);
  const configPath = findConfigPath(cwd);

  // Resolve a possible theme key from config (best-effort; never throws).
  let configTheme = null;
  try {
    const project = await Project.load(cwd);
    configTheme = project.config?.theme ?? null;
  } catch {
    // Best-effort: a missing/invalid config leaves configTheme null.
  }

  /** @type {DoctorContext} */
  const ctx = {
    cwd,
    nodeVersion: process.versions.node,
    coreDir,
    configPath,
    configTheme,
  };

  const checks = [];
  // checkConfig is async; run it in its declared slot (after themes).
  for (const fn of SYNC_CHECKS) {
    checks.push(fn(ctx));
    if (fn === checkThemes) {
      checks.push(await checkConfig(ctx));
    }
  }

  const summary = {pass: 0, warn: 0, fail: 0, info: 0};
  for (const c of checks) summary[c.status] += 1;

  return {checks, summary};
}

/**
 * Programmatic API: run the doctor and return the same envelope shape that
 * `astryx doctor --json` emits.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{type: 'doctor', data: DoctorReport}>}
 */
export async function doctor(options = {}) {
  const report = await runChecks(options);
  return {type: 'doctor', data: report};
}
