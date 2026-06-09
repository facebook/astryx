// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {jsonOut, jsonError, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {discover as discoverApi} from '../api/discover.mjs';

export function registerDiscover(program) {
  program
    .command('discover [query]')
    .description('Discover external packages and components')
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
        cliError(e.message, {suggestions: e.suggestions, code: e.code});
        return;
      }

      if (json) {
        // Forward optional meta (e.g. configured flag for discover.list) as a
        // sibling of data via jsonOut, so the envelope still carries
        // apiVersion and goes through the single sanctioned emit path.
        return jsonOut(result.type, result.data, result.meta);
      }

      switch (result.type) {
        case 'discover.list': {
          if (result.data.length === 0) {
            const config = await loadConfig();
            humanLog('');
            if (config.packages.length === 0) {
              humanLog('No package directories configured.');
              humanLog('');
              humanLog('Add a packages field to xds.config.mjs:');
              humanLog('');
              humanLog('  export default {');
              humanLog("    packages: ['/path/to/your/libs'],");
              humanLog('  };');
            } else {
              humanLog('No external packages found.');
              humanLog('');
              humanLog('Packages opt in by adding an "xds" field to package.json:');
              humanLog('');
              humanLog('  {');
              humanLog('    "xds": {');
              humanLog('      "docs": "./src",');
              humanLog('      "category": "Common"');
              humanLog('    }');
              humanLog('  }');
            }
            humanLog('');
          } else {
            humanLog('');
            for (const pkg of result.data) {
              const count = pkg.components.length;
              const label = count === 1 ? 'component' : 'components';
              const heading = pkg.displayName
                ? pkg.displayName + '  ' + pkg.name + ' (' + count + ' ' + label + ')'
                : pkg.name + ' (' + count + ' ' + label + ')';
              humanLog(heading);
              if (pkg.description) humanLog('  ' + pkg.description);

              if (options.components) {
                for (const comp of pkg.components) humanLog('  ' + comp);
              } else {
                const maxShow = 10;
                const shown = pkg.components.slice(0, maxShow);
                const remaining = count - maxShow;
                const list = shown.join(', ');
                humanLog(remaining > 0 ? '  ' + list + ', +' + remaining + ' more' : '  ' + list);
              }
              humanLog('');
            }
            humanLog('Usage:');
            humanLog('  xds discover <package>            Browse a package');
            humanLog('  xds discover <package>/Component  View component docs');
            humanLog('  xds discover <search>             Search all packages');
            humanLog('');
          }
          break;
        }

        case 'discover.detail': {
          humanLog('');
          const d = result.data;
          const detailHeading = d.displayName
            ? d.displayName + '  ' + d.name + ' (' + d.components.length + ' components)'
            : d.name + ' (' + d.components.length + ' components)';
          humanLog(detailHeading);
          if (d.description) humanLog('  ' + d.description);
          humanLog('');
          for (const comp of result.data.components) humanLog('  ' + comp);
          humanLog('');
          humanLog('Usage: xds discover ' + result.data.name + '/<ComponentName>');
          humanLog('');
          break;
        }

        case 'discover.detail.doc': {
          const docs = result.data;
          if (detail === 'brief') {
            humanLog(formatBrief(docs, docs.name, ''));
          } else if (detail === 'compact') {
            humanLog(formatCompact(docs, docs.name, ''));
          } else {
            humanLog(formatFull(docs));
          }
          humanLog('');
          break;
        }

        case 'discover.search': {
          humanLog('');
          humanLog('Found ' + result.data.matches.length + ' matches for "' + result.data.query + '":');
          humanLog('');
          for (const m of result.data.matches) {
            humanLog('  xds discover ' + m.package + '/' + m.component);
          }
          humanLog('');
          break;
        }
      }
    });
}
