#!/usr/bin/env node
/**
 * @file XDS AGENTS.md installer
 *
 * Installs XDS documentation for AI coding agents.
 * Extracts essential sections from component READMEs.
 *
 * Usage:
 *   npx @xds/agent-tools agents-md
 *   npx @xds/agent-tools agents-md --remove
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DOCS = path.resolve(__dirname, '..', 'docs');
const XDS_DOCS_DIR = '.xds-docs';
const AGENTS_MD = 'AGENTS.md';

const XDS_MARKER_START = '<!-- XDS:START -->';
const XDS_MARKER_END = '<!-- XDS:END -->';

// Sections to extract from READMEs (in order)
const SECTIONS_TO_EXTRACT = ['Usage', 'Import', 'Props', 'Examples'];
// Sections to skip
const SECTIONS_TO_SKIP = ['Files', 'Implementation Notes'];

/**
 * Extract essential sections from a README
 * Keeps: title, description, Usage/Import, Props, Examples
 * Skips: Files, Implementation Notes
 */
function extractEssentialSections(content, componentName) {
  const lines = content.split('\n');
  const output = [];
  let inSkipSection = false;
  let currentSection = null;

  // Determine display name (capitalize first letter for non-XDS names like "theme")
  const displayName = componentName.startsWith('XDS')
    ? componentName
    : componentName.charAt(0).toUpperCase() + componentName.slice(1);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for section headers
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();

      // Check if this is a section to skip
      if (SECTIONS_TO_SKIP.some(s => sectionName.includes(s))) {
        inSkipSection = true;
        currentSection = sectionName;
        continue;
      }

      // End skip mode when we hit a new section
      inSkipSection = false;
      currentSection = sectionName;
    }

    // Skip lines in skip sections
    if (inSkipSection) {
      continue;
    }

    // Skip SYNC comments
    if (line.includes('<!-- SYNC:') || line.includes('SYNC:')) {
      continue;
    }

    // Clean up the title line (remove path prefix)
    if (line.startsWith('# /')) {
      output.push(`# ${displayName}`);
      continue;
    }

    output.push(line);
  }

  // Clean up trailing whitespace
  while (output.length > 0 && output[output.length - 1].trim() === '') {
    output.pop();
  }

  return output.join('\n') + '\n';
}

/**
 * Find component READMEs in packages/core/src
 */
function findComponentReadmes(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  const readmes = [];

  if (!fs.existsSync(srcDir)) {
    return readmes;
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const readmePath = path.join(srcDir, entry.name, 'README.md');
      if (fs.existsSync(readmePath)) {
        readmes.push({
          name: entry.name,
          path: readmePath,
        });
      }

      // Check for nested components (e.g., Layout/XDSLayout)
      const nestedDir = path.join(srcDir, entry.name);
      const nestedEntries = fs.readdirSync(nestedDir, { withFileTypes: true });
      for (const nested of nestedEntries) {
        if (nested.isDirectory()) {
          const nestedReadme = path.join(nestedDir, nested.name, 'README.md');
          if (fs.existsSync(nestedReadme)) {
            readmes.push({
              name: nested.name,
              path: nestedReadme,
            });
          }
        }
      }
    }
  }

  return readmes;
}

/**
 * Compressed index for AGENTS.md
 * Uses pipe-delimited format for 80% token reduction per Vercel research
 */
function generateCompressedIndex(version) {
  return `${XDS_MARKER_START}
[XDS Component Library v${version}]|root: ./${XDS_DOCS_DIR}
|IMPORTANT: Prefer retrieval-led reasoning. Read docs from .xds-docs/ before generating XDS code.
|principles.md: Key rules, anti-patterns, StyleX patterns
|tokens.md: Full design token reference (spacing, colors, radius, typography)
|components: Button|TextInput|TextArea|CheckboxInput|Field|Layout|Layer|Avatar|Skeleton|Text|Icon
|layout: XDSLayout|XDSLayoutHeader|XDSLayoutContent|XDSLayoutPanel|XDSHStack|XDSVStack|XDSCard
|theme: Theme provider, defaultTheme, CSS variables via StyleX
|For component API: read .xds-docs/{ComponentName}.md
${XDS_MARKER_END}`;
}

/**
 * Get XDS version from core package
 */
function getXdsVersion(coreDir) {
  const pkgPath = path.join(coreDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  }
  // Fallback to agent-tools version
  const agentPkgPath = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(agentPkgPath, 'utf-8'));
  return pkg.version;
}

/**
 * Find packages/core directory
 */
function findCoreDir(targetDir) {
  // Check common locations, including parent directories
  let dir = targetDir;

  // Walk up to 5 levels looking for packages/core
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'packages', 'core');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nodeModules = path.join(dir, 'node_modules', '@xds', 'core');
    if (fs.existsSync(nodeModules)) {
      return nodeModules;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break; // reached root
    dir = parent;
  }

  return null;
}

/**
 * Install docs to target directory
 */
