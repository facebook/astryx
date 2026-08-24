// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file agent-docs — Install/update agent docs for AI coding tools
 *
 * Generates a CLI cheat sheet from actual command metadata and injects
 * it into agent doc files. Supports multiple tools with auto-detection:
 *
 * - Claude Code: CLAUDE.md (root) or .claude/CLAUDE.md
 * - Cursor: .cursorrules
 * - Codex/generic: AGENTS.md
 * - Hermes Agent: .hermes.md or HERMES.md (existing), else AGENTS.md
 *
 * Auto-detect: discovers existing files and updates them in place.
 * Default (no existing files): creates AGENTS.md (the tool-agnostic standard).
 *
 * --agent <tool>: target a specific tool preset (claude, cursor, codex, hermes, all)
 * --agent-docs-path <path>: explicit file path(s)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, CLI_ROOT} from '../fs/paths.mjs';
import {assertWithin} from '../fs/path-safety.mjs';
import {getCliInvocation} from '../env/package-manager.mjs';
import {discoverComponents} from '../discovery/component-discovery.mjs';
import {humanLog} from '../response/json.mjs';

const AGENTS_MD = 'AGENTS.md';
const CLAUDE_MD = 'CLAUDE.md';
const CLAUDE_DIR_MD = '.claude/CLAUDE.md'; // cross-platform literal
const CURSOR_RULES = '.cursorrules';
const HERMES_DOT_MD = '.hermes.md';
const HERMES_MD = 'HERMES.md';


const MARKER_START = '<!-- ASTRYX:START -->';
const MARKER_END = '<!-- ASTRYX:END -->';
// Legacy markers — read during migration so the script finds existing XDS blocks
const LEGACY_MARKER_START = '<!-- XDS:START -->';
const LEGACY_MARKER_END = '<!-- XDS:END -->';

/**
 * Locate the single well-formed managed block in `content`.
 *
 * A naive `indexOf(START)` + `indexOf(END)` corrupts user content on malformed
 * input: an END that appears before START makes the slice boundaries overlap
 * (duplicating text), and a stray START with no END silently looks like "no
 * block" so a fresh block gets appended below the broken one. This searches for
 * END strictly *after* START (so the boundaries can never cross) and refuses to
 * touch a file that has more than one START of the same kind — better to ask the
 * user to fix an ambiguous file than to guess and drop their content.
 *
 * @param {string} content
 * @returns {{start: number, end: number} | null} start = index of START marker;
 *   end = index just past the END marker. null when there is no block. Throws on
 *   an ambiguous file (duplicate/nested START markers).
 */
function findManagedBlock(content) {
  for (const [start, end] of [
    [MARKER_START, MARKER_END],
    [LEGACY_MARKER_START, LEGACY_MARKER_END],
  ]) {
    const startIdx = content.indexOf(start);
    if (startIdx === -1) continue;
    // Search for END after START so end > start is guaranteed.
    const endIdx = content.indexOf(end, startIdx + start.length);
    if (endIdx === -1) continue; // START without a matching END → treat as no block
    // A second START of the same kind means the file is ambiguous (duplicate or
    // nested block). Refuse rather than orphan/mangle content.
    if (content.indexOf(start, startIdx + start.length) !== -1) {
      throw new Error(
        `Malformed agent-docs block: multiple "${start}" markers found. ` +
          `Remove the duplicate/broken block manually, then re-run.`,
      );
    }
    return {start: startIdx, end: endIdx + end.length};
  }
  return null;
}

/**
 * Agent tool presets — maps tool names to their file search paths.
 * Order matters: first existing file wins, last entry is the default (created if none exist).
 */
const AGENT_PRESETS = {
  claude: [CLAUDE_MD, CLAUDE_DIR_MD],
  cursor: [CURSOR_RULES, AGENTS_MD],
  codex: [AGENTS_MD],
  hermes: [HERMES_DOT_MD, HERMES_MD, AGENTS_MD],
};

/**
 * The canonical set of EVERY location an --agent preset (or the default) can
 * write the Astryx block. SINGLE SOURCE OF TRUTH: discovery, removal, and the
 * `isAstryxInitialized` predicate all derive from this list, so "where init
 * writes" and "where we look" can never drift. (Explicit --agent-docs-path
 * targets are user-chosen and not enumerable here.)
 */
