// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT, discoverExternalPackages} from '../utils/paths.mjs';
import {assertWithin, isFilePathArg, PathSafetyError} from '../utils/path-safety.mjs';
import {XDSError} from './error.mjs';
import {loadConfig} from '../lib/config.mjs';
import {extractSkeleton} from './skeleton.mjs';

const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES_DIR, 'blocks');
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

// Layout skeleton extraction lives in skeleton.mjs (AST-based). It returns
// both the rendered skeleton and the structural component list from one
// traversal, so the two can never disagree.

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
    throw new XDSError(
      `Unknown template "${name}"`,
      templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
    );
  }

  if (skeleton) {
    if (!match) {
      throw new XDSError(
        'Specify a template name for --skeleton',
        templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
      );
    }
    if (!fs.existsSync(match.filePath)) {
      throw new XDSError(`No source file found for template "${name}"`);
    }
    const src = fs.readFileSync(match.filePath, 'utf-8');
    // Both the component list and the skeleton body come from one AST pass,
    // so the `# Components:` header can never disagree with the rendered tree.
    const {skeleton: skeletonText, components} = extractSkeleton(src);
    return {
      type: 'template.skeleton',
      data: {
        template: name,
        description: match.description,
        components,
        skeleton: skeletonText,
      },
    };
  }

  if (!fs.existsSync(match.filePath)) {
    throw new XDSError(`No source file found for template "${name}"`);
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
      throw new XDSError(err.message);
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
  fs.copyFileSync(match.filePath, outputFilePath);

  const relOutput = path.relative(cwd, outputDir) || '.';
  return {
    type: 'template.copy',
    data: {template: name, outputDir: relOutput, fileName: outputFileName, filesCopied: 1},
  };
}
