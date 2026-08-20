// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Health-check engine for `astryx doctor`.
 *
 * Runs a series of diagnostic checks against the user's project and
 * environment, returning a structured report. Each check is a small,
 * self-contained function that returns a {@link DoctorCheck} record, so
 * adding a new diagnostic is just appending a function to {@link CHECKS}.
 *
 * The engine never installs, writes, or mutates anything, which makes it safe
 * to run in CI as a gate (exit 1 on any FAIL) and safe for AI agents to invoke
 * with `--json`.
 *
 * Two checks do *evaluate* project code, and both are deliberately narrow:
 * `checkConfig` imports the single opt-in `astryx.config.*` at the project
 * root, and `checkThemeBuilt` recompiles a theme — but only one that already
 * has built output on disk (so the user has run `theme build` on it before)
 * and only after a read-only pre-filter finds evidence of drift. Everything
 * else reads the filesystem, environment, and package metadata and nothing more.
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

import {MIN_NODE_VERSION, isNodeVersionSupported} from '../../foundation/env/node-version.mjs';
import {CLI_ROOT, findCoreDir} from '../../foundation/fs/paths.mjs';
import {detectPackageManager, getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {findConfigPath, Project} from '../../foundation/config/project.mjs';
import {semverCompare, isValidSemver, satisfiesRange} from '../../foundation/env/semver.mjs';
import {checkCssEscapes, checkSwizzled} from './theme-drift.mjs';

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
 * @property {string|null} coreDir - Resolved core package directory, or null.
 * @property {string|null} configPath - Resolved astryx.config.mjs path, or null.
 * @property {string|null} configTheme - theme value read from config, or null.
 * @property {Error|null} [configError] - Error thrown while resolving the config
 *   path (e.g. multiple config files present), surfaced by checkConfig as a FAIL.
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
  /** @type {Array<{name: string, version: string|null}>} */
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
    if (!entry.name.startsWith('theme-')) continue;
    const dir = path.join(scopeDir, entry.name);
    // pnpm installs packages as symlinks into node_modules/.pnpm, and a
    // symlink dirent reports isDirectory() as false — stat the target instead.
    let isDir = entry.isDirectory();
    if (!isDir && entry.isSymbolicLink()) {
      try {
        isDir = fs.statSync(dir).isDirectory();
      } catch {
        isDir = false;
      }
    }
    if (!isDir) continue;
    const name = `@astryxdesign/${entry.name}`;
    found.push({name, version: pkgVersion(dir)});
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

  // A monorepo/linked install often pins a non-semver range like `workspace:*`
  // or `link:...`. `'workspace:*'.split('.').map(Number)` yields NaN, and
  // `NaN !== cliMajor` is always true — that produced a spurious drift WARN
  // with a `NaN.undefined.x` fix string. If either version isn't real semver,
  // there's nothing to compare: skip.
  if (!isValidSemver(coreVersion) || !isValidSemver(cliVersion)) {
    return {
      id: 'version-alignment',
      label: '@astryxdesign/core <-> @astryxdesign/cli alignment',
      status: 'info',
      message:
        `Skipped — @astryxdesign/core v${coreVersion} / @astryxdesign/cli ` +
        `v${cliVersion} are not both comparable semver.`,
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
  // A resolution error (e.g. multiple astryx.config.* files) is exactly the
  // kind of setup problem doctor should report — not crash on.
  if (ctx.configError) {
    return {
      id: 'config',
      label: 'astryx.config.mjs',
      status: 'fail',
      message: ctx.configError.message,
      fix: 'Keep exactly one astryx.config.{ts,mjs,js} at your project root.',
    };
  }
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
      message: `astryx.config.mjs failed to load: ${/** @type {any} */ (err).message}`,
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
      fix: `Generate agent docs with \`${getCliInvocation(ctx.cwd)} init --features agents\`.`,
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
      fix: `Add the Astryx section to your agent docs with \`${getCliInvocation(ctx.cwd)} init --features agents\`.`,
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
  /** @type {Array<{name: string, want: string, have: string}>} */
  const mismatched = [];
  for (const name of peerNames) {
    const want = peers[name];
    let pkgJsonPath;
    try {
      pkgJsonPath = _require.resolve(`${name}/package.json`, {paths: [ctx.cwd]});
    } catch {
      // package.json isn't exported — fall back to entry resolution for
      // presence only (we then can't read the version to range-check it).
      try {
        _require.resolve(name, {paths: [ctx.cwd]});
      } catch {
        missing.push(`${name}@${want}`);
      }
      continue;
    }
    // Present and version-readable: verify it actually satisfies the range,
    // not just that the package exists (a bare `npm install` can resolve an
    // out-of-range version from a stale consumer range and still "look" fine).
    const have = pkgVersion(path.dirname(pkgJsonPath));
    if (have && !satisfiesRange(have, want)) {
      mismatched.push({name, want, have});
    }
  }

  if (missing.length > 0 || mismatched.length > 0) {
    const problems = [];
    if (missing.length) problems.push(`missing: ${missing.join(', ')}`);
    if (mismatched.length) {
      problems.push(
        `out of range: ${mismatched
          .map(m => `${m.name}@${m.have} (needs ${m.want})`)
          .join(', ')}`,
      );
    }
    // Pin the required range for anything wrong so the hint fixes it even when a
    // stale consumer range would otherwise resolve an incompatible version.
    // Quote targets containing shell metacharacters (e.g. `react@>=19.0.0`).
    const quote = (/** @type {string} */ s) => (/[<>|() ]/.test(s) ? `'${s}'` : s);
    const targets = [...missing, ...mismatched.map(m => `${m.name}@${m.want}`)].map(quote);
    return {
      id: 'peer-deps',
      label: '@astryxdesign/core peer dependencies',
      status: 'warn',
      message: `Peer dependency issues — ${problems.join('; ')}.`,
      fix: `Install compatible peers: \`npm install ${targets.join(' ')}\`.`,
    };
  }

  return {
    id: 'peer-deps',
    label: '@astryxdesign/core peer dependencies',
    status: 'pass',
    message: `All peer dependencies satisfied (${peerNames.join(', ')}).`,
  };
}

/** Bytes of a CSS file to read when looking for the @generated banner. */
const BANNER_BYTES = 512;

/**
 * Read the first {@link BANNER_BYTES} of a file without slurping it whole.
 * @param {string} file
 * @returns {string}
 */
function readHead(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(BANNER_BYTES);
    const read = fs.readSync(fd, buf, 0, BANNER_BYTES, 0);
    return buf.subarray(0, read).toString('utf-8');
  } catch {
    return '';
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        /* already closed */
      }
    }
  }
}