const AGENT_DOC_PATHS = [
  AGENTS_MD, // Codex / ChatGPT / generic
  CLAUDE_MD, // Claude Code (root)
  CLAUDE_DIR_MD, // Claude Code (.claude/CLAUDE.md)
  CURSOR_RULES, // Cursor
  HERMES_DOT_MD, // Hermes
  HERMES_MD, // Hermes
];

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
      if (content.includes(MARKER_START) || content.includes(LEGACY_MARKER_START)) {
        return true;
      }
    } catch {
      // Unreadable file — ignore and keep checking the others.
    }
  }
  return false;
}

/**
 * Parse the Astryx version a managed block was generated for, from its header
 * line ("Astryx v1.2.3 · N components"). Returns null when the block predates
 * the versioned header (e.g. a legacy XDS block) or has no header at all.
 *
 * @param {string} content File contents, or just the block text.
 * @returns {string|null}
 */
export function parseBlockVersion(content) {
  const match = /Astryx v(\d+\.\d+\.\d+[^\s·]*)/.exec(content ?? '');
  return match ? match[1] : null;
}

/**
 * Read-only staleness assessment of the managed agent-docs block(s) against the
 * installed core version. This is the detection half of the `astryx upgrade`
 * agent-docs refresh: it never writes, so `upgrade` can run it on EVERY path —
 * including the up-to-date / no-codemods short-circuits — and decide whether to
 * rewrite a stale block, nudge an uninitialized repo, or stay silent.
 *
 * A managed block is:
 * - `stale`   — it carries a legacy XDS marker, has no parseable version, or
 *               records a version other than the installed one.
 * - `current` — every managed block already matches the installed version.
 * And the project is `missing` when no managed block exists anywhere (the repo
 * has agent-doc files without our markers, or none at all — i.e. never `init`ed).
 *
 * @param {string} targetDir
 * @param {string} [installedVersion] Defaults to the installed core version.
 * @returns {{
 *   installedVersion: string,
 *   status: 'missing' | 'stale' | 'current',
 *   files: Array<{path: string, blockVersion: string|null, legacy: boolean, stale: boolean}>,
 *   staleFiles: string[],
 *   blockVersions: string[],
 * }}
 */
export function inspectAgentDocs(targetDir, installedVersion) {
  const version = installedVersion ?? getXdsVersion(findCoreDir(targetDir));
  /** @type {Array<{path: string, blockVersion: string|null, legacy: boolean, stale: boolean}>} */
  const files = [];

  for (const rel of discoverAgentDocs(targetDir)) {
    /** @type {string} */
    let content;
    try {
      content = fs.readFileSync(path.join(targetDir, rel), 'utf-8');
    } catch {
      continue; // Unreadable — treat as absent.
    }
    const hasNew = content.includes(MARKER_START);
    const hasLegacy = content.includes(LEGACY_MARKER_START);
    if (!hasNew && !hasLegacy) continue; // Not a block we manage.

    const legacy = !hasNew && hasLegacy;
    const blockVersion = parseBlockVersion(content);
    const stale = legacy || blockVersion == null || blockVersion !== version;
    files.push({path: rel, blockVersion, legacy, stale});
  }

  const staleEntries = files.filter(f => f.stale);
  const staleFiles = staleEntries.map(f => f.path);
  const blockVersions = [
    ...new Set(staleEntries.map(f => f.blockVersion).filter(/** @returns {v is string} */ (v) => v != null)),
  ];

  /** @type {'missing' | 'stale' | 'current'} */
  let status;
  if (files.length === 0) status = 'missing';
  else if (staleFiles.length > 0) status = 'stale';
  else status = 'current';

  return {installedVersion: version, status, files, staleFiles, blockVersions};
}

/**
 * Resolve which file(s) to write for a given agent tool preset.
 * Searches for existing files first, falls back to default creation path.
 *
 * @param {string} targetDir
 * @param {string} agent - Preset name: 'claude', 'cursor', 'codex', 'hermes', 'all'
 * @returns {{inject: string[], create: string[]}} Files to inject into vs create fresh
 */
