// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file @astryxdesign/cli postinstall — nudge to run `astryx init`.
 *
 * Enforcement layer 2 of making `astryx init` foolproof: when the CLI is
 * installed as a project dependency and the project hasn't run init yet, print a
 * one-line next-step so agents/humans discover it.
 *
 * Reuses the ONE setup check (isAstryxInitialized from agent-docs.mjs — a
 * dep-free import chain, safe at install time). Non-interactive, never fails the
 * install, and stays quiet:
 *   - in the monorepo/source build (not under node_modules),
 *   - during npx's transient fetch (npx runs the bin — likely `init` — right
 *     after, so nudging here would double up), and
 *   - once setup is already done.
 */

import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = fileURLToPath(import.meta.url);

/**
 * Pure decision: should the postinstall print the setup nudge? Split out so the
 * matrix is unit-testable without an actual npm install.
 *
 * @param {object} [opts]
 * @param {string} [opts.scriptPath] - Absolute path of this script (location tells
 *   us dependency vs monorepo vs npx-cache).
 * @param {string} [opts.npmCommand] - process.env.npm_command ('install', 'exec', …).
 * @param {boolean} [opts.isSetUp] - Whether the project already ran init.
 * @returns {boolean}
 */
export function shouldNudge({scriptPath, npmCommand, isSetUp} = {}) {
  if (!scriptPath || !scriptPath.includes('node_modules')) return false; // monorepo/source build
  if (scriptPath.includes('_npx') || npmCommand === 'exec') return false; // npx transient — init runs next
  if (isSetUp) return false; // already set up — stay quiet
  return true;
}

/** @param {string} root @returns {Promise<boolean>} */
async function projectIsSetUp(root) {
  try {
    const {isAstryxInitialized} = await import('../lib/agent-docs/agent-docs.mjs');
    return isAstryxInitialized(root);
  } catch {
    return false; // best-effort — if the check can't load, fall through and nudge
  }
}

async function main() {
  const root = process.env.INIT_CWD || process.cwd();
  const nudge = shouldNudge({
    scriptPath: HERE,
    npmCommand: process.env.npm_command,
    isSetUp: await projectIsSetUp(root),
  });
  if (nudge) {
    // Scoped package form (`@astryxdesign/cli`) — always resolves to us. Bare
    // `npx astryx` would fetch an unrelated look-alike package (see PR #4151).
    // After that lands, switch this to its getCliInvocation() single source of truth.
    process.stdout.write(
      '\nNext step: run `npx @astryxdesign/cli init` to finish setup and install the Astryx agent prompt.\n\n',
    );
  }
}

// Run only when executed directly (`node scripts/postinstall.mjs`), never when
// imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main()
    .catch(() => {})
    .finally(() => process.exit(0));
}
