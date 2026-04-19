/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs a combined xds.css wrapped in @layer xds-base.
 *
 * Usage: node scripts/build-css.mjs
 *
 * Runs two compilation passes:
 *   1. 'xds' prefix — matches the JS dist output (classNamePrefix: 'xds')
 *   2. 'x' prefix — compat layer for older consumers still on x-prefixed JS
 *
 * Both sets are combined in xds.css. The compat layer will be removed in
 * a future version once all consumers have migrated to the xds prefix.
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

async function collectStyleXRules(classNamePrefix) {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: CORE_SRC,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  });

  console.log(`  Processing ${files.length} source files (prefix: '${classNamePrefix}')...`);

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
              classNamePrefix,
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

  console.log(`  Collected ${allRules.length} rules`);
  return allRules;
}

async function main() {
  console.log('Pass 1: xds prefix (primary)');
  const xdsRules = await collectStyleXRules('xds');

  console.log('Pass 2: x prefix (compat)');
  const xRules = await collectStyleXRules('x');

  if (xdsRules.length === 0) {
    console.error('No StyleX rules found!');
    process.exit(1);
  }

  await fs.mkdir(CORE_DIST, {recursive: true});

  const xdsCss = stylexBabelPlugin.processStylexRules(xdsRules, false);
  const xCss = stylexBabelPlugin.processStylexRules(xRules, false);

  const indent = (css) => css.split('\n').map(line => '  ' + line).join('\n');

  const combinedPath = path.resolve(CORE_DIST, 'xds.css');
  await fs.writeFile(
    combinedPath,
    [
      '/* XDS Pre-compiled StyleX CSS — all components */',
      '/* Auto-generated. Do not edit manually. */',
      '',
      '/* Primary styles (xds prefix) — matches JS dist output */',
      `@layer xds-base {\n${indent(xdsCss)}\n}`,
      '',
      '/* Compat styles (x prefix) — for consumers on older JS versions.',
      '   Will be removed in a future version. */',
      `@layer xds-base {\n${indent(xCss)}\n}`,
      '',
    ].join('\n'),
    'utf8',
  );

  const totalKB = ((xdsCss.length + xCss.length) / 1024).toFixed(1);
  console.log(`xds.css: ${totalKB} KB (xds: ${(xdsCss.length/1024).toFixed(1)} KB + compat: ${(xCss.length/1024).toFixed(1)} KB)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
