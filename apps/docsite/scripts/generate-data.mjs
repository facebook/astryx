#!/usr/bin/env node

/**
 * @file generate-data.mjs
 *
 * Build-time data extraction for the XDS docsite.
 * Reads package.json, .doc.mjs, templates, and markdown files across the
 * monorepo and generates typed TypeScript registries in src/generated/.
 *
 * Run: node scripts/generate-data.mjs
 *
 * Generates:
 *   - packageRegistry.ts   — metadata for every distributable package
 *   - componentRegistry.ts — component listings per package (from .doc.mjs)
 *   - blockRegistry.ts     — showcases + example blocks from CLI templates
 *   - templateRegistry.ts  — page-level templates from CLI templates
 *   - docsRegistry.ts      — long-form documentation topics from CLI docs/
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCSITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DOCSITE_ROOT, '..', '..');
const OUT_DIR = path.join(DOCSITE_ROOT, 'src', 'generated');
const CLI_ROOT = path.join(REPO_ROOT, 'packages', 'cli');

fs.mkdirSync(OUT_DIR, {recursive: true});

// ── Helpers ────────────────────────────────────────────────────────────

function writeRegistry(filename, content) {
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`  wrote ${path.relative(REPO_ROOT, outPath)}`);
}

/** Extract group/description/hidden from .doc.mjs via regex (no dynamic import) */
const GROUP_RE = /(?:^|\n) {0,4}group:\s*['"]([^'"]+)['"]/;
const DESC_RE = /description:\s*\n?\s*['"`]([^'"`]{0,200})['"`]/;
const HIDDEN_RE = /(?:^|\n) {0,4}hidden:\s*true/;
const NAME_RE = /(?:^|\n) {0,4}name:\s*['"]([^'"]+)['"]/;
const KEYWORDS_RE = /keywords:\s*\[([^\]]*)\]/;

function readDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = GROUP_RE.exec(content);
    const descMatch = DESC_RE.exec(content);
    const nameMatch = NAME_RE.exec(content);
    const hidden = HIDDEN_RE.test(content);
    const kwMatch = KEYWORDS_RE.exec(content);
    const keywords = kwMatch
      ? [...kwMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1])
      : [];
    return {
      group: groupMatch?.[1] ?? null,
      description: descMatch?.[1] ?? '',
      name: nameMatch?.[1] ?? null,
      hidden,
      keywords,
    };
  } catch {
    return {group: null, description: '', name: null, hidden: false, keywords: []};
  }
}

function findDocFilesRecursive(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findDocFilesRecursive(full));
    } else if (entry.name.endsWith('.doc.mjs')) {
      results.push(full);
    }
  }
  return results;
}

// ── Package discovery ──────────────────────────────────────────────────

/**
 * Auto-discover packages from the monorepo workspace globs.
 * Reads the root package.json "workspaces" field and expands globs.
 * Skips apps/* and internal/* — only surfaces packages/*.
 */
function discoverPackageDirs() {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf-8'));
  const workspaces = rootPkg.workspaces || [];
  const dirs = [];

  for (const pattern of workspaces) {
    // Only include packages/*, not apps/* or internal/*
    if (!pattern.startsWith('packages')) continue;

    // Expand glob: packages/* or packages/themes/*
    const base = pattern.replace('/*', '');
    const baseDir = path.join(REPO_ROOT, base);
    if (!fs.existsSync(baseDir)) continue;

    for (const entry of fs.readdirSync(baseDir, {withFileTypes: true})) {
      if (!entry.isDirectory()) continue;
      const pkgJsonPath = path.join(baseDir, entry.name, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        dirs.push(path.join(base, entry.name));
      }
    }
  }

  return dirs.sort();
}

// ── 1. Package Registry ────────────────────────────────────────────────

function generatePackageRegistry() {
  console.log('Generating package registry...');

  const packageDirs = discoverPackageDirs();

  const packages = packageDirs
    .map(dir => {
      const pkgPath = path.join(REPO_ROOT, dir, 'package.json');
      const raw = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

      // Skip private packages
      if (raw.private === true) return null;

      const hasReadme = fs.existsSync(path.join(REPO_ROOT, dir, 'README.md'));
      const hasChangelog = fs.existsSync(path.join(REPO_ROOT, dir, 'CHANGELOG.md'));
      const readme = hasReadme
        ? fs.readFileSync(path.join(REPO_ROOT, dir, 'README.md'), 'utf-8')
        : null;
      return {
        name: raw.name,
        displayName: raw.displayName || raw.name.replace('@xds/', '').replace('theme-', 'Theme: ').replace(/^\w/, c => c.toUpperCase()),
        version: raw.version,
        description: raw.description || '',
        packagePath: dir,
        hasReadme,
        hasChangelog,
        readme,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface PackageMeta {
  name: string;
  displayName: string;
  version: string;
  description: string;
  packagePath: string;
  hasReadme: boolean;
  hasChangelog: boolean;
  readme: string | null;
}

export const packages: PackageMeta[] = ${JSON.stringify(packages, null, 2)};
`;
  writeRegistry('packageRegistry.ts', content);
  return packages;
}

