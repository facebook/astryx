// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Detect the project's package manager from lockfiles.
 *
 * Returns the correct command prefix for running package binaries
 * (e.g. 'npx astryx', 'yarn astryx', 'pnpm exec astryx').
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * A package manager we can install with and run binaries through.
 * @typedef {'yarn' | 'pnpm' | 'bun' | 'npm'} PackageManager
 */

/**
 * Result of package-manager detection. `'npx'` is the sentinel for "nothing
 * detected" — no lockfile, no `packageManager` field, no runner user-agent —
 * so callers fall back to npm/npx. It is a distinct value from {@link PackageManager}
 * because it means "undetected", not "npm was chosen".
 * @typedef {PackageManager | 'npx'} DetectedPackageManager
 */

/** @type {readonly PackageManager[]} */
const KNOWN_PMS = ['yarn', 'pnpm', 'bun', 'npm'];

/**
 * Lockfile names by package manager. Order is the tiebreak of LAST resort —
 * see {@link detectPackageManager} for why it should rarely decide anything.
 * @type {readonly [PackageManager, readonly string[]][]}
 */
const LOCKFILES = [
  ['yarn', ['yarn.lock']],
  ['pnpm', ['pnpm-lock.yaml']],
  ['bun', ['bun.lockb', 'bun.lock']],
  ['npm', ['package-lock.json']],
];

/**
 * Narrow an arbitrary string to a known {@link PackageManager}.
 * @param {string} name
 * @returns {name is PackageManager}
 */
function isKnownPackageManager(name) {
  return /** @type {readonly string[]} */ (KNOWN_PMS).includes(name);
}

/**
 * The `packageManager` field of a directory's package.json, if it names one we
 * know. This is the declarative answer (corepack's field), so it outranks any
 * lockfile sitting next to it.
 * @param {string} dir
 * @returns {PackageManager | null}
 */
function declaredPackageManager(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const name = String(pkg.packageManager ?? '').split('@')[0];
    return isKnownPackageManager(name) ? name : null;
  } catch {
    // Best-effort: unreadable/invalid package.json.
    return null;
  }
}

/**
 * The package manager currently running us, from the user agent every PM sets
 * on the scripts and binaries it spawns.
 * @returns {PackageManager | null}
 */
function runningPackageManager() {
  const name = String(process.env.npm_config_user_agent ?? '').split('/')[0];
  return isKnownPackageManager(name) ? name : null;
}

/**
 * Every package manager with a lockfile in this directory.
 * @param {string} dir
 * @returns {PackageManager[]}
 */
function lockfilesIn(dir) {
  return LOCKFILES.filter(([, names]) =>
    names.some(name => fs.existsSync(path.join(dir, name))),
  ).map(([pm]) => pm);
}

/**
 * Detect the package manager used in a project directory.
 * Walks up from targetDir, taking the first directory that answers.
 *
 * A single lockfile still wins over everything else in its directory, which is
 * the long-standing behaviour. What changes here is the case of SEVERAL
 * lockfiles in one directory, which the fixed array order used to resolve
 * silently and often wrongly.
 *
 * That case is not hypothetical. One `yarn install` inside a pnpm project
 * leaves a `yarn.lock` beside the committed `pnpm-lock.yaml` forever, and
 * `fbsource/nest` ships both at its root deliberately. Answering "yarn" from
 * array order then makes every command the CLI prints wrong for that project —
 * including the invocation line written into agent docs, which agents copy.
 *
 * So ambiguity now consults, in order: the declared `packageManager` field,
 * then whoever is running us (`npm_config_user_agent`), then the fixed order.
 *
 * Returns `'npx'` when nothing can be detected — see {@link DetectedPackageManager}.
 *
 * @param {string} [targetDir=process.cwd()]
 * @returns {DetectedPackageManager}
 */
export function detectPackageManager(targetDir = process.cwd()) {
  let dir = path.resolve(targetDir);
  const root = path.parse(dir).root;
  const running = runningPackageManager();

  while (dir !== root) {
    const locks = lockfilesIn(dir);

    // 1. One lockfile is unambiguous, and outranks the field as it always has.
    if (locks.length === 1) return locks[0];

    // 2. Several lockfiles: the filesystem cannot say. Ask for a declaration,
    //    then ask who is running us, and only then fall back to array order.
    if (locks.length > 1) {
      const declared = declaredPackageManager(dir);
      if (declared && locks.includes(declared)) return declared;
      if (running && locks.includes(running)) return running;
      return locks[0];
    }

    // 3. No lockfile here: the field, if this directory declares one.
    const declared = declaredPackageManager(dir);
    if (declared) return declared;

    dir = path.dirname(dir);
  }

  // 4. Nothing on disk said anything — fall back to whoever invoked us.
  return running ?? 'npx';
}

