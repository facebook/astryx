#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


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

const COPYRIGHT_HEADER =
  '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n';

function writeRegistry(filename, content) {
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, COPYRIGHT_HEADER + content, 'utf-8');
  console.log(`  wrote ${path.relative(REPO_ROOT, outPath)}`);
}

/**
 * Validates that a doc file declared an explicit `displayName`. Display
 * names are authored by hand rather than derived at build time so
 * authors stay in control of how each component reads in the gallery
 * and sidebar UI (see PR #2376 review thread). Use the
 * apps/docsite/scripts/backfill-display-name.mjs codemod to backfill
 * the field on any doc file that's missing it.
 */
function requireDisplayName(displayName, where) {
  if (!displayName) {
    throw new Error(
      `Missing \`displayName\` on doc entry: ${where}\n` +
        'Every .doc.mjs file must declare an explicit `displayName` field.\n' +
        'Run `node apps/docsite/scripts/backfill-display-name.mjs` to backfill it.',
    );
  }
  return displayName;
}

/**
 * Parses a single/double/backtick-quoted JS string literal starting at
 * `openIdx` (the index of the opening quote) and returns the decoded
 * string value plus the index just past the closing quote.
 *
 * Unlike a naive `[^'"`]` character class, this correctly handles:
 *   - interior quotes of a different type (e.g. `'Swap the default "/"'`)
 *   - escaped quotes of the same type (e.g. `'won\'t close it'`)
 *   - standard escape sequences (\n, \t, \uXXXX, \xXX, line continuations)
 * and has no length cap, so long descriptions survive intact.
 */
function parseStringLiteral(content, openIdx) {
  const quote = content[openIdx];
  let i = openIdx + 1;
  let out = '';
  while (i < content.length) {
    const ch = content[i];
    if (ch === '\\') {
      const next = content[i + 1];
      switch (next) {
        case 'n': out += '\n'; i += 2; continue;
        case 'r': out += '\r'; i += 2; continue;
        case 't': out += '\t'; i += 2; continue;
        case 'b': out += '\b'; i += 2; continue;
        case 'f': out += '\f'; i += 2; continue;
        case 'v': out += '\v'; i += 2; continue;
        case '0': out += '\0'; i += 2; continue;
        case '\n': i += 2; continue; // line continuation
        case '\r': i += content[i + 2] === '\n' ? 3 : 2; continue;
        case 'u': {
          if (content[i + 2] === '{') {
            const end = content.indexOf('}', i + 3);
            out += String.fromCodePoint(parseInt(content.slice(i + 3, end), 16));
            i = end + 1;
            continue;
          }
          out += String.fromCharCode(parseInt(content.slice(i + 2, i + 6), 16));
          i += 6;
          continue;
        }
        case 'x':
          out += String.fromCharCode(parseInt(content.slice(i + 2, i + 4), 16));
          i += 4;
          continue;
        default:
          out += next; // \', \", \`, \\, and any other escaped char
          i += 2;
          continue;
      }
    }
    if (ch === quote) {
      return {value: out, end: i + 1};
    }
    out += ch;
    i++;
  }
  return {value: out, end: i};
}

/**
 * Extracts a top-level quoted field value (e.g. `description`) from
 * .doc.mjs source, decoding the string literal so interior quotes and
 * escapes survive intact. Returns null when the field is absent.
 */
function extractQuotedField(content, field) {
  const re = new RegExp(`(?:^|\\n) {0,4}${field}:\\s*\\n?\\s*['"\`]`);
  const m = re.exec(content);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1; // index of the opening quote
  return parseStringLiteral(content, openIdx).value;
}

/** Extract doc metadata from .doc.mjs source without dynamic import. */
const GROUP_RE = /(?:^|\n) {0,4}group:\s*['"]([^'"]+)['"]/;
const HIDDEN_RE = /(?:^|\n) {0,4}hidden:\s*true/;
const KEYWORDS_RE = /keywords:\s*\[([^\]]*)\]/;
const CATEGORY_RE = /(?:^|\n) {0,4}category:\s*['"]([^'"]+)['"]/;
const IS_HIDDEN_FROM_OVERVIEW_RE = /(?:^|\n) {0,4}isHiddenFromOverview:\s*true/;

function readDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = GROUP_RE.exec(content);
    const description = extractQuotedField(content, 'description');
    const name = extractQuotedField(content, 'name');
    const displayName = extractQuotedField(content, 'displayName');
    const hidden = HIDDEN_RE.test(content);
    const kwMatch = KEYWORDS_RE.exec(content);
    const keywords = kwMatch
      ? [...kwMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1])
      : [];
    const categoryMatch = CATEGORY_RE.exec(content);
    const isHiddenFromOverview = IS_HIDDEN_FROM_OVERVIEW_RE.test(content);
    return {
      group: groupMatch?.[1] ?? null,
      description: description ?? '',
      name: name ?? null,
      displayName: displayName ?? null,
      hidden,
      keywords,
      category: categoryMatch?.[1] ?? null,
      isHiddenFromOverview,
    };
  } catch {
    return {group: null, description: '', name: null, displayName: null, hidden: false, keywords: [], category: null, isHiddenFromOverview: false};
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

/**
 * Resolve the correct import path for a component given its package directory
 * and the subdirectory it lives in. Checks the package.json "exports" field to
 * find a matching subpath export (e.g. `@xds/core/Chat`).
 *
 * Falls back to the package name when no explicit export is found.
 */
function resolveImportPathForPkg(pkgDir, directory) {
  const pkgJsonPath = path.join(REPO_ROOT, pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  if (pkg.exports && pkg.exports[`./${directory}`]) {
    return `${pkg.name}/${directory}`;
  }
  // No matching export — fall back to package root
  return pkg.name;
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
  const docsitePkg = JSON.parse(fs.readFileSync(path.join(DOCSITE_ROOT, 'package.json'), 'utf-8'));
  const docsiteDeps = {...docsitePkg.dependencies, ...docsitePkg.devDependencies};

  const packages = packageDirs
    .map(dir => {
      const pkgPath = path.join(REPO_ROOT, dir, 'package.json');
      const raw = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

      // Skip private packages
      if (raw.private === true) return null;

      // Skip packages not installed in the docsite
      if (docsiteDeps[raw.name] == null) return null;

      const hasReadme = fs.existsSync(path.join(REPO_ROOT, dir, 'README.md'));
      const hasChangelog = fs.existsSync(path.join(REPO_ROOT, dir, 'CHANGELOG.md'));
      const readme = hasReadme
        ? fs.readFileSync(path.join(REPO_ROOT, dir, 'README.md'), 'utf-8')
        : null;
      const changelog = hasChangelog
        ? fs.readFileSync(path.join(REPO_ROOT, dir, 'CHANGELOG.md'), 'utf-8')
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
        changelog,
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
  changelog: string | null;
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

function extractStringArrayField(content, field) {
  const re = new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`);
  const match = re.exec(content);
  if (!match) return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
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
      componentPackages.push({name: pkgJson.name, srcDir, dir});
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

      // First pass: find the primary component doc for this directory. Used to
      // (a) parent standalone hook docs that share the directory, and
      // (b) let sibling sub-component docs (subComponentOf) inherit family
      //     fields (group, category, keywords, theming, importPath, ...).
      let dirPrimaryDoc = null;
      let dirPrimaryMeta = null;
      for (const df of docFiles) {
        const dfPath = path.join(dirPath, df);
        try {
          const mod = await import(pathToFileURL(dfPath).href);
          const d = mod.docs;
          if (d && (d.components || d.props) && !d.params && !d.subComponentOf) {
            dirPrimaryDoc = d.name || null;
            dirPrimaryMeta = {
              name: d.name || null,
              group: d.group || null,
              category: d.category || null,
              keywords: d.keywords || [],
              hidden: d.hidden ?? false,
              isHiddenFromOverview: d.isHiddenFromOverview ?? false,
              topDescription: d.usage?.description || d.description || '',
              usage: d.usage ? sanitizeForJson(d.usage) : null,
              theming: d.theming ? sanitizeForJson(d.theming) : null,
              playground: d.playground ? sanitizeForJson(d.playground) : null,
            };
            break;
          }
        } catch { /* ignore */ }
      }

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
        const category = doc.category || null;
        const isHiddenFromOverview = doc.isHiddenFromOverview ?? false;
        const keywords = doc.keywords || [];
        const hidden = doc.hidden ?? false;
        const topDescription = doc.usage?.description || doc.description || '';
        const usage = doc.usage ? sanitizeForJson(doc.usage) : null;
        const theming = doc.theming ? sanitizeForJson(doc.theming) : null;
        const playground = doc.playground ? sanitizeForJson(doc.playground) : null;

        if (doc.subComponentOf) {
          // Extracted sub-component: lives in its parent's directory in its own
          // .doc.mjs file. Inherits family fields (group, category, keywords,
          // theming, playground, importPath) from the directory's primary doc
          // unless the sub-component doc overrides them; owns its name,
          // description, props, and usage. Produces a registry
          // entry identical to the legacy inline `components[]` expansion.
          const parentMeta = dirPrimaryMeta || {};
          const subName = (doc.name || '').replace(/^XDS/, '');
          if (subName) {
            const isHookEntry =
              subName.startsWith('use') ||
              Array.isArray(doc.params) ||
              Array.isArray(doc.returns);
            pendingSubComponents.push({
              name: subName,
              displayName: requireDisplayName(
                doc.displayName,
                `${pkg.name}: subcomponent ${subName} (parent ${doc.subComponentOf})`,
              ),
              moduleName: subName.startsWith('use') ? subName : `XDS${subName}`,
              directory: entry.name,
              importPath: resolveImportPathForPkg(pkg.dir, entry.name),
              group: parentMeta.group ?? group,
              category: parentMeta.category ?? category,
              isHiddenFromOverview:
                doc.isHiddenFromOverview ?? parentMeta.isHiddenFromOverview ?? false,
              description: doc.description || parentMeta.topDescription || '',
              keywords: parentMeta.keywords ?? keywords,
              hidden: parentMeta.hidden ?? hidden,
              parentDoc: doc.subComponentOf,
              props: isHookEntry
                ? []
                : Array.isArray(doc.props)
                  ? sanitizeForJson(doc.props)
                  : [],
              usage: doc.usage
                ? sanitizeForJson(doc.usage)
                : isHookEntry && doc.description
                  ? {description: doc.description}
                  : parentMeta.usage ?? null,
              theming: isHookEntry
                ? null
                : doc.theming
                  ? sanitizeForJson(doc.theming)
                  : parentMeta.theming ?? null,
              params: isHookEntry
                ? Array.isArray(doc.params)
                  ? sanitizeForJson(doc.params)
                  : Array.isArray(doc.props)
                    ? sanitizeForJson(doc.props)
                    : []
                : null,
              returns: isHookEntry
                ? Array.isArray(doc.returns)
                  ? sanitizeForJson(doc.returns)
                  : []
                : null,
              relatedComponents: isHookEntry
                ? doc.relatedComponents || [doc.subComponentOf]
                : null,
              relatedHooks: isHookEntry ? doc.relatedHooks || null : null,
              playground: isHookEntry
                ? null
                : doc.playground
                  ? sanitizeForJson(doc.playground)
                  : parentMeta.playground ?? null,
            });
          }
        } else if (doc.components && doc.components.length > 0) {
          // A family parent that also documents its own component surface (it has
          // top-level props) is emitted as its own entry. Abstract families with
          // no top-level props (e.g. Chat) contribute only their sub-components.
          if (Array.isArray(doc.props) && doc.props.length > 0) {
            const name = doc.name || docFileName.replace('.doc.mjs', '').replace(/^XDS/, '');
            standaloneNames.add(name);
            components.push({
              name,
              displayName: requireDisplayName(
                doc.displayName,
                `${pkg.name}: component ${name}`,
              ),
              moduleName: name.startsWith('use') ? name : `XDS${name}`,
              directory: entry.name,
              importPath: resolveImportPathForPkg(pkg.dir, entry.name),
              group,
              category,
              isHiddenFromOverview,
              description: doc.description || topDescription,
              keywords,
              hidden,
              parentDoc: name,
              props: sanitizeForJson(doc.props),
              usage,
              theming,
              params: null,
              returns: null,
              relatedComponents: null,
              relatedHooks: null,
              playground,
            });
          }
          for (const sub of doc.components) {
            const rawSubName = sub.name || '';
            const subName = rawSubName.replace(/^XDS/, '');
            if (!subName) continue;
            const isHookEntry =
              rawSubName.startsWith('use') ||
              subName.startsWith('use') ||
              Array.isArray(sub.params);
            // Name-only entries are cross-link references to sub-components that
            // have been extracted into their own sibling .doc.mjs files. Their
            // content is emitted from those files (subComponentOf branch); skip
            // here to avoid double emission.
            const isNameOnlyRef =
              Object.keys(sub).length === 1 && sub.name != null;
            if (isNameOnlyRef) continue;
            // Sub-entries whose name differs from the doc name are
            // sub-components — hide them from the overview page.
            const isSubEntry = subName !== doc.name;
            // Each sub-component may have its own usage; fall back to
            // the parent doc's usage only when the sub doesn't define one.
            // Hook entries should read as hook docs, not as the parent component,
            // so use the hook description as the usage summary when no explicit
            // usage block is authored.
            const subUsage = sub.usage
              ? sanitizeForJson(sub.usage)
              : isHookEntry && sub.description
                ? {description: sub.description}
                : usage;
            const params = isHookEntry
              ? Array.isArray(sub.params)
                ? sanitizeForJson(sub.params)
                : Array.isArray(sub.props)
                  ? sanitizeForJson(sub.props)
                  : []
              : null;
            const returns = isHookEntry
              ? Array.isArray(sub.returns)
                ? sanitizeForJson(sub.returns)
                : []
              : null;
            pendingSubComponents.push({
              name: subName,
              displayName: requireDisplayName(
                sub.displayName,
                `${pkg.name}: subcomponent ${sub.name || subName} (parent ${doc.name})`,
              ),
              moduleName: sub.name || subName,
              directory: entry.name,
              importPath: resolveImportPathForPkg(pkg.dir, entry.name),
              group,
              category,
              isHiddenFromOverview: sub.isHiddenFromOverview ?? isHiddenFromOverview,
              description: sub.description || topDescription,
              keywords,
              hidden,
              parentDoc: doc.name,
              props: isHookEntry
                ? []
                : Array.isArray(sub.props)
                  ? sanitizeForJson(sub.props)
                  : [],
              usage: subUsage,
              theming: isHookEntry ? null : theming,
              params,
              returns,
              relatedComponents: isHookEntry
                ? sub.relatedComponents || (doc.name ? [doc.name] : null)
                : null,
              relatedHooks: isHookEntry ? sub.relatedHooks || null : null,
              playground: isHookEntry ? null : playground,
            });
          }
        } else if (doc.params) {
          // HookDoc — parent to the component doc in the same directory
          const name = doc.name || docFileName.replace('.doc.mjs', '');
          standaloneNames.add(name);
          components.push({
            name,
            displayName: requireDisplayName(
              doc.displayName,
              `${pkg.name}: hook ${name}`,
            ),
            moduleName: name,
            directory: entry.name,
            importPath: resolveImportPathForPkg(pkg.dir, entry.name),
            group,
            category,
            isHiddenFromOverview,
            description: topDescription,
            keywords,
            hidden,
            parentDoc: dirPrimaryDoc,
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
            displayName: requireDisplayName(
              doc.displayName,
              `${pkg.name}: component ${name}`,
            ),
            moduleName: name.startsWith('use') ? name : `XDS${name}`,
            directory: entry.name,
            importPath: resolveImportPathForPkg(pkg.dir, entry.name),
            group,
            category,
            isHiddenFromOverview,
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
  /** Identifier name — matches the React component import name, e.g. \`AppShell\`. */
  name: string;
  /**
   * Human-readable display name with spaces between words, e.g.
   * \`Aspect Ratio\` for the \`AspectRatio\` component. Derived from
   * \`name\` by inserting spaces between PascalCase / camelCase words
   * while preserving capitalization.
   */
  displayName: string;
  moduleName: string;
  directory: string;
  /** Resolved import path, e.g. \`@xds/core/Chat\`. Derived from package.json exports. */
  importPath: string | null;
  group: string | null;
  /** Functional category for the overview gallery (Actions, Inputs, etc.) */
  category: string | null;
  /** Whether this component is hidden from the overview page. */
  isHiddenFromOverview: boolean;
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

/**
 * Humanize a raw group label (a PascalCase component/group name) into a
 * spaced display label, e.g. 'TopNav' -> 'Top Nav', 'Chat' -> 'Chat'.
 * Used as the group label when no member's name exactly matches the group
 * (so the label doesn't fall back to an arbitrary member's displayName like
 * 'Chat Composer' for the 'Chat' group).
 */
function humanizeGroupLabel(label) {
  return label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}

function generateGroupedComponentRegistry(allComponents) {
  console.log('Generating grouped component registry...');

  const results = {};

  for (const [pkgName, entries] of Object.entries(allComponents)) {
    const utilities = [];
    const groups = new Map();
    const ungrouped = [];

    const parentDocsWithComponents = new Set();
    for (const e of entries) {
      if (e.parentDoc && !e.name.startsWith('use') && !e.hidden) {
        parentDocsWithComponents.add(e.parentDoc);
      }
    }

    for (const entry of entries) {
      if (entry.hidden) continue;
      const isHook = entry.name.startsWith('use');
      // entry.displayName is required upstream (see ComponentEntry generation
      // — requireDisplayName throws if missing), so no fallback is needed.
      const {displayName} = entry;

      if (
        entry.group === 'Utilities' ||
        (isHook && !entry.parentDoc && entry.directory === 'hooks')
      ) {
        utilities.push({name: entry.name, displayName, href: `/components/${entry.name}`});
        continue;
      }
      if (entry.group) {
        if (!groups.has(entry.group)) groups.set(entry.group, []);
        groups
          .get(entry.group)
          .push({name: entry.name, displayName, href: `/components/${entry.name}`, description: entry.description});
        continue;
      }
      if (isHook && !entry.parentDoc && entry.directory !== 'hooks') {
        const dir = entry.directory;
        if (!groups.has(dir)) groups.set(dir, []);
        groups
          .get(dir)
          .push({name: entry.name, displayName, href: `/components/${entry.name}`, description: entry.description});
        continue;
      }
      if (
        isHook &&
        entry.parentDoc &&
        parentDocsWithComponents.has(entry.parentDoc)
      ) {
        const parent = entry.parentDoc;
        if (!groups.has(parent)) groups.set(parent, []);
        groups
          .get(parent)
          .push({name: entry.name, displayName, href: `/components/${entry.name}`, description: entry.description});
        continue;
      }
      if (isHook) {
        utilities.push({name: entry.name, displayName, href: `/components/${entry.name}`});
        continue;
      }
      ungrouped.push({name: entry.name, displayName, href: `/components/${entry.name}`, description: entry.description});
    }

    const items = [];
    for (const [label, members] of groups) {
      members.sort((a, b) => a.name.localeCompare(b.name));
      if (members.length === 1) {
        items.push({sortKey: members[0].name, item: {type: 'entry', name: members[0].name, displayName: members[0].displayName, href: members[0].href, description: members[0].description}});
      } else {
        const canonical = members.find(m => m.name === label);
        // Prefer the canonical member's already-required displayName as the
        // group label. When no member's name matches the group label (e.g. the
        // 'Chat' group has no component literally named 'Chat'), humanize the
        // raw label instead of falling back to an arbitrary member's
        // displayName (which produced labels like 'Chat Composer').
        const groupDisplayName = canonical
          ? canonical.displayName
          : humanizeGroupLabel(label);
        items.push({sortKey: label, item: {type: 'group', label, displayName: groupDisplayName, description: (canonical || members[0]).description, entries: members.map(m => ({name: m.name, displayName: m.displayName, href: m.href}))}});
      }
    }
    for (const entry of ungrouped) {
      items.push({sortKey: entry.name, item: {type: 'entry', name: entry.name, displayName: entry.displayName, href: entry.href, description: entry.description}});
    }
    items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    results[pkgName] = {
      items: items.map(i => i.item),
      utilities: utilities.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface GroupedEntry {
  type: 'entry';
  /** Identifier name — matches the React component import name. */
  name: string;
  /** Human-readable display name with spaces between camelCased words. */
  displayName: string;
  href: string;
  description: string;
}

export interface GroupedGroup {
  type: 'group';
  /** Raw group label (the component name acting as parent). */
  label: string;
  /** Human-readable version of \`label\` with spaces between camelCased words. */
  displayName: string;
  description: string;
  entries: Array<{name: string; displayName: string; href: string}>;
}

export type ComponentItem = GroupedEntry | GroupedGroup;

export interface GroupedComponents {
  items: ComponentItem[];
  utilities: Array<{name: string; displayName: string; href: string}>;
}

export const groupedComponents: Record<string, GroupedComponents> = ${JSON.stringify(results, null, 2)};
`;
  writeRegistry('groupedComponentRegistry.ts', content);
  return Object.keys(results).length;
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

    const resolvedName = meta.name || basename;
    blocks.push({
      dirName: basename,
      name: resolvedName,
      // Human-readable display name for gallery + sidebar UI. Required —
      // every doc file must declare an explicit `displayName` so authors
      // stay in control of how each component reads in the UI (rather
      // than relying on a build-time regex derivation).
      displayName: requireDisplayName(
        meta.displayName,
        `block ${path.relative(REPO_ROOT, docPath)}`,
      ),
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
  /** Identifier name — matches the React component import name (PascalCase). */
  name: string;
  /**
   * Human-readable display name with spaces between words, e.g.
   * "Chat Message Metadata" for the "ChatMessageMetadata" component.
   * Falls back to a prettified version of \`name\` when no explicit
   * displayName is declared on the doc file.
   */
  displayName: string;
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

    // Skip scaffolds — these are starter templates, not showcases
    if (doc.scaffold) continue;

    let source = '';
    try { source = fs.readFileSync(pagePath, 'utf-8'); } catch { /* ignore */ }

    templates.push({
      slug: dir.name,
      name: doc.name || dir.name,
      description: doc.description || '',
      isReady: doc.isReady ?? true,
      category: doc.category || '',
      isHiddenFromOverview: doc.isHiddenFromOverview ?? false,
      source,
    });
  }

  templates.sort((a, b) => a.name.localeCompare(b.name));

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

export interface TemplateEntry {
  slug: string;
  name: string;
  description: string;
  isReady: boolean;
  /** Functional category, e.g. 'Dashboard - Analytics'. Empty when untagged.
   *  The overview groups by the part before ' - '. */
  category: string;
  /** When true, hide from the Templates overview gallery (still CLI-available). */
  isHiddenFromOverview: boolean;
  source: string;
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


async function generateThemeRegistry(packages) {
  console.log('Generating theme registry...');
  const themePackages = packages.filter(p => p.name.startsWith('@xds/theme-'));
  if (!themePackages.length) {
    writeRegistry('themeRegistry.ts', `// Auto-generated — no theme packages found
import type {XDSDefinedTheme} from '@xds/core/theme';
export const themeObjects: Record<string, XDSDefinedTheme> = {};
`);
    // Empty CSS aggregator so the globals.css @import doesn't 404.
    writeThemesCss('');
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

  // The `/built` objects are tokens-only — component overrides are compiled into
  // each theme's CSS file, not the JS object. Extract those overrides here at
  // build time from the package's full (main) export. In Node the `use client`
  // directive on defineTheme is ignored, so this import is safe; the values are
  // plain string maps, so the generated file stays pure data and is safe to
  // import from server components. They're re-attached to the built objects in
  // `themeObjectsFull` for the theme editors/playground, which rebuild the theme
  // at runtime and so need the overrides (e.g. display fonts) on the object.
  const componentOverrides = {};
  for (const p of themePackages) {
    const slug = p.name.replace('@xds/theme-', '');
    try {
      const mod = await import(p.name);
      const theme = mod[`${slug}Theme`];
      if (theme?.components && Object.keys(theme.components).length > 0) {
        componentOverrides[p.name] = theme.components;
      }
    } catch (err) {
      console.warn(
        `  warn: could not extract components for ${p.name}: ${err.message}`,
      );
    }
  }

  const fullEntries = themePackages.map(p => {
    const slug = p.name.replace('@xds/theme-', '');
    return `  '${p.name}': {...${slug}Theme, components: componentOverrides['${p.name}']},`;
  }).join('\n');

  const content = `// Auto-generated by scripts/generate-data.mjs — do not edit

import type {XDSDefinedTheme} from '@xds/core/theme';
${imports}

export const themeObjects: Record<string, XDSDefinedTheme> = {
${entries}
};

/**
 * Component overrides extracted from each theme's full export (the /built
 * objects above are tokens-only — their component styles live in CSS). Plain
 * data, safe to import from server components.
 */
const componentOverrides: Record<string, XDSDefinedTheme['components']> =
  ${JSON.stringify(componentOverrides, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join('\n')};

/**
 * Built theme objects with their component overrides re-attached. Used by the
 * theme editors/playground, which serialize the theme over postMessage and
 * rebuild it at runtime, so component overrides (e.g. display fonts) must live
 * on the object rather than in a separate CSS file.
 */
export const themeObjectsFull: Record<string, XDSDefinedTheme> = {
${fullEntries}
};
`;
  writeRegistry('themeRegistry.ts', content);

  // CSS aggregator — globals.css imports this single file so adding a
  // new theme package no longer requires hand-editing globals.css.
  const cssImports = themePackages
    .map(p => `@import "${p.name}/theme.css";`)
    .join('\n');
  writeThemesCss(cssImports);

  return themePackages.length;
}

// Writes the aggregated themes.css alongside the TS registries. It's
// imported once from globals.css and re-generated every time the theme
// package list changes.
function writeThemesCss(body) {
  const outPath = path.join(OUT_DIR, 'themes.css');
  const content = `/* Copyright (c) Meta Platforms, Inc. and affiliates. */
/* Auto-generated by scripts/generate-data.mjs — do not edit */

${body}
`;
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`  wrote ${path.relative(REPO_ROOT, outPath)}`);
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
    const isShowcase = /isShowcase:\s*true/.test(content);

    const efMatch = content.match(/exampleFor:\s*['"]([^'"]+)['"]/);
    if (!efMatch) continue;

    const exampleFor = efMatch[1];
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxSrc = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxSrc)) continue;

    const alsoShowcaseFor = extractStringArrayField(content, 'alsoShowcaseFor');

    if (isShowcase) {
      // Copy the TSX file into generated/showcases/
      const destFile = `${basename}.tsx`;
      fs.copyFileSync(tsxSrc, path.join(SHOWCASE_OUT, destFile));
      entries.push({exampleFor, basename, destFile});
    }

    // Blocks can opt into serving as the visual showcase for additional
    // component or hook pages. This is explicit metadata instead of source
    // inspection so authors control where examples appear.
    for (const target of alsoShowcaseFor) {
      const aliasBasename = `${basename}__${target}`;
      const destFile = `${aliasBasename}.tsx`;
      fs.copyFileSync(tsxSrc, path.join(SHOWCASE_OUT, destFile));
      entries.push({exampleFor: target, basename: aliasBasename, destFile});
    }

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
    const isShowcase = /isShowcase:\s*true/.test(content);

    const efMatch = content.match(/exampleFor:\s*['"]([^'"]+)['"]/);
    if (!efMatch) continue;

    const exampleFor = efMatch[1];
    const basename = path.basename(docPath, '.doc.mjs');
    const tsxSrc = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxSrc)) continue;

    // Read name and description from doc meta
    const name = extractQuotedField(content, 'name');
    const description = extractQuotedField(content, 'description');

    let source = '';
    try { source = fs.readFileSync(tsxSrc, 'utf-8'); } catch { /* ignore */ }

    const alsoExampleFor = extractStringArrayField(content, 'alsoExampleFor');

    if (!isShowcase) {
      fs.copyFileSync(tsxSrc, path.join(EXAMPLES_OUT, `${basename}.tsx`));
      entries.push({
        exampleFor,
        basename,
        name: name || basename,
        description: description || '',
        source,
      });
    }

    // Blocks can explicitly appear as examples for additional component or
    // hook pages. This supports component examples doubling as hook examples
    // without inferring intent from the TSX source.
    for (const target of alsoExampleFor) {
      const aliasBasename = `${basename}__${target}`;
      fs.copyFileSync(tsxSrc, path.join(EXAMPLES_OUT, `${aliasBasename}.tsx`));
      entries.push({
        exampleFor: target,
        basename: aliasBasename,
        name: name || basename,
        description: description || `Example using ${target}.`,
        source,
      });
    }

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
  const themeCount = await generateThemeRegistry(packages);
  const {allComponents, totalCount: componentCount} = await generateComponentRegistry();
  generateGroupedComponentRegistry(allComponents);
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
