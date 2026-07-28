// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle API — copy a component's source into the consumer project for
 * customization, rewriting escaping relative imports to the OWNER package's
 * subpaths.
 *
 * The copy is recursive: components whose source spans subdirectories (e.g.
 * `Table/plugins/*`) eject whole, structure preserved, so their own `./`
 * re-exports still resolve. Import rewriting is therefore resolved per file
 * location — see `rewriteImports`.
 *
 * Side-effecting: `swizzle(name, ...)` writes files and returns a
 * `swizzle.copy` receipt describing what it did; with no name (or `list`) it
 * returns `swizzle.list`. Errors throw AstryxError (stable code + suggestions).
 * All human prose / package-manager prefixing lives in the CLI renderer.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, listComponents} from '../../utils/paths.mjs';
import {assertWithin, PathSafetyError} from '../../utils/path-safety.mjs';
import {checkGhCli} from '../../utils/github.mjs';
import {Project} from '../../lib/project.mjs';
import {
  CORE_PACKAGE,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
} from '../../lib/component-discovery.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {AstryxError} from '../error.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * Stand-in component location used when a caller rewrites a top-level file
 * without telling us where it lives. Keeps the no-location call a pure string
 * transform while sharing one code path with the located case.
 */
const VIRTUAL_COMPONENT_DIR = path.join(path.sep, '__astryx_swizzle__', 'component');

/** True when `child` resolves strictly inside `parent`. */
function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/** True when `child` is `parent` itself or resolves inside it. */
function isAtOrInside(parent, child) {
  return parent === child || isInside(parent, child);
}

/**
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports that stay within the copied tree are
 * left untouched — the eject preserves structure, so they still resolve.
 *
 * Each `../` specifier is resolved from the importing FILE's own directory, so
 * a nested source file gets the same treatment as a top-level one:
 *
 *   Widget/index.ts            '../theme/tokens.stylex'       -> '<owner>/theme'
 *   Widget/parts/alpha/x.ts    '../../../theme/tokens.stylex' -> '<owner>/theme'
 *   Widget/parts/alpha/x.ts    '../../types'                  -> unchanged (inside)
 *
 * A specifier that escapes the package source root is left alone rather than
 * rewritten to '<owner>/..', which resolves to nothing.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {{componentDir?: string, fromDir?: string}} [location]
 *   `componentDir` is the component's source root; `fromDir` is the directory
 *   of the file being rewritten. Omit both to treat `content` as a top-level
 *   file of an anonymous component.
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, location = {}) {
  const componentDir = path.resolve(location.componentDir ?? VIRTUAL_COMPONENT_DIR);
  const fromDir = path.resolve(location.fromDir ?? componentDir);
  const srcRoot = path.dirname(componentDir);

  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      const target = path.resolve(fromDir, importPath);
      // Still inside the copied tree — the relative path survives the copy.
      // `at` counts too: '../..' from a nested file points at the component's
      // own entry, which must keep resolving to the eject, not the library.
      if (isAtOrInside(componentDir, target)) return match;
      // Reaches past the package source root; nothing sensible to point at.
      if (!isInside(srcRoot, target)) return match;
      const [topDir] = path.relative(srcRoot, target).split(path.sep);
      return `${prefix}${ownerPackage}/${topDir}${suffix}`;
    },
  );
}

/**
 * Build the maintainer feedback note for a swizzled component.
 * @param {string} component
 * @param {string|undefined} issuesUrl
 * @returns {{issuesUrl: string, ghCommand?: string} | null}
 */
function buildFeedback(component, issuesUrl) {
  if (!issuesUrl) return null;
  /** @type {{issuesUrl: string, ghCommand?: string}} */
  const feedback = {issuesUrl};
  const match = issuesUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues(?:\/new)?\/?$/,
  );
  if (match && checkGhCli()) {
    const [, owner, repo] = match;
    feedback.ghCommand = `gh issue create --repo ${owner}/${repo} --title "[${component}] Swizzle feedback"`;
  }
  return feedback;
}

/**
 * Load the configured integrations + core issues URL for `cwd`, swallowing any
 * config errors so swizzle never hard-fails on a malformed/absent config.
 * @param {string} cwd
 * @returns {Promise<{loadedIntegrations: import('../../lib/integrations.mjs').LoadedIntegration[], issuesUrl: string|undefined, project: Project|null}>}
 */
async function loadConfigSafely(cwd) {
  try {
    const project = await Project.load(cwd);
    return {
      loadedIntegrations: project.loadedIntegrations,
      issuesUrl: project.config.issuesUrl,
      project,
    };
  } catch {
    return {loadedIntegrations: [], issuesUrl: undefined, project: null};
  }
}

/**
 * Build the set of OWNER packages that provide a component named `name` across
 * core + every loaded integration.
 * @param {string} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} loadedIntegrations
 * @param {string} name
 * @param {string|undefined} coreIssuesUrl
 * @returns {Array<{package: string, sourceDir: string|null, ownerPackage: string, issuesUrl: string|undefined}>}
 */
function resolveOwners(coreDir, loadedIntegrations, name, coreIssuesUrl) {
  const owners = [];
  const coreComponentDir = path.join(coreDir, 'src', name);
  if (fs.existsSync(coreComponentDir)) {
    owners.push({
      package: CORE_PACKAGE,
      sourceDir: coreComponentDir,
      ownerPackage: CORE_PACKAGE,
      issuesUrl: coreIssuesUrl || DEFAULT_ISSUES_URL,
    });
  }
  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, name);
    if (!docPath) continue;
    const sourcePath = findIntegrationComponentSource(integration, name);
    owners.push({
      package: integration.name,
      sourceDir: sourcePath ? path.dirname(sourcePath) : null,
      ownerPackage: integration.name,
      issuesUrl: integration.issuesUrl,
    });
  }
  return owners;
}

