#!/usr/bin/env node
/**
 * Source check: verify files using React client APIs have "use client"
 * as their FIRST LINE (before any comments or JSDoc).
 *
 * This ensures tsup (with splitting: false) preserves the directive
 * in each self-contained entry point.
 *
 * Usage: node scripts/check-use-client.mjs
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

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
  } else if (directiveLines[0] !== 0) {
    errors.push({
      file: rel,
      issue: `directive on line ${directiveLines[0] + 1} — must be the first line`,
    });
  }
}

if (errors.length > 0) {
  console.error('❌ "use client" directive errors:\n');
  for (const {file, issue} of errors) {
    console.error(`  ${file}: ${issue}`);
  }
  console.error(
    `\n${errors.length} error(s). Fix: 'use client' must be line 1, no duplicates.`,
  );
  process.exit(1);
}

console.log(
  `✅ ${checked} client-API files checked — all have "use client" on line 1.`,
);
