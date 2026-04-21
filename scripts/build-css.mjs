/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs a combined xds.css wrapped in @layer xds-base.
 *
 * Usage: node scripts/build-css.mjs
 *
 * This script:
 * 1. Runs Babel with the StyleX plugin over all source files
 * 2. Collects all StyleX rules
 * 3. Outputs a combined xds.css with all rules in @layer xds-base
 *
 * Dist consumers import the full stylesheet:
 *   import '@xds/core/xds.css';
 */

import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {glob} from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.resolve(ROOT, 'packages/core/src');
const CORE_DIST = path.resolve(ROOT, 'packages/core/dist');

async function collectStyleXCSS() {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: CORE_SRC,
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
  const allRules = await collectStyleXCSS();

  if (allRules.length === 0) {
    console.error('No StyleX rules found!');
    process.exit(1);
  }

  await fs.mkdir(CORE_DIST, {recursive: true});

  const combinedCSS = stylexBabelPlugin.processStylexRules(allRules, false);

  const combinedPath = path.resolve(CORE_DIST, 'xds.css');
  await fs.writeFile(
    combinedPath,
    `/* XDS Pre-compiled StyleX CSS — all components */\n/* Auto-generated. Do not edit manually. */\n\n@layer xds-base {\n${combinedCSS
      .split('\n')
      .map(line => '  ' + line)
      .join('\n')}\n}\n`,
    'utf8',
  );
  console.log(`xds.css: ${(combinedCSS.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
