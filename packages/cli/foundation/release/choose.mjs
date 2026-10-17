// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Which release answers a run (spec AST-081 FR2, FR3, FR6, FR9).
 *
 * Core decides the release:
 *
 * - **In a project**, the release is the one that matches the project's Core:
 *   the version of the Core the folder reads, else the Core version the
 *   lockfile records, else the newest release the declared Core range allows.
 *   A project that records no Core at all is matched by the CLI it installs
 *   (or locks, or declares).
 *   - When the project installs a CLI of exactly that version, that CLI
 *     answers: every other copy hands the run to it.
 *   - Otherwise the matched release answers. The copy that started the run
 *     answers itself when it is that release, and otherwise hands the run to
 *     the release in the per-user cache, installing it first.
 *   - `astryx upgrade` follows the same rule, so it always runs the codemods of
 *     the release equal to the project's Core.
 * - **Outside a project**, the global copy answers with the newest release it
 *   keeps (global-state.mjs); every other copy answers itself.
 *
 * A copy never hands a run to itself, so a run is handed off at most once:
 * the copy it reaches makes the same choice and finds itself.
 *
 * @input  the folder, the running copy
 * @output a {@link ReleaseChoice}
 * @position foundation/release — called once per run by handoff.mjs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  readReleaseFacts,
  readJson,
  CORE_PACKAGE_NAME,
  CLI_PACKAGE_NAME,
} from './project.mjs';
import {
  cliBinOf,
  isInReleaseCache,
  isReleaseVersion,
  resolvePublishedVersion,
  userCacheDir,
} from './cache.mjs';
import {currentGlobalRelease} from './global-state.mjs';

/**
 * The copy that is running.
 * @typedef {object} RunningCopy
 * @property {string} version its package version
 * @property {string} root its package folder
 */

/**
 * Who answers the run.
 * @typedef {object} ReleaseChoice
 * @property {'project' | 'matched' | 'carried'} copy the kind of copy that
 *   answers (`meta.answeredBy.copy`)
 * @property {'self' | 'project-cli' | 'release'} answer `self`: this copy;
 *   `project-cli`: hand off to the project's CLI; `release`: hand off to the
 *   cached release `version`
 * @property {string} version the release that answers
 * @property {string | null} bin the entry file to hand off to (`project-cli`
 *   and a cached `release` that is already installed)
 * @property {string | null} coreVersion the Core the answering release pairs
 *   with, when known now
 * @property {boolean} inProject
 * @property {string | null} unavailable why the release cannot answer, when it
 *   cannot (the run fails with ERR_VERSIONS_UNAVAILABLE)
 */

/**
 * @param {string} p
 * @returns {string}
 */