export function resolveAgentPaths(targetDir, agent) {
  if (agent === 'all') {
    // Inject into all existing files, create defaults for each tool
    const existing = discoverAgentDocs(targetDir);
    if (existing.length > 0) {
      return {inject: existing, create: []};
    }
    // Nothing exists — create default for each tool
    return {inject: [], create: [AGENTS_MD, CLAUDE_DIR_MD]};
  }

  const searchPaths = /** @type {Record<string, string[]>} */ (AGENT_PRESETS)[agent];
  if (!searchPaths) {
    return {inject: [], create: [AGENTS_MD]};
  }

  // Find first existing file from search order
  for (const p of searchPaths) {
    if (fs.existsSync(path.join(targetDir, p))) {
      return {inject: [p], create: []};
    }
  }

  // None found — create the last entry (default location)
  return {inject: [], create: [searchPaths[searchPaths.length - 1]]};
}

/**
 * Detect which styling system the consumer project has wired up, so the agent
 * docs recommend a path that actually compiles in THIS project.
 *
 * `xstyle`/StyleX needs the StyleX compiler (the `@stylexjs/stylex` runtime
 * alone throws at runtime → blank page); Tailwind utilities need Tailwind.
 * Recommending either when it isn't configured yields unstyled or blank output.
 * Plain CSS variables (via `style`/`className`) always work, so they're the
 * safe default. Precedence: stylex (compiler wired) → tailwind → css.
 *
 * @param {string} targetDir
 * @returns {'stylex' | 'tailwind' | 'css'}
 */
export function detectStylingSystem(targetDir) {
  try {
    const pkgPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(pkgPath)) return 'css';
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    // Key off a StyleX *compiler* plugin — the runtime alone won't render.
    const stylexCompilers = [
      '@stylexjs/babel-plugin',
      'vite-plugin-stylex',
      'unplugin-stylex',
      '@stylexswc/unplugin',
      '@stylexswc/nextjs-plugin',
      'stylex-webpack',
    ];
    if (stylexCompilers.some(d => d in deps)) return 'stylex';
    if ('tailwindcss' in deps) return 'tailwind';
    return 'css';
  } catch {
    // Best-effort: default to the universally-safe CSS-variable path.
    return 'css';
  }
}

/**
 * Generate the agent cheat sheet from live CLI metadata.
 *
 * Structured as: workflow (behavioral) → rules (error prevention) → CLI reference.
 * Templates are positioned first in the workflow to teach agents the
 * "look at reference code" reflex before writing any UI.
 *
 * `stylingSystem` tailors the custom-styling guidance to what the project has
 * configured (see {@link detectStylingSystem}) so the agent never reaches for a
 * styling path that isn't compiled here.
 *
 * `topics` is the project's doc-topic list. Passing it is what puts an
 * integration's topics — including one it contributed in place of a built-in —
 * in front of the agent by name; without it the block falls back to the CLI's
 * own topics, because resolving a project's catalog is async and this is not.
 *
 * Either way the list now includes the hyphenated topics. The fallback scan
 * matched `\w+`, which does not match `-`, so five real topics were missing
 * from every block ever written — `getting-started` and `cli-integrations`
 * among them. An agent cannot ask for a topic it was never told about, and
 * `getting-started` is the one it should reach for first.
 *
 * @param {string} version
 * @param {{coreDir?: string|null, invocation?: string, stylingSystem?: 'stylex'|'tailwind'|'css', zh?: boolean, lang?: string, topics?: string[]}} [options]
 * @returns {string}
 */
