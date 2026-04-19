#!/usr/bin/env node
/**
 * @file Standalone codemod: fix missing XDS imports in vibe test results
 *
 * Scans .tsx files in results directories and adds missing XDS component
 * imports. Use after running vibe tests but before building previews,
 * or as a bulk-fix for existing results.
 *
 * Usage:
 *   tsx src/fix-imports.ts --iterations <id1,id2,...>
 *   tsx src/fix-imports.ts --iterations <id> --dry-run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {getResultsDir, readJson} from './utils.js';

function fixMissingXDSImports(filePath: string, dryRun: boolean): string[] {
  const code = fs.readFileSync(filePath, 'utf-8');

  // Find all XDS component references used in JSX
  const usedComponents = new Set<string>();
  const jsxPattern = /(?:<|jsxs?\(\s*)(XDS\w+)/g;
  let match;
  while ((match = jsxPattern.exec(code)) !== null) {
    usedComponents.add(match[1]);
  }
  if (usedComponents.size === 0) return [];

  // Find already-imported XDS components
  const importedComponents = new Set<string>();
  const importPattern =
    /import\s*\{([^}]+)\}\s*from\s*['"]@xds\/core[^'"]*['"]/g;
  while ((match = importPattern.exec(code)) !== null) {
    for (const specifier of match[1].split(',')) {
      const name = specifier
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (name.startsWith('XDS')) importedComponents.add(name);
    }
  }

  const missing = [...usedComponents].filter(c => !importedComponents.has(c));
  if (missing.length === 0) return [];

  if (!dryRun) {
    const importLine = `import {${missing.sort().join(', ')}} from '@xds/core';\n`;
    fs.writeFileSync(filePath, importLine + code);
  }

  return missing.sort();
}

function parseArgs(): {iterations: string[]; dryRun: boolean} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/fix-imports.ts --iterations <id1,id2,...> [--dry-run]',
    );
    process.exit(1);
  }

  return {iterations, dryRun};
}

function main() {
  const {iterations, dryRun} = parseArgs();
  const resultsDir = getResultsDir();

  console.log(`\n🔧 Fix Missing XDS Imports${dryRun ? ' (dry run)' : ''}`);
  console.log('='.repeat(40));

  let totalFixed = 0;
  let totalFiles = 0;

  for (const iterationId of iterations) {
    const iterDir = path.join(resultsDir, iterationId);
    const manifestPath = path.join(iterDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.error(`  ⚠ No manifest for ${iterationId}, skipping`);
      continue;
    }

    const iterManifest = readJson<{config?: {target?: string}}>(manifestPath);
    const target = iterManifest.config?.target ?? 'xds';

    // Only XDS targets need import fixing
    if (target !== 'xds') {
      console.log(`  ⏭ ${iterationId} is ${target}, skipping`);
      continue;
    }

    const codeDir = path.join(iterDir, 'results');
    if (!fs.existsSync(codeDir)) continue;

    const files = fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx'));

    for (const file of files) {
      totalFiles++;
      const filePath = path.resolve(codeDir, file);
      const promptId = path.basename(file, '.tsx');
      const fixed = fixMissingXDSImports(filePath, dryRun);

      if (fixed.length > 0) {
        totalFixed++;
        const action = dryRun ? 'would fix' : 'fixed';
        console.log(`  ⚡ ${promptId}: ${action} ${fixed.join(', ')}`);
      }
    }
  }

  console.log(
    `\n✅ ${totalFixed}/${totalFiles} file(s) ${dryRun ? 'would need' : 'needed'} import fixes`,
  );
}

main();
