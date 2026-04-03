/**
 * @file template command — Inject page templates
 *
 * Copies template files from packages/cli/templates/{name}/ to a target path.
 * Template metadata comes from template.doc.mjs files (TemplateDoc type).
 * Templates without a doc file fall back to directory name only.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';

async function loadTemplateDoc(templateDir) {
  const docPath = path.join(templateDir, 'template.doc.mjs');
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

export async function discoverTemplates() {
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return [];

  const dirs = fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const templates = [];
  for (const dir of dirs) {
    const doc = await loadTemplateDoc(path.join(templatesDir, dir.name));
    templates.push({
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      isReady: doc?.isReady ?? true,
    });
  }
  return templates;
}

export function listTemplates() {
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return [];
  return fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

export function registerTemplate(program) {
  program
    .command('template [name] [path]')
    .description('Inject a page template')
    .option('--list', 'List available templates')
    .action(async (name, targetPath, options) => {
      const templates = await discoverTemplates();
      const templateNames = templates.map(t => t.dirName);

      if (options.list || !name) {
        console.log('\nAvailable templates:\n');
        for (const t of templates) {
          const status = t.isReady ? '' : ' (WIP)';
          const desc = t.description ? ` — ${t.description}` : '';
          console.log(`  ${t.dirName}${status}${desc}`);
        }
        console.log('\nUsage: xds template <name> [target-path]\n');
        console.log('Example: xds template blank ./src/pages/home\n');
        return;
      }

      if (!templateNames.includes(name)) {
        console.error(`Error: Unknown template "${name}".`);
        console.error(`Available: ${templateNames.join(', ')}`);
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
        if (file === 'template.doc.mjs') continue;
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
