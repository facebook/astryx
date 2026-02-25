#!/usr/bin/env node

/**
 * @file Validate component README structure for CLI brief extractor compatibility.
 *
 * The XDS CLI's `extractBrief` function parses READMEs to generate LLM-friendly
 * docs. It expects a specific structure:
 *
 * - Multi-component directories: `### XDSComponentName` subsection per component,
 *   each with a props table and code example.
 * - Single-component directories: `## Props` section with a table.
 *
 * This script scans all packages/core/src/* directories and reports any READMEs
 * that don't follow the expected structure.
 *
 * Usage: node scripts/validate-readmes.mjs
 * Exit code: 0 if all pass, 1 if any issues found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'packages', 'core', 'src');
const SKIP_DIRS = new Set(['hooks', 'utils', 'theme', '__tests__', 'node_modules']);

/**
 * Find all XDS*.tsx component files in a directory (non-recursive),
 * excluding test files and Context files.
 */
function findComponentFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter(
      f =>
        /^XDS[A-Z]\w+\.tsx$/.test(f) &&
        !f.includes('.test') &&
        !f.includes('Context'),
    )
    .map(f => f.replace(/\.tsx$/, ''));
}

/**
 * Extract the content of a ### heading section from markdown lines.
 * Returns all lines from the heading until the next ### (or end of file).
 */
function extractSection(lines, heading) {
  const headingRe = new RegExp(`^###\\s+${escapeRegex(heading)}\\s*$`);
  let inSection = false;
  const sectionLines = [];

  for (const line of lines) {
    if (headingRe.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^###\s+/.test(line)) {
      break;
    }
    if (inSection) {
      sectionLines.push(line);
    }
  }

  return inSection ? sectionLines : null;
}

/**
 * Check if lines contain a markdown props table.
 * Looks for at least one row like `| \`propName\` |`
 */
function hasPropsTable(lines) {
  return lines.some(line => /^\|\s*`[a-zA-Z]/.test(line));
}

/**
 * Check if lines contain a code example with <XDS JSX.
 * Looks for ```tsx or ```jsx blocks containing <XDS.
 */
function hasCodeExample(lines) {
  let inCode = false;
  for (const line of lines) {
    if (/^```(?:tsx|jsx)/.test(line)) {
      inCode = true;
      continue;
    }
    if (inCode && line.startsWith('```')) {
      inCode = false;
      continue;
    }
    if (inCode && line.includes('<XDS')) {
      return true;
    }
  }
  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validate() {
  const issues = [];
  const entries = fs.readdirSync(SRC_DIR, {withFileTypes: true});

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const dirPath = path.join(SRC_DIR, entry.name);
    const components = findComponentFiles(dirPath);
    if (components.length === 0) continue;

    const readmePath = path.join(dirPath, 'README.md');
    const relReadme = path.relative(ROOT, readmePath);

    if (!fs.existsSync(readmePath)) {
      issues.push(`${relReadme}: README.md is missing.`);
      continue;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    const isMultiComponent = components.length > 1;

    if (isMultiComponent) {
      // Multi-component: each component needs ### XDSComponentName
      for (const comp of components) {
        const section = extractSection(lines, comp);

        if (!section) {
          issues.push(
            `${relReadme}: Missing section \`### ${comp}\`. ` +
              `Each component needs its own ### heading for the CLI brief extractor to work.`,
          );
          continue;
        }

        if (!hasPropsTable(section)) {
          issues.push(
            `${relReadme}: Section \`### ${comp}\` has no props table. ` +
              `Add a markdown table with | Prop | Type | Default | Description | columns.`,
          );
        }

        if (!hasCodeExample(section)) {
          issues.push(
            `${relReadme}: Section \`### ${comp}\` has no code example. ` +
              `Add a \`\`\`tsx block with <XDS JSX usage.`,
          );
        }
      }
    } else {
      // Single-component: needs ## Props with a table
      const hasPropsSection = /^## Props/m.test(content);

      if (!hasPropsSection) {
        issues.push(
          `${relReadme}: Missing \`## Props\` section. ` +
            `Single-component READMEs need a ## Props heading with a props table.`,
        );
      } else {
        // Extract the ## Props section content
        let inProps = false;
        const propsLines = [];
        for (const line of lines) {
          if (/^## Props/.test(line)) {
            inProps = true;
            continue;
          }
          if (inProps && /^## /.test(line)) break;
          if (inProps) propsLines.push(line);
        }

        if (!hasPropsTable(propsLines)) {
          issues.push(
            `${relReadme}: \`## Props\` section has no props table. ` +
              `Add a markdown table with | Prop | Type | Default | Description | columns.`,
          );
        }
      }
    }
  }

  return issues;
}

// Run validation
const issues = validate();

if (issues.length > 0) {
  console.error(`\n❌ Found ${issues.length} README structure issue(s):\n`);
  for (const issue of issues) {
    console.error(`  • ${issue}`);
  }
  console.error(
    `\nSee docs/COMPONENT_README_GUIDE.md for the expected structure.\n`,
  );
  process.exit(1);
} else {
  console.log('\n✅ All component READMEs follow the expected structure.\n');
  process.exit(0);
}
