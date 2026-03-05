/**
 * @file component command — List components and print component docs
 *
 * `xds component --list` prints all components grouped by category.
 * `xds component <name>` prints the full component README.
 * `xds component <name> --compact` prints a token-optimized version for LLMs.
 *
 * Component docs live in typed {Name}.doc.tsx files (ComponentDoc exports).
 * This file imports them directly — no markdown parsing needed.
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
  // Layout
  AspectRatio: 'Layout',
  Center: 'Layout',
  CollapsibleGroup: 'Layout',
  Grid: 'Layout',
  Layout: 'Layout',
  Stack: 'Layout',
  // Display
  Avatar: 'Display',
  Badge: 'Display',
  Divider: 'Display',
  Icon: 'Display',
  Skeleton: 'Display',
  Table: 'Display',
  Text: 'Display',
  // Form
  CheckboxInput: 'Form',
  DateInput: 'Form',
  Field: 'Form',
  NumberInput: 'Form',
  RadioList: 'Form',
  Selector: 'Form',
  Slider: 'Form',
  Switch: 'Form',
  TextArea: 'Form',
  TextInput: 'Form',
  TimeInput: 'Form',
  // Action
  Button: 'Action',
  CloseButton: 'Action',
  DropdownMenu: 'Action',
  Link: 'Action',
  // Navigation
  TabList: 'Navigation',
  TopNav: 'Navigation',
  // Overlay
  Calendar: 'Overlay',
  Dialog: 'Overlay',
  Layer: 'Overlay',
};

const CATEGORY_ORDER = ['Layout', 'Display', 'Form', 'Action', 'Navigation', 'Overlay'];
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
        !entry.name.includes('.test.') &&
        !entry.name.includes('Context.')
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
 * Load the typed docs object from a README.tsx file.
 * The CLI runs under tsx, which handles TypeScript imports natively.
 */
export async function loadDocs(readmePath) {
  const mod = await import(pathToFileURL(readmePath).href);
  return mod.docs;
}

/**
 * Find the doc file for a component, checking both top-level
 * and nested directories. Prefers {Name}.doc.tsx, then README.tsx,
 * then README.md (for backward compatibility with tests).
 */
export function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  // Preferred: {Name}.doc.tsx, then README.tsx, then README.md
  const docNames = [`${name}.doc.tsx`, 'README.tsx', 'README.md'];

  for (const docName of docNames) {
    // Direct match: src/{name}/{Name}.doc.tsx (or README.tsx/md)
    const direct = path.join(srcDir, name, docName);
    if (fs.existsSync(direct)) return direct;
  }

  // Nested match: src/*/{name}/{Name}.doc.tsx (or README.tsx/md)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const docName of docNames) {
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nested = path.join(srcDir, entry.name, name, docName);
      if (fs.existsSync(nested)) return nested;
    }
  }

  // Fallback: find the directory containing XDS{name}.tsx,
  // then return the doc file in that directory or nearest parent
  const sourcePath = findComponentSource(coreDir, name);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      for (const docName of docNames) {
        const docFile = path.join(dir, docName);
        if (fs.existsSync(docFile)) return docFile;
      }
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

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Used for fuzzy-matching component names. Dependency-free.
 */
export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Find the closest component names to a given (possibly misspelled) name.
 * Returns matches sorted by distance, filtered to maxDistance.
 */
export function findClosestComponents(name, components, maxDistance = 3) {
  const allNames = Object.values(components).flat();
  const needle = name.toLowerCase();

  const matches = allNames
    .map(comp => ({
      name: comp,
      distance: levenshteinDistance(needle, comp.toLowerCase()),
    }))
    .filter(m => m.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return matches;
}

/**
 * Resolve the import path for a component.
 * Returns e.g. '@xds/core/Table' or '@xds/core' depending on package.json exports.
 */
export function resolveImportPath(coreDir, componentName) {
  const srcDir = path.join(coreDir, 'src');
  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@xds/core';

  // Get the top-level directory under src/ from the source path
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  // Check package.json exports for ./${topDir}
  const pkgPath = path.join(coreDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.exports && pkg.exports[`./${topDir}`]) {
      return `@xds/core/${topDir}`;
    }
  }

  return '@xds/core';
}

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

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

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Used for fuzzy-matching component names. Dependency-free.
 */
