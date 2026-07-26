// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle API — copy a component's source into the consumer project for
 * customization, rewriting escaping relative imports to the OWNER package's
 * subpaths.
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
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports that stay inside the copied component
 * tree (and same-level `./x` imports) are left untouched.
 *
 * e.g. with ownerPackage '@astryxdesign/core':
 *      '../theme/tokens.stylex' -> '@astryxdesign/core/theme'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
 *
 * When `location` is supplied (`{fromDir, componentDir}`), rewriting is
 * location-aware: each `../` import is resolved from the source file's own
 * directory, and only imports that actually escape `componentDir` are
 * rewritten. This keeps intra-component imports from NESTED files relative —
 * e.g. `../../types` in `Table/plugins/pagination/*` still resolves against the
 * copied `Table/types` rather than becoming a broken `@astryxdesign/core/..`.
 * Without `location`, the legacy behavior applies (every `../` is treated as
 * escaping and mapped by its first segment), which is correct for top-level
 * files and preserves the existing callers/tests.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {{fromDir: string, componentDir: string}} [location]
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, location) {
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (location) {
        const {fromDir, componentDir} = location;
        const resolved = path.resolve(fromDir, importPath);
        const relFromComponent = path.relative(componentDir, resolved);
        // Stays inside the copied component tree — leave it relative so it
        // resolves against the sibling files we also copied.
        if (
          relFromComponent === '' ||
          (!relFromComponent.startsWith('..') &&
            !path.isAbsolute(relFromComponent))
        ) {
          return match;
        }
        // Escapes the component: map to the owner subpath. The owner exposes
        // each top-level src dir as a package subpath, so take the first
        // segment below the component's parent (e.g. src/theme -> theme).
        const parentDir = path.dirname(componentDir);
        const topDir = path.relative(parentDir, resolved).split(path.sep)[0];
        return `${prefix}${ownerPackage}/${topDir}${suffix}`;
      }

      const parts = importPath.replace(/^\.\.\//, '').split('/');
      const topDir = parts[0];
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
 * Recursively collect swizzle-eligible files under `dir`, returned as paths
 * relative to `baseDir` (so nested structure is preserved on copy). Excluded
 * files (tests, docs, README) are skipped at every level. Symlinks are not
 * followed — only real files and directories are traversed.
 *
 * @param {string} dir
 * @param {string} [baseDir]
 * @returns {string[]} relative file paths (e.g. 'index.ts', 'plugins/selection/index.ts')
 */
function collectSourceFiles(dir, baseDir = dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (isExcludedFromCopy(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectSourceFiles(full, baseDir));
    } else if (entry.isFile()) {
      out.push(path.relative(baseDir, full));
    }
  }
  return out;
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

  // Pre-flight overwrite check before any mkdir/writeFile. Collect files
  // recursively so nested component source (e.g. Table/plugins/*) is included.
  const sourceFiles = collectSourceFiles(componentDir);
  const existingFiles = sourceFiles.filter(f =>
    fs.existsSync(path.join(outputDir, f)),
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
  for (const rel of sourceFiles) {
    const srcPath = path.join(componentDir, rel);

    // Path-safety: every destination must stay inside outputDir. `rel` comes
    // from a trusted readdir walk, but assert defensively before any
    // mkdir/write so a hostile path can never escape the output dir.
    let destPath;
    try {
      destPath = assertWithin(rel, outputDir, {label: 'swizzle destination'});
    } catch (err) {
      if (err instanceof PathSafetyError) {
        throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
      }
      throw err;
    }

    let content = fs.readFileSync(srcPath, 'utf-8');
    if (rel.endsWith('.ts') || rel.endsWith('.tsx')) {
      // Pass the file's own location so imports that stay inside the copied
      // component tree (common in nested files) are left relative.
      content = rewriteImports(content, owner.ownerPackage, {
        fromDir: path.dirname(srcPath),
        componentDir,
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
