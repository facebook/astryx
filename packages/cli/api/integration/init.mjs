// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `integrationInit(options?, ctx?)` — create or complete the package.json
 * for an Astryx integration package and install the required dev dependencies.
 *
 * The API function behind `astryx integration init`. It writes only the fields
 * that `integration add` and `integration verify` need (name, version, and —
 * for new packages only — an empty exports map) without overwriting what the
 * author already set, then installs the CLI and Core so every subsequent
 * command works immediately: an undeclared one is added as a dev dependency,
 * a declared one is installed in the field that declares it. The Core peer is written by
 * `integration add component|template|theme`, not by init. Idempotent:
 * re-running on an initialized package with satisfied deps reports
 * "unchanged" with no error and no install.
 *
 * INV16: writers never create `exports` on an existing package. An empty
 * exports map makes every previously-open deep import private for its
 * consumers. Only a new package.json (no file existed) gets `exports: {}`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {builtinModules} from 'node:module';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {detectPackageManager} from '../../foundation/env/package-manager.mjs';
import {resolveInstalledPackageJson} from '../../foundation/integrations/cli-requirement.mjs';
import {logger} from '../logger.mjs';

/** @typedef {import('./init.type.mjs').IntegrationInitOptions} IntegrationInitOptions */
/** @typedef {import('./init.type.mjs').IntegrationInitResponse} IntegrationInitResponse */

/**
 * npm package name: optional `@scope/`, then lowercase letters, digits, dots,
 * underscores, and hyphens, starting with a letter or digit.
 */
const PACKAGE_NAME_RE = /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u;

/** npm's limit on the full name, scope included. */
const PACKAGE_NAME_MAX_LENGTH = 214;

/** Names npm refuses to publish whatever their characters. */
const RESERVED_PACKAGE_NAMES = new Set(['node_modules', 'favicon.ico']);

/** Node core module names (with and without `node:` prefix). */
const NODE_BUILTINS = new Set(
  builtinModules.filter(m => !m.startsWith('_'))
    .flatMap(m => [m, `node:${m}`]),
);

/** How long the install may run before it is stopped. */
const INSTALL_TIMEOUT_MS = 120_000;

const DEV_DEPS = ['@astryxdesign/cli', '@astryxdesign/core'];

/**
 * Create or complete the package.json for an Astryx integration package,
 * then install the Astryx CLI and Core as dev dependencies.
 *
 * @param {IntegrationInitOptions} [options]
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<IntegrationInitResponse>}
 */