// ── 2. Component Registry ──────────────────────────────────────────────

/** Sanitize a doc object for JSON serialization (strip functions, symbols, etc.) */
function sanitizeForJson(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function' || typeof value === 'symbol') return undefined;
    return value;
  }));
}

async function generateComponentRegistry() {
  console.log('Generating component registry...');

  const packageDirs = discoverPackageDirs();
  const componentPackages = [];

  for (const dir of packageDirs) {
    const srcDir = path.join(REPO_ROOT, dir, 'src');
    if (!fs.existsSync(srcDir)) continue;
    const pkgJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, dir, 'package.json'), 'utf-8'));
    const allDocFiles = findDocFilesRecursive(srcDir);
    if (allDocFiles.length > 0) {
      componentPackages.push({name: pkgJson.name, srcDir});
    }
  }

  const SKIP_DIRS = new Set(['utils', '__tests__', 'node_modules']);
  const allComponents = {};
  let totalCount = 0;

  for (const pkg of componentPackages) {
    if (!fs.existsSync(pkg.srcDir)) continue;
    const components = [];

    const standaloneNames = new Set();
    const pendingSubComponents = [];

    for (const entry of fs.readdirSync(pkg.srcDir, {withFileTypes: true})) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

      const dirPath = path.join(pkg.srcDir, entry.name);
      const docFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.doc.mjs'));
      if (docFiles.length === 0) continue;

      for (const docFileName of docFiles) {
        const docFile = path.join(dirPath, docFileName);

        let doc;
        try {
          const mod = await import(pathToFileURL(docFile).href);
          doc = mod.docs;
          if (!doc) continue;
        } catch (err) {
          console.warn(`  warn: failed to import ${docFileName}: ${err.message}`);
          continue;
        }

        const group = doc.group || null;
        const keywords = doc.keywords || [];
        const hidden = doc.hidden ?? false;
        const topDescription = doc.usage?.description || doc.description || '';
        const usage = doc.usage ? sanitizeForJson(doc.usage) : null;
        const theming = doc.theming ? sanitizeForJson(doc.theming) : null;
        const playground = doc.playground ? sanitizeForJson(doc.playground) : null;

        if (doc.components && doc.components.length > 0) {
          for (const sub of doc.components) {
            const subName = (sub.name || '').replace(/^XDS/, '');
            if (!subName) continue;
            pendingSubComponents.push({
              name: subName,
              moduleName: sub.name || subName,
              directory: entry.name,
              group,
              description: sub.description || topDescription,
              keywords,
              hidden,
              parentDoc: doc.name,
              props: Array.isArray(sub.props) ? sanitizeForJson(sub.props) : [],
              usage,
              theming,
              params: null,
              returns: null,
              relatedComponents: null,
              relatedHooks: null,
              playground,
            });
          }
        } else if (doc.params) {
          // HookDoc — standalone hook
          const name = doc.name || docFileName.replace('.doc.mjs', '');
          standaloneNames.add(name);
          components.push({
            name,
            moduleName: name,
            directory: entry.name,
            group,
            description: topDescription,
            keywords,
            hidden,
            parentDoc: null,
            props: [],
            usage,
            theming: null,
            params: Array.isArray(doc.params) ? sanitizeForJson(doc.params) : [],
            returns: Array.isArray(doc.returns) ? sanitizeForJson(doc.returns) : [],
            relatedComponents: doc.relatedComponents || null,
            relatedHooks: doc.relatedHooks || null,
            playground: null,
          });
        } else {
          // Simple/standalone component
          const name = doc.name || docFileName.replace('.doc.mjs', '').replace(/^XDS/, '');
          standaloneNames.add(name);
          components.push({
            name,
            moduleName: name.startsWith('use') ? name : `XDS${name}`,
            directory: entry.name,
            group,
            description: topDescription,
            keywords,
            hidden,
            parentDoc: null,
            props: Array.isArray(doc.props) ? sanitizeForJson(doc.props) : [],
            usage,
            theming,
            params: null,
            returns: null,
            relatedComponents: null,
            relatedHooks: null,
            playground,
          });
        }
      }
    }

    for (const sub of pendingSubComponents) {
      if (!standaloneNames.has(sub.name)) {
        standaloneNames.add(sub.name);
        components.push(sub);
      }
    }

    components.sort((a, b) => a.name.localeCompare(b.name));
    if (components.length > 0) {
      allComponents[pkg.name] = components;
      totalCount += components.length;
    }
  }

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface PropDoc {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
  slotElements?: ElementDescriptor[];
}
export interface BestPractice {
  guidance: boolean;
  description: string;
}

