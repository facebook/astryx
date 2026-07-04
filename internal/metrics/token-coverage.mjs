#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const packagesDir = join(root, 'packages');
const RAW_CORE_PATTERN = /--jedi-color-[a-z0-9-]+/g;
const SCAN_PACKAGES = ['react', 'foundation', 'patterns', 'docs'];

let failed = false;
let totalRaw = 0;

for (const pkg of SCAN_PACKAGES) {
  const srcDir = join(packagesDir, pkg, 'src');
  try {
    statSync(srcDir);
  } catch {
    continue;
  }
  for (const file of readdirSync(srcDir)) {
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    const content = readFileSync(join(srcDir, file), 'utf8');
    const matches = content.match(RAW_CORE_PATTERN) ?? [];
    if (matches.length > 0) {
      totalRaw += matches.length;
      console.log(`INFO [token-coverage]: @jedi/${pkg}/${file} — ${matches.length} raw core color refs`);
      for (const m of [...new Set(matches)]) {
        console.log(`  ${m}`);
      }
    }
  }
}

if (totalRaw > 0) {
  console.log(`WARN [token-coverage]: ${totalRaw} raw core color references (Gate 2 baseline — migrate post-freeze)`);
} else {
  console.log('PASS: no raw core color references in scanned packages');
}