export function generateCompressedIndex(version, {coreDir, invocation = getCliInvocation(), stylingSystem = 'css', topics} = {}) {
  const run = invocation;
  const lines = [MARKER_START];

  // Component count from live discovery
  let componentCount = '90+';
  if (coreDir) {
    try {
      const comps = discoverComponents(coreDir);
      let total = 0;
      for (const list of Object.values(comps)) total += list.length;
      if (total > 0) componentCount = String(total);
    } catch {
      // Best-effort: component count is cosmetic; fall back to the default.
    }
  }

  // Header — state the CLI prefix once; commands below are shown as `astryx <cmd>`.
  lines.push(`Astryx v${version} · ${componentCount} components`);
  lines.push(`CLI: run every command as \`${run} <cmd>\` (shown below as \`astryx ...\`).`);
  lines.push('');

  // Required setup — components ship precompiled CSS; without these imports
  // everything renders unstyled. Theme is optional (a default ships in astryx.css).
  lines.push('SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:');
  lines.push('  import "@astryxdesign/core/reset.css";');
  lines.push('  import "@astryxdesign/core/astryx.css";');
  lines.push('');

  // Workflow — `build` is the front door; discover before writing UI.
  lines.push("WORKFLOW — discover, don't guess. Before writing UI:");
  lines.push('1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.');
  lines.push('2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.');
  lines.push('3. `astryx component <Name>` — props + examples for every component you use.');
  lines.push('');

  // Rules — the top error-preventers.
  lines.push('RULES:');
  lines.push('- No <div> — components do all layout/spacing, page frame included.');
  lines.push('- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.');
  lines.push('- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.');
  // Styling guidance tailored to the project's configured system — never
  // recommend a path that isn't compiled here (xstyle needs the StyleX compiler;
  // utilities need Tailwind). Tokens are always the source of truth.
  if (stylingSystem === 'stylex') {
    lines.push('- Custom styling: component props first; else the xstyle prop / StyleX tokens (@astryxdesign/core/theme/tokens.stylex). No raw hex/px.');
  } else if (stylingSystem === 'tailwind') {
    lines.push('- Custom styling: component props first; else Tailwind utilities backed by tokens (bg-surface, text-primary, rounded-lg) via tailwind-theme.css. No raw hex/px.');
  } else {
    lines.push("- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)");
  }
  lines.push('- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.');
  // Self-check — post-generation pass. Validated via vibe tests (internal/vibe-tests/
  // prompt-purity-test): on complex multi-step UIs the rules above alone still leave raw
  // CSS in ~11-13% of runs; a re-read-and-fix pass cuts that ~4x at negligible token cost.
  // The fix names the sanctioned escape hatch for the configured system.
  const selfCheckFix = {
    stylex:
      'replace any className=, style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token',
    tailwind:
      'replace any style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded/arbitrary value (e.g. bg-[#fff], p-[13px]) with the component or a token-backed utility',
    css: 'replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…))',
  };
  lines.push(
    `- SELF-CHECK before you finish: re-read the file and ${selfCheckFix[stylingSystem] ?? selfCheckFix.css}. If unsure a component/prop exists, run \`astryx component <Name>\` / \`astryx search "<thing>"\`; don't hand-roll CSS.`,
  );
  lines.push('');

  // Command reference — build/template/component are covered in WORKFLOW above.
  lines.push('MORE CLI:');
  lines.push('  search "<query>"   find any component / hook / doc / template / block');
  lines.push(`  component --list   ${componentCount} components by category`);
  lines.push('  template --list    page + block recipes');
  const docsDir = path.join(CLI_ROOT, 'assets', 'docs');
  const resolvedTopics =
    topics ??
    (fs.existsSync(docsDir)
      ? fs
          .readdirSync(docsDir)
          .map(f => f.match(/^([\w-]+)\.doc\.mjs$/))
          .filter(/** @returns {m is RegExpMatchArray} */ (m) => m != null)
          .map(m => m[1])
          .sort()
      : []);
  if (resolvedTopics.length > 0) {
    lines.push(`  docs <topic>       ${resolvedTopics.join(', ')}`);
  }
  lines.push('  swizzle <Name>     eject component source for deep customization');
  lines.push('  upgrade --apply    run after any @astryxdesign/core bump');
  lines.push(MARKER_END);

  return lines.join('\n');
}

/**
 * Get Astryx version from core package.
 * @param {string|null} coreDir
 * @returns {string}
 */
