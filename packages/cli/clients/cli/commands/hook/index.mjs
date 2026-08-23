// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hook command — List hooks and print hook docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh
 */

import {
  formatHookFull,
  formatHookCompact,
  formatHookBrief,
  formatHookParams,
} from '../../lib/hook-format.mjs';
import {getCliInvocation} from '../../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../../foundation/response/json.mjs';
import {emit, section, text, list, records, code} from '../../formatters/index.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {defineCommand} from '../../lib/define-command.mjs';
import {ERROR_CODES} from '../../../../foundation/response/error-codes.mjs';
import {hook as hookApi} from '../../../../api/hook/hook.mjs';
import {findRelatedBlocks} from '../../../../api/template/template.mjs';
import {doc as hookCommand} from '../hook.doc.mjs';
import {doc as hookFn} from '../../../../api/hook/hook.doc.mjs';

/**
 * The api layer's hook() widens its return to `{type: string, data: unknown}`,
 * so annotate the command-local result with the precise discriminated union from
 * the colocated api/hook/hook.type.mjs to get narrowing + typed data.
 *
 * @typedef {(
 *   | import('../../../../api/hook/hook.type.mjs').HookListResponse
 *   | import('../../../../api/hook/hook.type.mjs').HookDetailResponse
 *   | import('../../../../api/hook/hook.type.mjs').HookDetailParamsResponse
 * )} HookResult
 */

/** @param {import('commander').Command} program */
export function registerHook(program) {
  defineCommand(program, hookCommand, {
    fn: hookFn,
    action:
      /**
       * @param {string|undefined} name
       * @param {{list?: boolean, category?: string, params?: boolean}} options
       */
      async (name, options) => {
      const run = getCliInvocation();
      const zh = program.opts().zh || false;
      const lang = program.opts().lang || null;
      const detailSource = program.getOptionValueSource('detail');
      const isListView = options.list || options.category || !name;
      // Default detail level is full for single-hook view, brief for list views.
      let detail = program.opts().detail || 'full';
      if (isListView && detailSource === 'default') detail = 'brief';
      const json = program.opts().json || false;

      const validDetails = ['full', 'compact', 'brief'];
      if (!validDetails.includes(detail)) {
        cliError(`Invalid --detail value "${detail}". Valid levels: ${validDetails.join(', ')}`, {code: ERROR_CODES.ERR_INVALID_DETAIL});
        return;
      }

      /** @type {HookResult} */
      let result;
      try {
        result = /** @type {HookResult} */ (await hookApi(name, {
          cwd: process.cwd(),
          list: options.list,
          category: options.category,
          params: options.params,
          detail,
          lang, zh,
        }));
      } catch (e) {
        const err = /** @type {import('../../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result);

      // ── Text output ────────────────────────────────────────────
      switch (result.type) {
        case 'hook.list': {
          // One list type across all three detail levels; the depth is carried
          // in result.data.detail and the grouped map in result.data.components.
          if (result.data.detail === 'full') {
            // --detail full — dense per-hook docs grouped by category
            // (import block, best practices, full params + returns tables, related).
            // The whole view is one markdown document: a `## <category>` heading
            // over each category's concatenated hook docs.
            const groups = result.data.components;
            /** @type {import('../../formatters/index.mjs').Block[]} */
            const out = [];
            for (const [cat, items] of Object.entries(groups)) {
              const body = items
                .map(item =>
                  formatHookCompact(item, item.importPath || '@astryxdesign/core/hooks'),
                )
                .join('\n');
              out.push(code(`## ${cat}\n\n${body}`));
            }
            emit(...out);
            break;
          }

          if (result.data.detail === 'compact') {
            // --detail compact — one record (name + description) per hook,
            // grouped by category.
            const groups = result.data.components;
            /** @type {import('../../formatters/index.mjs').Block[]} */
            const out = [];
            for (const [cat, items] of Object.entries(groups)) {
              out.push(section(cat), records(items, {fields: ['name', 'description']}));
            }
            out.push(text(`Usage: ${run} hook <name>`));
            emit(...out);
            break;
          }

          // --detail names (default for list views) — names only, grouped by
          // category.
          const groups = result.data.components;
          if (options.category) {
            const [cat, hookNames] = Object.entries(groups)[0];
            emit(section(`${cat}:`), list(hookNames));
          } else {
            /** @type {import('../../formatters/index.mjs').Block[]} */
            const out = [];
            for (const [category, hookNames] of Object.entries(groups)) {
              out.push(section(category), list(hookNames));
            }
            out.push(text(`Usage: ${run} hook <name>`));
            emit(...out);
          }
          break;
        }

        case 'hook.detail': {
          const doc =
            detail === 'brief'
              ? formatHookBrief(result.data)
              : detail === 'compact'
                ? formatHookCompact(
                    result.data,
                    result.data.importPath || '@astryxdesign/core/hooks',
                  )
                : formatHookFull(result.data);

          // Show related block templates from relatedComponents
          const relatedComps = result.data.relatedComponents || [];
          /** @type {import('../../../../api/template/template.mjs').DiscoveredTemplate[]} */
          const allBlocks = [];
          for (const comp of relatedComps) {
            const blocks = await findRelatedBlocks(comp);
            for (const b of blocks) {
              if (!allBlocks.some(existing => existing.dirName === b.dirName)) {
                allBlocks.push(b);
              }
            }
          }

          emit(
            code(doc),
            allBlocks.length > 0 && section('Related block templates'),
            allBlocks.length > 0 &&
              records(allBlocks, {fields: ['dirName', 'description']}),
          );
          break;
        }

        case 'hook.detail.params': {
          emit(code(formatHookParams({params: result.data, name})));
          break;
        }
      }
    },
  });
}

// Re-export lib functions for external consumers
export {discoverHooks, findHookDoc, getAllHookNames} from '../../../../foundation/discovery/hook-discovery.mjs';
export {loadDocs} from '../../../../foundation/discovery/component-loader.mjs';
export {
  formatHookFull,
  formatHookCompact,
  formatHookBrief,
  formatHookBriefAll,
  formatHookParams,
} from '../../lib/hook-format.mjs';
