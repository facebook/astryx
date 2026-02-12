/**
 * @file component command — List components and print component docs
 *
 * `xds component --list` prints all components grouped by category.
 * `xds component <name>` prints the full component README.
 * `xds component <name> --compact` prints a token-optimized version for LLMs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir} from '../utils/paths.mjs';

const CATEGORIES = {
  Layout: ['AspectRatio', 'Center', 'Grid', 'Layout'],
  Display: ['Avatar', 'Badge', 'Divider', 'Icon', 'Skeleton', 'Text'],
  Form: [
    'CheckboxInput',
    'DateInput',
    'Field',
    'Selector',
    'Switch',
    'TextArea',
    'TextInput',
    'TimeInput',
  ],
  Action: ['Button'],
  Overlay: ['Calendar', 'Layer'],
};

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */
function cleanReadme(content, componentName) {
  const displayName = componentName.startsWith('XDS')
    ? componentName
    : componentName.charAt(0).toUpperCase() + componentName.slice(1);

  const lines = content.split('\n');
  const output = [];

  for (const line of lines) {
    if (line.includes('<!-- SYNC:') || line.includes('SYNC:')) continue;

    if (line.startsWith('# /')) {
      output.push(`# ${displayName}`);
      continue;
    }

    output.push(line);
  }

  // Collapse consecutive blank lines
  const cleaned = [];
  let prevEmpty = false;
  for (const line of output) {
    const isEmpty = line.trim() === '';
    if (isEmpty && prevEmpty) continue;
    cleaned.push(line);
    prevEmpty = isEmpty;
  }

  // Trim trailing blank lines
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
    cleaned.pop();
  }

  return cleaned.join('\n') + '\n';
}

// Sections to skip in compact mode
const COMPACT_SKIP_SECTIONS = [
  'Files',
  'RTL Support',
  'Related',
  'Dividers',
  'Components',
  'Overview',
];
const MAX_EXAMPLES = 3;

/**
 * Extract compact docs for LLM consumption.
 * Keeps: title, description, Features, Usage (limited examples), Props, Implementation Notes.
 * Drops: Files, RTL Support, Related, ASCII art, overflow code blocks.
 */
function extractCompact(content, componentName) {
  const lines = content.split('\n');
  const output = [];
  let inSkipSection = false;
  let inCodeBlock = false;
  let codeBlockCount = 0;
  let skipCurrentBlock = false;
  let currentSection = null;

  const displayName = componentName.startsWith('XDS')
    ? componentName
    : componentName.charAt(0).toUpperCase() + componentName.slice(1);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        const nextLine = lines[i + 1] || '';
        const isAsciiBlock =
          /^[┌┐└┘├┤┬┴┼─│\s]+$/.test(nextLine) ||
          /^\s*[│├└┌]/.test(nextLine);
        if (isAsciiBlock) {
          skipCurrentBlock = true;
          continue;
        }
        if (codeBlockCount >= MAX_EXAMPLES) {
          skipCurrentBlock = true;
          continue;
        }
        codeBlockCount++;
        skipCurrentBlock = false;
      } else {
        inCodeBlock = false;
        if (skipCurrentBlock) {
          skipCurrentBlock = false;
          continue;
        }
      }
    }

    if (inCodeBlock && skipCurrentBlock) continue;

    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      codeBlockCount = 0;

      if (COMPACT_SKIP_SECTIONS.some(s => sectionName.includes(s))) {
        inSkipSection = true;
        currentSection = sectionName;
        continue;
      }
      inSkipSection = false;
      currentSection = sectionName;
    }

    const subsectionMatch = line.match(/^###\s+(.+)$/);
    if (
      subsectionMatch &&
      currentSection === 'Usage' &&
      codeBlockCount >= MAX_EXAMPLES
    ) {
      continue;
    }

    if (inSkipSection) continue;
    if (line.includes('<!-- SYNC:') || line.includes('SYNC:')) continue;
    if (
      /^[┌┐└┘├┤┬┴┼─│\s]+$/.test(line) ||
      /^\s*[│├└┌]\s*/.test(line)
    ) {
      continue;
    }

    if (line.startsWith('# /')) {
      output.push(`# ${displayName}`);
      continue;
    }

    output.push(line);
  }

  while (output.length > 0 && output[output.length - 1].trim() === '') {
    output.pop();
  }

  const cleaned = [];
  let prevEmpty = false;
  for (const line of output) {
    const isEmpty = line.trim() === '';
    if (isEmpty && prevEmpty) continue;
    cleaned.push(line);
    prevEmpty = isEmpty;
  }

  return cleaned.join('\n') + '\n';
}

/**
 * Find the README for a component, checking both top-level
 * and nested directories (e.g., Layout/XDSLayout).
 */
function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');

  // Direct match
  const direct = path.join(srcDir, name, 'README.md');
  if (fs.existsSync(direct)) return direct;

  // Search nested (e.g., Layout contains XDSLayout, XDSHStack, etc.)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, 'README.md');
    if (fs.existsSync(nested)) return nested;
  }

  return null;
}

export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--compact', 'Token-optimized output for LLMs')
    .action((name, options) => {
      const coreDir = findCoreDir(process.cwd());

      if (!coreDir) {
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      if (options.category) {
        const cat = options.category;
        const match = Object.entries(CATEGORIES).find(
          ([key]) => key.toLowerCase() === cat.toLowerCase(),
        );
        if (!match) {
          console.error(`Error: Unknown category "${cat}".`);
          console.error(
            `Available categories: ${Object.keys(CATEGORIES).join(', ')}`,
          );
          process.exit(1);
        }
        console.log(`\n${match[0]}:`);
        for (const comp of match[1]) {
          console.log(`  ${comp}`);
        }
        console.log('');
        return;
      }

      if (options.list || !name) {
        console.log('');
        for (const [category, components] of Object.entries(CATEGORIES)) {
          console.log(`${category}:`);
          for (const comp of components) {
            console.log(`  ${comp}`);
          }
          console.log('');
        }
        console.log('Usage: npx xds component <name>');
        console.log('');
        return;
      }

      // Normalize: strip XDS prefix for directory lookup
      const dirName = name.replace(/^XDS/, '');

      const readmePath = findComponentReadme(coreDir, dirName);

      if (!readmePath) {
        console.error(`Error: Component "${name}" not found.`);
        console.error('Run `npx xds component --list` to see available components.');
        process.exit(1);
      }

      const content = fs.readFileSync(readmePath, 'utf-8');

      if (options.compact) {
        console.log(extractCompact(content, dirName));
      } else {
        console.log(cleanReadme(content, dirName));
      }
    });
}
