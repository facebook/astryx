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

import {MIN_NODE_VERSION, isNodeVersionSupported} from '../../foundation/env/node-version.mjs';
import {CLI_ROOT, findCoreDir, findInstalledPackage} from '../../foundation/fs/paths.mjs';
import {explainPackageManager, getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {findConfigPath, Project} from '../../foundation/config/project.mjs';
import {DocsCatalog} from '../../foundation/discovery/docs-discovery.mjs';
import {buildDocsIndexData} from '../../foundation/discovery/docs-section-key.mjs';
import {
  DOC_OUTPUT_BUDGET_BYTES,
  docsIndexBytes,
  oversizedDocSections,
} from '../../foundation/discovery/docs-output-budget.mjs';
import {compileTopic, overlayLanguages} from '../docs/_adapter.mjs';
import {detailView} from '../../foundation/doc-compiler/lenses.mjs';
import {semverCompare, isValidSemver, satisfiesRange} from '../../foundation/env/semver.mjs';

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
 * @property {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]|null} [integrations]
 *   Every integration the project loaded, or null when the project could not be
 *   read at all.
 * @property {Array<{package?: string, code: string, severity: 'warning'|'error', message: string}>|null} [integrationIssues]
 *   Every issue the project's own validators reported for those integrations
 *   (the same validators `doctor integration validate` runs), or null when the
 *   project could not be read.
 * @property {import('../../foundation/integrations/autolink.mjs').AutolinkFailure[]} [autolinkFailures]
 *   Installed dependencies shipping an integration manifest that could not be
 *   loaded. They never reach `integrations`, so this is the only place they
 *   appear.
 * @property {DocsCatalog|null} [docsCatalog] - The topics a docs read sees.
 * @property {Array<{package?: string, code: string, message: string}>} [docsCatalogIssues]
 *   `invalid_doc` issues from the project's contributed docs.
 * @property {string|null} [docsCatalogError] - Why the project's docs catalog
 *   could not be built, when it could not.
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
 * Check 6 — integrations that are loaded without an astryx.config entry.
 *
 * The CLI autolinks an installed dependency that ships an
 * `astryx.integration.*` manifest, so a project can be getting components,
 * templates, themes, docs and codemods from a package nothing in the project mentions.
 * Two questions follow, and this line is the answer to both:
 *
 *   - "Why can the CLI see this?" — asked by an author who greps the project
 *     for the package name and finds nothing. Reading our source should not be
 *     part of that answer.
 *   - "Can I delete this dependency?" — asked by an unused-dependency sweep,
 *     which decides by looking for source imports. In exactly this population
 *     there are none: the manifest is the whole link. Naming the dependency
 *     here marks it load-bearing.
 *
 * Always informational. Doctor is a CI gate, and a project that acquired an
 * integration correctly has done nothing to warn about — the point is to say
 * what is loaded, never to push anyone into writing a config entry.
 *
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkImplicitIntegrations(ctx) {
  const id = 'implicit-integrations';
  const label = 'Implicitly linked integrations';

  if (ctx.integrations == null) {
    return {
      id,
      label,
      status: 'info',
      message: 'Skipped — the project configuration could not be read.',
    };
  }

  const implicit = ctx.integrations.filter(
    integration => integration.__autolinked,
  );

  if (implicit.length === 0) {
    return {
      id,
      label,
      status: 'info',
      message:
        ctx.integrations.length > 0
          ? 'None — every loaded integration is named in astryx.config.'
          : 'None — no installed dependency ships an astryx.integration.* manifest.',
    };
  }

  const described = implicit.map(integration => {
    const version = integration.version ? `@${integration.version}` : '';
    // An npm alias installs a package under a different key. The package's own
    // name is its identity; the KEY is what package.json says and what a
    // dependency sweep reads, so when they differ both have to be here.
    const alias =
      integration.__spec && integration.__spec !== integration.name
        ? ` (declared as "${integration.__spec}")`
        : '';
    const roots = ['components', 'templates', 'themes', 'docs', 'codemods']
      // A LoadedIntegration's root fields are already absolute resolved paths.
      // Reading the declared key alone reported a package with dangling roots
      // as "contributing components, templates, themes, docs" when it
      // contributes nothing — say what actually resolves.
      .filter(root => {
        const declared = integration[/** @type {'components'} */ (root)];
        return typeof declared === 'string' && fs.existsSync(declared);
      });
    const declaredCount = ['components', 'templates', 'themes', 'docs', 'codemods']
      .filter(root => integration[/** @type {'components'} */ (root)]).length;
    const contributes =
      roots.length > 0
        ? roots.join(', ')
        : declaredCount > 0
          ? 'nothing (every declared root is missing on disk)'
          : 'nothing';
    return `${integration.name}${version}${alias} from ${integration.__dependencyField}, contributing ${contributes}`;
  });

  const plural = implicit.length === 1 ? '' : 's';
  return {
    id,
    label,
    status: 'info',
    message:
      `${implicit.length} integration${plural} loaded from installed ` +
      `dependencies with no astryx.config entry: ${described.join('; ')}.`,
    fix:
      'Nothing to fix. Keep these dependencies installed. The CLI links them ' +
      'from package.json, so an unused-dependency check that looks only for ' +
      'source imports will report them as unused. Add them to `integrations` ' +
      'in astryx.config.* to make the link explicit.',
  };
}

