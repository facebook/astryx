#!/usr/bin/env node
/**
 * @file postbuild-use-client.mjs
 * @position Post-build script for @xds/core
 *
 * When tsup runs with `splitting: true`, esbuild creates shared chunks that
 * may combine code from 'use client' source files with non-client code. The
 * 'use client' directive is dropped from the output because esbuild doesn't
 * understand React directives.
 *
 * This script restores the directive by:
 * 1. Scanning source files to find which ones have 'use client'
 * 2. Reading the esbuild metafile (written by tsup with `metafile: true`)
 * 3. For each output file, checking if ANY of its inputs are client files
 * 4. Prepending 'use client';\n to matching output files
 *
 * Usage: node scripts/postbuild-use-client.mjs
 */

import {readFileSync, writeFileSync, readdirSync, existsSync} from 'fs';
import {join, relative, resolve} from 'path';

// When called from package.json build script, cwd is packages/core/
// When called from repo root, we need packages/core/
// Detect based on whether src/ exists in cwd
const CORE_DIR = existsSync(join(process.cwd(), 'src'))
  ? process.cwd()
  : resolve(process.cwd(), 'packages/core');
const SRC_DIR = join(CORE_DIR, 'src');
const DIST_DIR = join(CORE_DIR, 'dist');

const PROCESSABLE_EXTS = ['.mjs', '.js', '.cjs'];
const SKIP_PATTERNS = ['.d.ts', '.d.mts', '.d.cts', '.css', '.json', '.map'];

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function findClientSourceFiles() {
  const clientFiles = new Set();
  for (const filePath of walkDir(SRC_DIR)) {
    if (!/\.[jt]sx?$/.test(filePath)) continue;
    try {
      const content = readFileSync(filePath, 'utf8');
      const firstLine = content.split('\n')[0].trim();
      if (firstLine === "'use client';" || firstLine === '"use client";' ||
          firstLine === "'use client'" || firstLine === '"use client"') {
        clientFiles.add(relative(CORE_DIR, filePath));
      }
    } catch { /* skip */ }
  }
  return clientFiles;
}

function shouldProcess(filePath) {
  if (SKIP_PATTERNS.some(pat => filePath.endsWith(pat))) return false;
  return PROCESSABLE_EXTS.some(ext => filePath.endsWith(ext));
}

function hasUseClientDirective(content) {
  const firstLine = content.split('\n')[0].trim();
  return firstLine === "'use client';" || firstLine === '"use client";' ||
         firstLine === "'use client'" || firstLine === '"use client"';
}

function main() {
  console.log('postbuild-use-client: scanning for client directives...');

  const clientSourceFiles = findClientSourceFiles();
  console.log(`   Found ${clientSourceFiles.size} source files with 'use client'`);

  const formats = ['esm', 'cjs'];
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalProcessed = 0;

  for (const format of formats) {
    const metafilePath = join(DIST_DIR, `metafile-${format}.json`);

    if (!existsSync(metafilePath)) {
      console.log(`   No metafile found at ${metafilePath}, skipping ${format} format`);
      continue;
    }

    const metafile = JSON.parse(readFileSync(metafilePath, 'utf8'));
    const outputs = metafile.outputs || {};

    for (const [outputPath, outputInfo] of Object.entries(outputs)) {
      const absoluteOutputPath = resolve(process.cwd(), outputPath);
      if (!shouldProcess(absoluteOutputPath)) continue;
      totalProcessed++;

      const inputs = outputInfo.inputs || {};
      let isClient = false;
      const corePrefix = relative(process.cwd(), CORE_DIR);

      for (const inputPath of Object.keys(inputs)) {
        let relToCore = inputPath;
        if (inputPath.startsWith(corePrefix + '/')) {
          relToCore = inputPath.slice(corePrefix.length + 1);
        }
        if (clientSourceFiles.has(relToCore)) {
          isClient = true;
          break;
        }
      }

      if (isClient) {
        try {
          const content = readFileSync(absoluteOutputPath, 'utf8');
          if (hasUseClientDirective(content)) {
            totalSkipped++;
            continue;
          }
          writeFileSync(absoluteOutputPath, `'use client';\n${content}`, 'utf8');
          totalAdded++;
        } catch (err) {
          console.error(`   Error processing ${outputPath}: ${err.message}`);
        }
      }
    }
  }

  console.log(`postbuild-use-client: Added 'use client' to ${totalAdded} of ${totalProcessed} output files`);
  if (totalSkipped > 0) {
    console.log(`   (${totalSkipped} files already had the directive)`);
  }
}

main();
