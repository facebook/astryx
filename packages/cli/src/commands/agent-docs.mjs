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
 *
 * Auto-detect: discovers existing files and updates them in place.
 * Default (no existing files): creates .claude/CLAUDE.md.
 *
 * --agent <tool>: target a specific tool preset (claude, cursor, codex, all)
 * --agent-docs-path <path>: explicit file path(s)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';
import {assertWithin, PathSafetyError} from '../utils/path-safety.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';
import {discoverComponents} from '../lib/component-discovery.mjs';
import {discoverHooks} from '../lib/hook-discovery.mjs';
import {humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

const AGENTS_MD = 'AGENTS.md';
const CLAUDE_MD = 'CLAUDE.md';
const CLAUDE_DIR_MD = path.join('.claude', 'CLAUDE.md');

const XDS_MARKER_START = '<!-- XDS:START -->';
const XDS_MARKER_END = '<!-- XDS:END -->';

/**
 * Agent tool presets — maps tool names to their file search paths.
 * Order matters: first existing file wins, last entry is the default (created if none exist).
 */
const AGENT_PRESETS = {
  claude: [CLAUDE_MD, CLAUDE_DIR_MD],
  cursor: ['.cursorrules', AGENTS_MD],
  codex: [AGENTS_MD],
};

/**
 * Find all existing agent doc files in a directory.
 * Searches all known locations (AGENTS.md, CLAUDE.md, .claude/CLAUDE.md, .cursorrules).
 * @param {string} targetDir
 * @returns {string[]} Relative paths of existing agent doc files
 */
export function discoverAgentDocs(targetDir) {
  const allPaths = [AGENTS_MD, CLAUDE_MD, CLAUDE_DIR_MD, '.cursorrules'];
  return allPaths.filter(p => fs.existsSync(path.join(targetDir, p)));
}

/**
 * Resolve which file(s) to write for a given agent tool preset.
 * Searches for existing files first, falls back to default creation path.
 *
 * @param {string} targetDir
 * @param {string} agent - Preset name: 'claude', 'cursor', 'codex', 'all'
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

  const searchPaths = AGENT_PRESETS[agent];
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
 * Generate the agent cheat sheet from live CLI metadata.
 *
 * Structured as: workflow (behavioral) → rules (error prevention) → CLI reference.
 * Templates are positioned first in the workflow to teach agents the
 * "look at reference code" reflex before writing any UI.
 */
export function generateCompressedIndex(version, {coreDir, zh = false, lang, runPrefix = getRunPrefix()} = {}) {
  const run = `${runPrefix} xds`;
  const lines = [XDS_MARKER_START];

  // Component count from live discovery
  let componentCount = '90+';
  if (coreDir) {
    try {
      const comps = discoverComponents(coreDir);
      let total = 0;
      for (const list of Object.values(comps)) total += list.length;
      if (total > 0) componentCount = String(total);
    } catch {}
  }

  // Header
  lines.push(`XDS v${version} — ${componentCount} components`);
  lines.push('');

  // Behavioral workflow — templates first, then component lookup
  lines.push('Before writing any UI code:');
  lines.push(`1. \`${run} template --list\` — find a related page pattern`);
  lines.push(`2. \`${run} template <name> --skeleton\` — study layout structure (gap, padding, nesting)`);
  lines.push(`3. \`${run} component <Name>\` — read props + examples for EVERY component you use`);
  lines.push('');
  lines.push('Templates are reference code — read them for composition patterns, not just scaffolding.');
  lines.push('Full pages → dashboard (uses XDSAppShell). Forms → contact-form. Tables → data-table. Settings → settings-sidebar.');
  lines.push('');

  // Rules — inline, compact, prevents the top error categories
  lines.push('No <div> anywhere — not for layout, not for wrappers, not for spacing. Use components.');
  lines.push('Full-page shells → XDSAppShell (not XDSLayout). Sidebar nav → XDSSideNav (not XDSList).');
  lines.push('No style={{}} — use the xstyle prop on components for custom styling.');
  lines.push('If a component prop does what you need, use it — never replicate with CSS/stylex.');
  lines.push(`No magic values — run \`${run} docs tokens\` for spacing/color/radius.`);
  lines.push(`To change accent/brand colors: \`${run} theme\` — never override --xds-color-* in :root.`);
  lines.push('');

  // CLI quick reference
  lines.push(`${run} component --list         ${componentCount} components by category`);
  lines.push(`${run} component <Name>         props, types, examples`);

  // Doc topics from live discovery
  const docsDir = path.join(CLI_ROOT, 'docs');
  if (fs.existsSync(docsDir)) {
    for (const file of fs.readdirSync(docsDir).sort()) {
      const match = file.match(/^(\w+)\.doc\.mjs$/);
      if (!match) continue;
      const topic = match[1];
      let desc = topic;
      try {
        const fileContent = fs.readFileSync(path.join(docsDir, file), 'utf-8');
        const descMatch = fileContent.match(/description:\s*['"](.+?)['"]/);
        if (descMatch) desc = descMatch[1];
      } catch {}
      if (desc.length > 50) desc = desc.slice(0, 47) + '...';
      lines.push(`${run} docs ${topic.padEnd(20)} ${desc}`);
    }
  }

  // Templates
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();
    if (templates.length > 0) {
      lines.push(`${run} template --list           page recipes with component lists`);
      lines.push(`${run} template <name> [path]     scaffold from template`);
    }
  }

  lines.push(`${run} swizzle <Name>            eject source (--gap to report why)`);
  lines.push(`${run} upgrade --apply            codemods after version bump`);
  lines.push(`after @xds/core bump, always run ${run} upgrade --apply`);
  lines.push(XDS_MARKER_END);

  return lines.join('\n');
}

/**
 * Get XDS version from core package.
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
 * Inject or update XDS section in a file using XDS markers.
 * If the file has existing markers, replaces the content between them.
 * If the file exists without markers, appends the block (unless onlyReplace is true).
 * If createIfMissing is true and the file doesn't exist, creates it with a header.
 *
 * @param {string} filePath
 * @param {string} compressedIndex
 * @param {object} [options]
 * @param {boolean} [options.createIfMissing] - Create the file if it doesn't exist
 * @param {string} [options.header] - Header for newly created files
 * @param {boolean} [options.onlyReplace] - Only write if XDS markers already exist (skip files without markers)
 * @returns {boolean} Whether the file was written
 */
export function injectXdsBlock(filePath, compressedIndex, {createIfMissing = false, header = '', onlyReplace = false} = {}) {
  let content = '';

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');

    const startIdx = content.indexOf(XDS_MARKER_START);
    const endIdx = content.indexOf(XDS_MARKER_END);

    if (startIdx !== -1 && endIdx !== -1) {
      content =
        content.slice(0, startIdx) +
        compressedIndex +
        content.slice(endIdx + XDS_MARKER_END.length);
    } else if (onlyReplace) {
      // File exists but has no XDS markers — skip it
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
 * Inject or update XDS section in AGENTS.md.
 * Always creates the file if it doesn't exist.
 */
export function injectAgentsMd(targetDir, version, {zh = false, lang} = {}) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const compressedIndex = generateCompressedIndex(version, {coreDir: findCoreDir(targetDir)});
  injectXdsBlock(agentsPath, compressedIndex, {
    createIfMissing: true,
    header: `# AGENTS.md\n\nProject-specific guidance for AI coding agents.`,
  });
}

/**
 * Inject or update XDS section in CLAUDE.md.
 * Only injects if CLAUDE.md already exists.
 *
 * @returns {boolean} Whether the file was written
 */
export function injectClaudeMd(targetDir, version, {zh = false, lang} = {}) {
  const claudePath = path.join(targetDir, CLAUDE_MD);
  const compressedIndex = generateCompressedIndex(version, {coreDir: findCoreDir(targetDir)});
  return injectXdsBlock(claudePath, compressedIndex);
}

/**
 * Remove XDS section from a file.
 * If the file becomes empty (only boilerplate header remains), deletes it.
 *
 * @returns {boolean} Whether the XDS section was found and removed
 */
export function removeXdsBlock(filePath, {deleteIfEmpty = false} = {}) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  const startIdx = content.indexOf(XDS_MARKER_START);
  const endIdx = content.indexOf(XDS_MARKER_END);

  if (startIdx === -1 || endIdx === -1) return false;

  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + XDS_MARKER_END.length).trimStart();
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
 * Remove XDS section from all known agent doc files.
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
 * Used by the init wizard, upgrade command, and agent-docs command.
 *
 * Strategy (when no agent/paths specified):
 * - Discover all existing agent doc files and update them
 * - If nothing found, create .claude/CLAUDE.md as default
 *
 * @param {string} targetDir
 * @param {object} [options]
 * @param {boolean} [options.zh]
 * @param {string} [options.lang]
 * @param {string} [options.agent] - Tool preset: 'claude', 'cursor', 'codex', 'all'
 * @param {string[]} [options.paths] - Explicit paths (overrides agent/auto-detect)
 * @param {boolean} [options.onlyReplace] - Only update files that already have XDS markers (for upgrades)
 * @returns {string[]} List of files written
 */
export function installAgentDocs(targetDir, {zh = false, lang, agent, paths, onlyReplace = false} = {}) {
  const coreDir = findCoreDir(targetDir);
  const version = getXdsVersion(coreDir);
  const runPrefix = getRunPrefix(targetDir);
  const compressedIndex = generateCompressedIndex(version, {coreDir, zh, lang, runPrefix});
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

  // Nothing exists — create .claude/CLAUDE.md as default (skip if onlyReplace)
  if (onlyReplace) return written;

  const defaultPath = CLAUDE_DIR_MD;
  fs.mkdirSync(path.join(targetDir, '.claude'), {recursive: true});
  injectXdsBlock(path.join(targetDir, defaultPath), compressedIndex, {
    createIfMissing: true,
    header: `# CLAUDE.md\n\nProject-specific guidance for AI coding agents.`,
  });
  written.push(defaultPath);
  return written;
}

const VALID_AGENTS = ['claude', 'cursor', 'codex', 'all'];

export function registerAgentDocs(program) {
  program
    .command('agent-docs')
    .description('Install/update the component index for AI coding agents')
    .option('--remove', 'Remove the design system section from all agent doc files')
    .option('--agent <tool>', 'Target tool: claude, cursor, codex, all')
    .option('--agent-docs-path <path...>', 'Explicit file path(s) to write to')
    .action(options => {
      const targetDir = process.cwd();
      const coreDir = findCoreDir(targetDir);
      const version = getXdsVersion(coreDir);
      const zh = program.opts().zh || false;
      const lang = program.opts().lang || null;

      if (options.remove) {
        humanLog('\n🗑️  Removing agent docs...\n');
        removeAgentDocs(targetDir);
        humanLog('\n✅ Agent docs removed.\n');
        return;
      }

      // Validate --agent
      if (options.agent && !VALID_AGENTS.includes(options.agent)) {
        cliError(`Unknown agent "${options.agent}". Valid: ${VALID_AGENTS.join(', ')}`, {code: ERROR_CODES.ERR_UNKNOWN_AGENT});
        return;
      }

      humanLog(`\n📚 Installing agent docs (v${version})...\n`);

      // Collect explicit paths from --agent-docs-path (commander parses variadic as array or single)
      const explicitPaths = options.agentDocsPath
        ? Array.isArray(options.agentDocsPath)
          ? options.agentDocsPath
          : [options.agentDocsPath]
        : undefined;

      let targets;
      try {
        targets = installAgentDocs(targetDir, {
          zh,
          lang,
          agent: options.agent,
          paths: explicitPaths,
        });
      } catch (err) {
        if (err instanceof PathSafetyError) {
          cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
          return;
        }
        throw err;
      }

      const runPrefix = getRunPrefix(targetDir);
      const run = `${runPrefix} xds`;

      for (const t of targets) {
        humanLog(`✓ ${t}`);
      }

      humanLog(`
✅ Agent docs installed!

Your AI coding agent will now:
  • See the component index in ${targets.join(' and ')}
  • Run \`${run} component <name>\` to read detailed docs
  • Run \`${run} docs principles\` for design principles
  • Run \`${run} docs tokens\` for design token reference
  • Follow design system patterns and avoid anti-patterns

To update:
  ${run} agent-docs

To remove:
  ${run} agent-docs --remove
`);
    });
}