/**
 * Check 6b — every loaded integration passes the SAME structure validators that
 * `astryx doctor integration validate <package>` runs.
 *
 * Doctor used to report `fail: 0` over integrations it never validated: a
 * package whose manifest could not be parsed appeared nowhere in the report,
 * and a package whose declared roots did not exist was described as
 * contributing. The validators for all of that already exist and `Project`
 * already runs them to collect `issues()` — this check does not re-implement
 * them, it reports what they found.
 *
 * Severity comes from the validators themselves, unchanged: any `error`
 * (unparseable manifest, missing root, invalid codemod/template/component/doc/
 * theme) is a FAIL, because the project's contributions are silently absent;
 * `warning`s alone (unknown manifest key, duplicate provider) are a WARN.
 *
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkIntegrations(ctx) {
  const id = 'integrations';
  const label = 'Integration structure';

  if (ctx.integrations == null || ctx.integrationIssues == null) {
    return {
      id,
      label,
      status: 'info',
      message: 'Skipped — the project configuration could not be read.',
    };
  }

  const unloadable = ctx.autolinkFailures ?? [];
  const count = ctx.integrations.length;
  if (count === 0 && unloadable.length === 0) {
    return {
      id,
      label,
      status: 'pass',
      message: 'No integrations are loaded.',
    };
  }

  const checked = `${count} loaded integration${count === 1 ? '' : 's'} validated`;
  const errors = ctx.integrationIssues.filter(i => i.severity === 'error');
  const warnings = ctx.integrationIssues.filter(i => i.severity === 'warning');

  /** @param {Array<{package?: string, code: string, message: string}>} issues */
  const describe = issues =>
    issues
      .map(i => `${i.package ?? 'integration'}: ${i.code} — ${i.message}`)
      .join('; ');

  // A dependency whose manifest will not load is never added to the loaded set
  // (it must not be able to break the project), so its contributions are simply
  // absent everywhere. That is the consuming project's to know about but not to
  // fix, so it warns rather than failing a CI gate.
  const unloadableText = unloadable
    .map(f => `${f.spec} (${f.field}): ${f.error}`)
    .join('; ');
  const unloadableSummary =
    unloadable.length > 0
      ? `${unloadable.length} installed ${unloadable.length === 1 ? 'dependency ships' : 'dependencies ship'} ` +
        `an integration manifest that could not be loaded, so ${unloadable.length === 1 ? 'its' : 'their'} ` +
        `contributions are absent: ${unloadableText}`
      : '';

  const run = getCliInvocation(ctx.cwd);
  /** @param {Array<{package?: string}>} issues */
  const fixFor = issues => {
    const packages = [
      ...new Set([
        ...issues.map(i => i.package).filter(Boolean),
        ...unloadable.map(f => f.spec),
      ]),
    ];
    const first = packages[0] ? ` ${packages[0]}` : ' <package>';
    return (
      `Run \`${run} doctor integration validate${first}\` for the full report on one package` +
      (packages.length > 1
        ? `, and repeat for: ${packages.slice(1).join(', ')}.`
        : '.')
    );
  };

  if (errors.length > 0) {
    const counts =
      `${errors.length} error${errors.length === 1 ? '' : 's'}` +
      (warnings.length > 0
        ? ` and ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
        : '');
    return {
      id,
      label,
      status: 'fail',
      message:
        `${checked}; ${counts}. ${describe(errors)}` +
        (unloadableSummary ? `. Also: ${unloadableSummary}` : ''),
      fix: fixFor(errors),
    };
  }

  if (warnings.length > 0 || unloadable.length > 0) {
    const parts = [];
    if (warnings.length > 0) {
      parts.push(
        `${warnings.length} warning${warnings.length === 1 ? '' : 's'}. ${describe(warnings)}`,
      );
    }
    if (unloadableSummary) parts.push(unloadableSummary);
    return {
      id,
      label,
      status: 'warn',
      message: `${checked}; ${parts.join('. ')}`,
      fix: fixFor(warnings),
    };
  }

  return {id, label, status: 'pass', message: `${checked}, no issues.`};
}

/**
 * Check 7 — agent docs exist and contain the Astryx section markers.
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
 * Check 8 — @astryxdesign/core peer dependencies are satisfied by installed packages.
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
    const installedDir = findInstalledPackage(ctx.cwd, name);
    if (!installedDir) {
      missing.push(`${name}@${want}`);
      continue;
    }
    // Present and version-readable: verify it actually satisfies the range,
    // not just that the package exists (a bare `npm install` can resolve an
    // out-of-range version from a stale consumer range and still "look" fine).
    const have = pkgVersion(installedDir);
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

/**
 * Check 9 — report the detected package manager, and say so when the project's
 * own declaration disagrees with what is on disk.
 *
 * Two states are worth surfacing rather than guessing past, because in both the
 * commands the CLI prints can be silently wrong for the project:
 *
 * - FAIL: several lockfiles tie with nothing project-owned to break them.
 * - WARN: a `packageManager` field is declared and a lockfile it contradicts
 *   sits beside it. Astryx follows the declaration, so its own output is right;
 *   the warning is that a tool which follows the lockfile will install with
 *   something else, and that used to be reported as a healthy setup.
 *
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkPackageManager(ctx) {
  const {pm, ambiguous, dir, candidates, declared, strayLockfiles} =
    explainPackageManager(ctx.cwd);

  if (ambiguous) {
    return {
      id: 'package-manager',
      label: 'Package manager',
      status: 'fail',
      message: `Cannot tell which package manager this project uses: ${candidates.join(' and ')} lockfiles both sit in ${dir}, and nothing the project owns picks between them. Commands are printed with the neutral \`npx\` form until this is resolved.`,
      fix: `Add a \`packageManager\` field to ${dir}/package.json, or delete the lockfile that does not belong.`,
    };
  }

  if (declared && strayLockfiles.length > 0) {
    const files = strayLockfiles.map(lock => lock.file).join(' and ');
    const owners = [...new Set(strayLockfiles.map(lock => lock.pm))].join(
      ' and ',
    );
    return {
      id: 'package-manager',
      label: 'Package manager',
      status: 'warn',
      message: `This project declares \`packageManager: ${declared}\` in ${dir}/package.json, but ${files} also sits there. Astryx follows the declaration and prints ${pm} commands; anything that follows the lockfile instead will use ${owners}.`,
      fix: `Delete ${files} from ${dir} and reinstall with ${declared}, or change the \`packageManager\` field if ${owners} is what this project actually uses.`,
    };
  }

  return {
    id: 'package-manager',
    label: 'Package manager',
    status: 'info',
    message:
      pm !== 'npx'
        ? declared
          ? `Detected package manager: ${pm} (declared in ${dir}/package.json).`
          : `Detected package manager: ${pm}.`
        : 'No lockfile detected — defaulting to npm/npx.',
  };
}

