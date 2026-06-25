// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Check for newer @astryxdesign/core versions via local signals.
 *
 * Resolution order:
 * 1. $ASTRYX_LATEST_VERSION env var (set by previous CLI invocation)
 * 2. xds.versionFile in consumer's package.json (e.g. ../../libs/xds-common/LATEST_VERSION)
 * 3. If neither: no hint (no network calls from this module)
 *
 * When a newer version is detected, returns a hint string for CLI output.
 * Also sets $ASTRYX_LATEST_VERSION for subsequent commands in the same shell.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {semverGt} from './semver.mjs';

/**
 * Read the latest available version from local signals.
 * No network calls — purely filesystem and env var checks.
 *
 * @param {string} [cwd] - Project directory (default: process.cwd())
 * @returns {string|null} Latest version string, or null if unknown
 */
export function getLatestVersion(cwd = process.cwd()) {
  // 1. Check env var (fastest — set by previous CLI run)
  const envVersion = process.env.ASTRYX_LATEST_VERSION;
  if (envVersion && /^\d+\.\d+\.\d+/.test(envVersion)) {
    return envVersion;
  }

  // 2. Check versionFile from package.json config
  try {
    const pkgPath = path.resolve(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const versionFile = pkg.astryx?.versionFile;

      if (versionFile) {
        const filePath = path.resolve(cwd, versionFile);
        if (fs.existsSync(filePath)) {
          const version = fs.readFileSync(filePath, 'utf-8').trim();
          if (/^\d+\.\d+\.\d+/.test(version)) {
            return version;
          }
        }
      }
    }
  } catch {
    // Silently fail — version check should never break the CLI
  }

  return null;
}

/**
 * Get the currently installed @astryxdesign/core version from the consumer's package.json.
 *
 * @param {string} [cwd] - Project directory
 * @returns {string|null} Installed version, or null
 */
export function getInstalledVersion(cwd = process.cwd()) {
  try {
    const pkgPath = path.resolve(cwd, 'package.json');
    if (!fs.existsSync(pkgPath)) return null;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    const version = deps['@astryxdesign/core'];
    if (!version) return null;

    // Strip semver range prefix
    return version.replace(/^[^\d]*/, '');
  } catch {
    return null;
  }
}

/**
 * Check for available updates and return a hint string if one exists.
 * Also sets $ASTRYX_LATEST_VERSION env var for subsequent commands.
 *
 * @param {string} [cwd] - Project directory
 * @returns {string|null} FYI hint string, or null if up to date / unknown
 */
export function checkForUpdate(cwd = process.cwd()) {
  const latest = getLatestVersion(cwd);
  if (!latest) return null;

  // Persist for subsequent commands in this shell session
  process.env.ASTRYX_LATEST_VERSION = latest;

  const installed = getInstalledVersion(cwd);
  if (!installed) return null;

  // Use semver-aware comparison so '0.0.20' is correctly treated as greater
  // than '0.0.5' (lexicographic compare gets that backwards).
  if (semverGt(latest, installed)) {
    return `FYI: A newer version of @astryxdesign/core (${latest}) is available. You can upgrade with: astryx upgrade --apply --to ${latest}`;
  }

  return null;
}
