// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover command — find external Astryx packages and components
 *
 * Usage:
 *   astryx discover                           List all packages
 *   astryx discover @scope/name               List components in a package
 *   astryx discover @scope/name/Component     Show docs for a component
 *   astryx discover searchterm                Search across all packages
 */

import {formatFull, formatBrief, formatCompact} from '../../lib/component-format.mjs';
import {jsonOut, humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {discover as discoverApi} from '../../api/discover/discover.mjs';
import {getCliInvocation} from '../../utils/package-manager.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerDiscover(program) {
  program
    .command('discover [query]')
    .description('Discover external packages and components')
    .option('--components', 'List components only')
    .action(
      /**
       * @param {string | undefined} query
       * @param {{components?: boolean}} options
       */
      async (query, options) => {
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;
      const run = getCliInvocation();

      let result;
      try {
        result = await discoverApi(query, {components: options.components, lang, zh});
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) {
        // Forward optional meta (e.g. configured flag for discover.list) as a
        // sibling of data via jsonOut, so the envelope still carries
        // apiVersion and goes through the single sanctioned emit path.
        return jsonOut(result.type, result.data, 'meta' in result ? result.meta : undefined);
      }

      switch (result.type) {
        case 'discover.list': {
          if (result.data.length === 0) {
            humanLog('');
            if (result.meta && result.meta.configured === false) {
              humanLog('No integrations configured.');
              humanLog('');
              humanLog('Add integration package names to astryx.config.mjs:');
              humanLog('');
              humanLog('  export default {');
              humanLog("    integrations: ['@scope/your-integration'],");
              humanLog('  };');
            } else {
              humanLog('No external components found in configured integrations.');
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
            humanLog(`  ${run} discover <package>            Browse a package`);
            humanLog(`  ${run} discover <package>/Component  View component docs`);
            humanLog(`  ${run} discover <search>             Search all packages`);
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
          humanLog(`Usage: ${run} discover ` + result.data.name + '/<ComponentName>');
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
            humanLog(`  ${run} discover ` + m.package + '/' + m.component);
          }
          humanLog('');
          break;
        }
      }
    });
}
