#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const packagesDir = join(root, 'packages');
const snapshotPath = join(dirname(fileURLToPath(import.meta.url)), 'api-snapshot.json');

function extractExports(dts) {
  const names = new Set();
  for (const match of dts.matchAll(/export\s+(?:declare\s+)?(?:function|const|class|interface|type)\s+(\w+)/g)) {
    names.add(match[1]);
  }
  for (const match of dts.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }
  return [...names].sort();
}

const snapshot = {};
for (const name of readdirSync(packagesDir)) {
  const dts = join(packagesDir, name, 'dist', 'index.d.ts');
  try {
    if (statSync(dts).isFile()) {
      snapshot[name] = extractExports(readFileSync(dts, 'utf8'));
    }
  } catch {
    // skip
  }
}

let previous = {};
try {
  previous = JSON.parse(readFileSync(snapshotPath, 'utf8'));
} catch {
  // first run
}

const changed = [];
for (const [pkg, exports] of Object.entries(snapshot)) {
  const prev = previous[pkg] ?? [];
  const added = exports.filter((e) => !prev.includes(e));
  const removed = prev.filter((e) => !exports.includes(e));
  if (added.length || removed.length) {
    changed.push({ pkg, added, removed });
  }
}

writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n');

if (Object.keys(previous).length && changed.length) {
  for (const { pkg, added, removed } of changed) {
    if (added.length) console.log(`INFO [api]: @jedi/${pkg} added: ${added.join(', ')}`);
    if (removed.length) console.log(`INFO [api]: @jedi/${pkg} removed: ${removed.join(', ')}`);
  }
}
console.log(`PASS: API snapshot (${Object.keys(snapshot).length} packages)`);