export async function integrationInit(options = {}, {cwd = process.cwd()} = {}) {
  const dir = path.resolve(cwd);
  const packageFile = path.join(dir, 'package.json');

  // Resolve the package name: explicit > existing > directory name.
  const dirName = path.basename(dir);
  const requestedName = options.name ?? null;

  const exists = fs.existsSync(packageFile);
  /** @type {Record<string, unknown>} */
  let pkg = {};
  /** @type {string} */
  let originalSource = '';
  if (exists) {
    try {
      originalSource = fs.readFileSync(packageFile, 'utf-8');
      const parsed = JSON.parse(originalSource);
      if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new AstryxError(
          `package.json must contain a JSON object, found ${parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed}.`,
          undefined,
          ERROR_CODES.ERR_INVALID_ARGUMENT,
        );
      }
      pkg = parsed;
    } catch (error) {
      if (error instanceof AstryxError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new AstryxError(
        `Cannot read package.json: ${message}`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }

  // FR3: never rename an existing package. A differing argument on an existing
  // package is an error naming both names; the same name is a no-op.
  // FR8: a non-string name in an existing package is invalid input.
  // A blank name ("", whitespace-only) counts as missing.
  if (exists && pkg.name !== undefined && typeof pkg.name !== 'string') {
    throw new AstryxError(
      `package.json name must be a string, found ${typeof pkg.name}.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const existingName = typeof pkg.name === 'string' && pkg.name.trim() !== '' ? pkg.name : undefined;
  const existingNamePresent = existingName !== undefined;
  if (exists && existingNamePresent && requestedName != null && existingName !== requestedName) {
    throw new AstryxError(
      `Package "${existingName}" already exists. Cannot rename to "${requestedName}".`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const name = requestedName ?? existingName ?? dirName;

  // Strict npm rules only for names init writes (new packages, a dir-name fallback,
  // or filling a blank name). When the name comes from the existing package.json
  // (whether directly or confirmed by a matching argument), the author's name is
  // accepted with legacy rules.
  const nameIsAuthored = !existingNamePresent;
  if (nameIsAuthored && NODE_BUILTINS.has(name)) {
    throw new AstryxError(
      `Invalid package name "${name}": "${name}" is a Node.js core module name. Choose a different name.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (nameIsAuthored && !isValidPackageName(name)) {
    throw new AstryxError(
      `Invalid package name "${name}": use at most ${PACKAGE_NAME_MAX_LENGTH} lowercase letters, digits, dots, underscores, and hyphens, starting with a letter or digit. Scoped names start with @scope/. "node_modules" and "favicon.ico" are reserved.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (!nameIsAuthored) {
    const existingNameReason = checkExistingName(name);
    if (existingNameReason) {
      throw new AstryxError(
        `Invalid package name "${name}": ${existingNameReason} (npm does not accept it for an existing package).`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }

  // Track which fields we add.
  /** @type {string[]} */
  const fieldsAdded = [];
  /** @type {string[]} */
  const notes = [];

  if (pkg.name == null || (typeof pkg.name === 'string' && pkg.name.trim() === '')) {
    pkg.name = name;
    fieldsAdded.push('name');
  }

  if (pkg.version == null) {
    pkg.version = '1.0.0';
    fieldsAdded.push('version');
  }

  // INV16: writers never create `exports` on an existing package. An empty
  // exports map makes every previously-open deep import private. Only a new
  // package.json (no file existed) gets `exports: {}`.
  if (!exists && pkg.exports == null) {
    pkg.exports = {};
    fieldsAdded.push('exports');
  } else if (exists && pkg.exports == null) {
    notes.push(
      'No exports map. Public subpaths from integration add need an exports map; adding one to a published package makes existing deep imports private.',
    );
  }

  const changed = fieldsAdded.length > 0;
  const dryRun = options.dryRun ?? false;
  const noInstall = options.noInstall ?? false;
  let installed = false;

  // Snapshot the original file content for rollback on install failure.
  const originalBytes = exists ? Buffer.from(originalSource) : null;

  if (!dryRun && changed) {
    const indent = originalSource
      ? (originalSource.match(/\n([ \t]+)"/u)?.[1] ?? '  ')
      : '  ';
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      packageFile,
      JSON.stringify(pkg, null, indent) + '\n',
    );
  }

  // Install dev dependencies: @astryxdesign/cli and @astryxdesign/core.
  // Skip when --dry-run, --no-install, or when both are declared AND installed.
  // Only undeclared packages are added (as dev dependencies); when every one
  // is declared, a plain install resolves them where they are. A declared
  // entry never moves between dependency fields.
  // Read the on-disk package.json for devDependencies (init may have just written it).
  const currentPkg = dryRun ? pkg : (() => {
    try { return JSON.parse(fs.readFileSync(packageFile, 'utf-8')); } catch { return pkg; }
  })();
  if (!dryRun && !noInstall && !devDepsSatisfied(dir, currentPkg)) {
    const pm = detectPackageManager(dir);
    const undeclared = DEV_DEPS.filter(dep => !isDeclared(currentPkg, dep));
    const argv = installArgv(pm, undeclared);
    logger.log(
      undeclared.length > 0
        ? `Installing ${undeclared.join(' and ')}...`
        : 'Installing declared dependencies...',
    );

    // npm, pnpm, and yarn are .cmd shims on Windows, which only a shell runs.
    // Node 24 prints DEP0190 when `shell: true` is combined with an args array,
    // so on Windows we pass one command string and no args.
    const isWin = process.platform === 'win32';
    const result = spawnSync(
      isWin ? argv.join(' ') : argv[0],
      isWin ? [] : argv.slice(1),
      {
        cwd: dir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {...process.env},
        timeout: INSTALL_TIMEOUT_MS,
        ...(isWin ? {shell: true} : {}),
      },
    );

    // cmd.exe exits 9009 when the command is not recognized: the package
    // manager never started, the same as a spawn error elsewhere.
    const notRecognized = isWin && result.status === 9009;
    if (result.error || result.status !== 0) {
      // Rollback: restore the original package.json so the failed install
      // does not leave behind a half-written package.
      rollbackPackageJson(packageFile, originalBytes);

      const stderr = result.stderr?.toString('utf-8')?.trim() ?? '';
      const errorCode = /** @type {NodeJS.ErrnoException | undefined} */ (result.error)?.code;
      const message =
        errorCode === 'ETIMEDOUT'
          ? `Dependency install timed out after ${INSTALL_TIMEOUT_MS / 1000} s (${argv.join(' ')}).${stderr ? '\n' + stderr : ''}`
          : result.error
            ? `${argv[0]} could not be started: ${errorCode ?? result.error.message}`
            : notRecognized
              ? `${argv[0]} could not be started: not recognized as a command (exit 9009).${stderr ? '\n' + stderr : ''}`
              : `Dependency install failed (exit ${result.status}).${stderr ? '\n' + stderr : ''}`;
      throw new AstryxError(
        message,
        undefined,
        ERROR_CODES.ERR_INSTALL_FAILED,
      );
    }
    installed = true;
    logger.log('Dependencies installed.');
  }

  // Log the package.json state only after the install succeeded (or was skipped).
  if (!dryRun && changed) {
    logger.log(`package.json ${exists ? 'updated' : 'created'}`);
  }

  return {
    type: 'integration.init',
    data: {
      name,
      packageCreated: !exists && changed,
      fieldsAdded,
      installed,
      dryRun,
      notes,
    },
  };
}

/**
 * Whether `name` is a package name npm accepts for a new package.
 * @param {string} name
 * @returns {boolean}
 */
function isValidPackageName(name) {
  return (
    typeof name === 'string' &&
    name.length <= PACKAGE_NAME_MAX_LENGTH &&
    !RESERVED_PACKAGE_NAMES.has(name) &&
    !NODE_BUILTINS.has(name) &&
    PACKAGE_NAME_RE.test(name)
  );
}

const SCOPED_NAME = /^(?:@([^/]+?)[/])?([^/]+?)$/;

/**
 * Whether `name` is acceptable for an existing package npm already published,
 * mirroring `validate-npm-package-name` 7.0.2 validForOldPackages.
 * Returns null when valid, or a reason string when invalid.
 * @param {string} name
 * @returns {string | null}
 */
function checkExistingName(name) {
  if (typeof name !== 'string' || name.length === 0) return 'is empty';
  if (/^[._-]/.test(name)) return 'cannot start with a period, underscore, or hyphen';
  if (name.trim() !== name) return 'has leading or trailing spaces';
  if (RESERVED_PACKAGE_NAMES.has(name.toLowerCase())) return 'is a reserved name';
  if (encodeURIComponent(name) === name) return null;
  const m = name.match(SCOPED_NAME);
  if (!m || m[1] === undefined) {
    return /^@[^/]*\/[^/]*\//.test(name) ? 'has more than one "/"' : 'contains characters that are not URL-safe';
  }
  const [, scope, pkg] = m;
  if (pkg.startsWith('.')) return 'scoped package name cannot start with a period';
  if (encodeURIComponent(scope) !== scope || encodeURIComponent(pkg) !== pkg) {
    return 'contains characters that are not URL-safe';
  }
  return null;
}

/**
 * Whether `dep` is declared in any of `dependencies`, `devDependencies`, or
 * `optionalDependencies`.
 * @param {Record<string, unknown>} pkg
 * @param {string} dep
 * @returns {boolean}
 */
function isDeclared(pkg, dep) {
  for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    const obj = pkg[field];
    if (typeof obj === 'object' && obj != null && Object.hasOwn(obj, dep)) return true;
  }
  return false;
}

/**
 * Check whether the required dev dependencies are both declared (in
 * dependencies, devDependencies, or optionalDependencies) and installed
 * (resolvable from the package's own or an ancestor node_modules, not
 * NODE_PATH or global folders). Installed but undeclared still triggers the
 * install step, which adds the declaration.
 * @param {string} dir
 * @param {Record<string, unknown>} pkg
 * @returns {boolean}
 */
function devDepsSatisfied(dir, pkg) {
  return DEV_DEPS.every(dep =>
    isDeclared(pkg, dep) && resolveInstalledPackageJson(dir, dep) != null,
  );
}

/**
 * Rollback package.json to its original state after a failed install.
 * @param {string} packageFile
 * @param {Buffer | null} originalBytes
 */
function rollbackPackageJson(packageFile, originalBytes) {
  try {
    if (originalBytes == null) {
      // We created it — remove it.
      fs.rmSync(packageFile, {force: true});
    } else {
      fs.writeFileSync(packageFile, originalBytes);
    }
  } catch {
    // Best effort — the install error is the actionable failure.
  }
}

/**
 * Build the install argv for the detected package manager. With packages to
 * add, they are added as dev dependencies; with none (every one is already
 * declared), it is a plain install that resolves what package.json declares,
 * leaving each declaration in the field it is in.
 * @param {import('../../foundation/env/package-manager.mjs').DetectedPackageManager} pm
 * @param {string[]} packages undeclared packages to add as dev dependencies
 * @returns {string[]}
 */
function installArgv(pm, packages) {
  const add = packages.length > 0;
  switch (pm) {
    case 'yarn':
      return add ? ['yarn', 'add', '-D', ...packages] : ['yarn', 'install'];
    case 'pnpm':
      return add ? ['pnpm', 'add', '-D', ...packages] : ['pnpm', 'install'];
    case 'bun':
      return add ? ['bun', 'add', '-D', ...packages] : ['bun', 'install'];
    case 'npm':
    default:
      return add ? ['npm', 'install', '--save-dev', ...packages] : ['npm', 'install'];
  }
}