/**
 * Get the command prefix for running a package binary.
 *
 * @param {string} [targetDir]
 * @returns {string} e.g. 'npx', 'yarn', 'pnpm exec', 'bunx'
 */
export function getRunPrefix(targetDir) {
  const pm = detectPackageManager(targetDir);
  switch (pm) {
    case 'yarn': return 'yarn';
    case 'pnpm': return 'pnpm exec';
    case 'bun': return 'bunx';
    case 'npm':
    default: return 'npx';
  }
}

/** The published CLI package name — used for one-off (uninstalled) invocations. */
export const CLI_PACKAGE = '@astryxdesign/cli';

/** The CLI binary name — only resolves once the CLI is installed (or run via CLI_PACKAGE). */
export const CLI_BIN = 'astryx';

/**
 * Get the one-off ("dlx") runner for the detected package manager.
 *
 * Unlike {@link getRunPrefix} (which runs an *installed* binary), this fetches
 * and runs a package on demand — so it is always paired with the scoped
 * {@link CLI_PACKAGE}, never the bare `astryx` bin. Running bare `npx astryx`
 * without the CLI installed resolves to an unrelated package on the registry.
 *
 * @param {string} [targetDir]
 * @returns {string} e.g. 'npx', 'pnpm dlx', 'yarn dlx', 'bunx'
 */
export function getDlxPrefix(targetDir) {
  const pm = detectPackageManager(targetDir);
  switch (pm) {
    case 'yarn': return 'yarn dlx';
    case 'pnpm': return 'pnpm dlx';
    case 'bun': return 'bunx';
    case 'npm':
    default: return 'npx';
  }
}

/**
 * Heuristic: was the running CLI launched one-off via a package runner
 * (npx / pnpm dlx / yarn dlx / bunx) rather than from an installed dependency?
 *
 * We sniff the entry path (`process.argv[1]`) for well-known runner-cache
 * markers. This errs safe in both directions: a false negative falls back to
 * the installed form (`<prefix> astryx`, the historical behavior), and a false
 * positive emits the always-valid scoped form (`<dlx> @astryxdesign/cli`).
 *
 * @returns {boolean}
 */
export function isCliOneOff() {
  const entry = String(process.argv[1] || '').replace(/\\/g, '/');
  return /\/_npx\/|\/dlx[-/]|\/\.bun\/install\/cache\/|\/bunx-/.test(entry);
}

/**
 * The safe, install-aware CLI invocation stem to suggest to users.
 *
 * - Installed / global / dev: `<run-prefix> astryx` (e.g. `pnpm exec astryx`).
 *   Bare `astryx` resolves to the local (or global) binary.
 * - One-off (npx/dlx cache): `<dlx-prefix> @astryxdesign/cli` — the bare
 *   `astryx` name isn't on disk, so npm would fetch an unrelated registry
 *   package; the scoped package always resolves to us.
 *
 * @param {string} [targetDir]
 * @returns {string}
 */
export function getCliInvocation(targetDir) {
  if (isCliOneOff()) return `${getDlxPrefix(targetDir)} ${CLI_PACKAGE}`;
  return `${getRunPrefix(targetDir)} ${CLI_BIN}`;
}

/**
 * Format a full, runnable CLI command from a subcommand string.
 *
 * Accepts either `astryx component Button` or `component Button` (a leading
 * `astryx` token is stripped) and prepends the install-aware invocation stem
 * from {@link getCliInvocation}.
 *
 * @param {string} command e.g. 'astryx component Button' | 'docs tokens'
 * @param {string} [targetDir]
 * @returns {string}
 */
export function formatCliCommand(command, targetDir) {
  const sub = String(command).replace(/^\s*astryx\b\s*/, '').trim();
  const stem = getCliInvocation(targetDir);
  return sub ? `${stem} ${sub}` : stem;
}
