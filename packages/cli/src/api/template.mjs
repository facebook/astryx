// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT, discoverExternalPackages} from '../utils/paths.mjs';
import {XDSError} from './error.mjs';
import {loadConfig} from '../lib/config.mjs';

const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES_DIR, 'blocks');
/**
 * Add template dependencies to the user's package.json. Only writes packages
 * that aren't already declared in `dependencies` or `devDependencies`. Returns
 * the list of newly added package names (with `latest` as the version range).
 *
 * If no package.json exists in `cwd`, returns the dependency list unchanged
 * so the caller can surface it in install instructions.
 *
 * @param {string[]} deps
 * @param {string} cwd
 * @returns {{added: string[], skipped: string[], packageJsonPath: string|null}}
 */
export function applyTemplateDependencies(deps, cwd) {
  if (!deps || deps.length === 0) {
    return {added: [], skipped: [], packageJsonPath: null};
  }
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return {added: [], skipped: deps, packageJsonPath: null};
  }
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return {added: [], skipped: deps, packageJsonPath: pkgPath};
  }
  const existing = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);
  const added = [];
  const skipped = [];
  pkg.dependencies = pkg.dependencies || {};
  for (const dep of deps) {
    if (existing.has(dep)) {
      skipped.push(dep);
      continue;
    }
    pkg.dependencies[dep] = 'latest';
    added.push(dep);
  }
  if (added.length > 0) {
    // Sort dependencies alphabetically for stable output
    const sorted = {};
    for (const k of Object.keys(pkg.dependencies).sort()) {
      sorted[k] = pkg.dependencies[k];
    }
    pkg.dependencies = sorted;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  return {added, skipped, packageJsonPath: pkgPath};
}

async function loadDocModule(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

/**
 * Auto-detect npm package dependencies from a template's source file by
 * scanning its import statements. Filters out:
 *   - relative imports (./foo)
 *   - @xds/* (provided by the design system itself)
 *   - react / react-dom (assumed present in any React app)
 *
 * Returns the bare-package portion of each import (e.g. `@heroicons/react`,
 * not `@heroicons/react/24/outline`).
 *
 * @param {string} filePath
 * @returns {string[]}
 */
function detectDependenciesFromSource(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const src = fs.readFileSync(filePath, 'utf-8');
  const deps = new Set();
  // Matches both `import X from 'pkg'` and `} from 'pkg'`
  const re = /from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('/')) continue;
    if (spec.startsWith('@xds/')) continue;
    if (spec === 'react' || spec === 'react-dom') continue;
    if (spec.endsWith('.png') || spec.endsWith('.jpg') || spec.endsWith('.svg')) continue;
    // Bare-package portion: '@scope/name' or 'name'
    const parts = spec.split('/');
    const bare = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    deps.add(bare);
  }
  return [...deps].sort();
}

/**
 * Resolve the full dependency list for a template. Combines explicit
 * `dependencies` from the doc manifest (if present) with auto-detected
 * imports from the source file. Manifest entries win on duplicates.
 *
 * @param {{filePath: string, dependencies?: string[]}} template
 * @returns {string[]}
 */