export interface AnatomyElement {
  name: string;
  required: boolean;
  description: string;
}

export interface UsageDoc {
  description: string;
  bestPractices?: BestPractice[];
  anatomy?: AnatomyElement[];
  features?: string[];
  accessibility?: string[];
  keyboard?: string;
  notes?: string[];
}

export interface ThemingTarget {
  className: string;
  visualProps?: string[];
  states?: string[];
}

export interface ComponentVar {
  name: string;
  description: string;
  default: string;
  derived?: boolean;
  formula?: string;
  private?: boolean;
}

export interface DerivedVar {
  property: string;
  vars?: string[];
  expand?: 'container';
}

export interface ThemingDoc {
  container?: boolean;
  targets: ThemingTarget[];
  vars?: ComponentVar[];
  derived?: DerivedVar[];
}

export interface HookParamDoc {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
}

export interface HookReturnDoc {
  name: string;
  type: string;
  description: string;
}

export interface ComponentEntry {
  name: string;
  moduleName: string;
  directory: string;
  group: string | null;
  description: string;
  keywords: string[];
  hidden: boolean;
  parentDoc: string | null;
  props: PropDoc[];
  usage: UsageDoc | null;
  theming: ThemingDoc | null;
  params: HookParamDoc[] | null;
  returns: HookReturnDoc[] | null;
  relatedComponents: string[] | null;
  relatedHooks: string[] | null;
  playground: PlaygroundConfig | null;
}

export interface ElementDescriptor {
  __element: string;
  props?: Record<string, unknown>;
  children?: string | ElementDescriptor | (string | ElementDescriptor)[];
}

export interface PlaygroundConfig {
  defaults: Record<string, unknown>;
}

export const components: Record<string, ComponentEntry[]> = ${JSON.stringify(allComponents, null, 2)};

