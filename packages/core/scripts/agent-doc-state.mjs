// Copyright (c) Meta Platforms, Inc. and affiliates.

// GENERATED FILE — DO NOT EDIT.
// Source:     packages/cli/foundation/agent-docs/agent-doc-state.mjs
// Regenerate: pnpm generate:setup-contract
//
// @astryxdesign/core cannot import @astryxdesign/cli (the CLI peer-depends on
// core, so the import would be a cycle), but core's postinstall must answer
// "is Astryx set up?" exactly as the CLI does. The CLI's dependency-free leaf is
// therefore copied here verbatim and pinned by `pnpm check:setup-contract`,
// which runs inside `pnpm check:repo`.

/**
 * @file agent-doc-state — the canonical, dependency-free contract for "where
 * Astryx writes its agent block" and "has this project run init yet?".
 *
 * Deliberately a LEAF module: it imports only node builtins (`fs`, `path`), so
 * it is safe to load in constrained contexts — most importantly the CLI's
 * `postinstall` script, which runs at `npm install` time, before the rest of the
 * CLI's module graph is guaranteed importable. Its sibling `agent-docs.mjs`
 * reaches component discovery, package-manager detection, and the response
 * layer, so the pure setup-check lives HERE and `agent-docs.mjs` re-exports it.
 *
 * SINGLE SOURCE OF TRUTH for every "is Astryx set up?" enforcement layer:
 *   - layer 3 — the per-command setup nudge (`clients/cli/index.mjs`),
 *   - layer 2 — the CLI postinstall nudge (`scripts/postinstall.mjs`),
 *   - the `init` / `upgrade` / `agent-docs` commands (via `agent-docs.mjs`).
 * Core's postinstall (layer 1) is a separate published package and cannot import
 * the CLI, so it ships a package-local copy at
 * `packages/core/scripts/agent-doc-state.mjs`. That copy is GENERATED from this
 * file, byte for byte, by `scripts/generate-setup-contract.mjs`, and
 * `pnpm check:setup-contract` (part of `check:repo`) fails the build when the
 * two differ. Edit the contract HERE and nowhere else.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export const AGENTS_MD = 'AGENTS.md';
export const CLAUDE_MD = 'CLAUDE.md';
export const CLAUDE_DIR_MD = '.claude/CLAUDE.md'; // cross-platform literal
export const CURSOR_RULES = '.cursorrules';
export const HERMES_DOT_MD = '.hermes.md';
export const HERMES_MD = 'HERMES.md';

export const MARKER_START = '<!-- ASTRYX:START -->';
export const MARKER_END = '<!-- ASTRYX:END -->';
// Legacy markers — read during migration so the script finds existing XDS blocks
export const LEGACY_MARKER_START = '<!-- XDS:START -->';
export const LEGACY_MARKER_END = '<!-- XDS:END -->';

/**
 * The canonical set of EVERY location an --agent preset (or the default) can
 * write the Astryx block. SINGLE SOURCE OF TRUTH: discovery, removal, and the
 * `isAstryxInitialized` predicate all derive from this list, so "where init
 * writes" and "where we look" can never drift. (Explicit --agent-docs-path
 * targets are user-chosen and not enumerable here.)
 */
export const AGENT_DOC_PATHS = [
  AGENTS_MD, // Codex / ChatGPT / generic
  CLAUDE_MD, // Claude Code (root)
  CLAUDE_DIR_MD, // Claude Code (.claude/CLAUDE.md)
  CURSOR_RULES, // Cursor
  HERMES_DOT_MD, // Hermes
  HERMES_MD, // Hermes
];

/**
 * Markers whose presence means an Astryx block has been installed — the current
 * marker plus the legacy XDS one, so pre-rename projects still count as set up.
 */
export const INIT_MARKERS = [MARKER_START, LEGACY_MARKER_START];

/**
 * Find all existing agent doc files in a directory, across EVERY location any
 * preset can write (see {@link AGENT_DOC_PATHS}: AGENTS.md, CLAUDE.md,
 * .claude/CLAUDE.md, .cursorrules, .hermes.md, HERMES.md).
 * @param {string} targetDir
 * @returns {string[]} Relative paths of existing agent doc files
 */
export function discoverAgentDocs(targetDir) {
  return AGENT_DOC_PATHS.filter(p => fs.existsSync(path.join(targetDir, p)));
}

/**
 * Single source of truth for "is Astryx set up in this project?" — true when any
 * agent-doc file already carries the Astryx marker, i.e. `init` / `agent-docs`
 * has run. Reused by the init & upgrade commands, the per-command setup nudge
 * (enforcement layer 3), and the cli postinstall nudge (layer 2). Core's
 * postinstall (separate package, layer 1) mirrors the same marker contract.
 *
 * @param {string} [targetDir=process.cwd()]
 * @returns {boolean}
 */
export function isAstryxInitialized(targetDir = process.cwd()) {
  for (const rel of discoverAgentDocs(targetDir)) {
    try {
      const content = fs.readFileSync(path.join(targetDir, rel), 'utf-8');
      if (INIT_MARKERS.some(m => content.includes(m))) {
        return true;
      }
    } catch {
      // Unreadable file — ignore and keep checking the others.
    }
  }
  return false;
}

/**
 * The one-line next-step both postinstall nudges print. Kept here so layer 1
 * (core) and layer 2 (cli) can never word it differently.
 *
 * Scoped package form (`@astryxdesign/cli`) — always resolves to us, even before
 * the CLI is installed. Bare `npx astryx` would fetch an unrelated look-alike
 * package (see PR #4151).
 */
export const SETUP_NUDGE =
  '\nNext step: run `npx @astryxdesign/cli init` to finish setup and install the Astryx agent prompt.\n\n';

/**
 * Pure decision: should a postinstall print the setup nudge? Shared by BOTH
 * postinstall layers, so the matrix cannot drift between them, and unit-testable
 * without an actual npm install.
 *
 * @param {object} [opts]
 * @param {string} [opts.scriptPath] - Absolute path of the calling script
 *   (location tells us dependency vs monorepo vs npx-cache).
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