export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Find the closest component names to a given (possibly misspelled) name.
 * Returns matches sorted by distance, filtered to maxDistance.
 */
export function findClosestComponents(name, components, maxDistance = 3) {
  const allNames = Object.values(components).flat();
  const needle = name.toLowerCase();

  const matches = allNames
    .map(comp => ({
      name: comp,
      distance: levenshteinDistance(needle, comp.toLowerCase()),
    }))
    .filter(m => m.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return matches;
}

/**
 * Extract a brief, LLM-optimized summary from a README.
 *
 * Format: component signature + key props + one usage example.
 * Targets ~200-400 chars per component (vs ~2-3KB for --compact).
 *
 * Example output:
 *   Button(variant: primary|secondary|ghost|destructive, size: sm|md|lg)
 *     label: string (required) · isLoading isDisabled icon tooltip children
 *     <XDSButton variant="primary" onClick={fn}>Save</XDSButton>
 */
export function extractBrief(content, componentName, importHint) {
  const displayName = componentName.startsWith('XDS')
    ? componentName
    : `XDS${componentName}`;

  const lines = content.split('\n');

  // 1. Extract first paragraph as description
  let description = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) continue;
    if (line === '') continue;
    if (line.startsWith('|') || line.startsWith('```')) break;
    description = line;
    break;
  }

  // 2. Extract props from the Props table
  //    Supports two README layouts:
  //    a) Single-component: `## Props` section with a table
  //    b) Multi-component: `### XDSComponentName` subsection with a table
  const props = [];
  let inPropsTable = false;
  let headerParsed = false;
  let inComponentSection = false;

  // For multi-component READMEs, find the section for this specific component
  const componentSectionRe = new RegExp(
    `^###\\s+${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`
  );

  for (const line of lines) {
    // Detect `## Props` (single-component layout)
    if (/^#{2,3}\s+Props/.test(line)) {
      inPropsTable = true;
      headerParsed = false;
      continue;
    }

    // Detect `### XDSComponentName` (multi-component layout)
    if (componentSectionRe.test(line)) {
      inComponentSection = true;
      continue;
    }

    // Exit component section when hitting another ### heading
    if (inComponentSection && /^###\s+/.test(line) && !componentSectionRe.test(line)) {
      inComponentSection = false;
      if (inPropsTable) inPropsTable = false;
      continue;
    }

    // Within a component section, a pipe-delimited table is a props table
    if (inComponentSection && !inPropsTable && /^\|\s*`?Prop/.test(line)) {
      inPropsTable = true;
      headerParsed = false;
      // Don't continue — let the header row logic below handle it
    }

    if (inPropsTable && /^#{2,3}\s+/.test(line) && !/Props/.test(line) && !inComponentSection) {
      inPropsTable = false;
      continue;
    }
    if (!inPropsTable) continue;

    // Skip table header separator
    if (/^\|\s*-/.test(line)) {
      headerParsed = true;
      continue;
    }
    // Skip the header row itself
    if (!headerParsed && /^\|\s*`?Prop/.test(line)) continue;

    // Parse prop row: | `name` | `type` | `default` | description |
    const cells = line
      .split('|')
      .map(c => c.trim().replace(/`/g, ''))
      .filter(Boolean);
    if (cells.length >= 3) {
      const name = cells[0];
      const type = cells[1];
      const defaultVal = cells[2] || '';
      const desc = cells[3] || '';

      // Skip internal/style props
      if (['xstyle', 'data-testid', 'className', 'style'].includes(name))
        continue;

      props.push({name, type, defaultVal, desc});
    }
  }

  // 3. Build signature line from variant/size/type/level props
  const signatureProps = [];
  const otherProps = [];

  for (const prop of props) {
    // Props with union types go in the signature
    if (prop.type.includes('|') && !prop.type.includes('ReactNode')) {
      const values = prop.type
        .replace(/['"]/g, '')
        .split('|')
        .map(v => v.trim())
        .join('|');
      signatureProps.push(`${prop.name}: ${values}`);
    } else if (prop.desc.includes('required') || prop.defaultVal === '—' || prop.defaultVal === '-') {
      otherProps.unshift(`${prop.name}: ${prop.type.split('|')[0].trim()}`);
    } else {
      otherProps.push(prop.name);
    }
  }

  // 4. Extract first code example
  //    For multi-component READMEs, prefer examples from the component's section
  let example = '';
  let fallbackExample = '';
  let inCode = false;
  let inCompSection = false;

  for (const line of lines) {
    // Track whether we're in this component's subsection
    if (componentSectionRe.test(line)) {
      inCompSection = true;
      continue;
    }
    if (inCompSection && /^###\s+/.test(line) && !componentSectionRe.test(line)) {
      inCompSection = false;
    }

    if (line.startsWith('```tsx') || line.startsWith('```jsx')) {
      inCode = true;
      continue;
    }
    if (inCode && line.startsWith('```')) {
      inCode = false;
      continue;
    }
    if (inCode) {
      const trimmed = line.trim();
      // Take the first substantial JSX line
      if (trimmed.startsWith('<XDS') || trimmed.startsWith('<')) {
        if (inCompSection && !example) {
          // Prefer example from this component's section
          example = trimmed;
        } else if (!fallbackExample) {
          // Fallback: first example from anywhere in the README
          fallbackExample = trimmed;
        }
        if (example) break; // Found one in the right section, done
      }
    }
  }
  // Use component-section example if found, otherwise fallback
  if (!example) example = fallbackExample;

  // 5. Build output
  const output = [];

  // Signature line
  const sigStr =
    signatureProps.length > 0
      ? `${displayName}(${signatureProps.join(', ')})`
      : displayName;
  output.push(importHint ? `${sigStr}  ← from '${importHint}'` : sigStr);

  // Description (shortened)
  if (description) {
    const shortDesc =
      description.length > 80
        ? description.slice(0, 77) + '...'
        : description;
    output.push(`  ${shortDesc}`);
  }

  // Other props
  if (otherProps.length > 0) {
    output.push(`  ${otherProps.join(' · ')}`);
  }

  // Example
  if (example) {
    output.push(`  ${example}`);
  }

  // Warn on stderr when extraction is incomplete (doesn't pollute brief output)
  if (props.length === 0) {
    console.warn(
      `⚠️  No props found for ${displayName}. Ensure README has a '### ${displayName}' section with a props table.`,
    );
  }
  if (!example) {
    console.warn(`⚠️  No code example found for ${displayName}.`);
  }

  return output.join('\n') + '\n';
}

