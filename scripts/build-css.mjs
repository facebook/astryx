// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs a combined stylesheet wrapped in @layer astryx-base.
 *
 * Usage:
 *   node scripts/build-css.mjs                 # core  → packages/core/dist/astryx.css
 *   node scripts/build-css.mjs --package lab   # lab   → packages/lab/dist/lab.css
 *
 * This script:
 * 1. Runs Babel with the StyleX plugin over the target package's source files
 * 2. Collects all StyleX rules
 * 3. Outputs a combined stylesheet with all rules in @layer astryx-base
 *
 * Dist consumers import the full stylesheet, e.g.:
 *   import '@astryxdesign/core/astryx.css';
 *   import '@astryxdesign/lab/lab.css';
 */

import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {glob} from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Per-package build targets. Each entry defines where source lives, where the
// stylesheet is written, and any StyleX module-resolution aliases needed for
// cross-package theme-token imports (lab consumes @astryxdesign/core tokens).
const TARGETS = {
  core: {
    src: path.resolve(ROOT, 'packages/core/src'),
    dist: path.resolve(ROOT, 'packages/core/dist'),
    outFile: 'astryx.css',
    banner: 'Astryx Pre-compiled StyleX CSS — all components',
    aliases: {},
  },
  lab: {
    src: path.resolve(ROOT, 'packages/lab/src'),
    dist: path.resolve(ROOT, 'packages/lab/dist'),
    outFile: 'lab.css',
    banner: 'Astryx Lab Pre-compiled StyleX CSS — experimental components',
    // lab imports @astryxdesign/core/theme/tokens.stylex; point the resolver at
    // core's source so the cross-package token reference resolves.
    aliases: {
      '@astryxdesign/core/*': [path.join(ROOT, 'packages/core/src/*')],
      '@astryxdesign/core': [path.join(ROOT, 'packages/core/src')],
    },
  },
  charts: {
    src: path.resolve(ROOT, 'packages/charts/src'),
    dist: path.resolve(ROOT, 'packages/charts/dist'),
    outFile: 'charts.css',
    banner:
      'Astryx Charts Pre-compiled StyleX CSS — data visualization components',
    // charts imports @astryxdesign/core/theme/tokens.stylex; point the resolver
    // at core's source so the cross-package token reference resolves.
    aliases: {
      '@astryxdesign/core/*': [path.join(ROOT, 'packages/core/src/*')],
      '@astryxdesign/core': [path.join(ROOT, 'packages/core/src')],
    },
  },
};

function parseTarget() {
  const idx = process.argv.indexOf('--package');
  const name = idx !== -1 ? process.argv[idx + 1] : 'core';
  const target = TARGETS[name];
  if (!target) {
    console.error(
      `Unknown --package "${name}". Valid: ${Object.keys(TARGETS).join(', ')}`,
    );
    process.exit(1);
  }
  return {name, ...target};
}

async function collectStyleXCSS(target) {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: target.src,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  });

  console.log(`Processing ${files.length} source files...`);

  const allRules = [];

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');

    if (!code.includes('@stylexjs/stylex')) {
      continue;
    }

    try {
      const result = await transformAsync(code, {
        babelrc: false,
        filename: file,
        presets: [
          ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
          ['@babel/preset-react', {runtime: 'automatic'}],
        ],
        plugins: [
          [
            stylexBabelPlugin,
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              aliases: target.aliases,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: ROOT,
              },
            },
          ],
        ],
      });

      if (result?.metadata?.stylex?.length) {
        allRules.push(...result.metadata.stylex);
      }
    } catch (err) {
      console.warn(
        `  Warning: Could not process ${path.relative(ROOT, file)}: ${err.message}`,
      );
    }
  }

  console.log(`Collected ${allRules.length} StyleX rules`);

  return allRules;
}

async function main() {
  const target = parseTarget();
  const allRules = await collectStyleXCSS(target);

  if (allRules.length === 0) {
    console.error('No StyleX rules found!');
    process.exit(1);
  }

  await fs.mkdir(target.dist, {recursive: true});

  const combinedCSS = stylexBabelPlugin.processStylexRules(allRules, false);

  const outPath = path.resolve(target.dist, target.outFile);
  const combinedFileContents = `/* ${target.banner} */\n/* Auto-generated. Do not edit manually. */\n\n@layer astryx-base {\n${combinedCSS
    .split('\n')
    .map(line => '  ' + line)
    .join('\n')}\n}\n`;
  await fs.writeFile(outPath, combinedFileContents, 'utf8');
  console.log(`${target.outFile}: ${(combinedCSS.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