/** @param {string} file */
function isExcludedFromCopy(file) {
  return (
    file.includes('.test.') || file.includes('.doc.') || file === 'README.md'
  );
}

/**
 * Directories that hold test scaffolding rather than component source. Their
 * contents aren't reliably caught by the filename filter (a `.snap` or a
 * `.spec.tsx` carries no `.test.` marker), so they're skipped wholesale.
 */
const EXCLUDED_DIRS = new Set([
  '__tests__',
  '__snapshots__',
  '__mocks__',
  '__fixtures__',
  'node_modules',
]);

/**
 * Every source file under `componentDir`, recursively, as posix-relative paths
 * (forward slashes on every platform so the receipt is stable).
 *
 * Single source of truth for the pre-flight collision check, the copy loop and
 * the reported file list — they cannot drift apart. Symlinks are not followed:
 * an eject copies the component's own source, not wherever a link points.
 *
 * @param {string} componentDir
 * @param {string} [rel]
 * @returns {string[]}
 */
function collectSourceFiles(componentDir, rel = '') {
  const entries = fs.readdirSync(path.join(componentDir, rel), {
    withFileTypes: true,
  });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      files.push(...collectSourceFiles(componentDir, relPath));
    } else if (entry.isFile() && !isExcludedFromCopy(entry.name)) {
      files.push(relPath);
    }
  }
  return files;
}

/**
 * List swizzlable components, or copy one component's source for customization.
 *
 * @param {string} [component] bare or XDS-prefixed component name; omit to list
 * @param {{cwd?: string, output?: string, package?: string, list?: boolean, overwrite?: boolean}} [options]
 * @returns {Promise<import('../../types/swizzle').SwizzleListResponse | import('../../types/swizzle').SwizzleCopyResponse>}
 */
export async function swizzle(component, options = {}) {
  const {
    cwd = process.cwd(),
    output = './components/astryx',
    package: pkg,
    list = false,
    overwrite = false,
  } = options;

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError(
      'Could not find @astryxdesign/core package. Make sure you are inside the design system monorepo or have @astryxdesign/core installed.',
      [],
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }

  const components = listComponents(coreDir);

  if (list || !component) {
    return {type: 'swizzle.list', data: components};
  }

  const dirName = component.replace(/^XDS/, '');

  const {loadedIntegrations, project} = await loadConfigSafely(cwd);
  const coreIssuesUrl = project
    ? project.issuesUrl({package: CORE_PACKAGE})
    : undefined;
  const allOwners = resolveOwners(coreDir, loadedIntegrations, dirName, coreIssuesUrl);

  if (allOwners.length === 0) {
    throw new AstryxError(
      `Component "${component}" not found.`,
      components.slice(0, 10).map(n => ({name: n})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  let owner;
  if (pkg) {
    owner = allOwners.find(o => o.package === pkg);
    if (!owner) {
      throw new AstryxError(
        `Component "${dirName}" is not provided by package "${pkg}".`,
        allOwners.map(o => ({name: o.package, reason: 'provides this component'})),
        ERROR_CODES.ERR_UNKNOWN_COMPONENT,
      );
    }
  } else if (allOwners.length > 1) {
    throw new AstryxError(
      `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      allOwners.map(o => ({name: o.package, reason: 'provides this component'})),
      ERROR_CODES.ERR_AMBIGUOUS_COMPONENT,
    );
  } else {
    owner = allOwners[0];
  }

  if (!owner.sourceDir || !fs.existsSync(owner.sourceDir)) {
    throw new AstryxError(
      `No source found for "${dirName}" in package "${owner.package}".`,
      [],
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  const componentDir = owner.sourceDir;

  // Path-safety: --output must resolve inside cwd.
  let outputBase;
  try {
    outputBase = assertWithin(output, cwd, {label: 'output directory'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }
  const outputDir = path.join(outputBase, dirName);

  // Pre-flight overwrite check before any mkdir/writeFile. Walks the whole
  // component tree so a nested collision can't slip through unseen.
  const sourceFiles = collectSourceFiles(componentDir);
  const existingFiles = sourceFiles.filter(f =>
    fs.existsSync(path.join(outputDir, ...f.split('/'))),
  );
  if (existingFiles.length > 0 && !overwrite) {
    const relOutputForMsg = path.relative(cwd, outputDir) || '.';
    throw new AstryxError(
      `Refusing to overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/. ` +
        `Re-run with --overwrite (or -f) to replace them.`,
      [],
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  fs.mkdirSync(outputDir, {recursive: true});

  let copied = 0;
  let usesStyleX = false;
  for (const file of sourceFiles) {
    const segments = file.split('/');
    const srcPath = path.join(componentDir, ...segments);
    const destPath = path.join(outputDir, ...segments);
    let content = fs.readFileSync(srcPath, 'utf-8');
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      content = rewriteImports(content, owner.ownerPackage, {
        componentDir,
        fromDir: path.dirname(srcPath),
      });
      if (content.includes('@stylexjs/stylex')) {
        usesStyleX = true;
      }
    }
    fs.mkdirSync(path.dirname(destPath), {recursive: true});
    fs.writeFileSync(destPath, content);
    copied++;
  }

  const relOutput = path.relative(cwd, outputDir);
  const copiedFiles = sourceFiles;
  const feedback = buildFeedback(dirName, owner.issuesUrl);

  /** @type {import('../../types/swizzle').SwizzleCopyResponse['data']} */
  const data = {
    component: dirName,
    package: owner.package,
    outputDir: relOutput,
    filesCopied: copied,
    files: copiedFiles.map(f => f),
    usesStyleX,
  };
  if (feedback) data.feedback = feedback;
  return {type: 'swizzle.copy', data};
}
