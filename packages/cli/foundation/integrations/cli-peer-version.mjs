// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Warn when the running CLI is outside an integration's declared peer
 * range.
 *
 * An integration published against a newer CLI declares
 * `"@astryxdesign/cli": ">=X.Y.Z"` in peerDependencies. When the running CLI
 * does not satisfy that range, the integration's newer contributions may not
 * load correctly. This module detects that mismatch and returns a warning —
 * never an error, and never a changed exit code — naming the package, the
 * required range, the running version, and the upgrade command.
 *
 * @input A loaded integration (with __packageDir) and the running CLI version.
 * @output A warning issue when the CLI is outside the peer range, or null.
 * @position foundation/integrations — read by validate-contributions (doctor)
 *   and integration-warnings (everyday commands).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {satisfiesRange} from '../env/semver.mjs';

const CLI_PACKAGE = '@astryxdesign/cli';

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
 * Check whether the running CLI satisfies an integration's declared
 * `@astryxdesign/cli` peer range. Returns a warning-severity issue when it
 * does not, or null when it does (or when no peer is declared).
 *
 * @param {import('./integrations.mjs').LoadedIntegration} integration
 * @param {string} [version] the running CLI version; defaults to this CLI's
 *   own package.json version
 * @returns {import('./issue').AstryxIntegrationIssue | null}
 */
export function checkCliPeerVersion(integration, version) {
  const ver = version ?? cliVersion();
  const pkgJsonPath = integration.__packageDir
    ? path.join(integration.__packageDir, 'package.json')
    : null;
  if (!pkgJsonPath) return null;

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  } catch {
    return null;
  }

  const range = pkg?.peerDependencies?.[CLI_PACKAGE];
  if (typeof range !== 'string') return null;
  if (satisfiesRange(ver, range)) return null;

  const name = integration.name ?? pkg.name ?? '(integration)';
  return {
    code: 'cli_peer_version',
    severity: 'warning',
    message:
      `${name} needs ${CLI_PACKAGE} ${range}, but this project has ${ver}. ` +
      `Run: npm install ${CLI_PACKAGE}@latest`,
  };
}