export function resolveTemplateDependencies(template) {
  const detected = detectDependenciesFromSource(template.filePath);
  const declared = Array.isArray(template.dependencies) ? template.dependencies : [];
  return [...new Set([...declared, ...detected])].sort();
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
      dependencies: doc?.dependencies,
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
      dependencies: doc?.dependencies,
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
      const PROP_NAMES = ['padding', 'contentPadding', 'gap', 'rowGap', 'columnGap', 'columns', 'minChildWidth', 'hasDivider', 'defaultHasDividers', 'variant', 'density', 'role', 'height', 'width', 'maxWidth'];
      const propNamePattern = `\\b(${PROP_NAMES.join('|')})\\s*=`;
      const propNameRe = new RegExp(propNamePattern, 'g');
      let nameMatch;
      while ((nameMatch = propNameRe.exec(tagText)) !== null) {
        const propName = nameMatch[1];
        let i = nameMatch.index + nameMatch[0].length;
        // Skip whitespace
        while (i < tagText.length && /\s/.test(tagText[i])) i++;
        if (i >= tagText.length) continue;

        const ch = tagText[i];
        let val;
        if (ch === '"' || ch === "'") {
          // Quoted string: foo="bar"
          const close = tagText.indexOf(ch, i + 1);
          if (close === -1) continue;
          val = tagText.slice(i + 1, close);
          if (val === 'true') props.push(propName);
          else if (/^\d+$/.test(val)) props.push(`${propName}={${val}}`);
          else props.push(`${propName}="${val}"`);
        } else if (ch === '{') {
          // Brace expression: foo={...} — match balanced braces
          let depth = 0;
          let end = i;
          for (; end < tagText.length; end++) {
            if (tagText[end] === '{') depth++;
            else if (tagText[end] === '}') {
              depth--;
              if (depth === 0) { end++; break; }
            }
          }
          const inner = tagText.slice(i + 1, end - 1).trim();
          // Simple values: foo={42}, foo={true}, foo={'bar'}
          if (/^\d+$/.test(inner)) {
            props.push(`${propName}={${inner}}`);
          } else if (inner === 'true') {
            props.push(propName);
          } else if (inner === 'false') {
            // Skip false-valued boolean props in skeleton
          } else if (/^['"][^'"]*['"]$/.test(inner)) {
            props.push(`${propName}=${inner.replace(/^['"]|['"]$/g, '"')}`);
          } else if (inner.startsWith('{') && inner.endsWith('}')) {
            // Object literal — try to extract a useful summary key
            const minWidthMatch = inner.match(/minWidth\s*:\s*(\d+)/);
            if (minWidthMatch) {
              props.push(`${propName}={{minWidth: ${minWidthMatch[1]}}}`);
            } else {
              props.push(`${propName}={{...}}`);
            }
          } else {
            // Variable reference or expression — show as expression
            // Truncate long expressions
            const summary = inner.length > 24 ? inner.slice(0, 21) + '...' : inner;
            props.push(`${propName}={${summary}}`);
          }
        } else {
          // No quotes/braces — bare token (rare in JSX)
          const tokenMatch = tagText.slice(i).match(/^([^\s,/>]+)/);
          if (tokenMatch) {
            const val2 = tokenMatch[1];
            if (val2 === 'true') props.push(propName);
            else if (/^\d+$/.test(val2)) props.push(`${propName}={${val2}}`);
            else props.push(`${propName}="${val2}"`);
          }
        }
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

  // If the target path looks like a file (has a .tsx/.jsx/.ts/.js extension),
  // and isn't an existing directory, write the template directly to that path
  // instead of treating it as a directory and creating <path>/page.tsx.
  const resolved = path.resolve(cwd, targetPath);
  const looksLikeFile = /\.(tsx|jsx|ts|js)$/.test(targetPath);
  const existsAsDir = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();

  const dependencies = resolveTemplateDependencies(match);
  const depsResult = applyTemplateDependencies(dependencies, cwd);

  if (looksLikeFile && !existsAsDir) {
    const outFilePath = resolved;
    fs.mkdirSync(path.dirname(outFilePath), {recursive: true});
    fs.copyFileSync(match.filePath, outFilePath);
    const relOutput = path.relative(cwd, outFilePath);
    return {
      type: 'template.copy',
      data: {
        template: name,
        outputDir: path.relative(cwd, path.dirname(outFilePath)) || '.',
        fileName: path.basename(outFilePath),
        outputPath: relOutput,
        filesCopied: 1,
        dependencies,
        dependenciesAdded: depsResult.added,
        dependenciesSkipped: depsResult.skipped,
        packageJsonPath: depsResult.packageJsonPath
          ? path.relative(cwd, depsResult.packageJsonPath)
          : null,
      },
    };
  }

  const outputDir = resolved;
  const outputFileName = match.type === 'block'
    ? path.basename(match.filePath)
    : 'page.tsx';
  fs.mkdirSync(outputDir, {recursive: true});
  fs.copyFileSync(match.filePath, path.join(outputDir, outputFileName));

  const relOutput = path.relative(cwd, outputDir);
  return {
    type: 'template.copy',
    data: {
      template: name,
      outputDir: relOutput,
      fileName: outputFileName,
      filesCopied: 1,
      dependencies,
      dependenciesAdded: depsResult.added,
      dependenciesSkipped: depsResult.skipped,
      packageJsonPath: depsResult.packageJsonPath
        ? path.relative(cwd, depsResult.packageJsonPath)
        : null,
    },
  };
}
