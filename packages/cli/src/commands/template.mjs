// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file template command — thin CLI wrapper around api/template.mjs
 */

import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {jsonOut, jsonError, humanLog} from '../lib/json.mjs';
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
            humanLog('\nPage Templates:\n');
            for (const t of pages) {
              const status = t.isReady ? '' : ' (WIP)';
              humanLog(`  ${t.name}${status}`);
              if (t.description) humanLog(`    ${t.description}`);
            }
          }
          if (blocks.length > 0) {
            humanLog('\nBlock Templates:\n');
            for (const t of blocks) {
              const status = t.isReady ? '' : ' (WIP)';
              humanLog(`  ${t.name}${status}`);
              if (t.description) humanLog(`    ${t.description}`);
            }
          }
          humanLog('\nUsage:');
          humanLog('  xds template <name> [target-path]   Scaffold page or block');
          humanLog('  xds template <name> --skeleton      Layout reference');
          humanLog('  xds template --list --type block    List only blocks\n');
          break;
        }

        case 'template.skeleton': {
          const {template: tName, description, components, skeleton} = result.data;
          humanLog(`\n# ${tName}${description ? ' — ' + description : ''}`);
          humanLog(`# Components: ${components.join(', ')}\n`);
          humanLog(skeleton);
          humanLog('');
          break;
        }

        case 'template.show': {
          humanLog(result.data.source);
          break;
        }

        case 'template.copy': {
          humanLog(`\n✓ Copied template to ${result.data.outputDir}/${result.data.fileName}\n`);
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

      humanLog(result.data.source);
    });
}