/**
 * Locate built theme CSS by its `@generated` banner, and recover the exact
 * invocation that produced it.
 *
 * Looking for built *output* rather than `defineTheme()` *sources* is both
 * faster and more accurate. Only built output can be stale, so a project
 * without any is trivially fine; and the banner records the real `Source:` and
 * `--out`, which beats reverse-engineering them from package.json scripts.
 * (Scanning sources instead meant reading every .ts/.js in the tree — 2196
 * files and ~900ms at this repo's root — to answer a question about 25 CSS
 * files, and it found 18 "themes" at the monorepo root.)
 *
 * @param {string} startDir
 * @returns {Array<{css: string, dir: string, source: string, out: string|null,
 *   cli: string|null, core: string|null}>}
 */
export function findBuiltThemes(startDir) {
  const SKIP = new Set([
    'node_modules', '.git', 'dist', 'build', 'out', '.next', 'coverage',
  ]);
  /** @type {Array<{css: string, dir: string, source: string, out: string|null,
   *   cli: string|null, core: string|null}>} */
  const found = [];
  const stack = [startDir];
  while (stack.length > 0 && found.length < 10) {
    const dir = stack.pop();
    if (!dir) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP.has(entry.name)) stack.push(fp);
        continue;
      }
      if (!entry.name.endsWith('.css')) continue;
      const head = readHead(fp);
      if (!/@generated by `astryx theme build`/.test(head)) continue;
      const source = /^\s*\*\s*Source:\s*(\S+)/m.exec(head)?.[1];
      if (!source) continue;
      const command = /^\s*\*\s*Command:\s*(.+)$/m.exec(head)?.[1] ?? '';
      const out = /(?:--out|-o)\s+(\S+)/.exec(command)?.[1] ?? null;
      // Banner paths are relative to the package the build ran in.
      found.push({
        css: fp,
        dir: packageDirFor(fp, startDir),
        source,
        out,
        cli: /^\s*\*\s*CLI:\s*\S+@(\S+)/m.exec(head)?.[1] ?? null,
        core: /^\s*\*\s*Core:\s*\S+@(\S+)/m.exec(head)?.[1] ?? null,
      });
    }
  }
  return found.sort((a, b) => a.css.localeCompare(b.css));
}

