/**
 * @file build-theme-css.mjs
 * Post-build script that extracts StyleX CSS from theme packages
 * and outputs theme.css files.
 *
 * Usage: node scripts/build-theme-css.mjs <theme-dir>
 * Example: node scripts/build-theme-css.mjs packages/themes/default
 */

import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {glob} from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const themeDir = process.argv[2];
if (!themeDir) {
  console.error('Usage: node scripts/build-theme-css.mjs <theme-dir>');
  process.exit(1);
}

const THEME_SRC = path.resolve(ROOT, themeDir, 'src');
const THEME_DIST = path.resolve(ROOT, themeDir, 'dist');

async function collectThemeCSS() {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: THEME_SRC,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts'],
  });

  console.log(`Processing ${files.length} theme files from ${themeDir}...`);

  const allRules = [];

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');
    if (!code.includes('@stylexjs/stylex')) continue;

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
              aliases: {
                '@xds/core/*': [path.join(ROOT, 'packages/core/src/*')],
              },
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
      console.warn(`  Warning: ${path.relative(ROOT, file)}: ${err.message}`);
    }
  }

  console.log(`Collected ${allRules.length} StyleX rules`);

  if (allRules.length === 0) {
    console.warn('No StyleX rules found in theme!');
    return '';
  }

  const css = stylexBabelPlugin.processStylexRules(allRules, false);
  const themeName = path.basename(themeDir);

  const layeredCSS = `/* XDS Theme: ${themeName} — Pre-compiled StyleX CSS */
/* This file is auto-generated. Do not edit manually. */

@layer xds.theme {
${css.split('\n').map(line => '  ' + line).join('\n')}
}
`;

  return layeredCSS;
}

async function main() {
  const css = await collectThemeCSS();
  if (!css) {
    console.error('Failed to collect theme CSS');
    process.exit(1);
  }

  await fs.mkdir(THEME_DIST, {recursive: true});
  const outPath = path.resolve(THEME_DIST, 'theme.css');
  await fs.writeFile(outPath, css, 'utf8');
  console.log(`Written to ${path.relative(ROOT, outPath)}`);
  console.log(`Size: ${(css.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
