// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared template discovery + IO.
 *
 * Owns everything the template leaves (list/show/skeleton/copy) AND other
 * commands (component, layout, search, init, discover, validate-integration)
 * share: template discovery across core/external/integration sources, the
 * template-spec loaders, and the cross-command helpers (stripTemplateAssetRefs,
 * findShowcase, findRelatedBlocks, extractComponents, listTemplates). The
 * `api/template/template.mjs` barrel re-exports the public helpers so external
 * import paths keep working unchanged.
 *
 * Lives in foundation rather than under api/template because foundation itself
 * needs it: `Project` assembles templates from it. While this sat in api/, that
 * made a cycle across the layer boundary — Project reached up for discovery and
 * this module imported Project back. Nothing here depends on api/; every import
 * is node:*, jiti, foundation/*, or authoring/*.
 *
 * @position packages/cli/foundation/discovery — shared template discovery/IO;
 *   consumed by Project and by the api/template leaves.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createJiti} from 'jiti';
import {loadModuleWithParser} from '../fs/module-loader.mjs';
import {parseTemplate} from '../../authoring/doctypes/template/parse.mjs';
import {CLI_ROOT, discoverExternalPackages} from '../fs/paths.mjs';
import {Project} from '../config/project.mjs';

/** Identity used for core (built-in) templates in package-scoped listings. */
const CORE_PACKAGE = '@astryxdesign/core';

/**
 * Identity for a template in package-scoped views. Core (built-in) templates
 * have no `package` field; report them under @astryxdesign/core.
 * @param {{package?: string}} t
 * @returns {string}
 */
export function pkgOf(t) {
  return t.package ?? CORE_PACKAGE;
}

/**
 * A discovered template (page or block), normalized across core, external, and
 * integration sources. Not every source populates every field, so
 * source-specific extras (`aspectRatio`, `isShowcase`, `package`) are optional.
 * @typedef {object} DiscoveredTemplate
 * @property {'page'|'block'} type
 * @property {string} dirName
 * @property {string} name
 * @property {string} description
 * @property {string} [category]
 * @property {boolean} [isReady]
 * @property {boolean} [scaffold]
 * @property {number} [aspectRatio]
 * @property {string[]} [componentsUsed]
 * @property {boolean} [isShowcase]
 * @property {string} filePath
 * @property {string} docPath
 * @property {string} [package]
 */

/**
 * An integration-template discovery error.
 * @typedef {object} TemplateDiscoveryError
 * @property {string} package
 * @property {string} [template]
 * @property {string} message
 */

/**
 * The loaded metadata object from a template spec (loose — authored shape).
 * @typedef {Record<string, any> | undefined | null} TemplateDocModule
 */

/**
 * Canonical basename suffixes for template-spec files, in precedence order.
 * A template spec is a scaffoldable TEMPLATE (a plain object stamped with a
 * `type` of `'page'` or `'block'`), so `.template.*` is the descriptive family
 * name.
 */
const TEMPLATE_SUFFIXES = ['.template.ts', '.template.mjs', '.template.js'];

/**
 * Legacy basename suffixes for template-spec files, in precedence order.
 * `.doc.*` was inherited from the component-doc convention before templates
 * had their own name; it is still accepted during the transition window.
 */
const DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

/**
 * The union of canonical + legacy template-spec suffixes, canonical first so
 * `.template.*` wins over `.doc.*` when both stems exist. All template
 * discovery matches this union so a `Foo.template.ts` file is treated exactly
 * like a legacy `Foo.doc.mjs`.
 */
const ALL_TEMPLATE_SUFFIXES = [...TEMPLATE_SUFFIXES, ...DOC_SUFFIXES];

/**
 * The template-spec suffix present on `file`, or null if none matches.
 * Recognizes both the canonical `.template.*` and legacy `.doc.*` families.
 * @param {string} file
 * @returns {string | null}
 */
function matchedTemplateSuffix(file) {
  return ALL_TEMPLATE_SUFFIXES.find(suffix => file.endsWith(suffix)) ?? null;
}

/**
 * RegExp matching either template-spec suffix family at end of a basename.
 * Used where a per-file regex is convenient (e.g. block discovery walks).
 */
const TEMPLATE_SUFFIX_RE = /\.(template|doc)\.(ts|mjs|js)$/;

/** @type {ReturnType<typeof createJiti> | undefined} */
let jitiInstance;
/** Lazily-created jiti for loading `.ts` template specs (JSX-capable). */
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url, {jsx: true});
  }
  return jitiInstance;
}

