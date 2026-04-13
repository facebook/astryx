/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {XDSError} from './error.mjs';
import {loadConfig} from '../lib/config.mjs';

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

const UBIQUITOUS = new Set([
  'Text', 'Heading', 'Button', 'HStack', 'VStack', 'Link',
  'StackItem', 'Icon',
]);

function extractComponents(pagePath) {
  const src = fs.readFileSync(pagePath, 'utf-8');
  return [...new Set(
    (src.match(/XDS[A-Z]\w+/g) || [])
      .map(n => n.replace(/^XDS/, ''))
      .filter(n => !['Theme', 'ThemeProvider'].includes(n))
      .filter(n => !UBIQUITOUS.has(n))
      .map(n => n.replace(/(Item|Section|Header|Content|Footer|Panel|Heading|CollapseButton|Column|Sortable|Selection|Group|Source)$/, ''))
      .filter(Boolean),
  )].sort();
}

const STRUCTURAL = new Set([
  'AppShell', 'Layout', 'LayoutHeader', 'LayoutContent', 'LayoutPanel',
  'LayoutFooter', 'Card', 'Section', 'Grid', 'GridSpan', 'List',
  'Table', 'TabList', 'Toolbar', 'SideNav', 'TopNav', 'Dialog',
  'FormLayout', 'Center',
]);

