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
import {fileURLToPath} from 'node:url';

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
      return {
        name: raw.name,
        displayName: raw.displayName || raw.name.replace('@xds/', '').replace('theme-', 'Theme: ').replace(/^\w/, c => c.toUpperCase()),
        version: raw.version,
        description: raw.description || '',
        packagePath: dir,
        hasReadme,
        hasChangelog,
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
}

export const packages: PackageMeta[] = ${JSON.stringify(packages, null, 2)};
`;
  writeRegistry('packageRegistry.ts', content);
  return packages;
}

// ── 2. Component Registry ──────────────────────────────────────────────

function generateComponentRegistry() {
  console.log('Generating component registry...');

  // Auto-discover component packages: any package with a src/ dir containing
  // subdirectories that have .doc.mjs files.
  const packageDirs = discoverPackageDirs();
  const componentPackages = [];

  for (const dir of packageDirs) {
    const srcDir = path.join(REPO_ROOT, dir, 'src');
    if (!fs.existsSync(srcDir)) continue;
    const pkgJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, dir, 'package.json'), 'utf-8'));
    // Check if any file anywhere under src/ is a .doc.mjs
    const allDocFiles = findDocFilesRecursive(srcDir);
    if (allDocFiles.length > 0) {
      componentPackages.push({name: pkgJson.name, srcDir});
    }
  }

  // Only skip dirs that never contain doc files
  const SKIP_DIRS = new Set(['utils', '__tests__', 'node_modules']);
  const allComponents = {};
  let totalCount = 0;

  for (const pkg of componentPackages) {
    if (!fs.existsSync(pkg.srcDir)) continue;
    const components = [];

    for (const entry of fs.readdirSync(pkg.srcDir, {withFileTypes: true})) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

      const dirPath = path.join(pkg.srcDir, entry.name);

      // Collect ALL .doc.mjs files in this directory (not just the first)
      const docFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.doc.mjs'));
      if (docFiles.length === 0) continue;

      for (const docFileName of docFiles) {
        const docFile = path.join(dirPath, docFileName);
        const meta = readDocMeta(docFile);

        // Use docs.name as the canonical name, fall back to filename stem
        const fileNameStem = docFileName.replace('.doc.mjs', '').replace(/^XDS/, '');
        const name = meta.name || fileNameStem;

        components.push({
          name,
          directory: entry.name,
          group: meta.group,
          description: meta.description,
          keywords: meta.keywords,
          hidden: meta.hidden,
        });
      }
    }

    components.sort((a, b) => a.name.localeCompare(b.name));
    if (components.length > 0) {
      allComponents[pkg.name] = components;
      totalCount += components.length;
    }
  }

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface ComponentEntry {
  /** Canonical name from docs.name (e.g. 'Button', 'useClickableContainer') */
  name: string;
  /** Source directory containing this component (e.g. 'Button', 'hooks') */
  directory: string;
  /** Sidebar group from docs.group (e.g. 'Actions', 'Chat') */
  group: string | null;
  /** Short description (first ~200 chars of docs.usage.description) */
  description: string;
  /** Search keywords from docs.keywords */
  keywords: string[];
  /** Whether this component is marked hidden in its doc */
  hidden: boolean;
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

    // Read isShowcase, aspectRatio, componentsUsed from the doc file
    let isShowcase = false;
    let aspectRatio = 1;
    let componentsUsed = [];
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
    } catch { /* ignore */ }

    blocks.push({
      dirName: basename,
      name: meta.name || basename,
      description: meta.description,
      isShowcase,
      aspectRatio,
      componentsUsed,
      category: relCategory,
    });
  }

  blocks.sort((a, b) => a.name.localeCompare(b.name));

  const showcaseCount = blocks.filter(b => b.isShowcase).length;

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface BlockEntry {
  dirName: string;
  name: string;
  description: string;
  isShowcase: boolean;
  aspectRatio: number;
  componentsUsed: string[];
  /** Category path, e.g. 'components/Button' */
  category: string;
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
    try {
      const mod = await import(`file://${docPath}`);
      title = mod.docs?.title || '';
      description = mod.docs?.description || '';
    } catch {
      const meta = readDocMeta(docPath);
      description = meta.description;
    }

    docTopics.push({topic, title: title || topic, description});
  }

  docTopics.sort((a, b) => a.topic.localeCompare(b.topic));

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface DocTopic {
  /** URL-friendly slug derived from filename (e.g. 'getting-started') */
  topic: string;
  /** Display title from docs.title (e.g. 'Getting Started') */
  title: string;
  /** Short description */
  description: string;
}

export const docTopics: DocTopic[] = ${JSON.stringify(docTopics, null, 2)};

export const docsCount = ${docTopics.length};
`;
  writeRegistry('docsRegistry.ts', content);
  return {docTopics, docsCount: docTopics.length};
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating docsite data...\n');

  const packages = generatePackageRegistry();
  const {totalCount: componentCount} = generateComponentRegistry();
  const {blockCount, showcaseCount} = await generateBlockRegistry();
  const {templateCount} = await generateTemplateRegistry();
  const {docsCount} = await generateDocsRegistry();

  console.log(`\nSummary:`);
  console.log(`  ${packages.length} packages`);
  console.log(`  ${componentCount} components`);
  console.log(`  ${blockCount} blocks (${showcaseCount} showcases)`);
  console.log(`  ${templateCount} templates`);
  console.log(`  ${docsCount} doc topics`);
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