export function getXdsVersion(coreDir) {
  if (coreDir) {
    const pkgPath = path.join(coreDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.version;
    }
  }
  const cliPkgPath = path.join(CLI_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf-8'));
  return pkg.version;
}

/**
 * Inject or update Astryx section in a file using Astryx markers.
 * If the file has existing markers, replaces the content between them.
 * If the file exists without markers, appends the block (unless onlyReplace is true).
 * If createIfMissing is true and the file doesn't exist, creates it with a header.
 *
 * @param {string} filePath
 * @param {string} compressedIndex
 * @param {object} [options]
 * @param {boolean} [options.createIfMissing] - Create the file if it doesn't exist
 * @param {string} [options.header] - Header for newly created files
 * @param {boolean} [options.onlyReplace] - Only write if Astryx markers already exist (skip files without markers)
 * @returns {boolean} Whether the file was written
 */
export function injectXdsBlock(filePath, compressedIndex, {createIfMissing = false, header = '', onlyReplace = false} = {}) {
  let content;

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');

    // Find existing section (new or legacy markers), well-formed only.
    const block = findManagedBlock(content);

    if (block) {
      content =
        content.slice(0, block.start) +
        compressedIndex +
        content.slice(block.end);
    } else if (content.includes(MARKER_START) || content.includes(LEGACY_MARKER_START)) {
      // A START with no matching END (e.g. an interrupted previous write). Don't
      // append a second block below the broken one — that leaves two STARTs the
      // tool can never converge. Refuse and ask the user to clean it up.
      throw new Error(
        `Malformed agent-docs block: found a start marker with no matching end ` +
          `in ${filePath}. Remove the incomplete block manually, then re-run.`,
      );
    } else if (onlyReplace) {
      // File exists but has no Astryx markers — skip it
      return false;
    } else {
      content = content.trimEnd() + '\n\n' + compressedIndex + '\n';
    }
  } else if (createIfMissing) {
    content = header ? header + '\n\n' + compressedIndex + '\n' : compressedIndex + '\n';
  } else {
    return false;
  }

  fs.writeFileSync(filePath, content);
  return true;
}

/**
 * Inject or update Astryx section in AGENTS.md.
 * Always creates the file if it doesn't exist.
 *
 * @param {string} targetDir
 * @param {string} version
 */
export function injectAgentsMd(targetDir, version) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const compressedIndex = generateCompressedIndex(version, {
    coreDir: findCoreDir(targetDir),
    stylingSystem: detectStylingSystem(targetDir),
  });
  injectXdsBlock(agentsPath, compressedIndex, {
    createIfMissing: true,
    header: `# AGENTS.md\n\nProject-specific guidance for AI coding agents.`,
  });
}

/**
 * Inject or update Astryx section in CLAUDE.md.
 * Only injects if CLAUDE.md already exists.
 *
 * @param {string} targetDir
 * @param {string} version
 * @returns {boolean} Whether the file was written
 */
export function injectClaudeMd(targetDir, version) {
  const claudePath = path.join(targetDir, CLAUDE_MD);
  const compressedIndex = generateCompressedIndex(version, {
    coreDir: findCoreDir(targetDir),
    stylingSystem: detectStylingSystem(targetDir),
  });
  return injectXdsBlock(claudePath, compressedIndex);
}

/**
 * Remove Astryx section from a file.
 * If the file becomes empty (only boilerplate header remains), deletes it.
 *
 * @param {string} filePath
 * @param {{deleteIfEmpty?: boolean}} [options]
 * @returns {boolean} Whether the Astryx section was found and removed
 */
export function removeXdsBlock(filePath, {deleteIfEmpty = false} = {}) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  // Find existing section (new or legacy markers), well-formed only.
  const block = findManagedBlock(content);
  if (!block) return false;

  const before = content.slice(0, block.start).trimEnd();
  const after = content.slice(block.end).trimStart();
  content = before + (after ? '\n\n' + after : '') + '\n';

  if (deleteIfEmpty) {
    const stripped = content.replace(/^#.*\n+.*guidance.*\n*/m, '').trim();
    if (!stripped) {
      fs.unlinkSync(filePath);
      return true;
    }
  }

  fs.writeFileSync(filePath, content);
  return true;
}

/**
 * Remove Astryx section from all known agent doc files.
 * @param {string} targetDir
 */
export function removeAgentDocs(targetDir) {
  const allPaths = discoverAgentDocs(targetDir);

  for (const p of allPaths) {
    const filePath = path.join(targetDir, p);
    // Delete if empty for files we created (AGENTS.md, .claude/CLAUDE.md)
    const deleteIfEmpty = p === AGENTS_MD || p === CLAUDE_DIR_MD;
    if (removeXdsBlock(filePath, {deleteIfEmpty})) {
      if (!fs.existsSync(filePath)) {
        humanLog(`✓ Removed empty ${p}`);
      } else {
        humanLog(`✓ Removed design system section from ${p}`);
      }
    }
  }
}