function installDocs(targetDir) {
  const docsDir = path.join(targetDir, XDS_DOCS_DIR);

  // Create directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  let extracted = 0;
  let copied = 0;

  // Find core directory
  const coreDir = findCoreDir(targetDir);

  if (coreDir) {
    // Extract from component READMEs
    const readmes = findComponentReadmes(coreDir);

    for (const { name, path: readmePath } of readmes) {
      const content = fs.readFileSync(readmePath, 'utf-8');
      const extracted_content = extractEssentialSections(content, name);
      // Capitalize first letter for file name (e.g., "theme" -> "Theme.md")
      const fileName = name.charAt(0).toUpperCase() + name.slice(1);
      const destPath = path.join(docsDir, `${fileName}.md`);
      fs.writeFileSync(destPath, extracted_content);
      extracted++;
    }

    console.log(`✓ Extracted ${extracted} component docs from READMEs`);
  } else {
    console.log('⚠ packages/core not found, using bundled docs');
  }

  // Copy static docs (principles.md, tokens.md)
  if (fs.existsSync(STATIC_DOCS)) {
    const staticFiles = ['principles.md', 'tokens.md'];

    for (const file of staticFiles) {
      const src = path.join(STATIC_DOCS, file);
      if (fs.existsSync(src)) {
        const dest = path.join(docsDir, file);
        fs.copyFileSync(src, dest);
        copied++;
      }
    }

    console.log(`✓ Copied ${copied} static doc files`);
  }

  return extracted + copied;
}

/**
 * Inject or update XDS section in AGENTS.md
 */
function injectAgentsMd(targetDir, version) {
  const agentsPath = path.join(targetDir, AGENTS_MD);
  const compressedIndex = generateCompressedIndex(version);

  let content = '';

  if (fs.existsSync(agentsPath)) {
    content = fs.readFileSync(agentsPath, 'utf-8');

    // Check if XDS section already exists
    const startIdx = content.indexOf(XDS_MARKER_START);
    const endIdx = content.indexOf(XDS_MARKER_END);

    if (startIdx !== -1 && endIdx !== -1) {
      // Replace existing section
      content = content.slice(0, startIdx) + compressedIndex + content.slice(endIdx + XDS_MARKER_END.length);
    } else {
      // Append to end
      content = content.trimEnd() + '\n\n' + compressedIndex + '\n';
    }
  } else {
    // Create new file
    content = `# AGENTS.md

Project-specific guidance for AI coding agents.

${compressedIndex}
`;
  }

  fs.writeFileSync(agentsPath, content);
}

/**
 * Remove XDS docs and AGENTS.md section
 */
function removeXdsDocs(targetDir) {
  const docsDir = path.join(targetDir, XDS_DOCS_DIR);
  const agentsPath = path.join(targetDir, AGENTS_MD);

  // Remove docs directory
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true });
    console.log(`✓ Removed ${XDS_DOCS_DIR}/`);
  }

  // Remove XDS section from AGENTS.md
  if (fs.existsSync(agentsPath)) {
    let content = fs.readFileSync(agentsPath, 'utf-8');
    const startIdx = content.indexOf(XDS_MARKER_START);
    const endIdx = content.indexOf(XDS_MARKER_END);

    if (startIdx !== -1 && endIdx !== -1) {
      // Remove XDS section and surrounding whitespace
      const before = content.slice(0, startIdx).trimEnd();
      const after = content.slice(endIdx + XDS_MARKER_END.length).trimStart();
      content = before + (after ? '\n\n' + after : '') + '\n';

      // If AGENTS.md is now essentially empty, remove it
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
 * Add .xds-docs to .gitignore if not present
 */
function updateGitignore(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  const entry = `\n# XDS agent docs (generated)\n${XDS_DOCS_DIR}/\n`;

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes(XDS_DOCS_DIR)) {
      fs.appendFileSync(gitignorePath, entry);
      console.log(`✓ Added ${XDS_DOCS_DIR}/ to .gitignore`);
    }
  } else {
    fs.writeFileSync(gitignorePath, entry.trim() + '\n');
    console.log(`✓ Created .gitignore with ${XDS_DOCS_DIR}/`);
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
@xds/agent-tools agents-md

Install XDS documentation for AI coding agents.

Usage:
  npx @xds/agent-tools agents-md           Install docs and inject into AGENTS.md
  npx @xds/agent-tools agents-md --remove  Remove XDS docs and AGENTS.md section

What it does:
  1. Extracts essential sections from component READMEs (skips Files, Implementation Notes)
  2. Copies static docs (principles.md, tokens.md)
  3. Injects a compressed index into AGENTS.md
  4. Adds .xds-docs/ to .gitignore

The compressed index uses pipe-delimited format for 80% token reduction
while maintaining full documentation availability for retrieval.
`);
  process.exit(0);
}

const targetDir = process.cwd();
const coreDir = findCoreDir(targetDir);
const version = getXdsVersion(coreDir || targetDir);

if (args.includes('--remove')) {
  console.log('\n🗑️  Removing XDS agent docs...\n');
  removeXdsDocs(targetDir);
  console.log('\n✅ XDS agent docs removed.\n');
} else {
  console.log(`\n📚 Installing XDS agent docs (v${version})...\n`);

  const total = installDocs(targetDir);

  if (total === 0) {
    console.error('Error: No documentation sources found.');
    console.error('Make sure packages/core exists or static docs are bundled.');
    process.exit(1);
  }

  injectAgentsMd(targetDir, version);
  console.log(`✓ Injected compressed index into ${AGENTS_MD}`);

  updateGitignore(targetDir);

  console.log(`
✅ XDS agent docs installed!

Your AI coding agent will now:
  • See the XDS component index on every turn
  • Read detailed docs from .xds-docs/ when needed
  • Follow XDS patterns and avoid anti-patterns

To update docs after upgrading @xds/agent-tools:
  npx @xds/agent-tools agents-md

To remove:
  npx @xds/agent-tools agents-md --remove
`);
}
