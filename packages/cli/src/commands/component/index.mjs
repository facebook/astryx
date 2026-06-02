// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file component command — List components and print component docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh|dense
 */

import {findCoreDir, discoverExternalPackages} from '../../utils/paths.mjs';
import {
  discoverComponents,
  discoverExternalComponents,
  findComponentReadme,
  resolveImportPath,
} from '../../lib/component-discovery.mjs';
import {loadDocs} from '../../lib/component-loader.mjs';
import {
  formatFull,
  formatCompact,
  formatBrief,
  formatProps,
  formatBriefAll,
} from '../../lib/component-format.mjs';
import {resolveTheme} from '../../lib/resolve-theme.mjs';
import {getRunPrefix} from '../../utils/package-manager.mjs';
import {jsonOut, jsonError, humanLog} from '../../lib/json.mjs';
import {component as componentApi} from '../../api/component.mjs';
import {findRelatedBlocks} from '../../api/template.mjs';

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
    .action(async (name, options) => {
      const run = getRunPrefix();
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
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
        result = await componentApi(name, {
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
      const themeData = resolveTheme(process.cwd());

      switch (result.type) {
        case 'component.list': {
          if (options.category) {
            const [cat, comps] = Object.entries(result.data)[0];
            humanLog(`\n${cat}:`);
            for (const comp of comps) humanLog(`  ${comp}`);
            humanLog('');
          } else {
            humanLog('');
            for (const [key, comps] of Object.entries(result.data)) {
              const isUngrouped = comps.length === 1 && comps[0] === key;
              if (isUngrouped) {
                humanLog(key);
              } else {
                humanLog(key);
                for (const comp of comps) humanLog(`  ${comp}`);
              }
            }
            humanLog('');
            humanLog(`Usage: ${run} xds component <name>`);
            humanLog('');
          }
          break;
        }

        case 'component.brief': {
          if (options.category || options.list || !name) {
            humanLog(await formatBriefAll(coreDir, {zh, lang, themeData}));
          } else {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            humanLog(formatBrief(result.data, resolvedName, importHint, {themeData}));
          }
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
            humanLog(formatFull(result.data, {themeData}));
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
