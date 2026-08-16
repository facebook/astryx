// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle.copy leaf — copy a component's source into the consumer project
 * for customization, rewriting escaping relative imports to the OWNER package's
 * subpaths. The copy walks the component directory recursively, so nested
 * source subdirectories (e.g. Table/plugins/*) are preserved in the output;
 * the overwrite pre-flight and the reported file list share the same
 * recursive file set.
 *
 * Side-effecting: writes files and returns a `swizzle.copy` receipt describing
 * what it did. Shared core discovery + component listing come from
 * api/swizzle/_adapter.mjs; everything here (owner resolution, the copy, import
 * rewriting, StyleX detection, maintainer feedback) is copy-specific. Errors
 * throw AstryxError (stable code + suggestions). All human prose /
 * package-manager prefixing lives in the CLI renderer.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {resolveCore} from '../_adapter.mjs';
import {assertWithin, sanitizeName, PathSafetyError} from '../../../foundation/fs/path-safety.mjs';
import {checkGhCli} from '../_github.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {
  CORE_PACKAGE,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
} from '../../../foundation/discovery/component-discovery.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports within the copied directory are left
 * untouched: `./x` always stays, and for a file `depth` levels below the
 * component root an `../` chain only escapes once it has MORE than `depth`
 * leading `../` segments. E.g. in `Table/plugins/selection/x.tsx` (depth 2),
 * `../../types` still resolves inside the copied tree and stays as-is, while
 * `../../../Icon` escapes and is rewritten to `<pkg>/Icon`.
 *
 * e.g. with ownerPackage '@astryxdesign/core':
 *      '../theme/tokens.stylex' -> '@astryxdesign/core/theme/tokens.stylex'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
 *      '../../locales/en.json'   -> '@astryxdesign/core/locales/en.json'
 *      import('../Tooltip/Tooltip') -> import('@astryxdesign/core/Tooltip')
 *
 * Most sibling dirs are barrels, so the top-dir collapse (`../utils/x` ->
 * `<pkg>/utils`) resolves. Two shapes must NOT be collapsed to the top dir:
 *   - Asset files (`.json`, `.css`): exported by full subpath (e.g.
 *     `./locales/*.json`, `./reset.css`), and collapsing a two-levels-up
 *     `../../locales/x.json` would emit the invalid `<pkg>/..`.
 *   - The theme StyleX token module (`../theme/tokens.stylex`): the StyleX
 *     compiler needs the real module, which core ships as the dedicated
 *     `./theme/tokens.stylex` export (the in-repo charts consumer imports it
 *     by that exact subpath). Other `.stylex` files (e.g. a component-local
 *     `../Layer/layerAnimations.stylex`) are NOT exported by subpath, so they
 *     keep the barrel collapse.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {number} [depth] Directory levels the file sits below the component
 *   root (0 for a top-level file like `Table/index.ts`, 2 for
 *   `Table/plugins/selection/index.ts`).
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, depth = 0) {
  /** @param {string} importPath */
  const mapTarget = importPath => {
    // Strip ALL leading `../` so a two-levels-up path never yields `<pkg>/..`.
    const rest = importPath.replace(/^(?:\.\.\/)+/, '');
    const parts = rest.split('/');
    const last = parts[parts.length - 1];
    // Asset files are resolved by exact export / wildcard, never a barrel.
    if (/\.(?:json|css)$/.test(last)) {
      return `${ownerPackage}/${rest}`;
    }
    // The theme token module is a dedicated deep StyleX export.
    if (parts[0] === 'theme' && /\.stylex(?:\.[cm]?[jt]sx?)?$/.test(last)) {
      return `${ownerPackage}/${rest}`;
    }
    return `${ownerPackage}/${parts[0]}`;
  };
  /**
   * Rewrite only when the `../` chain climbs past the file's own depth below
   * the component root; shallower chains resolve inside the copied tree.
   * @param {string} _m
   * @param {string} prefix
   * @param {string} importPath
   * @param {string} suffix
   */
  const rewriteEscaping = (_m, prefix, importPath, suffix) => {
    const up = (importPath.match(/^(?:\.\.\/)+/)?.[0].length ?? 0) / '../'.length;
    if (up <= depth) return `${prefix}${importPath}${suffix}`;
    return `${prefix}${mapTarget(importPath)}${suffix}`;
  };
  return content
    .replace(/(from\s+['"])(\.\.\/[^'"]+)(['"])/g, rewriteEscaping)
    .replace(/(import\(\s*['"])(\.\.\/[^'"]+)(['"])/g, rewriteEscaping);
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
 * @returns {Promise<{loadedIntegrations: import('../../../foundation/integrations/integrations.mjs').LoadedIntegration[], issuesUrl: string|undefined, project: Project|null}>}
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
 * Recursively collect a component's copyable source files as POSIX-style paths
 * relative to `dir`, preserving nested directory structure (e.g. Table's
 * `plugins/selection/index.ts`). Only files are filtered
 * (isExcludedFromCopy, applied to the basename); directories are always
 * descended into. A directory whose files are all excluded (e.g. `__tests__/`,
 * `__snapshots__/` — every file matches `.test.`) contributes nothing, and the
 * copy loop creates directories on demand per file, so it never appears in the
 * output.
 * @param {string} dir Absolute directory to walk.
 * @param {string} [prefix] Relative path of `dir` below the component root.
 * @returns {string[]} Sorted relative file paths.
 */
function collectSourceFiles(dir, prefix = '') {
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path.join(dir, entry.name), rel));
    } else if (entry.isFile() && !isExcludedFromCopy(entry.name)) {
      files.push(rel);
    }
  }
  return files.sort();
}