/**
 * Load an integration template doc module and validate it against the template
 * envelope at the load boundary. Default export only — `.ts` via jiti,
 * `.mjs`/`.js` via dynamic import. Throws (caught by discovery) if the default
 * export is missing or fails {@link parseTemplate}. NOTE: the built-in
 * core templates use `export const doc = {...}` and are loaded by a different
 * function ({@link loadDocModule}) — this path is for INTEGRATION templates.
 *
 * @param {string} file
 * @param {string} [label]
 */
async function loadIntegrationDoc(file, label) {
  return loadModuleWithParser(file, parseTemplate, {label});
}

const TEMPLATES_DIR = path.join(CLI_ROOT, 'assets', 'templates');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES_DIR, 'blocks');

/**
 * Inline placeholder swapped in for demo imagery when scaffolding a template,
 * so scaffolded pages render with zero setup (see stripTemplateAssetRefs).
 * Neutral hex colors (not design tokens) so it renders in any project, themed
 * or not. Mirrors apps/docsite/public/template-assets/placeholder.svg.
 */
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f5f6f8%22%2F%3E%3Cg%20transform%3D%22translate%28200%20150%29%22%20fill%3D%22none%22%20stroke%3D%22%23c2cad6%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%22-44%22%20y%3D%22-44%22%20width%3D%2288%22%20height%3D%2288%22%20rx%3D%2216%22%2F%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%22-18%22%20r%3D%222.5%22%20fill%3D%22%23c2cad6%22%20stroke%3D%22none%22%2F%3E%3Cpath%20d%3D%22M-34%2030%20L-8%200%20L10%2018%20L20%208%20L34%2024%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E';

/**
 * Extensions that need a video-safe placeholder rather than the image data
 * URI (see stripTemplateAssetRefs). There's no equivalent self-contained
 * inline placeholder for video: unlike an SVG data URI, a `<video src>`
 * needs actual encoded media, and hand-authoring a valid tiny MP4/WebM
 * blob isn't something we can do reliably here — an unverifiable, possibly
 * still-broken binary would just trade one silent failure for another.
 * Rather than mis-render image data as video (the original bug) or guess at
 * binary bytes, video sources are stripped to an empty string so the
 * scaffolded example is honest about needing the builder to supply their
 * own file, instead of silently pointing at something that can't play.
 *
 * @type {Set<string>}
 */
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'ogv']);

/**
 * Demo-asset sources to strip from scaffolded projects. Template demo imagery
 * is self-hosted under the docsite's `/template-assets/*` dir (committed there,
 * mirrored into the sandbox preview by scripts/sync-templates.js). Those paths
 * only resolve inside the Astryx docsite/sandbox, so on scaffold they're
 * replaced — a scaffolded project has no `/template-assets/` dir and would
 * otherwise 404. Genuine third-party URLs (e.g. brand logos from
 * paypalobjects.com) are intentionally left untouched.
 *
 * @type {RegExp}
 */
const DEMO_ASSET_PATTERN = /\/template-assets\/[\w-]+\.(\w+)/g;

/**
 * Normalize path into Unix path (using forward slashes) for consistent comparison
 * across Windows, macOS, and Linux.
 *
 * @param {string} p - The file path to normalize.
 * @returns {string} The normalized Unix path.
 */
function toPosixPath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Replace demo asset references with a placeholder so scaffolded pages
 * render with zero setup. Images get a self-contained data URI; videos
 * (which have no equivalent inline placeholder — see VIDEO_EXTENSIONS) are
 * stripped to an empty src instead of being mis-replaced with image data.
 * Builders drop in their own media either way.
 *
 * @param {string} source - Template source code.
 * @returns {string} Source with demo asset references replaced.
 */
export function stripTemplateAssetRefs(source) {
  return source.replace(DEMO_ASSET_PATTERN, (match, extension) =>
    VIDEO_EXTENSIONS.has(extension.toLowerCase()) ? '' : PLACEHOLDER_IMAGE,
  );
}
/**
 * Load a template-spec module and return its metadata object. Supports both
 * families of suffix:
 *   - Legacy `.doc.*` core/external specs export `export const doc = {...}`.
 *   - Canonical `.template.*` specs export the stamped object (`type: 'page' |
 *     'block'`) as the default export.
 * Prefers the default export, falling back to the named `doc` export, so a
 * `Foo.template.ts` (default export) is read identically to a legacy
 * `Foo.doc.mjs` (`doc` export). `.ts` is loaded via jiti; `.mjs`/`.js` via a
 * native dynamic import. Returns null if the file does not exist.
 *
 * @param {string} docPath absolute path to the spec file
 * @returns {Promise<TemplateDocModule>}
 */