/**
 * Extract brief summaries for ALL components in one output.
 * One read, zero round-trips — the LLM gets enough to use any component.
 */
export function extractBriefAll(coreDir) {
  const components = discoverComponents(coreDir);
  const output = [];

  // Add xstyle override hint at the top
  output.push(
    `> **Style overrides:** Most components accept an \`xstyle\` prop.`,
    `> Use inline objects for simple overrides: \`xstyle={{ maxWidth: 300 }}\``,
    `> Use \`stylex.create()\` for pseudo-classes/media queries or 3+ properties.`,
    `> See \`npx xds docs principles\` for details.\n`,
  );

  for (const [category, comps] of Object.entries(components)) {
    output.push(`## ${category}\n`);
    for (const comp of comps) {
      const readmePath = findComponentReadme(coreDir, comp);
      if (readmePath) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        const importPath = resolveImportPath(coreDir, comp);
        output.push(extractBrief(content, comp, importPath));
      } else {
        output.push(`XDS${comp}\n  (no docs)\n`);
      }
    }
  }

  return output.join('\n');
}

/**
 * Resolve the import path for a component.
 * Returns e.g. '@xds/core/Table' or '@xds/core' depending on package.json exports.
 */
export function resolveImportPath(coreDir, componentName) {
  const srcDir = path.join(coreDir, 'src');
  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@xds/core';

  // Get the top-level directory under src/ from the source path
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  // Check package.json exports for ./${topDir}
  const pkgPath = path.join(coreDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.exports && pkg.exports[`./${topDir}`]) {
      return `@xds/core/${topDir}`;
    }
  }

  return '@xds/core';
}

