// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file component command — List components and print component docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh|dense
 */

import {findCoreDir} from '../../utils/paths.mjs';
import {
  resolveImportPath,
} from '../../lib/component-discovery.mjs';
import {
  formatFull,
  formatCompact,
  formatBrief,
  formatProps,
  formatBriefAll,
} from '../../lib/component-format.mjs';
import {resolveTheme} from '../../lib/resolve-theme.mjs';
import {getCliInvocation} from '../../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {component as componentApi} from '../../api/component.mjs';
import {findRelatedBlocks} from '../../api/template.mjs';
import {Project} from '../../lib/project.mjs';
import {warnOnIntegrationIssues} from '../../lib/integration-warnings.mjs';

/**
 * The api layer's component() widens its return to `{type: string, data: unknown}`,
 * so annotate the command-local result with the precise discriminated union from
 * src/types/component to get narrowing + typed data.
 *
 * @typedef {(
 *   | import('../../types/component').ComponentListResponse
 *   | import('../../types/component').ComponentBriefResponse
 *   | import('../../types/component').ComponentFullResponse
 *   | import('../../types/component').ComponentDetailResponse
 *   | import('../../types/component').ComponentDetailPropsResponse
 *   | import('../../types/component').ComponentDetailSourceResponse
 *   | import('../../types/component').ComponentDetailShowcaseResponse
 *   | import('../../types/component').ComponentDetailBlocksResponse
 * )} ComponentResult
 */

/**
 * @param {import('commander').Command} program
 */
