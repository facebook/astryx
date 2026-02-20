/**
 * @file agent-docs command — Install/update AGENTS.md
 *
 * Injects a compressed XDS component index into AGENTS.md.
 * Component docs are served via `npx xds component <name>` instead of
 * being copied into the project.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';

const AGENTS_MD = 'AGENTS.md';

const XDS_MARKER_START = '<!-- XDS:START -->';
const XDS_MARKER_END = '<!-- XDS:END -->';

/**
 * Compressed index for AGENTS.md.
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
|npx xds swizzle <Name>               Copy component source for customization
|npx xds theme                         Scaffold a custom theme (interactive)
|npx xds theme --list                  List existing themes in the project
|npx xds template <name> [path]       Scaffold page (blank, table, login)
|npx xds swizzle <Name> --gap "<reason>"  Swizzle + file gap report
|npx xds gap-report --component <Name> --category <cat> --reason "<why>"  File gap without swizzle
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
 * Inject or update XDS section in AGENTS.md.
 */
export function injectAgentsMd(targetDir, version) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const compressedIndex = generateCompressedIndex(version);

  let content = '';

  if (fs.existsSync(agentsPath)) {
    content = fs.readFileSync(agentsPath, 'utf-8');

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
  } else {
    content = `# AGENTS.md

Project-specific guidance for AI coding agents.

${compressedIndex}
`;
  }

  fs.writeFileSync(agentsPath, content);
}

/**
 * Remove XDS section from AGENTS.md.
 */
export function removeAgentDocs(targetDir) {
  const agentsPath = path.join(targetDir, AGENTS_MD);

  if (fs.existsSync(agentsPath)) {
    let content = fs.readFileSync(agentsPath, 'utf-8');
    const startIdx = content.indexOf(XDS_MARKER_START);
    const endIdx = content.indexOf(XDS_MARKER_END);

    if (startIdx !== -1 && endIdx !== -1) {
      const before = content.slice(0, startIdx).trimEnd();
      const after = content.slice(endIdx + XDS_MARKER_END.length).trimStart();
      content = before + (after ? '\n\n' + after : '') + '\n';

      const stripped = content.replace(/^#.*\n+.*guidance.*\n*/m, '').trim();
      if (!stripped) {
        fs.unlinkSync(agentsPath);
        console.log(`✓ Removed empty ${AGENTS_MD}`);
      } else {
        fs.writeFileSync(agentsPath, content);
        console.log(`✓ Removed XDS section from ${AGENTS_MD}`);
      }
    }
  }
}

/**
 * Programmatic entry point for installing agent docs.
 * Used by the init wizard.
 */
export function installAgentDocs(targetDir) {
  const coreDir = findCoreDir(targetDir);
  const version = getXdsVersion(coreDir);
  injectAgentsMd(targetDir, version);
}

export function registerAgentDocs(program) {
  program
    .command('agent-docs')
    .description('Install/update XDS component index in AGENTS.md')
    .option('--remove', 'Remove XDS section from AGENTS.md')
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

      injectAgentsMd(targetDir, version);
      console.log(`✓ Injected compressed index into ${AGENTS_MD}`);

      console.log(`
✅ XDS agent docs installed!

Your AI coding agent will now:
  • See the XDS component index in AGENTS.md
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
