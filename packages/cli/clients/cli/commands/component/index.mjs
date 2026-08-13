// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file component command — List components and print component docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh|dense
 */

import {findCoreDir} from '../../../../foundation/fs/paths.mjs';
import {
  resolveImportPath,
} from '../../../../foundation/discovery/component-discovery.mjs';
import {
  formatFull,
  formatCompact,
  formatBrief,
  formatProps,
  formatBriefAll,
} from '../../lib/component-format.mjs';
import {resolveTheme} from '../../lib/resolve-theme.mjs';
import {getCliInvocation} from '../../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../../foundation/response/json.mjs';
import {emit, section, text, list, record, records, code} from '../../formatters/index.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {defineCommand} from '../../lib/define-command.mjs';
import {ERROR_CODES} from '../../../../foundation/response/error-codes.mjs';
import {component as componentApi} from '../../../../api/component/component.mjs';
import {findRelatedBlocks} from '../../../../api/template/template.mjs';
import {Project} from '../../../../foundation/config/project.mjs';
import {warnOnIntegrationIssues} from '../../../../foundation/integrations/integration-warnings.mjs';
import {doc as componentCommand} from '../component.doc.mjs';
import {doc as componentFn} from '../../../../api/component/component.doc.mjs';

/**
 * The api layer's component() widens its return to `{type: string, data: unknown}`,
 * so annotate the command-local result with the precise discriminated union from
 * src/types/component to get narrowing + typed data.
 *
 * @typedef {(
 *   | import('../../../../api/component/component.type.mjs').ComponentListResponse
 *   | import('../../../../api/component/component.type.mjs').ComponentDetailResponse
 *   | import('../../../../api/component/component.type.mjs').ComponentDetailPropsResponse
 *   | import('../../../../api/component/component.type.mjs').ComponentDetailSourceResponse
 *   | import('../../../../api/component/component.type.mjs').ComponentDetailShowcaseResponse
 *   | import('../../../../api/component/component.type.mjs').ComponentDetailBlocksResponse
 * )} ComponentResult
 */

/**
 * @param {import('commander').Command} program
 */
