/**
 * @file agent-docs command — Install/update AGENTS.md and CLAUDE.md
 *
 * Injects a compressed XDS component index into AGENTS.md and/or CLAUDE.md.
 * Component docs are served via `npx xds component <name>` instead of
 * being copied into the project.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';

const AGENTS_MD = 'AGENTS.md';
const CLAUDE_MD = 'CLAUDE.md';

const XDS_MARKER_START = '<!-- XDS:START -->';
const XDS_MARKER_END = '<!-- XDS:END -->';

/**
 * Compressed index for agent docs.
 * Directs agents to use CLI commands for retrieval.
 */
export function generateCompressedIndex(version) {
  return `${XDS_MARKER_START}
[XDS v${version}]|IMPORTANT: Prefer retrieval-led reasoning. Run CLI to read docs before generating code.
|npx xds component <Name> --compact|--source   Docs (props, usage) or source code
|npx xds component --list             All components by category
|npx xds docs principles              Design rules, anti-patterns, StyleX patterns
|npx xds docs tokens                  Token reference (spacing, color, radius, type)
|npx xds docs theme                   Theme system: XDSTheme, custom themes, overrides, nesting
|npx xds template <name> [path]       Scaffold page (blank, table, login)
|npx xds swizzle <Name> --gap "<reason>"  Copy component source for customization + file gap report
|npx xds gap-report --component <Name> --category <cat> --reason "<why>"  File gap without swizzle
|npx xds upgrade                       Preview API migrations for your version
|npx xds upgrade --apply               Apply codemods to update breaking API changes
|RULE: After bumping @xds/core version, ALWAYS run npx xds upgrade --apply to migrate breaking API changes.
|RULE: When swizzling to unblock yourself, ALWAYS use --gap to explain what capability was missing.
${XDS_MARKER_END}`;
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
export function injectAgentsMd(targetDir, version) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const compressedIndex = generateCompressedIndex(version);
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
export function injectClaudeMd(targetDir, version) {
  const claudePath = path.join(targetDir, CLAUDE_MD);
  const compressedIndex = generateCompressedIndex(version);
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
export function installAgentDocs(targetDir) {
  const coreDir = findCoreDir(targetDir);
  const version = getXdsVersion(coreDir);
  const hasClaudeMd = fs.existsSync(path.join(targetDir, CLAUDE_MD));
  const hasAgentsMd = fs.existsSync(path.join(targetDir, AGENTS_MD));

  if (hasClaudeMd) {
    injectClaudeMd(targetDir, version);
    if (hasAgentsMd) {
      injectAgentsMd(targetDir, version);
    }
  } else {
    injectAgentsMd(targetDir, version);
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

      if (options.remove) {
        console.log('\n🗑️  Removing XDS agent docs...\n');
        removeAgentDocs(targetDir);
        console.log('\n✅ XDS agent docs removed.\n');
        return;
      }

      console.log(`\n📚 Installing XDS agent docs (v${version})...\n`);

      const hasClaudeMd = fs.existsSync(path.join(targetDir, CLAUDE_MD));
      const hasAgentsMd = fs.existsSync(path.join(targetDir, AGENTS_MD));
      const targets = [];

      if (hasClaudeMd) {
        injectClaudeMd(targetDir, version);
        console.log(`✓ Injected compressed index into ${CLAUDE_MD}`);
        targets.push(CLAUDE_MD);
        if (hasAgentsMd) {
          injectAgentsMd(targetDir, version);
          console.log(`✓ Injected compressed index into ${AGENTS_MD}`);
          targets.push(AGENTS_MD);
        }
      } else {
        injectAgentsMd(targetDir, version);
        console.log(`✓ Injected compressed index into ${AGENTS_MD}`);
        targets.push(AGENTS_MD);
      }

      console.log(`
✅ XDS agent docs installed!

Your AI coding agent will now:
  • See the XDS component index in ${targets.join(' and ')}
  • Run \`npx xds component <name>\` to read detailed docs
  • Run \`npx xds docs principles\` for design principles
  • Run \`npx xds docs tokens\` for design token reference
  • Follow XDS patterns and avoid anti-patterns

To update:
  npx xds agent-docs

To remove:
  npx xds agent-docs --remove
`);
    });
}
