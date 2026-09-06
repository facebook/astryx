// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Detect the project's package manager.
 *
 * The order is: the `packageManager` field a project DECLARES, then the
 * lockfiles it happens to have, then a committed package-manager config, then
 * the runner that launched us. Returns the correct command prefix for running
 * package binaries (e.g. 'npx astryx', 'yarn astryx', 'pnpm exec astryx').
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
 * see {@link explainPackageManager} for why it should rarely decide anything.
 * @type {readonly [PackageManager, readonly string[]][]}
 */
const LOCKFILES = [
  ['yarn', ['yarn.lock']],
  ['pnpm', ['pnpm-lock.yaml']],
  ['bun', ['bun.lockb', 'bun.lock']],
  ['npm', ['package-lock.json']],
];

/**
 * A lockfile found on disk: which package manager owns it, and the file that
 * was actually there (bun has two spellings), so a caller can name it.
 * @typedef {{pm: PackageManager, file: string}} FoundLockfile
 */

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
 * Every lockfile in this directory, with the file that was found.
 * @param {string} dir
 * @returns {FoundLockfile[]}
 */
function lockfilesIn(dir) {
  /** @type {FoundLockfile[]} */
  const found = [];
  for (const [pm, names] of LOCKFILES) {
    const file = names.find(name => fs.existsSync(path.join(dir, name)));
    if (file) found.push({pm, file});
  }
  return found;
}

/**
 * Files a project COMMITS that name its package manager. A stray `install` in
 * the wrong tool drops a lockfile; it does not write any of these. That is what
 * makes them project-owned evidence and a lockfile, on its own, merely a trace.
 * @type {readonly [PackageManager, readonly string[]][]}
 */
const PROJECT_EVIDENCE = [
  ['pnpm', ['pnpm-workspace.yaml']],
  ['yarn', ['.yarnrc.yml', '.yarnrc']],
  ['bun', ['bunfig.toml']],
];

/**
 * Every package manager this directory declares through a committed config file.
 * @param {string} dir
 * @returns {PackageManager[]}
 */
function evidenceIn(dir) {
  return PROJECT_EVIDENCE.filter(([, names]) =>
    names.some(name => fs.existsSync(path.join(dir, name))),
  ).map(([pm]) => pm);
}

/**
 * A detection result, with the reasoning a caller needs to report it.
 * @typedef {object} PackageManagerResolution
 * @property {DetectedPackageManager} pm - What to use.
 * @property {boolean} ambiguous - True when several lockfiles sit in one
 *   directory and nothing the project owns picks between them. `pm` is then the
 *   neutral `'npx'`: correct under every package manager, wrong under none.
 * @property {string | null} dir - The directory that answered, if any.
 * @property {PackageManager[]} candidates - The lockfile owners in `dir`.
 * @property {PackageManager | null} declared - The `packageManager` field in
 *   `dir`, when it names one we know. Non-null means the project SAID which
 *   one, and `pm` is that.
 * @property {'declared' | 'lockfile' | 'evidence' | 'runner' | 'none'} source -
 *   What decided `pm`.
 * @property {FoundLockfile[]} strayLockfiles - Lockfiles in `dir` that the
 *   declared field contradicts. Detection ignores them; `astryx doctor` reports
 *   them, because a tool that trusts the lockfile instead will disagree with us.
 */

/**
 * Detect the project's package manager, with the reasoning attached.
 * Walks up from targetDir, taking the first directory that answers.
 *
 * The order within a directory, strongest first:
 *
 * 1. **The declared `packageManager` field.** This is the project saying which
 *    one it uses — corepack's field, the only signal a person writes on
 *    purpose — so it decides, whatever lockfiles happen to sit beside it. A
 *    single `yarn install` in a pnpm project drops a `yarn.lock` that never
 *    goes away, and letting that trace outrank the declaration made every
 *    command the CLI printed wrong for the project, including the invocation
 *    line written into agent docs, which agents copy. The contradicted
 *    lockfiles come back as `strayLockfiles` so `doctor` can say so.
 * 2. **A single lockfile**, when nothing is declared. Unambiguous, and the
 *    long-standing fallback.
 * 3. **A committed package-manager config** (`pnpm-workspace.yaml`,
 *    `.yarnrc.yml`, `bunfig.toml`), when several lockfiles tie and nothing is
 *    declared. A stray `install` drops a lockfile; it does not write one of
 *    these.
 * 4. **Nothing project-owned decides it** — then the answer is not a guess, it
 *    is `'npx'`, which runs correctly under every package manager, plus
 *    `ambiguous: true` so `astryx doctor` can report the real problem. (Same
 *    idea as `findConfigPath`, which refuses to choose between coexisting
 *    configs.)
 * 5. **The runner**, only once the whole walk found nothing on disk.
 *    Deliberately last, and never a tiebreak: an agent handed the wrong `yarn
 *    astryx` line runs the CLI *through yarn*, so the runner agrees with the
 *    mistake and the wrong line reproduces itself forever.
 *
 * @param {string} [targetDir=process.cwd()]
 * @returns {PackageManagerResolution}
 */
export function explainPackageManager(targetDir = process.cwd()) {
  let dir = path.resolve(targetDir);
  const root = path.parse(dir).root;

  while (dir !== root) {
    const locks = lockfilesIn(dir);
    const candidates = locks.map(lock => lock.pm);
    const declared = declaredPackageManager(dir);

    // 1. The project declared one. Nothing on the filesystem outranks that.
    if (declared) {
      return {
        pm: declared,
        ambiguous: false,
        dir,
        candidates,
        declared,
        source: 'declared',
        strayLockfiles: locks.filter(lock => lock.pm !== declared),
      };
    }

    // 2. One lockfile is unambiguous.
    if (locks.length === 1) {
      return {
        pm: locks[0].pm,
        ambiguous: false,
        dir,
        candidates,
        declared: null,
        source: 'lockfile',
        strayLockfiles: [],
      };
    }

    // 3. Several lockfiles and no declaration: the filesystem cannot say.
    //    Only a file the project committed on purpose can.
    if (locks.length > 1) {
      const evidence = evidenceIn(dir).filter(pm => candidates.includes(pm));
      if (evidence.length === 1) {
        return {
          pm: evidence[0],
          ambiguous: false,
          dir,
          candidates,
          declared: null,
          source: 'evidence',
          strayLockfiles: [],
        };
      }
      return {
        pm: 'npx',
        ambiguous: true,
        dir,
        candidates,
        declared: null,
        source: 'none',
        strayLockfiles: [],
      };
    }

    dir = path.dirname(dir);
  }

  // 5. Nothing on disk said anything anywhere. With no project evidence to
  //    contradict, the runner is the only signal there is.
  const running = runningPackageManager();
  return {
    pm: running ?? 'npx',
    ambiguous: false,
    dir: null,
    candidates: [],
    declared: null,
    source: running ? 'runner' : 'none',
    strayLockfiles: [],
  };
}

/**
 * Detect the package manager used in a project directory.
 *
 * Returns `'npx'` when nothing can be detected, and also when several lockfiles
 * tie with nothing project-owned to break them — see
 * {@link explainPackageManager}, which carries the `ambiguous` flag callers need
 * to report that second case.
 *
 * @param {string} [targetDir=process.cwd()]
 * @returns {DetectedPackageManager}
 */
export function detectPackageManager(targetDir = process.cwd()) {
  return explainPackageManager(targetDir).pm;
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
