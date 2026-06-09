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
import {getRunPrefix} from '../../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {hook as hookApi} from '../../api/hook.mjs';
import {findRelatedBlocks} from '../../api/template.mjs';

export function registerHook(program) {
  program
    .command('hook [name]')
    .description('List hooks or print hook docs')
    .option('--list', 'List all hooks grouped by category')
    .option('--category <category>', 'List hooks in a specific category')
    .option('--params', 'Print only the parameters table')
    .action(async (name, options) => {
      const run = getRunPrefix();
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

      let result;
      try {
        result = await hookApi(name, {
          cwd: process.cwd(),
          list: options.list,
          category: options.category,
          params: options.params,
          detail,
          lang, zh,
        });
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions, code: e.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      // ── Text output ────────────────────────────────────────────
      switch (result.type) {
        case 'hook.list': {
          // --detail brief (default for list views) — names only.
          if (options.category) {
            const [cat, hookNames] = Object.entries(result.data)[0];
            humanLog(`\n${cat}:`);
            for (const h of hookNames) humanLog(`  ${h}`);
            humanLog('');
          } else {
            humanLog('');
            for (const [category, hookNames] of Object.entries(result.data)) {
              humanLog(category);
              for (const h of hookNames) humanLog(`  ${h}`);
            }
            humanLog('');
            humanLog(`Usage: ${run} xds hook <name>`);
            humanLog('');
          }
          break;
        }

        case 'hook.brief': {
          // --detail compact — name + 1-line description per entry.
          humanLog('');
          for (const [cat, items] of Object.entries(result.data)) {
            humanLog(cat);
            for (const item of items) {
              const desc = item.description ? ` — ${item.description}` : '';
              humanLog(`  ${item.name}${desc}`);
            }
            humanLog('');
          }
          humanLog(`Usage: ${run} xds hook <name>`);
          humanLog('');
          break;
        }

        case 'hook.full': {
          // --detail full — dense per-hook docs grouped by category
          // (import block, best practices, full params + returns tables, related).
          humanLog('');
          for (const [cat, items] of Object.entries(result.data)) {
            humanLog(`## ${cat}\n`);
            for (const item of items) {
              const importPath = item.importPath || '@xds/core/hooks';
              humanLog(formatHookCompact(item, importPath));
            }
          }
          break;
        }

        case 'hook.detail': {
          if (detail === 'brief') {
            humanLog(formatHookBrief(result.data));
          } else if (detail === 'compact') {
            const importPath = result.data.importPath || '@xds/core/hooks';
            humanLog(formatHookCompact(result.data, importPath));
          } else {
            humanLog(formatHookFull(result.data));
          }
          // Show related block templates from relatedComponents
          const relatedComps = result.data.relatedComponents || [];
          const allBlocks = [];
          for (const comp of relatedComps) {
            const blocks = await findRelatedBlocks(comp);
            for (const b of blocks) {
              if (!allBlocks.some(existing => existing.dirName === b.dirName)) {
                allBlocks.push(b);
              }
            }
          }
          if (allBlocks.length > 0) {
            humanLog('\nRelated block templates:\n');
            for (const b of allBlocks) {
              humanLog(`  ${b.dirName}`);
              if (b.description) humanLog(`    ${b.description}`);
            }
            humanLog('');
          }
          break;
        }

        case 'hook.detail.params': {
          humanLog(formatHookParams({params: result.data, name: name}));
          break;
        }
      }
    });
}

// Re-export lib functions for external consumers
export {discoverHooks, findHookDoc, getAllHookNames} from '../../lib/hook-discovery.mjs';
export {loadDocs} from '../../lib/component-loader.mjs';
export {
  formatHookFull,
  formatHookCompact,
  formatHookBrief,
  formatHookBriefAll,
  formatHookParams,
} from '../../lib/hook-format.mjs';