function extractSkeleton(source) {
  const lines = source.split('\n');
  const out = [];
  let depth = 0;
  let capturing = false;
  let inDefaultExport = false;
  const MAX_LINES = 35;
  const depthStack = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    if (t.match(/^export\s+default\s+function/)) { inDefaultExport = true; continue; }
    if (inDefaultExport && t.match(/^return\s*\(/)) { capturing = true; continue; }
    if (!capturing) continue;
    if (out.length >= MAX_LINES) {
      if (!out[out.length - 1]?.includes('...')) out.push('  '.repeat(depth) + '...');
      continue;
    }

    const openMatch = t.match(/^<(XDS\w+)/);
    if (openMatch && !t.startsWith('</')) {
      const comp = openMatch[1].replace(/^XDS/, '');
      let tagText = '';
      for (let j = i; j < Math.min(i + 12, lines.length); j++) {
        tagText += ' ' + lines[j];
        if (lines[j].includes('>')) break;
      }

      const props = [];
      const propRegex = /\b(padding|contentPadding|gap|rowGap|columnGap|columns|minChildWidth|hasDivider|defaultHasDividers|variant|density|role|height|width|maxWidth)\s*[=]\s*\{?\s*['"]?([^}'"\s,/>]+)/g;
      let m;
      while ((m = propRegex.exec(tagText)) !== null) {
        const val = m[2];
        if (val === 'true') props.push(m[1]);
        else if (/^\d+$/.test(val)) props.push(`${m[1]}={${val}}`);
        else props.push(`${m[1]}="${val}"`);
      }

      const hasSpatialProps = props.length > 0;
      const propStr = hasSpatialProps ? ' ' + props.join(' ') : '';
      const isVStack = comp === 'VStack' || comp === 'HStack';
      const isSelfClosing = tagText.match(new RegExp('<' + openMatch[1] + '[^>]*/>', 's'));

      if (isVStack && !hasSpatialProps) continue;

      if (isSelfClosing) {
        out.push('  '.repeat(depth) + `<${comp}${propStr} />`);
      } else if (STRUCTURAL.has(comp) || (isVStack && hasSpatialProps)) {
        out.push('  '.repeat(depth) + `<${comp}${propStr}>`);
        depthStack.push(comp);
        depth++;
      } else {
        out.push('  '.repeat(depth) + `<${comp}${propStr} />`);
      }
      continue;
    }

    const closeMatch = t.match(/^<\/(XDS\w+)>/);
    if (closeMatch) {
      const comp = closeMatch[1].replace(/^XDS/, '');
      if (depthStack.length > 0 && depthStack[depthStack.length - 1] === comp) {
        depthStack.pop();
        depth = Math.max(0, depth - 1);
        out.push('  '.repeat(depth) + `</${comp}>`);
      }
      continue;
    }

    const slotMatch = t.match(/^(header|content|footer|start|end|sideNav|topNav)\s*=\s*\{/);
    if (slotMatch) {
      out.push('  '.repeat(depth) + `/* ${slotMatch[1]}: */`);
      continue;
    }

    if (t.startsWith('<div') && (t.includes('padding') || t.includes('maxWidth') || t.includes('gap:'))) {
      const styleProps = [];
      const divText = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
      const pp = divText.match(/padding[^:]*:\s*['"]?([^'"},)]+)/);
      const mw = divText.match(/maxWidth:\s*(\d+)/);
      const gp = divText.match(/gap:\s*(\d+)/);
      const mg = divText.match(/margin:\s*['"]([^'"]+)['"]/);
      const mi = divText.match(/marginInline:\s*['"]([^'"]+)['"]/);
      if (pp) styleProps.push(`padding: ${pp[1].trim()}`);
      if (mw) styleProps.push(`maxWidth: ${mw[1]}`);
      if (gp) styleProps.push(`gap: ${gp[1]}`);
      if (mg) styleProps.push(`margin: ${mg[1]}`);
      if (mi) styleProps.push(`marginInline: ${mi[1]}`);
      if (styleProps.length > 0) {
        out.push('  '.repeat(depth) + `/* div: ${styleProps.join(', ')} */`);
      }
    }
  }

  return out.filter(l => l.trim()).join('\n');
}

/**
 * Fetch a template by ID using the `template.get` hook in xds.config.mjs.
 * @param {string} id
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{type: 'template.get', data: {id: string, source: string}}>}
 */
export async function getTemplateById(id, options = {}) {
  const {cwd = process.cwd()} = options;
  const config = await loadConfig(cwd);

  const getter = config.template?.get;
  if (typeof getter !== 'function') {
    throw new XDSError(
      'Template fetching by ID is not configured.\n' +
        'Add a template.get function to xds.config.mjs:\n\n' +
        '  export default {\n' +
        '    template: {\n' +
        "      get: async (id) => { /* return template source string */ },\n" +
        '    },\n' +
        '  };',
    );
  }

  let source;
  try {
    source = await getter(id);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new XDSError(`template.get("${id}") threw an error: ${detail}`);
  }

  if (source == null) {
    throw new XDSError(
      `template.get("${id}") returned ${source} — no template found for that ID`,
    );
  }

  if (typeof source !== 'string') {
    throw new XDSError(
      `template.get("${id}") must return a string, got ${typeof source}`,
    );
  }

  if (source.trim() === '') {
    throw new XDSError(
      `template.get("${id}") returned an empty string`,
    );
  }

  return {type: 'template.get', data: {id, source}};
}

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.targetPath]
 * @param {boolean} [options.list]
 * @param {boolean} [options.skeleton]
 * @param {boolean} [options.show]
 * @param {string} [options.cwd]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {list = false, skeleton = false, show = false, targetPath, cwd = process.cwd()} = options;
  const templates = await discoverAll();
  const templateNames = templates.map(t => t.dirName);

  if (list || (!name && !skeleton)) {
    return {
      type: 'template.list',
      data: templates.map(t => ({
        name: t.dirName,
        description: t.description,
        isReady: t.isReady,
      })),
    };
  }

  if (name && !templateNames.includes(name)) {
    throw new XDSError(
      `Unknown template "${name}"`,
      templateNames.map(n => ({name: n, reason: 'available template'})),
    );
  }

  if (skeleton) {
    if (!name) {
      throw new XDSError(
        'Specify a template name for --skeleton',
        templateNames.map(n => ({name: n, reason: 'available template'})),
      );
    }
    const pagePath = path.join(TEMPLATES_DIR, name, 'page.tsx');
    if (!fs.existsSync(pagePath)) {
      throw new XDSError(`No page.tsx found for template "${name}"`);
    }
    const src = fs.readFileSync(pagePath, 'utf-8');
    const doc = await loadTemplateDoc(path.join(TEMPLATES_DIR, name));
    return {
      type: 'template.skeleton',
      data: {
        template: name,
        description: doc?.description || '',
        components: extractComponents(pagePath),
        skeleton: extractSkeleton(src),
      },
    };
  }

  const templateDir = path.join(TEMPLATES_DIR, name);
  const pagePath = path.join(templateDir, 'page.tsx');
  const doc = await loadTemplateDoc(templateDir);

  if (!fs.existsSync(pagePath)) {
    throw new XDSError(`No page.tsx found for template "${name}"`);
  }

  // Show mode: return page.tsx content without writing to disk
  if (show || !targetPath) {
    return {
      type: 'template.show',
      data: {
        template: name,
        description: doc?.description || '',
        components: extractComponents(pagePath),
        source: fs.readFileSync(pagePath, 'utf-8'),
      },
    };
  }

  // Copy mode: write page.tsx to disk
  const outputDir = path.resolve(cwd, targetPath);
  fs.mkdirSync(outputDir, {recursive: true});
  fs.copyFileSync(pagePath, path.join(outputDir, 'page.tsx'));

  const relOutput = path.relative(cwd, outputDir);
  return {
    type: 'template.copy',
    data: {template: name, outputDir: relOutput, filesCopied: 1},
  };
}