function real(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

/** Folder-name patterns of package-manager global installs that hold a package.json. */
const GLOBAL_OWNER_PATTERNS = [
  // pnpm: `<pnpm home>/global/5` before pnpm 10, `<pnpm home>/global/v11/<id>` since.
  /[\\/]global[\\/]v?\d+(?:[\\/][^\\/]+)?$/,
  /[\\/]yarn[\\/]global$/,
  /[\\/]\.bun[\\/]install[\\/]global$/,
];

/** Path markers of package runners' temporary installs. */
const RUNNER_CACHE =
  /[\\/]_npx[\\/]|[\\/]dlx[-\\/]|[\\/]\.bun[\\/]install[\\/]cache[\\/]|[\\/]bunx-|[\\/]xfs-/;

/**
 * Is the running copy the CLI package installed for the computer
 * (`npm i -g`, `pnpm add -g`, `yarn global add`, `bun add -g`, Volta)?
 *
 * Read from where the package lives: in a `node_modules` folder whose owner
 * holds no package.json (npm's global folder), or whose owner is one of the
 * package managers' global folders. A copy in a project, in a package
 * runner's temporary install, or in the release cache is not.
 *
 * @param {string} cliRoot
 * @param {string} [cacheDir]
 * @returns {boolean}
 */
export function isGlobalCopy(cliRoot, cacheDir = userCacheDir()) {
  const root = real(cliRoot);
  if (RUNNER_CACHE.test(root) || isInReleaseCache(root, cacheDir)) return false;
  const parts = root.split(/[\\/]/);
  const at = parts.lastIndexOf('node_modules');
  if (at < 1) return false;
  let owner = parts.slice(0, at).join(path.sep) || path.sep;
  // pnpm keeps the real folder in `<owner>/node_modules/.pnpm/<id>/node_modules`.
  const pnpmAt = parts.lastIndexOf('.pnpm');
  if (pnpmAt > 0 && parts[pnpmAt - 1] === 'node_modules') {
    owner = parts.slice(0, pnpmAt - 1).join(path.sep) || path.sep;
  }
  if (GLOBAL_OWNER_PATTERNS.some(re => re.test(owner))) return true;
  return !fs.existsSync(path.join(owner, 'package.json'));
}

/**
 * The release that matches a project's facts, before any registry question.
 * @param {import('./project.mjs').ReleaseFacts} facts
 * @returns {{version: string | null, range: {name: string, spec: string} | null}}
 */
export function matchedVersionOf(facts) {
  if (facts.core) return {version: facts.core.version, range: null};
  if (isReleaseVersion(facts.lockedCoreVersion)) {
    return {version: facts.lockedCoreVersion, range: null};
  }
  if (facts.declaredCoreRange) {
    return exactOrRange(CORE_PACKAGE_NAME, facts.declaredCoreRange);
  }
  if (facts.cli) return {version: facts.cli.version, range: null};
  if (isReleaseVersion(facts.lockedCliVersion)) {
    return {version: facts.lockedCliVersion, range: null};
  }
  if (facts.declaredCliRange) {
    return exactOrRange(CLI_PACKAGE_NAME, facts.declaredCliRange);
  }
  return {version: null, range: null};
}

/**
 * @param {string} name
 * @param {string} spec
 * @returns {{version: string | null, range: {name: string, spec: string} | null}}
 */
function exactOrRange(name, spec) {
  const trimmed = spec.trim().replace(/^=/, '').replace(/^v/, '');
  if (isReleaseVersion(trimmed)) return {version: trimmed, range: null};
  return {version: null, range: {name, spec}};
}

/**
 * Choose who answers a run started by `self` in `cwd`.
 *
 * A command that acts on the computer rather than the folder is chosen as
 * outside a project wherever it runs (`computer`), so a project's older CLI
 * never answers it.
 *
 * @param {{cwd: string, self: RunningCopy, cacheDir?: string, resolve?: typeof resolvePublishedVersion, computer?: boolean}} input
 * @returns {ReleaseChoice}
 */
export function chooseRelease({
  cwd,
  self,
  cacheDir = userCacheDir(),
  resolve = resolvePublishedVersion,
  computer = false,
}) {
  const facts = computer ? OUTSIDE : readReleaseFacts(cwd);
  const selfReal = real(self.root);

  if (!facts.inProject) {
    if (isGlobalCopy(self.root, cacheDir)) {
      const current = currentGlobalRelease(cacheDir);
      if (current && current.version !== self.version) {
        return {
          copy: 'carried',
          answer: 'release',
          version: current.version,
          bin: current.bin,
          coreVersion: current.version,
          inProject: false,
          unavailable: null,
        };
      }
    }
    return {
      copy: 'carried',
      answer: 'self',
      version: self.version,
      bin: null,
      coreVersion: null,
      inProject: false,
      unavailable: null,
    };
  }

  let {version, range} = matchedVersionOf(facts);
  if (!version && range) {
    version = resolve(range.name, range.spec);
    if (!version) {
      return {
        copy: 'matched',
        answer: 'release',
        version: `${range.name}@${range.spec}`,
        bin: null,
        coreVersion: null,
        inProject: true,
        unavailable: `no published release of ${range.name} matching "${range.spec}" could be found`,
      };
    }
  }

  const coreVersion = facts.core?.version ?? version;
  if (facts.cli && (!version || facts.cli.version === version)) {
    if (real(facts.cli.dir) === selfReal) {
      return {
        copy: 'project',
        answer: 'self',
        version: facts.cli.version,
        bin: null,
        coreVersion: facts.core?.version ?? null,
        inProject: true,
        unavailable: null,
      };
    }
    const bin = cliBinOf(facts.cli.dir);
    return {
      copy: 'project',
      answer: 'project-cli',
      version: facts.cli.version,
      bin,
      coreVersion: facts.core?.version ?? null,
      inProject: true,
      unavailable: bin
        ? null
        : `the project's CLI at ${facts.cli.dir} has no astryx command`,
    };
  }

  if (!version || version === self.version) {
    // A copy that lives inside the project itself, such as a workspace's own
    // CLI package beside its Core package, is the project's own CLI.
    if (isInside(selfReal, projectRootOf(facts))) {
      return {
        copy: 'project',
        answer: 'self',
        version: self.version,
        bin: null,
        coreVersion: facts.core?.version ?? null,
        inProject: true,
        unavailable: null,
      };
    }
    return {
      copy: 'matched',
      answer: 'self',
      version: self.version,
      bin: null,
      coreVersion,
      inProject: true,
      unavailable: null,
    };
  }
  return {
    copy: 'matched',
    answer: 'release',
    version,
    bin: null,
    coreVersion,
    inProject: true,
    unavailable: null,
  };
}

/**
 * The folder a project's facts point at: the declaring package.json's folder,
 * else the folder that holds the Core (the one above its node_modules, or the
 * workspace root above `packages/core`).
 * @param {import('./project.mjs').ReleaseFacts} facts
 * @returns {string | null}
 */
function projectRootOf(facts) {
  if (facts.declaringDir) return facts.declaringDir;
  const dir = facts.core?.dir ?? facts.cli?.dir;
  if (!dir) return null;
  const parts = path.resolve(dir).split(path.sep);
  const at = parts.indexOf('node_modules');
  if (at > 0) return parts.slice(0, at).join(path.sep) || path.sep;
  return path.dirname(path.dirname(dir));
}

/**
 * Is `child` inside `parent` (both real paths), outside any node_modules
 * folder in between? A package installed into a project's node_modules is
 * found as the project's CLI already; this covers a copy that is part of the
 * project's own source, such as a workspace package.
 * @param {string} child
 * @param {string | null} parent
 * @returns {boolean}
 */
function isInside(child, parent) {
  if (!parent) return false;
  const rel = path.relative(real(parent), child);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  return !rel.split(path.sep).includes('node_modules');
}

/** The facts of a folder outside any project. */
const OUTSIDE = Object.freeze({
  inProject: false,
  core: null,
  cli: null,
  declaringDir: null,
  declaredCoreRange: null,
  declaredCliRange: null,
  lockedCoreVersion: null,
  lockedCliVersion: null,
});

/** Root options that take a value, so their value is not the command name. */
const VALUE_OPTIONS = new Set(['--lang', '--detail']);

/**
 * Is this run a command that acts on the computer rather than the folder it
 * runs in? Today that is `astryx init --user`, which writes the
 * computer-level agent text (spec AST-081 FR8, FR9).
 * @param {string[]} argv arguments after `astryx`
 * @returns {boolean}
 */
export function isComputerLevel(argv) {
  let command = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (VALUE_OPTIONS.has(arg)) {
      i += 1;
      continue;
    }
    if (!arg.startsWith('-')) {
      command = arg;
      break;
    }
  }
  return command === 'init' && argv.includes('--user');
}

/**
 * The running copy, from its package folder.
 * @param {string} root
 * @returns {RunningCopy}
 */
export function runningCopy(root) {
  const pkg = readJson(path.join(root, 'package.json'));
  return {version: String(pkg?.version ?? '0.0.0'), root};
}

/**
 * Does the package at `cliDir` print its own who-answered line? Releases that
 * carry this module do; older ones answer silently, so the copy that hands a
 * run to them prints the line for them.
 * @param {string} cliDir
 * @returns {boolean}
 */
export function namesWhoAnswered(cliDir) {
  return fs.existsSync(
    path.join(cliDir, 'foundation', 'release', 'choose.mjs'),
  );
}

/**
 * The CLI package folder an entry file belongs to.
 * @param {string} bin
 * @returns {string}
 */
export function packageRootOf(bin) {
  let dir = path.dirname(real(bin));
  for (;;) {
    if (readJson(path.join(dir, 'package.json'))?.name === CLI_PACKAGE_NAME)
      return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.dirname(real(bin));
    dir = parent;
  }
}