/**
 * Ensure compact output includes an import statement.
 * If the output already contains `from '@xds/core`, returns as-is.
 * Otherwise, injects an ## Import section after the title/description,
 * before the first ## section.
 */
export function ensureImportStatement(compactOutput, componentName, coreDir) {
  // Already has an Import section — return as-is
  if (/^## Import$/m.test(compactOutput)) {
    return compactOutput;
  }

  const displayName = componentName.startsWith('XDS')
    ? componentName
    : `XDS${componentName}`;

  const importPath = resolveImportPath(coreDir, componentName);
  const importBlock = `## Import\n\n\`\`\`tsx\nimport { ${displayName} } from '${importPath}';\n\`\`\`\n`;

  // Find the first ## section and inject before it
  const lines = compactOutput.split('\n');
  const output = [];
  let injected = false;

  for (let i = 0; i < lines.length; i++) {
    if (!injected && lines[i].startsWith('## ')) {
      output.push(importBlock);
      injected = true;
    }
    output.push(lines[i]);
  }

  // If no ## section found, append at the end
  if (!injected) {
    output.push('');
    output.push(importBlock);
  }

  return output.join('\n');
}

/**
 * Extract only the Props section(s) from a README.
 * Useful for quick reference and LLM context.
 */
export function extractProps(content, componentName) {
  const lines = content.split('\n');
  const output = [];
  let inPropsSection = false;
  let sectionDepth = 0;

  for (const line of lines) {
    // Detect Props section (## Props or ### XDSFoo Props)
    if (/^#{2,3}\s+.*Props/.test(line)) {
      inPropsSection = true;
      sectionDepth = line.match(/^(#+)/)[1].length;
      output.push(line);
      continue;
    }

    // Exit props section when hitting another section at same or higher level
    if (inPropsSection && /^#{2,3}\s+/.test(line) && !line.includes('Props')) {
      const depth = line.match(/^(#+)/)[1].length;
      if (depth <= sectionDepth) {
        inPropsSection = false;
        continue;
      }
    }

    if (inPropsSection) {
      output.push(line);
    }
  }

  if (output.length === 0) {
    return `No props documentation found for ${componentName}.\n`;
  }

  // Trim trailing blank lines
  while (output.length > 0 && output[output.length - 1].trim() === '') {
    output.pop();
  }

  return output.join('\n') + '\n';
}

export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--compact', 'Token-optimized output for LLMs')
    .option('--brief', 'Minimal LLM output: signature + props + one example (~200 chars)')
    .option('--brief-all', 'Brief summaries of ALL components in one output')
    .option('--props', 'Print only the props table')
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

      if (options.briefAll) {
        console.log(extractBriefAll(coreDir));
        return;
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

      let readmePath = findComponentReadme(coreDir, dirName);
      let resolvedName = dirName;

      if (!readmePath) {
        // Try fuzzy matching
        const components = discoverComponents(coreDir);
        const closest = findClosestComponents(dirName, components);

        if (closest.length === 1) {
          resolvedName = closest[0].name;
          readmePath = findComponentReadme(coreDir, resolvedName);
          if (readmePath) {
            console.log(`Did you mean ${resolvedName}?\n`);
          }
        } else if (closest.length > 1) {
          console.error(`Component "${name}" not found. Did you mean one of these?\n`);
          for (const match of closest) {
            console.error(`  ${match.name}`);
          }
          console.error('');
          process.exit(1);
        }

        if (!readmePath) {
          console.error(`Error: Component "${name}" not found.`);
          console.error('Run `npx xds component --list` to see available components.');
          process.exit(1);
        }
      }

      const content = fs.readFileSync(readmePath, 'utf-8');

      if (options.props) {
        console.log(extractProps(content, resolvedName));
      } else if (options.brief) {
        console.log(extractBrief(content, resolvedName));
      } else if (options.compact) {
        const compact = extractCompact(content, resolvedName);
        console.log(ensureImportStatement(compact, resolvedName, coreDir));
      } else {
        console.log(cleanReadme(content, resolvedName));
      }
    });
}
