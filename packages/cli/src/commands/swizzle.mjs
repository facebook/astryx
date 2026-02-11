/**
 * @file swizzle command — Copy component source for customization
 *
 * Resolves component source from packages/core/src/{Component}/,
 * copies non-test files to the output directory, and rewrites
 * relative imports to use '@xds/core' package paths.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, listComponents} from '../utils/paths.mjs';

/**
 * Rewrite relative imports that point outside the component directory
 * to use @xds/core package paths.
 *
 * e.g. '../theme/tokens.stylex' → '@xds/core/theme'
 *      '../utils/mergeProps'     → '@xds/core/utils'
 */
function rewriteImports(content) {
  // Match import/export from statements with relative paths going up
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // Extract the top-level directory from the relative path
      // e.g. '../theme/tokens.stylex' → 'theme'
      // e.g. '../utils/mergeProps' → 'utils'
      const parts = importPath.replace(/^\.\.\//, '').split('/');
      const topDir = parts[0];

      // Map to @xds/core subpath
      return `${prefix}@xds/core/${topDir}${suffix}`;
    },
  );
}

export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy component source for customization')
    .option('--output <dir>', 'Output directory', './components/xds')
    .option('--list', 'List available components')
    .action((component, options) => {
      const coreDir = findCoreDir(process.cwd());

      if (!coreDir) {
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        console.log('\nAvailable components:\n');
        for (const name of components) {
          console.log(`  ${name}`);
        }
        console.log(`\nUsage: xds swizzle <component>\n`);
        console.log('Example: xds swizzle Button');
        console.log('         xds swizzle XDSButton  (XDS prefix also works)\n');
        return;
      }

      // Normalize component name — strip XDS prefix for directory lookup
      const dirName = component.replace(/^XDS/, '');
      const componentDir = path.join(coreDir, 'src', dirName);

      if (!fs.existsSync(componentDir)) {
        console.error(`Error: Component "${component}" not found.`);
        console.error(`Available: ${components.join(', ')}`);
        process.exit(1);
      }

      const outputDir = path.resolve(process.cwd(), options.output, dirName);
      fs.mkdirSync(outputDir, {recursive: true});

      // Copy all non-test, non-README files
      const files = fs.readdirSync(componentDir);
      let copied = 0;

      for (const file of files) {
        // Skip test files and README
        if (file.includes('.test.') || file === 'README.md') continue;

        const srcPath = path.join(componentDir, file);
        const stat = fs.statSync(srcPath);
        if (!stat.isFile()) continue;

        let content = fs.readFileSync(srcPath, 'utf-8');

        // Rewrite imports for .ts/.tsx files
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          content = rewriteImports(content);
        }

        fs.writeFileSync(path.join(outputDir, file), content);
        copied++;
      }

      const relOutput = path.relative(process.cwd(), outputDir);
      console.log(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      console.log('Relative imports have been rewritten to use @xds/core.');
      console.log('You can now customize the component source freely.\n');
    });
}
