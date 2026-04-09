/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {XDSError} from './error.mjs';

const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');

async function loadTemplateDoc(templateDir) {
  const docPath = path.join(templateDir, 'template.doc.mjs');
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

export {discoverAll as discoverTemplates};

export function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs
    .readdirSync(TEMPLATES_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

async function discoverAll() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  const dirs = fs
    .readdirSync(TEMPLATES_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const templates = [];
  for (const dir of dirs) {
    const doc = await loadTemplateDoc(path.join(TEMPLATES_DIR, dir.name));
    templates.push({
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      isReady: doc?.isReady ?? true,
    });
  }
  return templates;
}

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.targetPath]
 * @param {boolean} [options.list]
 * @param {string} [options.cwd]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {list = false, targetPath, cwd = process.cwd()} = options;
  const templates = await discoverAll();
  const templateNames = templates.map(t => t.dirName);

  if (list || !name) {
    return {
      type: 'template.list',
      data: templates.map(t => ({
        name: t.dirName,
        description: t.description,
        isReady: t.isReady,
      })),
    };
  }

  if (!templateNames.includes(name)) {
    throw new XDSError(
      `Unknown template "${name}"`,
      templateNames.map(n => ({name: n, reason: 'available template'})),
    );
  }

  const templateDir = path.join(TEMPLATES_DIR, name);
  const outputDir = path.resolve(cwd, targetPath || `./src/pages/${name}`);

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

  const relOutput = path.relative(cwd, outputDir);
  return {
    type: 'template.copy',
    data: {template: name, outputDir: relOutput, filesCopied: copied},
  };
}