export const componentCount = ${totalCount};
`;
  writeRegistry('componentRegistry.ts', content);
  return {allComponents, totalCount};
}

// ── 3. Block Registry ──────────────────────────────────────────────────

async function generateBlockRegistry() {
  console.log('Generating block registry...');

  const BLOCKS_DIR = path.join(CLI_ROOT, 'templates', 'blocks');
  const docFiles = findDocFilesRecursive(BLOCKS_DIR);
  const blocks = [];

  for (const docPath of docFiles) {
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxPath = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxPath)) continue;

    const meta = readDocMeta(docPath);
    const relCategory = path.relative(BLOCKS_DIR, path.dirname(docPath));

    // Read isShowcase, aspectRatio, componentsUsed, exampleFor from the doc file
    let isShowcase = false;
    let aspectRatio = 1;
    let componentsUsed = [];
    let exampleFor = '';
    try {
      const content = fs.readFileSync(docPath, 'utf-8');
      isShowcase = /isShowcase:\s*true/.test(content);
      const arMatch = content.match(/aspectRatio:\s*([\d.]+)\s*\/\s*([\d.]+)/);
      const arSingle = content.match(/aspectRatio:\s*([\d.]+)(?!\s*\/)/);
      if (arMatch) {
        aspectRatio = parseFloat(arMatch[1]) / parseFloat(arMatch[2]);
      } else if (arSingle) {
        aspectRatio = parseFloat(arSingle[1]);
      }
      const cuMatch = content.match(/componentsUsed:\s*\[([^\]]*)\]/);
      if (cuMatch) {
        componentsUsed = [...cuMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
      }
      const efMatch = content.match(/exampleFor:\s*['"]([^'"]+)['"]/);
      if (efMatch) {
        exampleFor = efMatch[1];
      }
    } catch { /* ignore */ }

    let source = '';
    try {
      source = fs.readFileSync(tsxPath, 'utf-8');
    } catch { /* ignore */ }

    blocks.push({
      dirName: basename,
      name: meta.name || basename,
      description: meta.description,
      exampleFor,
      isShowcase,
      aspectRatio,
      componentsUsed,
      category: relCategory,
      source,
    });
  }

  blocks.sort((a, b) => a.name.localeCompare(b.name));

  const showcaseCount = blocks.filter(b => b.isShowcase).length;

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface BlockEntry {
  dirName: string;
  name: string;
  description: string;
  /** The component this block is an example of (e.g. 'Button', 'Dialog') */
  exampleFor: string;
  isShowcase: boolean;
  aspectRatio: number;
  componentsUsed: string[];
  /** Category path, e.g. 'components/Button' */
  category: string;
  /** Raw TSX source code for live rendering */
  source: string;
}

export const blocks: BlockEntry[] = ${JSON.stringify(blocks, null, 2)};

export const blockCount = ${blocks.length};
export const showcaseCount = ${showcaseCount};
`;
  writeRegistry('blockRegistry.ts', content);
  return {blocks, blockCount: blocks.length, showcaseCount};
}

// ── 4. Template Registry ───────────────────────────────────────────────

async function generateTemplateRegistry() {
  console.log('Generating template registry...');

  const PAGES_DIR = path.join(CLI_ROOT, 'templates', 'pages');
  if (!fs.existsSync(PAGES_DIR)) {
    writeRegistry('templateRegistry.ts', `// Auto-generated — no templates found\nexport const templates = [];\nexport const templateCount = 0;\n`);
    return {templates: [], templateCount: 0};
  }

  const templates = [];
  const dirs = fs.readdirSync(PAGES_DIR, {withFileTypes: true}).filter(e => e.isDirectory());

  for (const dir of dirs) {
    const docPath = path.join(PAGES_DIR, dir.name, 'template.doc.mjs');
    if (!fs.existsSync(docPath)) continue;
    const pagePath = path.join(PAGES_DIR, dir.name, 'page.tsx');
    if (!fs.existsSync(pagePath)) continue;

    let doc;
    try {
      const mod = await import(fileURLToPath(new URL(`file://${docPath}`)).replace(/\\/g, '/'));
      doc = mod.doc;
    } catch {
      const meta = readDocMeta(docPath);
      doc = {name: meta.name || dir.name, description: meta.description, isReady: true};
    }

    templates.push({
      slug: dir.name,
      name: doc.name || dir.name,
      description: doc.description || '',
      isReady: doc.isReady ?? true,
    });
  }

  templates.sort((a, b) => a.name.localeCompare(b.name));

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface TemplateEntry {
  slug: string;
  name: string;
  description: string;
  isReady: boolean;
}

export const templates: TemplateEntry[] = ${JSON.stringify(templates, null, 2)};

export const templateCount = ${templates.length};
`;
  writeRegistry('templateRegistry.ts', content);
  return {templates, templateCount: templates.length};
}

// ── 5. Docs Registry ──────────────────────────────────────────────────

async function generateDocsRegistry() {
  console.log('Generating docs registry...');

  const DOCS_DIR = path.join(CLI_ROOT, 'docs');
  if (!fs.existsSync(DOCS_DIR)) {
    writeRegistry('docsRegistry.ts', `// Auto-generated — no docs found\nexport const docTopics = [];\nexport const docsCount = 0;\n`);
    return {docTopics: [], docsCount: 0};
  }

  const docTopics = [];

  for (const file of fs.readdirSync(DOCS_DIR)) {
    const match = file.match(/^([\w-]+)\.doc\.mjs$/);
    if (!match) continue;
    // Skip translations
    if (file.includes('.doc.zh.') || file.includes('.doc.dense.')) continue;

    const topic = match[1];
    const docPath = path.join(DOCS_DIR, file);

    let title = '';
    let description = '';
    let category = '';
    let sections = [];
    try {
      const mod = await import(`file://${docPath}`);
      title = mod.docs?.title || '';
      description = mod.docs?.description || '';
      category = mod.docs?.category || '';
      sections = mod.docs?.sections || [];
    } catch {
      const meta = readDocMeta(docPath);
      description = meta.description;
    }

    docTopics.push({topic, title: title || topic, description, category: category || null, sections});
  }

  docTopics.sort((a, b) => a.topic.localeCompare(b.topic));

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface ContentBlock {
  type: string;
  text?: string;
  code?: string;
  lang?: string;
  label?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
  style?: string;
  topic?: string;
  section?: string;
}

