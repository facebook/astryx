#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Standalone validator: check built preview HTML for unresolved XDS refs
 *
 * Scans built preview HTML files and detects literal XDS component references
 * that survived the bundle — meaning they weren't imported and will crash
 * at runtime with React error #130.
 *
 * Usage:
 *   tsx src/validate-previews.ts --iterations <id1,id2,...>
 *
 * Exit code 1 if any unresolved references found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {getResultsDir} from './utils.js';

function validatePreviewHtml(htmlPath: string): string[] {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const unresolved = new Set<string>();

  // Match jsx(XDSFoo or jsxs(XDSFoo — literal unresolved references
  const pattern = /\.jsxs?\((XDS[A-Z]\w+)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    unresolved.add(match[1]);
  }

  return [...unresolved].sort();
}

function parseArgs(): {iterations: string[]} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/validate-previews.ts --iterations <id1,id2,...>',
    );
    process.exit(1);
  }

  return {iterations};
}

function main() {
  const {iterations} = parseArgs();
  const resultsDir = getResultsDir();

  console.log('\n🔍 Validating Preview HTML');
  console.log('='.repeat(40));

  let totalFiles = 0;
  let totalErrors = 0;
  const errors: Array<{file: string; components: string[]}> = [];

  for (const iterationId of iterations) {
    const previewsDir = path.join(resultsDir, iterationId, 'previews');

    if (!fs.existsSync(previewsDir)) {
      console.error(`  ⚠ No previews dir for ${iterationId}, skipping`);
      continue;
    }

    // Walk preview directories
    const promptDirs = fs.readdirSync(previewsDir).filter(d => {
      const fullPath = path.join(previewsDir, d);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const promptDir of promptDirs) {
      const dirPath = path.join(previewsDir, promptDir);
      const htmlFiles = fs
        .readdirSync(dirPath)
        .filter(f => f.endsWith('.html'));

      for (const htmlFile of htmlFiles) {
        totalFiles++;
        const htmlPath = path.join(dirPath, htmlFile);
        const unresolved = validatePreviewHtml(htmlPath);

        if (unresolved.length > 0) {
          totalErrors++;
          const relPath = `${promptDir}/${htmlFile}`;
          errors.push({file: relPath, components: unresolved});
          console.error(
            `  ✗ ${relPath}: unresolved ${unresolved.join(', ')}`,
          );
        } else {
          console.log(`  ✓ ${promptDir}/${htmlFile}`);
        }
      }
    }
  }

  console.log(`\n${totalErrors === 0 ? '✅' : '❌'} ${totalFiles} file(s) checked, ${totalErrors} error(s)`);

  if (errors.length > 0) {
    console.error('\nUnresolved XDS components will cause React error #130 at runtime.');
    console.error('Run fix-imports.ts then rebuild to fix.');
    process.exit(1);
  }
}

main();
