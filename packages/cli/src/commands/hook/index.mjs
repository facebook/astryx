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
import {jsonOut, jsonError} from '../../lib/json.mjs';
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
            console.log(`\n${cat}:`);
            for (const h of hookNames) console.log(`  ${h}`);
            console.log('');
          } else {
            console.log('');
            for (const [category, hookNames] of Object.entries(result.data)) {
              console.log(category);
              for (const h of hookNames) console.log(`  ${h}`);
            }
            console.log('');
            console.log(`Usage: ${run} xds hook <name>`);
            console.log('');
          }
          break;
        }

        case 'hook.brief': {
          if (options.category || options.list || !name) {
            console.log(await formatHookBriefAll(coreDir));
          } else {
            console.log(formatHookBrief(result.data));
          }
          break;
        }

        case 'hook.detail': {
          if (detail === 'brief') {
            console.log(formatHookBrief(result.data));
          } else if (detail === 'compact') {
            const importPath = result.data.importPath || '@xds/core/hooks';
            console.log(formatHookCompact(result.data, importPath));
          } else {
            console.log(formatHookFull(result.data));
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
            console.log('\nRelated block templates:\n');
            for (const b of allBlocks) {
              console.log(`  ${b.dirName}`);
              if (b.description) console.log(`    ${b.description}`);
            }
            console.log('');
          }
          break;
        }

        case 'hook.detail.params': {
          console.log(formatHookParams({params: result.data, name: name}));
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
