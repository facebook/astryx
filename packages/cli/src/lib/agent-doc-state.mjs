// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file agent-doc-state — the canonical, dependency-free contract for "where
 * Astryx writes its agent block" and "has this project run init yet?".
 *
 * Deliberately a LEAF module: it imports only node builtins (`fs`, `path`), so
 * it is safe to load in constrained contexts — most importantly the CLI's
 * `postinstall` script, which runs at `npm install` time, before the rest of the
 * CLI's module graph (commander, jscodeshift, …) is guaranteed importable. That
 * is why the pure setup-check lives HERE and not in the command-heavy
 * `commands/agent-docs.mjs` (which re-exports from this file).
 *
 * SINGLE SOURCE OF TRUTH for every "is Astryx set up?" enforcement layer:
 *   - layer 3 — the per-command setup nudge (`src/index.mjs`),
 *   - layer 2 — the CLI postinstall nudge (`scripts/postinstall.mjs`),
 *   - the `init` / `upgrade` / `agent-docs` commands (via `agent-docs.mjs`).
 * Core's postinstall (layer 1) is a separate published package and cannot import
 * the CLI, so it keeps a hand-mirror of {@link AGENT_DOC_PATHS} + the markers,
 * pinned to this file by a drift test (`packages/core/src/postinstall.test.mjs`).
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
// Legacy markers — read during migration so the script finds existing XDS blocks.
export const LEGACY_MARKER_START = '<!-- XDS:START -->';
export const LEGACY_MARKER_END = '<!-- XDS:END -->';

/**
 * The canonical set of EVERY location an `--agent` preset (or the default) can
 * write the Astryx block. SINGLE SOURCE OF TRUTH: discovery, removal, and the
 * {@link isAstryxInitialized} predicate all derive from this list, so "where
 * init writes" and "where we look" can never drift. (Explicit
 * `--agent-docs-path` targets are user-chosen and not enumerable here.)
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
 * marker plus the legacy XDS one (so pre-rename projects still count as set up).
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
 * agent-doc file already carries an Astryx marker, i.e. `init` / `agent-docs`
 * has run. Reused by the init & upgrade commands, the per-command setup nudge
 * (enforcement layer 3), and the CLI postinstall nudge (layer 2). Core's
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
