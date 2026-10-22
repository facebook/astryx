// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Warn when the running CLI is outside an integration's declared peer
 * range.
 *
 * An integration published against a newer CLI declares
 * `"@astryxdesign/cli": ">=X.Y.Z"` in peerDependencies. When the running CLI
 * does not satisfy that range, the integration's newer contributions may not
 * load correctly. This module detects that mismatch and says why, naming the
 * package, the range, the running version, and what to do.
 *
 * @input A loaded integration (with __packageDir) and the running CLI version.
 * @output The message, or null when the CLI is inside the range.
 * @position foundation/integrations — read by validate-contributions, which
 *   reports it as a listed `cli_peer_version` finding: a note in
 *   `doctor integration validate` and `integration check`, never a warning,
 *   so it fails nothing (architecture:cli-surface INV35).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {satisfiesRange, semverCompare} from '../env/semver.mjs';
import {detectPackageManager} from '../env/package-manager.mjs';
import {CLI_PACKAGE, lowestAdmitted} from './cli-requirement.mjs';

/** The command that adds a package, by package manager. */
const ADD_VERB = /** @type {Record<string, string>} */ ({
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  bun: 'bun add',
  npm: 'npm install',
});

/**
 * Read the CLI's own version from its package.json.
 * @returns {string}
 */
function readCliVersion() {
  const cliPkg = path.resolve(import.meta.dirname, '..', '..', 'package.json');
  return JSON.parse(fs.readFileSync(cliPkg, 'utf8')).version;
}

/** Cached CLI version, read once. @type {string | undefined} */
let _cliVersion;

/**
 * The running CLI version.
 * @returns {string}
 */
export function cliVersion() {
  if (_cliVersion == null) _cliVersion = readCliVersion();
  return _cliVersion;
}

/**
 * Why the running CLI is outside an integration's declared
 * `@astryxdesign/cli` peer range, or null when it is inside it (or when no
 * peer is declared or the package.json cannot be read).
 *
 * A CLI below the range is told to upgrade, with the project's own install
 * command. A CLI above it (the range has an upper bound, such as `^0.6.0`) is
 * told the package was published for older CLIs, since upgrading the CLI
 * cannot help there.
 *
 * @param {import('./integrations.mjs').LoadedIntegration} integration
 * @param {string} [version] the running CLI version; defaults to this CLI's
 *   own package.json version
 * @param {string} [cwd] where the install command would run; decides the
 *   package manager it names
 * @returns {string | null}
 */
export function cliPeerVersionProblem(integration, version, cwd = process.cwd()) {
  const ver = version ?? cliVersion();
  if (!integration.__packageDir) return null;

  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(integration.__packageDir, 'package.json'), 'utf8'),
    );
  } catch {
    return null;
  }

  const range = pkg?.peerDependencies?.[CLI_PACKAGE];
  if (typeof range !== 'string') return null;
  if (satisfiesRange(ver, range)) return null;

  const name = integration.name ?? pkg.name ?? '(integration)';
  const lowest = lowestAdmitted(range);
  if (lowest != null && semverCompare(ver, lowest) < 0) {
    const verb = ADD_VERB[detectPackageManager(cwd)] ?? ADD_VERB.npm;
    return (
      `${name} needs ${CLI_PACKAGE} ${range}, but this CLI is ${ver}, so ` +
      `some of what it ships may not load. Upgrade the CLI: ` +
      `\`${verb} ${CLI_PACKAGE}@latest\`.`
    );
  }
  return (
    `${name} supports ${CLI_PACKAGE} ${range}, but this CLI is ${ver}, ` +
    `outside that range, so some of what it ships may not work as its ` +
    `author tested. Look for a release of ${name} that supports ${ver}.`
  );
}
