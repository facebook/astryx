// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT, discoverExternalPackages} from '../utils/paths.mjs';
import {assertWithin, isFilePathArg, PathSafetyError} from '../utils/path-safety.mjs';
import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {loadConfig} from '../lib/config.mjs';

const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES_DIR, 'blocks');

/**
 * Inline placeholder swapped in for demo imagery when scaffolding a template,
 * so scaffolded pages render with zero setup (see stripTemplateAssetRefs).
 * Neutral hex colors (not design tokens) so it renders in any project, themed
 * or not. Mirrors apps/docsite/public/template-assets/placeholder.svg.
 */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f5f6f8%22%2F%3E%3Cg%20transform%3D%22translate%28200%20150%29%22%20fill%3D%22none%22%20stroke%3D%22%23c2cad6%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%22-44%22%20y%3D%22-44%22%20width%3D%2288%22%20height%3D%2288%22%20rx%3D%2216%22%2F%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%22-18%22%20r%3D%222.5%22%20fill%3D%22%23c2cad6%22%20stroke%3D%22none%22%2F%3E%3Cpath%20d%3D%22M-34%2030%20L-8%200%20L10%2018%20L20%208%20L34%2024%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

/**
 * Demo-image sources to strip from scaffolded projects — Meta's lookaside CDN
 * (a Meta-only network dependency). Genuine third-party URLs (e.g. brand logos
 * from paypalobjects.com) are intentionally left untouched.
 *
 * @type {RegExp[]}
 */
const DEMO_IMAGE_PATTERNS = [
  /https?:\/\/(?:[\w-]+\.)*lookaside\.facebook\.com\/[^\s'"`)]+/g,
];

/**
 * Replace demo image references with a self-contained placeholder data URI so
 * scaffolded pages render with zero setup. Builders drop in their own images.
 *
 * @param {string} source - Template source code.
 * @returns {string} Source with demo image references replaced.
 */
export function stripTemplateAssetRefs(source) {
  return DEMO_IMAGE_PATTERNS.reduce(
    (out, pattern) => out.replace(pattern, PLACEHOLDER_IMAGE),
    source,
  );
}
async function loadDocModule(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

export {discoverAll as discoverTemplates};

export function listTemplates() {
  const all = [];
  if (fs.existsSync(PAGES_DIR)) {
    all.push(...fs.readdirSync(PAGES_DIR, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name));
  }
  return all.sort();
}

function findDocFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findDocFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

async function discoverPages() {
  if (!fs.existsSync(PAGES_DIR)) return [];
  const dirs = fs.readdirSync(PAGES_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory());

  const templates = [];
  for (const dir of dirs) {
    const dirPath = path.join(PAGES_DIR, dir.name);
    const doc = await loadDocModule(path.join(dirPath, 'template.doc.mjs'));
    templates.push({
      type: 'page',
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      category: doc?.category || '',
      isReady: doc?.isReady ?? true,
      scaffold: doc?.scaffold ?? false,
      filePath: path.join(dirPath, 'page.tsx'),
      docPath: path.join(dirPath, 'template.doc.mjs'),
    });
  }
  return templates;
}

async function discoverBlocks() {
  const docFiles = findDocFiles(BLOCKS_DIR, /\.doc\.mjs$/);
  const blocks = [];
  for (const docPath of docFiles) {
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxPath = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxPath)) continue;
    const doc = await loadDocModule(docPath);
    const relPath = path.relative(BLOCKS_DIR, path.dirname(docPath));
    blocks.push({
      type: 'block',
      dirName: basename,
      name: doc?.name || basename,
      description: doc?.description || '',
      isReady: doc?.isReady ?? true,
      aspectRatio: doc?.aspectRatio ?? 1,
      componentsUsed: doc?.componentsUsed ?? [],
      isShowcase: doc?.isShowcase ?? false,
      filePath: tsxPath,
      docPath,
      category: relPath,
    });
  }
  return blocks;
}

/**
 * Discover blocks from external packages that declare `xds.blocks`.
 * Same shape as discoverBlocks() output.
 *
 * @param {string} [cwd]
 */