async function loadDocModule(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const docModule = docPath.endsWith('.ts')
    ? await getJiti().import(docPath)
    : await import(`file://${docPath}`);
  return docModule.default ?? docModule.doc;
}

/**
 * List the core page-template directory names (sorted). The `template --list`
 * view discovers far more; this is the minimal core-page set `init` scaffolds
 * from.
 * @returns {string[]}
 */
export function listTemplates() {
  /** @type {string[]} */
  const all = [];
  if (fs.existsSync(PAGES_DIR)) {
    all.push(
      ...fs
        .readdirSync(PAGES_DIR, {withFileTypes: true})
        .filter(e => e.isDirectory())
        .map(e => e.name),
    );
  }
  return all.sort();
}

/**
 * @param {string} dir
 * @param {RegExp} pattern
 * @returns {string[]}
 */
function findDocFiles(dir, pattern) {
  /** @type {string[]} */
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

/**
 * Resolve the template-spec file for a core page directory: the first existing
 * `template.<suffix>` in canonical-then-legacy precedence, or null.
 * @param {string} dirPath
 * @returns {string | null}
 */
function findPageDocFile(dirPath) {
  for (const suffix of ALL_TEMPLATE_SUFFIXES) {
    const candidate = path.join(dirPath, `template${suffix}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function discoverPages() {
  if (!fs.existsSync(PAGES_DIR)) return [];
  const dirs = fs
    .readdirSync(PAGES_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory());

  /** @type {DiscoveredTemplate[]} */
  const templates = [];
  for (const dir of dirs) {
    const dirPath = path.join(PAGES_DIR, dir.name);
    const docPath =
      findPageDocFile(dirPath) ?? path.join(dirPath, 'template.doc.mjs');
    const doc = await loadDocModule(docPath);
    templates.push({
      type: 'page',
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      category: doc?.category || '',
      isReady: doc?.isReady ?? true,
      scaffold: doc?.scaffold ?? false,
      filePath: path.join(dirPath, 'page.tsx'),
      docPath,
    });
  }
  return templates;
}

async function discoverBlocks() {
  const docFiles = findDocFiles(BLOCKS_DIR, TEMPLATE_SUFFIX_RE);
  /** @type {DiscoveredTemplate[]} */
  const blocks = [];
  for (const docPath of docFiles) {
    const suffix = matchedTemplateSuffix(docPath);
    if (!suffix) continue;
    const basename = path.basename(docPath, suffix);
    const tsxPath = path.join(path.dirname(docPath), basename + '.tsx');
    if (!fs.existsSync(tsxPath)) continue;
    const doc = await loadDocModule(docPath);
    const relPath = toPosixPath(path.relative(BLOCKS_DIR, path.dirname(docPath)));
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
 * Discover blocks from external packages that declare `astryx.blocks` in
 * their package.json. Same shape as discoverBlocks() output.
 *
 * @param {string} [cwd]
 */
async function discoverExternalBlocks(cwd = process.cwd()) {
  const externals = discoverExternalPackages(cwd);
  /** @type {DiscoveredTemplate[]} */
  const blocks = [];

  for (const ext of externals) {
    if (!ext.blocksDir || !fs.existsSync(ext.blocksDir)) continue;
    const docFiles = findDocFiles(ext.blocksDir, TEMPLATE_SUFFIX_RE);
    for (const docPath of docFiles) {
      const suffix = matchedTemplateSuffix(docPath);
      if (!suffix) continue;
      const basename = path.basename(docPath, suffix);
      const tsxPath = path.join(path.dirname(docPath), basename + '.tsx');
      if (!fs.existsSync(tsxPath)) continue;
      const doc = await loadDocModule(docPath);
      const relPath = toPosixPath(path.relative(ext.blocksDir, path.dirname(docPath)));
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
 * @returns {Promise<DiscoveredTemplate[]>}
 */
async function discoverAllBlocks(cwd = process.cwd()) {
  const [core, external] = await Promise.all([
    discoverBlocks(),
    discoverExternalBlocks(cwd),
  ]);
  return [...core, ...external];
}

/**
 * @param {string} [cwd]
 * @returns {Promise<DiscoveredTemplate[]>}
 */
export async function discoverAll(cwd = process.cwd()) {
  const [pages, blocks, integration] = await Promise.all([
    discoverPages(),
    discoverAllBlocks(cwd),
    discoverIntegrationTemplates(cwd),
  ]);
  return [...pages, ...blocks, ...integration.templates].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/**
 * Like {@link discoverAll} but also returns integration-template discovery
 * errors (missing same-stem source, missing `type`, load failure). Use this
 * when the caller wants to warn about malformed integration templates.
 *
 * @param {string} [cwd]
 * @returns {Promise<{templates: DiscoveredTemplate[], errors: TemplateDiscoveryError[]}>}
 */
export async function discoverAllWithErrors(cwd = process.cwd()) {
  const [pages, blocks, integration] = await Promise.all([
    discoverPages(),
    discoverAllBlocks(cwd),
    discoverIntegrationTemplates(cwd),
  ]);
  const templates = [...pages, ...blocks, ...integration.templates].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  return {templates, errors: integration.errors};
}

/**
 * Recursively collect integration template-spec files under `root`.
 * Returns absolute paths to files ending in one of ALL_TEMPLATE_SUFFIXES
 * (canonical `.template.*` or legacy `.doc.*`).
 *
 * @param {string} root
 * @returns {string[]}
 */
function findIntegrationDocFiles(root) {
  /** @type {string[]} */
  const results = [];
  if (!fs.existsSync(root)) return results;
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (ALL_TEMPLATE_SUFFIXES.some(suffix => entry.name.endsWith(suffix))) {
        results.push(full);
      }
    }
  };
  walk(root);
  return results;
}

/**
 * Discover templates contributed by configured integrations.
 *
 * For each integration with a resolved `templates` root, every
 * `<id>.template.{ts,mjs,js}` (or legacy `<id>.doc.{ts,mjs,js}`) file is a
 * template whose id is its path relative to the templates root with the
 * matched suffix stripped (kebab-case, may be nested). The doc's `type`
 * (page|block) decides scaffolding — there is no `/pages` vs `/blocks`
 * requirement. A same-stem sibling source file (`<id>.tsx`) is required; a doc
 * missing its source, or missing `type`, is an integration error and that
 * template is skipped (recorded in `errors`).
 *
 * @param {string} [cwd]
 * @returns {Promise<{templates: DiscoveredTemplate[], errors: TemplateDiscoveryError[]}>}
 */
async function discoverIntegrationTemplates(cwd = process.cwd()) {
  /** @type {DiscoveredTemplate[]} */
  const templates = [];
  /** @type {TemplateDiscoveryError[]} */
  const errors = [];

  let loadedIntegrations;
  try {
    const project = await Project.load(cwd);
    loadedIntegrations =
      /** @type {import('../integrations/integrations.mjs').LoadedIntegration[]} */ (
        project.loadedIntegrations
      );
  } catch (err) {
    // A broken astryx.config (or an integration that fails to load) can't
    // contribute templates. Record it as a discovery error instead of
    // swallowing it silently: a bare `catch {}` also hides unexpected bugs.
    // discoverAll (the no-error variant that `astryx template` uses) and
    // Project.templates() both discard this errors array, so the template
    // command's behavior is unchanged — the full config-error UX still lives
    // in `discover`/`doctor` via Project.issues(). Only callers that opt into
    // errors (discoverAllWithErrors) now see the signal.
    errors.push({
      package: 'astryx.config',
      message: err instanceof Error ? err.message : String(err),
    });
    return {templates, errors};
  }

  for (const integration of loadedIntegrations) {
    const result = await discoverIntegrationTemplatesForOne(integration);
    templates.push(...result.templates);
    errors.push(...result.errors);
  }

  return {templates, errors};
}

/**
 * Discover the templates contributed by a SINGLE integration. Same per-template
 * rules as {@link discoverIntegrationTemplates} (same-stem source required,
 * page|block type required); broken templates are recorded in `errors` rather
 * than thrown. Exposed for `validate-integration`.
 *
 * @param {{name?: string, __spec?: string, templates?: string}} integration
 * @returns {Promise<{templates: DiscoveredTemplate[], errors: TemplateDiscoveryError[]}>}
 */
export async function discoverIntegrationTemplatesForOne(integration) {
  /** @type {DiscoveredTemplate[]} */
  const templates = [];
  /** @type {TemplateDiscoveryError[]} */
  const errors = [];

  const root = integration?.templates;
  const pkgLabel = integration?.name ?? integration?.__spec ?? 'integration';
  if (!root || !fs.existsSync(root)) return {templates, errors};

  for (const docPath of findIntegrationDocFiles(root)) {
    const suffix = matchedTemplateSuffix(docPath);
    if (!suffix) continue;
    const id = path
      .relative(root, docPath)
      .slice(0, -suffix.length)
      .split(path.sep)
      .join('/');

    const sourcePath = docPath.slice(0, -suffix.length) + '.tsx';
    if (!fs.existsSync(sourcePath)) {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" is missing its same-stem source file ${path.basename(sourcePath)}.`,
      });
      continue;
    }

    let doc;
    try {
      doc = await loadIntegrationDoc(docPath, `Template "${id}"`);
    } catch (err) {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" failed to load: ${/** @type {any} */ (err).message}`,
      });
      continue;
    }

    // loadIntegrationDoc validates against the envelope (incl. a 'page'|'block'
    // type) at the load boundary, so a valid doc always has a type. This guard
    // stays as defense-in-depth.
    const type = doc?.type;
    if (type !== 'page' && type !== 'block') {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" is missing a "type" of "page" or "block". Stamp the default export with type: 'page' or type: 'block'.`,
      });
      continue;
    }

    templates.push({
      type,
      dirName: id,
      name: doc?.name || id,
      description: doc?.description || '',
      category: doc?.category || '',
      isReady: true,
      scaffold: false,
      // The integration envelope carries `componentsUsed` for both page and
      // block templates; the rich TemplateDoc union only declares it on blocks,
      // so read it off the envelope shape here.
      componentsUsed:
        /** @type {{componentsUsed?: string[]}} */ (doc).componentsUsed ?? [],
      filePath: sourcePath,
      docPath,
      package: pkgLabel,
    });
  }

  return {templates, errors};
}

