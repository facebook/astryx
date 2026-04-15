/**
 * @file template command — thin CLI wrapper around api/template.mjs
 */

import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
import {template as templateApi, getTemplateById} from '../api/template.mjs';

export {discoverTemplates, listTemplates, getTemplateById} from '../api/template.mjs';

export function registerTemplate(program) {
  const templateCmd = program
    .command('template [name] [path]')
    .description('Inject a page or block template')
    .option('--list', 'List available templates')
    .option('--type <type>', 'Filter by template type: page or block')
    .option('--skeleton', 'Show layout skeleton with spatial annotations (padding, gap, nesting)')
    .action(async (name, targetPath, options) => {
      const json = program.opts().json || false;

      let result;
      try {
        result = await templateApi(name, {
          list: options.list,
          skeleton: options.skeleton,
          type: options.type,
          targetPath,
          cwd: process.cwd(),
        });
      } catch (e) {
        if (json) return jsonError(e.message, e.suggestions);
        console.error(`Error: ${e.message}`);
        if (e.suggestions?.length) {
          console.error(`Available: ${e.suggestions.map(s => s.name).join(', ')}`);
        }
        process.exit(1);
      }

      if (json) return jsonOut(result.type, result.data);

      switch (result.type) {
        case 'template.list': {
          const pages = result.data.filter(t => t.type === 'page');
          const blocks = result.data.filter(t => t.type === 'block');
          if (pages.length > 0) {
            console.log('\nPage Templates:\n');
            for (const t of pages) {
              const status = t.isReady ? '' : ' (WIP)';
              console.log(`  ${t.name}${status}`);
              if (t.description) console.log(`    ${t.description}`);
            }
          }
          if (blocks.length > 0) {
            console.log('\nBlock Templates:\n');
            for (const t of blocks) {
              const status = t.isReady ? '' : ' (WIP)';
              console.log(`  ${t.name}${status}`);
              if (t.description) console.log(`    ${t.description}`);
            }
          }
          console.log('\nUsage:');
          console.log('  xds template <name> [target-path]   Scaffold page or block');
          console.log('  xds template <name> --skeleton      Layout reference');
          console.log('  xds template --list --type block    List only blocks\n');
          break;
        }

        case 'template.skeleton': {
          const {template: tName, description, components, skeleton} = result.data;
          console.log(`\n# ${tName}${description ? ' — ' + description : ''}`);
          console.log(`# Components: ${components.join(', ')}\n`);
          console.log(skeleton);
          console.log('');
          break;
        }

        case 'template.show': {
          console.log(result.data.source);
          break;
        }

        case 'template.copy': {
          console.log(`\n✓ Copied template to ${result.data.outputDir}/${result.data.fileName}\n`);
          break;
        }
      }
    });

  templateCmd
    .command('get')
    .description('Fetch a template by ID via the xds.config.mjs hook')
    .requiredOption('--id <id>', 'Template identifier to fetch')
    .action(async (options) => {
      const json = program.opts().json || false;

      let result;
      try {
        result = await getTemplateById(options.id, {cwd: process.cwd()});
      } catch (e) {
        if (json) return jsonError(e.message, e.suggestions);
        console.error(`Error: ${e.message}`);
        process.exit(1);
      }

      if (json) return jsonOut(result.type, result.data);

      console.log(result.data.source);
    });
}
