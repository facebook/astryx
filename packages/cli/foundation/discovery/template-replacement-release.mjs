// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Release gate for integration template replacement selection.
 *
 * The 0.6.x line reads and validates the future `replaces` declaration so
 * integration authors can prepare, but the accepted contract does not activate
 * replacement selection until CLI 0.7.0. Reading this package's own version
 * makes the release version bump the activation point instead of a separate
 * mutable flag.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {semverCompare} from '../env/semver.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';
import {TEMPLATE_REPLACEMENT_CLI} from '../integrations/cli-requirement.mjs';

const CLI_VERSION = JSON.parse(
  fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'),
).version;

/**
 * Whether this CLI release activates integration template replacements.
 * The optional version is dependency injection for release-boundary tests.
 *
 * @param {string} [version]
 * @returns {boolean}
 */
export function templateReplacementsActive(version = CLI_VERSION) {
  return semverCompare(version, TEMPLATE_REPLACEMENT_CLI) >= 0;
}
