// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file template command — thin CLI wrapper around api/template.mjs
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as p from '@clack/prompts';
import {isNonInteractive} from '../utils/path-safety.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {template as templateApi, getTemplateById} from '../api/template.mjs';

export {discoverTemplates, listTemplates, getTemplateById} from '../api/template.mjs';

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

export function registerTemplate(program) {
  const templateCmd = program
    .command('template [name] [path]')
    .description('Inject a page or block template')
    .option('--list', 'List available templates')
    .option('--type <type>', 'Filter by template type: page or block')
    .option('--skeleton', 'Show layout skeleton with spatial annotations (padding, gap, nesting)')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (name, targetPath, options) => {
      const json = program.opts().json || false;

      // Pre-flight overwrite check (only when we'd actually copy a file).
      // The API resolves the destination; we need to mirror its logic
      // narrowly enough to detect collisions before invoking it.
      if (
        name &&
        targetPath &&
        !options.list &&
        !options.skeleton
      ) {
        const collision = await detectTemplateCollision(name, targetPath);
        if (collision && !options.overwrite) {
          const rel = path.relative(process.cwd(), collision) || collision;
          if (json || isNonInteractive({json})) {
            const msg =
              `Refusing to overwrite existing file ${rel}. ` +
              `Re-run with --overwrite (or -f) to replace it.`;
            cliError(msg, {code: ERROR_CODES.ERR_FILE_EXISTS});
            return;
          }
          const confirmed = isCancel(
            await p.confirm({
              message: `Overwrite existing file ${rel}?`,
              initialValue: false,
            }),
          );
          if (!confirmed) {
            humanLog('Aborted. Re-run with --overwrite to replace the file.');
            return;
          }
        }
      }

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
        // template API throws structured errors with {name, reason} suggestions —
        // pass them through untouched so the CLI envelope matches the API.
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
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
        cliError(e.message, {suggestions: e.suggestions, code: e.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      humanLog(result.data.source);
    });
}

/**
 * Mirror the destination-resolution logic in api/template.mjs so we can
 * detect a clobber before invoking the API.
 *
 * Returns the absolute destination file path if it already exists, or
 * `null` otherwise (template missing, no collision, or list/skeleton mode).
 *
 * Path-safety enforcement happens inside the API; here we only need
 * enough precision to check existence — a false negative just means the
 * API will catch the issue and abort.
 */
async function detectTemplateCollision(name, targetPath) {
  const {discoverTemplates} = await import('../api/template.mjs');
  let templates;
  try {
    templates = await discoverTemplates();
  } catch {
    return null;
  }
  const match = templates.find(t => t.dirName === name);
  if (!match) return null;

  // Resolve target as the API will. We can't call assertWithin here
  // because the API does it itself; we just need to know "is there a
  // file at the destination?".
  const resolved = path.resolve(process.cwd(), targetPath);

  // File-arg branch: targetPath looks like `./foo.tsx`.
  const {isFilePathArg} = await import('../utils/path-safety.mjs');
  let dest;
  if (isFilePathArg(targetPath)) {
    dest = resolved;
  } else {
    const fileName = match.type === 'block'
      ? path.basename(match.filePath)
      : 'page.tsx';
    dest = path.join(resolved, fileName);
  }

  return fs.existsSync(dest) ? dest : null;
}
