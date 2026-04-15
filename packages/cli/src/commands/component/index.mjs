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
import {jsonOut, jsonError} from '../../lib/json.mjs';
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
          props: options.props,
          source: options.source,
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
            console.log(`\n${cat}:`);
            for (const comp of comps) console.log(`  ${comp}`);
            console.log('');
          } else {
            console.log('');
            for (const [cat, comps] of Object.entries(result.data)) {
              console.log(`${cat}:`);
              for (const comp of comps) console.log(`  ${comp}`);
              console.log('');
            }
            console.log(`Usage: ${run} xds component <name>`);
            console.log('');
          }
          break;
        }

        case 'component.brief': {
          if (options.category || options.list || !name) {
            console.log(await formatBriefAll(coreDir, {zh, lang, themeData}));
          } else {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            console.log(formatBrief(result.data, resolvedName, importHint, {themeData}));
          }
          break;
        }

        case 'component.detail': {
          if (detail === 'brief') {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            console.log(formatBrief(result.data, resolvedName, importHint, {themeData}));
          } else if (detail === 'compact') {
            const resolvedName = (name || '').replace(/^XDS/, '');
            const importHint = resolveImportPath(coreDir, resolvedName);
            console.log(formatCompact(result.data, resolvedName, importHint));
          } else {
            console.log(formatFull(result.data, {themeData}));
          }
          const compName = (name || '').replace(/^XDS/, '');
          const related = await findRelatedBlocks(compName);
          if (related.length > 0) {
            console.log('\nRelated block templates:\n');
            for (const b of related) {
              console.log(`  ${b.dirName}`);
              if (b.description) console.log(`    ${b.description}`);
            }
            console.log('');
          }
          break;
        }

        case 'component.detail.props': {
          const resolvedName = (name || '').replace(/^XDS/, '');
          console.log(formatProps({props: result.data}, resolvedName));
          break;
        }

        case 'component.detail.source': {
          console.log(result.data.source);
          break;
        }
      }
    });
}


// Re-export lib functions for backward compatibility
// (agent-docs.mjs, tests, and generate-skill-doc.sh import from here)
export {discoverComponents, discoverExternalComponents, findComponentReadme, findComponentSource, findExternalComponentDoc, resolveImportPath} from '../../lib/component-discovery.mjs';
export {discoverExternalPackages} from '../../utils/paths.mjs';
export {loadDocs} from '../../lib/component-loader.mjs';
export {formatFull, formatCompact, formatBrief, formatProps, formatBriefAll} from '../../lib/component-format.mjs';
export {levenshteinDistance, findClosestComponents, searchComponents} from '../../lib/string-utils.mjs';
