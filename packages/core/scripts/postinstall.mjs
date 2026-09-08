// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file @astryxdesign/core postinstall — nudge to run `npx @astryxdesign/cli init`.
 *
 * Enforcement layer 1 of making `astryx init` foolproof: when the design system
 * is installed and the project hasn't run init yet, print a one-line next-step
 * so agents/humans discover it (this is the most common fresh-install entry).
 *
 * ONE authoritative source. Core is a separate package and cannot import the CLI
 * (the CLI peer-depends on core, so importing it would be a cycle), so it ships
 * ./agent-doc-state.mjs — a GENERATED, byte-for-byte copy of the CLI's
 * dependency-free leaf packages/cli/foundation/agent-docs/agent-doc-state.mjs.
 * `pnpm check:setup-contract` (inside `pnpm check:repo`) fails the build if the
 * two differ, and also fails if core stops publishing the copy. The paths,
 * markers, predicate and nudge decision therefore cannot drift between layers.
 *
 * Non-interactive, never fails the install, and quiet in the monorepo build,
 * during npx's fetch, and once set up.
 */

import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = fileURLToPath(import.meta.url);

/**
 * Load the generated contract copy. Dynamic, not static, so a packaging mistake
 * degrades to "no nudge" instead of throwing out of module evaluation and
 * failing a consumer's install — the one thing this script must never do.
 * @returns {Promise<object|null>}
 */
async function loadContract() {
  try {
    return await import('./agent-doc-state.mjs');
  } catch {
    return null;
  }
}

async function main() {
  const contract = await loadContract();
  if (!contract) return;
  const root = process.env.INIT_CWD || process.cwd();
  if (
    contract.shouldNudge({
      scriptPath: HERE,
      npmCommand: process.env.npm_command,
      isSetUp: contract.isAstryxInitialized(root),
    })
  ) {
    process.stdout.write(contract.SETUP_NUDGE);
  }
}

// Run only when executed directly (`node scripts/postinstall.mjs`), never when
// imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main()
    .catch(() => {}) // never break an install
    .finally(() => process.exit(0));
}
