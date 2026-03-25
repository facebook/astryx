/**
 * @file agent-docs — Install/update AGENTS.md and CLAUDE.md
 *
 * Generates a CLI cheat sheet from actual command metadata and injects
 * it into AGENTS.md and/or CLAUDE.md. Format optimized for AI coding
 * agents (Claude, Copilot, Cursor): one line per command, copy-pasteable,
 * minimal tokens.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';
import {discoverComponents} from '../lib/component-discovery.mjs';

const AGENTS_MD = 'AGENTS.md';
const CLAUDE_MD = 'CLAUDE.md';

const XDS_MARKER_START = '<!-- XDS:START -->';
const XDS_MARKER_END = '<!-- XDS:END -->';

/**
 * Generate the agent cheat sheet from live CLI metadata.
 *
 * Format C (one-liner per command) chosen after testing three formats
 * against Claude Opus for AI agent usability (scored 5/5).
 */
export function generateCompressedIndex(version, {coreDir, zh = false, lang, runPrefix = 'npx'} = {}) {
  const run = `${runPrefix} xds`;
  const lines = [XDS_MARKER_START];

  lines.push(`XDS v${version}|Always run ${run} component <Name> before writing XDS component code.`);

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

  lines.push(`${run} component <Name>       props, usage, examples for any component`);
  lines.push(`${run} component --list       ${componentCount} components by category`);

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

      lines.push(`${run} docs ${topic.padEnd(20)} ${desc}`);
    }
  }

  // Templates from live discovery
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();
    if (templates.length > 0) {
      lines.push(`${run} template <name> [path]  scaffold page (${templates.join(', ')})`);
    }
  }

  lines.push(`${run} swizzle <Name>          eject component source (use --gap to report why)`);
  lines.push(`${run} upgrade --apply         run version migration codemods`);
  lines.push(`--detail compact|brief          less output | --lang dense|zh  translation`);
  lines.push(`RULE: after @xds/core bump, always run ${run} upgrade --apply`);
  lines.push(`RULE: when swizzling, always use --gap to report missing capabilities`);
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
 * If the file exists without markers, appends the block.
 * If createIfMissing is true and the file doesn't exist, creates it with a header.
 *
 * @returns {boolean} Whether the file was written
 */
export function injectXdsBlock(filePath, compressedIndex, {createIfMissing = false, header = ''} = {}) {
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
export function injectAgentsMd(targetDir, version, {zh = false, lang, runPrefix} = {}) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const prefix = runPrefix ?? getRunPrefix(targetDir);
  const compressedIndex = generateCompressedIndex(version, {coreDir: findCoreDir(targetDir), runPrefix: prefix});
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
export function injectClaudeMd(targetDir, version, {zh = false, lang, runPrefix} = {}) {
  const claudePath = path.join(targetDir, CLAUDE_MD);
  const prefix = runPrefix ?? getRunPrefix(targetDir);
  const compressedIndex = generateCompressedIndex(version, {coreDir: findCoreDir(targetDir), runPrefix: prefix});
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
 * Remove XDS section from AGENTS.md and CLAUDE.md.
 */
export function removeAgentDocs(targetDir) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const claudePath = path.join(targetDir, CLAUDE_MD);

  if (removeXdsBlock(agentsPath, {deleteIfEmpty: true})) {
    if (!fs.existsSync(agentsPath)) {
      console.log(`✓ Removed empty ${AGENTS_MD}`);
    } else {
      console.log(`✓ Removed XDS section from ${AGENTS_MD}`);
    }
  }

  if (removeXdsBlock(claudePath)) {
    console.log(`✓ Removed XDS section from ${CLAUDE_MD}`);
  }
}

/**
 * Programmatic entry point for installing agent docs.
 * Used by the init wizard.
 *
 * Strategy:
 * - If CLAUDE.md exists, inject there (don't create AGENTS.md)
 * - If only AGENTS.md exists (or neither), inject into AGENTS.md
 * - If both exist, inject into both
 */
export function installAgentDocs(targetDir, {zh = false, lang} = {}) {
  const coreDir = findCoreDir(targetDir);
  const version = getXdsVersion(coreDir);
  const runPrefix = getRunPrefix(targetDir);
  const hasClaudeMd = fs.existsSync(path.join(targetDir, CLAUDE_MD));
  const hasAgentsMd = fs.existsSync(path.join(targetDir, AGENTS_MD));

  if (hasClaudeMd) {
    injectClaudeMd(targetDir, version, {zh, lang, runPrefix});
    if (hasAgentsMd) {
      injectAgentsMd(targetDir, version, {zh, lang, runPrefix});
    }
  } else {
    injectAgentsMd(targetDir, version, {zh, lang, runPrefix});
  }
}

export function registerAgentDocs(program) {
  program
    .command('agent-docs')
    .description('Install/update XDS component index in AGENTS.md (and CLAUDE.md if present)')
    .option('--remove', 'Remove XDS section from AGENTS.md and CLAUDE.md')
    .action(options => {
      const targetDir = process.cwd();
      const coreDir = findCoreDir(targetDir);
      const version = getXdsVersion(coreDir);
      const zh = program.opts().zh || false;
      const lang = program.opts().lang || null;

      if (options.remove) {
        console.log('\n🗑️  Removing XDS agent docs...\n');
        removeAgentDocs(targetDir);
        console.log('\n✅ XDS agent docs removed.\n');
        return;
      }

      const runPrefix = getRunPrefix(targetDir);
      console.log(`\n📚 Installing XDS agent docs (v${version})...\n`);

      const hasClaudeMd = fs.existsSync(path.join(targetDir, CLAUDE_MD));
      const hasAgentsMd = fs.existsSync(path.join(targetDir, AGENTS_MD));
      const targets = [];

      if (hasClaudeMd) {
        injectClaudeMd(targetDir, version, {zh, lang, runPrefix});
        console.log(`✓ Injected compressed index into ${CLAUDE_MD}`);
        targets.push(CLAUDE_MD);
        if (hasAgentsMd) {
          injectAgentsMd(targetDir, version, {zh, lang, runPrefix});
          console.log(`✓ Injected compressed index into ${AGENTS_MD}`);
          targets.push(AGENTS_MD);
        }
      } else {
        injectAgentsMd(targetDir, version, {zh, lang, runPrefix});
        console.log(`✓ Injected compressed index into ${AGENTS_MD}`);
        targets.push(AGENTS_MD);
      }

      const run = `${runPrefix} xds`;
      console.log(`
✅ XDS agent docs installed!

Your AI coding agent will now:
  • See the XDS component index in ${targets.join(' and ')}
  • Run \`${run} component <name>\` to read detailed docs
  • Run \`${run} docs principles\` for design principles
  • Run \`${run} docs tokens\` for design token reference
  • Follow XDS patterns and avoid anti-patterns

To update:
  ${run} agent-docs

To remove:
  ${run} agent-docs --remove
`);
    });
}