async function discoverExternalBlocks(cwd = process.cwd()) {
  const externals = discoverExternalPackages(cwd);
  const blocks = [];

  for (const ext of externals) {
    if (!ext.blocksDir || !fs.existsSync(ext.blocksDir)) continue;
    const docFiles = findDocFiles(ext.blocksDir, /\.doc\.mjs$/);
    for (const docPath of docFiles) {
      const basename = path.basename(docPath, '.doc.mjs');
      const tsxPath = path.join(path.dirname(docPath), basename + '.tsx');
      if (!fs.existsSync(tsxPath)) continue;
      const doc = await loadDocModule(docPath);
      const relPath = path.relative(ext.blocksDir, path.dirname(docPath));
      blocks.push({
        type: 'block',
        dirName: basename,
        name: doc?.name || basename,
        description: doc?.description || '',
        isReady: doc?.isReady ?? true,
        aspectRatio: doc?.aspectRatio ?? 1,
        componentsUsed: doc?.componentsUsed ?? [],
        isShowcase: doc?.isShowcase ?? false,
        filePath: tsxPath,
        docPath,
        category: relPath,
        package: ext.name,
      });
    }
  }

  return blocks;
}

/**
 * Discover all blocks — core + external packages.
 * @param {string} [cwd]
 */
async function discoverAllBlocks(cwd = process.cwd()) {
  const [core, external] = await Promise.all([
    discoverBlocks(),
    discoverExternalBlocks(cwd),
  ]);
  return [...core, ...external];
}

async function discoverAll() {
  const [pages, blocks] = await Promise.all([
    discoverPages(),
    discoverAllBlocks(),
  ]);
  return [...pages, ...blocks].sort((a, b) => a.name.localeCompare(b.name));
}

export async function findRelatedBlocks(componentName, cwd) {
  const blocks = await discoverAllBlocks(cwd);
  return blocks.filter(b =>
    b.componentsUsed.some(c =>
      c.toLowerCase() === componentName.toLowerCase(),
    ),
  );
}

/**
 * @param {string} componentName
 * @param {string} [cwd]
 * @param {{ package?: string }} [options] - When set, only search blocks from this package.
 *   Core blocks have no `package` field; external blocks have `package` set to the npm name.
 */
export async function findShowcase(componentName, cwd, options) {
  const blocks = await discoverAllBlocks(cwd);
  const lc = componentName.toLowerCase();
  const packageFilter = options?.package;

  // When scoped to a package, only consider blocks from that package.
  // Core blocks have no `package` field — filter them out when a package is specified.
  const showcases = blocks.filter(b => {
    if (!b.isShowcase) return false;
    if (packageFilter) return b.package === packageFilter;
    return true;
  });

  const toResult = (b) => ({
    name: b.name,
    aspectRatio: b.aspectRatio,
    filePath: b.filePath,
    docPath: b.docPath,
  });

  // Priority 1: own directory (components/Badge/ for "Badge")
  const dirMatch = showcases.find(b => {
    const catDir = b.category.split('/').pop()?.toLowerCase();
    return catDir === lc;
  });
  if (dirMatch) return toResult(dirMatch);

  // Priority 2: componentsUsed in any directory (ClickableCard in Card/)
  const usedMatch = showcases.find(b =>
    b.componentsUsed.some(c => c.toLowerCase() === lc),
  );
  if (usedMatch) return toResult(usedMatch);

  return null;
}

const UBIQUITOUS = new Set([
  'Text', 'Heading', 'Button', 'HStack', 'VStack', 'Link',
  'StackItem', 'Icon',
]);

