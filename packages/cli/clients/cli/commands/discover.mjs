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

import {formatFull, formatBrief, formatCompact} from '../lib/component-format.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, record, records, list, code} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {discover as discoverApi} from '../../../api/discover/discover.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {warnOnIntegrationIssues} from '../../../foundation/integrations/integration-warnings.mjs';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as discoverCommand} from './discover.doc.mjs';
import {doc as discoverFn} from '../../../api/discover/discover.doc.mjs';

// Max components to list inline per package before summarizing with "+N more".
const MAX_COMPONENTS_SHOWN = 10;

/**
 * @param {import('commander').Command} program
 */
export function registerDiscover(program) {
  defineCommand(program, discoverCommand, {
    fn: discoverFn,
    action:
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

      // Non-blocking nudge: if any configured integration has validation
      // issues, print one compact line to stderr pointing at
      // validate-integration. Best-effort; suppressed in --json mode.
      try {
        const project = await Project.load(process.cwd());
        await warnOnIntegrationIssues(project.loadedIntegrations, {json});
      } catch {
        // Never let the nudge break the command.
      }

      let result;
      try {
        result = await discoverApi(query, {components: options.components, lang, zh});
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) {
        // Forward optional meta (e.g. configured flag for discover.list) as a
        // sibling of data via jsonOut, so the envelope still carries
        // apiVersion and goes through the single sanctioned emit path.
        return jsonOut(result);
      }

      switch (result.type) {
        case 'discover.list': {
          if (result.data.length === 0) {
            if (result.meta && result.meta.configured === false) {
              emit(
                text('No integrations configured.'),
                text('Add integration package names to astryx.config.mjs:'),
                code(
                  "export default {\n  integrations: ['@scope/your-integration'],\n};",
                ),
              );
            } else {
              emit(text('No external components found in configured integrations.'));
            }
            break;
          }

          // One record per package — fields mirror the JSON entry. The default
          // view summarizes each package's components (first N + "+N more");
          // --components lists them all (record comma-joins the full array).
          /** @type {import('../formatters/index.mjs').RecordOptions} */
          const listOpts = {fields: ['displayName', 'name', 'description', 'components']};
          if (!options.components) {
            listOpts.format = {
              components: (/** @type {string[]} */ comps) => {
                const shown = comps.slice(0, MAX_COMPONENTS_SHOWN);
                const remaining = comps.length - MAX_COMPONENTS_SHOWN;
                return remaining > 0
                  ? `${shown.join(', ')}, +${remaining} more`
                  : shown.join(', ');
              },
            };
          }
          emit(
            records(result.data, listOpts),
            text(
              [
                'Usage:',
                `  ${run} discover <package>            Browse a package`,
                `  ${run} discover <package>/Component  View component docs`,
                `  ${run} discover <search>             Search all packages`,
              ].join('\n'),
            ),
          );
          break;
        }

        case 'discover.detail': {
          const d = result.data;
          emit(
            record(d, {fields: ['displayName', 'name', 'description', 'components']}),
            text(`Usage: ${run} discover ${d.name}/<ComponentName>`),
          );
          break;
        }

        case 'discover.detail.doc': {
          const docs = result.data;
          const md =
            detail === 'brief'
              ? formatBrief(docs, docs.name, '')
              : detail === 'compact'
                ? formatCompact(docs, docs.name, '')
                : formatFull(docs);
          emit(code(md));
          break;
        }

        case 'discover.search': {
          const {query: q, matches} = result.data;
          emit(
            section(`Found ${matches.length} matches for "${q}"`),
            list(matches.map(m => `${run} discover ${m.package}/${m.component}`)),
          );
          break;
        }
      }
    },
  });
}
