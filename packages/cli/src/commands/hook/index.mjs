// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hook command — List hooks and print hook docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh
 */

import {findCoreDir} from '../../utils/paths.mjs';
import {discoverHooks, findHookDoc} from '../../lib/hook-discovery.mjs';
import {loadDocs} from '../../lib/component-loader.mjs';
import {
  formatHookFull,
  formatHookCompact,
  formatHookBrief,
  formatHookBriefAll,
  formatHookParams,
} from '../../lib/hook-format.mjs';
import {getRunPrefix} from '../../utils/package-manager.mjs';
import {jsonOut, jsonError, humanLog} from '../../lib/json.mjs';
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
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;

      const validDetails = ['full', 'compact', 'brief'];
      if (!validDetails.includes(detail)) {
        if (json) return jsonError(`Invalid --detail value "${detail}". Valid levels: ${validDetails.join(', ')}`);
        console.error(`Error: Invalid --detail value "${detail}".`);
        console.error(`Valid levels: ${validDetails.join(', ')}`);
        process.exit(1);
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

      // ── Text output ────────────────────────────────────────────
      const coreDir = findCoreDir(process.cwd());

      switch (result.type) {
        case 'hook.list': {
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
          if (options.category || options.list || !name) {
            humanLog(await formatHookBriefAll(coreDir));
          } else {
            humanLog(formatHookBrief(result.data));
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
