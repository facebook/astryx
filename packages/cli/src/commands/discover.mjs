/**
 * @file discover command — find external XDS packages and components
 *
 * Usage:
 *   xds discover                           List all packages
 *   xds discover @scope/name               List components in a package
 *   xds discover @scope/name/Component     Show docs for a component
 *   xds discover searchterm                Search across all packages
 */

import {loadConfig} from '../lib/config.mjs';
import {scanAllPackages} from '../lib/package-scanner.mjs';
import {formatFull, formatBrief, formatCompact} from '../lib/component-format.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
import {discover as discoverApi} from '../api/discover.mjs';

export function registerDiscover(program) {
  program
    .command('discover [query]')
    .description('Discover external XDS packages and components')
    .option('--components', 'List components only')
    .action(async (query, options) => {
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;

      let result;
      try {
        result = await discoverApi(query, {components: options.components, lang, zh});
      } catch (e) {
        if (json) return jsonError(e.message, e.suggestions);
        console.error(`Error: ${e.message}`);
        if (e.suggestions?.length) {
          console.error('');
          for (const s of e.suggestions) {
            console.error(`  ${s.name}  (${s.reason})`);
          }
        }
        process.exit(1);
      }

      if (json) return jsonOut(result.type, result.data);

      switch (result.type) {
        case 'discover.list': {
          if (result.data.length === 0) {
            const config = await loadConfig();
            console.log('');
            if (config.packages.length === 0) {
              console.log('No package directories configured.');
              console.log('');
              console.log('Add a packages field to xds.config.mjs:');
              console.log('');
              console.log('  export default {');
              console.log("    packages: ['/path/to/your/libs'],");
              console.log('  };');
            } else {
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
            }
            console.log('');
          } else {
            console.log('');
            for (const pkg of result.data) {
              const count = pkg.components.length;
              const label = count === 1 ? 'component' : 'components';
              console.log(pkg.name + ' (' + count + ' ' + label + ')');

              if (options.components) {
                for (const comp of pkg.components) console.log('  ' + comp);
              } else {
                const maxShow = 10;
                const shown = pkg.components.slice(0, maxShow);
                const remaining = count - maxShow;
                const list = shown.join(', ');
                console.log(remaining > 0 ? '  ' + list + ', +' + remaining + ' more' : '  ' + list);
              }
              console.log('');
            }
            console.log('Usage:');
            console.log('  xds discover <package>            Browse a package');
            console.log('  xds discover <package>/Component  View component docs');
            console.log('  xds discover <search>             Search all packages');
            console.log('');
          }
          break;
        }

        case 'discover.detail': {
          console.log('');
          console.log(result.data.name + ' (' + result.data.components.length + ' components)');
          console.log('');
          for (const comp of result.data.components) console.log('  ' + comp);
          console.log('');
          console.log('Usage: xds discover ' + result.data.name + '/<ComponentName>');
          console.log('');
          break;
        }

        case 'discover.detail.doc': {
          const docs = result.data;
          if (detail === 'brief') {
            console.log(formatBrief(docs, docs.name, ''));
          } else if (detail === 'compact') {
            console.log(formatCompact(docs, docs.name, ''));
          } else {
            console.log(formatFull(docs));
          }
          console.log('');
          break;
        }

        case 'discover.search': {
          console.log('');
          console.log('Found ' + result.data.matches.length + ' matches for "' + result.data.query + '":');
          console.log('');
          for (const m of result.data.matches) {
            console.log('  xds discover ' + m.package + '/' + m.component);
          }
          console.log('');
          break;
        }
      }
    });
}
