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

/**
 * Map top-level src/ directories to display categories.
 * New directories without a mapping will appear under "Other".
 * Adding a new component file to an existing directory requires NO changes here.
 */
const DIR_TO_CATEGORY = {
  AspectRatio: 'Layout',
  Center: 'Layout',
  Grid: 'Layout',
  Layout: 'Layout',
  Avatar: 'Display',
  Badge: 'Display',
  Divider: 'Display',
  Icon: 'Display',
  Skeleton: 'Display',
  Text: 'Display',
  CheckboxInput: 'Form',
  DateInput: 'Form',
  Field: 'Form',
  Selector: 'Form',
  Switch: 'Form',
  TextArea: 'Form',
  TextInput: 'Form',
  TimeInput: 'Form',
  Button: 'Action',
  Calendar: 'Overlay',
  Layer: 'Overlay',
};

const CATEGORY_ORDER = ['Layout', 'Display', 'Form', 'Action', 'Overlay'];
const SKIP_DIRS = new Set(['theme', 'hooks', 'utils', '__tests__', 'node_modules']);

/**
 * Auto-discover components by scanning for XDS*.tsx files in core/src/.
 * Groups them by category using the DIR_TO_CATEGORY mapping.
 */
export function discoverComponents(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  const categories = {};

  function collectXDSFiles(dirPath) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...collectXDSFiles(path.join(dirPath, entry.name)));
      } else if (
        /^XDS[A-Z]\w+\.tsx$/.test(entry.name) &&
        !entry.name.includes('.test.')
      ) {
        results.push(entry.name);
      }
    }
    return results;
  }

  const topEntries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of topEntries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const category = DIR_TO_CATEGORY[entry.name] || 'Other';
    const xdsFiles = collectXDSFiles(path.join(srcDir, entry.name));

    for (const fileName of xdsFiles) {
      const componentName = fileName.replace(/^XDS/, '').replace(/\.tsx$/, '');
      if (!categories[category]) categories[category] = [];
      if (!categories[category].includes(componentName)) {
        categories[category].push(componentName);
      }
    }
  }

  // Sort components within each category
  for (const cat of Object.keys(categories)) {
    categories[cat].sort();
  }

  // Return in defined order
  const ordered = {};
  for (const cat of CATEGORY_ORDER) {
    if (categories[cat]) ordered[cat] = categories[cat];
  }
  // Append any categories not in CATEGORY_ORDER (e.g. "Other")
  for (const cat of Object.keys(categories)) {
    if (!ordered[cat]) ordered[cat] = categories[cat];
  }

  return ordered;
}

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */
export function cleanReadme(content, componentName) {
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
export function extractCompact(content, componentName) {
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
 * and nested directories. Falls back to finding the directory
 * containing XDS{name}.tsx and returning its nearest README.
 */
export function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');

  // Direct match: src/{name}/README.md
  const direct = path.join(srcDir, name, 'README.md');
  if (fs.existsSync(direct)) return direct;

  // Nested match: src/*/{name}/README.md
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, 'README.md');
    if (fs.existsSync(nested)) return nested;
  }

  // Fallback: find the directory containing XDS{name}.tsx,
  // then return the README.md in that directory or nearest parent
  const sourcePath = findComponentSource(coreDir, name);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      const readme = path.join(dir, 'README.md');
      if (fs.existsSync(readme)) return readme;
      dir = path.dirname(dir);
    }
  }

  return null;
}

/**
 * Find the main source file for a component (XDS*.tsx, excluding tests).
 * For "Button" finds src/Button/XDSButton.tsx
 * For "Layout" finds src/Layout/XDSLayout/XDSLayout.tsx
 * For "Card" finds src/Layout/Container/XDSCard.tsx (deep search fallback)
 */
export function findComponentSource(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  const xdsName = `XDS${name}.tsx`;

  function searchDir(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});

    // Check for exact match first
    const exact = path.join(dirPath, xdsName);
    if (fs.existsSync(exact)) return exact;

    // Recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = searchDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  // Search in the component's directory
  const directDir = path.join(srcDir, name);
  if (fs.existsSync(directDir)) {
    const found = searchDir(directDir);
    if (found) return found;
  }

  // Search nested (component might be under a parent dir)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nestedDir = path.join(srcDir, entry.name, name);
    if (fs.existsSync(nestedDir)) {
      const found = searchDir(nestedDir);
      if (found) return found;
    }
  }

  // Fallback: search entire src tree for the file
  return searchDir(srcDir);
}

export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--compact', 'Token-optimized output for LLMs')
    .option('--source', 'Print component source code')
    .action((name, options) => {
      const coreDir = findCoreDir(process.cwd());

      if (!coreDir) {
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      if (options.category || options.list || !name) {
        const components = discoverComponents(coreDir);

        if (options.category) {
          const cat = options.category;
          const match = Object.entries(components).find(
            ([key]) => key.toLowerCase() === cat.toLowerCase(),
          );
          if (!match) {
            console.error(`Error: Unknown category "${cat}".`);
            console.error(
              `Available categories: ${Object.keys(components).join(', ')}`,
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

        console.log('');
        for (const [category, comps] of Object.entries(components)) {
          console.log(`${category}:`);
          for (const comp of comps) {
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

      if (options.source) {
        const sourcePath = findComponentSource(coreDir, dirName);
        if (!sourcePath) {
          console.error(`Error: Source for "${name}" not found.`);
          process.exit(1);
        }
        const source = fs.readFileSync(sourcePath, 'utf-8');
        console.log(source);
        return;
      }

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
