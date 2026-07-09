#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Source check: verify files using React client APIs have "use client"
 * as their first statement — only comments (copyright header, JSDoc) and
 * blank lines may precede it, matching the directive-prologue rules that
 * React and bundlers apply. The Babel CLI 1:1 build preserves a directive
 * in this position.
 *
 * Usage: node scripts/check-use-client.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../packages/core/src');

const CLIENT_APIS = [
  'createContext',
  'useContext',
  'useState',
  'useEffect',
  'useRef',
  'useCallback',
  'useMemo',
  'useReducer',
  'useId',
  'useTransition',
  'useOptimistic',
  'useSyncExternalStore',
  'useLayoutEffect',
  'useInsertionEffect',
  'useImperativeHandle',
  'useDeferredValue',
];

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (
      /\.[jt]sx?$/.test(entry.name) &&
      !entry.name.includes('.test.') &&
      !entry.name.includes('.stories.') &&
      !entry.name.includes('.doc.') &&
      !entry.name.includes('.perf.') &&
      !entry.name.endsWith('.d.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Check if a file imports React client APIs from 'react'.
 * Only matches actual import statements, not comments or strings.
 */
function usesClientAPI(content) {
  return CLIENT_APIS.some(api => {
    const importPattern = new RegExp(
      `import\\s+[^;]*\\b${api}\\b[^;]*from\\s+['"]react['"]`,
    );
    return importPattern.test(content);
  });
}

function isUseClientLine(line) {
  const trimmed = line.trim();
  return trimmed === "'use client';" || trimmed === '"use client";';
}

// Index of the first line that is code — skipping blank lines, line
// comments, and block comments (including JSDoc). A directive is only
// effective when it appears before any statement, so this is where
// "use client" must sit.
function firstStatementLine(lines) {
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    let rest = lines[i].trim();
    while (rest !== '') {
      if (inBlockComment) {
        const end = rest.indexOf('*/');
        if (end === -1) break;
        inBlockComment = false;
        rest = rest.slice(end + 2).trim();
      } else if (rest.startsWith('//')) {
        break;
      } else if (rest.startsWith('/*')) {
        inBlockComment = true;
        rest = rest.slice(2);
      } else {
        return i;
      }
    }
  }
  return -1;
}

const files = walk(SRC_DIR);
const errors = [];
let checked = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(SRC_DIR, file);

  if (!usesClientAPI(content)) continue;
  checked++;

  const lines = content.split('\n');

  // Find all directive locations
  const directiveLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (isUseClientLine(lines[i])) directiveLines.push(i);
  }

  if (directiveLines.length === 0) {
    errors.push({file: rel, issue: 'missing directive'});
  } else if (directiveLines.length > 1) {
    errors.push({file: rel, issue: `duplicate directives (lines ${directiveLines.map(l => l + 1).join(', ')})`});
  } else if (directiveLines[0] !== firstStatementLine(lines)) {
    errors.push({
      file: rel,
      issue: `directive on line ${directiveLines[0] + 1} — must be the first statement (only comments and blank lines may precede it)`,
    });
  }
}

if (errors.length > 0) {
  console.error('❌ "use client" directive errors:\n');
  for (const {file, issue} of errors) {
    console.error(`  ${file}: ${issue}`);
  }
  console.error(
    `\n${errors.length} error(s). Fix: 'use client' must be the first statement, no duplicates.`,
  );
  process.exit(1);
}

console.log(
  `✅ ${checked} client-API files checked — all have "use client" as their first statement.`,
);