/**
 * Read-only test for whether a built theme *might* have drifted.
 *
 * Returns false only when the artifact is provably current-looking, so the
 * caller can skip recompiling it. Two independent signals, both cheap:
 *
 *   1. The source is newer than the artifact.
 *   2. The banner's CLI/core versions differ from what is installed — the
 *      versions are embedded in the output, so a bump alone makes it stale.
 *      (mtime misses this entirely: after a dependency change the artifact is
 *      still the newer file.)
 *
 * Deliberately biased toward "maybe": a false positive costs one recompile,
 * a false negative silently reports a stale theme as fresh.
 *
 * @param {{css: string, dir: string, source: string, cli: string|null, core: string|null}} entry
 * @param {DoctorContext} ctx
 * @returns {boolean}
 */
function mayBeStale(entry, ctx) {
  const cliVersion = readPkg(path.join(CLI_ROOT, 'package.json'))?.version ?? null;
  if (entry.cli && cliVersion && entry.cli !== cliVersion) return true;
  const coreVersion = pkgVersion(ctx.coreDir);
  if (entry.core && coreVersion && entry.core !== coreVersion) return true;
  try {
    const srcStat = fs.statSync(path.resolve(entry.dir, entry.source));
    const outStat = fs.statSync(entry.css);
    return srcStat.mtimeMs > outStat.mtimeMs;
  } catch {
    // Source missing or unreadable: let the real check report it.
    return true;
  }
}

/**
 * Nearest ancestor directory holding a package.json — the cwd `theme build`
 * ran in, and therefore the base for the banner's relative paths.
 *
 * @param {string} file
 * @param {string} fallback
 * @returns {string}
 */
function packageDirFor(file, fallback) {
  let dir = path.dirname(file);
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return fallback;
}

/**
 * Is the theme build wired into the scripts that `dev`/`build` run?
 *
 * If it is, stale artifacts on disk are harmless — they are regenerated before
 * anything consumes them, and reporting a hard failure for a self-healing
 * condition just teaches people to ignore the doctor. If it is not, the
 * staleness is real and silent.
 *
 * @param {string} pkgDir
 * @returns {boolean}
 */
export function isThemeBuildWired(pkgDir) {
  const pkg = readPkg(path.join(pkgDir, 'package.json'));
  const scripts = pkg?.scripts ?? {};
  const names = Object.keys(scripts);
  /** @type {(name: string, depth: number) => boolean} */
  const runsThemeBuild = (name, depth) => {
    if (depth > 4) return false;
    const body = scripts[name];
    if (typeof body !== 'string') return false;
    if (body.includes('theme build')) return true;
    // follow references to sibling scripts (`pnpm generate`, `npm run x`)
    return names.some(
      other =>
        other !== name &&
        new RegExp(`(?:run\\s+|pnpm\\s+|yarn\\s+|npm\\s+run\\s+)${other}\\b`).test(body) &&
        runsThemeBuild(other, depth + 1),
    );
  };
  return ['dev', 'build', 'predev', 'prebuild', 'start', 'prestart'].some(
    entry => entry in scripts && runsThemeBuild(entry, 0),
  );
}

/**
 * Check 9 — built theme artifacts are in step with their source.
 *
 * This is the only silent failure in the theming pipeline: a stale built theme
 * still carries `__built: true`, so the runtime skips style injection and the
 * app renders the *previous* theme with no error, no warning, and no visual
 * hint that anything is wrong.
 *
 * Only `outdated` artifacts are a failure. `missing` ones simply mean the
 * project imports the theme source directly (runtime injection), which is a
 * supported path and correct by construction.
 *
 * @param {DoctorContext} ctx
 * @returns {Promise<DoctorCheck>}
 */