export function extractComponents(pagePath) {
  const src = fs.readFileSync(pagePath, 'utf-8');
  // Match JSX opening tags, e.g. `<Section` or the legacy `<XDSSection`.
  // Templates author bare component names post un-prefix migration
  // (P2380608025), so the `XDS` prefix is optional. Anchoring on the `<`
  // JSX-tag boundary keeps this precise (avoids matching imports/comments/
  // identifiers) while remaining prefix-agnostic.
  const tagRegex = /<(XDS)?([A-Z]\w+)/g;
  const matches = [];
  let m;
  while ((m = tagRegex.exec(src)) !== null) {
    matches.push(m[2]);
  }
  return [...new Set(
    matches
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

    // Match a JSX opening tag, e.g. `<Section` or the legacy `<XDSSection`.
    // The `XDS` prefix is optional (templates author bare names post
    // un-prefix migration P2380608025). `tagName` is the full authored name
    // (used for the self-closing lookahead); `comp` is the bare display name.
    const openMatch = t.match(/^<((XDS)?([A-Z]\w+))/);
    if (openMatch && !t.startsWith('</')) {
      const tagName = openMatch[1];
      const comp = openMatch[3];
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
      const isSelfClosing = tagText.match(new RegExp('<' + tagName + '[^>]*/>', 's'));

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

    const closeMatch = t.match(/^<\/(XDS)?([A-Z]\w+)>/);
    if (closeMatch) {
      const comp = closeMatch[2];
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
 * Fetch a template by ID using the `template.get` hook in astryx.config.mjs.
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
    throw new AstryxError(
      'Template fetching by ID is not configured.\n' +
        'Add a template.get function to astryx.config.mjs:\n\n' +
        '  export default {\n' +
        '    template: {\n' +
        "      get: async (id) => { /* return template source string */ },\n" +
        '    },\n' +
        '  };',
      undefined,
      ERROR_CODES.ERR_TEMPLATE_CONFIG,
    );
  }

  let source;
  try {
    source = await getter(id);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new AstryxError(`template.get("${id}") threw an error: ${detail}`, undefined, ERROR_CODES.ERR_TEMPLATE_GET);
  }

  if (source == null) {
    throw new AstryxError(
      `template.get("${id}") returned ${source} — no template found for that ID`,
      undefined,
      ERROR_CODES.ERR_TEMPLATE_GET,
    );
  }

  if (typeof source !== 'string') {
    throw new AstryxError(
      `template.get("${id}") must return a string, got ${typeof source}`,
      undefined,
      ERROR_CODES.ERR_TEMPLATE_GET,
    );
  }

  if (source.trim() === '') {
    throw new AstryxError(
      `template.get("${id}") returned an empty string`,
      undefined,
      ERROR_CODES.ERR_TEMPLATE_GET,
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
 * @param {'page'|'block'} [options.type] - Filter list views by template kind.
 * @param {string} [options.cwd]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {list = false, skeleton = false, show = false, targetPath, type, cwd = process.cwd()} = options;
  const templates = await discoverAll();

  if (list || (!name && !skeleton)) {
    let filtered = templates;
    if (type) filtered = templates.filter(t => t.type === type);
    return {
      type: 'template.list',
      data: filtered.map(t => ({
        name: t.dirName,
        displayName: t.name,
        description: t.description,
        isReady: t.isReady,
        scaffold: t.scaffold ?? false,
        type: t.type,
      })),
    };
  }

  const match = templates.find(t => t.dirName === name);
  if (name && !match) {
    throw new AstryxError(
      `Unknown template "${name}"`,
      templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }

  if (skeleton) {
    if (!match) {
      throw new AstryxError(
        'Specify a template name for --skeleton',
        templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
        ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
      );
    }
    if (!fs.existsSync(match.filePath)) {
      throw new AstryxError(`No source file found for template "${name}"`, undefined, ERROR_CODES.ERR_NO_SOURCE);
    }
    const src = fs.readFileSync(match.filePath, 'utf-8');
    return {
      type: 'template.skeleton',
      data: {
        template: name,
        description: match.description,
        components: extractComponents(match.filePath),
        skeleton: extractSkeleton(src),
      },
    };
  }

  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(`No source file found for template "${name}"`, undefined, ERROR_CODES.ERR_NO_SOURCE);
  }

  if (show || !targetPath) {
    return {
      type: 'template.show',
      data: {
        template: name,
        description: match.description,
        type: match.type,
        components: extractComponents(match.filePath),
        source: fs.readFileSync(match.filePath, 'utf-8'),
      },
    };
  }

  // Path-safety: resolve the user-supplied targetPath relative to cwd,
  // rejecting absolute paths and any traversal that escapes the project
  // root. This guard runs BEFORE any mkdir/copyFile so we never create
  // directories outside the root just to fail on the file write.
  let resolvedTarget;
  try {
    resolvedTarget = assertWithin(targetPath, cwd, {
      label: 'template target path',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, undefined, ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }

  // If targetPath looks like a file (e.g. `./foo.tsx`), write directly to
  // it. Previously this path was treated as a directory and the file was
  // written as `./foo.tsx/page.tsx`, which is wrong and surprising.
  let outputDir;
  let outputFileName;
  let outputFilePath;
  if (isFilePathArg(targetPath)) {
    outputDir = path.dirname(resolvedTarget);
    outputFileName = path.basename(resolvedTarget);
    outputFilePath = resolvedTarget;
  } else {
    outputDir = resolvedTarget;
    outputFileName = match.type === 'block'
      ? path.basename(match.filePath)
      : 'page.tsx';
    outputFilePath = path.join(outputDir, outputFileName);
  }

  fs.mkdirSync(outputDir, {recursive: true});

  // Strip demo image references so the scaffolded file renders without a
  // Meta-only network dependency.
  const source = fs.readFileSync(match.filePath, 'utf-8');
  const outputSource = stripTemplateAssetRefs(source);
  fs.writeFileSync(outputFilePath, outputSource);

  const relOutput = path.relative(cwd, outputDir) || '.';
  return {
    type: 'template.copy',
    data: {template: name, outputDir: relOutput, fileName: outputFileName, filesCopied: 1},
  };
}