/**
 * @param {string} componentName
 * @param {string} [cwd]
 * @returns {Promise<DiscoveredTemplate[]>}
 */
export async function findRelatedBlocks(componentName, cwd) {
  const blocks = await discoverAllBlocks(cwd);
  return blocks.filter(b =>
    (b.componentsUsed ?? []).some(c => c.toLowerCase() === componentName.toLowerCase()),
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

  const toResult = (/** @type {DiscoveredTemplate} */ b) => ({
    name: b.name,
    aspectRatio: b.aspectRatio,
    filePath: b.filePath,
    docPath: b.docPath,
  });

  // Priority 1: own directory (components/Badge/ for "Badge")
  const dirMatch = showcases.find(b => {
    const catDir = path.basename(b.category ?? '').toLowerCase();
    return catDir === lc;
  });
  if (dirMatch) return toResult(dirMatch);

  // Priority 2: componentsUsed in any directory (ClickableCard in Card/)
  const usedMatch = showcases.find(b =>
    (b.componentsUsed ?? []).some(c => c.toLowerCase() === lc),
  );
  if (usedMatch) return toResult(usedMatch);

  return null;
}

const UBIQUITOUS = new Set([
  'Text',
  'Heading',
  'Button',
  'HStack',
  'VStack',
  'Link',
  'Icon',
]);

/**
 * @param {string} pagePath
 * @param {Set<string>|null} [knownComponents]
 * @returns {string[]}
 */
export function extractComponents(pagePath, knownComponents = null) {
  const src = fs.readFileSync(pagePath, 'utf-8');
  // Match JSX opening tags, e.g. `<Section` or the legacy `<XDSSection`.
  // Templates author bare component names post un-prefix migration
  // (P2380608025), so the `XDS` prefix is optional. Anchoring on the `<`
  // JSX-tag boundary keeps this precise (avoids matching imports/comments/
  // identifiers) while remaining prefix-agnostic.
  const tagRegex = /<(XDS)?([A-Z]\w+)/g;
  /** @type {string[]} */
  const matches = [];
  let m;
  while ((m = tagRegex.exec(src)) !== null) {
    matches.push(m[2]);
  }
  return [
    ...new Set(
      matches
        .filter(n => !['Theme', 'ThemeProvider'].includes(n))
        .filter(n => !UBIQUITOUS.has(n))
        // Exact names only. No suffix-fuzzying (e.g. StackItem -> Stack):
        // a name is advertised iff `astryx component <Name>` can resolve it
        // as-is, which includes parent-doc subcomponents like StackItem and
        // ResizeHandle (they are indexed from the docs by
        // listResolvableComponentNames).
        .filter(n => knownComponents === null || knownComponents.has(n)),
    ),
  ].sort();
}
