// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Plan and run the CLI from a hosted package set: the programmatic entry
 * a host uses to serve the unchanged CLI against a caller's project without an
 * install in that project.
 *
 * A host keeps one or more package roots: directories whose `node_modules`
 * hold a coherent set of `@astryxdesign/cli`, `@astryxdesign/core`, and the
 * integrations the host approves. `roots[0]` is the newest hosted set; any
 * further roots are isolated sets at other versions. For one invocation the
 * host calls {@link planPackageSet} (or {@link runHostedCli}, which plans,
 * reports, and runs), and the plan decides where every package comes from.
 *
 * The project's versions are authoritative, and are never silently mixed with
 * the newest hosted set:
 *
 *   project-cli   The project installs its own `@astryxdesign/cli`. That CLI is
 *                 authoritative: the plan names it and the package-manager
 *                 command that runs it, and the host delegates to it.
 *   project       The project installs every Astryx package it pins. Nothing
 *                 falls through to a root; the CLI resolves only from the
 *                 project, as an installed CLI would.
 *   matched       The project pins Astryx packages it has not installed. The
 *                 first root carrying exactly the pinned versions (lockfile
 *                 version first, then the declared range) and a CLI serves
 *                 them, with one warning naming the install command. A pin
 *                 that is not a version range (`file:`, `link:`, a git URL, a
 *                 workspace or alias spec, a dist-tag) names bytes only the
 *                 project's own install has, so no root can serve it.
 *   incompatible  No root carries the pinned set. The plan lists each pinned
 *                 package, what the project pins, and what each root carries,
 *                 and nothing runs.
 *   hosted        There is no project, or it pins no Astryx package. The newest
 *                 root serves the run, and its approved integration list
 *                 (`integrations`, default: the root package.json's declared
 *                 dependencies) stands in for the project's declarations.
 *
 * A wrapper that already attempted the project executable sets
 * `projectCliAlreadyHandled`. The planner does not execute that file again; its
 * declared version range still constrains the CLI selected from a root.
 *
 * "Astryx package" means an `@astryxdesign/*` package or any package that
 * ships an integration manifest or an `astryx` package.json field, wherever
 * it is found (the project's install or any root).
 *
 * Every plan carries `packages`: the name, version, and source (`project` or
 * `package-set`) of each package the run resolves — the CLI, Core, and every
 * integration — for the host to report.
 * The CLI's own results keep naming the package each artifact came from.
 *
 * This is not a CLI flag or an environment variable, and it changes nothing
 * for a CLI started any other way.
 *
 * @position foundation/runtime — reads the project's package.json, lockfile,
 *   and node_modules plus each root; activates package-root.mjs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {constants as osConstants} from 'node:os';
import {
  CLI_ROOT,
  findProjectCoreDir,
  scanLegacyExternalPackages,
} from '../fs/paths.mjs';
import {findManifestPaths} from '../integrations/integrations.mjs';
import {DEPENDENCY_FIELDS} from '../integrations/autolink.mjs';
import {detectPackageManager, getRunPrefix} from '../env/package-manager.mjs';
import {ERROR_CODES} from '../response/error-codes.mjs';
import {toErrorEnvelope} from '../response/json.mjs';
import {readLockedVersions} from './locked-versions.mjs';
import {
  activatePackageSet,
  isBarePackageName,
  withPackageSet,
} from './package-root.mjs';
import {isMatchableRange, satisfiesPublishedRange} from './version-range.mjs';

export {isMatchableRange} from './version-range.mjs';

const CLI_PACKAGE = '@astryxdesign/cli';
const CORE_PACKAGE = '@astryxdesign/core';
const ASTRYX_SCOPE = '@astryxdesign/';

/**
 * @typedef {'project-cli' | 'project' | 'matched' | 'incompatible' | 'hosted'} PackageSetPlanMode
 */

/**
 * @typedef {object} PackagePin What the project pins for one Astryx package.
 * @property {string} name dependency key the project declares
 * @property {string} packageName installed package identity (differs from
 *   `name` for an npm alias), or `name` when uninstalled
 * @property {string} wanted the pinned version, or the declared spec when
 *   neither an install nor the lockfile resolves an exact version (`unknown`
 *   for an install whose version cannot be read)
 * @property {'installed' | 'lockfile' | 'package.json'} from
 * @property {boolean} exact `wanted` is one version, not a range
 * @property {string | null} installedDir the project's own install, if any
 */

/**
 * @typedef {object} RootReport What one root carries for the pinned packages.
 * @property {string} root
 * @property {Record<string, string | null>} versions package → version the
 *   root carries (null: not carried)
 * @property {string[]} conflicts packages whose version does not match
 * @property {boolean} cli the root carries a CLI to run them with
 */

/**
 * @typedef {object} PlannedCli The CLI that serves the run.
 * @property {string} dir package directory
 * @property {string | null} version
 * @property {string} bin absolute path to its `astryx` entry
 * @property {string | null} runtime absolute path to its supported host entry,
 *   when that CLI has one
 */

/**
 * @typedef {object} PackageSetPlan
 * @property {PackageSetPlanMode} mode
 * @property {'no-project' | 'no-astryx-pins' | null} reason why a run is
 *   hosted
 * @property {string} cwd the caller's working directory; project files
 *   resolve from it in every mode
 * @property {string | null} projectDir directory of the nearest package.json
 * @property {string | null} root the package root that serves the run
 * @property {PlannedCli | null} cli
 * @property {string | null} command for `project-cli`: the package-manager
 *   command that runs the project's own CLI
 * @property {string[]} declarations names enumeration reaches through `root`
 * @property {PackagePin[]} pins
 * @property {RootReport[]} roots every root considered, in order
 * @property {import('./package-root.mjs').PackageProvenance[]} packages
 * @property {string[]} missing packages the plan needs that no source carries
 * @property {string[]} warnings one line each, for stderr
 * @property {string | null} error for `incompatible`: the report to print
 */

/**
 * @param {string} file
 * @returns {Record<string, any> | null}
 */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Nearest directory at or above `start` holding a package.json.
 * @param {string} start
 * @returns {string | null}
 */
function findProjectDir(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * The project's own install of `name`: the nearest `node_modules/<name>`
 * walking up. Never consults an active package set, so a plan made while one
 * is active still sees only the project.
 * @param {string} name
 * @param {string} fromDir
 * @returns {string | null}
 */
function findProjectInstall(name, fromDir) {
  if (!isBarePackageName(name)) return null;
  let dir = path.resolve(fromDir);
  for (;;) {
    const candidate = path.join(dir, 'node_modules', ...name.split('/'));
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * @param {string} root
 * @param {string} name
 * @returns {string | null}
 */
function rootPackageDir(root, name) {
  if (!isBarePackageName(name)) return null;
  const dir = path.join(root, 'node_modules', ...name.split('/'));
  return readJson(path.join(dir, 'package.json'))?.name === name ? dir : null;
}

/**
 * @param {string | null} dir
 * @returns {string | null}
 */
function versionAt(dir) {
  if (!dir) return null;
  const version = readJson(path.join(dir, 'package.json'))?.version;
  return typeof version === 'string' ? version : null;
}

/**
 * Does the package at `dir` contribute to Astryx (an integration manifest, or
 * the legacy `astryx` package.json field)?
 * @param {string | null} dir
 * @returns {boolean}
 */
function contributes(dir) {
  if (!dir) return false;
  if (findManifestPaths(dir).length > 0) return true;
  return readJson(path.join(dir, 'package.json'))?.astryx != null;
}

/**
 * Declared dependency name → spec, from the dependency fields autolink reads.
 * @param {string} dir
 * @returns {Record<string, string>}
 */
function declaredSpecs(dir) {
  const pkg = readJson(path.join(dir, 'package.json'));
  /** @type {Record<string, string>} */
  const specs = {};
  for (const field of DEPENDENCY_FIELDS) {
    const entry = pkg?.[field];
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    for (const [name, spec] of Object.entries(entry)) {
      if (!(name in specs)) specs[name] = typeof spec === 'string' ? spec : '';
    }
  }
  return specs;
}

/**
 * The CLI package at `dir`, as a {@link PlannedCli}.
 * @param {string | null} dir
 * @returns {PlannedCli | null}
 */
function cliAt(dir) {
  if (!dir) return null;
  const pkg = readJson(path.join(dir, 'package.json'));
  const binField = pkg?.bin;
  const rel =
    typeof binField === 'string'
      ? binField
      : (binField?.astryx ?? 'clients/cli/bin/astryx.mjs');
  const runtime = path.join(dir, 'host', 'index.mjs');
  return {
    dir,
    version: typeof pkg?.version === 'string' ? pkg.version : null,
    bin: path.resolve(dir, rel),
    runtime: fs.existsSync(runtime) ? runtime : null,
  };
}

/**
 * The install command for the project's package manager.
 * @param {string} projectDir
 * @returns {string}
 */
function installCommand(projectDir) {
  const pm = detectPackageManager(projectDir);
  return `${pm === 'npx' ? 'npm' : pm} install`;
}

/**
 * Does `version` satisfy `pin`?
 * @param {string | null} version
 * @param {PackagePin} pin
 * @returns {boolean}
 */
function satisfiesPin(version, pin) {
  if (version == null) return false;
  if (pin.exact) return satisfiesPublishedRange(version, pin.wanted);
  return (
    isMatchableRange(pin.wanted) && satisfiesPublishedRange(version, pin.wanted)
  );
}

/** @param {PackagePin} pin */
function describePin(pin) {
  return `${pin.wanted} (${pin.from})`;
}

/**
 * @param {readonly string[]} roots
 */
function validateRoots(roots) {
  if (!Array.isArray(roots) || roots.length === 0) {
    throw new TypeError('planPackageSet: roots must be a non-empty array');
  }
  return roots.map(root => {
    if (typeof root !== 'string' || !path.isAbsolute(root)) {
      throw new TypeError(
        `planPackageSet: every root must be an absolute path, got ${JSON.stringify(root)}`,
      );
    }
    if (!fs.existsSync(path.join(root, 'node_modules'))) {
      throw new Error(`planPackageSet: ${root} has no node_modules directory`);
    }
    return path.resolve(root);
  });
}

/**
 * A provenance entry for a package served from `dir` in a root.
 * @param {string} name
 * @param {string | null} dir
 * @returns {import('./package-root.mjs').PackageProvenance}
 */
function fromSet(name, dir) {
  return {name, version: versionAt(dir), source: 'package-set', dir};
}

/**
 * Add `entry` to `packages` unless a package of that name is already there.
 * @param {import('./package-root.mjs').PackageProvenance[]} packages
 * @param {import('./package-root.mjs').PackageProvenance} entry
 */
function record(packages, entry) {
  if (!packages.some(existing => existing.name === entry.name)) {
    packages.push(entry);
  }
}

/**
 * Decide where every package for one invocation comes from.
 *
 * @param {object} options
 * @param {string} [options.cwd] the caller's working directory
 * @param {readonly string[]} options.roots package roots, newest first
 * @param {readonly string[]} [options.integrations] the approved hosted
 *   integration list for `hosted` runs; defaults to the newest root's
 *   declared dependencies
 * @param {boolean} [options.projectCliAlreadyHandled] the outer host already
 *   attempted the project executable, so this process must not run it again;
 *   its declared range still constrains the CLI in the selected root
 * @returns {PackageSetPlan}
 */
export function planPackageSet({
  cwd = process.cwd(),
  roots,
  integrations,
  projectCliAlreadyHandled = false,
}) {
  const allRoots = validateRoots(roots);
  const newest = allRoots[0];
  const resolvedCwd = path.resolve(cwd);
  const projectDir = findProjectDir(resolvedCwd);

  /** @type {PackageSetPlan} */
  const plan = {
    mode: 'hosted',
    reason: null,
    cwd: resolvedCwd,
    projectDir,
    root: null,
    cli: null,
    command: null,
    declarations: [],
    pins: [],
    roots: [],
    packages: [],
    missing: [],
    warnings: [],
    error: null,
  };

  // The project's own Astryx Core. Planning is a trust boundary, so a same-named
  // workspace folder is not enough: verify the package identity and retain the
  // project's Yarn PnP resolution. Ordinary no-set CLI runs keep their legacy
  // bounded existence-only lookup in findCoreDirWithoutPackageSet.
  const projectCore = findProjectCoreDir(resolvedCwd);

  /** @param {'no-project' | 'no-astryx-pins'} reason */
  const hosted = reason => {
    const approved = (
      integrations ?? Object.keys(declaredSpecs(newest))
    ).filter(isBarePackageName);
    plan.mode = 'hosted';
    plan.reason = reason;
    plan.root = newest;
    plan.cli = cliAt(rootPackageDir(newest, CLI_PACKAGE));
    plan.declarations = [...new Set(approved)];
    if (plan.cli) record(plan.packages, fromSet(CLI_PACKAGE, plan.cli.dir));
    if (projectCore) {
      record(plan.packages, {
        name: CORE_PACKAGE,
        version: versionAt(projectCore),
        source: 'project',
        dir: projectCore,
      });
    }
    for (const name of [CORE_PACKAGE, ...plan.declarations]) {
      if (name === CLI_PACKAGE) continue;
      if (name === CORE_PACKAGE && projectCore) continue;
      const dir = rootPackageDir(newest, name);
      if (!dir) {
        if (!plan.missing.includes(name)) plan.missing.push(name);
        continue;
      }
      record(plan.packages, fromSet(name, dir));
    }
    for (const name of plan.missing) {
      plan.warnings.push(
        `astryx: ${name} is unavailable and is left out of this run.`,
      );
    }
    return plan;
  };

  if (projectDir == null) return hosted('no-project');

  // Unless the outer host already attempted this handoff, the project's own
  // CLI is authoritative.
  const projectCli = findProjectInstall(CLI_PACKAGE, projectDir);
  if (!projectCliAlreadyHandled && projectCli) {
    const cli = cliAt(projectCli);
    const command = `${getRunPrefix(projectDir)} astryx`;
    plan.mode = 'project-cli';
    plan.cli = cli;
    plan.command = command;
    plan.packages.push({
      name: CLI_PACKAGE,
      version: cli?.version ?? null,
      source: 'project',
      dir: projectCli,
    });
    plan.warnings.push(
      `astryx: this project installs ${CLI_PACKAGE}${cli?.version ? ` ${cli.version}` : ''}, which is authoritative here; running it (${command}).`,
    );
    return plan;
  }

  // The project's own install of a package: Core as above, anything else on
  // the node_modules chain.
  /** @param {string} name */
  const projectInstall = name =>
    name === CLI_PACKAGE && projectCliAlreadyHandled
      ? null
      : name === CORE_PACKAGE
        ? projectCore
        : findProjectInstall(name, projectDir);

  // Every Astryx package the project declares, plus a Core it provides
  // without declaring (hoisted from a workspace root, say).
  const specs = declaredSpecs(projectDir);
  const names = Object.keys(specs).filter(
    name =>
      isBarePackageName(name) &&
      (name.startsWith(ASTRYX_SCOPE) ||
        contributes(projectInstall(name)) ||
        allRoots.some(root => contributes(rootPackageDir(root, name)))),
  );
  if (!names.includes(CORE_PACKAGE) && projectCore) {
    names.unshift(CORE_PACKAGE);
  }
  if (names.length === 0) return hosted('no-astryx-pins');

  const {versions: locked} = readLockedVersions(
    projectDir,
    Object.fromEntries(names.map(name => [name, specs[name] ?? ''])),
  );
  plan.pins = names.map(name => {
    const installedDir = projectInstall(name);
    if (installedDir) {
      const installedName = readJson(
        path.join(installedDir, 'package.json'),
      )?.name;
      return {
        name,
        packageName: isBarePackageName(installedName) ? installedName : name,
        wanted: versionAt(installedDir) ?? 'unknown',
        from: 'installed',
        exact: true,
        installedDir,
      };
    }
    const spec = specs[name] ?? '*';
    const lockedVersion = locked.get(name);
    // The lockfile pins the version an install brings in only for a version
    // range it satisfies; a `file:` or alias spec, or a lockfile entry that
    // disagrees with the declaration, pins nothing.
    if (
      lockedVersion &&
      !(name === CLI_PACKAGE && projectCliAlreadyHandled) &&
      isMatchableRange(spec) &&
      satisfiesPublishedRange(lockedVersion, spec)
    ) {
      return {
        name,
        packageName: name,
        wanted: lockedVersion,
        from: 'lockfile',
        exact: true,
        installedDir: null,
      };
    }
    return {
      name,
      packageName: name,
      wanted: spec,
      from: 'package.json',
      exact: false,
      installedDir: null,
    };
  });

  const uninstalled = plan.pins.filter(pin => pin.installedDir == null);
  const fromProject = plan.pins
    .filter(pin => pin.installedDir != null)
    .map(pin => ({
      name: pin.packageName,
      version: pin.wanted === 'unknown' ? null : pin.wanted,
      source: /** @type {const} */ ('project'),
      dir: pin.installedDir,
    }));

  if (uninstalled.length === 0) {
    plan.mode = 'project';
    // This module belongs to the CLI that will run the project-only plan. The
    // newest root is irrelevant because project mode never consults a hosted root.
    plan.cli = cliAt(CLI_ROOT);
    plan.packages = [];
    if (plan.cli) record(plan.packages, fromSet(CLI_PACKAGE, plan.cli.dir));
    for (const entry of fromProject) record(plan.packages, entry);
    for (const legacy of scanLegacyExternalPackages(resolvedCwd)) {
      if (typeof legacy.name !== 'string' || legacy.name.length === 0) continue;
      record(plan.packages, {
        name: legacy.name,
        version: legacy.version,
        source: 'project',
        dir: legacy.packageDir,
      });
    }
    return plan;
  }

  // A root matches when it carries every uninstalled pin at the pinned
  // version, agrees with every installed pin it also carries, and carries a
  // CLI: its own packages were built together, so a root that disagrees with
  // the project's install, or a CLI from elsewhere, would mix two sets.
  for (const root of allRoots) {
    /** @type {RootReport} */
    const report = {
      root,
      versions: {},
      conflicts: [],
      cli: rootPackageDir(root, CLI_PACKAGE) != null,
    };
    for (const pin of plan.pins) {
      const version = versionAt(rootPackageDir(root, pin.packageName));
      report.versions[pin.name] = version;
      const ok =
        pin.installedDir == null
          ? satisfiesPin(version, pin)
          : version == null || satisfiesPublishedRange(version, pin.wanted);
      if (!ok) report.conflicts.push(pin.name);
    }
    plan.roots.push(report);
  }

  const match = plan.roots.find(
    report => report.conflicts.length === 0 && report.cli,
  );
  const install = installCommand(projectDir);
  if (!match) {
    plan.mode = 'incompatible';
    plan.missing = uninstalled
      .filter(pin =>
        plan.roots.every(report => report.versions[pin.name] == null),
      )
      .map(pin => pin.name);
    plan.error = incompatibleReport(plan, install);
    return plan;
  }

  plan.mode = 'matched';
  plan.root = match.root;
  plan.cli = cliAt(rootPackageDir(match.root, CLI_PACKAGE));
  // The root serves exactly the pins the project left uninstalled. The CLI has
  // a dedicated lookup path; declarations name every other served pin.
  plan.declarations = uninstalled
    .map(pin => pin.name)
    .filter(name => name !== CLI_PACKAGE);
  const served = uninstalled.map(pin =>
    fromSet(pin.name, rootPackageDir(match.root, pin.name)),
  );
  plan.packages = [];
  if (plan.cli) record(plan.packages, fromSet(CLI_PACKAGE, plan.cli.dir));
  for (const entry of fromProject) record(plan.packages, entry);
  for (const entry of served) record(plan.packages, entry);
  // A project that pins no Core reads the root's, built with what it serves.
  if (!names.includes(CORE_PACKAGE)) {
    const coreDir = rootPackageDir(match.root, CORE_PACKAGE);
    if (coreDir) record(plan.packages, fromSet(CORE_PACKAGE, coreDir));
  }
  const listed = served
    .map(entry => `${entry.name}@${entry.version}`)
    .join(', ');
  plan.warnings.push(
    `astryx: this project declares packages it has not installed; using compatible versions for this run (${listed}). Run ${install} to use the project's own install.`,
  );
  return plan;
}

/**
 * The report for a plan no root can serve: every pinned package, what the
 * project pins, and what each root carries.
 * @param {PackageSetPlan} plan
 * @param {string} install
 * @returns {string}
 */
function incompatibleReport(plan, install) {
  const lines = plan.pins.map(pin => {
    const where = pin.installedDir ? 'installed' : 'pinned';
    const head = `  ${pin.name}: project ${where} ${describePin(pin)}`;
    if (!pin.exact && !isMatchableRange(pin.wanted)) {
      return `${head}; only the project's own install can provide it`;
    }
    const carried = plan.roots.map(
      (report, index) =>
        `${report.versions[pin.name] ?? 'none'} (set ${index + 1})`,
    );
    if (plan.roots.every(report => report.versions[pin.name] == null)) {
      return `${head}; no set carries it`;
    }
    return `${head}; available: ${carried.join(', ')}`;
  });
  const cliless = plan.roots
    .map((report, index) => ({report, index}))
    .filter(({report}) => report.conflicts.length === 0 && !report.cli);
  for (const {index} of cliless) {
    lines.push(
      `  ${CLI_PACKAGE}: set ${index + 1} carries these versions but no CLI`,
    );
  }
  return [
    "astryx: this project's Astryx package versions are unavailable:",
    ...lines,
    `Install the project's dependencies (${install}) to use its own versions.`,
  ].join('\n');
}

/**
 * Activate a plan's package set for the rest of this process.
 *
 * @param {PackageSetPlan} plan
 * @param {{handlers?: import('./package-root.mjs').PackageSetHandlers}} [options]
 * @returns {() => void} deactivates it
 */
export function activatePlan(plan, {handlers} = {}) {
  if (plan.mode === 'project-cli' || plan.mode === 'incompatible') {
    throw new Error(
      `activatePlan: a ${plan.mode} plan has no package set to activate`,
    );
  }
  return activatePackageSet({
    mode: plan.mode,
    root: plan.root,
    declarations: plan.declarations,
    handlers,
    packages: plan.packages,
  });
}

/**
 * @param {string} p
 * @returns {string}
 */
function realOrSelf(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

/**
 * Does `argv` ask for JSON output? The same test the CLI entry applies.
 * @param {readonly string[]} argv
 */
function wantsJson(argv) {
  return argv.includes('--json');
}

/**
 * Plan, report, and run one invocation of the CLI for a caller's project.
 *
 * - `incompatible`: prints the report and returns status 1. Nothing runs.
 * - `project-cli`: in text mode, prints one warning and runs the project's own
 *   CLI with the same arguments in `cwd`, returning its exit status.
 * - otherwise: in text mode, prints any warnings, scopes the set, and runs a
 *   fresh instance of THIS CLI in `cwd`, returning its exit status. A set served
 *   by another root's CLI, or by none, is refused (status 1): load that CLI's
 *   runtime entry (`plan.cli.runtime`) and call its `runHostedCli` instead.
 *   A `project` plan scopes only its recorded project packages and no root, so
 *   Core lookup can use the exact project package the planner verified while
 *   every integration lookup behaves as an installed CLI would.
 *
 * When nothing runs and `argv` asks for `--json`, stdout carries the CLI's
 * error envelope (`ERR_VERSIONS_UNAVAILABLE`) instead of the stderr report;
 * the exit status is 1 either way. Planner warnings are silent for every JSON
 * run, so they never contaminate the command's machine-readable output.
 *
 * The in-process runner is single-flight because cwd and stdio are process-wide;
 * every completed call restores them, so later calls run normally.
 *
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {readonly string[]} options.roots package roots, newest first
 * @param {readonly string[]} [options.argv] arguments after `astryx`
 * @param {readonly string[]} [options.integrations] approved hosted
 *   integration list
 * @param {boolean} [options.projectCliAlreadyHandled] the outer host already
 *   attempted the project executable and this process must not run it again
 * @param {import('./package-root.mjs').PackageSetHandlers} [options.handlers]
 * @param {{write(chunk: string): unknown}} [options.stdout]
 * @param {{write(chunk: string): unknown}} [options.stderr]
 * @returns {Promise<{plan: PackageSetPlan, status: number}>}
 */
export async function runHostedCli({
  cwd = process.cwd(),
  roots,
  argv = [],
  integrations,
  projectCliAlreadyHandled = false,
  handlers,
  stdout = process.stdout,
  stderr = process.stderr,
}) {
  const plan = planPackageSet({
    cwd,
    roots,
    integrations,
    projectCliAlreadyHandled,
  });
  if (!wantsJson(argv)) {
    for (const warning of plan.warnings) stderr.write(`${warning}\n`);
  }

  /** @param {string} message */
  const refuse = message => {
    if (wantsJson(argv)) {
      const envelope = toErrorEnvelope(
        message,
        undefined,
        ERROR_CODES.ERR_VERSIONS_UNAVAILABLE,
      );
      stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
    } else {
      stderr.write(`${message}\n`);
    }
    return {plan, status: 1};
  };

  if (plan.mode === 'incompatible') {
    return refuse(/** @type {string} */ (plan.error));
  }

  if (plan.mode === 'project-cli') {
    const cli = /** @type {PlannedCli} */ (plan.cli);
    if (!fs.existsSync(cli.bin)) {
      return refuse(
        `astryx: the project's ${CLI_PACKAGE} has no entry at ${cli.bin}. Reinstall the project's dependencies (${installCommand(/** @type {string} */ (plan.projectDir))}).`,
      );
    }
    const ownStdout = stdout === process.stdout;
    const ownStderr = stderr === process.stderr;
    const child = spawnSync(process.execPath, [cli.bin, ...argv], {
      cwd: plan.cwd,
      stdio: [
        'inherit',
        ownStdout ? 'inherit' : 'pipe',
        ownStderr ? 'inherit' : 'pipe',
      ],
    });
    if (!ownStdout && child.stdout?.length)
      stdout.write(child.stdout.toString());
    if (!ownStderr && child.stderr?.length)
      stderr.write(child.stderr.toString());
    if (child.error) {
      return refuse(
        `astryx: could not run the project's ${CLI_PACKAGE}: ${child.error.message}`,
      );
    }
    const signal = child.signal ? osConstants.signals[child.signal] : undefined;
    return {
      plan,
      status: child.status ?? (typeof signal === 'number' ? 128 + signal : 1),
    };
  }

  if (plan.mode !== 'project' && plan.cli == null) {
    return refuse(
      `astryx: cannot run because the selected packages carry no ${CLI_PACKAGE}.`,
    );
  }
  if (
    plan.mode !== 'project' &&
    realOrSelf(/** @type {PlannedCli} */ (plan.cli).dir) !==
      realOrSelf(CLI_ROOT)
  ) {
    const cli = /** @type {PlannedCli} */ (plan.cli);
    return refuse(
      `astryx: cannot run because this command uses ${CLI_PACKAGE}${cli.version ? ` ${cli.version}` : ''}, but the selected packages require another CLI.`,
    );
  }

  const {runCliInProcess} =
    await import('../../clients/cli/run-in-process.mjs');
  const run = () => runCliInProcess(argv, {cwd: plan.cwd, stdout, stderr});
  const status = await withPackageSet(
    {
      mode: plan.mode,
      root: plan.root,
      declarations: plan.declarations,
      handlers,
      packages: plan.packages,
    },
    run,
  );
  return {plan, status};
}
