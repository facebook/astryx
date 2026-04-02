/**
 * @file discover command — find external XDS packages and components
 *
 * Scans directories configured in xds.config.mjs for third-party
 * packages that extend XDS with additional components.
 *
 * Usage:
 *   xds discover                     List all external packages
 *   xds discover --components        List components only
 *   xds discover <name>              Show docs for a specific component
 */

import {loadConfig} from '../lib/config.mjs';
import {scanAllPackages, findComponentInPackages} from '../lib/package-scanner.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {formatFull, formatBrief, formatCompact} from '../lib/component-format.mjs';

export function registerDiscover(program) {
  program
    .command('discover [name]')
    .description('Discover external XDS packages and components')
    .option('--components', 'List components only')
    .action(async (name, options) => {
      const config = await loadConfig();
      const detail = program.opts().detail || 'full';

      if (config.packages.length === 0) {
        console.log('');
        console.log('No package directories configured.');
        console.log('');
        console.log('Add a packages field to xds.config.mjs:');
        console.log('');
        console.log('  export default {');
        console.log("    packages: ['/path/to/your/libs'],");
        console.log('  };');
        console.log('');
        return;
      }

      const packages = scanAllPackages(config.packages);

      if (packages.length === 0) {
        console.log('');
        console.log('No external XDS packages found.');
        console.log('');
        console.log('Packages opt in by adding an "xds" field to package.json:');
        console.log('');
        console.log('  {');
        console.log('    "xds": {');
        console.log('      "docs": "./src",');
        console.log('      "category": "Common"');
        console.log('    }');
        console.log('  }');
        console.log('');
        return;
      }

      // Specific component lookup
      if (name) {
        const result = findComponentInPackages(packages, name);

        if (!result) {
          console.error('Component "' + name + '" not found in external packages.');
          console.error('');
          console.error('Available components:');
          for (const pkg of packages) {
            if (pkg.components.length > 0) {
              console.error('  ' + pkg.name + ': ' + pkg.components.join(', '));
            }
          }
          process.exit(1);
        }

        try {
          const zh = program.opts().zh || false;
          const lang = program.opts().lang || null;
          const docs = await loadDocs(result.docPath, {zh, lang});

          if (detail === 'brief') {
            console.log(formatBrief(docs, result.componentName, result.pkg.name + '/' + result.componentName));
          } else if (detail === 'compact') {
            console.log(formatCompact(docs, result.componentName, result.pkg.name + '/' + result.componentName));
          } else {
            console.log(formatFull(docs));
          }
        } catch (e) {
          console.error('Failed to load docs: ' + e.message);
          process.exit(1);
        }

        console.log('');
        console.log('Package: ' + result.pkg.name);
        console.log('');
        return;
      }

      // List mode
      console.log('');

      for (const pkg of packages) {
        const count = pkg.components.length;
        const label = count === 1 ? 'component' : 'components';
        console.log(pkg.name + ' (' + count + ' ' + label + ')');

        if (!options.components && count > 0) {
          const maxShow = 10;
          const shown = pkg.components.slice(0, maxShow);
          const remaining = count - maxShow;
          const list = shown.join(', ');
          if (remaining > 0) {
            console.log('  ' + list + ', +' + remaining + ' more');
          } else {
            console.log('  ' + list);
          }
        } else if (options.components && count > 0) {
          for (const comp of pkg.components) {
            console.log('  ' + comp);
          }
        }

        console.log('');
      }

      console.log('Usage: xds discover <ComponentName> for details');
      console.log('');
    });
}