export interface DocSection {
  title: string;
  content: ContentBlock[];
  previewType?: string;
  category?: string;
}

export interface DocTopic {
  /** URL-friendly slug derived from filename (e.g. 'getting-started') */
  topic: string;
  /** Display title from docs.title (e.g. 'Getting Started') */
  title: string;
  /** Short description */
  description: string;
  /** Navigation category: 'guide' | 'foundations' | null */
  category: string | null;
  /** Full doc sections with content blocks */
  sections: DocSection[];
}

export const docTopics: DocTopic[] = ${JSON.stringify(docTopics, null, 2)};

export const docsCount = ${docTopics.length};
`;
  writeRegistry('docsRegistry.ts', content);
  return {docTopics, docsCount: docTopics.length};
}


function generateThemeRegistry(packages) {
  console.log('Generating theme registry...');
  const themePackages = packages.filter(p => p.name.startsWith('@xds/theme-'));
  if (!themePackages.length) {
    writeRegistry('themeRegistry.ts', `// Auto-generated — no theme packages found
import type {XDSDefinedTheme} from '@xds/core/theme';
export const themeObjects: Record<string, XDSDefinedTheme> = {};
`);
    return 0;
  }

  const imports = themePackages.map(p => {
    const slug = p.name.replace('@xds/theme-', '');
    const exportName = `${slug}Theme`;
    return `import {${exportName}} from '${p.name}/built';`;
  }).join('\n');

  const entries = themePackages.map(p => {
    const slug = p.name.replace('@xds/theme-', '');
    return `  '${p.name}': ${slug}Theme,`;
  }).join('\n');

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

import type {XDSDefinedTheme} from '@xds/core/theme';
${imports}

export const themeObjects: Record<string, XDSDefinedTheme> = {
${entries}
};
`;
  writeRegistry('themeRegistry.ts', content);
  return themePackages.length;
}

// ── 7. Showcase Registry ───────────────────────────────────────────────

function generateShowcaseRegistry() {
  console.log('Generating showcase registry...');

  const BLOCKS_DIR = path.join(CLI_ROOT, 'templates', 'blocks');
  const SHOWCASE_OUT = path.join(OUT_DIR, 'showcases');

  // Clean and recreate
  if (fs.existsSync(SHOWCASE_OUT)) {
    fs.rmSync(SHOWCASE_OUT, {recursive: true});
  }
  fs.mkdirSync(SHOWCASE_OUT, {recursive: true});

  const docFiles = findDocFilesRecursive(BLOCKS_DIR);
  const entries = [];

  for (const docPath of docFiles) {
    const content = fs.readFileSync(docPath, 'utf-8');
    if (!/isShowcase:\s*true/.test(content)) continue;

    const efMatch = content.match(/exampleFor:\s*['"]([^'"]+)['"]/);
    if (!efMatch) continue;

    const exampleFor = efMatch[1];
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxSrc = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxSrc)) continue;

    // Copy the TSX file into generated/showcases/
    const destFile = `${basename}.tsx`;
    fs.copyFileSync(tsxSrc, path.join(SHOWCASE_OUT, destFile));

    entries.push({exampleFor, basename, destFile});
  }

  // Deduplicate: one showcase per component (first wins)
  const seen = new Set();
  const uniqueEntries = entries.filter(e => {
    if (seen.has(e.exampleFor)) return false;
    seen.add(e.exampleFor);
    return true;
  });

  // Generate the registry with dynamic imports
  const importLines = uniqueEntries.map(
    e => `  '${e.exampleFor}': () => import('./showcases/${e.basename}'),`
  ).join('\n');

  const registryContent = `// Auto-generated by scripts/generate-data.mjs — do not edit
import type {ComponentType} from 'react';

type ShowcaseLoader = () => Promise<{default: ComponentType}>;

export const showcaseRegistry: Record<string, ShowcaseLoader> = {
${importLines}
};
`;

  writeRegistry('showcaseRegistry.ts', registryContent);
  console.log(`  copied ${entries.length} showcase files (${uniqueEntries.length} unique components)`);
  return uniqueEntries.length;
}

