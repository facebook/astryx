// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file @astryxdesign/core postinstall — nudge to run `npx @astryxdesign/cli init`.
 *
 * Enforcement layer 1 of making `astryx init` foolproof: when the design system
 * is installed and the project hasn't run init yet, print a one-line next-step
 * so agents/humans discover it (this is the most common fresh-install entry).
 *
 * Self-contained: core is a separate package and cannot import the CLI, so the
 * agent-doc locations + marker below intentionally DUPLICATE the CLI's agent-doc
 * discovery in packages/cli/src/commands/agent-docs.mjs — keep them aligned with
 * that file. The .hermes.md / HERMES.md entries are an intentional superset (the
 * CLI writes those via `--agent hermes`). Non-interactive, never fails the
 * install, and quiet in the monorepo build, during npx's fetch, and once set up.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = fileURLToPath(import.meta.url);

// Duplicates the CLI's agent-doc locations + markers — keep aligned with
// packages/cli/src/commands/agent-docs.mjs. Hermes files are an intentional superset.
const AGENT_DOC_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  '.claude/CLAUDE.md',
  '.cursorrules',
  '.hermes.md',
  'HERMES.md',
];
const MARKERS = ['<!-- ASTRYX:START -->', '<!-- XDS:START -->'];

/**
 * True when the project already has the Astryx agent prompt installed (an Astryx
 * marker is present in any agent-doc file) — the same check the CLI performs.
 * @param {string} root @returns {boolean}
 */
export function isAstryxInitialized(root) {
  for (const rel of AGENT_DOC_PATHS) {
    try {
      const content = fs.readFileSync(path.join(root, rel), 'utf-8');
      if (MARKERS.some(m => content.includes(m))) return true;
    } catch {
      // Unreadable/missing — keep checking the others.
    }
  }
  return false;
}

/**
 * Pure decision: should the postinstall print the setup nudge? Unit-testable
 * without an actual npm install.
 * @returns {boolean}
 */
export function shouldNudge({scriptPath, npmCommand, isSetUp} = {}) {
  if (!scriptPath || !scriptPath.includes('node_modules')) return false; // monorepo/source build
  if (scriptPath.includes('_npx') || npmCommand === 'exec') return false; // npx transient
  if (isSetUp) return false; // already set up — stay quiet
  return true;
}

function main() {
  const root = process.env.INIT_CWD || process.cwd();
  if (
    shouldNudge({
      scriptPath: HERE,
      npmCommand: process.env.npm_command,
      isSetUp: isAstryxInitialized(root),
    })
  ) {
    // Scoped package form (`@astryxdesign/cli`) — always resolves to us, even
    // before the CLI is installed. Bare `npx astryx` would fetch an unrelated
    // look-alike package (see PR #4151). After that lands, switch this to its
    // getCliInvocation() single source of truth.
    process.stdout.write(
      '\nNext step: run `npx @astryxdesign/cli init` to finish setup and install the Astryx agent prompt.\n\n',
    );
  }
}

// Run only when executed directly (`node scripts/postinstall.mjs`), never when
// imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  try {
    main();
  } catch {
    // never break an install
  }
  process.exit(0);
}