/**
 * Programmatic entry point for installing agent docs.
 * Used by the init command, upgrade command, and agent-docs command.
 *
 * Strategy (when no agent/paths specified):
 * - Discover all existing agent doc files and update them
 * - If nothing found, create AGENTS.md as default (tool-agnostic standard)
 *
 * @param {string} targetDir
 * @param {object} [options]
 * @param {boolean} [options.zh]
 * @param {string} [options.lang]
 * @param {string} [options.agent] - Tool preset: 'claude', 'cursor', 'codex', 'hermes', 'all'
 * @param {string[]} [options.paths] - Explicit paths (overrides agent/auto-detect)
 * @param {boolean} [options.onlyReplace] - Only update files that already have Astryx markers (for upgrades)
 * @param {string[]} [options.topics] - Doc topics to list in the block; defaults
 *   to the CLI's own. Pass the project's catalog (`(await project.docs()).names()`)
 *   so an integration's topics reach the agent.
 * @returns {string[]} List of files written
 */
export function installAgentDocs(targetDir, {zh = false, lang, agent, paths, onlyReplace = false, topics} = {}) {
  const coreDir = findCoreDir(targetDir);
  const version = getXdsVersion(coreDir);
  const invocation = getCliInvocation(targetDir);
  const stylingSystem = detectStylingSystem(targetDir);
  const compressedIndex = generateCompressedIndex(version, {coreDir, zh, lang, invocation, stylingSystem, topics});
  /** @type {string[]} */
  const written = [];

  // Explicit paths override everything
  if (paths && paths.length > 0) {
    // Path-safety: each --agent-docs-path entry must resolve inside the
    // target directory. Reject absolute paths (silent re-rooting via
    // path.join hides intent) and `..` traversal.
    for (const p of paths) {
      assertWithin(p, targetDir, {label: 'agent docs path'});
    }
    for (const p of paths) {
      const filePath = path.join(targetDir, p);
      const dir = path.dirname(filePath);
      if (dir !== targetDir) {
        fs.mkdirSync(dir, {recursive: true});
      }
      injectXdsBlock(filePath, compressedIndex, {
        createIfMissing: true,
        header: `# ${path.basename(p, path.extname(p))}\n\nProject-specific guidance for AI coding agents.`,
      });
      written.push(p);
    }
    return written;
  }

  // Agent preset
  if (agent) {
    const {inject, create} = resolveAgentPaths(targetDir, agent);
    for (const p of inject) {
      injectXdsBlock(path.join(targetDir, p), compressedIndex);
      written.push(p);
    }
    for (const p of create) {
      const filePath = path.join(targetDir, p);
      const dir = path.dirname(filePath);
      if (dir !== targetDir) {
        fs.mkdirSync(dir, {recursive: true});
      }
      injectXdsBlock(filePath, compressedIndex, {
        createIfMissing: true,
        header: `# ${path.basename(p, path.extname(p))}\n\nProject-specific guidance for AI coding agents.`,
      });
      written.push(p);
    }
    return written;
  }

  // Auto-detect: update all existing agent doc files
  const existing = discoverAgentDocs(targetDir);

  if (existing.length > 0) {
    for (const p of existing) {
      const didWrite = injectXdsBlock(path.join(targetDir, p), compressedIndex, {onlyReplace});
      if (didWrite) written.push(p);
    }
    return written;
  }

  // Nothing exists — create root AGENTS.md as the default (skip if onlyReplace).
  // AGENTS.md is the tool-agnostic standard (Codex/Copilot, Cursor, and most
  // agents read it), so it's the safe default. Claude-specific output is opt-in
  // via `--agent claude` (→ .claude/CLAUDE.md); `--agent all` writes both.
  if (onlyReplace) return written;

  const defaultPath = AGENTS_MD;
  injectXdsBlock(path.join(targetDir, defaultPath), compressedIndex, {
    createIfMissing: true,
    header: `# AGENTS.md\n\nProject-specific guidance for AI coding agents.`,
  });
  written.push(defaultPath);
  return written;
}