// ── Main

function generateExampleRegistry() {
  console.log('Generating example registry...');

  const BLOCKS_DIR = path.join(CLI_ROOT, 'templates', 'blocks');
  const EXAMPLES_OUT = path.join(OUT_DIR, 'examples');

  if (fs.existsSync(EXAMPLES_OUT)) {
    fs.rmSync(EXAMPLES_OUT, {recursive: true});
  }
  fs.mkdirSync(EXAMPLES_OUT, {recursive: true});

  const docFiles = findDocFilesRecursive(BLOCKS_DIR);
  const entries = [];

  for (const docPath of docFiles) {
    const content = fs.readFileSync(docPath, 'utf-8');
    // Skip showcases — they have their own registry
    if (/isShowcase:\s*true/.test(content)) continue;

    const efMatch = content.match(/exampleFor:\s*['"]([^'"]+)['"]/);
    if (!efMatch) continue;

    const exampleFor = efMatch[1];
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxSrc = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxSrc)) continue;

    // Read name and description from doc meta
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
    const descMatch = content.match(/description:\s*\n?\s*['"`]([^'"`]{0,200})['"`]/);

    fs.copyFileSync(tsxSrc, path.join(EXAMPLES_OUT, `${basename}.tsx`));

    let source = '';
    try { source = fs.readFileSync(tsxSrc, 'utf-8'); } catch { /* ignore */ }

    entries.push({
      exampleFor,
      basename,
      name: nameMatch?.[1] || basename,
      description: descMatch?.[1] || '',
      source,
    });
  }

  // Group by component
  const grouped = {};
  for (const e of entries) {
    if (!grouped[e.exampleFor]) grouped[e.exampleFor] = [];
    grouped[e.exampleFor].push(e);
  }

  // Generate registry: component name → array of example metadata + loaders
  const componentLines = Object.entries(grouped).map(([comp, examples]) => {
    const exampleLines = examples.map(
      e => `    {name: ${JSON.stringify(e.name)}, description: ${JSON.stringify(e.description)}, source: ${JSON.stringify(e.source)}, load: () => import('./examples/${e.basename}')},`
    ).join('\n');
    return `  '${comp}': [\n${exampleLines}\n  ],`;
  }).join('\n');

  const registryContent = `// Auto-generated by scripts/generate-data.mjs — do not edit
import type {ComponentType} from 'react';

export interface ExampleEntry {
  name: string;
  description: string;
  source: string;
  load: () => Promise<{default: ComponentType}>;
}

export const exampleRegistry: Record<string, ExampleEntry[]> = {
${componentLines}
};
`;

  writeRegistry('exampleRegistry.ts', registryContent);
  console.log(`  copied ${entries.length} example blocks for ${Object.keys(grouped).length} components`);
  return entries.length;
}

async function main() {
  console.log('Generating docsite data...\n');

  const packages = generatePackageRegistry();
  const themeCount = generateThemeRegistry(packages);
  const {totalCount: componentCount} = await generateComponentRegistry();
  const {blockCount, showcaseCount} = await generateBlockRegistry();
  const {templateCount} = await generateTemplateRegistry();
  const {docsCount} = await generateDocsRegistry();
  const showcaseCopied = generateShowcaseRegistry();
  const examplesCopied = generateExampleRegistry();

  console.log(`\nSummary:`);
  console.log(`  ${packages.length} packages`);
  console.log(`  ${componentCount} components`);
  console.log(`  ${blockCount} blocks (${showcaseCopied} showcases, ${examplesCopied} examples)`);
  console.log(`  ${templateCount} templates`);
  console.log(`  ${docsCount} doc topics`);
  console.log(`  ${themeCount} themes`);
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