/**
 * Check 6b — every contributing integration owns its provider identity.
 *
 * Artifact and document IDs are provider-scoped, so a package that claims a
 * provider ID an earlier-loaded package already holds is loaded inert: its
 * components, templates, themes, docs, and codemods are withdrawn while the
 * earlier package keeps contributing. That can be a deliberate transition
 * (a renamed package installed beside its predecessor), so it warns rather
 * than fails, but it is never allowed to happen quietly.
 *
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkProviderIdentity(ctx) {
  const id = 'provider-identity';
  const label = 'Integration provider identity';

  if (ctx.integrations == null) {
    return {
      id,
      label,
      status: 'info',
      message: 'Skipped — the project configuration could not be read.',
    };
  }

  const conflicts = ctx.integrations.filter(
    integration => integration.__providerConflict,
  );
  if (conflicts.length > 0) {
    return {
      id,
      label,
      status: 'warn',
      message: conflicts
        .map(integration => integration.__providerConflict?.message)
        .join(' '),
      fix:
        'Give each integration its own `providerId` in astryx.integration.*. ' +
        "A renamed package may keep its predecessor's ID only when the " +
        'predecessor is no longer installed.',
    };
  }

  const count = ctx.integrations.filter(
    integration =>
      integration.providerId != null && integration.__loadError == null,
  ).length;
  // A package whose manifest never loaded has no manifest to read a providerId
  // from, so it is neither counted nor clearable here. Saying so keeps the
  // count from reading as a complete survey; the `integrations` check above
  // fails on the same package.
  const unreadable = ctx.integrations.filter(
    integration => integration.__loadError != null,
  ).length;
  const skipped =
    unreadable > 0
      ? ` ${unreadable} integration${unreadable === 1 ? '' : 's'} could not be read, so ${unreadable === 1 ? 'its identity is' : 'their identities are'} unknown.`
      : '';
  if (count === 0) {
    return {
      id,
      label,
      status: 'info',
      message:
        'None — no loaded integration has a provider identity.' + skipped,
    };
  }
  return {
    id,
    label,
    status: 'pass',
    message:
      (count === 1
        ? '1 loaded integration has its own provider ID.'
        : `${count} loaded integrations each have their own provider ID.`) +
      skipped,
  };
}

/** @param {number} bytes */
const kilobytes = bytes => `${Math.ceil(bytes / 1024)} KB`;

