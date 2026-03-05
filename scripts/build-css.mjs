/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs a single xds.css wrapped in @layer xds.
 *
 * Usage: node scripts/build-css.mjs
 *
 * This script:
 * 1. Runs Babel with the StyleX plugin over all source files
 * 2. Collects the CSS rules StyleX generates
 * 3. Wraps them in @layer xds { ... }
 * 4. Writes to packages/core/dist/xds.css
 *
 * The resulting CSS file can be imported by consumers who don't have
 * StyleX in their build pipeline:
 *
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
  // Find all TypeScript/TSX source files
  const files = await glob('**/*.{ts,tsx}', {
    cwd: CORE_SRC,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  });

  console.log(`Processing ${files.length} source files...`);

  const allRules = [];

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');

    // Skip files that don't use stylex
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

      if (result?.metadata?.stylex) {
        allRules.push(...result.metadata.stylex);
      }
    } catch (err) {
      console.warn(`  Warning: Could not process ${path.relative(ROOT, file)}: ${err.message}`);
    }
  }

  console.log(`Collected ${allRules.length} StyleX rules`);

  if (allRules.length === 0) {
    console.warn('No StyleX rules found!');
    return '';
  }

  // Use StyleX's built-in CSS processor to sort and dedupe rules
  const css = stylexBabelPlugin.processStylexRules(allRules, false);

  // Wrap in @layer xds
  const layeredCSS = `/* XDS Pre-compiled StyleX CSS */
/* This file is auto-generated. Do not edit manually. */
/* Consumer styles (unlayered) always override these styles. */

@layer xds {
${css.split('\n').map(line => '  ' + line).join('\n')}
}
`;

  return layeredCSS;
}

async function main() {
  const css = await collectStyleXCSS();

  if (!css) {
    console.error('Failed to collect CSS');
    process.exit(1);
  }

  // Ensure dist directory exists
  await fs.mkdir(CORE_DIST, {recursive: true});

  const outPath = path.resolve(CORE_DIST, 'xds.css');
  await fs.writeFile(outPath, css, 'utf8');
  console.log(`\nWritten to ${path.relative(ROOT, outPath)}`);
  console.log(`Size: ${(css.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