export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--props', 'Print only the props table')
    .option('--source', 'Print component source code')
    .option('--showcase', 'Print showcase source code')
    .option('--blocks', 'List example blocks: showcase, examples, and related')
    .option('--package <name>', 'Scope lookup to an external package (e.g. @acme/xds-widgets)')
    .action(async (/** @type {string | undefined} */ name, /** @type {{list?: boolean, category?: string, props?: boolean, source?: boolean, showcase?: boolean, blocks?: boolean, package?: string}} */ options) => {
      const run = getCliInvocation();
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const lang = program.opts().lang || null;
      const detailSource = program.getOptionValueSource('detail');
      const isListView = options.list || options.category || !name;
      // Default detail level is full for single-component view, brief for list views.
      // (List views are scannable name lists; users can opt into compact/full.)
      let detail = program.opts().detail || 'full';
      if (isListView && detailSource === 'default') detail = 'brief';
      const json = program.opts().json || false;

      const validDetails = ['full', 'compact', 'brief'];
      if (!validDetails.includes(detail)) {
        cliError(`Invalid --detail value "${detail}". Valid levels: ${validDetails.join(', ')}`, {code: ERROR_CODES.ERR_INVALID_DETAIL});
        return;
      }

      // Non-blocking nudge: if any configured integration has validation
      // issues, print one compact line to stderr pointing at
      // validate-integration. Best-effort; suppressed in --json mode.
      try {
        const project = await Project.load(process.cwd());
        await warnOnIntegrationIssues(project.loadedIntegrations, {json});
      } catch {
        // Never let the nudge break the command.
      }

      /** @type {ComponentResult} */
      let result;
      try {
        result = /** @type {ComponentResult} */ (await componentApi(name, {
          cwd: process.cwd(),
          list: options.list,
          category: options.category,
          package: options.package,
          props: options.props,
          source: options.source,
          showcase: options.showcase,
          blocks: options.blocks,
          detail,
          lang, zh, dense,
        }));
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      // ── Text output ────────────────────────────────────────────
      // The api layer already resolved against core (result exists), so core is
      // present on this path; narrow away the null branch findCoreDir allows.
      const coreDir = /** @type {string} */ (findCoreDir(process.cwd()));
      const themeData = resolveTheme(process.cwd());

      switch (result.type) {
        case 'component.list': {
          // --detail brief (default for list views). The API now returns
          // package-qualified entries ({name, package}); the human view omits
          // the core package label for readability but ALWAYS shows the package
          // for integration components (and whenever names collide).
          const CORE_PKG = '@astryxdesign/core';
          // Names that appear under more than one package across the whole
          // listing — these must always be package-qualified to disambiguate.
          /** @type {Map<string, Set<string>>} */
          const nameCounts = new Map();
          for (const items of Object.values(result.data)) {
            for (const item of items) {
              const set = nameCounts.get(item.name) ?? new Set();
              set.add(item.package);
              nameCounts.set(item.name, set);
            }
          }
          /** @param {string} n */
          const isCollision = n => (nameCounts.get(n)?.size ?? 0) > 1;
          /** @param {import('../../types/component').ComponentListEntry} item */
          const pkgSuffix = item => {
            if (item.package !== CORE_PKG) return `  [${item.package}]`;
            if (isCollision(item.name)) return `  [${item.package}]`;
            return '';
          };

          if (options.category) {
            const [cat, comps] = Object.entries(result.data)[0];
            humanLog(`\n${cat}:`);
            for (const item of comps) {
              const importPath = resolveImportPath(coreDir, item.name);
              humanLog(`  ${item.name}  ← ${importPath}${pkgSuffix(item)}`);
            }
            humanLog('');
          } else {
            humanLog('');
            for (const [key, comps] of Object.entries(result.data)) {
              const isUngrouped = comps.length === 1 && comps[0]?.name === key;
              if (isUngrouped) {
                const item = comps[0];
                const importPath = resolveImportPath(coreDir, item.name);
                humanLog(`${item.name}  ← ${importPath}${pkgSuffix(item)}`);
              } else {
                humanLog(`${key} (group)`);
                for (const item of comps) {
                  const importPath = resolveImportPath(coreDir, item.name);
                  humanLog(`  ${item.name}  ← ${importPath}${pkgSuffix(item)}`);
                }
              }
            }
            humanLog('');
            humanLog(`Import from the path shown (e.g. import {Button} from '@astryxdesign/core/Button')`);
            humanLog(`Usage: ${run} component <name>`);
            humanLog('');
          }
          break;
        }

        case 'component.brief': {
          // --detail compact — name + 1-line description per entry.
          humanLog('');
          const entries = Object.entries(result.data);
          for (const [cat, items] of entries) {
            // Skip the synthetic group header when there's only one ungrouped category
            const isUngrouped =
              entries.length === 1 && items.length === 1 && items[0]?.name === cat;
            if (!isUngrouped) humanLog(`${cat} (group)`);
            for (const item of items) {
              const importHint = item.import ? `  ← ${item.import}` : '';
              const desc = item.description ? ` — ${item.description}` : '';
              humanLog(`  XDS${item.name}${importHint}${desc}`);
            }
            humanLog('');
          }
          humanLog(`Import from the path shown (e.g. import {Button} from '@astryxdesign/core/Button')`);
          humanLog(`Usage: ${run} component <name>`);
          humanLog('');
          break;
        }

        case 'component.full': {
          // --detail full — dense per-component docs (signature, props, theming, examples).
          humanLog(await formatBriefAll(coreDir, {zh, lang, themeData}));
          break;
        }

        case 'component.detail': {
          if (detail === 'brief') {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            humanLog(formatBrief(result.data, resolvedName, importHint, {themeData}));
          } else if (detail === 'compact') {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            humanLog(formatCompact(result.data, resolvedName, importHint));
          } else {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            humanLog(formatFull(result.data, {themeData, importHint}));
          }
          const compName = (name || '').replace(/^XDS/, '');
          const related = await findRelatedBlocks(compName);
          if (related.length > 0) {
            humanLog('\nRelated block templates:\n');
            for (const b of related) {
              humanLog(`  ${b.dirName}`);
              if (b.description) humanLog(`    ${b.description}`);
            }
            humanLog('');
          }
          break;
        }

        case 'component.detail.props': {
          const resolvedName = (name || '').replace(/^XDS/, '');
          humanLog(formatProps({props: result.data}, resolvedName));
          break;
        }

        case 'component.detail.source': {
          humanLog(result.data.source);
          break;
        }

        case 'component.detail.showcase': {
          humanLog(result.data.source);
          break;
        }

        case 'component.detail.blocks': {
          const {showcase, examples, related} = result.data;
          if (showcase) {
            humanLog(`\nShowcase: ${showcase.displayName}`);
            if (showcase.description) humanLog(`  ${showcase.description}`);
          }
          if (examples.length > 0) {
            humanLog('\nExamples:\n');
            for (const b of examples) {
              humanLog(`  ${b.name}`);
              if (b.description) humanLog(`    ${b.description}`);
            }
          }
          if (related.length > 0) {
            humanLog(`\nRelated: ${related.length} blocks that use ${result.data.component}\n`);
            for (const b of related) {
              humanLog(`  ${b.name}`);
            }
          }
          if (!showcase && examples.length === 0 && related.length === 0) {
            humanLog(`\nNo blocks found for ${result.data.component}`);
          }
          humanLog('');
          break;
        }
      }
    });
}


// Re-export lib functions for backward compatibility
// (agent-docs.mjs, tests, and generate-skill-doc.sh import from here)
export {discoverComponents, discoverExternalComponents, discoverExternalComponentsGrouped, findComponentReadme, findComponentSource, findExternalComponentDoc, resolveImportPath} from '../../lib/component-discovery.mjs';
export {discoverExternalPackages} from '../../utils/paths.mjs';
export {loadDocs} from '../../lib/component-loader.mjs';
export {formatFull, formatCompact, formatBrief, formatProps, formatBriefAll} from '../../lib/component-format.mjs';
export {levenshteinDistance, findClosestComponents, searchComponents} from '../../lib/string-utils.mjs';
