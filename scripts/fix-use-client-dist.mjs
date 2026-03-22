#!/usr/bin/env node
/**
 * Post-build: ensure "use client" is the FIRST LINE of dist files that need it.
 * tsup may insert babel helpers before the directive — this moves it to line 1.
 * 
 * Only patches files that already have "use client" somewhere in the first 50 lines.
 * Skips files that don't have it (like theme/tokens).
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../packages/core/dist');

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.js')) results.push(full);
  }
  return results;
}

let fixed = 0;
for (const file of walk(DIST)) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  // Check if file has "use client" in first 50 lines but not on line 1
  const first50 = lines.slice(0, 50);
  const hasDirective = first50.some(l => l.trim() === "'use client';" || l.trim() === '"use client";');
  const isFirstLine = lines[0].trim() === "'use client';" || lines[0].trim() === '"use client";';
  
  if (hasDirective && !isFirstLine) {
    // Remove directive from wherever it is
    const filtered = lines.filter(l => l.trim() !== "'use client';" && l.trim() !== '"use client";');
    // Prepend at top
    const patched = '"use client";\n' + filtered.join('\n');
    fs.writeFileSync(file, patched);
    fixed++;
  }
}

console.log(`✅ Fixed "use client" position in ${fixed} dist files`);
