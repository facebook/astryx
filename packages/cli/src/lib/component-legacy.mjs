/**
 * @file Legacy README.md parsing — extract docs from markdown files
 *
 * These functions parse raw README.md content using regex.
 * They exist for backward compatibility with components that
 * haven't been converted to .doc.mjs format yet.
 * Delete this file when all components have .doc.mjs files.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {discoverComponents, findComponentReadme, resolveImportPath} from './component-discovery.mjs';

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
 * Extract a brief, LLM-optimized summary from a README.
 *
 * Format: component signature + key props + one usage example.
 * Targets ~200-400 chars per component (vs ~2-3KB for --detail compact).
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

// ── Format functions ────────────────────────────────────────────────
// These operate on the typed ComponentDoc object directly.
// Used by the CLI action handler for .doc.mjs files.

/**
 * Render a props array as a markdown table.
 */