/**
 * @param {string[]} problems
 * @returns {string}
 */
function joinProblems(problems) {
  return problems.length === 1
    ? problems[0]
    : `${problems.length} problems: ${problems.join('; ')}`;
}

/**
 * Every authoring self-doc is reachable from `astryx docs authoring`, loads,
 * and fits in one read. The audit is imported here, inside the try, so a
 * malformed self-doc is reported rather than taking Doctor down.
 * @param {DoctorContext} [_ctx]
 * @returns {Promise<DoctorCheck>}
 */
export async function checkAuthoringDocs(_ctx) {
  const id = 'authoring-docs';
  const label = 'Authoring docs';
  try {
    const {auditAuthoringSelfDocs} = await import(
      '../../foundation/discovery/authoring-self-docs.mjs'
    );
    const audit = await auditAuthoringSelfDocs();
    const problems = [
      ...audit.unreachable.map(
        source => `${source} is not in \`astryx docs authoring\``,
      ),
      ...audit.failed.map(({source, error}) => `${source} failed to load: ${error}`),
      ...audit.oversized.map(
        ({key, bytes}) =>
          `authoring section "${key}" is ${kilobytes(bytes)}, over the ${kilobytes(DOC_OUTPUT_BUDGET_BYTES)} one read may return`,
      ),
    ];
    if (problems.length > 0) {
      return {
        id,
        label,
        status: 'fail',
        message: joinProblems(problems),
        fix: 'List every authoring self-doc in AUTHORING_SELF_DOCS, fix the one that fails to load, and split a section that is too large.',
      };
    }
    return {
      id,
      label,
      status: 'pass',
      message: `All ${audit.sections} authoring schemas are readable in \`astryx docs authoring\`.`,
    };
  } catch (err) {
    return {
      id,
      label,
      status: 'fail',
      message: `The authoring docs could not be audited: ${err instanceof Error ? err.message : String(err)}`,
      fix: 'Reinstall @astryxdesign/cli.',
    };
  }
}

/**
 * Every topic reads progressively, in every language it ships: it loads, its
 * section index and each of its sections fit in one read, and no contributed
 * doc is invalid.
 * @param {DoctorContext | Partial<DoctorContext>} ctx
 * @returns {Promise<DoctorCheck>}
 */
