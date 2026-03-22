#!/usr/bin/env node
/**
 * Post-build check: verify source files using React client APIs
 * have "use client" directive. Exits non-zero on failures.
 *
 * This ensures that tsup shared chunks can preserve the directive
 * (tsup only propagates it when ALL source files in a chunk have it).
 *
 * Usage: node scripts/check-use-client.mjs
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../packages/core/src');

const CLIENT_APIS = [
  'createContext', 'useContext', 'useState', 'useEffect',
  'useRef', 'useCallback', 'useMemo', 'useReducer',
  'useId', 'useTransition', 'useOptimistic',
];

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (/\.[jt]sx?$/.test(entry.name) && !entry.name.includes('.test.') && !entry.name.includes('.perf.') && !entry.name.includes('.doc.')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(SRC_DIR);
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');

  // Skip barrel files (index.ts) that only re-export
  const basename = path.basename(file);
  if (basename === 'index.ts' || basename === 'index.tsx') continue;

  // Skip type-only files
  if (basename === 'types.ts' || basename === 'types.tsx') continue;

  // Check if the file actually imports/uses React client APIs
  const usesClientAPI = CLIENT_APIS.some(api => {
    // Match import statements that import the API from 'react'
    const importPattern = new RegExp(`import\\s+.*\\b${api}\\b.*from\\s+['"]react['"]`);
    if (importPattern.test(content)) return true;
    // Match direct calls (for createContext etc.)
    const callPattern = new RegExp(`\\b${api}\\s*[<(]`);
    return callPattern.test(content);
  });
  if (!usesClientAPI) continue;

  const firstLine = content.split('\n')[0].trim();
  if (firstLine !== '"use client";' && firstLine !== "'use client';") {
    failures.push(path.relative(SRC_DIR, file));
  }
}

if (failures.length > 0) {
  console.error('\u274c Source files using React client APIs without "use client":');
  for (const f of failures) console.error(`   ${f}`);
  console.error(`\n${failures.length} file(s) need "use client" directive.`);
  console.error("Add 'use client'; as the first line of each file.");
  console.error('\nWhy: tsup with splitting only propagates "use client" to shared chunks');
  console.error('when ALL source files contributing to that chunk have the directive.');
  process.exit(1);
}

console.log(`\u2705 ${files.length} source files checked \u2014 all client API files have "use client".`);