/**
 * Copy one component's source into the consumer project for customization,
 * rewriting escaping relative imports to the owner package's subpaths.
 *
 * @param {string} component bare or XDS-prefixed component name
 * @param {{cwd?: string, output?: string, package?: string, overwrite?: boolean}} [options]
 * @returns {Promise<import('../swizzle.type.mjs').SwizzleCopyResponse>}
 */
export async function swizzleCopy(component, options = {}) {
  const {
    cwd = process.cwd(),
    output = './components/astryx',
    package: pkg,
    overwrite = false,
  } = options;

  const {coreDir, components} = resolveCore(cwd);

  const dirName = component.replace(/^XDS/, '');

  // The component name becomes a path segment in the output dir
  // (path.join(outputBase, dirName)), so a name containing `..` or a separator
  // would escape the assertWithin(output) guard. Reject it up front — a real
  // component name is a bare identifier.
  try {
    sanitizeName(dirName, {label: 'component name'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }

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

  // Pre-flight overwrite check before any mkdir/writeFile. The same recursive
  // file set drives this check, the copy loop, and the reported files, so
  // nested source (e.g. Table/plugins/*) is visible to all three.
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

  let usesStyleX = false;
  for (const file of sourceFiles) {
    const srcPath = path.join(componentDir, file);
    let content = fs.readFileSync(srcPath, 'utf-8');
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // The file's depth below the component root decides which `../` chains
      // escape the copied tree and need rewriting to the owner package.
      content = rewriteImports(
        content,
        owner.ownerPackage,
        file.split('/').length - 1,
      );
    }
    if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      content.includes('@stylexjs/stylex')
    ) {
      usesStyleX = true;
    }
    const destPath = path.join(outputDir, file);
    fs.mkdirSync(path.dirname(destPath), {recursive: true});
    fs.writeFileSync(destPath, content);
  }

  const relOutput = path.relative(cwd, outputDir);
  const feedback = buildFeedback(dirName, owner.issuesUrl);

  /** @type {import('../swizzle.type.mjs').SwizzleCopyResponse['data']} */
  const data = {
    component: dirName,
    package: owner.package,
    outputDir: relOutput,
    filesCopied: sourceFiles.length,
    files: sourceFiles,
    usesStyleX,
  };
  if (feedback) data.feedback = feedback;
  return {type: 'swizzle.copy', data};
}
