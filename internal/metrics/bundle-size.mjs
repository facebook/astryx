#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const packagesDir = join(root, 'packages');

function dirSize(path) {
  let total = 0;
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    const st = statSync(full);
    if (st.isDirectory()) total += dirSize(full);
    else total += st.size;
  }
  return total;
}

const rows = [];
for (const name of readdirSync(packagesDir)) {
  const dist = join(packagesDir, name, 'dist');
  try {
    if (statSync(dist).isDirectory()) {
      rows.push({ package: name, bytes: dirSize(dist) });
    }
  } catch {
    // skip
  }
}

rows.sort((a, b) => b.bytes - a.bytes);
let failed = false;
for (const row of rows) {
  const kb = (row.bytes / 1024).toFixed(1);
  console.log(`@jedi/${row.package}: ${kb} KB`);
  if (row.bytes > 50 * 1024) {
    console.error(`WARN [bundle]: @jedi/${row.package} exceeds 50KB (${kb} KB)`);
  }
}
console.log(`PASS: bundle report (${rows.length} packages)`);
