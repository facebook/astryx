/**
 * @file template command — Inject page templates
 *
 * Copies template files from packages/cli/templates/{name}/ to a target path.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';

/**
 * List available templates by scanning the templates directory.
 */
export function listTemplates() {
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return [];

  return fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

const TEMPLATE_DESCRIPTIONS = {
  blank: 'Minimal scaffold',
  table: 'Data table with actions',
  login: 'Auth form with inputs',
};

export function registerTemplate(program) {
  program
    .command('template [name] [path]')
    .description('Inject a page template')
    .option('--list', 'List available templates')
    .action((name, targetPath, options) => {
      const templates = listTemplates();

      if (options.list || !name) {
        console.log('\nAvailable templates:\n');
        for (const t of templates) {
          const desc = TEMPLATE_DESCRIPTIONS[t] || '';
          console.log(`  ${t} — ${desc}`);
        }
        console.log(`\nUsage: xds template <name> [target-path]\n`);
        console.log('Example: xds template blank ./src/pages/home\n');
        return;
      }

      if (!templates.includes(name)) {
        console.error(`Error: Unknown template "${name}".`);
        console.error(`Available: ${templates.join(', ')}`);
        process.exit(1);
      }

      const outputDir = path.resolve(
        process.cwd(),
        targetPath || `./src/pages/${name}`,
      );
      const templateDir = path.join(CLI_ROOT, 'templates', name);

      fs.mkdirSync(outputDir, {recursive: true});

      const files = fs.readdirSync(templateDir);
      let copied = 0;

      for (const file of files) {
        const srcPath = path.join(templateDir, file);
        const stat = fs.statSync(srcPath);
        if (!stat.isFile()) continue;

        fs.copyFileSync(srcPath, path.join(outputDir, file));
        copied++;
      }

      const relOutput = path.relative(process.cwd(), outputDir);
      console.log(`\n✓ Copied ${copied} template files to ${relOutput}/\n`);
    });
}