export async function checkThemeBuilt(ctx) {
  const built = findBuiltThemes(ctx.cwd);
  if (built.length === 0) {
    return {
      id: 'theme-built',
      label: 'Built theme freshness',
      status: 'info',
      message:
        'Skipped — no built theme output found. Importing a defineTheme() source ' +
        'directly (runtime injection) cannot go stale.',
    };
  }

  /** @type {Array<{rel: string, count: number, entry: typeof built[number]}>} */
  const stale = [];
  /** @type {string[]} */
  const unchecked = [];
  /** @type {{themeBuild?: Function}} */
  let buildModule = {};
  for (const entry of built) {
    const rel = path.relative(ctx.cwd, entry.css) || entry.css;
    // Cheap, read-only pre-filter. Confirming freshness truly requires
    // recompiling, and compiling means jiti evaluating the theme module and
    // its whole import graph — real code execution, which the rest of this
    // engine deliberately avoids. So only pay that cost (and take that
    // liberty) once something already points at drift.
    if (!mayBeStale(entry, ctx)) continue;
    try {
      if (!buildModule.themeBuild) {
        buildModule = await import('../theme/build/build.mjs');
      }
      const themeBuild = /** @type {Function} */ (buildModule.themeBuild);
      const res = await themeBuild(
        entry.source,
        {check: true, ...(entry.out ? {out: entry.out} : {})},
        {cwd: entry.dir},
      );
      const data = /** @type {any} */ (res)?.data;
      if (!data) continue;
      // `missing` means the app imports the source directly, which is valid.
      // Only real drift counts.
      const outdated = (data.stale ?? []).filter(
        (/** @type {{reason: string}} */ s) => s.reason === 'outdated',
      );
      if (outdated.length > 0) stale.push({rel, count: outdated.length, entry});
    } catch {
      // A theme that will not load is checkConfig territory. Do not fail
      // freshness on it, but do not silently claim it is fresh either.
      unchecked.push(rel);
    }
  }

  if (stale.length > 0) {
    const first = stale[0].entry;
    const wired = isThemeBuildWired(first.dir);
    const summary = stale.map(s => `${s.rel} (${s.count} artifact(s))`).join(', ');
    const rebuild =
      `\`${getCliInvocation(ctx.cwd)} theme build ${first.source}` +
      `${first.out ? ` --out ${first.out}` : ''}\``;
    return wired
      ? {
          id: 'theme-built',
          label: 'Built theme freshness',
          status: 'info',
          message:
            `Built theme output is stale on disk (${summary}), but dev/build regenerate ` +
            'it first, so nothing will render the old theme.',
        }
      : {
          id: 'theme-built',
          label: 'Built theme freshness',
          status: 'fail',
          message:
            `Built theme output is out of date (${summary}) and nothing rebuilds it. ` +
            'The app renders an older theme than the source describes, with no runtime warning.',
          fix:
            `Rebuild with ${rebuild}, then wire it into a predev/prebuild script so it ` +
            'cannot drift again.',
        };
  }

  if (unchecked.length > 0) {
    // A project without @astryxdesign/core installed already fails
    // checkCoreInstalled; repeating it as a warning here is just noise.
    const severity = ctx.coreDir ? 'warn' : 'info';
    return {
      id: 'theme-built',
      label: 'Built theme freshness',
      status: severity,
      message: `Could not verify ${unchecked.join(', ')} — the theme did not load.`,
      ...(severity === 'warn'
        ? {fix: 'Make every import in the theme file resolvable, then re-run.'}
        : {}),
    };
  }

  return {
    id: 'theme-built',
    label: 'Built theme freshness',
    status: 'pass',
    message: `Built theme output is in step with source (${built.length} theme(s) checked).`,
  };
}

/**
 * Check 10 — report the detected package manager (informational).
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
 * Ordered list of checks. Append here to add a diagnostic; a check may be sync
 * or async and runs in its declared position either way.
 *
 * This used to be a sync-only array with `checkConfig` spliced in by comparing
 * each function against `checkThemes` by identity. That only ever supported one
 * async check, and it put the ordering of `config` somewhere other than this
 * list, where nobody would look for it.
 *
 * @type {Array<(ctx: DoctorContext) => DoctorCheck | Promise<DoctorCheck>>}
 */
export const CHECKS = [
  checkNodeVersion,
  checkCoreInstalled,
  checkVersionAlignment,
  checkThemes,
  checkThemeBuilt,
  checkCssEscapes,
  checkSwizzled,
  checkConfig,
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
  // findConfigPath throws when multiple config files coexist. That's a
  // misconfiguration doctor exists to report — catch it and surface it through
  // checkConfig as a FAIL rather than crashing the whole diagnostic engine.
  let configPath = null;
  let configError = null;
  try {
    configPath = findConfigPath(cwd);
  } catch (err) {
    configError = /** @type {Error} */ (err);
  }

  // Resolve a possible theme key from config (best-effort; never throws).
  let configTheme = null;
  try {
    const project = await Project.load(cwd);
    configTheme =
      /** @type {{theme?: string}} */ (project.config ?? {}).theme ?? null;
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
    configError,
  };

  /** @type {DoctorCheck[]} */
  const checks = [];
  // Sequential on purpose: checks are ordered for readability of the report,
  // and awaiting a sync return value is free.
  for (const fn of CHECKS) {
    checks.push(await fn(ctx));
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
