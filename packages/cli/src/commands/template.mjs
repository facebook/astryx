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
    .description('Inject a page template')
    .option('--list', 'List available templates with component compositions')
    .option('--skeleton', 'Show layout skeleton with spatial annotations (padding, gap, nesting)')
    .action(async (name, targetPath, options) => {
      const json = program.opts().json || false;

      let result;
      try {
        result = await templateApi(name, {
          list: options.list,
          skeleton: options.skeleton,
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
          console.log('\nAvailable templates:\n');
          for (const t of result.data) {
            const status = t.isReady ? '' : ' (WIP)';
            console.log(`  ${t.name}${status}`);
            if (t.description) console.log(`    ${t.description}`);
          }
          console.log('\nUsage:');
          console.log('  xds template <name> [target-path]   Scaffold page');
          console.log('  xds template <name> --skeleton      Layout reference\n');
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
          console.log(`\n✓ Copied template to ${result.data.outputDir}/page.tsx\n`);
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