export async function checkDocsProgressiveDisclosure(ctx) {
  const id = 'docs-progressive-disclosure';
  const label = 'Documentation navigation and size';
  const budget = kilobytes(DOC_OUTPUT_BUDGET_BYTES);
  /** @type {string[]} */
  const problems = [];
  if (ctx.docsCatalogError) {
    problems.push(`The docs catalog could not be built: ${ctx.docsCatalogError}`);
  }
  for (const issue of ctx.docsCatalogIssues ?? []) {
    problems.push(`${issue.package ?? 'a contributed doc'}: ${issue.message}`);
  }
  let topics = 0;
  const catalog = ctx.docsCatalog;
  if (catalog) {
    for (const entry of catalog.entries()) {
      for (const lang of [null, ...overlayLanguages(entry)]) {
        const where = lang ? `${entry.name} [${lang}]` : entry.name;
        try {
          const doc = detailView(await compileTopic(catalog, entry, lang));
          if (lang == null) topics += 1;
          const indexBytes = docsIndexBytes(buildDocsIndexData(doc));
          if (indexBytes > DOC_OUTPUT_BUDGET_BYTES) {
            problems.push(
              `${where}: its section index is ${kilobytes(indexBytes)}, over the ${budget} one read may return`,
            );
          }
          for (const over of oversizedDocSections(doc.sections)) {
            problems.push(
              `${where} ${over.key}: ${kilobytes(over.bytes)}, over the ${budget} one read may return`,
            );
          }
        } catch (err) {
          problems.push(
            `${where}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }
  }
  if (problems.length > 0) {
    return {
      id,
      label,
      status: 'fail',
      message: joinProblems(problems),
      fix: 'Fix the doc each problem names; split a section that is too large into smaller ones, each with its own key.',
    };
  }
  return {
    id,
    label,
    status: 'pass',
    message: `${topics} topics: every section index and section fits in one ${budget} read.`,
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
  checkImplicitIntegrations,
  checkIntegrations,
  checkProviderIdentity,
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

  // Resolve a possible theme key from config, and the integrations the project
  // actually loaded (best-effort; never throws).
  let configTheme = null;
  /** @type {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]|null} */
  let integrations = null;
  /** @type {Array<{package?: string, code: string, severity: 'warning'|'error', message: string}>|null} */
  let integrationIssues = null;
  /** @type {import('../../foundation/integrations/autolink.mjs').AutolinkFailure[]} */
  let autolinkFailures = [];
  // A docs read falls back to the built-in topics when the project cannot be
  // read, so the docs checks do too; the config check reports the config.
  /** @type {DocsCatalog|null} */
  let docsCatalog = DocsCatalog.fromBuiltins();
  /** @type {Array<{package?: string, code: string, message: string}>} */
  let docsCatalogIssues = [];
  /** @type {string|null} */
  let docsCatalogError = null;
  try {
    const project = await Project.load(cwd);
    configTheme =
      /** @type {{theme?: string}} */ (project.config ?? {}).theme ?? null;
    integrations = project.loadedIntegrations;
    autolinkFailures = project.autolinkFailures;
    try {
      docsCatalog = await project.docs();
    } catch (err) {
      docsCatalog = null;
      docsCatalogError = err instanceof Error ? err.message : String(err);
    }
    // The project's own integration validators — the same ones
    // `doctor integration validate` runs — over every loaded integration.
    // Collected OUTSIDE the docs try on purpose: a broken integration is
    // exactly what can make docs() throw, and that is the case doctor most
    // needs to report rather than lose.
    integrationIssues = await project.issues();
    docsCatalogIssues = integrationIssues.filter(
      issue => issue.code === 'invalid_doc',
    );
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
    integrations,
    integrationIssues,
    autolinkFailures,
    docsCatalog,
    docsCatalogIssues,
    docsCatalogError,
    configError,
  };

  /** @type {DoctorCheck[]} */
  const checks = [];
  // checkConfig is async; run it in its declared slot (after themes).
  for (const fn of SYNC_CHECKS) {
    checks.push(fn(ctx));
    if (fn === checkThemes) {
      checks.push(await checkConfig(ctx));
    }
  }
  checks.push(await checkAuthoringDocs(ctx));
  checks.push(await checkDocsProgressiveDisclosure(ctx));

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
