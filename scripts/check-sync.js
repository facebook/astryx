#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * SYNC Comment Night Watch
 *
 * Checks that SYNC comments in component files are accurate and complete.
 *
 * Invariants:
 * 1. No README.md coexisting with a doc.mjs in the same component dir
 * 2. No SYNC comments referencing files that don't exist
 * 3. Every component with a showcase dir has a SYNC reference to it
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.join(ROOT, 'packages/core/src');
const SHOWCASE_DIR = path.join(
  ROOT,
  'packages/cli/templates/blocks/components',
);

const violations = [];

function addViolation(type, file, message) {
  violations.push({type, file, message});
}

// A component source file is `XDS{Name}.tsx` today, or the bare `{Name}.tsx`
// after the XDS-prefix migration (P2380608025, P4). Match both, excluding
// tests, `use*` hooks, and `*Context.*` files. As in component discovery, a
// BARE-named file is only treated as a component when a sibling doc exists
// (`{Name}.doc.mjs` or `XDS{Name}.doc.mjs`) — otherwise internal PascalCase
// helpers (OverlayScrim.tsx, PowerSearchEditPopover.tsx, ...) would be
// misclassified. Prefixed files keep their existing behavior.
// Mirrors packages/cli/src/lib/component-discovery.mjs (inlined; CommonJS).
function isComponentSourceFile(fileName, dirPath) {
  if (!fileName.endsWith('.tsx')) return false;
  if (fileName.includes('.test.') || fileName.includes('Context.')) {
    return false;
  }
  if (/^XDS[A-Z]\w+\.tsx$/.test(fileName)) return true;
  if (/^[A-Z]\w+\.tsx$/.test(fileName)) {
    const base = fileName.slice(0, -'.tsx'.length);
    return (
      fs.existsSync(path.join(dirPath, `${base}.doc.mjs`)) ||
      fs.existsSync(path.join(dirPath, `XDS${base}.doc.mjs`))
    );
  }
  return false;
}

// Get all component directories (dirs with at least one component source file)
const componentDirs = fs
  .readdirSync(CORE_SRC, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => {
    const dirPath = path.join(CORE_SRC, name);
    return fs
      .readdirSync(dirPath)
      .some((f) => isComponentSourceFile(f, dirPath));
  });

for (const comp of componentDirs) {
  const dirPath = path.join(CORE_SRC, comp);
  const files = fs.readdirSync(dirPath);

  // --- Check 1: Stale README.md ---
  const hasDocMjs = files.some((f) => f.endsWith('.doc.mjs'));
  const hasReadme = files.includes('README.md');
  if (hasDocMjs && hasReadme) {
    addViolation(
      'stale-readme',
      `${comp}/README.md`,
      `README.md coexists with doc.mjs — remove the README`,
    );
  }

  // --- Check 2 & 3: SYNC references ---
  const xdsFiles = files.filter((f) => isComponentSourceFile(f, dirPath));

  for (const xdsFile of xdsFiles) {
    const filePath = path.join(dirPath, xdsFile);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('SYNC:')) continue;

    // Extract all SYNC bullet paths
    const syncRefs = [];
    const lines = content.split('\n');
    let inSync = false;
    for (const line of lines) {
      if (line.includes('SYNC:')) {
        inSync = true;
        continue;
      }
      if (inSync) {
        const match = line.match(/\*\s*-\s*(\/[^\s()]+)/);
        if (match) {
          syncRefs.push(match[1]);
        } else if (
          line.trim() === '*' ||
          line.trim() === '*/' ||
          line.includes('Last synced') ||
          line.includes('@')
        ) {
          break;
        }
      }
    }

    // Check 2: All referenced paths exist
    for (const ref of syncRefs) {
      const absPath = path.resolve(ROOT, ref.slice(1)); // strip leading /
      if (!fs.existsSync(absPath)) {
        addViolation(
          'dead-ref',
          `${comp}/${xdsFile}`,
          `SYNC references non-existent path: ${ref}`,
        );
      }
    }

    // Check 3: Showcase dir referenced if it exists
    const showcasePath = path.join(SHOWCASE_DIR, comp);
    if (fs.existsSync(showcasePath)) {
      const hasShowcaseRef = syncRefs.some((r) =>
        r.includes(`blocks/components/${comp}/`),
      );
      if (!hasShowcaseRef) {
        addViolation(
          'missing-showcase',
          `${comp}/${xdsFile}`,
          `Has SYNC block but no showcase reference (dir exists at packages/cli/templates/blocks/components/${comp}/)`,
        );
      }
    }
  }
}

// --- Report ---
if (violations.length === 0) {
  console.log('✅ All SYNC comments are clean.');
  process.exit(0);
} else {
  console.log(`❌ Found ${violations.length} SYNC violation(s):\n`);

  const byType = {};
  for (const v of violations) {
    (byType[v.type] ??= []).push(v);
  }

  for (const [type, items] of Object.entries(byType)) {
    const label = {
      'stale-readme': '📄 Stale README.md (coexists with doc.mjs)',
      'dead-ref': '💀 Dead SYNC references (file does not exist)',
      'missing-showcase': '🎨 Missing showcase SYNC reference',
    }[type];
    console.log(`${label}:`);
    for (const item of items) {
      console.log(`  ${item.file}: ${item.message}`);
    }
    console.log();
  }
  process.exit(1);
}