export function registerComponent(program) {
  defineCommand(program, componentCommand, {
    fn: componentFn,
    action: async (/** @type {string | undefined} */ name, /** @type {{list?: boolean, category?: string, props?: boolean, source?: boolean, showcase?: boolean, blocks?: boolean, package?: string}} */ options) => {
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
        const err = /** @type {import('../../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result);

      // ── Text output ────────────────────────────────────────────
      // The api layer already resolved against core (result exists), so core is
      // present on this path; narrow away the null branch findCoreDir allows.
      const coreDir = /** @type {string} */ (findCoreDir(process.cwd()));
      const themeData = resolveTheme(process.cwd());

      // Footer shared by the compact + names list views (prose → text()).
      const listFooter = text(
        [
          `Import from the path shown (e.g. import {Button} from '@astryxdesign/core/Button')`,
          `Usage: ${run} component <name>`,
        ].join('\n'),
      );

      switch (result.type) {
        case 'component.list': {
          // One list type across all three detail levels; the depth is carried
          // in result.data.detail and the grouped map in result.data.components.
          if (result.data.detail === 'full') {
            // --detail full — dense per-component docs (signature, props, theming,
            // examples). Verbatim doc block from the shared formatter.
            emit(code(await formatBriefAll(coreDir, {zh, lang, themeData})));
            break;
          }

          if (result.data.detail === 'compact') {
            // --detail compact — one record per entry (name + import + 1-line
            // description), grouped by category. Fields mirror the JSON keys.
            const groups = result.data.components;
            const entries = Object.entries(groups);
            /** @type {import('../../formatters/index.mjs').Block[]} */
            const out = [];
            for (const [cat, items] of entries) {
              // Skip the synthetic group header when there's only one ungrouped category
              const isUngrouped =
                entries.length === 1 && items.length === 1 && items[0]?.name === cat;
              if (!isUngrouped) out.push(section(cat));
              out.push(records(items, {fields: ['name', 'import', 'description']}));
            }
            out.push(listFooter);
            emit(...out);
            break;
          }

          // --detail names (default for list views): one record per component
          // (name + import), sorted A-Z. The import field already conveys
          // families, so we skip the choppy per-family grouping that interleaved
          // headerless singletons with "(group)" sections. External or
          // name-colliding entries stay package-qualified.
          const groups = result.data.components;
          const CORE_PKG = '@astryxdesign/core';
          /** @type {Map<string, Set<string>>} */
          const nameCounts = new Map();
          for (const items of Object.values(groups)) {
            for (const item of items) {
              const set = nameCounts.get(item.name) ?? new Set();
              set.add(item.package);
              nameCounts.set(item.name, set);
            }
          }
          /** @param {import('../../../../api/component/component.type.mjs').ComponentListEntry} item */
          const importCell = item => {
            const importPath = resolveImportPath(coreDir, item.name);
            const qualify =
              item.package !== CORE_PKG || (nameCounts.get(item.name)?.size ?? 0) > 1;
            return qualify ? `${importPath}  [${item.package}]` : importPath;
          };

          const firstGroup = Object.entries(groups)[0];
          const entries =
            options.category && firstGroup ? firstGroup[1] : Object.values(groups).flat();
          const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));

          emit(
            options.category && firstGroup
              ? section(firstGroup[0])
              : section(`Components (${sorted.length})`),
            records(
              sorted.map(item => ({name: item.name, import: importCell(item)})),
              {fields: ['name', 'import']},
            ),
            listFooter,
          );
          break;
        }

        case 'component.detail': {
          const resolvedName = (name || '').replace(/^XDS/, '');
          const importHint = resolveImportPath(coreDir, resolvedName);
          const doc =
            detail === 'brief'
              ? code(formatBrief(result.data, resolvedName, importHint, {themeData}))
              : detail === 'compact'
                ? code(formatCompact(result.data, resolvedName, importHint))
                : code(formatFull(result.data, {themeData, importHint}));
          const related = await findRelatedBlocks(resolvedName);
          emit(
            doc,
            related.length > 0 && section('Related block templates'),
            related.length > 0 && records(related, {fields: ['dirName', 'description']}),
          );
          break;
        }

        case 'component.detail.props': {
          const resolvedName = (name || '').replace(/^XDS/, '');
          emit(code(formatProps({props: result.data}, resolvedName)));
          break;
        }

        case 'component.detail.source': {
          emit(code(result.data.source));
          break;
        }

        case 'component.detail.showcase': {
          emit(code(result.data.source));
          break;
        }

        case 'component.detail.blocks': {
          const {showcase, examples, related} = result.data;
          /** @type {import('../../formatters/index.mjs').Block[]} */
          const out = [];
          if (showcase) {
            out.push(
              section('Showcase'),
              record(showcase, {fields: ['displayName', 'description']}),
            );
          }
          if (examples.length > 0) {
            out.push(
              section('Examples'),
              records(examples, {fields: ['name', 'description']}),
            );
          }
          if (related.length > 0) {
            out.push(
              section(`Related: ${related.length} blocks that use ${result.data.component}`),
              list(related.map(b => b.name)),
            );
          }
          if (!showcase && examples.length === 0 && related.length === 0) {
            out.push(text(`No blocks found for ${result.data.component}`));
          }
          emit(...out);
          break;
        }
      }
    },
  });
}


// Re-export lib functions for backward compatibility
// (agent-docs.mjs, tests, and generate-skill-doc.sh import from here)
export {discoverComponents, discoverExternalComponentsGrouped, findComponentReadme, findComponentSource, findExternalComponentDoc, resolveImportPath} from '../../../../foundation/discovery/component-discovery.mjs';
export {discoverExternalPackages} from '../../../../foundation/fs/paths.mjs';
export {loadDocs} from '../../../../foundation/discovery/component-loader.mjs';
export {formatFull, formatCompact, formatBrief, formatProps, formatBriefAll} from '../../lib/component-format.mjs';
export {levenshteinDistance, findClosestComponents, searchComponents} from '../../../../foundation/text/string-utils.mjs';
